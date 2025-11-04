import { NextResponse } from 'next/server';
import { FollowUp, IFollowUp } from '@/lib/models/FollowUp';
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const followUp = await FollowUp.findById(params.id).populate({
            path: 'adoptionRequest',
            populate: {
                path: 'pet'
            }
        });
        if (!followUp) {
            return NextResponse.json({ msg: 'Seguimiento no encontrado' }, { status: 404 });
        }
        return NextResponse.json(followUp);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const { mood, health, weight, notes, status, visitDate } = await req.json();
        
        const fieldsToUpdate: Partial<IFollowUp> = {};
        if (mood) fieldsToUpdate.mood = mood;
        if (health) fieldsToUpdate.health = health;
        if (weight) fieldsToUpdate.weight = weight;
        if (notes) fieldsToUpdate.notes = notes;
        if (status) fieldsToUpdate.status = status;
        if (visitDate) fieldsToUpdate.visitDate = visitDate;

        const followUp = await FollowUp.findByIdAndUpdate(
            params.id,
            { $set: fieldsToUpdate },
            { new: true }
        );

        if (!followUp) {
            return NextResponse.json({ msg: 'Seguimiento no encontrado' }, { status: 404 });
        }

        return NextResponse.json(followUp);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const adminError = await adminMiddleware(req);
    if (adminError) {
        return adminError;
    }

    try {
        const followUp = await FollowUp.findById(params.id);
        if (!followUp) {
            return NextResponse.json({ msg: 'Seguimiento no encontrado' }, { status: 404 });
        }

        await FollowUp.findByIdAndDelete(params.id);

        return NextResponse.json({ msg: 'Seguimiento eliminado' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: 'Error del servidor' }, { status: 500 });
    }
}