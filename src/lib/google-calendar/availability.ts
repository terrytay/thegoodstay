import { createCalendarClient, CALENDAR_ID } from "./config";
import {
  createSingaporeDate,
  singaporeDateToISOString,
  getSingaporeDateStartOfDay,
  addHoursToSingaporeDate,
} from "@/lib/utils/singapore-timezone";

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  available: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string; // ISO string
  end: string; // ISO string
  allDay?: boolean;
}

/**
 * Check if a specific date and time is available by querying Google Calendar
 */
export async function checkAvailability(
  date: string,
  time: string
): Promise<boolean> {
  try {
    // Ensure calendar access before checking availability
    const accessResult = await ensureCalendarAccess();
    if (!accessResult.success) {
      console.error("Calendar access failed:", accessResult.error);
      return false; // Default to unavailable if can't access calendar
    }

    const calendar = createCalendarClient();

    // Create Singapore timezone datetime strings
    const slotStart = `${date}T${time}:00+08:00`;

    // Add 1 hour for slot end time
    const [hour, minute] = time.split(":").map(Number);
    const endHour = hour + 1;
    const slotEnd = `${date}T${endHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:00+08:00`;

    // Query Google Calendar for events during this time
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: slotStart,
      timeMax: slotEnd,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    // If there are any events during this time, the slot is not available
    return events.length === 0;
  } catch (error) {
    console.error("Error checking Google Calendar availability:", error);

    // In case of API error, default to unavailable for safety
    return false;
  }
}

/**
 * Get all blocked time slots for a specific date from Google Calendar
 */
export async function getBlockedSlotsForDate(
  date: string
): Promise<CalendarEvent[]> {
  try {
    // Ensure calendar access
    const accessResult = await ensureCalendarAccess();
    if (!accessResult.success) {
      console.error("Calendar access failed:", accessResult.error);
      return [];
    }

    const calendar = createCalendarClient();

    // Create Singapore timezone date boundaries
    // Use the exact date string to avoid any timezone shifting
    const dayStart = `${date}T00:00:00+08:00`; // Start of day in Singapore timezone
    const dayEnd = `${date}T23:59:59+08:00`; // End of day in Singapore timezone

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: dayStart,
      timeMax: dayEnd,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    return events.map((event) => ({
      id: event.id || "",
      summary: event.summary || "Blocked",
      start: event.start?.dateTime || event.start?.date || "",
      end: event.end?.dateTime || event.end?.date || "",
      allDay: !event.start?.dateTime, // If no dateTime, it's an all-day event
    }));
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    return [];
  }
}

/**
 * Get available time slots for a specific date
 * Generates slots from 9 AM to 6 PM, excluding blocked periods
 */
export async function getAvailableTimeSlotsForDate(
  date: string
): Promise<TimeSlot[]> {
  try {
    const blockedSlots = await getBlockedSlotsForDate(date);
    const timeSlots: TimeSlot[] = [];

    // Generate hourly slots from 7 AM to 10 PM
    for (let hour = 7; hour <= 22; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;

      // Create Singapore timezone slot strings
      const slotStart = `${date}T${timeString}:00+08:00`;
      const slotEndHour = hour + 1;
      const slotEnd = `${date}T${slotEndHour
        .toString()
        .padStart(2, "0")}:00:00+08:00`;

      // Convert to Date objects for comparison
      const slotStartDate = new Date(slotStart);
      const slotEndDate = new Date(slotEnd);

      // Check if this slot conflicts with any blocked events
      const isBlocked = blockedSlots.some((event) => {
        if (event.allDay) return true; // All-day events block the entire day

        // Google Calendar events are already in the correct timezone
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        // Check for overlap: slot overlaps if slot_start < event_end AND slot_end > event_start
        return slotStartDate < eventEnd && slotEndDate > eventStart;
      });

      timeSlots.push({
        date,
        time: timeString,
        available: !isBlocked,
      });
    }

    return timeSlots;
  } catch (error) {
    console.error("Error getting available time slots:", error);

    // Return all slots as unavailable in case of error
    const timeSlots: TimeSlot[] = [];
    for (let hour = 7; hour <= 22; hour++) {
      timeSlots.push({
        date,
        time: `${hour.toString().padStart(2, "0")}:00`,
        available: false,
      });
    }
    return timeSlots;
  }
}

/**
 * Ensure the calendar is in the service account's calendar list
 */
