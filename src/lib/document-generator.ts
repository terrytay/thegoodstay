import { jsPDF } from "jspdf";

interface BookingData {
  id: string;
  booking_token: string;
  dog_name: string;
  dog_first_name?: string;
  dog_last_name?: string;
  dog_breed: string;
  dog_age?: string; // Changed from number to string
  dog_gender?: string;
  dog_neutered?: boolean;
  owner_name?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  owner_email?: string;
  owner_phone?: string;
  contact_area_code?: string;
  contact_phone?: string;
  owner_address?: string;
  address_street1?: string;
  address_city?: string;
  address_postal?: string;
  instagram?: string;
  preferred_date: string;
  preferred_time: string;
  location_type: "park" | "home";
  home_visit_fee?: number;
  total_paid?: number;
  booking_status: string;
  created_at: string;
  // Behavioral fields
  reaction_to_new_people?: string;
  bite_history?: string;
  vaccination_status?: string;
  special_requirements?: string;
  // Note: assessment_data removed - now use individual fields above
}

interface PaymentData {
  amount: number;
  currency: string;
  paid_at: string;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  invoice_number?: string;
}

interface SignatureData {
  signature_data: string;
  signed_at: string;
}

export class DocumentGenerator {
  private static readonly COMPANY_INFO = {
    name: "The Good Stay",
    address: "Singapore",
    phone: "+65 XXXX XXXX",
    email: "thegoodstaysg@gmail.com",
    website: "https://thegoodstay.vercel.app",
  };

  private static readonly COLORS = {
    primary: "#D97706", // amber-600
    secondary: "#78716c", // stone-500
    text: "#1c1917", // stone-900
    accent: "#f59e0b", // amber-500
  };

  static async generateBookingConfirmation(
    booking: BookingData,
    signature?: SignatureData
  ): Promise<Uint8Array> {
    const doc = new jsPDF();

    // Header
    this.addHeader(doc, "Booking Confirmation");

    let yPosition = 60;

    // Booking Details Section
    doc.setFontSize(16);
    doc.setTextColor(this.COLORS.primary);
    doc.text("Booking Information", 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);

    const bookingDetails = [
      ["Booking Reference:", booking.booking_token],
      ["Dog Name:", booking.dog_name],
      ["Breed:", booking.dog_breed],
      ["Age:", booking.dog_age || "Not specified"],
      ["Assessment Date:", this.formatDate(booking.preferred_date)],
      ["Assessment Time:", booking.preferred_time || "To be confirmed"],
      [
        "Location:",
        booking.location_type === "home"
          ? "Home Visit ($25.00)"
          : "Clementi Woods Park (Free)",
      ],
      ["Status:", this.capitalizeFirst(booking.booking_status)],
    ];

    bookingDetails.forEach(([label, value]) => {
      doc.text(label, 20, yPosition);
      doc.text(value, 80, yPosition);
      yPosition += 8;
    });

    // Owner Information Section
    yPosition += 10;
    doc.setFontSize(16);
    doc.setTextColor(this.COLORS.primary);
    doc.text("Owner Information", 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);

    // Get owner info from individual fields or fallback to combined fields
    const ownerName =
      booking.owner_name ||
      (booking.owner_first_name && booking.owner_last_name
        ? `${booking.owner_first_name} ${booking.owner_last_name}`
        : "");
    const contactPhone = booking.contact_phone || booking.owner_phone || "";
    const addressInfo =
      booking.owner_address ||
      (booking.address_street1 && booking.address_city
        ? `${booking.address_street1}, ${booking.address_city}`
        : "");

    if (ownerName) {
      doc.text("Name:", 20, yPosition);
      doc.text(ownerName, 80, yPosition);
      yPosition += 8;
    }

    if (contactPhone) {
      doc.text("Phone:", 20, yPosition);
      doc.text(contactPhone, 80, yPosition);
      yPosition += 8;
    }

    if (booking.owner_email) {
      doc.text("Email:", 20, yPosition);
      doc.text(booking.owner_email, 80, yPosition);
      yPosition += 8;
    }

    if (addressInfo) {
      doc.text("Address:", 20, yPosition);
      const addressLines = doc.splitTextToSize(addressInfo, 110);
      doc.text(addressLines, 80, yPosition);
      yPosition += addressLines.length * 5 + 5;
    }

    // Location Details
    yPosition += 10;
    doc.setFontSize(16);
    doc.setTextColor(this.COLORS.primary);
    doc.text("Assessment Location", 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);

    if (booking.location_type === "park") {
      doc.text("Location: Clementi Woods Park", 20, yPosition);
      yPosition += 8;
      doc.text("Address: 613 Clementi West St 1, Singapore", 20, yPosition);
      yPosition += 8;
      doc.text("Parking: Available at the specified address", 20, yPosition);
      yPosition += 8;
      doc.text("Fee: FREE assessment", 20, yPosition);
    } else {
      doc.text("Location: Your Home Address", 20, yPosition);
      yPosition += 8;
      doc.text("Fee: $25.00 (Non-refundable)", 20, yPosition);
      if (booking.total_paid && booking.total_paid > 0) {
        yPosition += 8;
        doc.text(
          `Payment Status: PAID - $${booking.total_paid.toFixed(2)}`,
          20,
          yPosition
        );
      }
    }

    // Digital Signature Section
    if (signature) {
      yPosition += 20;
      doc.setFontSize(16);
      doc.setTextColor(this.COLORS.primary);
      doc.text("Digital Signature", 20, yPosition);

      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(this.COLORS.text);
      doc.text(
        `Signed on: ${this.formatDate(signature.signed_at)}`,
        20,
        yPosition
      );

      // Add signature image if available
      if (signature.signature_data) {
        try {
          yPosition += 10;
          doc.addImage(signature.signature_data, "PNG", 20, yPosition, 80, 30);
          yPosition += 35;
        } catch (error) {
          console.error("Error adding signature to PDF:", error);
        }
      }
    }

    // Footer
    this.addFooter(doc);

    // @ts-ignore
    return doc.output("arraybuffer") as Uint8Array;
  }

