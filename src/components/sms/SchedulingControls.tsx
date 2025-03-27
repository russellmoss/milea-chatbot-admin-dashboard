import React, { useState, useEffect } from 'react';

type ScheduleType = 'immediate' | 'scheduled' | 'recurring';
export type TimeZoneType = 'America/New_York' | 'America/Chicago' | 'America/Denver' | 'America/Los_Angeles' | 'America/Anchorage' | 'Pacific/Honolulu' | 'UTC' | 'Europe/London';
type RecurringType = 'daily' | 'weekly' | 'monthly' | 'custom' | null;

interface SchedulingOption {
  id: ScheduleType;
  name: string;
}

interface RecurringPattern {
  type: RecurringType;
  interval: number;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number;
  endDate?: string;
  occurrences?: number;
}

export interface ScheduleSettings {
  type: ScheduleType;
  scheduledTime?: string; // ISO date string
  scheduledDate?: string; // ISO date string
  timeZone: TimeZoneType;
  recurringPattern?: RecurringPattern;
}

interface SchedulingControlsProps {
  onChange: (settings: ScheduleSettings) => void;
  initialSettings?: Partial<ScheduleSettings>;
  isVisible?: boolean;
}

const SchedulingControls: React.FC<SchedulingControlsProps> = ({ 
  onChange, 
  initialSettings,
  isVisible = true
}) => {
  // Default settings
  const defaultSettings: ScheduleSettings = {
    type: 'immediate',
    timeZone: 'America/New_York' // Use default timezone
  };

  // State for the scheduling settings
  const [settings, setSettings] = useState<ScheduleSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  // State for form inputs
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [recurringType, setRecurringType] = useState<RecurringType>(null);
  const [interval, setInterval] = useState<number>(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [endType, setEndType] = useState<'never' | 'after' | 'on'>('never');
  const [occurrences, setOccurrences] = useState<number>(10);
  const [endDate, setEndDate] = useState<string>('');

  // Available time zones
  const timeZones: TimeZoneType[] = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'UTC',
    'Europe/London'
  ];

  // Initialize form values from initialSettings if provided
  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.scheduledDate) {
        setDate(initialSettings.scheduledDate);
      }
      if (initialSettings.scheduledTime) {
        // Extract just the time part from ISO string or use as is if it's already just time
        const timeString = initialSettings.scheduledTime.includes('T') 
          ? initialSettings.scheduledTime.split('T')[1].substring(0, 5) 
          : initialSettings.scheduledTime;
        setTime(timeString);
      }
      if (initialSettings.recurringPattern) {
        setRecurringType(initialSettings.recurringPattern.type || null);
        setInterval(initialSettings.recurringPattern.interval || 1);
        setDaysOfWeek(initialSettings.recurringPattern.daysOfWeek || []);
        setDayOfMonth(initialSettings.recurringPattern.dayOfMonth || 1);
        
        if (initialSettings.recurringPattern.endDate) {
          setEndType('on');
          setEndDate(initialSettings.recurringPattern.endDate);
        } else if (initialSettings.recurringPattern.occurrences) {
          setEndType('after');
          setOccurrences(initialSettings.recurringPattern.occurrences);
        } else {
          setEndType('never');
        }
      }
    }
  }, [initialSettings]);

  // Update the settings whenever form values change
  useEffect(() => {
    const newSettings: ScheduleSettings = { ...settings };

    if (settings.type === 'scheduled') {
      newSettings.scheduledDate = date;
      newSettings.scheduledTime = time;
    } else if (settings.type === 'recurring') {
      const pattern: RecurringPattern = {
        type: recurringType,
        interval: interval
      };

      if (recurringType === 'weekly') {
        pattern.daysOfWeek = daysOfWeek;
      } else if (recurringType === 'monthly') {
        pattern.dayOfMonth = dayOfMonth;
      }

      if (endType === 'after') {
        pattern.occurrences = occurrences;
      } else if (endType === 'on') {
        pattern.endDate = endDate;
      }

      newSettings.recurringPattern = pattern;
    }

    // Call onChange only if settings actually changed
    if (JSON.stringify(newSettings) !== JSON.stringify(settings)) {
      setSettings(newSettings);
      onChange(newSettings);
    }
  }, [
    settings.type, 
    date, 
    time, 
    recurringType, 
    interval, 
    daysOfWeek, 
    dayOfMonth, 
    endType, 
    occurrences, 
    endDate, 
    settings.timeZone
  ]);

  // Handle type change
  const handleTypeChange = (type: ScheduleSettings['type']) => {
    const newSettings = { ...settings, type };
    setSettings(newSettings);
    onChange(newSettings);
  };

  // Handle timezone change
  const handleTimeZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSettings = { ...settings, timeZone: e.target.value as TimeZoneType };
    setSettings(newSettings);
    onChange(newSettings);
  };

  // Toggle day of week selection
  const toggleDayOfWeek = (day: number) => {
    const newDays = daysOfWeek.includes(day)
      ? daysOfWeek.filter(d => d !== day)
      : [...daysOfWeek, day].sort();
    setDaysOfWeek(newDays);
  };

  // Get day name from index
  const getDayName = (day: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  // Generate date and time for immediate sending
  const getImmediateDateTime = (): string => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString();
    return localISOTime.slice(0, 16).replace('T', ' ');
  };

  const schedulingOptions: SchedulingOption[] = [
    { id: 'immediate', name: 'Send Now' },
    { id: 'scheduled', name: 'Schedule for Later' },
    { id: 'recurring', name: 'Recurring Schedule' },
  ];

  // Add type guard for recurring pattern
  const isValidRecurringType = (type: RecurringType): type is Exclude<RecurringType, null> => {
    return type !== null;
  };

  return isVisible ? (
    <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900">Message Scheduling</h3>
      
      {/* Schedule Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          When to send
        </label>
        <div className="flex space-x-2">
          {schedulingOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleTypeChange(option.id as ScheduleType)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                settings.type === option.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Timezone selection - always visible */}
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
          Time Zone
        </label>
        <select
          id="timezone"
          value={settings.timeZone}
          onChange={handleTimeZoneChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        >
          {timeZones.map(tz => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>
      
      {/* Immediate Sending Display */}
      {settings.type === 'immediate' && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">
            Your message will be sent immediately upon submission.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Current time: {getImmediateDateTime()} ({settings.timeZone})
          </p>
        </div>
      )}
      
      {/* Scheduled Sending Options */}
      {settings.type === 'scheduled' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="scheduleDate"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Ensures only future dates can be selected
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required={settings.type === 'scheduled'}
              />
            </div>
            <div>
              <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                id="scheduleTime"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required={settings.type === 'scheduled'}
              />
            </div>
          </div>
          
          {/* Preview of scheduled date/time */}
          {date && time && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                Your message will be sent on:
              </p>
              <p className="text-sm font-medium mt-1">
                {new Date(`${date}T${time}`).toLocaleString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  timeZoneName: 'short',
                  timeZone: settings.timeZone
                })}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Recurring Message Options */}
      {settings.type === 'recurring' && (
        <div className="space-y-4">
          {/* Recurring Pattern Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recurrence Pattern
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRecurringType('daily')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  recurringType === 'daily'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setRecurringType('weekly')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  recurringType === 'weekly'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setRecurringType('monthly')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  recurringType === 'monthly'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setRecurringType('custom')}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  recurringType === 'custom'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
          
          {/* Pattern Details based on type */}
          {recurringType !== null && (
            <>
              {/* Interval */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Every</span>
                <input
                  type="number"
                  value={interval}
                  onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                <span className="text-sm text-gray-700">
                  {recurringType === 'daily' && 'day(s)'}
                  {recurringType === 'weekly' && 'week(s)'}
                  {recurringType === 'monthly' && 'month(s)'}
                  {recurringType === 'custom' && 'interval(s)'}
                </span>
              </div>
              
              {/* Days of week selection for weekly recurrence */}
              {recurringType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    On these days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDayOfWeek(day)}
                        className={`w-10 h-10 rounded-full ${
                          daysOfWeek.includes(day)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getDayName(day)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Day of month selection for monthly recurrence */}
              {recurringType === 'monthly' && (
                <div>
                  <label htmlFor="dayOfMonth" className="block text-sm font-medium text-gray-700 mb-2">
                    On day of month
                  </label>
                  <input
                    type="number"
                    id="dayOfMonth"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="31"
                    className="w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              )}
              
              {/* Start date and time */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start date and time
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              {/* End recurrence options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  End recurrence
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="endNever"
                      type="radio"
                      checked={endType === 'never'}
                      onChange={() => setEndType('never')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label htmlFor="endNever" className="ml-2 text-sm text-gray-700">
                      Never
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="endAfter"
                      type="radio"
                      checked={endType === 'after'}
                      onChange={() => setEndType('after')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label htmlFor="endAfter" className="ml-2 text-sm text-gray-700">
                      After
                    </label>
                    <input
                      type="number"
                      value={occurrences}
                      onChange={(e) => setOccurrences(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      disabled={endType !== 'after'}
                      className="ml-2 w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    <span className="ml-2 text-sm text-gray-700">occurrences</span>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="endOn"
                      type="radio"
                      checked={endType === 'on'}
                      onChange={() => setEndType('on')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label htmlFor="endOn" className="ml-2 text-sm text-gray-700">
                      On
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={date || new Date().toISOString().split('T')[0]}
                      disabled={endType !== 'on'}
                      className="ml-2 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Recurring Summary */}
              {recurringType !== null && isValidRecurringType(recurringType) && date && time && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700">
                    Recurrence Summary:
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {`Occurs ${
                      recurringType === 'daily' ? 'daily' : 
                      recurringType === 'weekly' ? 'weekly' :
                      recurringType === 'monthly' ? 'monthly' :
                      'custom'
                    }`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  ) : null;
};

export default SchedulingControls;