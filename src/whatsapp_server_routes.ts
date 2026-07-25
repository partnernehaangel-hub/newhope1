import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";

dotenv.config();

// Initialize Supabase Client for the server side
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export const whatsappRouter = Router();

// Connection status cache
let connectionState = {
  status: "Disconnected", // "Connecting" | "Waiting for QR" | "Connected" | "Disconnected"
  qrCode: "",
  phoneNumber: "",
  lastSync: new Date().toISOString(),
  mode: "Real",
  error: null as string | null
};

let sock: any = null;

// Helper to clear Baileys Auth Session Folder on Logout or Authentication Failure
function clearAuthFolder() {
  const authPath = path.join(process.cwd(), ".baileys_auth");
  if (fs.existsSync(authPath)) {
    try {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log("[Baileys] Auth state folder cleared successfully.");
    } catch (err: any) {
      console.error("[Baileys] Failed to clear auth folder:", err.message);
    }
  }
}

// Helper to make API calls to Meta WhatsApp Business API (Cloud API)
async function sendMetaWhatsAppMessage({
  phoneNumberId,
  accessToken,
  to,
  type,
  textBody,
  documentUrl,
  documentFilename,
  templateName,
  templateLang = "en_US",
  templateParams = []
}: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  type: "text" | "document" | "template";
  textBody?: string;
  documentUrl?: string;
  documentFilename?: string;
  templateName?: string;
  templateLang?: string;
  templateParams?: string[];
}) {
  const cleanTo = to.replace(/\D/g, "");
  
  const payload: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanTo
  };

  if (type === "text") {
    payload.type = "text";
    payload.text = { body: textBody || "" };
  } else if (type === "document") {
    payload.type = "document";
    payload.document = {
      link: documentUrl,
      filename: documentFilename || "document.pdf",
      caption: textBody || ""
    };
  } else if (type === "template") {
    payload.type = "template";
    payload.template = {
      name: templateName,
      language: { code: templateLang },
      components: []
    };
    if (templateParams.length > 0) {
      payload.template.components.push({
        type: "body",
        parameters: templateParams.map(param => ({
          type: "text",
          text: param
        }))
      });
    }
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const responseData: any = await response.json();
  if (!response.ok) {
    throw new Error(responseData?.error?.message || responseData?.error?.error_data?.details || "Failed to send Meta WhatsApp message");
  }

  return responseData;
}

// Database initialization to create or alter required tables
async function initDatabase() {
  if (!supabase) return;
  try {
    const migrationsSql = `
      -- Enable uuid-ossp extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS whatsapp_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT,
        session_name TEXT UNIQUE DEFAULT 'default',
        phone_number TEXT,
        connection_status TEXT DEFAULT 'Disconnected',
        status TEXT DEFAULT 'Disconnected',
        last_connected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS whatsapp_message_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        recipient_name TEXT DEFAULT '',
        recipient_number TEXT NOT NULL,
        recipient_type TEXT DEFAULT 'student',
        message_content TEXT,
        message_type TEXT DEFAULT 'text',
        attachment_url TEXT,
        status TEXT DEFAULT 'sent',
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        template_id UUID,
        target_audience TEXT DEFAULT 'all',
        status TEXT DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS whatsapp_incoming (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sender_number TEXT NOT NULL,
        sender_name TEXT,
        message_content TEXT,
        received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS message_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone TEXT,
        message TEXT,
        attachment TEXT,
        status TEXT DEFAULT 'sent',
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE whatsapp_sessions ADD COLUMN IF NOT EXISTS user_id TEXT;
      ALTER TABLE whatsapp_sessions ADD COLUMN IF NOT EXISTS connection_status TEXT;
      ALTER TABLE whatsapp_sessions ADD COLUMN IF NOT EXISTS last_connected TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      ALTER TABLE whatsapp_sessions ADD COLUMN IF NOT EXISTS meta_access_token TEXT;
      ALTER TABLE whatsapp_sessions ADD COLUMN IF NOT EXISTS meta_phone_number_id TEXT;
      ALTER TABLE whatsapp_sessions ADD COLUMN IF NOT EXISTS meta_business_account_id TEXT;
      ALTER TABLE whatsapp_sessions ADD COLUMN IF NOT EXISTS meta_template_name TEXT DEFAULT '';
      ALTER TABLE whatsapp_sessions ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'Sandbox';
      
      ALTER TABLE whatsapp_message_logs ADD COLUMN IF NOT EXISTS phone TEXT;
      ALTER TABLE whatsapp_message_logs ADD COLUMN IF NOT EXISTS message TEXT;
      ALTER TABLE whatsapp_message_logs ADD COLUMN IF NOT EXISTS attachment TEXT;
      ALTER TABLE whatsapp_message_logs ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `;
    const { error } = await supabase.rpc('exec_sql', { sql_query: migrationsSql });
    if (error) {
      console.warn("[WhatsApp DB Init] exec_sql failed, database structure assumed valid:", error.message);
    } else {
      console.log("[WhatsApp DB Init] Database migrations/alterations completed successfully.");
    }
    // Always trigger a reload of PostgREST schema cache to make sure the tables are accessible immediately
    try {
      await supabase.rpc('exec_sql', { sql_query: "NOTIFY pgrst, 'reload schema';" });
    } catch (e: any) {
      console.warn("[WhatsApp DB Init] Failed to notify schema reload:", e.message);
    }
  } catch (err: any) {
    console.error("[WhatsApp DB Init] Database initialization failed:", err.message);
  }
}

