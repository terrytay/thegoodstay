
"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface BookingSettings {
  booking_start_time: string;
  booking_end_time: string;
  booking_interval: number;
  min_advance_hours: number;
}

interface DateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  error?: string;
}

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  error,
}: DateTimePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>({
    booking_start_time: "09:00",
    booking_end_time: "17:00",
    booking_interval: 60,
    min_advance_hours: 3,
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    fetchBookingSettings();
  }, []);

  useEffect(() => {
    generateTimeSlots();
  }, [bookingSettings]);

  const fetchBookingSettings = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data } = await supabase
        .from("booking_settings")
        .select("setting_key, setting_value, setting_type");

      if (data) {
        const settings: Record<string, string | number> = {};
        data.forEach((setting) => {
          const value =
            setting.setting_type === "number"
              ? parseInt(setting.setting_value)
              : setting.setting_value;
          settings[setting.setting_key] = value;
        });
        setBookingSettings((prev) => ({ ...prev, ...settings }));
      }
    } catch (err) {
      console.error("Error fetching booking settings:", err);
    }
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const start = bookingSettings.booking_start_time;
    const end = bookingSettings.booking_end_time;
    const interval = bookingSettings.booking_interval;

    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);

    const currentTime = new Date(startTime);
    while (currentTime <= endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      slots.push(timeString);
      currentTime.setMinutes(currentTime.getMinutes() + interval);
    }

    setAvailableTimeSlots(slots);
  };

  const isDateValid = (date: Date) => {
    const now = new Date();
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    // For today's date, check if we can still book with minimum advance time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateToCheck.getTime() === today.getTime()) {
      // For today, check if there's enough time left for booking with advance notice
      const latestBookingToday = new Date();
      latestBookingToday.setHours(
        parseInt(bookingSettings.booking_end_time?.split(":")[0] || "17"),
        parseInt(bookingSettings.booking_end_time?.split(":")[1] || "0")
      );

      const minAdvanceTime = new Date(
        now.getTime() + bookingSettings.min_advance_hours * 60 * 60 * 1000
      );

      return minAdvanceTime <= latestBookingToday;
    }

    // For future dates, just check if it's not in the past
    return dateToCheck >= today;
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Select a date";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

    // Fix timezone issue by using local date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    onDateChange(dateString);
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
                const isSelected =
                  selectedDate === day.toISOString().split("T")[0];
                const isToday =
                  day.toDateString() === new Date().toDateString();

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

            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-2 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Bookings must be at least {bookingSettings.min_advance_hours}{" "}
                  hours in advance
                </span>
              </div>
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
            selectedTime
              ? "border-green-300 bg-green-50"
              : "border-neutral-300 bg-white hover:border-amber-400"
          } focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <span
                className={`${
                  selectedTime ? "text-neutral-900" : "text-neutral-500"
                }`}
              >
                {selectedTime ? formatTime(selectedTime) : "Select a time"}
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
              <p className="text-xs text-neutral-600">
                {bookingSettings.booking_start_time} -{" "}
                {bookingSettings.booking_end_time}
              </p>
            </div>

            <div className="p-2">
              {availableTimeSlots.map((timeSlot) => {
                // Check if this time slot is still available for the selected date
                const isTimeSlotAvailable = () => {
                  if (!selectedDate) return true;

                  const selectedDateObj = new Date(selectedDate + "T00:00:00");
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  // If selected date is today, check minimum advance time
                  if (selectedDateObj.getTime() === today.getTime()) {
                    const now = new Date();
                    const [hours, minutes] = timeSlot.split(":");
                    const slotDateTime = new Date();
                    slotDateTime.setHours(
                      parseInt(hours),
                      parseInt(minutes),
                      0,
                      0
                    );

                    const minAdvanceTime = new Date(
                      now.getTime() +
                        bookingSettings.min_advance_hours * 60 * 60 * 1000
                    );
                    return slotDateTime >= minAdvanceTime;
                  }

                  return true;
                };

                const available = isTimeSlotAvailable();

                return (
                  <button
                    key={timeSlot}
                    type="button"
                    onClick={() => available && handleTimeSelect(timeSlot)}
                    disabled={!available}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !available
                        ? "text-neutral-400 cursor-not-allowed bg-neutral-100"
                        : selectedTime === timeSlot
                        ? "bg-amber-600 text-white"
                        : "hover:bg-amber-50 text-neutral-900"
                    }`}
                  >
                    {formatTime(timeSlot)}
                    {!available && (
                      <span className="ml-2 text-xs">(Too soon)</span>
                    )}
                  </button>
                );
              })}
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
    </div>
  );
}
