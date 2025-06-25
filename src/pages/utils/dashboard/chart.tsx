import { ChartData } from 'chart.js';


export const convChartOptions = {
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

export const convChartConversationColor = '#FEBE8C';
export const convChartSuccessfulColor = '#5D9C59';

export const emptyConvChartData: ChartData<'line'> = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Conversations',
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: convChartConversationColor,
      backgroundColor: 'rgba(90, 62, 0, 0.1)',
      tension: 0.3
    },
    {
      label: 'Successful Resolutions',
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: convChartSuccessfulColor,
      backgroundColor: 'rgba(113, 81, 0, 0.1)',
      tension: 0.3
    }
  ]
};