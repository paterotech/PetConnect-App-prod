import { NextResponse } from 'next/server';
import { AdoptionRequest } from '@/lib/models/AdoptionRequest';
import { Pet } from '@/lib/models/Pet';
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const request = await AdoptionRequest.findById(params.id)
            .populate('pet', 'name image')
            .populate('user', 'name email');
        if (!request) {
            return NextResponse.json({ message: 'Solicitud no encontrada.' }, { status: 404 });
        }
        return NextResponse.json({ item: request });
    } catch (error) {
        console.error('Error fetching request by ID:', error);
        return NextResponse.json({ message: 'Error al cargar la solicitud.' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const { status } = await req.json();
        const updatedRequest = await AdoptionRequest.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        ).populate('pet');

        if (!updatedRequest) {
            return NextResponse.json({ message: 'Solicitud no encontrada.' }, { status: 404 });
        }

        if (status === 'aprobada') {
            await Pet.findByIdAndUpdate(updatedRequest.pet._id, { status: 'adoptado' });
        }

        return NextResponse.json({ item: updatedRequest });
    } catch (error) {
        console.error('Error updating request status:', error);
        return NextResponse.json({ message: 'Error al actualizar la solicitud.' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await dbConnect();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const deletedRequest = await AdoptionRequest.findByIdAndDelete(params.id);
        if (!deletedRequest) {
            return NextResponse.json({ message: 'Solicitud no encontrada.' }, { status: 404 });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting request:', error);
        return NextResponse.json({ message: 'Error al eliminar la solicitud.' }, { status: 500 });
    }
}