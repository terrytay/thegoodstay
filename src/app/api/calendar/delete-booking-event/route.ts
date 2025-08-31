import { NextRequest, NextResponse } from 'next/server';
import { deleteBookingEventsByBookingId } from '@/lib/google-calendar/availability';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[CALENDAR DELETE:${requestId}] Deleting calendar event for booking`);

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking details from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_token,
        calendar_event_id
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error(`[CALENDAR DELETE:${requestId}] Booking not found:`, bookingError);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log(`[CALENDAR DELETE:${requestId}] Deleting calendar events for booking ${booking.booking_token || bookingId}`);

    // Delete calendar events by booking ID (this will find events even if calendar_event_id is not set)
    const deleteResult = await deleteBookingEventsByBookingId(bookingId);

    if (!deleteResult.success) {
      console.error(`[CALENDAR DELETE:${requestId}] Failed to delete calendar events:`, deleteResult.error);
      return NextResponse.json(
        { 
          error: 'Failed to delete calendar events', 
          details: deleteResult.error 
        },
        { status: 500 }
      );
    }

    // Clear calendar_event_id from booking record
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ calendar_event_id: null })
      .eq('id', bookingId);

    if (updateError) {
      console.error(`[CALENDAR DELETE:${requestId}] Failed to clear calendar_event_id:`, updateError);
      // Not critical, but we should log it
    }

    console.log(`[CALENDAR DELETE:${requestId}] Deleted ${deleteResult.deletedCount} calendar events for booking ${booking.booking_token || bookingId}`);

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.deletedCount,
      bookingToken: booking.booking_token || bookingId,
    });

  } catch (error) {
    console.error('Error deleting booking calendar events:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}