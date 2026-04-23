import { Request, Response, NextFunction } from 'express';
const jwt = require ("jsonwebtoken");

export interface AuthPayload{
  id: number;
  usernmae: string;
}

export interface AuthenticatedRequest extends Request{
  user?: AuthPayload;
}

export const authGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export default authGuard;
