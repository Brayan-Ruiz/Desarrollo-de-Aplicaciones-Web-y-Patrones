/**
 * Antigravity Finance - Charts Manager
 * Renderizado de gráficos interactivos con Chart.js respetando estrictamente la paleta de diseño Fintech.
 */

import { formatCurrency } from './utils/formatters.js';

// Colores oficiales de la identidad visual
export const PALETTE = {
  emerald: '#10B981',
  darkEmerald: '#065F46',
  emeraldLight: 'rgba(16, 185, 129, 0.15)',
  navy: '#1E293B',
  navyDark: '#0F172A',
  red: '#EF4444',
  redDark: '#991B1B',
  redLight: 'rgba(239, 68, 68, 0.12)',
  amber: '#F59E0B',
  slate: '#E2E8F0',
  slateText: '#64748B',
  blue: '#3B82F6',
  blueLight: 'rgba(59, 130, 246, 0.15)',
  cyan: '#0EA5E9',
  violet: '#8B5CF6'
};

// Instancias activas de Chart.js
let evolutionChart = null;
let expenseDonutChart = null;
let projectionChart = null;

/**
 * Renderiza o actualiza el gráfico de Evolución Financiera (Ingresos vs Gastos).
 * @param {HTMLCanvasElement} canvas
 * @param {Array} historyData Datos agrupados por mes
 * @param {string} currencyCode
 */
export function renderEvolutionChart(canvas, historyData = [], currencyCode = 'USD') {
  if (!canvas) return;

  const labels = historyData.map(d => d.label);
  const incomeData = historyData.map(d => d.income);
  const expenseData = historyData.map(d => d.expense);

  if (evolutionChart) {
    evolutionChart.data.labels = labels;
    evolutionChart.data.datasets[0].data = incomeData;
    evolutionChart.data.datasets[1].data = expenseData;
    evolutionChart.options.plugins.tooltip.callbacks.label = (ctx) => {
      const label = ctx.dataset.label || '';
      return `${label}: ${formatCurrency(ctx.raw, currencyCode)}`;
    };
    evolutionChart.options.scales.y.ticks.callback = (val) => formatCurrency(val, currencyCode);
    evolutionChart.update();
    return;
  }

  const ctx = canvas.getContext('2d');
  evolutionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: incomeData,
          borderColor: PALETTE.emerald,
          backgroundColor: PALETTE.emeraldLight,
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: PALETTE.emerald,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Gastos',
          data: expenseData,
          borderColor: PALETTE.red,
          backgroundColor: PALETTE.redLight,
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: PALETTE.red,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            color: PALETTE.navy,
            font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: PALETTE.navyDark,
          titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' },
          bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
          padding: 12,
          cornerRadius: 8,
          boxPadding: 4,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw, currencyCode)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: PALETTE.slateText,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
          }
        },
        y: {
          grid: { color: '#F1F5F9' },
          ticks: {
            color: PALETTE.slateText,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callback: (val) => formatCurrency(val, currencyCode)
          }
        }
      }
    }
  });
}

/**
 * Renderiza o actualiza el gráfico de Distribución de Gastos (Dona minimalista).
 * @param {HTMLCanvasElement} canvas
 * @param {Array} categoryData [{ category, total, percentage }]
 * @param {string} currencyCode
 */
export function renderExpenseDonutChart(canvas, categoryData = [], currencyCode = 'USD') {
  if (!canvas) return;

  const labels = categoryData.map(c => c.category);
  const data = categoryData.map(c => c.total);

  const colors = [
    PALETTE.navy,
    PALETTE.emerald,
    PALETTE.amber,
    PALETTE.blue,
    PALETTE.darkEmerald,
    PALETTE.violet,
    PALETTE.cyan,
    PALETTE.slateText
  ];

  if (expenseDonutChart) {
    expenseDonutChart.data.labels = labels;
    expenseDonutChart.data.datasets[0].data = data;
    expenseDonutChart.options.plugins.tooltip.callbacks.label = (ctx) => {
      const val = ctx.raw || 0;
      const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
      const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
      return ` ${ctx.label}: ${formatCurrency(val, currencyCode)} (${pct}%)`;
    };
    expenseDonutChart.update();
    return;
  }

  const ctx = canvas.getContext('2d');
  expenseDonutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            color: PALETTE.navy,
            padding: 12,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '500' }
          }
        },
        tooltip: {
          backgroundColor: PALETTE.navyDark,
          titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' },
          bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw || 0;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
              return ` ${ctx.label}: ${formatCurrency(val, currencyCode)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Renderiza o actualiza el gráfico de Proyecciones Financieras (Histórico sólido vs Proyección punteada).
 * @param {HTMLCanvasElement} canvas
 * @param {object} projectionData { labels, historical, optimistic, expected, conservative }
 * @param {string} currencyCode
 */
export function renderProjectionChart(canvas, projectionData, currencyCode = 'USD') {
  if (!canvas || !projectionData) return;

  const { labels, historical, optimistic, expected, conservative } = projectionData;

  if (projectionChart) {
    projectionChart.data.labels = labels;
    projectionChart.data.datasets[0].data = historical;
    projectionChart.data.datasets[1].data = optimistic;
    projectionChart.data.datasets[2].data = expected;
    projectionChart.data.datasets[3].data = conservative;
    projectionChart.options.plugins.tooltip.callbacks.label = (ctx) => {
      if (ctx.raw === null || ctx.raw === undefined) return null;
      return `${ctx.dataset.label}: ${formatCurrency(ctx.raw, currencyCode)}`;
    };
    projectionChart.options.scales.y.ticks.callback = (val) => formatCurrency(val, currencyCode);
    projectionChart.update();
    return;
  }

  const ctx = canvas.getContext('2d');
  projectionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Histórico Real (Sólido)',
          data: historical,
          borderColor: PALETTE.navyDark,
          backgroundColor: PALETTE.navyDark,
          borderWidth: 3,
          borderDash: [], // Línea SÓLIDA para datos históricos
          pointRadius: 3.5,
          pointBackgroundColor: PALETTE.navyDark,
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          tension: 0.25,
          spanGaps: false
        },
        {
          label: '🟢 Optimista (+10% Ingreso / -5% Gasto)',
          data: optimistic,
          borderColor: PALETTE.emerald,
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          borderDash: [5, 5], // Línea PUNTEADA para proyección
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.25,
          spanGaps: true
        },
        {
          label: '🔵 Esperado (Tendencia Media)',
          data: expected,
          borderColor: PALETTE.blue,
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          borderDash: [5, 5], // Línea PUNTEADA
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.25,
          spanGaps: true
        },
        {
          label: '🔘 Conservador (-5% Ingreso / +10% Gasto)',
          data: conservative,
          borderColor: PALETTE.slateText,
          backgroundColor: 'transparent',
          borderWidth: 2.2,
          borderDash: [4, 4], // Línea PUNTEADA
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.25,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            boxWidth: 10,
            boxHeight: 6,
            color: PALETTE.navy,
            padding: 12,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: PALETTE.navyDark,
          titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' },
          bodyFont: { family: "'Plus Jakarta Sans', sans-serif" },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              if (ctx.raw === null || ctx.raw === undefined) return null;
              return `${ctx.dataset.label}: ${formatCurrency(ctx.raw, currencyCode)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: PALETTE.slateText,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }
          }
        },
        y: {
          grid: { color: '#F1F5F9' },
          ticks: {
            color: PALETTE.slateText,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callback: (val) => formatCurrency(val, currencyCode)
          }
        }
      }
    }
  });
}
