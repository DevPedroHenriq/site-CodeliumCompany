import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, telefone, especialidade } = body;

    if (!nome || !email || !telefone || !especialidade) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    const lead = await db.lead.create({
      data: { nome, email, telefone, especialidade },
    });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o pedido.' },
      { status: 500 }
    );
  }
}