// Update status in the database with auto-retry on schema cache mismatch
async function updateDBSessionStatus(status: string, phone: string, qr: string, retryCount = 2): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("whatsapp_sessions")
      .upsert({
        session_name: "default",
        status: status,
        connection_status: status,
        phone_number: phone,
        last_sync: new Date().toISOString(),
        last_connected: new Date().toISOString()
      }, { onConflict: "session_name" });
    
    if (error) {
      console.error("[WhatsApp DB] Error updating session status:", error.message);
      if (retryCount > 0 && (error.message.includes("schema cache") || error.message.includes("Could not find the table"))) {
        console.log("[WhatsApp DB] Schema cache issue detected. Attempting to reload PostgREST schema cache and retry...");
        try {
          await supabase.rpc('exec_sql', { sql_query: "NOTIFY pgrst, 'reload schema';" });
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s for the cache to update
        } catch (reloadErr: any) {
          console.error("[WhatsApp DB] Failed to run reload notify:", reloadErr.message);
        }
        return updateDBSessionStatus(status, phone, qr, retryCount - 1);
      }
    }
  } catch (err: any) {
    console.error("[WhatsApp DB] Exception updating session status:", err.message);
  }
}

// Log message to database
async function logMessageToDB(
  recipientName: string, 
  num: string, 
  type: string, 
  content: string, 
  msgType: string, 
  status: string, 
  error?: string,
  attachmentUrl?: string
) {
  if (!supabase) return;
  try {
    await Promise.allSettled([
      supabase.from("whatsapp_message_logs").insert([{
        recipient_name: recipientName,
        recipient_number: num,
        recipient_type: type,
        message_content: content,
        message_type: msgType,
        status: status,
        error_message: error || null,
        attachment_url: attachmentUrl || null
      }]),
      supabase.from("message_logs").insert([{
        phone: num,
        message: content,
        attachment: attachmentUrl || null,
        status: status,
        sent_at: new Date().toISOString()
      }])
    ]);
  } catch (err: any) {
    console.error("[WhatsApp DB] Exception writing message log:", err.message);
  }
}

// Initialize Baileys Client
async function initBaileys() {
  try {
    console.log("[Baileys] Initializing WhatsApp Socket connection...");
    connectionState.status = "Connecting";
    connectionState.error = null;
    
    const authPath = path.join(process.cwd(), ".baileys_auth");
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    console.log(`[Baileys] Using WhatsApp Web version v${version.join('.')}, isLatest: ${isLatest}`);
    
    sock = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: state,
      logger: pino({ level: "silent" }),
      browser: ["School ERP", "Chrome", "1.0.0"]
    });
    
    sock.ev.on("creds.update", saveCreds);
    
    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log("[Baileys] Emitted new authentic QR Code:", qr);
        connectionState.status = "Waiting for QR";
        connectionState.qrCode = qr;
        connectionState.error = null;
        await updateDBSessionStatus("Waiting for QR", "", qr);
      }
      
      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const loggedOut = statusCode === DisconnectReason.loggedOut;
        console.log(`[Baileys] Connection closed. StatusCode: ${statusCode}, LoggedOut: ${loggedOut}`);
        
        connectionState.qrCode = "";
        
        if (loggedOut) {
          console.warn("[Baileys] Session logged out by user or server. Wiping auth folder...");
          clearAuthFolder();
          connectionState.status = "Disconnected";
          connectionState.phoneNumber = "";
          await updateDBSessionStatus("Disconnected", "", "");
        } else {
          console.log("[Baileys] Reconnecting automatically using saved session keys...");
          connectionState.status = "Connecting";
          setTimeout(initBaileys, 3000);
        }
      } else if (connection === "connecting") {
        connectionState.status = "Connecting";
      } else if (connection === "open") {
        const userJid = sock.user.id;
        const cleanPhone = userJid.split(":")[0].split("@")[0];
        console.log(`[Baileys] ✅ WhatsApp Connected! Number: +${cleanPhone}`);
        
        connectionState.status = "Connected";
        connectionState.phoneNumber = "+" + cleanPhone;
        connectionState.qrCode = "";
        connectionState.lastSync = new Date().toISOString();
        connectionState.error = null;
        
        await updateDBSessionStatus("Connected", "+" + cleanPhone, "");
      }
    });
  } catch (err: any) {
    console.error("[Baileys] Socket initialization failed:", err.message);
    connectionState.status = "Disconnected";
    connectionState.error = err.message;
  }
}

