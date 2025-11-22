import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

export function parseNaturalLanguage(input: string): {
  name: string;
  date?: string;
  time?: string;
} {
  const lowerInput = input.toLowerCase();
  
  // Simple patterns for common date/time references
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let date: string | undefined;
  let time: string | undefined;
  let name = input;
  
  // Check for time patterns like "1 PM", "13:00", etc.
  const timeMatch = input.match(/\bat\s+(\d{1,2})\s*(?:AM|PM|am|pm)|\bat\s+(\d{1,2}):(\d{2})/);
  const hasDateWord = lowerInput.includes('today') || lowerInput.includes('tomorrow');
  
  if (timeMatch) {
    if (timeMatch[1]) {
      // "at 1 PM" format
      const hour = parseInt(timeMatch[1]);
      const isPM = input.toLowerCase().includes('pm');
      time = `${isPM && hour < 12 ? hour + 12 : hour}:00`;
      // Remove the time from the name, but keep "at" if there's a date word
      if (hasDateWord) {
        name = name.replace(/\s+at\s+\d{1,2}\s*(?:AM|PM|am|pm)/gi, ' at');
      } else {
        name = name.replace(/\s*at\s+\d{1,2}\s*(?:AM|PM|am|pm)\s*/gi, ' ');
      }
    } else if (timeMatch[2] && timeMatch[3]) {
      // "at 13:00" format
      time = `${timeMatch[2]}:${timeMatch[3]}`;
      // Remove the time from the name, but keep "at" if there's a date word
      if (hasDateWord) {
        name = name.replace(/\s+at\s+\d{1,2}:\d{2}/gi, ' at');
      } else {
        name = name.replace(/\s*at\s+\d{1,2}:\d{2}\s*/gi, ' ');
      }
    }
  }
  
  // Check for "today"
  if (lowerInput.includes('today')) {
    date = today.toISOString().split('T')[0];
    // Remove "today" from name unless there's a time pattern
    if (!timeMatch) {
      name = name.replace(/\s*today\s*/gi, ' ').trim();
    }
  }
  
  // Check for "tomorrow"
  if (lowerInput.includes('tomorrow')) {
    date = tomorrow.toISOString().split('T')[0];
    // Remove "tomorrow" from name unless there's a time pattern
    if (!timeMatch) {
      name = name.replace(/\s*tomorrow\s*/gi, ' ').trim();
    }
  }
  
  // If we have a time pattern and date word, remove "at" before the date word
  if (timeMatch && hasDateWord) {
    name = name.replace(/\s+at\s+(today|tomorrow)\s*$/gi, ' $1').trim();
  }
  
  // Clean up extra spaces
  name = name.replace(/\s+/g, ' ').trim();
  
  return { name, date, time };
}
