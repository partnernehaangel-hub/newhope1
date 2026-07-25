import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import QRCodeLib from 'qrcode';

// --- Types ---
export interface SchoolProfile {
  name?: string;
  address?: string;
  contact?: string;
  logo?: string;
  principalSignature?: string;
  currentSession?: string;
}

export interface StudentOrStaff {
  id?: string;
  studentId?: string;
  staffId?: string;
  name?: string;
  surname?: string;
  dob?: string;
  birthDate?: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  residentialAddress?: string;
  fatherMobile?: string;
  mobile?: string;
  phone?: string;
  contactNumber?: string;
  class?: string;
  section?: string;
  rollNumber?: string;
  rollNo?: string;
  designation?: string;
  bloodGroup?: string;
  photo?: string;
}

// --- Helper Utilities ---

const getProxyImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/') || url.startsWith(window.location.origin)) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

/**
 * Loads any image URL (remote, local, proxy, or base64 data URL) and draws it
 * onto an HTML Canvas, converting it to a clean PNG base64 string.
 */
export const loadImageAsPngDataUrl = (url: string | null | undefined): Promise<string> => {
  return new Promise((resolve) => {
    if (!url) return resolve('');
    if (url.startsWith('data:image/png;base64,')) {
      return resolve(url);
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const naturalW = img.naturalWidth || img.width || 300;
        const naturalH = img.naturalHeight || img.height || 300;
        // High density scaling (at least 600px dimension) for ultra-sharp print outputs
        const targetDim = Math.max(600, Math.max(naturalW, naturalH) * 2);
        const scale = targetDim / Math.max(naturalW, naturalH);
        canvas.width = Math.round(naturalW * scale);
        canvas.height = Math.round(naturalH * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png', 1.0));
        } else {
          resolve('');
        }
      } catch (err) {
        console.error('Failed to draw image to canvas:', err);
        resolve('');
      }
    };
    img.onerror = () => {
      console.warn('Failed to load image for PDF embedding:', url);
      resolve('');
    };

    // Use proxy for external images
    const proxiedUrl = getProxyImageUrl(url);
    img.src = proxiedUrl;
  });
};

/**
 * Converts a PNG or JPEG data URL to a Uint8Array byte buffer.
 */
const dataUrlToUint8Array = (dataUrl: string): Uint8Array => {
  const parts = dataUrl.split(',');
  const base64 = parts[1] || parts[0];
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Safely embeds a PNG base64 string into a pdf-lib document.
 */
const embedPngSafe = async (pdfDoc: PDFDocument, base64Url: string) => {
  if (!base64Url || !base64Url.startsWith('data:image/png')) return null;
  try {
    const bytes = dataUrlToUint8Array(base64Url);
    return await pdfDoc.embedPng(bytes);
  } catch (err) {
    console.error('Error embedding PNG in pdf-lib:', err);
    return null;
  }
};

/**
 * Draws text with automatic word wrap if it exceeds maximum width.
 * Returns the final Y position after the last drawn line.
 */
const drawWrappedText = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  font: PDFFont,
  color: any,
  lineHeight: number = 6.5
): number => {
  if (!text || typeof text !== 'string') return y;
  const words = text.split(/\s+/);
  let currentLine = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      page.drawText(currentLine, { x, y: currentY, size: fontSize, font, color });
      currentLine = words[i];
      currentY -= lineHeight;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    page.drawText(currentLine, { x, y: currentY, size: fontSize, font, color });
  }
  return currentY;
};

/**
 * Draws text fitted within maxWidth by dynamically scaling font size down if necessary.
 */
const drawTextFitWidth = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  initialFontSize: number,
  font: PDFFont,
  color: any,
  minFontSize: number = 3.5
) => {
  if (!text || typeof text !== 'string') return;
  let fontSize = initialFontSize;
  let textWidth = font.widthOfTextAtSize(text, fontSize);
  while (textWidth > maxWidth && fontSize > minFontSize) {
    fontSize -= 0.2;
    textWidth = font.widthOfTextAtSize(text, fontSize);
  }
  page.drawText(text, { x, y, size: fontSize, font, color });
};

// --- PDF Generation Implementation ---

/**
 * Generates a vector PDF for a single or multiple ID Cards.
 * Standard CR80 Size is 85.60 mm x 53.98 mm.
 * 1 mm = 72 / 25.4 = 2.834645 points.
 * Width = 242.6 points, Height = 153.0 points.
 */