// Automatically launch on server startup to handle session restoration
setTimeout(async () => {
  await initDatabase();
  const authPath = path.join(process.cwd(), ".baileys_auth");
  if (fs.existsSync(authPath) && fs.readdirSync(authPath).length > 0) {
    console.log("[Baileys] Saved authentication keys detected. Starting automatic session restore...");
    initBaileys().catch(e => console.error("[Baileys] Auto restore failed:", e));
  } else {
    console.log("[Baileys] No saved session credentials found. Standing by for connection request.");
  }
}, 1500);

// --- REST APIs requested by the user ---

// GET /whatsapp/meta-config -> Retrieve Meta WhatsApp Business API settings
whatsappRouter.get("/meta-config", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "Database not connected" });
  }
  try {
    const { data, error } = await supabase
      .from("whatsapp_sessions")
      .select("meta_access_token, meta_phone_number_id, meta_business_account_id, meta_template_name")
      .eq("session_name", "default")
      .maybeSingle();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data || {
      meta_access_token: "",
      meta_phone_number_id: "",
      meta_business_account_id: "",
      meta_template_name: ""
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /whatsapp/meta-config -> Save Meta WhatsApp Business API settings
whatsappRouter.post("/meta-config", async (req, res) => {
  const { meta_access_token, meta_phone_number_id, meta_business_account_id, meta_template_name } = req.body;
  if (!supabase) {
    return res.status(500).json({ error: "Database not connected" });
  }
  try {
    const { error } = await supabase
      .from("whatsapp_sessions")
      .upsert({
        session_name: "default",
        meta_access_token,
        meta_phone_number_id,
        meta_business_account_id,
        meta_template_name,
        ...(connectionState.mode === "Meta" ? {
          status: meta_access_token && meta_phone_number_id ? "Connected" : "Disconnected",
          connection_status: meta_access_token && meta_phone_number_id ? "Connected" : "Disconnected"
        } : {})
      }, { onConflict: "session_name" });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (connectionState.mode === "Meta") {
      connectionState.status = meta_access_token && meta_phone_number_id ? "Connected" : "Disconnected";
      connectionState.phoneNumber = "Meta Cloud API";
    }

    return res.json({ success: true, message: "Meta API credentials saved successfully!" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /whatsapp/qr -> Returns ONLY the actual QR generated by WhatsApp
whatsappRouter.get("/qr", (req, res) => {
  if (connectionState.status === "Connected") {
    return res.json({ qr: "", message: "WhatsApp is already paired." });
  }
  res.json({ qr: connectionState.qrCode || "" });
});

// GET /whatsapp/status -> Returns Connected, Disconnected, Connecting, Waiting for QR
whatsappRouter.get("/status", async (req, res) => {
  if (supabase) {
    try {
      const { data } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("session_name", "default")
        .maybeSingle();
      if (data) {
        connectionState.mode = data.mode || connectionState.mode;
        if (connectionState.mode === "Meta") {
          if (data.meta_access_token && data.meta_phone_number_id) {
            connectionState.status = "Connected";
            connectionState.phoneNumber = "Meta Cloud API";
          } else {
            connectionState.status = "Disconnected";
            connectionState.phoneNumber = "";
          }
        }
      }
    } catch (e) {}
  }

  if (req.query.format === "text") {
    return res.send(connectionState.status);
  }
  res.json({
    status: connectionState.status,
    qrCode: connectionState.qrCode,
    phoneNumber: connectionState.phoneNumber,
    lastSync: connectionState.lastSync,
    error: connectionState.error,
    mode: connectionState.mode
  });
});

// POST /whatsapp/send-message -> Body: { phone, message }
whatsappRouter.post("/send-message", async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: "phone and message parameters are required." });
  }

  const cleanNum = phone.replace(/\D/g, "");
  const targetId = `${cleanNum}@s.whatsapp.net`;

  if (connectionState.status !== "Connected") {
    return res.status(400).json({ error: "WhatsApp is not connected." });
  }

  if (connectionState.mode === "Sandbox") {
    await logMessageToDB("Direct Message", cleanNum, "other", message, "text", "delivered");
    return res.json({ success: true, message: "Simulated message sent successfully (Sandbox Mode)!" });
  }

  if (connectionState.mode === "Meta") {
    if (!supabase) {
      return res.status(500).json({ error: "Database connection missing" });
    }
    try {
      const { data } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("session_name", "default")
        .maybeSingle();
      if (!data || !data.meta_access_token || !data.meta_phone_number_id) {
        return res.status(400).json({ error: "Meta WhatsApp API is not configured." });
      }
      
      await sendMetaWhatsAppMessage({
        phoneNumberId: data.meta_phone_number_id,
        accessToken: data.meta_access_token,
        to: cleanNum,
        type: "text",
        textBody: message
      });

      await logMessageToDB("Direct Message", cleanNum, "other", message, "text", "delivered");
      return res.json({ success: true, message: "Message sent successfully via Meta Cloud API!" });
    } catch (err: any) {
      await logMessageToDB("Direct Message", cleanNum, "other", message, "text", "failed", err.message);
      return res.status(500).json({ error: `Meta Cloud API delivery failed: ${err.message}` });
    }
  }

  if (!sock) {
    return res.status(400).json({ error: "WhatsApp is not connected." });
  }

  try {
    await sock.sendMessage(targetId, { text: message });
    await logMessageToDB("Direct Message", cleanNum, "other", message, "text", "delivered");
    return res.json({ success: true, message: "Message sent successfully!" });
  } catch (err: any) {
    await logMessageToDB("Direct Message", cleanNum, "other", message, "text", "failed", err.message);
    return res.status(500).json({ error: `Message delivery failed: ${err.message}` });
  }
});

// POST /whatsapp/send-document -> Body: { phone, message, attachment }
whatsappRouter.post("/send-document", async (req, res) => {
  const { phone, message, attachment } = req.body;
  if (!phone || !attachment) {
    return res.status(400).json({ error: "phone and attachment parameters are required." });
  }

  const cleanNum = phone.replace(/\D/g, "");
  const targetId = `${cleanNum}@s.whatsapp.net`;

  if (connectionState.status !== "Connected") {
    return res.status(400).json({ error: "WhatsApp is not connected." });
  }

  if (connectionState.mode === "Sandbox") {
    await logMessageToDB("Direct Document", cleanNum, "other", message || "Document attachment", "document", "delivered", undefined, attachment);
    return res.json({ success: true, message: "Simulated document sent successfully (Sandbox Mode)!" });
  }

  if (connectionState.mode === "Meta") {
    if (!supabase) {
      return res.status(500).json({ error: "Database connection missing" });
    }
    try {
      const { data } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("session_name", "default")
        .maybeSingle();
      if (!data || !data.meta_access_token || !data.meta_phone_number_id) {
        return res.status(400).json({ error: "Meta WhatsApp API is not configured." });
      }

      await sendMetaWhatsAppMessage({
        phoneNumberId: data.meta_phone_number_id,
        accessToken: data.meta_access_token,
        to: cleanNum,
        type: "document",
        documentUrl: attachment,
        documentFilename: attachment.split("/").pop() || "document.pdf",
        textBody: message
      });

      await logMessageToDB("Direct Document", cleanNum, "other", message || "Document attachment", "document", "delivered", undefined, attachment);
      return res.json({ success: true, message: "Document sent successfully via Meta Cloud API!" });
    } catch (err: any) {
      await logMessageToDB("Direct Document", cleanNum, "other", message || "Document attachment", "document", "failed", err.message, attachment);
      return res.status(500).json({ error: `Meta Cloud API document delivery failed: ${err.message}` });
    }
  }

  if (!sock) {
    return res.status(400).json({ error: "WhatsApp is not connected." });
  }

  try {
    const isImage = attachment.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    if (isImage) {
      await sock.sendMessage(targetId, { 
        image: { url: attachment }, 
        caption: message || "" 
      });
    } else {
      await sock.sendMessage(targetId, { 
        document: { url: attachment }, 
        mimetype: "application/pdf",
        fileName: attachment.split("/").pop() || "document.pdf",
        caption: message || ""
      });
    }
    await logMessageToDB("Direct Document", cleanNum, "other", message || "Document attachment", "document", "delivered", undefined, attachment);
    return res.json({ success: true, message: "Document sent successfully!" });
  } catch (err: any) {
    await logMessageToDB("Direct Document", cleanNum, "other", message || "Document attachment", "document", "failed", err.message, attachment);
    return res.status(500).json({ error: `Document delivery failed: ${err.message}` });
  }
});

// POST /whatsapp/logout -> Disconnects WhatsApp, clears session, updates status to "Disconnected" in DB.
whatsappRouter.post("/logout", async (req, res) => {
  connectionState.status = "Disconnected";
  connectionState.phoneNumber = "";
  connectionState.qrCode = "";
  connectionState.error = null;

  if (sock) {
    try {
      await Promise.race([
        sock.logout().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 1000))
      ]);
    } catch (e: any) {
      console.warn("[Baileys] Socket logout exception (maybe already closed):", e?.message);
    }
    try {
      sock.end(undefined);
    } catch (err) {}
    sock = null;
  }

  clearAuthFolder();
  await updateDBSessionStatus("Disconnected", "", "");
  res.json({ success: true, message: "WhatsApp disconnected and logged out successfully.", state: connectionState });
});

// POST /whatsapp/reconnect -> Reinitializes or reconnects
whatsappRouter.post("/reconnect", async (req, res) => {
  if (connectionState.status === "Connected" && (sock || connectionState.mode === "Sandbox")) {
    return res.json({ success: true, message: "WhatsApp is already connected." });
  }
  
  if (connectionState.mode === "Sandbox") {
    connectionState.status = "Waiting for QR";
    connectionState.qrCode = "whatsapp_sandbox_mock_qr_token_" + Math.random().toString(36).substr(2, 9);
    connectionState.phoneNumber = "";
    connectionState.error = null;
    await updateDBSessionStatus("Waiting for QR", "", connectionState.qrCode);
    return res.json({ success: true, message: "WhatsApp Sandbox session reinitialized.", state: connectionState });
  }

  if (sock) {
    try { sock.end(undefined); } catch(e) {}
    sock = null;
  }
  
  initBaileys().catch(e => console.error("[Baileys] Manual reconnect init failed:", e));
  res.json({ success: true, message: "WhatsApp reconnection procedure initiated.", state: connectionState });
});

// --- BACKWARDS COMPATIBILITY ROUTINGS FOR EXISTING UI ---

whatsappRouter.post("/connect", async (req, res) => {
  if (connectionState.status === "Connected") {
    return res.json({ success: true, message: "WhatsApp is already connected." });
  }
  
  if (connectionState.mode === "Sandbox") {
    connectionState.status = "Waiting for QR";
    connectionState.qrCode = "whatsapp_sandbox_mock_qr_token_" + Math.random().toString(36).substr(2, 9);
    connectionState.phoneNumber = "";
    connectionState.error = null;
    await updateDBSessionStatus("Waiting for QR", "", connectionState.qrCode);
    return res.json({ success: true, message: "Initializing WhatsApp Sandbox Session...", state: connectionState });
  }

  if (sock) {
    try { sock.end(undefined); } catch(e) {}
    sock = null;
  }

  initBaileys().catch(e => console.error("[Baileys] Manual connect init failed:", e));
  return res.json({ success: true, message: "Initializing WhatsApp client session...", state: connectionState });
});

whatsappRouter.post("/disconnect", async (req, res) => {
  connectionState.status = "Disconnected";
  connectionState.phoneNumber = "";
  connectionState.qrCode = "";
  connectionState.error = null;

  if (sock) {
    try {
      await Promise.race([
        sock.logout().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 1000))
      ]);
    } catch (e: any) {
      console.warn("[Baileys] Socket disconnect exception:", e?.message);
    }
    try {
      sock.end(undefined);
    } catch (err) {}
    sock = null;
  }

  clearAuthFolder();
  await updateDBSessionStatus("Disconnected", "", "");
  res.json({ success: true, message: "Disconnected successfully.", state: connectionState });
});

