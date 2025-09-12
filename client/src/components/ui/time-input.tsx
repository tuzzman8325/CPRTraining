import { useState, useEffect } from 'react';
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
    let input = e.target.value.replace(/[^\d]/g, ''); // Remove non-digits
    
    // Limit to 4 digits max (HHMM)
    if (input.length > 4) {
      input = input.substring(0, 4);
    }
    
    let formattedInput = '';
    
    if (input.length === 0) {
      formattedInput = '';
    } else if (input.length === 1) {
      // Single digit hour (1-9)
      const hour = parseInt(input);
      if (hour >= 1 && hour <= 9) {
        formattedInput = input;
      } else {
        formattedInput = '1'; // Default to 1 if invalid
      }
    } else if (input.length === 2) {
      // Two digit hour (10-12) or hour with first minute digit
      const hour = parseInt(input.substring(0, 2));
      if (hour >= 1 && hour <= 12) {
        formattedInput = input;
      } else if (hour > 12) {
        // If hour > 12, treat first digit as hour and second as first minute digit
        const firstDigit = parseInt(input.substring(0, 1));
        const secondDigit = input.substring(1, 2);
        if (firstDigit >= 1 && firstDigit <= 9) {
          formattedInput = `${firstDigit}:${secondDigit}`;
        } else {
          formattedInput = '1:0';
        }
      } else {
        formattedInput = '1'; // Default to 1 if invalid
      }
    } else if (input.length === 3) {
      // HMM format - add colon after first digit or first two digits
      const firstDigit = parseInt(input.substring(0, 1));
      const hour = parseInt(input.substring(0, 2));
      
      if (hour >= 1 && hour <= 12) {
        // Two digit hour (10-12)
        formattedInput = `${input.substring(0, 2)}:${input.substring(2, 3)}`;
      } else if (firstDigit >= 1 && firstDigit <= 9) {
        // Single digit hour
        formattedInput = `${input.substring(0, 1)}:${input.substring(1, 3)}`;
      } else {
        formattedInput = '1:00';
      }
    } else if (input.length === 4) {
      // HHMM format
      const firstDigit = parseInt(input.substring(0, 1));
      const hour = parseInt(input.substring(0, 2));
      
      if (hour >= 1 && hour <= 12) {
        // Two digit hour (10-12)
        const minutes = parseInt(input.substring(2, 4));
        const validMinutes = Math.min(59, Math.max(0, minutes));
        formattedInput = `${input.substring(0, 2)}:${validMinutes.toString().padStart(2, '0')}`;
      } else if (firstDigit >= 1 && firstDigit <= 9) {
        // Single digit hour
        const minutes = parseInt(input.substring(1, 4));
        const validMinutes = Math.min(59, Math.max(0, minutes));
        formattedInput = `${input.substring(0, 1)}:${validMinutes.toString().padStart(2, '0')}`;
      } else {
        formattedInput = '1:00';
      }
    }
    
    setTimeValue(formattedInput);
    if (formattedInput) {
      updateFullValue(formattedInput, period);
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