import { describe, test, expect } from '../tests/test-utils';
import { formatMinutes, parseNaturalLanguage } from '../src/lib/utils';
import '../tests/setup';

describe('Utility Functions', () => {
  describe('formatMinutes', () => {
    test('should format minutes only', () => {
      expect(formatMinutes(30)).toBe('30m');
      expect(formatMinutes(45)).toBe('45m');
    });

    test('should format hours only', () => {
      expect(formatMinutes(60)).toBe('1h');
      expect(formatMinutes(120)).toBe('2h');
      expect(formatMinutes(180)).toBe('3h');
    });

    test('should format hours and minutes', () => {
      expect(formatMinutes(90)).toBe('1h 30m');
      expect(formatMinutes(150)).toBe('2h 30m');
      expect(formatMinutes(125)).toBe('2h 5m');
    });
  });

  describe('parseNaturalLanguage', () => {
    test('should parse "today" references', () => {
      const today = new Date().toISOString().split('T')[0];
      
      const result = parseNaturalLanguage('Meeting with Sarah today');
      expect(result.name).toBe('Meeting with Sarah');
      expect(result.date).toBe(today);
    });

    test('should parse "tomorrow" references', () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const result = parseNaturalLanguage('Call John tomorrow');
      expect(result.name).toBe('Call John');
      expect(result.date).toBe(tomorrow);
    });

    test('should parse AM/PM time formats', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = parseNaturalLanguage('Lunch at 2 PM today');
      expect(result.name).toBe('Lunch today');
      expect(result.date).toBe(today);
      expect(result.time).toBe('14:00');
    });

    test('should parse 24-hour time formats', () => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const result = parseNaturalLanguage('Meeting at 14:30 tomorrow');
      expect(result.name).toBe('Meeting tomorrow');
      expect(result.date).toBe(tomorrow);
      expect(result.time).toBe('14:30');
    });

    test('should handle single digit hours', () => {
      const result = parseNaturalLanguage('Breakfast at 8 AM today');
      expect(result.name).toBe('Breakfast today');
      expect(result.time).toBe('8:00');
    });

    test('should return original text when no patterns found', () => {
      const result = parseNaturalLanguage('Just a regular task');
      expect(result.name).toBe('Just a regular task');
      expect(result.date).toBeUndefined();
      expect(result.time).toBeUndefined();
    });

    test('should handle mixed case', () => {
      const today = new Date().toISOString().split('T')[0];
      
      const result = parseNaturalLanguage('Meeting TODAY');
      expect(result.name).toBe('Meeting');
      expect(result.date).toBe(today);
    });

    test('should handle multiple spaces', () => {
      const result = parseNaturalLanguage('Task   with   extra   spaces');
      expect(result.name).toBe('Task with extra spaces');
    });
  });
});
