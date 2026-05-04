// src/config/chartjs.config.js
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js';

// Register ChartJS components globally
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler,
  RadialLinearScale
);

// Default configuration
ChartJS.defaults.font.family = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
ChartJS.defaults.color = '#6c757d';
ChartJS.defaults.plugins.legend.position = 'bottom';
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 4;
