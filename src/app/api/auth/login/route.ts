import { NextRequest, NextResponse } from 'next/server';
import { authenticationService } from '@/services/auth.service';
import { LoginRequestSchema } from '@/types/auth.dto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = LoginRequestSchema.parse(body);

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const result = await authenticationService.login(validatedData, ipAddress);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Authentication failed',
      },
      { status: 401 }
    );
  }
}