export const drawIDCardToPDF = async (
  pdfDoc: PDFDocument,
  person: StudentOrStaff,
  type: 'student' | 'teacher' | 'hostel',
  orientation: 'portrait' | 'landscape',
  schoolProfile: SchoolProfile,
  cachedAssets: {
    logoPng?: any;
    sigPng?: any;
    helvetica?: PDFFont;
    helveticaBold?: PDFFont;
  }
) => {
  const isLandscape = orientation === 'landscape';
  const pageW = isLandscape ? 242.6 : 153.0;
  const pageH = isLandscape ? 153.0 : 242.6;

  // Add card page
  const page = pdfDoc.addPage([pageW, pageH]);

  // Embed Fonts if not provided
  const fontRegular = cachedAssets.helvetica || await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  const fontBold = cachedAssets.helveticaBold || await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);

  // Palette Definitions
  const primaryColor = rgb(0.0, 0.28, 0.67); // Corporate Royal Blue
  const secondaryColor = rgb(0.98, 0.75, 0.17); // Amber Gold
  const darkSlate = rgb(0.06, 0.09, 0.16); // Text dark / Label Background
  const lightBgColor = rgb(0.96, 0.97, 0.98); // Field Background
  const borderGreyColor = rgb(0.85, 0.88, 0.92); // Border Accent
  const whiteColor = rgb(1.0, 1.0, 1.0);
  const textGreyColor = rgb(0.38, 0.43, 0.50);
  const textDarkColor = rgb(0.10, 0.14, 0.20);

  // Set background to pure white
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageW,
    height: pageH,
    color: whiteColor,
  });

  // Calculate Header dimensions
  const headerHeight = isLandscape ? 45.0 : 70.0;
  const headerY = pageH - headerHeight;

  // Draw Header background
  page.drawRectangle({
    x: 0,
    y: headerY,
    width: pageW,
    height: headerHeight,
    color: primaryColor,
  });

  // Draw subtle top header border accent
  page.drawRectangle({
    x: 0,
    y: pageH - 2,
    width: pageW,
    height: 2,
    color: secondaryColor,
  });

  // Draw School Logo in Header
  const logoSize = isLandscape ? 18 : 20;
  const logoX = 6;
  const logoY = pageH - logoSize - 6;

  if (cachedAssets.logoPng) {
    page.drawImage(cachedAssets.logoPng, {
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
    });
  } else {
    page.drawRectangle({
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
      color: whiteColor,
      borderColor: borderGreyColor,
      borderWidth: 0.5,
    });
  }

  // Draw QR Code at Top Right of Header
  const idValue = `${window.location.origin}?id=${person.staffId || person.studentId || person.id || 'N/A'}`;
  let qrPngEmbedded = null;
  try {
    const qrDataUrl = await QRCodeLib.toDataURL(idValue, {
      margin: 1,
      width: 512,
      errorCorrectionLevel: 'H',
    });
    qrPngEmbedded = await embedPngSafe(pdfDoc, qrDataUrl);
  } catch (err) {
    console.error('Error generating QR code png:', err);
  }

  const qrSize = isLandscape ? 24 : 22;
  const qrX = pageW - qrSize - 6;
  const qrY = pageH - qrSize - 6;

  if (qrPngEmbedded) {
    page.drawImage(qrPngEmbedded, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });
    page.drawRectangle({
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
      borderColor: whiteColor,
      borderWidth: 0.5,
    });
  }

  // School Name, Address, and Contact Details in Header
  const schoolName = (schoolProfile.name || 'SUBRAI MISSION CONVENT SCHOOL').toUpperCase();
  const schoolAddress = (schoolProfile.address || '')
    .replace(/[\r\n]+/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
  const schoolContact = schoolProfile.contact || '';

  const textStartX = logoX + logoSize + 5;
  const maxHeaderWidth = qrX - textStartX - 5;

  // School Name
  const initialNameSize = isLandscape ? 8.5 : 8.0;
  drawTextFitWidth(
    page,
    schoolName,
    textStartX,
    pageH - 12,
    maxHeaderWidth,
    initialNameSize,
    fontBold,
    secondaryColor,
    4.5
  );

  // Address
  const addrFontSize = isLandscape ? 5.0 : 4.6;
  const addrLineHeight = addrFontSize + 1.2;
  const addrEndY = drawWrappedText(
    page,
    schoolAddress,
    textStartX,
    pageH - 19,
    maxHeaderWidth,
    addrFontSize,
    fontRegular,
    whiteColor,
    addrLineHeight
  );

  // Phone No (dynamically placed below address)
  if (schoolContact) {
    page.drawText(`PH: ${schoolContact}`, {
      x: textStartX,
      y: addrEndY - (addrFontSize + 1.5),
      size: isLandscape ? 4.5 : 4.2,
      font: fontBold,
      color: whiteColor,
    });
  }

  // Draw Label Pill: "STUDENT ID CARD" etc.
  const isTeacher = type === 'teacher';
  const labelText = type === 'hostel' 
    ? 'HOSTEL ID CARD' 
    : `${isTeacher ? 'STAFF' : 'STUDENT'} ID CARD`;
    
  const labelW = isLandscape ? 68 : 74;
  const labelH = isLandscape ? 9 : 10;
  const labelX = isLandscape ? 8 : (pageW - labelW) / 2;
  const labelY = headerY - (labelH / 2);

  // Pill background & border
  page.drawRectangle({
    x: labelX,
    y: labelY,
    width: labelW,
    height: labelH,
    color: darkSlate,
    borderColor: whiteColor,
    borderWidth: 0.8,
  });

  // Label text
  const labelTextWidth = fontBold.widthOfTextAtSize(labelText, 4.5);
  page.drawText(labelText, {
    x: labelX + (labelW - labelTextWidth) / 2,
    y: labelY + (labelH - 4.5) / 2 + 0.5,
    size: 4.5,
    font: fontBold,
    color: whiteColor,
  });

  // Draw Student/Staff Photo
  const photoW = 44;
  const photoH = isLandscape ? 50 : 52;
  const photoX = isLandscape ? 8 : 6;
  const photoY = isLandscape ? labelY - photoH - 4 : headerY - photoH - 10;

  // Photo border box
  page.drawRectangle({
    x: photoX,
    y: photoY,
    width: photoW,
    height: photoH,
    borderColor: borderGreyColor,
    borderWidth: 1.0,
    color: lightBgColor,
  });

  // Embed Photo Image if available
  if (person.photo) {
    const photoDataUrl = await loadImageAsPngDataUrl(person.photo);
    const photoPng = await embedPngSafe(pdfDoc, photoDataUrl);
    if (photoPng) {
      page.drawImage(photoPng, {
        x: photoX + 1,
        y: photoY + 1,
        width: photoW - 2,
        height: photoH - 2,
      });
    }
  } else {
    // Default user outline icons
    page.drawCircle({
      x: photoX + photoW / 2,
      y: photoY + photoH / 2 + 4,
      size: 8,
      borderColor: textGreyColor,
      borderWidth: 1,
    });
    page.drawCircle({
      x: photoX + photoW / 2,
      y: photoY + photoH / 2 - 16,
      size: 12,
      borderColor: textGreyColor,
      borderWidth: 1,
    });
  }

  // Draw Quick Identifiers (Blood Group, Class, Roll) under the Photo
  const bloodGroup = String(person.bloodGroup || 'N/A');
  
  if (!isLandscape) {
    // --- PORTRAIT LAYOUT ---
    
    // 1. Details Below Photo
    if (type !== 'hostel') {
      const fieldW = 44;
      const fieldH = 8.5;
      const label1 = isTeacher ? 'DESIGNATION' : 'CLASS / SECTION';
      const val1 = isTeacher ? String(person.designation || 'Teacher') : `${person.class || 'N/A'} - ${person.section || 'N/A'}`;
      
      const label2 = isTeacher ? 'STAFF ID' : 'ROLL NUMBER';
      const val2 = isTeacher ? String(person.staffId || person.id || 'N/A') : String(person.rollNumber !== undefined && person.rollNumber !== null ? person.rollNumber : (person.rollNo !== undefined && person.rollNo !== null ? person.rollNo : 'N/A'));

      // Box 1
      page.drawText(label1, { x: photoX, y: photoY - 6.5, size: 3.8, font: fontBold, color: textGreyColor });
      page.drawRectangle({ x: photoX, y: photoY - 16.0, width: fieldW, height: fieldH, color: lightBgColor, borderColor: borderGreyColor, borderWidth: 0.5 });
      drawTextFitWidth(page, val1, photoX + 2, photoY - 13.8, fieldW - 4, 4.8, fontBold, textDarkColor);

      // Box 2
      page.drawText(label2, { x: photoX, y: photoY - 22.5, size: 3.8, font: fontBold, color: textGreyColor });
      page.drawRectangle({ x: photoX, y: photoY - 32.0, width: fieldW, height: fieldH, color: lightBgColor, borderColor: borderGreyColor, borderWidth: 0.5 });
      drawTextFitWidth(page, val2, photoX + 2, photoY - 29.8, fieldW - 4, 4.8, fontBold, textDarkColor);

      // Blood Group indicator
      const bloodY = photoY - 42.0;
      page.drawCircle({ x: photoX + 8, y: bloodY + 2.5, size: 3.0, color: rgb(0.9, 0.15, 0.15) });
      page.drawText(`BG: ${bloodGroup}`, { x: photoX + 15, y: bloodY, size: 5.2, font: fontBold, color: textDarkColor });
    } else {
      // Hostel Card Quick Fields
      const fieldW = 44;
      const fieldH = 8.5;
      
      page.drawText('ROOM / BED', { x: photoX, y: photoY - 6.5, size: 3.8, font: fontBold, color: textGreyColor });
      page.drawRectangle({ x: photoX, y: photoY - 16.0, width: fieldW, height: fieldH, color: lightBgColor, borderColor: borderGreyColor, borderWidth: 0.5 });
      const roomVal = person.class ? `RM-${person.class}` : 'H-402';
      drawTextFitWidth(page, roomVal, photoX + 2, photoY - 13.8, fieldW - 4, 4.8, fontBold, rgb(0.1, 0.6, 0.3));

      // Blood Group
      const bloodY = photoY - 26.0;
      page.drawCircle({ x: photoX + 8, y: bloodY + 2.5, size: 3.0, color: rgb(0.9, 0.15, 0.15) });
      page.drawText(`BG: ${bloodGroup}`, { x: photoX + 15, y: bloodY, size: 5.2, font: fontBold, color: textDarkColor });
    }

    // 2. Right Side Details (Portrait)
    const rightX = 56;
    const rightW = pageW - rightX - 6;
    const fullName = `${person.name || ''} ${person.surname || ''}`.trim().toUpperCase();

    // Student Name
    drawTextFitWidth(page, fullName, rightX, headerY - 15, rightW, 8.0, fontBold, primaryColor, 5.0);

    // Accent Underline
    page.drawRectangle({
      x: rightX,
      y: headerY - 18,
      width: 16,
      height: 1.2,
      color: secondaryColor,
    });

    const rawDetails = isTeacher
      ? [
          { label: 'D.O.B', value: person.dob || person.birthDate || 'N/A' },
          { label: 'FATHER/SPOUSE', value: person.fatherName || 'N/A' },
          { label: 'CONTACT NO.', value: person.mobile || person.phone || 'N/A' },
          { label: 'ADDRESS', value: person.address || 'N/A' },
        ]
      : [
          { label: 'D.O.B', value: person.dob || person.birthDate || 'N/A' },
          { label: 'FATHER NAME', value: person.fatherName || 'N/A' },
          { label: 'MOTHER NAME', value: person.motherName || 'N/A' },
          { label: 'CONTACT NO.', value: person.fatherMobile || person.mobile || person.phone || person.contactNumber || 'N/A' },
          { label: 'ADDRESS', value: person.residentialAddress || person.address || 'N/A' },
        ];

    const details = rawDetails.map(item => ({
      label: item.label,
      value: String(item.value ?? 'N/A')
    }));

    let currentY = headerY - 26;

    details.forEach((item) => {
      // Draw Label
      page.drawText(item.label, {
        x: rightX,
        y: currentY,
        size: 3.8,
        font: fontBold,
        color: textGreyColor,
      });

      const isAddress = item.label === 'ADDRESS';

      if (isAddress) {
        const boxH = 20.0;
        const boxY = currentY - 23.5;

        // Container box
        page.drawRectangle({
          x: rightX,
          y: boxY,
          width: rightW,
          height: boxH,
          color: lightBgColor,
          borderColor: borderGreyColor,
          borderWidth: 0.5,
        });

        drawWrappedText(
          page,
          item.value.toUpperCase(),
          rightX + 3,
          currentY - 8.0,
          rightW - 6,
          4.8,
          fontRegular,
          textDarkColor,
          5.8
        );
        currentY -= (boxH + 8.0);
      } else {
        const boxH = 8.5;
        const boxY = currentY - 12.0;

        // Container box
        page.drawRectangle({
          x: rightX,
          y: boxY,
          width: rightW,
          height: boxH,
          color: lightBgColor,
          borderColor: borderGreyColor,
          borderWidth: 0.5,
        });

        drawTextFitWidth(
          page,
          item.value.toUpperCase(),
          rightX + 3,
          currentY - 9.8,
          rightW - 6,
          4.8,
          fontBold,
          textDarkColor,
          3.8
        );
        currentY -= 17.5;
      }
    });

  } else {
    // --- LANDSCAPE LAYOUT ---

    // 1. Bottom Left Details (under Photo)
    if (type !== 'hostel') {
      const label1 = isTeacher ? 'DESIGNATION' : 'CLASS';
      const val1 = isTeacher ? String(person.designation || 'Teacher') : String(person.class || 'N/A');
      const label2 = isTeacher ? 'STAFF ID' : 'ROLL';
      const val2 = isTeacher ? String(person.staffId || person.id || 'N/A') : String(person.rollNumber !== undefined && person.rollNumber !== null ? person.rollNumber : (person.rollNo !== undefined && person.rollNo !== null ? person.rollNo : 'N/A'));

      const subW = 21;
      const subH = 8.0;

      // Box 1
      page.drawText(label1, { x: photoX, y: photoY - 5.5, size: 3.5, font: fontBold, color: textGreyColor });
      page.drawRectangle({ x: photoX, y: photoY - 14.5, width: subW, height: subH, color: lightBgColor, borderColor: borderGreyColor, borderWidth: 0.5 });
      drawTextFitWidth(page, val1, photoX + 1, photoY - 12.5, subW - 2, 4.5, fontBold, textDarkColor);

      // Box 2
      page.drawText(label2, { x: photoX + 23, y: photoY - 5.5, size: 3.5, font: fontBold, color: textGreyColor });
      page.drawRectangle({ x: photoX + 23, y: photoY - 14.5, width: subW, height: subH, color: lightBgColor, borderColor: borderGreyColor, borderWidth: 0.5 });
      drawTextFitWidth(page, val2, photoX + 24, photoY - 12.5, subW - 2, 4.5, fontBold, textDarkColor);

      // Blood group
      const bloodY = photoY - 21.5;
      page.drawCircle({ x: photoX + 8, y: bloodY + 2.0, size: 3.0, color: rgb(0.9, 0.15, 0.15) });
      page.drawText(`BG: ${bloodGroup}`, { x: photoX + 15, y: bloodY, size: 5.2, font: fontBold, color: textDarkColor });
    } else {
      // Hostel Card Bed info
      const subW = 44;
      const subH = 8.0;
      page.drawText('ROOM / BED', { x: photoX, y: photoY - 5.5, size: 3.5, font: fontBold, color: textGreyColor });
      page.drawRectangle({ x: photoX, y: photoY - 14.5, width: subW, height: subH, color: lightBgColor, borderColor: borderGreyColor, borderWidth: 0.5 });
      const roomVal = person.class ? `RM-${person.class}` : 'H-402';
      drawTextFitWidth(page, roomVal, photoX + 2, photoY - 12.5, subW - 4, 4.5, fontBold, rgb(0.1, 0.6, 0.3));

      const bloodY = photoY - 21.5;
      page.drawCircle({ x: photoX + 8, y: bloodY + 2.0, size: 3.0, color: rgb(0.9, 0.15, 0.15) });
      page.drawText(`BG: ${bloodGroup}`, { x: photoX + 15, y: bloodY, size: 5.2, font: fontBold, color: textDarkColor });
    }

    // 2. Right Side Details (Landscape Grid Layout)
    const rightX = 60;
    const rightW = pageW - rightX - 8;
    const fullName = `${person.name || ''} ${person.surname || ''}`.trim().toUpperCase();

    // Student Name
    drawTextFitWidth(page, fullName, rightX, headerY - 11, rightW, 8.5, fontBold, primaryColor, 5.0);

    // Accent line
    page.drawRectangle({
      x: rightX,
      y: headerY - 13.5,
      width: 16,
      height: 1.2,
      color: secondaryColor,
    });

    const rawDetails = isTeacher
      ? [
          { label: 'D.O.B', value: person.dob || person.birthDate || 'N/A' },
          { label: 'FATHER/SPOUSE', value: person.fatherName || 'N/A' },
          { label: 'CONTACT NO.', value: person.mobile || person.phone || 'N/A' },
          { label: 'ADDRESS', value: person.address || 'N/A' },
        ]
      : [
          { label: 'D.O.B', value: person.dob || person.birthDate || 'N/A' },
          { label: 'FATHER NAME', value: person.fatherName || 'N/A' },
          { label: 'MOTHER NAME', value: person.motherName || 'N/A' },
          { label: 'CONTACT NO.', value: person.fatherMobile || person.mobile || person.phone || person.contactNumber || 'N/A' },
          { label: 'ADDRESS', value: person.residentialAddress || person.address || 'N/A' },
        ];

    const details = rawDetails.map(item => ({
      label: item.label,
      value: String(item.value ?? 'N/A')
    }));

    const col1X = rightX;
    const col2X = rightX + 88;
    const itemW = 82;
    const itemH = 8.0;

    // Render Grid
    details.forEach((item, idx) => {
      if (item.label === 'ADDRESS') {
        const addrY = isTeacher ? headerY - 38 : headerY - 56;
        page.drawText('ADDRESS', { x: col1X, y: addrY, size: 3.5, font: fontBold, color: textGreyColor });
        page.drawRectangle({
          x: col1X,
          y: addrY - 17.0,
          width: rightW,
          height: 14.5,
          color: lightBgColor,
          borderColor: borderGreyColor,
          borderWidth: 0.5,
        });
        
        drawWrappedText(
          page,
          item.value.toUpperCase(),
          col1X + 3,
          addrY - 6.0,
          rightW - 6,
          4.8,
          fontRegular,
          textDarkColor,
          5.2
        );
      } else {
        const isCol1 = idx % 2 === 0;
        const rowIdx = Math.floor(idx / 2);
        const itemX = isCol1 ? col1X : col2X;
        const itemY = headerY - 21.0 - (rowIdx * 17.5);

        page.drawText(item.label, { x: itemX, y: itemY, size: 3.5, font: fontBold, color: textGreyColor });
        page.drawRectangle({
          x: itemX,
          y: itemY - 9.5,
          width: itemW,
          height: itemH,
          color: lightBgColor,
          borderColor: borderGreyColor,
          borderWidth: 0.5,
        });
        drawTextFitWidth(
          page,
          item.value.toUpperCase(),
          itemX + 3,
          itemY - 7.5,
          itemW - 6,
          4.8,
          fontBold,
          textDarkColor,
          3.8
        );
      }
    });
  }

  // --- DRAW FOOTER & SIGNATURE ---

  const footerH = 8.0;
  const sigY = footerH + 1.5;

  // Bottom official credential logo
  const botLogoSize = 8;
  const botLogoX = 6;
  const botLogoY = sigY + 1.5;

  if (cachedAssets.logoPng) {
    page.drawImage(cachedAssets.logoPng, {
      x: botLogoX,
      y: botLogoY,
      width: botLogoSize,
      height: botLogoSize,
    });
  } else {
    page.drawRectangle({
      x: botLogoX,
      y: botLogoY,
      width: botLogoSize,
      height: botLogoSize,
      color: lightBgColor,
      borderColor: borderGreyColor,
      borderWidth: 0.5,
    });
  }

  // "Official Credential" labels
  page.drawText('OFFICIAL', {
    x: botLogoX + botLogoSize + 3,
    y: botLogoY + 4,
    size: 3.5,
    font: fontBold,
    color: textGreyColor,
  });
  page.drawText('CREDENTIAL', {
    x: botLogoX + botLogoSize + 3,
    y: botLogoY,
    size: 3.5,
    font: fontBold,
    color: textDarkColor,
  });

  // Principal Sign Label
  const sigLabelX = pageW - 42;
  page.drawText('PRINCIPAL SIGN', {
    x: sigLabelX,
    y: sigY,
    size: 3.5,
    font: fontBold,
    color: textGreyColor,
  });

  // Embed Principal Signature image
  if (cachedAssets.sigPng) {
    page.drawImage(cachedAssets.sigPng, {
      x: sigLabelX,
      y: sigY + 3.5,
      width: 25,
      height: 7,
    });
  } else {
    page.drawLine({
      start: { x: sigLabelX, y: sigY + 4.5 },
      end: { x: sigLabelX + 25, y: sigY + 4.5 },
      color: borderGreyColor,
      thickness: 0.5,
    });
  }

  // Bottom Footer Bar
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageW,
    height: footerH,
    color: primaryColor,
  });

  const sessionText = `ACADEMIC YEAR: ${schoolProfile.currentSession || '2023-24'}`;
  const sessionTextWidth = fontBold.widthOfTextAtSize(sessionText, 4.0);
  page.drawText(sessionText, {
    x: (pageW - sessionTextWidth) / 2,
    y: (footerH - 4.0) / 2 + 0.5,
    size: 4.0,
    font: fontBold,
    color: whiteColor,
  });
};

