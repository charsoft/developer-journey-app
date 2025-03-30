import { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';
import { Database } from 'src/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    console.log('Received token:', token ? 'Token present' : 'No token');
    
    // Verify the token with Google
    console.log('Verifying token with Google...');
    const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    console.log('Client ID used for verification:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      console.log('Token payload:', payload);

      if (!payload?.email) {
        console.error('No email in payload:', payload);
        return res.status(400).json({ message: 'Invalid token' });
      }

      // Create or update user in Firestore
      console.log('Creating/updating user in Firestore...');
      const db = new Database();
      const username = payload.email.split('@')[0]; // Use email prefix as username
      
      try {
        await db.setUser({
          username,
          completedMissions: [],
        });
        console.log('User updated successfully');
      } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ message: 'Database error' });
      }

      // Set a session cookie
      res.setHeader('Set-Cookie', `session=${token}; Path=/; HttpOnly; SameSite=Lax`);

      // Return user data
      res.status(200).json({
        username,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      });
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(400).json({ message: 'Token verification failed' });
    }
  } catch (error: any) {
    console.error('Error in Google auth:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
} 