whatsappRouter.post("/send", async (req, res) => {
  const { recipientNumber, messageContent, recipientName, recipientType, attachmentUrl } = req.body;
  if (!recipientNumber) {
    return res.status(400).json({ error: "Recipient phone number is required." });
  }

  const cleanNum = recipientNumber.replace(/\D/g, "");
  const targetId = `${cleanNum}@s.whatsapp.net`;

  if (connectionState.status !== "Connected") {
    return res.status(400).json({ error: "WhatsApp is not connected. Connect first from the dashboard." });
  }

  if (connectionState.mode === "Sandbox") {
    await logMessageToDB(recipientName || "Direct Contact", cleanNum, recipientType || "other", messageContent, attachmentUrl ? "document" : "text", "delivered", undefined, attachmentUrl);
    return res.json({ success: true, message: "Simulated message sent successfully (Sandbox Mode)!", provider: "Sandbox Simulator" });
  }

  if (connectionState.mode === "Meta") {
    if (!supabase) {
      return res.status(500).json({ error: "Database connection missing" });
    }
    try {
      const { data } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("session_name", "default")
        .maybeSingle();
      if (!data || !data.meta_access_token || !data.meta_phone_number_id) {
        return res.status(400).json({ error: "Meta WhatsApp API is not configured." });
      }

      if (attachmentUrl) {
        await sendMetaWhatsAppMessage({
          phoneNumberId: data.meta_phone_number_id,
          accessToken: data.meta_access_token,
          to: cleanNum,
          type: "document",
          documentUrl: attachmentUrl,
          documentFilename: attachmentUrl.split("/").pop() || "document.pdf",
          textBody: messageContent
        });
        await logMessageToDB(recipientName || "Direct Contact", cleanNum, recipientType || "other", messageContent, "document", "delivered", undefined, attachmentUrl);
      } else {
        await sendMetaWhatsAppMessage({
          phoneNumberId: data.meta_phone_number_id,
          accessToken: data.meta_access_token,
          to: cleanNum,
          type: "text",
          textBody: messageContent
        });
        await logMessageToDB(recipientName || "Direct Contact", cleanNum, recipientType || "other", messageContent, "text", "delivered");
      }
      return res.json({ success: true, message: "Message sent successfully!", provider: "Meta Cloud API" });
    } catch (err: any) {
      await logMessageToDB(recipientName || "Direct Contact", cleanNum, recipientType || "other", messageContent, "text", "failed", err.message, attachmentUrl);
      return res.status(500).json({ error: `Meta Cloud API delivery failed: ${err.message}` });
    }
  }

  if (!sock) {
    return res.status(400).json({ error: "WhatsApp is not connected. Connect first from the dashboard." });
  }

  try {
    if (attachmentUrl) {
      const isImage = attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i);
      if (isImage) {
        await sock.sendMessage(targetId, { 
          image: { url: attachmentUrl }, 
          caption: messageContent || "" 
        });
      } else {
        await sock.sendMessage(targetId, { 
          document: { url: attachmentUrl }, 
          mimetype: "application/pdf",
          fileName: attachmentUrl.split("/").pop() || "document.pdf",
          caption: messageContent || ""
        });
      }
      await logMessageToDB(recipientName || "Direct Contact", cleanNum, recipientType || "other", messageContent, "document", "delivered", undefined, attachmentUrl);
    } else {
      await sock.sendMessage(targetId, { text: messageContent });
      await logMessageToDB(recipientName || "Direct Contact", cleanNum, recipientType || "other", messageContent, "text", "delivered");
    }
    return res.json({ success: true, message: "Message sent successfully!", provider: "Baileys API Gateway" });
  } catch (err: any) {
    await logMessageToDB(recipientName || "Direct Contact", cleanNum, recipientType || "other", messageContent, "text", "failed", err.message, attachmentUrl);
    res.status(500).json({ error: `Message delivery failed: ${err.message}` });
  }
});

