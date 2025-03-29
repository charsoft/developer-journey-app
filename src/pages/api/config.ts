// pages/api/config.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
  }
  