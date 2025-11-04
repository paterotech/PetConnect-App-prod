import { NextResponse } from 'next/server';
import { AdoptionRequest } from '@/lib/models/AdoptionRequest';
import { AdopterFormSubmission } from '@/lib/models/AdopterFormSubmission';
import { connectDB } from '@/lib/config/db';
import { verifyToken, JwtPayload } from '@/lib/utils/jwt';
import { headers } from 'next/headers';
import { User } from '@/lib/models/User';

function getTokenFromHeader(): string | null {
  const authHeader = headers().get('authorization');
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
    const user = await User.findById(payload.sub);

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado.' }, { status: 404 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado. Se requiere rol de administrador.' }, { status: 403 });
    }

    const requests = await AdoptionRequest.find()
      .populate('pet', 'name image')
      .populate('user', 'name email')
      .select('+formSubmission')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(req => ({
      ...req.toObject(),
      formSubmission: req.formSubmission ? req.formSubmission.toString() : null,
    }));

    return NextResponse.json({ items: formattedRequests });
  } catch (error) {
    console.error('Error fetching adoption requests:', error);
    return NextResponse.json({ message: 'Error al cargar las solicitudes de adopción.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectDB();
  if (!token) {
    return NextResponse.json({ message: 'No autenticado. Se requiere token.' }, { status: 401 });
  }

  try {
    const payload = verifyToken(token) as JwtPayload;
    const userId = payload.sub;
    const userEmail = payload.email;

    let { pet, contactEmail, contactPhone, message, formSubmission } = await req.json();

    if (!formSubmission) {
      const newFormSubmission = await AdopterFormSubmission.create({
        fullName: userEmail || 'Usuario Anónimo',
        email: contactEmail,
        phone: contactPhone,
        housingType: 'No especificado',
        hasOtherPets: false,
        hasChildren: false,
        livesWithAdults: false,
        ageRange: 'No especificado',
        department: 'No especificado',
        city: 'No especificado',
        petPreference: 'No especificado',
        reasonForAdoption: message || 'No especificado',
        user: userId,
        status: 'pendiente',
      });
      formSubmission = newFormSubmission._id;
    }

    const newRequest = await AdoptionRequest.create({
      pet,
      user: userId,
      formSubmission,
      contactEmail,
      contactPhone,
      message,
      status: 'pendiente',
    });
    return NextResponse.json({ item: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating adoption request:', error);
    return NextResponse.json({ message: 'Error al crear la solicitud de adopción.' }, { status: 500 });
  }
}