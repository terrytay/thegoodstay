import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface BookingEmailData {
  bookingId: string;
  ownerName: string;
  ownerEmail: string;
  dogName: string;
  preferredDate: string;
  preferredTime: string;
  locationType: string;
  paymentAmount?: number;
  signatureData?: string;
}

export async function sendBookingConfirmationEmail(
  bookingData: BookingEmailData,
  attachments: EmailAttachment[] = []
) {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"The Good Stay" <${process.env.SMTP_FROM_EMAIL}>`,
    to: bookingData.ownerEmail,
    subject: `Booking Confirmation - Assessment for ${bookingData.dogName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">The Good Stay</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Booking Confirmation</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Dear ${
            bookingData.ownerName
          },</h2>
          
          <p style="color: #374151; line-height: 1.6;">
            Thank you for booking an assessment for <strong>${
              bookingData.dogName
            }</strong>. 
            We have received your booking request and will be in touch soon to confirm the details.
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #1f2937; margin-top: 0;">Booking Details</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Booking ID:</strong> ${
              bookingData.bookingId
            }</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Dog:</strong> ${
              bookingData.dogName
            }</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Preferred Date:</strong> ${
              bookingData.preferredDate
            }</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Preferred Time:</strong> ${
              bookingData.preferredTime
            }</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Location:</strong> ${
              bookingData.locationType === "home"
                ? "Home Visit"
                : "Facility Visit"
            }</p>
            ${
              bookingData.paymentAmount
                ? `<p style="margin: 8px 0; color: #374151;"><strong>Home Visit Fee:</strong> $${bookingData.paymentAmount}</p>`
                : ""
            }
          </div>
          
          <p style="color: #374151; line-height: 1.6;">
            Please find attached:
          </p>
          <ul style="color: #374151; line-height: 1.6;">
            <li>Copy of your completed assessment form</li>
            <li>Terms & Conditions agreement with your digital signature</li>
            ${
              bookingData.paymentAmount
                ? "<li>Invoice for home visit fee</li>"
                : ""
            }
          </ul>
          
          <p style="color: #374151; line-height: 1.6;">
            We will contact you within 24 hours to confirm your appointment time and provide any additional details.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, please don't hesitate to contact me.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>© 2025 The Good Stay. All rights reserved.</p>
        </div>
      </div>
    `,
    attachments: attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return { success: false, error: error };
  }
}

export async function testEmailConnection() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("SMTP connection verified successfully");
    return { success: true };
  } catch (error) {
    console.error("SMTP connection failed:", error);
    return { success: false, error: error };
  }
}
