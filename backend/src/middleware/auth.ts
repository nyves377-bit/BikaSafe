import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Enforce JWT_SECRET in production — never use a fallback
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev_only_secret_do_not_use_in_prod');

if (!JWT_SECRET) {
    console.error('[FATAL] JWT_SECRET environment variable is not set. Refusing to start in production without it.');
    process.exit(1);
}

export { JWT_SECRET };

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        groupId: string;
    };
    file?: Express.Multer.File;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    }
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Unauthorized: Access denied for this role' });
        }
        next();
    };
};

// Roles mapping for consistency
export const ROLES = {
    ADMIN: 'ADMIN',
    TREASURER: 'TREASURER',
    MEMBER: 'MEMBER',
    AUDITOR: 'AUDITOR',
};
