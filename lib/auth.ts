import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_HASH || 'V2ViIEFic2VuIEROQSBwYWtlIG5leHRqcyBjaWh1eXl5eXk=';

export interface TokenPayload {
    id: Number;
    username: String;
    password: String;
}

export function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
        return null;
    }
}