/**
 * Downloads a completed high-fidelity vector PDF for a single ID Card.
 */
export const downloadIDCardPDF = async (
  person: StudentOrStaff,
  type: 'student' | 'teacher' | 'hostel',
  orientation: 'portrait' | 'landscape',
  schoolProfile: SchoolProfile,
  onProgress?: (message: string) => void
) => {
  onProgress?.('Preparing ultra-crisp vector canvas...');
  
  const pdfDoc = await PDFDocument.create();

  // Load fonts
  const helvetica = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);

  // Pre-fetch assets (Logo and Signature) and convert them to Base64 PNGs
  onProgress?.('Embedding school assets...');
  const logoDataUrl = await loadImageAsPngDataUrl(schoolProfile.logo);
  const sigDataUrl = await loadImageAsPngDataUrl(schoolProfile.principalSignature);

  const logoPng = await embedPngSafe(pdfDoc, logoDataUrl);
  const sigPng = await embedPngSafe(pdfDoc, sigDataUrl);

  onProgress?.('Rendering true vector PDF elements...');
  await drawIDCardToPDF(pdfDoc, person, type, orientation, schoolProfile, {
    logoPng,
    sigPng,
    helvetica,
    helveticaBold,
  });

  onProgress?.('Finalizing and compiling document...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `${type}-card-${person.name || 'card'}-${person.studentId || person.staffId || person.id || 'id'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

/**
 * Batch generates a single combined PDF for multiple students/staff (one page per card).
 * Incredibly performant & memory-optimized because we reuse the embedded school logo, 
 * principal signature, and standard font templates across hundreds of pages!
 */
export const downloadBatchIDCardsPDF = async (
  people: StudentOrStaff[],
  type: 'student' | 'teacher' | 'hostel',
  orientation: 'portrait' | 'landscape',
  schoolProfile: SchoolProfile,
  onProgress?: (current: number, total: number, message: string) => void
) => {
  const pdfDoc = await PDFDocument.create();

  // Load fonts once
  const helvetica = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);

  // Pre-fetch assets (Logo and Signature) and convert them once
  onProgress?.(0, people.length, 'Caching school logo and signature...');
  const logoDataUrl = await loadImageAsPngDataUrl(schoolProfile.logo);
  const sigDataUrl = await loadImageAsPngDataUrl(schoolProfile.principalSignature);

  const logoPng = await embedPngSafe(pdfDoc, logoDataUrl);
  const sigPng = await embedPngSafe(pdfDoc, sigDataUrl);

  const total = people.length;

  for (let i = 0; i < total; i++) {
    const person = people[i];
    onProgress?.(
      i + 1,
      total,
      `Drawing vector card ${i + 1} of ${total}: ${person.name || 'Student'} ${person.surname || ''}...`
    );

    await drawIDCardToPDF(pdfDoc, person, type, orientation, schoolProfile, {
      logoPng,
      sigPng,
      helvetica,
      helveticaBold,
    });
  }

  onProgress?.(total, total, 'Compiling and downloading batch PDF...');
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `batch-${type}-cards-${schoolProfile.name?.toLowerCase().replace(/\s+/g, '-') || 'school'}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

/**
 * Removes duplicate persons based on studentId/staffId or normalized full name + father name.
 * Guarantees no repeated names or persons are generated or printed.
 */
export const getUniquePeople = (people: StudentOrStaff[]): StudentOrStaff[] => {
  const seen = new Set<string>();
  const uniqueList: StudentOrStaff[] = [];

  for (const person of people) {
    if (!person) continue;
    
    const rawId = (person.studentId || person.staffId || person.id || '').toString().trim().toLowerCase();
    const fullName = `${person.name || ''} ${person.surname || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');
    const fatherName = (person.fatherName || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
    const dob = (person.dob || person.birthDate || '').toString().trim().toLowerCase();

    // Use ID if distinct, otherwise name + fatherName + dob
    const uniqueKey = (rawId && rawId !== 'n/a' && rawId !== 'null' && rawId !== 'undefined')
      ? `id:${rawId}`
      : `person:${fullName}|father:${fatherName}|dob:${dob}`;

    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey);
      uniqueList.push(person);
    }
  }

  return uniqueList;
};

