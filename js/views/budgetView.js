/**
 * Antigravity Finance - Budget View
 * Control y auditoría de presupuestos por categoría con barras de consumo, semáforos y advertencias preventivas.
 */

import { store } from '../state.js';
import { formatCurrency, formatPercentage } from '../utils/formatters.js';
import { filterByPeriod, evaluateBudgets } from '../calculations.js';

export function renderBudgetView(container) {
  if (!container) return;

  const state = store.getState();
  const { budgets, expenses, currency, period, referenceMonth } = state;
  const currentExpenses = filterByPeriod(expenses, period, referenceMonth);
  const evaluated = evaluateBudgets(budgets, currentExpenses);

  const totalAllocated = evaluated.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = evaluated.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  container.innerHTML = `
    <div class="space-y-5">
      
      <!-- Encabezado de Presupuesto -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-lg bg-blue-50 text-blue-600 font-bold">🎯</span>
            <div>
              <h2 class="text-xl font-bold text-slate-900">Presupuesto Mensual por Categorías</h2>
              <p class="text-xs text-slate-500">Límites de gasto establecidos, control de desviaciones y semáforo preventivo</p>
            </div>
          </div>
        </div>

        <!-- Botón Añadir Presupuesto -->
        <button id="btn-add-budget" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Nuevo Límite de Categoría
        </button>
      </div>

      <!-- Resumen General del Presupuesto (Campos Calculados) -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presupuesto Total</span>
          <div class="text-2xl font-black text-slate-900 mt-1">${formatCurrency(totalAllocated, currency)}</div>
          <span class="text-[11px] text-slate-400">Techo mensual asignado</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gasto Real Ejecutado</span>
          <div class="text-2xl font-black text-slate-800 mt-1">${formatCurrency(totalSpent, currency)}</div>
          <span class="text-[11px] text-slate-400">Total gastado en el período</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Margen Disponible</span>
          <div class="text-2xl font-black ${totalRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'} mt-1">
            ${formatCurrency(totalRemaining, currency)}
          </div>
          <span class="text-[11px] text-slate-400">${totalRemaining >= 0 ? 'Fondo disponible restante' : 'Sobregiro general en presupuestos'}</span>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ejecución Global</span>
          <div class="text-2xl font-black ${overallPercentage < 80 ? 'text-emerald-600' : overallPercentage < 100 ? 'text-amber-600' : 'text-red-600'} mt-1">
            ${formatPercentage(overallPercentage)}
          </div>
          <div class="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div class="h-full rounded-full ${overallPercentage < 80 ? 'bg-emerald-500' : overallPercentage < 100 ? 'bg-amber-500' : 'bg-red-500'}" style="width: ${Math.min(100, overallPercentage)}%"></div>
          </div>
        </div>
      </div>

      <!-- Tarjetas de Categorías de Presupuesto con Semáforos -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${evaluated.map(b => {
          const isOver = b.realPercentage >= 100;
          const isWarning = b.realPercentage >= 75 && !isOver;
          const statusIcon = isOver ? '🔴 Excedido' : isWarning ? '🟡 En Alerta' : '🟢 En Rango';
          const statusBadge = isOver ? 'bg-red-50 text-red-700 border-red-200' : isWarning ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';

          return `
            <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <!-- Encabezado de la Tarjeta -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 class="font-bold text-slate-900 text-sm">${b.category}</h3>
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge}">
                    ${statusIcon}
                  </span>
                </div>

                <!-- Montos -->
                <div class="mt-4 flex items-baseline justify-between">
                  <div>
                    <span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Consumo Real</span>
                    <div class="text-xl font-extrabold ${isOver ? 'text-red-600' : 'text-slate-800'}">
                      ${formatCurrency(b.spent, currency)}
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Límite Asignado</span>
                    <div class="text-base font-bold text-slate-600">
                      ${formatCurrency(b.allocated, currency)}
                    </div>
                  </div>
                </div>

                <!-- Barra de Progreso con Semáforo -->
                <div class="mt-3">
                  <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" style="width: ${Math.min(100, b.percentage)}%; background-color: ${b.color}"></div>
                  </div>
                  <div class="flex items-center justify-between text-xs mt-1.5 font-medium">
                    <span class="text-slate-500">${b.realPercentage.toFixed(1)}% consumido</span>
                    <span class="${b.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'} font-semibold">
                      ${b.remaining >= 0 ? `Quedan ${formatCurrency(b.remaining, currency)}` : `Déficit: ${formatCurrency(Math.abs(b.remaining), currency)}`}
                    </span>
                  </div>
                </div>

                <!-- Notas opcionales -->
                ${b.notes ? `
                  <p class="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-50 italic">
                    "${b.notes}"
                  </p>
                ` : ''}
              </div>

              <!-- Acciones al pie -->
              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button data-action="edit-budget" data-id="${b.id}" class="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer">
                  Editar Límite
                </button>
                <button data-action="delete-budget" data-id="${b.id}" class="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer">
                  Eliminar
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;

  // Event Listeners
  const addBtn = container.querySelector('#btn-add-budget');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-budget-modal', { detail: {} }));
    });
  }

  container.addEventListener('click', (e) => {
    const editBtn = e.target.closest('button[data-action="edit-budget"]');
    const deleteBtn = e.target.closest('button[data-action="delete-budget"]');

    if (editBtn) {
      const id = editBtn.dataset.id;
      const budget = state.budgets.find(b => b.id === id);
      if (budget) {
        window.dispatchEvent(new CustomEvent('open-budget-modal', { detail: { budget } }));
      }
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (confirm('¿Deseas eliminar este presupuesto por categoría?')) {
        store.deleteBudget(id);
      }
    }
  });
}
