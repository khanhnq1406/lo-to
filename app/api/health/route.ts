/**
 * Health Check Endpoint for Railway
 * Returns server health status for monitoring and deployment verification
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}

export const dynamic = 'force-dynamic';
