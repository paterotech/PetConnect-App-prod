import { NextResponse } from 'next/server';
import { Pet } from '@/lib/models/Pet';
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
  const pets = await Pet.find().sort({ createdAt: -1 });
  return NextResponse.json({ items: pets });
}

export async function POST(req: Request) {
  await connectDB();

  const token = getTokenFromHeader();
  if (!token) {
    return NextResponse.json({ message: 'No autenticado. Se requiere token.' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token) as JwtPayload;
    const user = await User.findById(payload.sub);

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado. Se requiere rol de administrador.' }, { status: 403 });
    }

    const body = await req.json();
    const pet = await Pet.create(body);
    return NextResponse.json({ item: pet }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 401 });
  }
}