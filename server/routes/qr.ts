import { Router } from 'express';
import QRCode from 'qrcode';

export const qrRouter = Router();

// Returns permanent static QR codes for Registration and Library Login
qrRouter.get('/codes', async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;

    // 1. Permanent Static Registration URL
    const registrationUrl = `${baseUrl}/register`;
    // 2. Permanent Static Library Login URL
    const loginUrl = `${baseUrl}/library-login`;

    // Generate high resolution PNG data URLs
    const registrationQrPng = await QRCode.toDataURL(registrationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 512,
      color: {
        dark: '#0f172a', // Deep Slate / Navy
        light: '#ffffff',
      },
    });

    const loginQrPng = await QRCode.toDataURL(loginUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 512,
      color: {
        dark: '#1e3a8a', // Royal Navy Blue
        light: '#ffffff',
      },
    });

    // Generate SVG strings for scalable vector downloads
    const registrationQrSvg = await QRCode.toString(registrationUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const loginQrSvg = await QRCode.toString(loginUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff',
      },
    });

    res.json({
      success: true,
      baseUrl,
      qr1: {
        name: 'QR CODE 1: REGISTRATION QR CODE',
        purpose: 'Direct entry to Smart Library User & Research Scholar Registration Form',
        targetUrl: registrationUrl,
        pngDataUrl: registrationQrPng,
        svgString: registrationQrSvg,
        status: 'PERMANENT_STATIC',
        instruction: 'Scan with smartphone or library kiosk camera to register new reader credentials.',
      },
      qr2: {
        name: 'QR CODE 2: LIBRARY LOGIN QR CODE',
        purpose: 'Direct entry to Library Session Verification & Countdown Management',
        targetUrl: loginUrl,
        pngDataUrl: loginQrPng,
        svgString: loginQrSvg,
        status: 'PERMANENT_STATIC',
        instruction: 'Scan upon entering reading halls to validate Registration ID and start session timer.',
      },
    });
  } catch (error: any) {
    console.error('Error generating QR codes:', error);
    res.status(500).json({ success: false, message: 'Failed to generate static QR codes', error: error.message });
  }
});
