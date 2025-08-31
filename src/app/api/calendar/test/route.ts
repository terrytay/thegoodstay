import { NextResponse } from 'next/server';
import { testCalendarConnection, ensureCalendarAccess } from '@/lib/google-calendar/availability';

export async function GET() {
  try {
    // First ensure calendar access
    const accessResult = await ensureCalendarAccess();
    if (!accessResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: accessResult.error,
          step: 'calendar_access',
          instructions: [
            '1. Share your Google Calendar with your service account email',
            '2. Set permission to "Make changes and manage sharing"', 
            '3. Wait 2-3 minutes and try again'
          ]
        },
        { status: 500 }
      );
    }

    // Then test the connection
    const result = await testCalendarConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Google Calendar connection successful',
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        status: 'ready',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          step: 'connection_test',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error testing calendar connection:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test calendar connection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}