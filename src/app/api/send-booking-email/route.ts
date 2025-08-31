import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmationEmail, EmailAttachment } from '@/lib/email/nodemailer';
import { 
  generateBookingFormPDF, 
  generateTermsAndConditionsPDF, 
  generateInvoicePDF,
  BookingFormData 
} from '@/lib/email/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const { bookingData, bookingId } = await request.json();

    if (!bookingData || !bookingId) {
      return NextResponse.json(
        { error: 'Missing booking data or booking ID' },
        { status: 400 }
      );
    }

    // Prepare attachments array
    const attachments: EmailAttachment[] = [];

    // Generate booking form PDF
    const formPDF = generateBookingFormPDF(bookingData, bookingId);
    attachments.push({
      filename: `booking-form-${bookingId}.pdf`,
      content: formPDF,
      contentType: 'application/pdf'
    });

    // Generate Terms & Conditions PDF with signature
    const termsAndConditionsPDF = generateTermsAndConditionsPDF(
      `${bookingData.ownerFirstName} ${bookingData.ownerLastName}`,
      `${bookingData.dogFirstName} ${bookingData.dogLastName}`,
      bookingId,
      bookingData.signatureData
    );
    attachments.push({
      filename: `terms-and-conditions-${bookingId}.pdf`,
      content: termsAndConditionsPDF,
      contentType: 'application/pdf'
    });

    // Generate invoice PDF if home visit (payment required)
    if (bookingData.locationType === 'home') {
      const invoicePDF = generateInvoicePDF(
        `${bookingData.ownerFirstName} ${bookingData.ownerLastName}`,
        bookingData.ownerEmail,
        `${bookingData.dogFirstName} ${bookingData.dogLastName}`,
        bookingId,
        25.0, // Home visit fee
        bookingData.preferredDate,
        bookingData.preferredTime
      );
      attachments.push({
        filename: `invoice-${bookingId}.pdf`,
        content: invoicePDF,
        contentType: 'application/pdf'
      });
    }

    // Prepare email data
    const emailData = {
      bookingId,
      ownerName: `${bookingData.ownerFirstName} ${bookingData.ownerLastName}`,
      ownerEmail: bookingData.ownerEmail,
      dogName: `${bookingData.dogFirstName} ${bookingData.dogLastName}`,
      preferredDate: bookingData.preferredDate,
      preferredTime: bookingData.preferredTime,
      locationType: bookingData.locationType,
      paymentAmount: bookingData.locationType === 'home' ? 25.0 : undefined,
      signatureData: bookingData.signatureData
    };

    // Send email with all attachments
    const emailResult = await sendBookingConfirmationEmail(emailData, attachments);

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Booking confirmation email sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: emailResult.error 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in send-booking-email API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}