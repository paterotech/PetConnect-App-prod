import { NextResponse } from 'next/server';
import { User, IUser } from '@/lib/models/User';
import { signToken } from '@/lib/utils/jwt';
import { connectDB } from '@/lib/config/db';

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'El email y la contraseña son requeridos.' }, { status: 400 });
  }

  const user: IUser | null = await User.findOne({ email }).select('+password');
  if (!user) {
    return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
  }

  const token = signToken({ sub: (user as any)._id.toString(), email: (user as any).email, role: (user as any).role });

  return NextResponse.json({
    token,
    user: {
      id: (user as any)._id,
      name: (user as any).name,
      email: (user as any).email,
      role: (user as any).role,
    },
  });
}