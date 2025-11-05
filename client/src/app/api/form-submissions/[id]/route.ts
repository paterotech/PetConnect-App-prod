import { NextResponse, NextRequest } from 'next/server';
import { AdopterFormSubmission } from '@/lib/models/AdopterFormSubmission';
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

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    await connectDB();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const submission = await AdopterFormSubmission.findById((await context.params).id)
            .populate('user', 'name email');
        if (!submission) {
            return NextResponse.json({ message: 'Entrada de formulario no encontrada' }, { status: 404 });
        }
        return NextResponse.json({ item: submission });
    } catch (error) {
        console.error('Error fetching form submission by ID:', error);
        return NextResponse.json({ message: 'Error al cargar la entrada del formulario.' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    await connectDB();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const { status } = await req.json();
        const updatedSubmission = await AdopterFormSubmission.findByIdAndUpdate(
            (await context.params).id,
            { status },
            { new: true }
        );
        if (!updatedSubmission) {
            return NextResponse.json({ message: 'Entrada de formulario no encontrada' }, { status: 404 });
        }
        return NextResponse.json({ item: updatedSubmission });
    } catch (error) {
        console.error('Error updating form submission status:', error);
        return NextResponse.json({ message: 'Error al actualizar el estado de la entrada del formulario.' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    await connectDB();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const deletedSubmission = await AdopterFormSubmission.findByIdAndDelete((await context.params).id);
        if (!deletedSubmission) {
            return NextResponse.json({ message: 'Entrada de formulario no encontrada' }, { status: 404 });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting form submission:', error);
        return NextResponse.json({ message: 'Error al eliminar la entrada del formulario.' }, { status: 500 });
    }
}