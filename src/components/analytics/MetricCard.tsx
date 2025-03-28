import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import TrendIndicator from './TrendIndicator';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  chartData?: {
    labels: string[];
    values: number[];
  };
  category: string;
  isComparison: boolean;
  comparisonValue?: string | number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  chartData,
  category,
  isComparison,
  comparisonValue
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate category-based color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'conversations':
        return 'rgb(59, 130, 246)'; // Blue
      case 'wine-club':
        return 'rgb(139, 92, 246)'; // Purple
      case 'reservations':
        return 'rgb(16, 185, 129)'; // Green
      case 'ecommerce':
        return 'rgb(245, 158, 11)'; // Amber
      default:
        return 'rgb(107, 114, 128)'; // Gray
    }
  };

  const color = getCategoryColor(category);

  // Prepare chart data
  const data = chartData ? {
    labels: chartData.labels,
    datasets: [
      {
        label: title,
        data: chartData.values,
        borderColor: color,
        backgroundColor: `${color}20`, // 20% opacity
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  } : undefined;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        callbacks: {
          title: () => title,
          label: (context: any) => `${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        min: chartData ? Math.min(...chartData.values) * 0.9 : undefined,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  // Helper function to determine if trend is positive
  const isTrendPositive = () => {
    if (title.includes('Capture Rate') && trend === 'down') return false;
    return trend === 'up';
  };

  // Helper function to determine if trend color
  const getTrendColor = () => {
    if (title.includes('Capture Rate')) {
      return trend === 'up' ? 'text-red-600' : 'text-green-600';
    }
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden 
        ${isExpanded ? 'col-span-2 row-span-2' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <span className={`flex items-center text-xs font-medium ${getTrendColor()}`}>
            <TrendIndicator trend={trend} />
            {change}%
          </span>
        </div>
        
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {isComparison && comparisonValue && (
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 mr-1">vs</span>
                <span className="text-sm text-gray-700">{comparisonValue}</span>
              </div>
            )}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs bg-${category}-100 text-${category}-800`}>
            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
          </div>
        </div>
        
        {chartData && (
          <div className={`${isExpanded ? 'h-64' : 'h-16'} mt-4`}>
            <Line data={data} options={chartOptions} />
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-gray-50 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Metric Details</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600">Current Value:</span>
              <span className="font-medium">{value}</span>
            </li>
            {isComparison && comparisonValue && (
              <li className="flex justify-between">
                <span className="text-gray-600">Previous Value:</span>
                <span className="font-medium">{comparisonValue}</span>
              </li>
            )}
            <li className="flex justify-between">
              <span className="text-gray-600">Change:</span>
              <span className={getTrendColor()}>{change}%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Trend:</span>
              <span className={getTrendColor()}>
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MetricCard;