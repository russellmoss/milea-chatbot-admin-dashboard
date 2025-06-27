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

export const queryTypes = ['Wine Info', 'Club Membership', 'Visiting Hours', 'Reservation', 'Events', 'User Profiles', 'SMS', 'Referral', 'Others'];

export const emptyQueryTypeData: ChartData<'doughnut'> = {
    labels: queryTypes,
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: [ '#797d62', '#9b9b7a', '#d9ae94', '#e5c59e', '#f1dca7', '#f8d488', '#e4b074', '#d08c60', '#997b66'],
        borderColor: '#FFFFFF',
        borderWidth: 1
      }
    ]
};