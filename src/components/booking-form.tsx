"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Dog,
  Heart,
  Shield,
  FileText,
  CheckCircle,
  AlertCircle,
  MapPin,
  Clock,
  PenTool,
} from "lucide-react";
import DateTimePicker from "./date-time-picker";
import {
  createSingaporeDate,
  singaporeDateToISOString,
} from "@/lib/utils/singapore-timezone";

interface AssessmentFormData {
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
  dogGender:
    | "Male, Non-neutered"
    | "Male, Neutered"
    | "Female, Non-spayed"
    | "Female, Spayed"
    | "";

  // Behavioral Assessment
  reactionToNewPeople: string[];
  uncomfortableSituations: string;
  reactivityDetails: string;
  biteHistory: "Yes" | "No" | "";
  sensitiveBodyAreas: string;
  aggressionDetails: string;
  biteSeverity: "Not Applicable" | "Yes" | "No" | "";
  anxietyInNewEnvironments: string;
  thunderstormResponse: string;
  behaviorWhenAlone: string;

  // Health Information
  currentMedicalIssues: string;
  foodAllergies: string;
  vaccinationStatus: "Yes" | "No" | "";

  // Assessment Details
  preferredDate: string;
  preferredTime: string;
  locationType: "park" | "home";

  // Terms & Signature
  termsAccepted: boolean;
  signatureData: string;
  signatureCompleted: boolean;
}

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<AssessmentFormData>({
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    contactAreaCode: "",
    contactPhone: "",
    addressStreet1: "",
    addressStreet2: "",
    addressCity: "",
    addressState: "",
    addressPostal: "",
    instagram: "",
    dogFirstName: "",
    dogLastName: "",
    dogBreed: "",
    dogAge: "",
    dogGender: "",
    reactionToNewPeople: [],
    uncomfortableSituations: "",
    reactivityDetails: "",
    biteHistory: "",
    sensitiveBodyAreas: "",
    aggressionDetails: "",
    biteSeverity: "",
    anxietyInNewEnvironments: "",
    thunderstormResponse: "",
    behaviorWhenAlone: "",
    currentMedicalIssues: "",
    foodAllergies: "",
    vaccinationStatus: "",
    preferredDate: "",
    preferredTime: "",
    locationType: "park",
    termsAccepted: false,
    signatureData: "",
    signatureCompleted: false,
  });

  const steps = [
    { title: "Owner Information", icon: User },
    { title: "Dog Information", icon: Dog },
    { title: "Behavioral Assessment", icon: Heart },
    { title: "Health Information", icon: Shield },
    { title: "Assessment Details", icon: Clock },
    { title: "Terms & Signature", icon: PenTool },
  ];

  const handleInputChange = (field: keyof AssessmentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (
    field: "reactionToNewPeople",
    value: string,
    checked: boolean
  ) => {
    if (field === "reactionToNewPeople") {
      const currentValues = formData.reactionToNewPeople;
      if (checked) {
        handleInputChange(field, [...currentValues, value]);
      } else {
        handleInputChange(
          field,
          currentValues.filter((v) => v !== value)
        );
      }
    }
  };

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};

    if (currentStep === 0) {
      // Owner Information
      if (!formData.ownerFirstName.trim())
        errors.ownerFirstName = "First name is required";
      if (!formData.ownerLastName.trim())
        errors.ownerLastName = "Last name is required";
      if (!formData.ownerEmail.trim()) errors.ownerEmail = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail))
        errors.ownerEmail = "Please enter a valid email address";
      if (!formData.contactAreaCode.trim())
        errors.contactAreaCode = "Area code is required";
      if (!formData.contactPhone.trim())
        errors.contactPhone = "Phone number is required";
      if (!formData.addressStreet1.trim())
        errors.addressStreet1 = "Street address is required";
      if (!formData.addressCity.trim()) errors.addressCity = "City is required";
      if (!formData.addressPostal.trim())
        errors.addressPostal = "Postal code is required";
    }

    if (currentStep === 1) {
      // Dog Information
      if (!formData.dogFirstName.trim())
        errors.dogFirstName = "Dog's name is required";
      if (!formData.dogBreed.trim()) errors.dogBreed = "Dog breed is required";
      if (!formData.dogAge.trim()) errors.dogAge = "Dog's age is required";
      if (!formData.dogGender)
        errors.dogGender = "Please select dog's gender and neuter status";
    }

    if (currentStep === 2) {
      // Behavioral Assessment
      // if (formData.reactionToNewPeople.length === 0)
      //   errors.reactionToNewPeople = "Please select at least one reaction type";
      if (!formData.biteHistory)
        errors.biteHistory = "Please indicate bite history";
    }

    if (currentStep === 3) {
      // Health Information
      if (!formData.vaccinationStatus)
        errors.vaccinationStatus = "Please confirm vaccination status";
    }

    if (currentStep === 4) {
      // Assessment Details
      if (!formData.preferredDate)
        errors.preferredDate = "Please select a preferred date";
      if (!formData.preferredTime)
        errors.preferredTime = "Please select a preferred time";
    }

    if (currentStep === 5) {
      // Terms & Signature
      if (!formData.termsAccepted)
        errors.termsAccepted = "Please accept the terms and conditions";
      if (!formData.signatureCompleted)
        errors.signatureCompleted = "Please complete your digital signature";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError("");
  };

  // Signature handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000000";
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setFormData((prev) => ({
        ...prev,
        signatureCompleted: true,
        signatureData: canvasRef.current?.toDataURL("image/png") || "",
      }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    setFormData((prev) => ({
      ...prev,
      signatureCompleted: false,
      signatureData: "",
    }));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createClient();

      // Check availability using Google Calendar
      const availabilityResponse = await fetch(
        "/api/calendar/check-availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: formData.preferredDate,
            time: formData.preferredTime,
          }),
        }
      );

      if (!availabilityResponse.ok) {
        throw new Error("Failed to check availability. Please try again.");
      }

      const availabilityResult = await availabilityResponse.json();

      if (!availabilityResult.available) {
        setError(
          "Sorry, this date and time is no longer available. Please select a different time slot."
        );
        setIsSubmitting(false);
        return;
      }

      // Calculate payment details
      const paymentAmount = formData.locationType === "home" ? 25.0 : 0;
      const requiresPayment = paymentAmount > 0;

      // Create the booking with individual columns
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: null,
          // Dog Information
          dog_name: `${formData.dogFirstName} ${formData.dogLastName}`.trim(),
          dog_first_name: formData.dogFirstName,
          dog_last_name: formData.dogLastName,
          dog_breed: formData.dogBreed,
          dog_age: formData.dogAge, // Now text instead of integer
          dog_gender_neuter: formData.dogGender,

          // Owner Information
          owner_first_name: formData.ownerFirstName,
          owner_last_name: formData.ownerLastName,
          owner_name:
            `${formData.ownerFirstName} ${formData.ownerLastName}`.trim(),
          owner_email: formData.ownerEmail,
          contact_area_code: formData.contactAreaCode,
          contact_phone: formData.contactPhone,
          address_street1: formData.addressStreet1,
          address_street2: formData.addressStreet2,
          address_city: formData.addressCity,
          address_state: formData.addressState,
          address_postal: formData.addressPostal,
          instagram: formData.instagram,

          // Behavioral Assessment
          reaction_to_new_people: JSON.stringify(formData.reactionToNewPeople),
          uncomfortable_situations: formData.uncomfortableSituations,
          reactivity_details: formData.reactivityDetails,
          bite_history: formData.biteHistory,
          sensitive_body_areas: formData.sensitiveBodyAreas,
          aggression_details: formData.aggressionDetails,
          bite_severity: formData.biteSeverity,
          anxiety_new_environments: formData.anxietyInNewEnvironments,
          thunderstorm_response: formData.thunderstormResponse,
          behavior_when_alone: formData.behaviorWhenAlone,

          // Health Information
          current_medical_issues: formData.currentMedicalIssues,
          food_allergies: formData.foodAllergies,
          vaccination_status: formData.vaccinationStatus,

          // Booking Details
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          location_type: formData.locationType,
          home_visit_fee: formData.locationType === "home" ? 25.0 : 0,
          payment_required: requiresPayment,
          payment_amount: paymentAmount,

          // Agreement
          terms_accepted: formData.termsAccepted,
          terms_accepted_at: new Date().toISOString(),
          signature_data: formData.signatureData,
          signature_completed: formData.signatureCompleted,

          // Status
          booking_status: requiresPayment ? "pending_payment" : "confirmed",
          status: "pending",
          notes: `Assessment booking submitted via form`,
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Save digital signature
      if (formData.signatureData && bookingData) {
        const { error: signatureError } = await supabase
          .from("digital_signatures")
          .insert({
            booking_id: bookingData.id,
            signature_data: formData.signatureData,
            signature_metadata: {
              timestamp: new Date().toISOString(),
              formVersion: "2.0",
              canvasDimensions: {
                width: canvasRef.current?.width || 400,
                height: canvasRef.current?.height || 150,
              },
            },
            signed_at: new Date().toISOString(),
          });

        if (signatureError) {
          console.error("Error saving signature:", signatureError);
        }
      }

      // If payment is required, redirect to Stripe
      if (requiresPayment && bookingData) {
        const response = await fetch("/api/create-assessment-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: bookingData.id,
            amount: paymentAmount,
            customerInfo: {
              name: `${formData.ownerFirstName} ${formData.ownerLastName}`,
              email: formData.ownerEmail,
              phone: `${formData.contactAreaCode}-${formData.contactPhone}`,
              address: `${formData.addressStreet1}, ${formData.addressCity}`,
            },
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.error || "Failed to create payment session"
          );
        }

        const { sessionId } = responseData;

        if (!sessionId) {
          throw new Error("No session ID received from payment API");
        }

        // Redirect to Stripe Checkout
        const stripe = await import("@stripe/stripe-js").then((m) =>
          m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        );

        if (!stripe) {
          throw new Error("Failed to load Stripe");
        }

        await stripe.redirectToCheckout({ sessionId });
      } else {
        // No payment required, send confirmation email and show success
        try {
          await fetch("/api/send-booking-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookingData: formData,
              bookingId: bookingData.id,
            }),
          });
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the booking if email fails, just log it
        }

        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Error submitting booking:", err);
      setError("There was an error submitting your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="bg-green-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="font-crimson text-3xl md:text-4xl font-normal text-stone-900 mb-6">
          Assessment Booking Confirmed!
        </h2>
        <p className="font-lora text-lg text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Thank you for completing your assessment booking. We&apos;ll contact
          you within 24 hours to confirm the final details.
        </p>
        <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-8 max-w-lg mx-auto border border-stone-200">
          <p className="font-lora font-semibold text-stone-900 mb-4">
            What happens next?
          </p>
          <ul className="text-left font-lora text-stone-600 space-y-2">
            <li>• We&apos;ll call or email you to confirm the appointment</li>
            <li>• You&apos;ll receive location details and preparation tips</li>
            <li>• We&apos;ll send a reminder the day before your visit</li>
          </ul>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-crimson text-2xl font-normal text-stone-900">
            {currentStepData.title}
          </h2>
          <span className="text-sm text-stone-600">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Progress indicators */}
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full ${
                index <= currentStep ? "bg-amber-600" : "bg-stone-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-amber-100 p-3 rounded-lg">
            <StepIcon className="h-6 w-6 text-amber-700" />
          </div>
          <h3 className="font-crimson text-xl font-normal text-stone-900">
            {currentStepData.title}
          </h3>
        </div>

        {/* Step 0: Owner Information */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-lora font-medium text-stone-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.ownerFirstName}
                  onChange={(e) =>
                    handleInputChange("ownerFirstName", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    fieldErrors.ownerFirstName
                      ? "border-red-300 bg-red-50"
                      : formData.ownerFirstName
                      ? "border-green-300 bg-green-50"
                      : "border-stone-300"
                  } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="Your first name"
                />
                {fieldErrors.ownerFirstName && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.ownerFirstName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-lora font-medium text-stone-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.ownerLastName}
                  onChange={(e) =>
                    handleInputChange("ownerLastName", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    fieldErrors.ownerLastName
                      ? "border-red-300 bg-red-50"
                      : formData.ownerLastName
                      ? "border-green-300 bg-green-50"
                      : "border-stone-300"
                  } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="Your last name"
                />
                {fieldErrors.ownerLastName && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.ownerLastName}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.ownerEmail}
                onChange={(e) =>
                  handleInputChange("ownerEmail", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                  fieldErrors.ownerEmail
                    ? "border-red-300 bg-red-50"
                    : formData.ownerEmail
                    ? "border-green-300 bg-green-50"
                    : "border-stone-300"
                } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                placeholder="your.email@example.com"
              />
              {fieldErrors.ownerEmail && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.ownerEmail}</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-lora font-medium text-stone-700 mb-2">
                  Area Code *
                </label>
                <input
                  type="tel"
                  value={formData.contactAreaCode}
                  onChange={(e) =>
                    handleInputChange("contactAreaCode", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    fieldErrors.contactAreaCode
                      ? "border-red-300 bg-red-50"
                      : formData.contactAreaCode
                      ? "border-green-300 bg-green-50"
                      : "border-stone-300"
                  } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="65"
                />
                {fieldErrors.contactAreaCode && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.contactAreaCode}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-lora font-medium text-stone-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    handleInputChange("contactPhone", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    fieldErrors.contactPhone
                      ? "border-red-300 bg-red-50"
                      : formData.contactPhone
                      ? "border-green-300 bg-green-50"
                      : "border-stone-300"
                  } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="1234 5678"
                />
                {fieldErrors.contactPhone && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.addressStreet1}
                onChange={(e) =>
                  handleInputChange("addressStreet1", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                  fieldErrors.addressStreet1
                    ? "border-red-300 bg-red-50"
                    : formData.addressStreet1
                    ? "border-green-300 bg-green-50"
                    : "border-stone-300"
                } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                placeholder="123 Main Street"
              />
              {fieldErrors.addressStreet1 && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.addressStreet1}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Street Address Line 2
              </label>
              <input
                type="text"
                value={formData.addressStreet2}
                onChange={(e) =>
                  handleInputChange("addressStreet2", e.target.value)
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Unit, Floor (optional)"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block font-lora font-medium text-stone-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.addressCity}
                  onChange={(e) =>
                    handleInputChange("addressCity", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    fieldErrors.addressCity
                      ? "border-red-300 bg-red-50"
                      : formData.addressCity
                      ? "border-green-300 bg-green-50"
                      : "border-stone-300"
                  } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="Singapore"
                />
                {fieldErrors.addressCity && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.addressCity}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-lora font-medium text-stone-700 mb-2">
                  State / Province
                </label>
                <input
                  type="text"
                  value={formData.addressState}
                  onChange={(e) =>
                    handleInputChange("addressState", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Singapore"
                />
              </div>

              <div>
                <label className="block font-lora font-medium text-stone-700 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  value={formData.addressPostal}
                  onChange={(e) =>
                    handleInputChange("addressPostal", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    fieldErrors.addressPostal
                      ? "border-red-300 bg-red-50"
                      : formData.addressPostal
                      ? "border-green-300 bg-green-50"
                      : "border-stone-300"
                  } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="123456"
                />
                {fieldErrors.addressPostal && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.addressPostal}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Instagram Handle (Optional)
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="@yourusername"
              />
            </div>
          </div>
        )}

        {/* Step 1: Dog Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-lora font-medium text-stone-700 mb-2">
                  Dog's First Name *
                </label>
                <input
                  type="text"
                  value={formData.dogFirstName}
                  onChange={(e) =>
                    handleInputChange("dogFirstName", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    fieldErrors.dogFirstName
                      ? "border-red-300 bg-red-50"
                      : formData.dogFirstName
                      ? "border-green-300 bg-green-50"
                      : "border-stone-300"
                  } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  placeholder="Max, Luna, etc."
                />
                {fieldErrors.dogFirstName && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.dogFirstName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-lora font-medium text-stone-700 mb-2">
                  Dog's Last Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.dogLastName}
                  onChange={(e) =>
                    handleInputChange("dogLastName", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Family name"
                />
              </div>
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Dog Breed *
              </label>
              <input
                type="text"
                value={formData.dogBreed}
                onChange={(e) => handleInputChange("dogBreed", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                  fieldErrors.dogBreed
                    ? "border-red-300 bg-red-50"
                    : formData.dogBreed
                    ? "border-green-300 bg-green-50"
                    : "border-stone-300"
                } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                placeholder="e.g., Golden Retriever, Mixed breed"
              />
              {fieldErrors.dogBreed && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.dogBreed}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Dog's Age *
              </label>
              <input
                type="text"
                value={formData.dogAge}
                onChange={(e) => handleInputChange("dogAge", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                  fieldErrors.dogAge
                    ? "border-red-300 bg-red-50"
                    : formData.dogAge
                    ? "border-green-300 bg-green-50"
                    : "border-stone-300"
                } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                placeholder="e.g., 3 years, 6 months"
              />
              {fieldErrors.dogAge && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.dogAge}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-3">
                Dog's Gender & Neuter Status *
              </label>
              <div className="space-y-3">
                {[
                  "Male, Non-neutered",
                  "Male, Neutered",
                  "Female, Non-spayed",
                  "Female, Spayed",
                ].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="dogGender"
                      value={option}
                      checked={formData.dogGender === option}
                      onChange={(e) =>
                        handleInputChange("dogGender", e.target.value)
                      }
                      className="mr-3 text-amber-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.dogGender && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.dogGender}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Behavioral Assessment */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block font-lora font-medium text-stone-700 mb-3">
                How does your dog typically react to new people? (Check all that
                apply) *
              </label>
              <div className="space-y-3">
                {[
                  "Friendly",
                  "Cautious, but warms up",
                  "Shy/ Nervous",
                  "Reactive",
                ].map((reaction) => (
                  <label key={reaction} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.reactionToNewPeople.includes(reaction)}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "reactionToNewPeople",
                          reaction,
                          e.target.checked
                        )
                      }
                      className="mr-3 text-amber-600"
                    />
                    <span>{reaction}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.reactionToNewPeople && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.reactionToNewPeople}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Is there any person, type of other animal or situation that your
                pet seems to be uncomfortable with?
              </label>
              <input
                type="text"
                value={formData.uncomfortableSituations}
                onChange={(e) =>
                  handleInputChange("uncomfortableSituations", e.target.value)
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="E.g. construction site, big tall man, white small dogs etc"
              />
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                If your dog is reactive, please elaborate:
              </label>
              <textarea
                value={formData.reactivityDetails}
                onChange={(e) =>
                  handleInputChange("reactivityDetails", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="Example: Will lunge forward to smell, will not bite / Will growl when approaching, do not touch unless he/she approaches / Will bark a lot and might jump up onto you but will not bite etc"
              />
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Does your dog have any history of biting or aggression? *
              </label>
              <select
                value={formData.biteHistory}
                onChange={(e) =>
                  handleInputChange("biteHistory", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  fieldErrors.biteHistory
                    ? "border-red-300 bg-red-50"
                    : formData.biteHistory
                    ? "border-green-300 bg-green-50"
                    : "border-stone-300"
                }`}
              >
                <option value="">Please select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {fieldErrors.biteHistory && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.biteHistory}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Any areas of the body your dog does not like to be touched?
              </label>
              <input
                type="text"
                value={formData.sensitiveBodyAreas}
                onChange={(e) =>
                  handleInputChange("sensitiveBodyAreas", e.target.value)
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="e.g. Cleaning of ears, paws etc. Areas that will result in extreme stress and possible reactivity"
              />
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                If your dog has a history of bite / aggression, please elaborate
                on what happened and the possible triggers:
              </label>
              <textarea
                value={formData.aggressionDetails}
                onChange={(e) =>
                  handleInputChange("aggressionDetails", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="Describe the incident(s) and circumstances..."
              />
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-3">
                If yes, did the dog draw blood from the bite?
              </label>
              <div className="flex gap-6">
                {["Not Applicable", "Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="biteSeverity"
                      value={option}
                      checked={formData.biteSeverity === option}
                      onChange={(e) =>
                        handleInputChange("biteSeverity", e.target.value)
                      }
                      className="mr-2 text-amber-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Does your dog show signs of anxiety in new environment? If yes,
                please elaborate.
              </label>
              <textarea
                value={formData.anxietyInNewEnvironments}
                onChange={(e) =>
                  handleInputChange("anxietyInNewEnvironments", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="E.g. Shiver, drooling etc"
              />
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                How does your dog respond to heavy rain/ thunderstorms?
              </label>
              <input
                type="text"
                value={formData.thunderstormResponse}
                onChange={(e) =>
                  handleInputChange("thunderstormResponse", e.target.value)
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Describe their typical reaction..."
              />
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                What does your pet typically do when left alone at home?
              </label>
              <textarea
                value={formData.behaviorWhenAlone}
                onChange={(e) =>
                  handleInputChange("behaviorWhenAlone", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="Any separation anxiety, destructive behavior, or specific patterns?"
              />
            </div>
          </div>
        )}

        {/* Step 3: Health Information */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Current Medical Issues / Ailments
              </label>
              <textarea
                value={formData.currentMedicalIssues}
                onChange={(e) =>
                  handleInputChange("currentMedicalIssues", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="List any health conditions, medications, or concerns..."
              />
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Known Food Allergies
              </label>
              <input
                type="text"
                value={formData.foodAllergies}
                onChange={(e) =>
                  handleInputChange("foodAllergies", e.target.value)
                }
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="List any known food allergies or dietary restrictions..."
              />
            </div>

            <div>
              <label className="block font-lora font-medium text-stone-700 mb-2">
                Is your dog current on all vaccinations? *
              </label>
              <div className="flex gap-6">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="vaccinationStatus"
                      value={option}
                      checked={formData.vaccinationStatus === option}
                      onChange={(e) =>
                        handleInputChange("vaccinationStatus", e.target.value)
                      }
                      className="mr-2 text-amber-600"
                    />
                    <span>
                      {option === "Yes"
                        ? "Yes, all vaccinations are current"
                        : "No or unsure"}
                    </span>
                  </label>
                ))}
              </div>
              {fieldErrors.vaccinationStatus && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.vaccinationStatus}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Assessment Details */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <DateTimePicker
              selectedDate={formData.preferredDate}
              selectedTime={formData.preferredTime}
              onDateChange={(date) => handleInputChange("preferredDate", date)}
              onTimeChange={(time) => handleInputChange("preferredTime", time)}
              error={fieldErrors.preferredDate}
              timeError={fieldErrors.preferredTime}
            />

            {/* Location Preference */}
            <div className="grid md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.locationType === "park"
                    ? "border-green-500 bg-green-50"
                    : "border-stone-200 bg-white hover:border-green-300"
                }`}
                onClick={() => handleInputChange("locationType", "park")}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="locationType"
                    value="park"
                    checked={formData.locationType === "park"}
                    onChange={() => handleInputChange("locationType", "park")}
                  />
                  <div>
                    <h4 className="font-medium text-green-800">
                      Park Assessment (Free)
                    </h4>
                    <p className="text-sm text-green-700">
                      Clementi Woods Park
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Parking: 613 Clementi West St 1
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.locationType === "home"
                    ? "border-amber-500 bg-amber-50"
                    : "border-stone-200 bg-white hover:border-amber-300"
                }`}
                onClick={() => handleInputChange("locationType", "home")}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="locationType"
                    value="home"
                    checked={formData.locationType === "home"}
                    onChange={() => handleInputChange("locationType", "home")}
                  />
                  <div>
                    <h4 className="font-medium text-amber-800">
                      Home Visit ($25.00)
                    </h4>
                    <p className="text-sm text-amber-700">
                      We come to your location
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Non-refundable fee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Terms & Signature */}
        {currentStep === 5 && (
          <div className="space-y-6">
            {/* Terms and Conditions Content */}
            <div className="bg-stone-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-stone-200">
              <h4 className="font-crimson text-xl font-normal text-stone-900 mb-4">
                Terms and Conditions - Dog Assessment Services
              </h4>

              <div className="space-y-4 text-stone-700 leading-relaxed">
                <div>
                  <h5 className="font-lora font-semibold mb-2">
                    Assessment Fee
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      A fee of $25.00 is charged for assessments conducted at
                      the owner's residence or a location of their convenience
                    </li>
                    <li>
                      If the assessment is conducted at Clementi Woods Park, the
                      fee is waived, and the assessment is free of charge
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-lora font-semibold mb-2">
                    Non-Refundable Policy
                  </h5>
                  <p className="text-sm">
                    The $25.00 assessment fee is non-refundable, regardless of
                    the outcome of the assessment, including if your dog is
                    deemed unsuitable for our boarding services.
                  </p>
                </div>

                <div>
                  <h5 className="font-lora font-semibold mb-2">
                    Purpose of Assessment
                  </h5>
                  <p className="text-sm">
                    The assessment is designed to evaluate your dog's
                    temperament, behavior patterns, and compatibility with our
                    boarding services to ensure the safety and well-being of all
                    dogs in our care and our staff members.
                  </p>
                </div>

                <div>
                  <h5 className="font-lora font-semibold mb-2">
                    Owner Responsibilities
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      You must provide accurate and honest information about
                      your dog's behavioral history, medical conditions, and any
                      previous incidents
                    </li>
                    <li>
                      All vaccination records must be current and provided prior
                      to assessment
                    </li>
                    <li>
                      You are responsible for your dog's behavior during the
                      assessment period
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-lora font-semibold mb-2">
                    Service Decisions and Liability
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      If a dog exhibits aggression or any behavior that poses a
                      risk to other animals or staff, we reserve the right to
                      decline boarding services
                    </li>
                    <li>
                      Assessment results are final and at the sole discretion of
                      The Good Stay team
                    </li>
                    <li>
                      We are not liable for any injuries that may occur during
                      the assessment process
                    </li>
                    <li>
                      Pet owners assume full responsibility for any damages
                      caused by their dog during the assessment
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-lora font-semibold mb-2">
                    Scheduling and Cancellations
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      Assessments are scheduled in advance based on availability
                    </li>
                    <li>
                      If you need to reschedule, you must inform us at least 24
                      hours in advance
                    </li>
                    <li>
                      Late cancellations may forfeit the right to reschedule
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="bg-white rounded-lg p-4 border border-stone-200">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) =>
                    handleInputChange("termsAccepted", e.target.checked)
                  }
                  className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                />
                <span className="text-stone-700">
                  I have read and agree to the terms and conditions above. I
                  understand that the assessment fee is non-refundable and that
                  The Good Stay reserves the right to decline services based on
                  the assessment outcome.
                </span>
              </label>
              {fieldErrors.termsAccepted && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.termsAccepted}</span>
                </div>
              )}
            </div>

            {/* Digital Signature */}
            {formData.termsAccepted && (
              <div className="bg-white rounded-lg p-4 border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-lora font-medium text-stone-700">
                    Digital Signature *
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Clear Signature
                  </button>
                </div>

                <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 bg-stone-50">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="w-full h-32 bg-white border border-stone-200 rounded cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                  <p className="text-xs text-stone-500 mt-2 text-center">
                    Sign above with your mouse or touch device
                  </p>
                </div>

                {fieldErrors.signatureCompleted && (
                  <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.signatureCompleted}</span>
                  </div>
                )}
              </div>
            )}

            {formData.locationType === "home" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-lora font-semibold text-blue-900 mb-2">
                  Payment Required
                </h4>
                <p className="text-blue-800 text-sm">
                  Since you've selected a home visit, a $25.00 assessment fee
                  will be charged. After completing this form, you'll be
                  redirected to secure payment processing.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-6 py-3 text-stone-600 hover:text-stone-800 disabled:opacity-50 disabled:cursor-not-allowed font-lora transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center space-x-4">
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !formData.termsAccepted ||
                !formData.signatureCompleted
              }
              className="bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? "Processing..."
                : formData.locationType === "home"
                ? "Proceed to Payment"
                : "Complete Assessment Booking"}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
