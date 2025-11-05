import { NextResponse, NextRequest } from 'next/server';
import { AdopterFormSubmission } from '@/lib/models/AdopterFormSubmission';
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

async function adminMiddleware(request: NextRequest) {
    const token = await getTokenFromHeader();
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
        return null;
    } catch (error) {
        return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 401 });
    }
}

export async function POST(request: NextRequest) {
    await connectDB();
    const token = await getTokenFromHeader();
    if (!token) {
        return NextResponse.json({ message: 'No autenticado. Se requiere token.' }, { status: 401 });
    }

    try {
        const payload = verifyToken(token) as JwtPayload;
        const userId = payload.sub;

        const {
            fullName, email, phone, housingType, hasOtherPets, hasChildren,
            livesWithAdults, ageRange, department, city, petPreference, reasonForAdoption
        } = await request.json();

        const newSubmission = await AdopterFormSubmission.create({
            fullName, email, phone, housingType, hasOtherPets, hasChildren,
            livesWithAdults, ageRange, department, city, petPreference, reasonForAdoption,
            user: userId,
            status: 'pendiente',
        });
        return NextResponse.json({ item: newSubmission }, { status: 201 });
    } catch (error) {
        console.error('Error creating form submission:', error);
        return NextResponse.json({ message: 'Error al crear la entrada del formulario.' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    await connectDB();
    const adminError = await adminMiddleware(request);
    if (adminError) {
        return adminError;
    }

    try {
        const submissions = await AdopterFormSubmission.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        return NextResponse.json({ items: submissions });
    } catch (error) {
        console.error('Error fetching form submissions:', error);
        return NextResponse.json({ message: 'Error al cargar las entradas del formulario.' }, { status: 500 });
    }
}