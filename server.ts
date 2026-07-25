import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { google } from "googleapis";
import { whatsappRouter } from "./src/whatsapp_server_routes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Google OAuth configuration
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`
  );

  app.use(express.json());

  // WhatsApp Integration APIs
  app.use("/api/whatsapp", whatsappRouter);
  app.use("/whatsapp", whatsappRouter);

  // Clear client errors log on server startup
  try {
    fs.writeFileSync(path.join(process.cwd(), "client_errors.log"), "=== Client Error Log Started ===\n");
  } catch (e) {
    console.error("Failed to initialize client_errors.log:", e);
  }

  // Secure Image CORS Proxy Endpoint
  app.post("/api/log-error", (req, res) => {
    console.error("\x1b[41m\x1b[37m[CLIENT RUNTIME ERROR]\x1b[0m", JSON.stringify(req.body, null, 2));
    try {
      fs.appendFileSync(
        path.join(process.cwd(), "client_errors.log"),
        JSON.stringify(req.body, null, 2) + "\n-------------------\n"
      );
    } catch (e) {
      console.error("Failed to append to client_errors.log:", e);
    }
    res.sendStatus(200);
  });

  app.get("/api/proxy-image", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      res.status(400).send('URL parameter is required');
      return;
    }

    try {
      const decodedUrl = decodeURIComponent(url);
      
      // Use an AbortController for a fast 10-second request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(decodedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: status ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Cache the response publicly for 1 day to maximize fast loading of student photos
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(buffer);
    } catch (error: any) {
      console.error('CORS image proxy failure:', error);
      res.status(500).send('Failed to proxy image: ' + error.message);
    }
  });

  // API routes
  app.get("/api/auth/google/url", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
      prompt: 'consent'
    });
    res.json({ url });
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    try {
      // In a real app, we would exchange the code for tokens
      // const { tokens } = await oauth2Client.getToken(code as string);
      // oauth2Client.setCredentials(tokens);
      
      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('OAuth error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicitly serve index.html in development to prevent blank pages or routing issues
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