  static async generateInvoice(
    booking: BookingData,
    payment: PaymentData
  ): Promise<Uint8Array> {
    const doc = new jsPDF();

    // Header
    this.addHeader(doc, "INVOICE");

    let yPosition = 60;

    // Invoice Details
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.text);
    doc.text(
      `Invoice #: ${payment.invoice_number || "INV-" + booking.booking_token}`,
      120,
      yPosition
    );
    yPosition += 8;
    doc.text(`Date: ${this.formatDate(payment.paid_at)}`, 120, yPosition);
    yPosition += 8;
    doc.text(`Due Date: PAID`, 120, yPosition);

    // Bill To Section
    yPosition = 80;
    doc.setFontSize(14);
    doc.setTextColor(this.COLORS.primary);
    doc.text("Bill To:", 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);

    // Get owner info from individual fields or fallback to combined fields
    const ownerName =
      booking.owner_name ||
      (booking.owner_first_name && booking.owner_last_name
        ? `${booking.owner_first_name} ${booking.owner_last_name}`
        : "");

    if (ownerName) {
      doc.text(ownerName, 20, yPosition);
      yPosition += 8;
    }

    if (booking.owner_email) {
      doc.text(booking.owner_email, 20, yPosition);
      yPosition += 8;
    }

    if (booking.owner_address) {
      const addressLines = doc.splitTextToSize(booking.owner_address, 80);
      doc.text(addressLines, 20, yPosition);
      yPosition += addressLines.length * 5 + 10;
    }

    // Services Table
    yPosition += 10;

    // Table headers
    doc.setFillColor(this.COLORS.primary);
    doc.rect(20, yPosition, 170, 10, "F");

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("Description", 25, yPosition + 7);
    doc.text("Date", 100, yPosition + 7);
    doc.text("Amount", 150, yPosition + 7);

    yPosition += 10;

    // Service row
    doc.setTextColor(this.COLORS.text);
    doc.rect(20, yPosition, 170, 15);

    doc.text("Dog Assessment - Home Visit", 25, yPosition + 7);
    doc.text("Professional assessment at your location", 25, yPosition + 12);
    doc.text(this.formatDate(booking.preferred_date), 100, yPosition + 7);
    doc.text(
      `$${payment.amount.toFixed(2)} ${payment.currency.toUpperCase()}`,
      150,
      yPosition + 7
    );

    yPosition += 15;