whatsappRouter.post("/bulk", async (req, res) => {
  const { recipients, templateBody, campaignName, messageType, attachmentUrl } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "Recipients array is required." });
  }

  if (connectionState.status !== "Connected") {
    return res.status(400).json({ error: "WhatsApp is not connected." });
  }

  let successCount = 0;
  let failCount = 0;

  let campaignId = "";
  if (supabase) {
    try {
      const { data: campaign } = await supabase.from("whatsapp_campaigns").insert({
        name: campaignName || "Quick Campaign",
        status: "running"
      }).select().single();
      campaignId = campaign?.id || "";
    } catch (e) {}
  }

  if (connectionState.mode === "Sandbox") {
    for (const item of recipients) {
      const cleanNum = item.phone.replace(/\D/g, "");
      if (!cleanNum) {
        failCount++;
        continue;
      }

      let customMessage = templateBody
        .replace(/{name}/gi, item.name || "Recipient")
        .replace(/{class}/gi, item.className || "N/A")
        .replace(/{due}/gi, item.dueAmount || "0")
        .replace(/{date}/gi, new Date().toLocaleDateString())
        .replace(/{roll}/gi, item.rollNo || "N/A");

      await logMessageToDB(item.name, cleanNum, item.role || "student", customMessage, attachmentUrl ? "document" : "text", "delivered", undefined, attachmentUrl);
      successCount++;
    }

    if (supabase && campaignId) {
      await supabase.from("whatsapp_campaigns").update({ status: "sent" }).eq("id", campaignId);
    }

    return res.json({
      success: true,
      message: `Simulated bulk complete (Sandbox Mode). Sent: ${successCount}, Failed: ${failCount}`,
      successCount,
      failCount
    });
  }

  if (connectionState.mode === "Meta") {
    if (!supabase) {
      return res.status(500).json({ error: "Database connection missing" });
    }
    try {
      const { data } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("session_name", "default")
        .maybeSingle();
      if (!data || !data.meta_access_token || !data.meta_phone_number_id) {
        return res.status(400).json({ error: "Meta WhatsApp API is not configured." });
      }

      for (const item of recipients) {
        const cleanNum = item.phone.replace(/\D/g, "");
        if (!cleanNum) {
          failCount++;
          continue;
        }

        try {
          let customMessage = templateBody
            .replace(/{name}/gi, item.name || "Recipient")
            .replace(/{class}/gi, item.className || "N/A")
            .replace(/{due}/gi, item.dueAmount || "0")
            .replace(/{date}/gi, new Date().toLocaleDateString())
            .replace(/{roll}/gi, item.rollNo || "N/A");

          const fileUrl = attachmentUrl || item.pdfUrl || item.attachmentUrl;
          if (fileUrl) {
            await sendMetaWhatsAppMessage({
              phoneNumberId: data.meta_phone_number_id,
              accessToken: data.meta_access_token,
              to: cleanNum,
              type: "document",
              documentUrl: fileUrl,
              documentFilename: fileUrl.split("/").pop() || "document.pdf",
              textBody: customMessage
            });
            await logMessageToDB(item.name, cleanNum, item.role || "student", customMessage, "document", "delivered", undefined, fileUrl);
          } else {
            await sendMetaWhatsAppMessage({
              phoneNumberId: data.meta_phone_number_id,
              accessToken: data.meta_access_token,
              to: cleanNum,
              type: "text",
              textBody: customMessage
            });
            await logMessageToDB(item.name, cleanNum, item.role || "student", customMessage, "text", "delivered");
          }
          successCount++;
        } catch (e) {
          failCount++;
        }
      }

      if (supabase && campaignId) {
        await supabase.from("whatsapp_campaigns").update({ status: "sent" }).eq("id", campaignId);
      }

      return res.json({
        success: true,
        message: `Meta Cloud bulk messaging complete. Sent: ${successCount}, Failed: ${failCount}`,
        successCount,
        failCount
      });
    } catch (err: any) {
      return res.status(500).json({ error: `Meta Cloud Bulk failed: ${err.message}` });
    }
  }

  if (!sock) {
    return res.status(400).json({ error: "WhatsApp is not connected." });
  }

  for (const item of recipients) {
    const cleanNum = item.phone.replace(/\D/g, "");
    if (!cleanNum) {
      failCount++;
      continue;
    }

    try {
      let customMessage = templateBody
        .replace(/{name}/gi, item.name || "Recipient")
        .replace(/{class}/gi, item.className || "N/A")
        .replace(/{due}/gi, item.dueAmount || "0")
        .replace(/{date}/gi, new Date().toLocaleDateString())
        .replace(/{roll}/gi, item.rollNo || "N/A");

      const targetId = `${cleanNum}@s.whatsapp.net`;
      await sock.sendMessage(targetId, { text: customMessage });
      await logMessageToDB(item.name, cleanNum, item.role || "student", customMessage, messageType || "text", "delivered");
      successCount++;
    } catch (e) {
      failCount++;
    }
  }

  if (supabase && campaignId) {
    await supabase.from("whatsapp_campaigns").update({ status: "sent" }).eq("id", campaignId);
  }

  res.json({
    success: true,
    message: `Bulk messaging complete. Sent: ${successCount}, Failed: ${failCount}`,
    successCount,
    failCount
  });
});

