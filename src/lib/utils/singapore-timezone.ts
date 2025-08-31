/**
 * Singapore Timezone Utilities (GMT+8)
 * No external dependencies - uses native JavaScript Date methods
 */

const SINGAPORE_TIMEZONE_OFFSET = 8 * 60; // Singapore is UTC+8 (480 minutes)

/**
 * Get current date and time in Singapore timezone
 */
export function getSingaporeNow(): Date {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (SINGAPORE_TIMEZONE_OFFSET * 60000));
}

/**
 * Convert any date to Singapore timezone
 */
export function toSingaporeTime(date: Date | string): Date {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const utc = inputDate.getTime() + (inputDate.getTimezoneOffset() * 60000);
  return new Date(utc + (SINGAPORE_TIMEZONE_OFFSET * 60000));
}

/**
 * Format Singapore date as YYYY-MM-DD string
 */
export function formatSingaporeDateString(date: Date | string): string {
  const sgDate = toSingaporeTime(typeof date === 'string' ? new Date(date) : date);
  const year = sgDate.getFullYear();
  const month = String(sgDate.getMonth() + 1).padStart(2, '0');
  const day = String(sgDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format Singapore time as HH:MM string
 */
export function formatSingaporeTimeString(date: Date | string): string {
  const sgDate = toSingaporeTime(typeof date === 'string' ? new Date(date) : date);
  const hours = String(sgDate.getHours()).padStart(2, '0');
  const minutes = String(sgDate.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format Singapore datetime as YYYY-MM-DD HH:MM string
 */
export function formatSingaporeDateTimeString(date: Date | string): string {
  const dateStr = formatSingaporeDateString(date);
  const timeStr = formatSingaporeTimeString(date);
  return `${dateStr} ${timeStr}`;
}

/**
 * Create a Singapore date from date string (YYYY-MM-DD)
 * Ensures the date is interpreted in Singapore timezone
 */
export function createSingaporeDate(dateString: string, timeString?: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  let hours = 0, minutes = 0;
  
  if (timeString) {
    [hours, minutes] = timeString.split(':').map(Number);
  }
  
  // Create date in Singapore timezone
  const sgDate = new Date();
  sgDate.setFullYear(year, month - 1, day);
  sgDate.setHours(hours, minutes, 0, 0);
  
  // Adjust for Singapore timezone
  const utc = sgDate.getTime() - (SINGAPORE_TIMEZONE_OFFSET * 60000);
  return new Date(utc);
}

/**
 * Check if a Singapore date is today
 */
export function isSingaporeToday(date: Date | string): boolean {
  const sgToday = formatSingaporeDateString(getSingaporeNow());
  const sgDate = formatSingaporeDateString(date);
  return sgToday === sgDate;
}

/**
 * Check if a Singapore date is in the past
 */
export function isSingaporePast(date: Date | string): boolean {
  const sgNow = getSingaporeNow();
  const sgDate = toSingaporeTime(date);
  return sgDate < sgNow;
}

/**
 * Check if a Singapore date is in the future
 */
export function isSingaporeFuture(date: Date | string): boolean {
  const sgNow = getSingaporeNow();
  const sgDate = toSingaporeTime(date);
  return sgDate > sgNow;
}

/**
 * Add hours to a Singapore date
 */
export function addHoursToSingaporeDate(date: Date | string, hours: number): Date {
  const sgDate = toSingaporeTime(date);
  return new Date(sgDate.getTime() + (hours * 60 * 60 * 1000));
}

/**
 * Get Singapore date at start of day (00:00:00)
 */
export function getSingaporeDateStartOfDay(date: Date | string): Date {
  const sgDate = toSingaporeTime(date);
  sgDate.setHours(0, 0, 0, 0);
  return sgDate;
}

/**
 * Get Singapore date at end of day (23:59:59)
 */
export function getSingaporeDateEndOfDay(date: Date | string): Date {
  const sgDate = toSingaporeTime(date);
  sgDate.setHours(23, 59, 59, 999);
  return sgDate;
}

/**
 * Format Singapore date for display (e.g., "Monday, December 25, 2023")
 */
export function formatSingaporeDateForDisplay(date: Date | string): string {
  const sgDate = toSingaporeTime(date);
  return sgDate.toLocaleDateString('en-SG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Singapore'
  });
}

/**
 * Format Singapore time for display (e.g., "2:30 PM")
 */
export function formatSingaporeTimeForDisplay(date: Date | string): string {
  const sgDate = toSingaporeTime(date);
  return sgDate.toLocaleTimeString('en-SG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Singapore'
  });
}

/**
 * Convert Singapore date to ISO string for database storage
 */
export function singaporeDateToISOString(date: Date | string): string {
  const sgDate = toSingaporeTime(date);
  // Convert back to UTC for ISO string
  const utc = sgDate.getTime() - (SINGAPORE_TIMEZONE_OFFSET * 60000);
  return new Date(utc).toISOString();
}

/**
 * Parse ISO string from database to Singapore date
 */
export function parseISOToSingaporeDate(isoString: string): Date {
  return toSingaporeTime(new Date(isoString));
}

/**
 * Get current Singapore timezone info
 */
export function getSingaporeTimezoneInfo() {
  return {
    timezone: 'Asia/Singapore',
    offset: '+08:00',
    offsetMinutes: SINGAPORE_TIMEZONE_OFFSET,
    name: 'Singapore Standard Time',
    abbreviation: 'SGT'
  };
}