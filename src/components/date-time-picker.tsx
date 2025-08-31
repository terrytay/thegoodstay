"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}
import {
  getSingaporeNow,
  formatSingaporeDateString,
  formatSingaporeDateForDisplay,
  formatSingaporeTimeForDisplay,
  createSingaporeDate,
  isSingaporeToday,
  isSingaporePast,
  addHoursToSingaporeDate,
  getSingaporeDateStartOfDay,
  toSingaporeTime,
} from "@/lib/utils/singapore-timezone";

// Removed BookingSettings - now using Google Calendar with fixed 7 AM - 10 PM range

interface DateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  error?: string;
  timeError?: string;
}

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  error,
  timeError,
}: DateTimePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(getSingaporeNow());
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlotsForDate(selectedDate);
    }
  }, [selectedDate]);

  // Removed fetchBookingSettings - now using fixed 7 AM - 10 PM range from Google Calendar

  // Removed generateTimeSlots - now using Google Calendar API

  // Removed loadBlockedDates - now using Google Calendar API

  const loadTimeSlotsForDate = async (dateString: string) => {
    setIsLoadingTimeSlots(true);
    try {
      // Fetch available slots from Google Calendar API
      const response = await fetch(
        `/api/calendar/available-slots?date=${dateString}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await response.json();
      const slots: TimeSlot[] = data.slots.map((slot: any) => ({
        date: slot.date,
        time: slot.time,
        available: slot.available,
      }));

      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error("Error loading time slots:", error);
      // No fallback - Google Calendar API required
      setAvailableTimeSlots([]);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const isDateValid = (date: Date) => {
    const sgNow = getSingaporeNow();
    const sgDateToCheck = toSingaporeTime(date);
    const sgDateStartOfDay = getSingaporeDateStartOfDay(sgDateToCheck);

    // Get tomorrow's date in Singapore timezone
    const sgTomorrow = new Date(sgNow.getTime() + 24 * 60 * 60 * 1000);
    const sgTomorrowStartOfDay = getSingaporeDateStartOfDay(sgTomorrow);

    // Only allow bookings from tomorrow onwards
    return sgDateStartOfDay >= sgTomorrowStartOfDay;
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    // Simply return the time as-is since it's already in correct format (HH:MM)
    return time;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Select a date";

    // Parse the date string directly without timezone conversion
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed

    // Format as "Day, DD Month YYYY" (e.g., "Sunday, 01 September 2024")
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    };

    return date.toLocaleDateString("en-GB", options);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000));
    }
    return days;
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateValid(date)) return;

    // Convert to Singapore timezone and format
    const sgDate = toSingaporeTime(date);
    const dateString = formatSingaporeDateString(sgDate);

    onDateChange(dateString);
    onTimeChange(""); // Reset time when date changes
    setShowCalendar(false);
  };

  const handleTimeSelect = (time: string) => {
    onTimeChange(time);
    setShowTimeSlots(false);
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <div className="relative">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Preferred Date *
        </label>

        <div
          onClick={() => setShowCalendar(!showCalendar)}
          className={`w-full px-4 py-3 border rounded-xl cursor-pointer transition-all duration-200 ${
            error && !selectedDate
              ? "border-red-300 bg-red-50"
              : selectedDate
              ? "border-green-300 bg-green-50"
              : "border-neutral-300 bg-white hover:border-amber-400"
          } focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar
                className={`h-5 w-5 ${
                  error && !selectedDate ? "text-red-500" : "text-amber-600"
                }`}
              />
              <span
                className={`${
                  selectedDate ? "text-neutral-900" : "text-neutral-500"
                }`}
              >
                {formatDate(selectedDate)}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </div>
        </div>

        {/* Calendar Dropdown */}
        {showCalendar && (
          <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 w-full min-w-[320px]">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1
                    )
                  )
                }
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="font-semibold text-neutral-900">{monthYear}</h3>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1
                    )
                  )
                }
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-neutral-500 p-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isCurrentMonth =
                  day.getMonth() === currentMonth.getMonth();
                const isValid = isDateValid(day);
                const sgDay = toSingaporeTime(day);
                const isSelected =
                  selectedDate === formatSingaporeDateString(sgDay);
                const isToday = isSingaporeToday(sgDay);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => isValid && handleDateSelect(day)}
                    disabled={!isValid}
                    className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                      isSelected
                        ? "bg-amber-600 text-white shadow-md"
                        : isToday && isCurrentMonth
                        ? "bg-amber-100 text-amber-800 font-medium"
                        : isValid && isCurrentMonth
                        ? "hover:bg-amber-50 text-neutral-900"
                        : !isValid && isCurrentMonth
                        ? "text-neutral-300 cursor-not-allowed"
                        : "text-neutral-300"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Time Picker */}
      <div className="relative">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Preferred Time
        </label>

        <div
          onClick={() => setShowTimeSlots(!showTimeSlots)}
          className={`w-full px-4 py-3 border rounded-xl cursor-pointer transition-all duration-200 ${
            timeError && !selectedTime
              ? "border-red-300 bg-red-50"
              : selectedTime
              ? "border-green-300 bg-green-50"
              : "border-neutral-300 bg-white hover:border-amber-400"
          } focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isLoadingTimeSlots ? (
                <div className="w-5 h-5 border-2 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              ) : (
                <Clock className="h-5 w-5 text-amber-600" />
              )}
              <span
                className={`${
                  selectedTime ? "text-neutral-900" : "text-neutral-500"
                }`}
              >
                {isLoadingTimeSlots
                  ? "Loading available times..."
                  : selectedTime
                  ? formatTime(selectedTime)
                  : "Select a time"}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </div>
        </div>

        {/* Time Slots Dropdown */}
        {showTimeSlots && (
          <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-h-64 overflow-y-auto">
            <div className="p-3 border-b border-neutral-100 bg-neutral-50">
              <h4 className="font-medium text-neutral-900">Available Times</h4>
              <p className="text-xs text-neutral-600">07:00 - 22:00</p>
            </div>

            <div className="p-2">
              {isLoadingTimeSlots ? (
                // Beautiful loading spinner
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="relative">
                    {/* Main spinning ring */}
                    <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>

                    {/* Inner pulsing dot */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* Loading text with subtle animation */}
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-amber-700 animate-pulse">
                      Checking availability...
                    </p>
                    <p className="text-xs text-neutral-500">
                      Please wait while we find your perfect time
                    </p>
                  </div>

                  {/* Animated dots */}
                  <div className="flex space-x-1">
                    <div
                      className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              ) : (
                // Existing time slots
                availableTimeSlots.map((timeSlot) => {
                  const available = timeSlot.available;
                  const timeDisplay = formatTime(timeSlot.time);

                  return (
                    <button
                      key={timeSlot.time}
                      type="button"
                      onClick={() =>
                        available && handleTimeSelect(timeSlot.time)
                      }
                      disabled={!available}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !available
                          ? "text-neutral-400 cursor-not-allowed bg-neutral-100"
                          : selectedTime === timeSlot.time
                          ? "bg-amber-600 text-white"
                          : "hover:bg-amber-50 text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{timeDisplay}</span>
                        {!available && (
                          <span className="text-xs text-red-500">
                            {"Unavailable"}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {error && !selectedDate && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Please select a date for your assessment visit</span>
        </div>
      )}
      {timeError && !selectedTime && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Please select a time for your assessment visit</span>
        </div>
      )}
    </div>
  );
}
