import { NextRequest, NextResponse } from 'next/server';
import { checkAvailability } from '@/lib/google-calendar/availability';

export async function POST(request: NextRequest) {
  try {
    const { date, time } = await request.json();

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM' },
        { status: 400 }
      );
    }

    const isAvailable = await checkAvailability(date, time);

    return NextResponse.json({
      available: isAvailable,
      date,
      time,
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Date and time parameters are required' },
        { status: 400 }
      );
    }

    const isAvailable = await checkAvailability(date, time);

    return NextResponse.json({
      available: isAvailable,
      date,
      time,
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}