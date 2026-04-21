import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

//Mock db
interface DBUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
}

const mockDatabase: DBUser[] = []; 

//signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ message: 'Email, password, and username are required.' });
      return;
    }

    const existingUser = mockDatabase.find(u => u.email === email);
    if (existingUser) {
      res.status(409).json({ message: 'A user with that email already exists.' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser: DBUser = {
      id: `user_${Date.now()}`, 
      email,
      username,
      passwordHash
    };
    mockDatabase.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
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

    const user = mockDatabase.find(u => u.email === email);
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    });

  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ message: 'Internal server error during signin.' });
  }
});

export default router;
