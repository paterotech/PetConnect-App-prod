import jwt from 'jsonwebtoken';
import { env } from '@/lib/config/env';

// Definimos un tipo para el payload del JWT para más seguridad y autocompletado
export interface JwtPayload {
  sub: string; // Subject (user ID)
  email: string;
  role: 'user' | 'admin';
}

/**
 * Genera un JSON Web Token (JWT).
 * @param payload - El payload para firmar en el token.
 * @returns El token JWT firmado.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifica un token JWT y devuelve su payload.
 * @param token - El token a verificar.
 * @returns El payload decodificado del token.
 * @throws Si el token es inválido o ha expirado.
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
