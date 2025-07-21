import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Simple CSRF token implementation
// In production, consider using express-session with connect-pg-simple for token storage

interface CSRFRequest extends Request {
  csrfToken?: string;
}

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
const CSRF_SALT_LENGTH = 16;

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const salt = crypto.randomBytes(CSRF_SALT_LENGTH).toString('hex');
  const hash = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(salt)
    .digest('hex');
  
  return `${salt}:${hash}`;
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string): boolean {
  try {
    const [salt, hash] = token.split(':');
    if (!salt || !hash) return false;
    
    const expectedHash = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(salt)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * CSRF protection middleware for state-changing operations
 */
export function csrfProtection(req: CSRFRequest, res: Response, next: NextFunction) {
  // Skip CSRF check for GET requests
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string || req.body._csrf;
  
  if (!token) {
    return res.status(403).json({ 
      error: 'CSRF token missing',
      code: 'CSRF_MISSING' 
    });
  }

  if (!verifyCSRFToken(token)) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      code: 'CSRF_INVALID' 
    });
  }

  next();
}

/**
 * Endpoint to get a CSRF token
 */
export function getCSRFToken(req: Request, res: Response) {
  const token = generateCSRFToken();
  res.json({ csrfToken: token });
}