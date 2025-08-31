import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTimeSlotsForDate } from '@/lib/google-calendar/availability';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
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

    const slots = await getAvailableTimeSlotsForDate(date);

    return NextResponse.json({
      date,
      slots,
      availableCount: slots.filter(slot => slot.available).length,
      totalSlots: slots.length,
    });

  } catch (error) {
    console.error('Error getting available slots:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get available slots',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}