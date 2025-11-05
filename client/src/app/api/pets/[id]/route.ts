import { NextResponse, NextRequest } from 'next/server';
import { Pet } from '@/lib/models/Pet';
import {connectDB} from '@/lib/config/db';
import { verifyToken, JwtPayload } from '@/lib/utils/jwt';
import { headers } from 'next/headers';
import { User } from '@/lib/models/User';
import { startFollowUpProcessForPet } from '@/lib/utils/followUpUtils';

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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const pet = await Pet.findById((await context.params).id);
  if (!pet) {
    return NextResponse.json({ message: 'Mascota no encontrada.' }, { status: 404 });
  }
  return NextResponse.json({ item: pet });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  const token = await getTokenFromHeader();
  if (!token) {
    return NextResponse.json({ message: 'No autenticado. Se requiere token.' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token as string) as JwtPayload;
    const user = await User.findById(payload.sub);

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado. Se requiere rol de administrador.' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    const pet = await Pet.findByIdAndUpdate((await context.params).id, body, { new: true });
    if (!pet) {
      return NextResponse.json({ message: 'Mascota no encontrada.' }, { status: 404 });
    }

    if (status === 'en seguimiento') {
      await startFollowUpProcessForPet(pet._id.toString());
    }

    return NextResponse.json({ item: pet });
  } catch (error) {
    console.error('Error updating pet or starting follow-up:', error);
    return NextResponse.json({ message: 'Token inválido o expirado o error interno.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  const token = await getTokenFromHeader();
  if (!token) {
    return NextResponse.json({ message: 'No autenticado. Se requiere token.' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token as string) as JwtPayload;
    const user = await User.findById(payload.sub);

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado. Se requiere rol de administrador.' }, { status: 403 });
    }

    await Pet.findByIdAndDelete((await context.params).id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 401 });
  }
}