whatsappRouter.post("/incoming-reply", async (req, res) => {
  const { senderNumber, senderName, messageContent } = req.body;
  if (!senderNumber || !messageContent) {
    return res.status(400).json({ error: "senderNumber and messageContent required." });
  }

  const cleanNum = senderNumber.replace(/\D/g, "");

  if (supabase) {
    try {
      await supabase.from("whatsapp_incoming").insert({
        sender_number: cleanNum,
        sender_name: senderName || "Parent Contact",
        message_content: messageContent
      });

      if (messageContent.toLowerCase().includes("fee")) {
        const autoReply = `Hello ${senderName || "there"}, our automated support logs show a fee dues inquiry. To get live ledgers, tap the dashboard or reply with "1" to get the standard bank payment details. Thank you!`;
        const targetId = `${cleanNum}@s.whatsapp.net`;
        if (connectionState.mode === "Sandbox" && connectionState.status === "Connected") {
          await logMessageToDB("AutoResponder Reply", cleanNum, "parent", autoReply, "text", "delivered");
        } else if (sock && connectionState.status === "Connected") {
          await sock.sendMessage(targetId, { text: autoReply });
          await logMessageToDB("AutoResponder Reply", cleanNum, "parent", autoReply, "text", "delivered");
        }
      }
    } catch (e) {}
  }

  res.json({ success: true, message: "Simulated response recorded successfully." });
});

