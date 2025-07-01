import { ChartData } from 'chart.js';


export const emptyResponseTimeData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Average Response Time (s)',
        data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        backgroundColor: '#715100',
      }
    ]
};

export const queryTypes = ['Wine Info', 'Club Membership', 'Visiting Hours', 'Reservation', 'Events', 'User Profile', 'SMS', 'Referral', 'Others'];

export const emptyQueryTypeData: ChartData<'doughnut'> = {
    labels: queryTypes,
    datasets: [
      {
        data: Array(queryTypes.length).fill(0),
        backgroundColor: [ '#797d62', '#9b9b7a', '#d9ae94', '#e5c59e', '#f1dca7', '#f8d488', '#e4b074', '#d08c60', '#997b66'],
        borderColor: '#FFFFFF',
        borderWidth: 1
      }
    ]
};

export const emptyQueryPerfData: ChartData<'radar'> = {
  labels: queryTypes,
  datasets: [
    {
      label: 'Current',
      data: Array(queryTypes.length).fill(0),
      backgroundColor: 'rgba(90, 62, 0, 0.2)',
      borderColor: '#5A3E00',
      pointBackgroundColor: '#5A3E00'
    },
    {
      label: 'Previous Period',
      data: Array(queryTypes.length).fill(0),
      backgroundColor: 'rgba(113, 81, 0, 0.2)',
      borderColor: '#715100',
      pointBackgroundColor: '#715100'
    }
  ]
};

export interface ImproveTableData {
  category: string;
  current_score: number;
  target_score: number;
  action_items: string[];
}

export const emptyImproveTableData: ImproveTableData[] = [
  { category: 'Wine Info', current_score: 0, target_score: 0, action_items: [] },
  { category: 'Club Membership', current_score: 0, target_score: 0, action_items: [] },
  { category: 'Visiting Hours', current_score: 0, target_score: 0, action_items: [] },
  { category: 'Reservation', current_score: 0, target_score: 0, action_items: [] },
  { category: 'Events', current_score: 0, target_score: 0, action_items: [] },
  { category: 'User Profile', current_score: 0, target_score: 0, action_items: [] },
  { category: 'SMS', current_score: 0, target_score: 0, action_items: [] },
  { category: 'Referral', current_score: 0, target_score: 0, action_items: [] },
  { category: 'Others', current_score: 0, target_score: 0, action_items: [] }
];