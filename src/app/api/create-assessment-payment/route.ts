import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount, customerInfo } = await request.json();

    console.log("Payment request received:", {
      bookingId,
      amount,
      customerInfo: customerInfo?.name,
    });

    // Ensure URL has proper scheme
    const validatedBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!bookingId || !amount || !customerInfo) {
      console.log("Missing required fields:", {
        bookingId: !!bookingId,
        amount: !!amount,
        customerInfo: !!customerInfo,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify booking exists and needs payment
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, booking_token, payment_required, payment_amount")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.log("Booking lookup error:", bookingError);
      console.log("Booking found:", !!booking);
      return NextResponse.json(
        { error: "Booking not found", details: bookingError?.message },
        { status: 404 }
      );
    }

    console.log("Booking details:", {
      id: booking.id,
      payment_required: booking.payment_required,
      payment_amount: booking.payment_amount,
    });

    if (!booking.payment_required) {
      console.log("Payment not required for booking:", booking.id);
      return NextResponse.json(
        { error: "Payment not required for this booking" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    console.log("Creating Stripe session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerInfo.email,
      line_items: [
        {
          price_data: {
            currency: "sgd",
            product_data: {
              name: "Dog Assessment - Home Visit",
              description: "Professional dog assessment at your location",
              images: [],
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone || "",
        customerAddress: customerInfo.address || "",
      },
      success_url: `${validatedBaseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${validatedBaseUrl}/booking-cancelled?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: {
        enabled: true,
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
    });

    console.log("Stripe session created:", session.id);

    // Store payment record
    console.log("Storing payment record...");
    const { error: paymentError } = await supabase
      .from("payment_records")
      .insert({
        booking_id: bookingId,
        stripe_session_id: session.id,
        amount,
        currency: "sgd",
        status: "pending",
        metadata: {
          customer: customerInfo,
          sessionCreated: new Date().toISOString(),
        },
      });

    if (paymentError) {
      console.error("Error storing payment record:", paymentError);
      // Continue anyway - payment can be tracked via webhook
    }

    console.log("Payment session creation successful");
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    console.error("Full error details:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
