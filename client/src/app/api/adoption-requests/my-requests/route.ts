import { NextResponse } from 'next/server';
import { AdoptionRequest } from '@/lib/models/AdoptionRequest';
import { connectDB } from '@/lib/config/db';
import { verifyToken, JwtPayload } from '@/lib/utils/jwt';
import { headers } from 'next/headers';
import { User } from '@/lib/models/User';

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

  const token = await getTokenFromHeader();
  if (!token) {
    return NextResponse.json({ message: 'No autenticado. Se requiere token.' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token) as JwtPayload;
    const userId = payload.sub;

    const requests = await AdoptionRequest.find({ user: userId })
      .populate('pet', 'name image')
      .sort({ createdAt: -1 });

    return NextResponse.json({ items: requests });
  } catch (error) {
    console.error('Error fetching user adoption requests:', error);
    return NextResponse.json({ message: 'Error al cargar tus solicitudes de adopción.' }, { status: 500 });
  }
}