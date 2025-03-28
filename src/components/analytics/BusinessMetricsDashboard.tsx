import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import DateRangeSelector from './DateRangeSelector';
import MetricCard from './MetricCard';
import TrendIndicator from './TrendIndicator';
import CustomReportBuilder from './CustomReportBuilder';
import { format, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define metric type
interface Metric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'currency' | 'percent';
  category: 'conversations' | 'wine-club' | 'reservations' | 'ecommerce';
  chartData?: {
    labels: string[];
    values: number[];
  };
}

// Sample metrics data
const initialMetrics: Metric[] = [
  {
    id: 'total_conversations',
    name: 'Total Conversations',
    value: 843,
    previousValue: 752,
    change: 12.1,
    trend: 'up',
    format: 'number',
    category: 'conversations',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [650, 700, 720, 752, 790, 843]
    }
  },
  {
    id: 'resolution_rate',
    name: 'Resolution Rate',
    value: 92,
    previousValue: 89,
    change: 3.4,
    trend: 'up',
    format: 'percent',
    category: 'conversations',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [84, 86, 87, 89, 90, 92]
    }
  },
  {
    id: 'data_capture_rate',
    name: 'Data Capture Rate',
    value: 61,
    previousValue: 64,
    change: -4.7,
    trend: 'down',
    format: 'percent',
    category: 'conversations',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [70, 68, 65, 64, 62, 61]
    }
  },
  {
    id: 'club_conversion',
    name: 'Club Conversion',
    value: 4.8,
    previousValue: 4.1,
    change: 17.1,
    trend: 'up',
    format: 'percent',
    category: 'wine-club',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [3.6, 3.8, 4.0, 4.1, 4.5, 4.8]
    }
  },
  {
    id: 'club_retention',
    name: 'Club Retention',
    value: 89,
    previousValue: 87,
    change: 2.3,
    trend: 'up',
    format: 'percent',
    category: 'wine-club',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [85, 86, 86, 87, 88, 89]
    }
  },
  {
    id: 'average_order_value',
    name: 'Average Order Value',
    value: 165,
    previousValue: 152,
    change: 8.6,
    trend: 'up',
    format: 'currency',
    category: 'ecommerce',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [135, 142, 148, 152, 160, 165]
    }
  },
  {
    id: 'total_revenue',
    name: 'Total Revenue',
    value: 42500,
    previousValue: 38200,
    change: 11.3,
    trend: 'up',
    format: 'currency',
    category: 'ecommerce',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [32000, 34500, 36800, 38200, 40100, 42500]
    }
  },
  {
    id: 'reservation_bookings',
    name: 'Reservation Bookings',
    value: 186,
    previousValue: 165,
    change: 12.7,
    trend: 'up',
    format: 'number',
    category: 'reservations',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [120, 135, 148, 165, 175, 186]
    }
  },
  {
    id: 'tasting_conversion',
    name: 'Tasting to Purchase',
    value: 68,
    previousValue: 65,
    change: 4.6,
    trend: 'up',
    format: 'percent',
    category: 'reservations',
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      values: [60, 62, 63, 65, 67, 68]
    }
  }
];

// Define date range type
interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

const BusinessMetricsDashboard: React.FC = () => {
  // State for metrics and filtering
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [filteredMetrics, setFilteredMetrics] = useState<Metric[]>(initialMetrics);
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
    label: 'Last 30 days'
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'conversations', 'wine-club', 'reservations', 'ecommerce'
  ]);
  const [comparisonRange, setComparisonRange] = useState<DateRange | null>(null);
  const [isComparisonEnabled, setIsComparisonEnabled] = useState(false);
  const [showCustomReport, setShowCustomReport] = useState(false);

  // Get all available categories
  const allCategories = Array.from(new Set(metrics.map(metric => metric.category)));

  // Filter metrics when selections change
  useEffect(() => {
    const filtered = metrics.filter(metric => 
      selectedCategories.includes(metric.category)
    );
    setFilteredMetrics(filtered);
  }, [metrics, selectedCategories]);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setSelectedRange(range);
    
    // If comparison is enabled, update the comparison range
    if (isComparisonEnabled) {
      // Calculate a comparison range of the same duration, immediately before the selected range
      const duration = range.to.getTime() - range.from.getTime();
      
      setComparisonRange({
        from: new Date(range.from.getTime() - duration),
        to: new Date(range.to.getTime() - duration),
        label: `Previous ${range.label}`
      });
    }
  };

  // Toggle category filter
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Format metrics based on their type
  const formatMetricValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percent':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  // Toggle comparison mode
  const toggleComparison = () => {
    setIsComparisonEnabled(!isComparisonEnabled);
    
    if (!isComparisonEnabled && !comparisonRange) {
      // Calculate a comparison range of the same duration, immediately before the selected range
      const duration = selectedRange.to.getTime() - selectedRange.from.getTime();
      
      setComparisonRange({
        from: new Date(selectedRange.from.getTime() - duration),
        to: new Date(selectedRange.to.getTime() - duration),
        label: `Previous ${selectedRange.label}`
      });
    }
  };

  // Open Custom Report Builder
  const openCustomReportBuilder = () => {
    setShowCustomReport(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Business Metrics Dashboard</h2>
        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <DateRangeSelector
            selectedRange={selectedRange}
            onRangeChange={handleDateRangeChange}
          />
          
          {/* Comparison Toggle */}
          <button
            onClick={toggleComparison}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isComparisonEnabled 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isComparisonEnabled ? 'Disable Comparison' : 'Enable Comparison'}
          </button>
          
          {/* Custom Report Button */}
          <button
            onClick={openCustomReportBuilder}
            className="px-4 py-2 bg-darkBrown text-white rounded-md hover:bg-darkBrownHover text-sm font-medium"
          >
            Create Custom Report
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {allCategories.map(category => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategories.includes(category)
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Comparison Info */}
      {isComparisonEnabled && comparisonRange && (
        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Comparing:</span> {selectedRange.label} ({format(selectedRange.from, 'MMM d')} to {format(selectedRange.to, 'MMM d')}) 
            <span className="mx-2">vs</span>
            {comparisonRange.label} ({format(comparisonRange.from, 'MMM d')} to {format(comparisonRange.to, 'MMM d')})
          </p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMetrics.map(metric => (
          <MetricCard
            key={metric.id}
            title={metric.name}
            value={formatMetricValue(metric.value, metric.format)}
            change={metric.change}
            trend={metric.trend}
            chartData={metric.chartData}
            category={metric.category}
            isComparison={isComparisonEnabled}
            comparisonValue={isComparisonEnabled ? formatMetricValue(metric.previousValue, metric.format) : undefined}
          />
        ))}
      </div>

      {/* Custom Report Builder Modal */}
      {showCustomReport && (
        <CustomReportBuilder
          metrics={metrics}
          selectedRange={selectedRange}
          onClose={() => setShowCustomReport(false)}
        />
      )}
    </div>
  );
};

export default BusinessMetricsDashboard;