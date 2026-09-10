import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: session,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        user: null,
      },
      { status: 500 }
    );
  }
}