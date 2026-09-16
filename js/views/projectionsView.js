/**
 * Antigravity Finance - Projections View
 * Modelador predictivo interactivo a 6, 12 y 24 meses con 3 escenarios analíticos.
 */

import { store } from '../state.js';
import { formatCurrency } from '../utils/formatters.js';
import { getMonthlyHistory, calculateProjections } from '../calculations.js';
import { renderProjectionChart } from '../charts.js';

export function renderProjectionsView(container) {
  if (!container) return;

  const state = store.getState();
  const { incomes, expenses, currency, referenceMonth, initialBalance } = state;
  let currentHorizon = 12;

  const monthlyHistory = getMonthlyHistory(incomes, expenses, 6, referenceMonth);

  function updateView(horizon) {
    currentHorizon = horizon;
    const projData = calculateProjections(monthlyHistory, currentHorizon, initialBalance);

    // Valores finales acumulados
    const optFinal = projData.optimistic[projData.optimistic.length - 1] || 0;
    const expFinal = projData.expected[projData.expected.length - 1] || 0;
    const conFinal = projData.conservative[projData.conservative.length - 1] || 0;

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Encabezado y Selector de Horizonte -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div class="flex items-center gap-2">
              <span class="p-2 rounded-lg bg-emerald-50 text-emerald-600 font-bold">📈</span>
              <div>
                <h2 class="text-xl font-bold text-slate-900">Simulador de Proyecciones Financieras</h2>
                <p class="text-xs text-slate-500">Estimación de crecimiento y patrimonio proyectado en 3 escenarios cuantitativos</p>
              </div>
            </div>
          </div>

          <!-- Selector de Horizonte -->
          <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button data-horizon="6" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${currentHorizon === 6 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              6 Meses
            </button>
            <button data-horizon="12" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${currentHorizon === 12 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              12 Meses
            </button>
            <button data-horizon="24" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${currentHorizon === 24 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              24 Meses
            </button>
          </div>
        </div>

        <!-- Tarjetas de los 3 Escenarios al Final del Horizonte -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <!-- Escenario 1: Optimista -->
          <div class="bg-white border-2 border-emerald-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
            <div class="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
              MEJOR ESCENARIO
            </div>
            <div class="flex items-center gap-2">
              <span class="text-lg">🟢</span>
              <h3 class="font-bold text-slate-900 text-sm">Escenario Optimista</h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">+10% ingresos, -5% gastos fijos, rendimiento 7% anual</p>
            <div class="mt-4">
              <span class="text-[10px] uppercase font-semibold text-slate-400">Patrimonio Estimado (${currentHorizon}m)</span>
              <div class="text-3xl font-black text-emerald-600 mt-0.5">
                ${formatCurrency(optFinal, currency)}
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
              <span>Ganancia estimada:</span>
              <span class="font-bold text-emerald-600">+${formatCurrency(optFinal - initialBalance, currency)}</span>
            </div>
          </div>

          <!-- Escenario 2: Esperado -->
          <div class="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
            <div class="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
              CASO BASE
            </div>
            <div class="flex items-center gap-2">
              <span class="text-lg">🔵</span>
              <h3 class="font-bold text-slate-900 text-sm">Escenario Esperado</h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">Tendencia histórica media, inflación 3.5%, rendimiento 4%</p>
            <div class="mt-4">
              <span class="text-[10px] uppercase font-semibold text-slate-400">Patrimonio Estimado (${currentHorizon}m)</span>
              <div class="text-3xl font-black text-blue-600 mt-0.5">
                ${formatCurrency(expFinal, currency)}
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
              <span>Ganancia estimada:</span>
              <span class="font-bold text-blue-600">+${formatCurrency(expFinal - initialBalance, currency)}</span>
            </div>
          </div>

          <!-- Escenario 3: Conservador -->
          <div class="bg-white border-2 border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
            <div class="absolute top-0 right-0 bg-slate-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
              PRUDENTE
            </div>
            <div class="flex items-center gap-2">
              <span class="text-lg">🔘</span>
              <h3 class="font-bold text-slate-900 text-sm">Escenario Conservador</h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">-5% ingresos por contingencia, +10% gastos imprevistos</p>
            <div class="mt-4">
              <span class="text-[10px] uppercase font-semibold text-slate-400">Patrimonio Estimado (${currentHorizon}m)</span>
              <div class="text-3xl font-black text-slate-700 mt-0.5">
                ${formatCurrency(conFinal, currency)}
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
              <span>Ganancia estimada:</span>
              <span class="font-bold text-slate-700">+${formatCurrency(conFinal - initialBalance, currency)}</span>
            </div>
          </div>

        </div>

        <!-- Gráfico Completo de Proyección -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 class="font-bold text-slate-900 text-base">Curva Comparativa de Trayectorias</h3>
              <p class="text-xs text-slate-500">Datos históricos reales en línea continua Navy | Proyecciones a futuro en líneas punteadas</p>
            </div>
          </div>
          <div class="h-80 w-full relative">
            <canvas id="chart-projections-full"></canvas>
          </div>
        </div>

      </div>
    `;

    // Renderizar gráfico
    requestAnimationFrame(() => {
      const fullCanvas = container.querySelector('#chart-projections-full');
      if (fullCanvas) {
        renderProjectionChart(fullCanvas, projData, currency);
      }
    });

    // Escuchar clicks de botones de horizonte
    container.querySelectorAll('button[data-horizon]').forEach(btn => {
      btn.addEventListener('click', () => {
        const h = Number(btn.dataset.horizon);
        updateView(h);
      });
    });
  }

  updateView(currentHorizon);
}