export async function ensureCalendarAccess(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const calendar = createCalendarClient();

    // Check if calendar is already accessible
    const currentList = await calendar.calendarList.list();
    const existingCalendar = currentList.data.items?.find(
      (cal) =>
        cal.id === CALENDAR_ID || (CALENDAR_ID === "primary" && cal.primary)
    );

    if (existingCalendar) {
      return { success: true };
    }

    // If not accessible, try to insert it
    if (CALENDAR_ID !== "primary") {
      try {
        await calendar.calendarList.insert({
          requestBody: {
            id: CALENDAR_ID,
            selected: true,
          },
        });

        return { success: true };
      } catch (insertError) {
        return {
          success: false,
          error: `Calendar not shared with service account. Please share '${CALENDAR_ID}' with your service account email.`,
        };
      }
    }

    return {
      success: false,
      error: `Calendar with ID '${CALENDAR_ID}' not found or not accessible`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Test the Google Calendar connection
 */
export async function testCalendarConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // First ensure calendar access
    const accessResult = await ensureCalendarAccess();
    if (!accessResult.success) {
      return accessResult;
    }

    const calendar = createCalendarClient();

    // Test reading events
    await calendar.events.list({
      calendarId: CALENDAR_ID,
      maxResults: 1,
      timeMin: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create a calendar event to block a booking time slot
 */
export async function createBookingEvent(
  date: string, // YYYY-MM-DD
  time: string, // HH:MM
  bookingData: {
    bookingId: string;
    bookingToken: string;
    ownerName: string;
    dogName: string;
    locationType: "home" | "park";
    ownerEmail?: string;
    ownerPhone?: string;
  }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    // Ensure calendar access
    const accessResult = await ensureCalendarAccess();
    if (!accessResult.success) {
      console.error("Calendar access failed:", accessResult.error);
      return { success: false, error: accessResult.error };
    }

    const calendar = createCalendarClient();
    // Create Singapore timezone datetime strings for 1-hour assessment slot
    const [hour, minute] = time.split(":").map(Number);
    const startDateTime = `${date}T${time}:00+08:00`;
    const endHour = hour + 1;
    const endDateTime = `${date}T${endHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:00+08:00`;

    // Create event title and description
    const eventTitle = `Dog Assessment - ${bookingData.dogName} (${bookingData.ownerName})`;
    const eventDescription = `
Booking Details:
• Booking ID: ${bookingData.bookingToken}
• Dog: ${bookingData.dogName}
• Owner: ${bookingData.ownerName}
• Location: ${
      bookingData.locationType === "home" ? "Home Visit" : "Clementi Woods Park"
    }
${bookingData.ownerEmail ? `• Email: ${bookingData.ownerEmail}` : ""}
${bookingData.ownerPhone ? `• Phone: ${bookingData.ownerPhone}` : ""}

This is an automated booking from The Good Stay assessment system.
`.trim();
    console.log(endDateTime.split("+")[0]);
    // Create the calendar event
    const event = {
      summary: eventTitle,
      description: eventDescription,
      start: {
        dateTime: startDateTime.split("+")[0].slice(0, -3),
        timeZone: "Asia/Singapore",
      },
      end: {
        dateTime: endDateTime.split("+")[0],
        timeZone: "Asia/Singapore",
      },
      // Add booking metadata for easy identification
      extendedProperties: {
        private: {
          bookingId: bookingData.bookingId,
          bookingToken: bookingData.bookingToken,
          source: "the-good-stay-booking-system",
        },
      },
      // Set color to distinguish booking events (optional)
      colorId: "9", // Blue color
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: event,
    });

    const eventId = response.data.id;
    if (eventId) {
      console.log(
        `Calendar event created successfully: ${eventId} for booking ${bookingData.bookingToken}`
      );
      return { success: true, eventId };
    } else {
      return {
        success: false,
        error: "Failed to create calendar event - no event ID returned",
      };
    }
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a booking event from the calendar
 */
export async function deleteBookingEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Ensure calendar access
    const accessResult = await ensureCalendarAccess();
    if (!accessResult.success) {
      console.error("Calendar access failed:", accessResult.error);
      return { success: false, error: accessResult.error };
    }

    const calendar = createCalendarClient();

    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

    console.log(`Calendar event deleted successfully: ${eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Find and delete booking events by booking ID
 */
export async function deleteBookingEventsByBookingId(
  bookingId: string
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    // Ensure calendar access
    const accessResult = await ensureCalendarAccess();
    if (!accessResult.success) {
      console.error("Calendar access failed:", accessResult.error);
      return { success: false, deletedCount: 0, error: accessResult.error };
    }

    const calendar = createCalendarClient();

    // Search for events with the booking ID in extended properties
    // Note: Google Calendar API doesn't support searching by extended properties directly
    // So we'll search events in a reasonable time range (next 6 months)
    const searchTimeMin = new Date().toISOString();
    const searchTimeMax = new Date(
      Date.now() + 6 * 30 * 24 * 60 * 60 * 1000
    ).toISOString(); // 6 months from now

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: searchTimeMin,
      timeMax: searchTimeMax,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    const bookingEvents = events.filter(
      (event) =>
        event.extendedProperties?.private?.bookingId === bookingId ||
        event.extendedProperties?.private?.bookingToken === bookingId // Also check by booking token
    );

    let deletedCount = 0;
    for (const event of bookingEvents) {
      if (event.id) {
        const deleteResult = await deleteBookingEvent(event.id);
        if (deleteResult.success) {
          deletedCount++;
        }
      }
    }

    console.log(
      `Deleted ${deletedCount} calendar events for booking ${bookingId}`
    );
    return { success: true, deletedCount };
  } catch (error) {
    console.error("Error finding/deleting booking events:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