// POST /whatsapp/mode -> Body: { mode: "Real" | "Sandbox" | "Meta" }
whatsappRouter.post("/mode", async (req, res) => {
  const { mode } = req.body;
  if (mode !== "Real" && mode !== "Sandbox" && mode !== "Meta") {
    return res.status(400).json({ error: "Invalid mode. Must be 'Real', 'Sandbox', or 'Meta'." });
  }

  // Close existing Baileys connection if open
  if (sock) {
    try { sock.end(undefined); } catch (e) {}
    sock = null;
  }
  clearAuthFolder();

  connectionState.mode = mode;
  connectionState.qrCode = "";
  connectionState.error = null;

  if (mode === "Meta") {
    let hasCreds = false;
    if (supabase) {
      try {
        const { data } = await supabase
          .from("whatsapp_sessions")
          .select("*")
          .eq("session_name", "default")
          .maybeSingle();
        if (data && data.meta_access_token && data.meta_phone_number_id) {
          hasCreds = true;
        }
      } catch (e) {}
    }
    connectionState.status = hasCreds ? "Connected" : "Disconnected";
    connectionState.phoneNumber = "Meta Cloud API";
  } else {
    connectionState.status = "Disconnected";
    connectionState.phoneNumber = "";
  }

  if (supabase) {
    await supabase.from("whatsapp_sessions").upsert({
      session_name: "default",
      mode: mode,
      status: connectionState.status,
      connection_status: connectionState.status,
      phone_number: connectionState.phoneNumber
    }, { onConflict: "session_name" });
  }

  res.json({ success: true, message: `WhatsApp mode switched to ${mode}.`, state: connectionState });
});

// POST /whatsapp/simulate-scan -> Simulates scanning QR code in Sandbox mode
whatsappRouter.post("/simulate-scan", async (req, res) => {
  if (connectionState.mode !== "Sandbox") {
    return res.status(400).json({ error: "Simulate scan is only available in Sandbox mode." });
  }

  connectionState.status = "Connected";
  connectionState.phoneNumber = "+1 (555) 019-2834";
  connectionState.qrCode = "";
  connectionState.lastSync = new Date().toISOString();
  connectionState.error = null;

  await updateDBSessionStatus("Connected", "+1 (555) 019-2834", "");

  res.json({ success: true, message: "Simulated QR Scan complete. WhatsApp status connected.", state: connectionState });
});
