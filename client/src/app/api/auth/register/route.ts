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

  const token = signToken({ sub: user._id, email: user.email, role: user.role });

  return NextResponse.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }, { status: 201 });
}