import React, { useState, useEffect } from 'react';
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear, parse } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

interface DateRangeSelectorProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedRange,
  onRangeChange
}) => {
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Predefined date ranges
  const dateRanges: DateRange[] = [
    {
      from: subDays(new Date(), 7),
      to: new Date(),
      label: 'Last 7 days'
    },
    {
      from: subDays(new Date(), 30),
      to: new Date(),
      label: 'Last 30 days'
    },
    {
      from: startOfMonth(new Date()),
      to: new Date(),
      label: 'This month'
    },
    {
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
      label: 'Last month'
    },
    {
      from: startOfYear(new Date()),
      to: new Date(),
      label: 'Year to date'
    },
    {
      from: subYears(new Date(), 1),
      to: new Date(),
      label: 'Last 12 months'
    },
  ];

  // Initialize custom dates from selected range when custom range is opened
  useEffect(() => {
    if (showCustomRange) {
      setCustomStartDate(format(selectedRange.from, 'yyyy-MM-dd'));
      setCustomEndDate(format(selectedRange.to, 'yyyy-MM-dd'));
    }
  }, [showCustomRange, selectedRange]);

  // Handle range selection
  const handleRangeSelect = (range: DateRange) => {
    onRangeChange(range);
    setShowCustomRange(false);
  };

  // Handle custom range submission
  const handleCustomRangeSubmit = () => {
    if (customStartDate && customEndDate) {
      const from = new Date(customStartDate);
      const to = new Date(customEndDate);
      
      if (from <= to) {
        const customRange: DateRange = {
          from,
          to,
          label: `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`
        };
        
        onRangeChange(customRange);
        setShowCustomRange(false);
      } else {
        // Optionally, show an error or swap dates
        alert('Start date must be before or equal to end date');
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <select
          value={selectedRange.label}
          onChange={(e) => {
            const label = e.target.value;
            if (label === 'custom') {
              setShowCustomRange(true);
              return;
            }
            
            const range = dateRanges.find(r => r.label === label);
            if (range) {
              handleRangeSelect(range);
            }
          }}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        >
          {dateRanges.map((range) => (
            <option key={range.label} value={range.label}>
              {range.label}
            </option>
          ))}
          <option value="custom">Custom range</option>
        </select>
        
        <div className="text-sm text-gray-500">
          {format(selectedRange.from, 'MMM d')} - {format(selectedRange.to, 'MMM d')}
        </div>
      </div>

      {/* Custom date range modal */}
      {showCustomRange && (
        <div className="absolute z-10 mt-2 right-0 bg-white rounded-md shadow-lg p-4 border border-gray-200 w-80">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => setShowCustomRange(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-darkBrown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={handleCustomRangeSubmit}
              disabled={!customStartDate || !customEndDate}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;