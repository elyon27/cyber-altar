import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ error: 'Please offer prayers through the Holy Place after verifying your email.' }, { status: 410 });
}
