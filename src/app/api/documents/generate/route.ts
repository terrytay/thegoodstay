import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DocumentGenerator } from "@/lib/document-generator";

export async function POST(request: NextRequest) {
  try {
    const { bookingId, documentType, accessToken } = await request.json();

    if (!bookingId || !documentType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Verify access token if provided
    if (accessToken) {
      const { data: tokenData, error: tokenError } = await supabase
        .from("booking_access_tokens")
        .select("booking_id, is_active, expires_at")
        .eq("access_token", accessToken)
        .eq("is_active", true)
        .single();

      if (tokenError || !tokenData || tokenData.booking_id !== bookingId) {
        return NextResponse.json(
          { error: "Invalid or expired access token" },
          { status: 403 }
        );
      }

      // Check if token is expired
      if (tokenData.expires_at && new Date() > new Date(tokenData.expires_at)) {
        return NextResponse.json(
          { error: "Access token has expired" },
          { status: 403 }
        );
      }

      // Update last accessed
      await supabase
        .from("booking_access_tokens")
        .update({
          last_accessed_at: new Date().toISOString(),
          access_count: supabase.sql`access_count + 1`,
        })
        .eq("access_token", accessToken);
    }

    // Get booking data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let documentBuffer: Uint8Array;
    let fileName: string;

    switch (documentType) {
      case "confirmation": {
        // Get signature data if available
        const { data: signature } = await supabase
          .from("digital_signatures")
          .select("signature_data, signed_at")
          .eq("booking_id", bookingId)
          .single();

        documentBuffer = await DocumentGenerator.generateBookingConfirmation(
          booking,
          signature || undefined
        );
        fileName = `booking-confirmation-${booking.booking_token}.pdf`;
        break;
      }

      case "invoice": {
        // Get payment data
        const { data: payment, error: paymentError } = await supabase
          .from("payment_records")
          .select("*")
          .eq("booking_id", bookingId)
          .eq("status", "completed")
          .single();

        if (paymentError || !payment) {
          return NextResponse.json(
            { error: "No completed payment found for this booking" },
            { status: 404 }
          );
        }

        const paymentData = {
          amount: payment.amount,
          currency: payment.currency || "sgd",
          paid_at: payment.paid_at || payment.created_at,
          payment_method: payment.payment_method,
          stripe_payment_intent_id: payment.stripe_payment_intent_id,
          invoice_number:
            payment.invoice_number ||
            `INV-${booking.booking_token}-${new Date().getFullYear()}`,
        };

        documentBuffer = await DocumentGenerator.generateInvoice(
          booking,
          paymentData
        );
        fileName = `invoice-${booking.booking_token}.pdf`;
        break;
      }

      case "agreement": {
        // Get signature data (required for agreement)
        const { data: signature, error: signatureError } = await supabase
          .from("digital_signatures")
          .select("signature_data, signed_at")
          .eq("booking_id", bookingId)
          .single();

        if (signatureError || !signature) {
          return NextResponse.json(
            { error: "No signature found for this booking" },
            { status: 404 }
          );
        }

        documentBuffer = await DocumentGenerator.generateTermsDocument(
          booking,
          signature
        );
        fileName = `terms-agreement-${booking.booking_token}.pdf`;
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid document type" },
          { status: 400 }
        );
    }

    // Store document record if it doesn't exist
    const { data: existingDoc } = await supabase
      .from("booking_documents")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("document_type", documentType)
      .single();

    if (!existingDoc) {
      await supabase.from("booking_documents").insert({
        booking_id: bookingId,
        document_type: documentType,
        file_name: fileName,
        mime_type: "application/pdf",
        file_size: documentBuffer.length,
        document_data: {
          generated_at: new Date().toISOString(),
          file_name: fileName,
        },
        is_generated: true,
        generated_at: new Date().toISOString(),
      });
    }

    // Return PDF as response
    return new NextResponse(documentBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": documentBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
      { status: 500 }
    );
  }
}

// GET method to retrieve existing documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const documentType = searchParams.get("documentType");
    const accessToken = searchParams.get("token");

    if (!bookingId || !documentType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Forward to POST method for document generation
    return POST(request);
  } catch (error) {
    console.error("Error in GET documents:", error);
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 }
    );
  }
}
