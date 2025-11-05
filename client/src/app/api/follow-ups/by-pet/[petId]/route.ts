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

async function adminMiddleware(req: Request) {
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

export async function GET(request: NextRequest, context: { params: Promise<{ petId: string }> }) {
    await connectDB();
    const adminError = await adminMiddleware(request);
    if (adminError) {
        return adminError;
    }

    try {
        const adoptionRequest = await AdoptionRequest.findOne({ pet: (await context.params).petId, status: 'aprobada' });
        if (!adoptionRequest) {
            return NextResponse.json([]);
        }
        const followUps = await FollowUp.find({ adoptionRequest: adoptionRequest._id }).populate({
            path: 'adoptionRequest',
            populate: {
                path: 'pet user'
            }
        });
        return NextResponse.json(followUps);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
    }
}