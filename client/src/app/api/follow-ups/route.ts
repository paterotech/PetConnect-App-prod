import { NextResponse } from 'next/server';
import { FollowUp } from '@/lib/models/FollowUp';
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

async function adminMiddleware(req: Request) {
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
        return null;
    } catch (error) {
        return NextResponse.json({ message: 'Token inválido o expirado.' }, { status: 401 });
    }
}

export async function GET(req: Request) {
    await connectDB();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const followUps = await FollowUp.find().populate({
            path: 'adoptionRequest',
            populate: {
                path: 'pet user'
            }
        });

        const groupedByPet = followUps.reduce((acc, followUp) => {
            const adoptionReq = followUp.adoptionRequest as any;
            if (!adoptionReq || !adoptionReq.pet) {
                return acc;
            }
            const petId = adoptionReq.pet._id.toString();
            if (!acc[petId]) {
                acc[petId] = {
                    pet: adoptionReq.pet,
                    adopter: adoptionReq.user,
                    visits: {},
                };
            }
            acc[petId].visits[followUp.visitType] = followUp;
            return acc;
        }, {} as any);

        return NextResponse.json(Object.values(groupedByPet));
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
    }
}