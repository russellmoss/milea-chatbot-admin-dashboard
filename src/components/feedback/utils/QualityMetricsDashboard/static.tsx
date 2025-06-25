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