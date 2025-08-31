import { NextRequest, NextResponse } from "next/server";
import { createBookingEvent } from "@/lib/google-calendar/availability";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const requestId = Math.random().toString(36).substring(7);
    console.log(
      `[CALENDAR BOOKING:${requestId}] Creating calendar event for booking`
    );

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get booking details from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        booking_token,
        preferred_date,
        preferred_time,
        location_type,
        owner_first_name,
        owner_last_name,
        owner_email,
        contact_phone,
        contact_area_code,
        dog_first_name,
        dog_last_name,
        dog_name,
        calendar_event_id,
        booking_status
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error(
        `[CALENDAR BOOKING:${requestId}] Booking not found:`,
        bookingError
      );
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if booking is confirmed
    if (booking.booking_status !== "confirmed") {
      console.log(
        `[CALENDAR BOOKING:${requestId}] Booking ${booking.booking_token} not confirmed yet, skipping calendar event creation`
      );
      return NextResponse.json({
        success: true,
        message: "Booking not confirmed yet, calendar event not created",
        bookingStatus: booking.booking_status,
      });
    }

    // Check if calendar event already exists
    if (booking.calendar_event_id) {
      console.log(
        `[CALENDAR BOOKING:${requestId}] Calendar event already exists: ${booking.calendar_event_id}`
      );
      return NextResponse.json({
        success: true,
        eventId: booking.calendar_event_id,
        message: "Calendar event already exists",
      });
    }

    // Check required fields
    if (!booking.preferred_date || !booking.preferred_time) {
      console.error(
        `[CALENDAR BOOKING:${requestId}] Missing date/time for booking ${booking.booking_token}`
      );
      return NextResponse.json(
        { error: "Booking missing required date/time information" },
        { status: 400 }
      );
    }

    // Prepare booking data for calendar event
    const ownerName =
      booking.owner_first_name && booking.owner_last_name
        ? `${booking.owner_first_name} ${booking.owner_last_name}`.trim()
        : "Unknown Owner";

    const dogName =
      booking.dog_first_name && booking.dog_last_name
        ? `${booking.dog_first_name} ${booking.dog_last_name}`.trim()
        : booking.dog_name || "Unknown Dog";

    const ownerPhone =
      booking.contact_phone && booking.contact_area_code
        ? `${booking.contact_area_code}-${booking.contact_phone}`
        : booking.contact_phone || undefined;

    const bookingData = {
      bookingId: booking.id,
      bookingToken: booking.booking_token || booking.id,
      ownerName,
      dogName,
      locationType: booking.location_type === "home" ? "home" : "park",
      ownerEmail: booking.owner_email || undefined,
      ownerPhone,
    };

    console.log(
      `[CALENDAR BOOKING:${requestId}] Creating calendar event for ${bookingData.bookingToken} on ${booking.preferred_date} at ${booking.preferred_time}`
    );

    // Create calendar event
    const calendarResult = await createBookingEvent(
      booking.preferred_date,
      booking.preferred_time,

      // @ts-ignore
      bookingData
    );

    if (!calendarResult.success) {
      console.error(
        `[CALENDAR BOOKING:${requestId}] Failed to create calendar event:`,
        calendarResult.error
      );
      return NextResponse.json(
        {
          error: "Failed to create calendar event",
          details: calendarResult.error,
        },
        { status: 500 }
      );
    }

    // Update booking with calendar event ID
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ calendar_event_id: calendarResult.eventId })
      .eq("id", bookingId);

    if (updateError) {
      console.error(
        `[CALENDAR BOOKING:${requestId}] Failed to update booking with event ID:`,
        updateError
      );
      // Calendar event was created but we couldn't update the booking
      // This is not critical, but we should log it
    }

    console.log(
      `[CALENDAR BOOKING:${requestId}] Calendar event created successfully: ${calendarResult.eventId}`
    );

    return NextResponse.json({
      success: true,
      eventId: calendarResult.eventId,
      bookingToken: booking.booking_token,
      date: booking.preferred_date,
      time: booking.preferred_time,
    });
  } catch (error) {
    console.error("Error creating booking calendar event:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
