import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
// In production, you should use environment variables for the service account
const serviceAccount = {
  "type": "service_account",
  "project_id": "atb-tracker-eb793",
  "private_key_id": "24a8811bb1f42e7add64f123dc2fc76dff0dd041",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPCwQ2maniOv05\na3J/08IsP+DYg8lRw1A0Rcy8DjN3w05EuldRz2ljiz9uK+DNDKOEGVzYcYjbYKNz\ndXC+B2wq0YDRb7Jsw4xqMbp+mZAYWfqYOCctGyl3apZxRLXL2tPcn2+QEEJHLLJy\n3iSf8b0jwofx2fFeowg3rxsC5CfQ79Vai0xE4JW77N9YtjrWrSpL8gacyOnRcZtX\npA4nNKbiKCOTepPE/N4XTQVYmXmlzdCcE9pqql7GadCkwdQK2h/0M7W1joAwa2h4\ngdVawXJ/ehs98H5c0OkXaArHSF94tldPTBx9Ui3r5dYOu1ARPKBEQRo4gKrQAdtm\nW1P392r7AgMBAAECggEAZa+f8J8U4E8fimF6uUxMHAZ9jGlhaX5XOG0lqiEBZyst\nmDS66SvIs4Ky8w2q2ZqA/sKkJovQbwpuDKlb54Dmv7ronTRSOffq0Uc+NKqAKm2a\n1cMSfqVN/uADJntcHFSL5FoL5YIOwz0xIZh3/XQxdEw5D2/+i3/f69VdG1TqN0OI\n9gsrLDo8b4wnVaN2KkUIJL57+0iU3N6iAnR53bU0gN8Q5DT5h/ZYXsgXdDNv3Aja\nwaAHP+5NeMJ5qzayHyp/mrJcZ5D5DAun+o6M27RgYus6emL0xRg/aiUZKoEX1NIH\nqWDwX01CQeWtnsDkw+z7tSQfKM37uFZ8yLnhHGCTKQKBgQD1epc9LDAN8GBz+ZYY\nxi7rlHVen7iR6+mKGY2fMCA/UvLBJDZJQWx6AcF9DzU31+nTZOi8cQnau0nVebjP\nnrmSLhfXD/cHdxNZE1PbTQvorKBzTeEFZiojSHBAbn5pJpVboRipaIlstz0KqkLP\n+1RWlHTaKhQZKTB4Q0Wh0fQG2QKBgQDX6rSPsRjn039KD3hKQ1ZwXRdxhYMHugvd\nM+dGc/u4L7Ym46x7kCKmu416pO+k0wTRhQq3R/m72x5fAnQ/DUw/ZD4Zr3yXmE/Z\nGohiO6uCJ3o5WEY6/Hkj1p97OsZTJ1AVUq0rmiJA+tKgER51syr97v81j/rW0d0x\nbz/JXMdj8wKBgQDg4auHaOGlA175H963V2dIfbqAMwYc9+f8kahB+w6vtEebVJc+\nyOadZtpgvPvd6rjU5g6oA04pyYW8QURjP191YTCJ3qBJgHaDFceukYilYO+kceYA\n0jUsGYJsJE09+xC83nn/SDsNE1iiWpPWgMIkht/9tKqw2iEDK22w7uwFEQKBgQCp\nbVDWWF90um9tzAnWLFTNwx68Q8n37DOXFj1q+WQSuc2zYoBcTVQDhbSVAovRyIxF\nZKJuA5qhoGWKpEBXobWtIJniSeP4iNpPQBS5EJ2aeiPcj7o8WxUr3CQ07H/njDe5\nI7EjP8WVO7y/Qe+m6DraHApDG4H3w6JQQj3JYnZLpQKBgEF1hdxt2O1UmIb2mgjr\nmdav3j3u6+zRRxl4ljftsy8LstvQE1FIiBnZ8GIqPjky70p71dqYV+83ubdMc1Wn\nJFXD60xABdz7xX/AWPqccEwntz6zT4dA1EZNs342r4X8ZjJ3ALbbcgZDF+IHsTsm\ndv3ePsG18IzIpE3Ga3meYRDj\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@atb-tracker-eb793.iam.gserviceaccount.com",
  "client_id": "105861385762745593280",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40atb-tracker-eb793.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize the app if it hasn't been initialized
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const auth = getAuth();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken, mode, user } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Send user data to Django backend for storage/verification
    const DJANGO_API_URL = process.env.DJANGO_API_URL || 'https://atb-tracker.onrender.com';
    
    const backendResponse = await fetch(`${DJANGO_API_URL}/api/auth/google/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebase_uid: decodedToken.uid,
        email: decodedToken.email,
        name: user.name || decodedToken.name,
        picture: user.picture || decodedToken.picture,
        mode: mode, // 'signup' or 'login'
        email_verified: decodedToken.email_verified
      })
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return res.status(backendResponse.status).json({ error: errorData.error || 'Backend authentication failed' });
    }

    const backendData = await backendResponse.json();

    // Return the user data and tokens from backend
    res.status(200).json({
      user: backendData.user,
      tokens: backendData.tokens,
      message: mode === 'signup' ? 'User registered successfully' : 'User logged in successfully'
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 