import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  'data-testid'?: string;
}

export function TimeInput({ value = '', onChange, placeholder = '9:00 AM', 'data-testid': testId }: TimeInputProps) {
  const [timeValue, setTimeValue] = useState('');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse the initial value when component mounts or value changes
  useEffect(() => {
    if (value) {
      const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
      const match = value.match(timeRegex);
      
      if (match) {
        const [, hours, minutes, ampm] = match;
        setTimeValue(`${hours}:${minutes}`);
        setPeriod(ampm.toUpperCase() as 'AM' | 'PM');
      } else {
        // Try to parse just the time part without AM/PM
        const timeOnlyRegex = /^(\d{1,2}):?(\d{0,2})$/;
        const timeMatch = value.match(timeOnlyRegex);
        if (timeMatch) {
          const [, hours, minutes = '00'] = timeMatch;
          setTimeValue(`${hours}:${minutes.padStart(2, '0')}`);
        }
      }
    } else {
      setTimeValue('');
      setPeriod('AM');
    }
  }, [value]);

  // Format time input as user types
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    const cursorPosition = input.selectionStart || 0;
    
    // Allow completely empty field
    if (rawValue === '') {
      setTimeValue('');
      onChange('');
      return;
    }
    
    // Extract digits only
    const digits = rawValue.replace(/[^\d]/g, '');
    
    // If no digits, clear everything
    if (digits === '') {
      setTimeValue('');
      onChange('');
      return;
    }
    
    // Limit to 4 digits max
    const limitedDigits = digits.substring(0, 4);
    const previousValue = timeValue;
    
    // Format based on number of digits  
    let formatted = '';
    
    if (limitedDigits.length === 1) {
      formatted = limitedDigits;
    } else if (limitedDigits.length === 2) {
      // For 2 digits, just display them as-is (don't auto-add colon yet)
      // Let the user type the third digit before deciding on formatting
      formatted = limitedDigits;
    } else if (limitedDigits.length === 3) {
      formatted = `${limitedDigits[0]}:${limitedDigits.substring(1)}`;
    } else if (limitedDigits.length === 4) {
      const firstTwo = parseInt(limitedDigits.substring(0, 2));
      if (firstTwo <= 12) {
        const minutes = Math.min(59, parseInt(limitedDigits.substring(2)));
        formatted = `${limitedDigits.substring(0, 2)}:${minutes.toString().padStart(2, '0')}`;
      } else {
        const minutes = Math.min(59, parseInt(limitedDigits.substring(1, 3)));
        formatted = `${limitedDigits[0]}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    
    setTimeValue(formatted);
    
    // Calculate new cursor position
    const lengthDiff = formatted.length - previousValue.length;
    let newCursorPosition = cursorPosition;
    
    // If a colon was added and cursor is after it, adjust position
    if (lengthDiff > 0 && formatted.includes(':') && !previousValue.includes(':')) {
      const colonIndex = formatted.indexOf(':');
      if (cursorPosition > colonIndex) {
        newCursorPosition = cursorPosition + 1;
      }
    }
    
    // Restore cursor position after React re-renders
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
    
    // Only call onChange for complete times (with colon), not partial typing
    if (formatted && formatted.includes(':')) {
      updateFullValue(formatted, period);
    }
  };

  // Handle AM/PM selection
  const handlePeriodChange = (newPeriod: string) => {
    const newPeriodValue = newPeriod as 'AM' | 'PM';
    setPeriod(newPeriodValue);
    if (timeValue) {
      updateFullValue(timeValue, newPeriodValue);
    }
  };

  // Combine time and period into full value
  const updateFullValue = (time: string, ampm: 'AM' | 'PM') => {
    if (time) {
      const parts = time.split(':');
      if (parts.length === 2) {
        const hours = parts[0];
        const minutes = parts[1].padStart(2, '0');
        onChange(`${hours}:${minutes} ${ampm}`);
      } else if (parts.length === 1 && parts[0]) {
        onChange(`${parts[0]}:00 ${ampm}`);
      }
    }
  };

  // Handle blur to ensure proper formatting
  const handleBlur = () => {
    if (timeValue) {
      const parts = timeValue.split(':');
      if (parts.length === 1) {
        // Add minutes if only hours provided
        const hour = parseInt(parts[0]);
        if (hour >= 1 && hour <= 12) {
          const formatted = `${parts[0]}:00`;
          setTimeValue(formatted);
          updateFullValue(formatted, period);
        }
      } else if (parts.length === 2) {
        // Ensure proper formatting
        const hour = parseInt(parts[0]);
        const minutes = parseInt(parts[1]) || 0;
        if (hour >= 1 && hour <= 12) {
          const validMinutes = Math.min(59, Math.max(0, minutes));
          const formatted = `${parts[0]}:${validMinutes.toString().padStart(2, '0')}`;
          setTimeValue(formatted);
          updateFullValue(formatted, period);
        }
      }
    }
  };

  return (
    <div className="flex space-x-2">
      <Input
        ref={inputRef}
        value={timeValue}
        onChange={handleTimeChange}
        onBlur={handleBlur}
        placeholder="9:00"
        className="flex-1"
        maxLength={5}
        data-testid={testId}
      />
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}