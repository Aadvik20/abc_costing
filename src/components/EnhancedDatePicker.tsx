import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import 'react-datepicker/dist/react-datepicker.css';

interface EnhancedDatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  showTimeSelect?: boolean;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  isClearable?: boolean;
  showMonthDropdown?: boolean;
  showYearDropdown?: boolean;
  dropdownMode?: 'scroll' | 'select';
  showMonthYearPicker?: boolean;
  showYearPicker?: boolean;
  yearDropdownItemNumber?: number;
}

const EnhancedDatePicker = ({
  selectedDate,
  onChange,
  placeholder = 'Select date...',
  className = '',
  showTimeSelect = false,
  dateFormat = 'dd-MMM-yyyy',
  minDate = new Date(new Date().getFullYear() - 75, 0, 1),
  maxDate = new Date(new Date().getFullYear() + 50, 11, 31),
  disabled = false,
  showMonthDropdown = true,
  showYearDropdown = true,
  dropdownMode = 'select',
  showMonthYearPicker = false,
  showYearPicker = false,
  yearDropdownItemNumber = 50,
}: EnhancedDatePickerProps) => {
  const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(({ value, onClick }, ref) => (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      ref={ref}
      disabled={disabled}
      className={cn('w-full z-50 hover:bg-white justify-start text-left font-normal h-10', !value && 'text-muted-foreground', className)}
    >
      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
      <span className={cn('truncate', !value && 'text-muted-foreground')}>{value || placeholder}</span>
    </Button>
  ));

  CustomInput.displayName = 'DatePickerCustomInput';
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onChange}
      customInput={<CustomInput />}
      wrapperClassName="w-full"
      showTimeSelect={showTimeSelect}
      dateFormat={dateFormat}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      showMonthDropdown={showMonthDropdown}
      showYearDropdown={showYearDropdown}
      dropdownMode={dropdownMode}
      showMonthYearPicker={showMonthYearPicker}
      showYearPicker={showYearPicker}
      yearDropdownItemNumber={yearDropdownItemNumber}
      scrollableYearDropdown={false}
      className="w-full z-50"
      calendarClassName="bg-white shadow-lg border z-50 border-gray-200 rounded-md stable-height-calendar"
      popperClassName="z-50"
      popperPlacement="bottom-start"
      fixedHeight
      showWeekNumbers={false}
    />
  );
};

export default EnhancedDatePicker;
