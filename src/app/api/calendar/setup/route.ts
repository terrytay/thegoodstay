import { NextResponse } from 'next/server';
import { ensureCalendarAccess } from '@/lib/google-calendar/availability';

export async function POST() {
  try {
    const result = await ensureCalendarAccess();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Calendar access verified and configured successfully',
        calendarId: process.env.GOOGLE_CALENDAR_ID,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          instructions: [
            '1. Share your Google Calendar with your service account email',
            '2. Set permission to "Make changes and manage sharing"',
            '3. Wait 2-3 minutes for Google to propagate the changes',
            '4. Try this endpoint again'
          ]
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error setting up calendar access:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to setup calendar access',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}