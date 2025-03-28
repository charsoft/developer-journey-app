import { NextApiRequest, NextApiResponse } from 'next';
import { Database } from 'src/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = new Database();
    const { firstName, lastName, email, phoneNumber, technologyInterest, username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    await db.setUserProfile({
      username,
      firstName,
      lastName,
      email,
      phoneNumber,
      technologyInterest,
    });

    res.status(200).json({ message: 'Profile saved successfully' });
  } catch (error) {
    console.error('Error saving user profile:', error);
    res.status(500).json({ message: 'Failed to save profile' });
  }
} 