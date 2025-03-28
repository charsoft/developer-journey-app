import { NextApiRequest, NextApiResponse } from 'next';
import { Database } from 'src/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    
    // Verify the token with Google
    const ticket = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + token);
    const payload = await ticket.json();

    if (!payload.email) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Create or update user in Firestore
    const db = new Database();
    const username = payload.email.split('@')[0]; // Use email prefix as username
    
    await db.setUser({
      username,
      completedMissions: [],
    });

    // Set a session cookie
    res.setHeader('Set-Cookie', `session=${token}; Path=/; HttpOnly; SameSite=Lax`);

    // Return user data
    res.status(200).json({
      username,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });
  } catch (error) {
    console.error('Error in Google auth:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 