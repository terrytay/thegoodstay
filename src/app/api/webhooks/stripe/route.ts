import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
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
  BookingFormData,
} from "@/lib/email/pdf-generator";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[STRIPE WEBHOOK:${requestId}] Received webhook call`);

  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;
  console.log(
    `[STRIPE WEBHOOK:${requestId}] Signature: ${
      signature ? "Present" : "Missing"
    }`
  );
  console.log(
    `[STRIPE WEBHOOK:${requestId}] Request size: ${body.length} bytes`
  );

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    console.log(
      `[STRIPE WEBHOOK:${requestId}] Event verified: ${event.type} - ${event.id}`
    );
  } catch (err) {
    console.error(
      `[STRIPE WEBHOOK:${requestId}] Signature verification failed:`,
      err
    );
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Use service role for webhook operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    console.log(
      `[STRIPE WEBHOOK:${requestId}] Processing event type: ${event.type}`
    );
    switch (event.type) {
      case "checkout.session.completed": {
        console.log(
          `[STRIPE WEBHOOK:${requestId}] Processing checkout.session.completed`
        );
        const session = event.data.object as Stripe.Checkout.Session;

        console.log(`[STRIPE WEBHOOK:${requestId}] Session details:`, {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
          customerEmail: session.customer_details?.email,
          hasBookingId: !!session.metadata?.bookingId,
          hasOrderData: !!session.metadata?.orderData,
        });

        if (session.payment_status === "paid") {
          // Handle assessment booking payments
          if (session.metadata?.bookingId) {
            console.log(
              `[STRIPE WEBHOOK:${requestId}] Processing assessment payment for booking: ${session.metadata.bookingId}`
            );
            await handleAssessmentPayment(session, supabase, requestId);
          }
          // Update order status to paid
          else if (session.metadata?.orderData) {
            const orderData = JSON.parse(session.metadata.orderData);

            // Create order in database if not already created (check by session_id for better uniqueness)
            const { data: existingOrder } = await supabase
              .from("orders")
              .select("id")
              .eq("stripe_session_id", session.id)
              .single();

            if (!existingOrder) {
              console.log(`Creating new order for session: ${session.id}`);

              // Debug: Log all Stripe amounts in cents first
              console.log(
                `Stripe raw amounts (cents) - amount_total: ${session.amount_total}, amount_subtotal: ${session.amount_subtotal}`
              );
              console.log(`Stripe total_details:`, session.total_details);

              // Calculate amounts from Stripe data using precise decimal arithmetic
              const subtotalCents = session.amount_subtotal || 0;
              const taxCents = session.total_details?.amount_tax || 0;
              const shippingCents = session.total_details?.amount_shipping || 0;
              const totalCents = session.amount_total || 0;

              // Convert to dollars using string to avoid floating point errors
              const subtotalAmount = parseFloat(
                (subtotalCents / 100).toFixed(2)
              );
              const taxAmount = parseFloat((taxCents / 100).toFixed(2));
              const shippingAmount = parseFloat(
                (shippingCents / 100).toFixed(2)
              );
              const stripeTotal = parseFloat((totalCents / 100).toFixed(2));

              // If no tax or shipping, use subtotal as total. Otherwise use Stripe's amount_total
              const totalAmount =
                taxAmount === 0 && shippingAmount === 0
                  ? subtotalAmount
                  : stripeTotal;

              console.log(
                `Order amounts (from cents) - Subtotal: ${subtotalCents}¢ = $${subtotalAmount}, Tax: ${taxCents}¢ = $${taxAmount}, Shipping: ${shippingCents}¢ = $${shippingAmount}`
              );
              console.log(
                `Stripe Total: ${totalCents}¢ = $${stripeTotal}, Using: $${totalAmount}`
              );
              console.log(
                `Exact values being inserted - total_amount: ${totalAmount}, subtotal: ${subtotalAmount}`
              );

              const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
                  stripe_payment_intent_id: session.payment_intent as string,
                  stripe_session_id: session.id,
                  customer_name: session.customer_details?.name || null,
                  customer_email: session.customer_details?.email || null,
                  total_amount: totalAmount,
                  subtotal: subtotalAmount,
                  tax_amount: taxAmount,
                  shipping_amount: shippingAmount,
                  status: "paid",
                  payment_method: "stripe",
                  items: orderData.items || [],
                  shipping_address: orderData.shippingAddress,
                  user_id: null, // Anonymous order
                })
                .select()
                .single();

              if (orderError) {
                console.error("Error creating order:", orderError);
                break;
              }

              console.log(
                `Order created successfully: ${order.id} for session: ${session.id}`
              );
              console.log(`Database record created:`, {
                id: order.id,
                total_amount: order.total_amount,
                subtotal: order.subtotal,
                tax_amount: order.tax_amount,
                shipping_amount: order.shipping_amount,
              });

              // Insert order items
              if (order && orderData.items) {
                const orderItems = orderData.items.map(
                  (item: { id: string; quantity: number; price: number }) => ({
                    order_id: order.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                  })
                );

                const { error: itemsError } = await supabase
                  .from("order_items")
                  .insert(orderItems);

                if (itemsError) {
                  console.error("Error creating order items:", itemsError);
                }
              }

              // Create order snapshot for data integrity
              if (order) {
                try {
                  // Call the Supabase function to create snapshot
                  const { error: snapshotError } = await supabase.rpc(
                    "create_order_snapshot",
                    {
                      order_id: order.id,
                    }
                  );

                  if (snapshotError) {
                    console.error(
                      "Failed to create order snapshot:",
                      snapshotError
                    );
                  } else {
                    console.log("Order snapshot created for order:", order.id);
                  }
                } catch (snapshotError) {
                  console.error(
                    "Failed to create order snapshot:",
                    snapshotError
                  );
                  // Don't fail the entire order if snapshot creation fails
                }
              }
            } else {
              console.log(`Order already exists for session: ${session.id}`);
            }
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update order status
        await supabase
          .from("orders")
          .update({ status: "processing" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update order status
        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        console.log(`PaymentIntent failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error handling webhook event:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// Handler for assessment booking payments
