import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');

export interface AuthPayload {
    username: string;
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}

export const authGuard = (req: AuthRequest, res: Response, next: NextFunction) : void => {

    const authHeader = req.header('Authorization');

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = verified as AuthPayload;
        next();

    } catch(err) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
}
