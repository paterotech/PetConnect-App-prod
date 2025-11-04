import { NextResponse } from 'next/server';
import { Pet, IPet } from '@/lib/models/Pet';
import { AdoptionRequest } from '@/lib/models/AdoptionRequest';
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
        const [totalPets, adoptedPets, availablePets, inProcessPets, pendingRequests, approvedRequests, rejectedRequests, petsByKind] = await Promise.all([
            Pet.countDocuments(),
            Pet.countDocuments({ status: 'adoptado' }),
            Pet.countDocuments({ status: 'disponible' }),
            Pet.countDocuments({ status: 'en proceso de adopción' }),
            AdoptionRequest.countDocuments({ status: 'pendiente' }),
            AdoptionRequest.countDocuments({ status: 'aprobada' }),
            AdoptionRequest.countDocuments({ status: 'rechazada' }),
            Pet.aggregate([
                { $group: { _id: '$kind', count: { $sum: 1 } } },
            ]),
        ]);

        const petsByKindMap = petsByKind.reduce((acc: { [key: string]: number }, item: { _id: IPet['kind'], count: number }) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        return NextResponse.json({
            totalPets,
            adoptedPets,
            availablePets,
            inProcessPets,
            pendingRequests,
            approvedRequests,
            rejectedRequests,
            petsByKind: petsByKindMap,
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ message: 'Error al obtener las estadísticas del dashboard.' }, { status: 500 });
    }
}