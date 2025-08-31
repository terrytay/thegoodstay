import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "Booking token is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch booking by token
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_token,
        owner_first_name,
        owner_last_name,
        owner_email,
        dog_name,
        dog_breed,
        dog_age,
        preferred_date,
        preferred_time,
        location_type,
        payment_required,
        payment_amount,
        created_at,
        contact_area_code,
        contact_phone,
        address_street1,
        address_city,
        address_postal_code
      `)
      .eq("booking_token", token)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error in booking API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}