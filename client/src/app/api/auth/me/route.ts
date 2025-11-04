import { NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import { verifyToken, JwtPayload } from '@/lib/utils/jwt';
import { connectDB } from '@/lib/config/db';
import { headers } from 'next/headers';

async function getTokenFromHeader(): Promise<string | null> {
  const authHeader = (await headers()).get('authorization');
  if (!authHeader) {
    return null;
  }

  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export async function GET() {
  await connectDB();
  const token = getTokenFromHeader();

  if (!token) {
    return NextResponse.json({ message: 'No autenticado. Se requiere token.' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token) as JwtPayload;
    const userId = payload.sub;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 401 });
  }
}