import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

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

interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

interface CustomReportBuilderProps {
  metrics: Metric[];
  selectedRange: DateRange;
  onClose: () => void;
}

const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({
  metrics,
  selectedRange,
  onClose
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [reportName, setReportName] = useState('Custom Report');
  const [reportFormat, setReportFormat] = useState<'csv' | 'pdf'>('csv');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTrends, setIncludeTrends] = useState(true);
  const [includeComparison, setIncludeComparison] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Group metrics by category
  const metricsByCategory = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, Metric[]>);

  // Toggle metric selection
  const toggleMetricSelection = (metricId: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricId)) {
        return prev.filter(id => id !== metricId);
      } else {
        return [...prev, metricId];
      }
    });
  };

  // Select all metrics in a category
  const selectAllInCategory = (category: string) => {
    const categoryMetricIds = metricsByCategory[category].map(m => m.id);
    setSelectedMetrics(prev => {
      const remaining = prev.filter(id => !categoryMetricIds.includes(id));
      return [...remaining, ...categoryMetricIds];
    });
  };

  // Deselect all metrics in a category
  const deselectAllInCategory = (category: string) => {
    const categoryMetricIds = metricsByCategory[category].map(m => m.id);
    setSelectedMetrics(prev => prev.filter(id => !categoryMetricIds.includes(id)));
  };

  // Format a metric value based on its format type
  const formatMetricValue = (value: number, formatType: string) => {
    switch (formatType) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percent':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  // Handle report generation
  const generateReport = () => {
    if (selectedMetrics.length === 0) {
      alert('Please select at least one metric for your report.');
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      // In a real application, this would generate the actual report file
      console.log('Generating report with:', {
        reportName,
        reportFormat,
        selectedMetrics,
        dateRange: selectedRange,
        includeCharts,
        includeTrends,
        includeComparison
      });
      
      setIsGenerating(false);
      alert(`${reportName} has been generated in ${reportFormat.toUpperCase()} format.`);
      onClose();
    }, 1500);
  };

  // Preview selected metrics
  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">Custom Report Builder</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showPreview ? (
            // Report Preview
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{reportName} - Preview</h3>
                <div className="text-sm text-gray-500">
                  {format(selectedRange.from, 'MMM d, yyyy')} - {format(selectedRange.to, 'MMM d, yyyy')}
                </div>
              </div>

              <div className="border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metric
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      {includeComparison && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Previous
                        </th>
                      )}
                      {includeTrends && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics
                      .filter(metric => selectedMetrics.includes(metric.id))
                      .map(metric => (
                        <tr key={metric.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {metric.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metric.category.charAt(0).toUpperCase() + metric.category.slice(1).replace('-', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatMetricValue(metric.value, metric.format)}
                          </td>
                          {includeComparison && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatMetricValue(metric.previousValue, metric.format)}
                            </td>
                          )}
                          {includeTrends && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`${
                                metric.trend === 'up' ? 'text-green-600' : 
                                metric.trend === 'down' ? 'text-red-600' : 
                                'text-gray-500'
                              }`}>
                                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '–'} {metric.change}%
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Back to Settings
                </button>
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-darkBrown disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : `Generate ${reportFormat.toUpperCase()}`}
                </button>
              </div>
            </div>
          ) : (
            // Report Builder UI
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Report Settings */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="report-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Report Name
                  </label>
                  <input
                    type="text"
                    id="report-name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <div className="text-sm bg-gray-50 p-3 rounded-md">
                    {selectedRange.label}: {format(selectedRange.from, 'MMM d, yyyy')} to {format(selectedRange.to, 'MMM d, yyyy')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Format
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-primary"
                        name="report-format"
                        value="csv"
                        checked={reportFormat === 'csv'}
                        onChange={() => setReportFormat('csv')}
                      />
                      <span className="ml-2">CSV</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-primary"
                        name="report-format"
                        value="pdf"
                        checked={reportFormat === 'pdf'}
                        onChange={() => setReportFormat('pdf')}
                      />
                      <span className="ml-2">PDF</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Options
                  </label>
                  <div className="space-y-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox text-primary"
                        checked={includeCharts}
                        onChange={() => setIncludeCharts(!includeCharts)}
                      />
                      <span className="ml-2">Include Charts</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox text-primary"
                        checked={includeTrends}
                        onChange={() => setIncludeTrends(!includeTrends)}
                      />
                      <span className="ml-2">Include Trends</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox text-primary"
                        checked={includeComparison}
                        onChange={() => setIncludeComparison(!includeComparison)}
                      />
                      <span className="ml-2">Include Comparison</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Metric Selection */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Select Metrics ({selectedMetrics.length} selected)</h3>
                  
                  {/* Metrics by category */}
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
                      <div key={category} className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-700">
                            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                          </h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => selectAllInCategory(category)}
                              className="text-xs text-primary hover:text-darkBrown"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => deselectAllInCategory(category)}
                              className="text-xs text-primary hover:text-darkBrown"
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>
                        <div className="p-2 space-y-1">
                          {categoryMetrics.map(metric => (
                            <label key={metric.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                className="form-checkbox text-primary"
                                checked={selectedMetrics.includes(metric.id)}
                                onChange={() => toggleMetricSelection(metric.id)}
                              />
                              <span className="ml-2 text-sm">{metric.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          {!showPreview && (
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePreview}
                disabled={selectedMetrics.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-darkBrown disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Preview Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;