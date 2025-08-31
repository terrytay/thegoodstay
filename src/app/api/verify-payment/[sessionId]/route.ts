import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import {
  sendBookingConfirmationEmail,
  EmailAttachment,
  BookingEmailData,
} from "@/lib/email/nodemailer";
import {
  generateBookingFormPDF,
  generateTermsAndConditionsPDF,
  generateInvoicePDF,
} from "@/lib/email/pdf-generator";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Verify the payment session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid payment session" },
        { status: 404 }
      );
    }

    // Get booking ID from session metadata
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      return NextResponse.json(
        { error: "No booking associated with this payment" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch booking details including email tracking fields
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      console.error("Error fetching booking:", error);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if payment was successful
    const paymentVerified = session.payment_status === "paid";

    // BACKUP EMAIL MECHANISM: If webhook failed, trigger email from here
    if (paymentVerified && !booking.confirmation_email_sent) {
      console.log(
        `[VERIFY PAYMENT] Payment verified but email not sent via webhook. Triggering backup email for booking ${bookingId}`
      );

      // Trigger backup email sending (don't await to avoid blocking user response)
      sendBackupConfirmationEmail(bookingId, booking, supabase).catch(
        (error) => {
          console.error(
            `[VERIFY PAYMENT] Backup email failed for booking ${bookingId}:`,
            error
          );
        }
      );

      // Also update booking status to confirmed if webhook missed it
      if (booking.booking_status !== "confirmed") {
        await supabase
          .from("bookings")
          .update({
            booking_status: "confirmed",
            total_paid: session.amount_total! / 100,
            updated_at: new Date().toISOString(),
          })
          .eq("id", bookingId);
      }
    }

    return NextResponse.json({
      booking: {
        ...booking,
        // Include email status for frontend
        confirmation_email_sent: booking.confirmation_email_sent,
        confirmation_email_sent_at: booking.confirmation_email_sent_at,
        email_send_attempts: booking.email_send_attempts,
      },
      paymentVerified,
      sessionStatus: session.payment_status,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error in payment verification API:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}

// Backup email sending function (when webhook fails)
async function sendBackupConfirmationEmail(
  bookingId: string,
  booking: any,
  supabase: any
) {
  try {
    console.log(
      `[BACKUP EMAIL] Sending confirmation email for booking ${bookingId}`
    );

    // Increment email send attempts
    const attemptNumber = (booking.email_send_attempts || 0) + 1;

    // Prepare booking data for email
    const bookingData = {
      ownerFirstName: booking.owner_first_name,
      ownerLastName: booking.owner_last_name,
      ownerEmail: booking.owner_email,
      contactAreaCode: booking.contact_area_code,
      contactPhone: booking.contact_phone,
      addressStreet1: booking.address_street1,
      addressStreet2: booking.address_street2,
      addressCity: booking.address_city,
      addressState: booking.address_state,
      addressPostal: booking.address_postal,
      instagram: booking.instagram,
      dogFirstName: booking.dog_first_name,
      dogLastName: booking.dog_last_name,
      dogBreed: booking.dog_breed,
      dogAge: booking.dog_age,
      dogGender: booking.dog_gender_neuter,
      reactionToNewPeople: booking.reaction_to_new_people
        ? JSON.parse(booking.reaction_to_new_people)
        : [],
      uncomfortableSituations: booking.uncomfortable_situations,
      reactivityDetails: booking.reactivity_details,
      biteHistory: booking.bite_history,
      sensitiveBodyAreas: booking.sensitive_body_areas,
      aggressionDetails: booking.aggression_details,
      biteSeverity: booking.bite_severity,
      anxietyInNewEnvironments: booking.anxiety_new_environments,
      thunderstormResponse: booking.thunderstorm_response,
      behaviorWhenAlone: booking.behavior_when_alone,
      currentMedicalIssues: booking.current_medical_issues,
      foodAllergies: booking.food_allergies,
      vaccinationStatus: booking.vaccination_status,
      preferredDate: booking.preferred_date,
      preferredTime: booking.preferred_time,
      locationType: booking.location_type,
      termsAccepted: booking.terms_accepted,
      signatureData: booking.signature_data,
    };

    // Generate PDFs
    const attachments: EmailAttachment[] = [];

    // Generate booking form PDF
    const formPDF = generateBookingFormPDF(bookingData, bookingId);
    attachments.push({
      filename: `booking-form-${bookingId}.pdf`,
      content: formPDF,
      contentType: "application/pdf",
    });

    // Generate Terms & Conditions PDF with signature
    const termsAndConditionsPDF = generateTermsAndConditionsPDF(
      `${bookingData.ownerFirstName || ""} ${
        bookingData.ownerLastName || ""
      }`.trim(),
      `${bookingData.dogFirstName || ""} ${
        bookingData.dogLastName || ""
      }`.trim(),
      bookingId,
      bookingData.signatureData
    );
    attachments.push({
      filename: `terms-and-conditions-${bookingId}.pdf`,
      content: termsAndConditionsPDF,
      contentType: "application/pdf",
    });

    // Generate invoice PDF for home visit
    if (bookingData.locationType === "home") {
      const invoicePDF = generateInvoicePDF(
        `${bookingData.ownerFirstName || ""} ${
          bookingData.ownerLastName || ""
        }`.trim(),
        bookingData.ownerEmail,
        `${bookingData.dogFirstName || ""} ${
          bookingData.dogLastName || ""
        }`.trim(),
        bookingId,
        25.0,
        bookingData.preferredDate,
        bookingData.preferredTime
      );
      attachments.push({
        filename: `invoice-${bookingId}.pdf`,
        content: invoicePDF,
        contentType: "application/pdf",
      });
    }

    // Prepare email data
    const emailBookingData: BookingEmailData = {
      bookingId: bookingId,
      ownerName: `${bookingData.ownerFirstName || ""} ${
        bookingData.ownerLastName || ""
      }`.trim(),
      ownerEmail: bookingData.ownerEmail,
      dogName: `${bookingData.dogFirstName || ""} ${
        bookingData.dogLastName || ""
      }`.trim(),
      preferredDate: bookingData.preferredDate,
      preferredTime: bookingData.preferredTime,
      locationType: bookingData.locationType,
      paymentAmount: bookingData.locationType === "home" ? 25.0 : undefined,
    };

    // Send the email
    const emailResult = await sendBookingConfirmationEmail(
      emailBookingData,
      attachments
    );

    if (emailResult.success) {
      // Update booking with success status
      await supabase
        .from("bookings")
        .update({
          confirmation_email_sent: true,
          confirmation_email_sent_at: new Date().toISOString(),
          email_send_attempts: attemptNumber,
          last_email_error: null,
        })
        .eq("id", bookingId);

      console.log(
        `[BACKUP EMAIL] Confirmation email sent successfully for booking ${bookingId}`
      );
    } else {
      // Update booking with failure status
      await supabase
        .from("bookings")
        .update({
          confirmation_email_sent: false,
          email_send_attempts: attemptNumber,
          last_email_error: "Backup email failed",
        })
        .eq("id", bookingId);

      console.error(
        `[BACKUP EMAIL] Failed to send email for booking ${bookingId}:`,
        emailResult.error
      );
    }
  } catch (error) {
    console.error(
      `[BACKUP EMAIL] Error sending backup email for booking ${bookingId}:`,
      error
    );

    // Update booking with error status
    try {
      await supabase
        .from("bookings")
        .update({
          confirmation_email_sent: false,
          email_send_attempts: (booking.email_send_attempts || 0) + 1,
          last_email_error:
            error instanceof Error
              ? error.message
              : "Backup email system error",
        })
        .eq("id", bookingId);
    } catch (updateError) {
      console.error(
        `[BACKUP EMAIL] Failed to update error status for booking ${bookingId}:`,
        updateError
      );
    }
  }
}
