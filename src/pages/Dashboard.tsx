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
  ChartData
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  // Sample data for the chart
  const chartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Conversations',
        data: [65, 78, 90, 85, 112, 126],
        borderColor: '#5A3E00',
        backgroundColor: 'rgba(90, 62, 0, 0.1)',
        tension: 0.3
      },
      {
        label: 'Successful Resolutions',
        data: [55, 68, 82, 75, 102, 115],
        borderColor: '#715100',
        backgroundColor: 'rgba(113, 81, 0, 0.1)',
        tension: 0.3
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chatbot Performance',
      },
    },
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Dashboard Overview</h2>
        <p className="text-gray-600 mb-4">
          Welcome to the WineAssist management dashboard. Monitor key metrics and manage your chatbot from here.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Key Metrics Cards */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Conversations</h3>
            <p className="text-2xl font-bold text-primary">843</p>
            <p className="text-sm text-green-600">↑ 12% from last month</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Resolution Rate</h3>
            <p className="text-2xl font-bold text-primary">92%</p>
            <p className="text-sm text-green-600">↑ 3% from last month</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Data Capture Rate</h3>
            <p className="text-2xl font-bold text-primary">61%</p>
            <p className="text-sm text-red-600">↓ 5% from last month</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Recent Feedback</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border-b border-gray-200 pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">User #{Math.floor(Math.random() * 1000)}</span>
                  <span className="text-xs text-gray-500">Today</span>
                </div>
                <p className="text-sm text-gray-600">
                  Sample feedback comment {item}. This is placeholder text.
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
              Update knowledge base
            </button>
            <button className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
              View unresolved conversations
            </button>
            <button className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
              Download CSV report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}