import { NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import { signToken } from '@/lib/utils/jwt';
import { connectDB } from '@/lib/config/db';

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'El email y la contraseña son requeridos.' }, { status: 400 });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
  }

  const token = signToken({ sub: user._id.toString(), email: user.email, role: user.role });

  return NextResponse.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}