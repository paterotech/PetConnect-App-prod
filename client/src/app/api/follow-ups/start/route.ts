import { NextResponse, NextRequest } from 'next/server';
import { FollowUp } from '@/lib/models/FollowUp';
import { AdoptionRequest } from '@/lib/models/AdoptionRequest';
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
    const adminError = await adminMiddleware(request);
    if (adminError) {
        return adminError;
    }

    try {
        const { petId } = await request.json();
        const adoptionRequest = await AdoptionRequest.findOne({ pet: petId, status: 'aprobada' });
        if (!adoptionRequest) {
            return NextResponse.json({ msg: 'No se encontró solicitud de adopción aprobada.' }, { status: 404 });
        }

        const existing = await FollowUp.find({ adoptionRequest: adoptionRequest._id });
        if (existing.length > 0) {
            return NextResponse.json({ msg: 'El seguimiento para esta mascota ya fue iniciado.' }, { status: 400 });
        }

        const adoptionDate = adoptionRequest.updatedAt || new Date();
        const visitDates = [
            { visitType: '1-month', visitDate: new Date(new Date(adoptionDate).setMonth(adoptionDate.getMonth() + 1)) },
            { visitType: '3-month', visitDate: new Date(new Date(adoptionDate).setMonth(adoptionDate.getMonth() + 3)) },
            { visitType: '6-month', visitDate: new Date(new Date(adoptionDate).setMonth(adoptionDate.getMonth() + 6)) },
        ];

        const createdFollowUps = await Promise.all(visitDates.map(visit => {
            const newFollowUp = new FollowUp({
                adoptionRequest: adoptionRequest._id,
                visitType: visit.visitType,
                visitDate: visit.visitDate,
                status: 'Programada',
            });
            return newFollowUp.save();
        }));

        return NextResponse.json(createdFollowUps, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
    }
}