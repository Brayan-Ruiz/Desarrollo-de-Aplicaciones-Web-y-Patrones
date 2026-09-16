/**
 * Antigravity Finance - Goals View
 * Gestión de Metas Financieras, seguimiento de progreso y estimación de tiempos de cumplimiento.
 */

import { store } from '../state.js';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatters.js';

export function renderGoalsView(container) {
  if (!container) return;

  const state = store.getState();
  const { goals, currency, incomes, expenses, referenceMonth } = state;

  // Calcular capacidad mensual de ahorro promedio
  const currentIncomes = incomes.filter(i => i.date && i.date.startsWith(referenceMonth));
  const currentExpenses = expenses.filter(e => e.date && e.date.startsWith(referenceMonth));
  const totalInc = currentIncomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalExp = currentExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const monthlySavings = Math.max(0, totalInc - totalExp);

  // Totales agregados de metas
  const totalTarget = goals.reduce((s, g) => s + (Number(g.targetAmount) || 0), 0);
  const totalSaved = goals.reduce((s, g) => s + (Number(g.currentAmount) || 0), 0);
  const totalPending = Math.max(0, totalTarget - totalSaved);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  container.innerHTML = `
    <div class="space-y-5">
      
      <!-- Encabezado de Metas -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-lg bg-emerald-50 text-emerald-600 font-bold">🏆</span>
            <div>
              <h2 class="text-xl font-bold text-slate-900">Metas y Objetivos de Ahorro</h2>
              <p class="text-xs text-slate-500">Planificación de propósitos financieros con plazos, prioridades y aportes progresivos</p>
            </div>
          </div>
        </div>

        <button id="btn-add-goal" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Nueva Meta Financiera
        </button>
      </div>

      <!-- Métricas Globales de Metas (Campos Calculados / Blanco) -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monto Total Meta</span>
          <div class="text-2xl font-black text-slate-900 mt-1">${formatCurrency(totalTarget, currency)}</div>
          <span class="text-[11px] text-slate-400">Suma de todos los objetivos</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ahorro Consolidado</span>
          <div class="text-2xl font-black text-emerald-600 mt-1">${formatCurrency(totalSaved, currency)}</div>
          <span class="text-[11px] text-slate-400">Capital acumulado a la fecha</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Capital Faltante</span>
          <div class="text-2xl font-black text-blue-600 mt-1">${formatCurrency(totalPending, currency)}</div>
          <span class="text-[11px] text-slate-400">Brecha para completar el 100%</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progreso Global</span>
          <div class="text-2xl font-black text-slate-900 mt-1">${formatPercentage(overallProgress)}</div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div class="bg-emerald-500 h-full rounded-full" style="width: ${Math.min(100, overallProgress)}%"></div>
          </div>
        </div>
      </div>

      <!-- Tarjetas de Metas Individuales -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${goals.map(g => {
          const target = Number(g.targetAmount) || 1;
          const current = Number(g.currentAmount) || 0;
          const pct = Math.min(100, (current / target) * 100);
          const remaining = Math.max(0, target - current);
          const isCompleted = current >= target;

          // Estimación de meses para completar al ritmo de ahorro actual (asumiendo 30% del ahorro mensual)
          const dedicatedMonthly = monthlySavings * 0.35;
          const estimatedMonths = dedicatedMonthly > 0 ? Math.ceil(remaining / dedicatedMonthly) : 'N/D';

          const priorityBadge = g.priority === 'Alta' 
            ? 'bg-red-50 text-red-700 border-red-200' 
            : g.priority === 'Media' 
            ? 'bg-amber-50 text-amber-700 border-amber-200' 
            : 'bg-blue-50 text-blue-700 border-blue-200';

          return `
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <!-- Encabezado de la Meta -->
                <div class="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 class="font-bold text-slate-900 text-base">${g.title}</h3>
                    <span class="text-xs text-slate-500">${g.category || 'General'}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${priorityBadge}">
                      Prioridad ${g.priority || 'Normal'}
                    </span>
                    ${isCompleted ? `
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ¡Completada! 🏆
                      </span>
                    ` : ''}
                  </div>
                </div>

                <!-- Montos -->
                <div class="mt-4 flex items-baseline justify-between">
                  <div>
                    <span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Ahorrado</span>
                    <div class="text-2xl font-black text-emerald-600">
                      ${formatCurrency(current, currency)}
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Meta Objetivo</span>
                    <div class="text-lg font-bold text-slate-800">
                      ${formatCurrency(target, currency)}
                    </div>
                  </div>
                </div>

                <!-- Barra de Progreso -->
                <div class="mt-3">
                  <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                  </div>
                  <div class="flex items-center justify-between text-xs mt-1.5">
                    <span class="font-semibold text-slate-700">${pct.toFixed(1)}% alcanzado</span>
                    <span class="text-slate-500">Faltan ${formatCurrency(remaining, currency)}</span>
                  </div>
                </div>

                <!-- Proyección de Cumplimiento -->
                <div class="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <div>
                    <span class="text-slate-400 block text-[10px] uppercase">Fecha Límite</span>
                    <span class="font-semibold text-slate-700">${formatDate(g.deadline, true) || 'Sin fecha'}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-slate-400 block text-[10px] uppercase">Tiempo Estimado</span>
                    <span class="font-bold text-emerald-700">${isCompleted ? 'Completada' : `${estimatedMonths} meses`}</span>
                  </div>
                </div>
              </div>

              <!-- Acciones -->
              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button data-action="contribute" data-id="${g.id}" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer">
                  + Aportar Capital
                </button>
                <div class="flex items-center gap-2">
                  <button data-action="edit-goal" data-id="${g.id}" class="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer">
                    Editar
                  </button>
                  <button data-action="delete-goal" data-id="${g.id}" class="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer">
                    Eliminar
                  </button>
                </div>
              </div>

            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;

  // Event Listeners
  const addBtn = container.querySelector('#btn-add-goal');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-goal-modal', { detail: {} }));
    });
  }

  container.addEventListener('click', (e) => {
    const contBtn = e.target.closest('button[data-action="contribute"]');
    const editBtn = e.target.closest('button[data-action="edit-goal"]');
    const delBtn = e.target.closest('button[data-action="delete-goal"]');

    if (contBtn) {
      const id = contBtn.dataset.id;
      const g = state.goals.find(item => item.id === id);
      if (g) {
        const amountStr = prompt(`¿Cuánto capital deseas aportar a la meta "${g.title}"?`, '500');
        if (amountStr) {
          const num = parseFloat(amountStr);
          if (!isNaN(num) && num > 0) {
            store.contributeToGoal(id, num);
          }
        }
      }
    }

    if (editBtn) {
      const id = editBtn.dataset.id;
      const goal = state.goals.find(g => g.id === id);
      if (goal) {
        window.dispatchEvent(new CustomEvent('open-goal-modal', { detail: { goal } }));
      }
    }

    if (delBtn) {
      const id = delBtn.dataset.id;
      if (confirm('¿Deseas eliminar esta meta financiera?')) {
        store.deleteGoal(id);
      }
    }
  });
}