    // Total section
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition, 170, 8, "F");
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.text);
    doc.text("Total Amount:", 120, yPosition + 6);
    doc.text(
      `$${payment.amount.toFixed(2)} ${payment.currency.toUpperCase()}`,
      150,
      yPosition + 6
    );

    yPosition += 20;

    // Payment Information
    doc.setFontSize(14);
    doc.setTextColor(this.COLORS.primary);
    doc.text("Payment Information", 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);

    const paymentDetails = [
      ["Payment Date:", this.formatDate(payment.paid_at)],
      [
        "Payment Method:",
        payment.payment_method
          ? this.capitalizeFirst(payment.payment_method)
          : "Card",
      ],
      ["Transaction ID:", payment.stripe_payment_intent_id || "N/A"],
      ["Status:", "PAID"],
    ];

    paymentDetails.forEach(([label, value]) => {
      doc.text(label, 20, yPosition);
      doc.text(value, 80, yPosition);
      yPosition += 8;
    });

    // Payment Terms
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.primary);
    doc.text("Payment Terms", 20, yPosition);

    yPosition += 8;
    doc.setFontSize(9);
    doc.setTextColor(this.COLORS.text);
    const termsText =
      "Assessment fees are non-refundable regardless of assessment outcome. This invoice serves as your payment receipt.";
    const termsLines = doc.splitTextToSize(termsText, 170);
    doc.text(termsLines, 20, yPosition);

    // Footer
    this.addFooter(doc);

    // @ts-ignore
    return doc.output("arraybuffer") as Uint8Array;
  }

  static async generateTermsDocument(
    booking: BookingData,
    signature: SignatureData
  ): Promise<Uint8Array> {
    const doc = new jsPDF();

    // Header
    this.addHeader(doc, "Terms and Conditions Agreement");

    let yPosition = 60;

    // Booking Reference
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.text);
    doc.text(`Booking Reference: ${booking.booking_token}`, 20, yPosition);
    yPosition += 8;
    doc.text(
      `Agreement Date: ${this.formatDate(signature.signed_at)}`,
      20,
      yPosition
    );

    yPosition += 20;

    // Terms content (truncated for brevity)
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);

    const termsContent = [
      "TERMS AND CONDITIONS - DOG ASSESSMENT SERVICES",
      "",
      "1. ASSESSMENT FEE STRUCTURE",
      "• Home Visit Assessment: $25.00 fee applies for assessments conducted at your residence",
      "• Park Assessment: No fee for assessments conducted at Clementi Woods Park",
      "• Non-Refundable Policy: The $25.00 assessment fee is non-refundable regardless of outcome",
      "",
      "2. PURPOSE AND SCOPE OF ASSESSMENT",
      "• Evaluate dog's temperament, behavior patterns, and compatibility with boarding services",
      "• Ensure safety and well-being of all dogs in our care and staff members",
      "",
      "3. OWNER RESPONSIBILITIES",
      "• Provide accurate and honest information about dog's behavioral history",
      "• Current vaccination records must be provided prior to assessment",
      "• Responsible for dog's behavior during assessment period",
      "",
      "4. SERVICE DECISIONS AND LIABILITY",
      "• We reserve the right to decline services if dog exhibits aggressive behavior",
      "• Assessment results are final and at sole discretion of The Good Stay team",
      "• Pet owners assume responsibility for any damages during assessment",
      "",
      "5. HEALTH AND SAFETY REQUIREMENTS",
      "• Dogs must be current on all required vaccinations",
      "• Flea and tick prevention must be current",
      "• Dogs showing signs of illness will be rescheduled",
    ];

    termsContent.forEach((line) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      if (line === "" || line.startsWith("•")) {
        doc.text(line, 25, yPosition);
      } else if (line.match(/^\d+\./)) {
        doc.setFont("helvetica", "bold");
        doc.text(line, 20, yPosition);
        doc.setFont("helvetica", "normal");
      } else {
        doc.setFont("helvetica", "bold");
        doc.text(line, 20, yPosition);
        doc.setFont("helvetica", "normal");
      }
      yPosition += 6;
    });

    // Signature Section
    yPosition += 20;
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 40;
    }

    doc.setFontSize(14);
    doc.setTextColor(this.COLORS.primary);
    doc.text("Digital Signature", 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);
    doc.text(
      `Signed on: ${this.formatDate(signature.signed_at)}`,
      20,
      yPosition
    );

    // Get owner name from individual fields or fallback to combined fields
    const signerName =
      booking.owner_name ||
      (booking.owner_first_name && booking.owner_last_name
        ? `${booking.owner_first_name} ${booking.owner_last_name}`
        : "Customer");
    doc.text(`By: ${signerName}`, 20, yPosition + 8);

    // Add signature image
    if (signature.signature_data) {
      try {
        yPosition += 20;
        doc.addImage(signature.signature_data, "PNG", 20, yPosition, 80, 30);
      } catch (error) {
        console.error("Error adding signature to terms document:", error);
      }
    }

    // Footer
    this.addFooter(doc);

    // @ts-ignore
    return doc.output("arraybuffer") as Uint8Array;
  }

  private static addHeader(doc: jsPDF, title: string) {
    // Company logo area (placeholder)
    doc.setFillColor(this.COLORS.primary);
    doc.rect(20, 20, 170, 25, "F");

    // Company name
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(this.COMPANY_INFO.name, 25, 35);

    // Document title
    doc.setFontSize(14);
    doc.text(title, 120, 35);

    // Company contact info
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(this.COMPANY_INFO.website, 25, 42);
    doc.text(this.COMPANY_INFO.email, 120, 42);
  }

  private static addFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(8);
    doc.setTextColor(this.COLORS.secondary);
    doc.text(
      "The Good Stay - Professional Dog Boarding & Assessment Services",
      20,
      pageHeight - 20
    );
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      20,
      pageHeight - 15
    );
    doc.text(
      "This document is digitally generated and does not require a physical signature.",
      20,
      pageHeight - 10
    );
  }

  private static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
