/**
 * Antigravity Finance - Dashboard View
 * Vista principal con KPIs, comparativas vs mes anterior, gráficos analíticos, semáforo de salud y alertas.
 */

import { store } from '../state.js';
import { formatCurrency, formatPercentage } from '../utils/formatters.js';
import {
  calculateKPIs,
  evaluateFinancialHealth,
  evaluateBudgets,
  getMonthlyHistory,
  getExpensesByCategory,
  calculateProjections,
  filterByPeriod
} from '../calculations.js';
import {
  renderEvolutionChart,
  renderExpenseDonutChart,
  renderProjectionChart
} from '../charts.js';

export function renderDashboard(container) {
  if (!container) return;

  const state = store.getState();
  const { incomes, expenses, budgets, goals, currency, period, referenceMonth } = state;

  // Cálculos principales
  const kpis = calculateKPIs(incomes, expenses, referenceMonth);
  const currentExpenses = filterByPeriod(expenses, period, referenceMonth);
  const evaluatedBudgets = evaluateBudgets(budgets, currentExpenses);
  const health = evaluateFinancialHealth(kpis.current.savingsRate, kpis.current.netFlow, evaluatedBudgets);
  const monthlyHistory = getMonthlyHistory(incomes, expenses, 6, referenceMonth);
  const categoryExpenses = getExpensesByCategory(currentExpenses);
  const projectionData = calculateProjections(monthlyHistory, 12, state.initialBalance);

  // Formateo de comparativas vs período anterior
  const renderTrend = (change, isExpense = false, isDiff = false) => {
    const isGood = isExpense ? change <= 0 : change >= 0;
    const arrow = change >= 0 ? '↑' : '↓';
    const colorClass = isGood ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';
    const textVal = isDiff ? `${Math.abs(change).toFixed(1)}%` : `${Math.abs(change).toFixed(1)}%`;
    return `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${colorClass}">
        <span>${arrow}</span>
        <span>${textVal}</span>
        <span class="font-normal text-slate-500">vs. mes anterior</span>
      </span>
    `;
  };

  container.innerHTML = `
    <div class="space-y-6">
      
      <!-- Banner de Salud Financiera y Resumen -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl ${health.badgeBg}">
            ${health.status === 'healthy' ? '🟢' : health.status === 'warning' ? '🟡' : '🔴'}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-slate-900 text-base">Diagnóstico de Salud Financiera:</h3>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${health.badgeBg}">
                ${health.label}
              </span>
            </div>
            <p class="text-sm text-slate-600 mt-0.5">${health.message}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 self-end md:self-center">
          <button id="btn-quick-new-tx" class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Nueva Transacción
          </button>
        </div>
      </div>

      <!-- Tarjetas KPI (Primera Sección) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Tarjeta 1: Ingresos Totales -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Ingresos Totales</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
            </div>
          </div>
          <div class="mt-3">
            <h2 class="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              ${formatCurrency(kpis.current.totalIncome, currency)}
            </h2>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            ${renderTrend(kpis.changes.incomeChange, false)}
          </div>
        </div>

        <!-- Tarjeta 2: Gastos Totales -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Gastos Totales</span>
            <div class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>
            </div>
          </div>
          <div class="mt-3">
            <h2 class="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              ${formatCurrency(kpis.current.totalExpenses, currency)}
            </h2>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            ${renderTrend(kpis.changes.expenseChange, true)}
          </div>
        </div>

        <!-- Tarjeta 3: Tasa de Ahorro -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Tasa de Ahorro</span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
          </div>
          <div class="mt-3">
            <h2 class="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              ${formatPercentage(kpis.current.savingsRate)}
            </h2>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            ${renderTrend(kpis.changes.savingsRateDiff, false, true)}
          </div>
        </div>

        <!-- Tarjeta 4: Balance / Flujo Neto -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Balance / Flujo Neto</span>
            <div class="w-8 h-8 rounded-lg ${kpis.current.netFlow >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <div class="mt-3">
            <h2 class="text-2xl lg:text-3xl font-extrabold ${kpis.current.netFlow >= 0 ? 'text-emerald-600' : 'text-red-600'} tracking-tight">
              ${formatCurrency(kpis.current.netFlow, currency)}
            </h2>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            ${renderTrend(kpis.changes.netFlowChange, false)}
          </div>
        </div>

      </div>

      <!-- Sección Central (Gráficos Interactivos) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Gráfico de Evolución Financiera (2 columnas) -->
        <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 class="font-bold text-slate-900 text-base">Evolución Financiera Histórica</h3>
              <p class="text-xs text-slate-500">Comparativa mensual de ingresos generados vs gastos efectuados</p>
            </div>
            <div class="flex items-center gap-3 text-xs font-semibold">
              <span class="flex items-center gap-1 text-slate-700">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ingresos
              </span>
              <span class="flex items-center gap-1 text-slate-700">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Gastos
              </span>
            </div>
          </div>
          <div class="h-72 w-full relative">
            <canvas id="chart-evolution"></canvas>
          </div>
        </div>

        <!-- Distribución de Gastos (1 columna) -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div class="pb-3 mb-2 border-b border-slate-100">
            <h3 class="font-bold text-slate-900 text-base">Distribución de Gastos</h3>
            <p class="text-xs text-slate-500">Desglose porcentual por categorías activas</p>
          </div>
          <div class="h-64 w-full relative flex items-center justify-center">
            <canvas id="chart-expenses-donut"></canvas>
          </div>
          <div class="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
            ${categoryExpenses.slice(0, 5).map(c => `
              <div class="flex items-center justify-between py-1 border-b border-slate-50 text-slate-700">
                <span class="font-medium truncate max-w-[140px]">${c.category}</span>
                <span class="font-bold">${formatCurrency(c.total, currency)} <span class="text-slate-400 font-normal">(${c.percentage.toFixed(1)}%)</span></span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Sección Inferior (Proyecciones y Alertas de Metas) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Gráfico de Proyecciones a 12 Meses (2 columnas) -->
        <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-slate-900 text-base">Proyecciones de Crecimiento Patrimonial (12 Meses)</h3>
                <span class="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">Sólido = Real | Punteado = Proyección</span>
              </div>
              <p class="text-xs text-slate-500">Modelado predictivo: 🟢 Optimista (+10%), 🔵 Esperado (Media), 🔘 Conservador (-5%)</p>
            </div>
          </div>
          <div class="h-72 w-full relative">
            <canvas id="chart-projections"></canvas>
          </div>
        </div>

        <!-- Alertas y Estado de Metas (1 columna) -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 class="font-bold text-slate-900 text-base">Semáforo de Presupuestos & Metas</h3>
              <a href="#budget" data-nav="budget" class="text-xs text-blue-600 hover:text-blue-700 font-semibold">Ver Todos</a>
            </div>

            <!-- Lista de Alertas / Presupuestos cercanos al límite -->
            <div class="space-y-3">
              <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Presupuestos Clave:</div>
              ${evaluatedBudgets.slice(0, 3).map(b => {
                const isOver = b.percentage >= 100;
                const isWarning = b.percentage >= 75 && !isOver;
                const indicator = isOver ? '🔴' : isWarning ? '🟡' : '🟢';
                return `
                  <div class="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60">
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>${indicator}</span> ${b.category}
                      </span>
                      <span class="font-bold ${isOver ? 'text-red-600' : 'text-slate-700'}">
                        ${formatCurrency(b.spent, currency)} / ${formatCurrency(b.allocated, currency)}
                      </span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500" style="width: ${Math.min(100, b.percentage)}%; background-color: ${b.color}"></div>
                    </div>
                    <div class="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>${b.percentage.toFixed(0)}% consumido</span>
                      <span>${b.remaining >= 0 ? `Quedan ${formatCurrency(b.remaining, currency)}` : `Excedido por ${formatCurrency(Math.abs(b.remaining), currency)}`}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Progreso de Metas Destacadas -->
            <div class="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Metas Principales:</div>
              ${goals.slice(0, 2).map(g => {
                const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
                return `
                  <div class="text-xs p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                    <div class="flex justify-between font-semibold text-slate-800 mb-1">
                      <span class="truncate max-w-[150px]">${g.title}</span>
                      <span class="text-emerald-700 font-bold">${pct.toFixed(0)}%</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div class="bg-emerald-500 h-full rounded-full" style="width: ${Math.min(100, pct)}%"></div>
                    </div>
                    <div class="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>${formatCurrency(g.currentAmount, currency)}</span>
                      <span>Meta: ${formatCurrency(g.targetAmount, currency)}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

      </div>

    </div>
  `;

  // Renderizar gráficos tras insertar el DOM
  requestAnimationFrame(() => {
    const evoCanvas = document.getElementById('chart-evolution');
    const donutCanvas = document.getElementById('chart-expenses-donut');
    const projCanvas = document.getElementById('chart-projections');

    if (evoCanvas) renderEvolutionChart(evoCanvas, monthlyHistory, currency);
    if (donutCanvas) renderExpenseDonutChart(donutCanvas, categoryExpenses, currency);
    if (projCanvas) renderProjectionChart(projCanvas, projectionData, currency);

    // Event listener para el botón de Nueva Transacción rápida
    const quickBtn = document.getElementById('btn-quick-new-tx');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('open-transaction-modal', { detail: { type: 'expense' } }));
      });
    }

    // Interceptar links de navegación rápida
    container.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-nav');
        window.dispatchEvent(new CustomEvent('navigate-to', { detail: { view: target } }));
      });
    });
  });
}
