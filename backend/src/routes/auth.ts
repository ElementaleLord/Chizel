import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authGuard, { type AuthenticatedRequest } from '../middleware/authGuard';
import {
  createUser,
  checkUserExistence,
  getUserPasswordEmail,
  getUserInfo,
  getUserInfoById,
  getUserProfile,
  getUserProfileRepositories,
  updateUserProfile,
} from './database';
import type { DBUser } from './database';

const router = express.Router();

const mockDatabase: DBUser[] = [];

console.log("AUTH ROUTER LOADED");

//signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ message: 'Email, password, and username are required.' });
      return;
    }

    const existingUser = await checkUserExistence(email);
    if (existingUser) {
      res.status(409).json({ message: 'A user with that email already exists.' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser: DBUser = {
      email,
      username,
      passwordHash
    };
    //db
    const newUserId = await createUser(newUser);
    //mockDatabase.push(newUser);

    const token = jwt.sign(
      { id: newUserId, username: newUser.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );


    const profile = newUserId ? await getUserProfile(Number(newUserId)) : null;

    res.status(201).json({
      user: {
        id: newUserId,
        email: newUser.email,
        username: newUser.username,
        displayname: profile?.displayname ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
      },
      token
    });


  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal server error during signup.' });
  }
});

//signin/login
router.post('/signin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    //db
    const userPass = await getUserPasswordEmail(email);
    if (!userPass) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, userPass);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const user = await getUserInfo(email);

    const token = jwt.sign(
      { id: user.a_id, username: user.a_username },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    const profile = await getUserProfile(Number(user.a_id));

    res.json({
      user: {
        id: user.a_id,
        email: user.a_email,
        username: user.a_username,
        displayname: profile?.displayname ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
      },
      token
    });

  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ message: 'Internal server error during signin.' });
  }
});

router.get('/profile', authGuard, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const [profile, repositories] = await Promise.all([
      getUserProfile(userId),
      getUserProfileRepositories(userId),
    ]);

    if (!profile) {
      res.status(404).json({ message: 'Profile not found.' });
      return;
    }

    res.json({
      profile,
      repositories: repositories ?? [],
    });
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({ message: 'Failed to load profile.' });
  }
});

router.patch('/profile', authGuard, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const displayname = typeof req.body?.displayname === 'string' ? req.body.displayname : null;
    const description = typeof req.body?.bio === 'string' ? req.body.bio : null;
    const avatarDataUrl = typeof req.body?.avatarDataUrl === 'string'
      ? req.body.avatarDataUrl
      : req.body?.avatarDataUrl === null
        ? null
        : undefined;

    const existingUser = await getUserInfoById(userId);
    if (!existingUser) {
      res.status(404).json({ message: 'Profile not found.' });
      return;
    }

    const updatedProfile = await updateUserProfile(userId, {
      displayname,
      description,
      avatarDataUrl,
    });

    if (!updatedProfile) {
      res.status(500).json({ message: 'Failed to update profile.' });
      return;
    }

    const repositories = await getUserProfileRepositories(userId);
    const token = jwt.sign(
      { id: userId, username: updatedProfile.username },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        username: updatedProfile.username,
        displayname: updatedProfile.displayname,
        avatarUrl: updatedProfile.avatarUrl,
      },
      token,
      profile: updatedProfile,
      repositories: repositories ?? [],
    });
  } catch (error: any) {
    console.error('Profile Update Error:', error);

    if (error instanceof Error && error.message.includes('Avatar must be')) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

export default router;
