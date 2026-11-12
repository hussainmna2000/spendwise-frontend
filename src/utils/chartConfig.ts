import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  ChartOptions,
} from 'chart.js';
import { CurrencyCode } from '../types/finance';
import { formatCurrency } from './formatters';

// Register Chart.js components globally once
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler
);

export function getDoughnutOptions(
  isDark: boolean,
  currency: CurrencyCode
): ChartOptions<'doughnut'> {
  const textColor = isDark ? '#CBD5E1' : '#475569';
  const tooltipBg = isDark ? '#0F172A' : '#0F172A';
  const tooltipBorder = isDark ? '#334155' : '#1E293B';

  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: {
            family: "'DM Sans', sans-serif",
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 12,
        titleFont: {
          family: "'Plus Jakarta Sans', sans-serif",
          size: 13,
          weight: 600,
        },
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 12,
        },
        callbacks: {
          label: (ctx) => {
            const val = Number(ctx.parsed || 0);
            const dataset = ctx.dataset.data as number[];
            const total = dataset.reduce((acc, n) => acc + Number(n || 0), 0);
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
            return ` ${ctx.label}: ${formatCurrency(val, currency)} (${pct}%)`;
          },
        },
      },
    },
  };
}

export function getLineChartOptions(
  isDark: boolean,
  currency: CurrencyCode
): ChartOptions<'line'> {
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.35)' : 'rgba(226, 232, 240, 0.8)';

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: isDark ? '#CBD5E1' : '#334155',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          padding: 16,
          font: {
            family: "'DM Sans', sans-serif",
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          family: "'Plus Jakarta Sans', sans-serif",
          size: 13,
          weight: 600,
        },
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 12,
        },
        callbacks: {
          label: (ctx) => {
            if (ctx.parsed.y === null || ctx.parsed.y === undefined) return '';
            return ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y, currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'DM Sans', sans-serif",
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: gridColor,
        },
        border: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11,
          },
          callback: (value) => formatCurrency(Number(value), currency, true),
        },
      },
    },
  };
}

export function getBarChartOptions(
  isDark: boolean,
  currency: CurrencyCode
): ChartOptions<'bar'> {
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.35)' : 'rgba(226, 232, 240, 0.8)';

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: isDark ? '#CBD5E1' : '#334155',
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 10,
          padding: 16,
          font: {
            family: "'DM Sans', sans-serif",
            size: 12,
            weight: 500,
          },
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        titleFont: {
          family: "'Plus Jakarta Sans', sans-serif",
          size: 13,
          weight: 600,
        },
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 12,
        },
        callbacks: {
          label: (ctx) => {
            if (ctx.parsed.y === null || ctx.parsed.y === undefined) return '';
            return ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y, currency)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'DM Sans', sans-serif",
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: gridColor,
        },
        border: {
          display: false,
        },
        ticks: {
          color: textColor,
          font: {
            family: "'JetBrains Mono', monospace",
            size: 11,
          },
          callback: (value) => formatCurrency(Number(value), currency, true),
        },
      },
    },
  };
}
