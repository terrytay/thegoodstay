"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createBookingSnapshot } from "@/lib/snapshots";
import { User, Dog, FileText, CheckCircle, AlertCircle } from "lucide-react";
import DateTimePicker from "./date-time-picker";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  dogName: string;
  dogBreed: string;
  dogAge: string;
  preferredDate: string;
  preferredTime: string;
  specialRequirements: string;
}

export default function BookingForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    dogName: "",
    dogBreed: "",
    dogAge: "",
    preferredDate: "",
    preferredTime: "",
    specialRequirements: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required field validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Please enter your full name";
    }

    if (!formData.email.trim()) {
      errors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Please enter your phone number";
    }

    if (!formData.dogName.trim()) {
      errors.dogName = "Please enter your dog's name";
    }

    if (!formData.preferredDate) {
      errors.preferredDate = "Please select a date for your visit";
    } else {
      // Check if date is at least 3 hours in the future
      const selectedDateTime = new Date(
        `${formData.preferredDate}T${formData.preferredTime || "09:00"}:00`
      );
      const minDateTime = new Date(Date.now() + 3 * 60 * 60 * 1000);

      if (selectedDateTime < minDateTime) {
        errors.preferredDate =
          "Please select a date and time at least 3 hours from now";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Create or update user profile
      const { data: user, error: authError } = await supabase.auth.getUser();

      if (authError) {
        // For anonymous bookings, we'll just store the booking without user auth
        console.log("No authenticated user, proceeding with anonymous booking");
      }

      // Insert booking (allow anonymous bookings by setting user_id to null)
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: null, // Allow anonymous bookings
          dog_name: formData.dogName,
          dog_breed: formData.dogBreed,
          dog_age: parseInt(formData.dogAge) || null,
          special_requirements: formData.specialRequirements,
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          status: "pending",
          notes: `Contact: ${formData.fullName}, Email: ${formData.email}, Phone: ${formData.phone}`,
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Create booking snapshot for data integrity
      if (bookingData) {
        try {
          await createBookingSnapshot(bookingData.id);
        } catch (snapshotError) {
          console.error("Failed to create booking snapshot:", snapshotError);
          // Don't fail the entire booking if snapshot creation fails
        }
      }

      // If no user is authenticated, create a profile record for contact purposes
      if (!user?.user?.id) {
        await supabase
          .from("profiles")
          .insert({
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          })
          .select();
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting booking:", err);
      setError(
        "There was an error submitting your booking. Please try again or contact us directly."
      );
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
          Assessment Request Submitted!
        </h2>
        <p className="font-lora text-lg text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Thank you for your interest! We&apos;ll review your request and get
          back to you within 24 hours to confirm your assessment visit details.
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

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="font-crimson text-3xl md:text-4xl font-normal text-stone-900 mb-4">
          Schedule Your Assessment Visit
        </h2>
        <p className="font-lora text-stone-600 leading-relaxed">
          Fill out the form below and we&apos;ll get back to you within 24 hours
          to confirm your appointment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Owner Information */}
        <div className="bg-stone-50 rounded-2xl p-8">
          <h3 className="flex items-center space-x-3 font-crimson text-xl font-normal text-stone-900 mb-6">
            <div className="bg-amber-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-amber-700" />
            </div>
            <span>Your Information</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fullName"
                className="block font-lora font-medium text-stone-700 mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg font-lora transition-all duration-200 ${
                  fieldErrors.fullName
                    ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
                    : formData.fullName
                    ? "border-green-300 bg-green-50 focus:ring-amber-500 focus:border-transparent"
                    : "border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                }`}
                placeholder="Your full name"
              />
              {fieldErrors.fullName && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{fieldErrors.fullName}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                  fieldErrors.email
                    ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
                    : formData.email &&
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                    ? "border-green-300 bg-green-50 focus:ring-amber-500 focus:border-transparent"
                    : "border-neutral-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                }`}
                placeholder="your.email@example.com"
              />
              {fieldErrors.email && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{fieldErrors.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                fieldErrors.phone
                  ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
                  : formData.phone &&
                    /^[\+]?[1-9][\d]{0,2}?[\s\-\.]?[(]?[\d]{3}[)]?[\s\-\.]?[\d]{3}[\s\-\.]?[\d]{4,6}$/.test(
                      formData.phone.replace(/\s/g, "")
                    )
                  ? "border-green-300 bg-green-50 focus:ring-amber-500 focus:border-transparent"
                  : "border-neutral-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              }`}
              placeholder="(555) 123-4567"
            />
            {fieldErrors.phone && (
              <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{fieldErrors.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dog Information */}
        <div className="bg-neutral-50 rounded-xl p-6">
          <h3 className="flex items-center space-x-2 font-semibold text-lg text-neutral-900 mb-4">
            <Dog className="h-5 w-5 text-amber-600" />
            <span>About Your Dog</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="dogName"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Dog&apos;s Name *
              </label>
              <input
                type="text"
                id="dogName"
                name="dogName"
                value={formData.dogName}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                  fieldErrors.dogName
                    ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
                    : formData.dogName
                    ? "border-green-300 bg-green-50 focus:ring-amber-500 focus:border-transparent"
                    : "border-neutral-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                }`}
                placeholder="Max, Luna, etc."
              />
              {fieldErrors.dogName && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{fieldErrors.dogName}</span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="dogBreed"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Breed
              </label>
              <input
                type="text"
                id="dogBreed"
                name="dogBreed"
                value={formData.dogBreed}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Golden Retriever, Mixed, etc."
              />
            </div>

            <div>
              <label
                htmlFor="dogAge"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Age (years)
              </label>
              <input
                type="number"
                id="dogAge"
                name="dogAge"
                value={formData.dogAge}
                onChange={handleChange}
                min="0"
                max="20"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="3"
              />
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
          <h3 className="flex items-center space-x-2 font-semibold text-lg text-neutral-900 mb-6">
            <div className="bg-amber-100 p-2 rounded-lg">
              <svg
                className="h-5 w-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span>Choose Your Visit Time</span>
          </h3>

          <DateTimePicker
            selectedDate={formData.preferredDate}
            selectedTime={formData.preferredTime}
            onDateChange={(date) => {
              setFormData((prev) => ({ ...prev, preferredDate: date }));
              // Clear date error when date is selected
              if (fieldErrors.preferredDate) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.preferredDate;
                  return newErrors;
                });
              }
            }}
            onTimeChange={(time) => {
              setFormData((prev) => ({ ...prev, preferredTime: time }));
            }}
            error={fieldErrors.preferredDate}
          />
        </div>

        {/* Special Requirements */}
        <div className="bg-neutral-50 rounded-xl p-6">
          <h3 className="flex items-center space-x-2 font-semibold text-lg text-neutral-900 mb-4">
            <FileText className="h-5 w-5 text-amber-600" />
            <span>Additional Information</span>
          </h3>

          <div>
            <label
              htmlFor="specialRequirements"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Special Requirements or Notes
            </label>
            <textarea
              id="specialRequirements"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Any special needs, medications, behavioral notes, or questions you'd like to discuss..."
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors duration-300 min-w-[200px]"
          >
            {isSubmitting ? "Submitting..." : "Request Assessment Visit"}
          </button>

          <p className="text-sm text-neutral-500 mt-4">
            * Required fields. We&apos;ll contact you within 24 hours to confirm
            your appointment.
          </p>
        </div>
      </form>
    </div>
  );
}