/**
 * Generates an A4 sheet PDF with 4 ID cards per page (2x2 grid layout).
 * Ensures no repeated names or persons are allowed on the sheets.
 */
export const downloadA4GridIDCardsPDF = async (
  people: StudentOrStaff[],
  type: 'student' | 'teacher' | 'hostel',
  orientation: 'portrait' | 'landscape',
  schoolProfile: SchoolProfile,
  onProgress?: (current: number, total: number, message: string) => void
) => {
  // Filter out duplicates (no repeated names/persons)
  const uniquePeople = getUniquePeople(people);

  if (uniquePeople.length === 0) {
    throw new Error('No valid unique persons available to generate.');
  }

  // Step 1: Render individual card pages in a single source PDF document
  const cardDoc = await PDFDocument.create();

  const helvetica = await cardDoc.embedStandardFont(StandardFonts.Helvetica);
  const helveticaBold = await cardDoc.embedStandardFont(StandardFonts.HelveticaBold);

  onProgress?.(0, uniquePeople.length, 'Caching school logo and signature...');
  const logoDataUrl = await loadImageAsPngDataUrl(schoolProfile.logo);
  const sigDataUrl = await loadImageAsPngDataUrl(schoolProfile.principalSignature);

  const logoPng = await embedPngSafe(cardDoc, logoDataUrl);
  const sigPng = await embedPngSafe(cardDoc, sigDataUrl);

  const total = uniquePeople.length;

  for (let i = 0; i < total; i++) {
    const person = uniquePeople[i];
    onProgress?.(
      i + 1,
      total,
      `Drawing unique vector card ${i + 1} of ${total}: ${person.name || 'Student'} ${person.surname || ''}...`
    );

    await drawIDCardToPDF(cardDoc, person, type, orientation, schoolProfile, {
      logoPng,
      sigPng,
      helvetica,
      helveticaBold,
    });
  }

  onProgress?.(total, total, 'Arranging 4 cards per A4 page...');

  // Step 2: Create A4 Page Grid Document (595.28 x 841.89 points)
  const a4Doc = await PDFDocument.create();
  const cardPages = cardDoc.getPages();
  const embeddedPages = await a4Doc.embedPages(cardPages);

  const a4Width = 595.28;  // A4 Width in points
  const a4Height = 841.89; // A4 Height in points

  const cardsPerPage = 4;
  const totalPages = Math.ceil(embeddedPages.length / cardsPerPage);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const a4Page = a4Doc.addPage([a4Width, a4Height]);
    const startIndex = pageIdx * cardsPerPage;
    const currentBatch = embeddedPages.slice(startIndex, startIndex + cardsPerPage);

    if (orientation === 'portrait') {
      // 2 columns x 2 rows of portrait cards
      const cardW = 245; // pt
      const cardH = 370; // pt
      const gapX = (a4Width - (2 * cardW)) / 3; // ~ 35.1 pt
      const gapY = (a4Height - (2 * cardH)) / 3; // ~ 33.9 pt

      const positions = [
        { x: gapX, y: a4Height - gapY - cardH },                 // Top Left
        { x: gapX * 2 + cardW, y: a4Height - gapY - cardH },     // Top Right
        { x: gapX, y: gapY },                                    // Bottom Left
        { x: gapX * 2 + cardW, y: gapY },                        // Bottom Right
      ];

      currentBatch.forEach((embCard, idx) => {
        const pos = positions[idx];

        // Draw card embedded page
        a4Page.drawPage(embCard, {
          x: pos.x,
          y: pos.y,
          width: cardW,
          height: cardH,
        });

        // Draw clean light border for easy scissor cutting
        a4Page.drawRectangle({
          x: pos.x - 0.5,
          y: pos.y - 0.5,
          width: cardW + 1,
          height: cardH + 1,
          borderColor: rgb(0.80, 0.82, 0.86),
          borderWidth: 0.5,
        });
      });
    } else {
      // 2 columns x 2 rows of landscape cards
      const cardW = 260; // pt
      const cardH = 164; // pt
      const gapX = (a4Width - (2 * cardW)) / 3;
      const gapY = (a4Height - (2 * cardH)) / 3;

      const positions = [
        { x: gapX, y: a4Height - gapY - cardH - 120 },
        { x: gapX * 2 + cardW, y: a4Height - gapY - cardH - 120 },
        { x: gapX, y: gapY + 120 },
        { x: gapX * 2 + cardW, y: gapY + 120 },
      ];

      currentBatch.forEach((embCard, idx) => {
        const pos = positions[idx];

        a4Page.drawPage(embCard, {
          x: pos.x,
          y: pos.y,
          width: cardW,
          height: cardH,
        });

        a4Page.drawRectangle({
          x: pos.x - 0.5,
          y: pos.y - 0.5,
          width: cardW + 1,
          height: cardH + 1,
          borderColor: rgb(0.80, 0.82, 0.86),
          borderWidth: 0.5,
        });
      });
    }
  }

  onProgress?.(total, total, 'Finalizing A4 Sheet PDF...');
  const pdfBytes = await a4Doc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `A4-Grid-4Cards-${type}-${uniquePeople.length}-unique-cards.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};
