// pages/api/config.ts
export default function handler(req, res) {
    res.status(200).json({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
  }
  