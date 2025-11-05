import { NextResponse, NextRequest } from 'next/server';
import { Blog } from '@/lib/models/Blog';
import {connectDB} from '@/lib/config/db';
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

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
    const blog = await Blog.findByIdAndUpdate((await context.params).id, body, { new: true });
    if (!blog) {
      return NextResponse.json({ message: 'Campaña no encontrada.' }, { status: 404 });
    }
    return NextResponse.json({ item: blog });
  } catch (error) {
    return NextResponse.json({ message: 'Token inválido o expirado o error interno.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    await Blog.findByIdAndDelete((await context.params).id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 401 });
  }
}