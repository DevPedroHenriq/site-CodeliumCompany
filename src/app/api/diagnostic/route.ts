import { NextResponse } from 'next/server';

export async function GET() {
  const formUrl = process.env.DIAGNOSTIC_FORM_URL;

  if (!formUrl) {
    return NextResponse.json(
      { error: 'Form URL not configured' },
      { status: 500 },
    );
  }

  return NextResponse.redirect(formUrl);
}
