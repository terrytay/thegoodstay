import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '2024-09-02';
    const time = searchParams.get('time') || '14:00';

    // New approach: Use ISO strings with timezone offset
    const slotStart = `${date}T${time}:00+08:00`;
    const [hour, minute] = time.split(':').map(Number);
    const endHour = hour + 1;
    const slotEnd = `${date}T${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00+08:00`;
    
    // Day boundaries
    const dayStart = `${date}T00:00:00+08:00`;
    const dayEnd = `${date}T23:59:59+08:00`;
    
    // Convert to Date objects to see how they're interpreted
    const slotStartDate = new Date(slotStart);
    const slotEndDate = new Date(slotEnd);
    const dayStartDate = new Date(dayStart);
    const dayEndDate = new Date(dayEnd);

    return NextResponse.json({
      input: {
        date,
        time,
        timezone: 'Singapore (UTC+8)'
      },
      newApproach: {
        slotStart: {
          isoString: slotStart,
          parsedDate: slotStartDate.toISOString(),
          localDisplay: slotStartDate.toLocaleDateString() + ' ' + slotStartDate.toLocaleTimeString()
        },
        slotEnd: {
          isoString: slotEnd,
          parsedDate: slotEndDate.toISOString(),
          localDisplay: slotEndDate.toLocaleDateString() + ' ' + slotEndDate.toLocaleTimeString()
        },
        dayBoundaries: {
          start: {
            isoString: dayStart,
            parsedDate: dayStartDate.toISOString()
          },
          end: {
            isoString: dayEnd,
            parsedDate: dayEndDate.toISOString()
          }
        }
      },
      validation: {
        dateMatches: dayStartDate.getUTCDate() === parseInt(date.split('-')[2]),
        timeMatches: slotStartDate.getUTCHours() === (hour - 8), // Should be 8 hours behind in UTC
        timezoneHandling: 'Using explicit +08:00 timezone offset in ISO strings'
      }
    });

  } catch (error) {
    console.error('Error in timezone debug:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to debug timezone conversion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}