async function handleAssessmentPayment(
  session: Stripe.Checkout.Session,
  supabase: any,
  requestId: string
) {
  try {
    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      console.error("No booking ID in session metadata");
      return;
    }

    console.log(
      `[ASSESSMENT PAYMENT:${requestId}] Processing payment for booking ${bookingId}`
    );

    // Update payment record
    const { error: paymentUpdateError } = await supabase
      .from("payment_records")
      .update({
        stripe_payment_intent_id: session.payment_intent,
        status: "completed",
        payment_method: session.payment_method_types?.[0],
        paid_at: new Date().toISOString(),
        metadata: {
          ...session.metadata,
          sessionCompleted: new Date().toISOString(),
          customerDetails: session.customer_details,
        },
      })
      .eq("stripe_session_id", session.id);

    if (paymentUpdateError) {
      console.error("Error updating payment record:", paymentUpdateError);
    }

    // Update booking status
    const { error: bookingUpdateError } = await supabase
      .from("bookings")
      .update({
        booking_status: "confirmed",
        total_paid: session.amount_total! / 100, // Convert from cents
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (bookingUpdateError) {
      console.error("Error updating booking:", bookingUpdateError);
    }

    // Send confirmation email with all documents
    await sendBookingConfirmationEmailFromWebhook(
      bookingId,
      session,
      supabase,
      requestId
    );

    console.log(
      `[ASSESSMENT PAYMENT:${requestId}] Payment processing completed for booking ${bookingId}`
    );
  } catch (error) {
    console.error("Error handling assessment payment:", error);
  }
}

// Send booking confirmation email with all documents after payment
async function sendBookingConfirmationEmailFromWebhook(
  bookingId: string,
  session: Stripe.Checkout.Session,
  supabase: any,
  requestId: string
) {
  try {
    // Get booking details with all necessary fields including email status
    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (!booking) {
      console.error("Booking not found for email sending");
      return;
    }

    // Check if email was already sent (prevent duplicates)
    if (booking.confirmation_email_sent) {
      console.log(
        `[ASSESSMENT PAYMENT:${requestId}] Email already sent for booking ${bookingId}, skipping duplicate`
      );
      return;
    }

    console.log(
      `[ASSESSMENT PAYMENT:${requestId}] Preparing to send confirmation email for booking ${bookingId}`
    );

    // Increment email send attempts
    const attemptNumber = (booking.email_send_attempts || 0) + 1;

    // Prepare booking data for email API
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

    // Generate and send email with PDFs directly
    try {
      // Prepare attachments array
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

      // Generate invoice PDF for home visit (payment required)
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
          25.0, // Home visit fee
          bookingData.preferredDate,
          bookingData.preferredTime
        );
        attachments.push({
          filename: `invoice-${bookingId}.pdf`,
          content: invoicePDF,
          contentType: "application/pdf",
        });
      }

      // Prepare booking data for email
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

      // Send the email with all attachments
      const emailResult = await sendBookingConfirmationEmail(
        emailBookingData,
        attachments
      );

      if (emailResult.success) {
        // Email sent successfully - update booking with success status
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
          `[ASSESSMENT PAYMENT:${requestId}] Confirmation email sent successfully for booking ${bookingId}`
        );
      } else {
        // Email failed - update booking with failure status
        await supabase
          .from("bookings")
          .update({
            confirmation_email_sent: false,
            email_send_attempts: attemptNumber,
            last_email_error: "Email sending failed",
          })
          .eq("id", bookingId);

        console.error(
          `[ASSESSMENT PAYMENT:${requestId}] Failed to send email for booking ${bookingId}:`,
          emailResult.error
        );
      }
    } catch (emailError) {
      // Email generation/sending error - update booking with error status
      await supabase
        .from("bookings")
        .update({
          confirmation_email_sent: false,
          email_send_attempts: attemptNumber,
          last_email_error:
            emailError instanceof Error
              ? emailError.message
              : "Email processing error",
        })
        .eq("id", bookingId);

      console.error(
        `[ASSESSMENT PAYMENT:${requestId}] Error generating/sending email for booking ${bookingId}:`,
        emailError
      );
    }
  } catch (error) {
    console.error(
      "Error sending booking confirmation email from webhook:",
      error
    );
  }
}
