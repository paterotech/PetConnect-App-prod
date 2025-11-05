import { NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import { signToken } from '@/lib/utils/jwt';
import {connectDB} from '@/lib/config/db';

export async function POST(req: Request) {
  await connectDB();
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ message: 'El nombre, el email y la contraseña son requeridos.' }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'El correo electrónico ya está registrado.' }, { status: 409 });
  }

  const user = new User({ name, email, password });
  await user.save();

  const token = signToken({ sub: (user as any)._id.toString(), email: (user as any).email, role: (user as any).role });

  return NextResponse.json({
    token,
    user: {
      id: (user as any)._id,
      name: (user as any).name,
      email: (user as any).email,
      role: (user as any).role,
    },
  }, { status: 201 });
}