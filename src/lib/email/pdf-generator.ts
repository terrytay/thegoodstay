import jsPDF from 'jspdf';

export interface BookingFormData {
  // Owner Information
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  contactAreaCode: string;
  contactPhone: string;
  addressStreet1: string;
  addressStreet2: string;
  addressCity: string;
  addressState: string;
  addressPostal: string;
  instagram: string;

  // Dog Information
  dogFirstName: string;
  dogLastName: string;
  dogBreed: string;
  dogAge: string;
  dogGender: string;

  // Behavioral Assessment
  reactionToNewPeople: string[];
  uncomfortableSituations: string;
  reactivityDetails: string;
  biteHistory: string;
  sensitiveBodyAreas: string;
  aggressionDetails: string;
  biteSeverity: string;
  anxietyInNewEnvironments: string;
  thunderstormResponse: string;
  behaviorWhenAlone: string;

  // Health Information
  currentMedicalIssues: string;
  foodAllergies: string;
  vaccinationStatus: string;

  // Booking Details
  preferredDate: string;
  preferredTime: string;
  locationType: string;

  // Agreement
  termsAccepted: boolean;
  signatureData?: string;
}

export function generateBookingFormPDF(bookingData: BookingFormData, bookingId: string): Buffer {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 8;
  const pageHeight = 280;
  const leftMargin = 20;

  // Helper function to check if we need a new page
  const checkNewPage = () => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize / 2.5);
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('The Good Stay', leftMargin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(16);
  doc.text('Dog Assessment Booking Form', leftMargin, yPosition);
  yPosition += 5;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking ID: ${bookingId}`, leftMargin, yPosition);
  yPosition += 5;
  
  doc.text(`Generated: ${new Date().toLocaleDateString('en-SG')} ${new Date().toLocaleTimeString('en-SG')}`, leftMargin, yPosition);
  yPosition += 15;

  checkNewPage();

  // Owner Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Owner Information', leftMargin, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const ownerInfo = [
    ['Name:', `${bookingData.ownerFirstName} ${bookingData.ownerLastName}`],
    ['Email:', bookingData.ownerEmail],
    ['Phone:', `+${bookingData.contactAreaCode} ${bookingData.contactPhone}`],
    ['Address:', `${bookingData.addressStreet1}${bookingData.addressStreet2 ? ', ' + bookingData.addressStreet2 : ''}`],
    ['', `${bookingData.addressCity}, ${bookingData.addressState} ${bookingData.addressPostal}`],
    ['Instagram:', bookingData.instagram || 'Not provided']
  ];

  ownerInfo.forEach(([label, value]) => {
    if (label) {
      doc.setFont('helvetica', 'bold');
      doc.text(label, leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, leftMargin + 35, yPosition);
    } else {
      doc.text(value, leftMargin + 35, yPosition);
    }
    yPosition += lineHeight;
    checkNewPage();
  });

  yPosition += 5;
  checkNewPage();

  // Dog Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dog Information', leftMargin, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const dogInfo = [
    ['Name:', `${bookingData.dogFirstName} ${bookingData.dogLastName}`],
    ['Breed:', bookingData.dogBreed],
    ['Age:', bookingData.dogAge],
    ['Gender/Neuter Status:', bookingData.dogGender]
  ];

  dogInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, leftMargin + 45, yPosition);
    yPosition += lineHeight;
    checkNewPage();
  });

  yPosition += 5;
  checkNewPage();

  // Behavioral Assessment Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Behavioral Assessment', leftMargin, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const behaviorData = [
    ['Reaction to New People:', bookingData.reactionToNewPeople.join(', ')],
    ['Uncomfortable Situations:', bookingData.uncomfortableSituations],
    ['Reactivity Details:', bookingData.reactivityDetails],
    ['Bite History:', bookingData.biteHistory],
    ['Sensitive Body Areas:', bookingData.sensitiveBodyAreas],
    ['Aggression Details:', bookingData.aggressionDetails],
    ['Bite Severity:', bookingData.biteSeverity],
    ['Anxiety in New Environments:', bookingData.anxietyInNewEnvironments],
    ['Thunderstorm Response:', bookingData.thunderstormResponse],
    ['Behavior When Alone:', bookingData.behaviorWhenAlone]
  ];

  behaviorData.forEach(([label, value]) => {
    if (value && value.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.text(label, leftMargin, yPosition);
      yPosition += lineHeight;
      
      doc.setFont('helvetica', 'normal');
      const textHeight = addWrappedText(value, leftMargin + 5, yPosition, 160, 9);
      yPosition += textHeight + 3;
      checkNewPage();
    }
  });

  yPosition += 5;
  checkNewPage();

  // Health Information Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Health Information', leftMargin, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const healthInfo = [
    ['Current Medical Issues:', bookingData.currentMedicalIssues],
    ['Food Allergies:', bookingData.foodAllergies],
    ['Vaccination Status:', bookingData.vaccinationStatus]
  ];

  healthInfo.forEach(([label, value]) => {
    if (value && value.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.text(label, leftMargin, yPosition);
      yPosition += lineHeight;
      
      doc.setFont('helvetica', 'normal');
      const textHeight = addWrappedText(value, leftMargin + 5, yPosition, 160, 9);
      yPosition += textHeight + 3;
      checkNewPage();
    }
  });

  yPosition += 5;
  checkNewPage();

  // Booking Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Details', leftMargin, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const bookingInfo = [
    ['Preferred Date:', bookingData.preferredDate],
    ['Preferred Time:', bookingData.preferredTime],
    ['Location Type:', bookingData.locationType === 'home' ? 'Home Visit (+$25 fee)' : 'Facility Visit'],
    ['Terms Accepted:', bookingData.termsAccepted ? 'Yes' : 'No']
  ];

  bookingInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, leftMargin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, leftMargin + 45, yPosition);
    yPosition += lineHeight;
    checkNewPage();
  });

  // Add signature if available
  if (bookingData.signatureData) {
    yPosition += 10;
    checkNewPage();
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Digital Signature:', leftMargin, yPosition);
    yPosition += 10;
    
    try {
      // Add the signature image
      doc.addImage(bookingData.signatureData, 'PNG', leftMargin, yPosition, 80, 30);
      yPosition += 35;
    } catch (error) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Digital signature data included', leftMargin, yPosition);
      yPosition += lineHeight;
    }
  }

  return Buffer.from(doc.output('arraybuffer'));
}

export function generateTermsAndConditionsPDF(
  ownerName: string, 
  dogName: string, 
  bookingId: string, 
  signatureData?: string
): Buffer {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 6;
  const leftMargin = 20;
  const rightMargin = 190;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('The Good Stay - Terms & Conditions', leftMargin, yPosition);
  yPosition += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Booking ID: ${bookingId}`, leftMargin, yPosition);
  yPosition += 5;
  doc.text(`Owner: ${ownerName}`, leftMargin, yPosition);
  yPosition += 5;
  doc.text(`Dog: ${dogName}`, leftMargin, yPosition);
  yPosition += 15;

  // Terms content
  const terms = [
    'ASSESSMENT AGREEMENT',
    '',
    '1. ASSESSMENT PURPOSE',
    'This behavioral assessment is conducted to evaluate your dog\'s temperament, behavior patterns, and suitability for our services. The assessment helps us understand your dog\'s needs and develop appropriate care strategies.',
    '',
    '2. OWNER RESPONSIBILITIES',
    '• Provide accurate and complete information about your dog\'s medical history, behavioral issues, and special needs',
    '• Ensure your dog is up to date on vaccinations as required',
    '• Disclose any aggressive behavior, bite history, or reactivity issues',
    '• Arrive on time for your scheduled appointment',
    '',
    '3. ASSESSMENT PROCESS',
    '• The assessment typically takes 60-90 minutes',
    '• Our trained assessors will evaluate your dog\'s behavior in various situations',
    '• You are required to remain present during the entire assessment',
    '• We may ask you to demonstrate commands or handling techniques',
    '',
    '4. SAFETY AND LIABILITY',
    '• The Good Stay takes reasonable precautions to ensure safety during assessments',
    '• Owners are responsible for their dog\'s behavior and any damage caused',
    '• We reserve the right to stop the assessment if safety concerns arise',
    '• Emergency veterinary care costs are the owner\'s responsibility',
    '',
    '5. ASSESSMENT RESULTS',
    '• Results will be discussed with you after the assessment',
    '• We will provide recommendations for your dog\'s care and training needs',
    '• Assessment results help determine suitability for our boarding and daycare services',
    '',
    '6. FEES AND CANCELLATION',
    '• Home visit assessments incur an additional $25 fee',
    '• 24-hour notice required for cancellations or rescheduling',
    '• Late cancellations may incur charges',
    '',
    '7. PRIVACY AND DATA',
    '• Information collected is used solely for assessment and service purposes',
    '• We maintain confidentiality of all assessment data',
    '• Photos or videos may be taken for assessment documentation with your consent',
    '',
    '8. ACCEPTANCE',
    'By signing below, you acknowledge that you have read, understood, and agree to these terms and conditions.'
  ];

  doc.setFontSize(10);
  terms.forEach(term => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    if (term.includes('ASSESSMENT AGREEMENT') || term.includes('ACCEPTANCE')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
    } else if (term.match(/^\d+\./)) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
    }

    if (term.trim()) {
      const lines = doc.splitTextToSize(term, rightMargin - leftMargin);
      doc.text(lines, leftMargin, yPosition);
      yPosition += lines.length * lineHeight;
    } else {
      yPosition += lineHeight;
    }
  });

  // Signature section
  yPosition += 15;
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITAL SIGNATURE', leftMargin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Signed by: ${ownerName}`, leftMargin, yPosition);
  yPosition += 8;
  doc.text(`Date: ${new Date().toLocaleDateString('en-SG')}`, leftMargin, yPosition);
  yPosition += 15;

  if (signatureData) {
    try {
      doc.addImage(signatureData, 'PNG', leftMargin, yPosition, 80, 30);
    } catch (error) {
      doc.setFont('helvetica', 'italic');
      doc.text('Digital signature applied', leftMargin, yPosition);
    }
  }

  return Buffer.from(doc.output('arraybuffer'));
}

