import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScheduleEditor, {
  parseSchedule,
  emptySchedule,
  isMorning,
  GIORNI,
  GIORNI_FULL,
} from '../components/ScheduleEditor';

describe('ScheduleEditor utilities', () => {
  it('returns empty schedule object structure', () => {
    const empty = emptySchedule();
    expect(empty).toEqual({ defaults: [], overrides: [] });
  });

  describe('parseSchedule', () => {
    it('handles null, undefined, or primitive input gracefully', () => {
      expect(parseSchedule(null)).toEqual({ defaults: [], overrides: [] });
      expect(parseSchedule(undefined)).toEqual({ defaults: [], overrides: [] });
      expect(parseSchedule('invalid')).toEqual({ defaults: [], overrides: [] });
    });

    it('ensures defaults and overrides are arrays even if missing or malformed', () => {
      const parsed = parseSchedule({ defaults: 'not-array', overrides: null });
      expect(parsed).toEqual({ defaults: [], overrides: [] });
    });

    it('preserves valid defaults and overrides', () => {
      const input = {
        defaults: [{ id: '1', days: ['lunedi'], startTime: '09:00', endTime: '12:00' }],
        overrides: [{ id: '2', dateFrom: '2026-09-02', closed: true }],
      };
      expect(parseSchedule(input)).toEqual(input);
    });
  });

  describe('isMorning helper', () => {
    it('returns true for times before 12:30 (MIDDAY_THRESHOLD_MINUTES)', () => {
      expect(isMorning('09:00')).toBe(true);
      expect(isMorning('11:45')).toBe(true);
      expect(isMorning('12:29')).toBe(true);
    });

    it('returns false for times at or after 12:30 or invalid input', () => {
      expect(isMorning('12:30')).toBe(false);
      expect(isMorning('15:00')).toBe(false);
      expect(isMorning('19:30')).toBe(false);
      expect(isMorning('')).toBe(false);
      expect(isMorning(null)).toBe(false);
    });
  });

  describe('Days constants', () => {
    it('has 7 days defined in GIORNI and GIORNI_FULL', () => {
      expect(GIORNI).toHaveLength(7);
      expect(Object.keys(GIORNI_FULL)).toHaveLength(7);
      expect(GIORNI_FULL.lunedi).toBe('Lunedì');
    });
  });
});

describe('ScheduleEditor Component', () => {
  it('renders correctly with default tabs and buttons', () => {
    const onChange = vi.fn();
    render(<ScheduleEditor value={null} onChange={onChange} />);

    expect(screen.getByText('Orari Predefiniti')).toBeInTheDocument();
    expect(screen.getByText('Eccezioni / Orari Speciali')).toBeInTheDocument();
  });
});
