/**
 * Antigravity Finance - Cash Flow View
 * Análisis detallado de Flujo de Caja mensual, liquidez operativa, balances acumulados y colchón de emergencia.
 */

import { store } from '../state.js';
import { formatCurrency, formatPercentage } from '../utils/formatters.js';
import { getMonthlyHistory } from '../calculations.js';

export function renderCashFlowView(container) {
  if (!container) return;

  const state = store.getState();
  const { incomes, expenses, currency, referenceMonth, initialBalance } = state;

  // Obtener historial de 6 meses
  const history = getMonthlyHistory(incomes, expenses, 6, referenceMonth);

  // Calcular balance acumulado progresivo
  let runningBalance = initialBalance - history.reduce((sum, h) => sum + h.net, 0);
  const rowsWithCumulative = history.map(h => {
    runningBalance += h.net;
    const rate = h.income > 0 ? (h.net / h.income) * 100 : 0;
    return {
      ...h,
      savingsRate: rate,
      cumulative: runningBalance
    };
  });

  // Métricas agregadas
  const totalNet = history.reduce((s, h) => s + h.net, 0);
  const avgNet = history.length > 0 ? totalNet / history.length : 0;
  const avgMonthlyExpenses = history.reduce((s, h) => s + h.expense, 0) / (history.length || 1);
  const runwayMonths = avgMonthlyExpenses > 0 ? (runningBalance / avgMonthlyExpenses).toFixed(1) : '∞';

  container.innerHTML = `
    <div class="space-y-5">
      
      <!-- Encabezado -->
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="p-2.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-lg">🔄</span>
          <div>
            <h2 class="text-xl font-bold text-slate-900">Estado de Flujo de Caja Libre</h2>
            <p class="text-xs text-slate-500">Auditoría de liquidez mensual, superávit operativo y patrimonio líquido acumulado</p>
          </div>
        </div>

        <div class="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Base Histórica: <span class="font-semibold text-slate-800">Últimos 6 meses</span>
        </div>
      </div>

      <!-- Métricas Clave de Liquidez (Campos Calculados / Blanco Puro) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flujo Neto Promedio Mensual</span>
          <div class="text-2xl font-black ${avgNet >= 0 ? 'text-emerald-600' : 'text-red-600'} mt-1">
            ${avgNet >= 0 ? '+' : ''}${formatCurrency(avgNet, currency)}
          </div>
          <span class="text-[11px] text-slate-400">Capacidad media mensual de capitalización</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patrimonio Líquido Acumulado</span>
          <div class="text-2xl font-black text-slate-900 mt-1">${formatCurrency(runningBalance, currency)}</div>
          <span class="text-[11px] text-slate-400">Saldo disponible en cuentas y fondos</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Colchón de Supervivencia (Runway)</span>
          <div class="text-2xl font-black text-blue-600 mt-1">${runwayMonths} <span class="text-sm font-semibold text-slate-600">meses</span></div>
          <span class="text-[11px] text-slate-400">Tiempo de cobertura a costo de vida promedio</span>
        </div>
      </div>

      <!-- Tabla de Matriz de Flujo de Caja -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            
            <thead class="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold sticky top-0 z-10 shadow-xs">
              <tr>
                <th class="py-3.5 px-4">Mes / Período</th>
                <th class="py-3.5 px-4 text-right">Ingresos (+)</th>
                <th class="py-3.5 px-4 text-right">Gastos (-)</th>
                <th class="py-3.5 px-4 text-right">Flujo Neto (=)</th>
                <th class="py-3.5 px-4 text-right">Tasa de Ahorro</th>
                <th class="py-3.5 px-4 text-right">Balance Acumulado</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
              ${rowsWithCumulative.map((row, idx) => {
                const isAlt = idx % 2 === 1;
                const rowBg = isAlt ? 'bg-[#F8FAFC]' : 'bg-white';
                const isPositive = row.net >= 0;

                return `
                  <tr class="${rowBg} hover:bg-slate-100/60 transition-colors">
                    <td class="py-3.5 px-4 font-bold text-slate-900 capitalize">
                      ${row.label}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono text-emerald-600 font-semibold">
                      +${formatCurrency(row.income, currency)}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono text-red-600 font-semibold">
                      -${formatCurrency(row.expense, currency)}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono font-bold ${isPositive ? 'text-emerald-700' : 'text-red-700'}">
                      <span class="inline-flex items-center px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}">
                        ${isPositive ? '+' : ''}${formatCurrency(row.net, currency)}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right font-semibold ${row.savingsRate >= 20 ? 'text-emerald-600' : 'text-amber-600'}">
                      ${formatPercentage(row.savingsRate)}
                    </td>
                    <td class="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      ${formatCurrency(row.cumulative, currency)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  `;
}