export function generateInvoicePDF(
  ownerName: string,
  ownerEmail: string,
  dogName: string,
  bookingId: string,
  amount: number,
  bookingDate: string,
  bookingTime: string
): Buffer {
  const doc = new jsPDF();
  const leftMargin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', leftMargin, yPosition);
  yPosition += 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('The Good Stay', leftMargin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dog Behavioral Assessment Services', leftMargin, yPosition);
  yPosition += 20;

  // Invoice details
  doc.setFontSize(10);
  doc.text(`Invoice #: INV-${bookingId}`, leftMargin, yPosition);
  doc.text(`Date: ${new Date().toLocaleDateString('en-SG')}`, 120, yPosition);
  yPosition += 8;

  doc.text(`Booking ID: ${bookingId}`, leftMargin, yPosition);
  yPosition += 20;

  // Billing information
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', leftMargin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.text(ownerName, leftMargin, yPosition);
  yPosition += 6;
  doc.text(ownerEmail, leftMargin, yPosition);
  yPosition += 20;

  // Service details
  doc.setFont('helvetica', 'bold');
  doc.text('Service Details:', leftMargin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.text(`Dog: ${dogName}`, leftMargin, yPosition);
  yPosition += 6;
  doc.text(`Assessment Date: ${bookingDate}`, leftMargin, yPosition);
  yPosition += 6;
  doc.text(`Assessment Time: ${bookingTime}`, leftMargin, yPosition);
  yPosition += 6;
  doc.text('Service: Home Visit Assessment', leftMargin, yPosition);
  yPosition += 20;

  // Invoice table
  doc.setFont('helvetica', 'bold');
  doc.text('Description', leftMargin, yPosition);
  doc.text('Amount', 150, yPosition);
  yPosition += 2;

  // Line under headers
  doc.line(leftMargin, yPosition, 190, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.text('Home Visit Assessment Fee', leftMargin, yPosition);
  doc.text(`$${amount.toFixed(2)} SGD`, 150, yPosition);
  yPosition += 15;

  // Total line
  doc.line(140, yPosition, 190, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('Total Due:', 120, yPosition);
  doc.text(`$${amount.toFixed(2)} SGD`, 150, yPosition);
  yPosition += 20;

  // Payment terms
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Payment Terms: Due on service date', leftMargin, yPosition);
  yPosition += 6;
  doc.text('Payment can be made via cash or electronic transfer on the day of assessment.', leftMargin, yPosition);

  return Buffer.from(doc.output('arraybuffer'));
}