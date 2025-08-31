// This file has been removed - availability is now managed through Google Calendar API
// See src/lib/google-calendar/availability.ts for the new availability system

// Legacy export to prevent import errors during transition
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string;
}

// Placeholder for components that haven't been updated yet
export const availabilityEngine = {
  getAvailableSlots: () => Promise.resolve([]),
  getAvailabilitySummary: () => Promise.resolve(new Map()),
};