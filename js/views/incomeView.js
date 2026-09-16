/**
 * Antigravity Finance - Income View
 * Vista de Ingresos con tabla profesional, filtros, campos manuales (#EFF6FF), campos calculados (#FFFFFF) y acciones.
 */

import { store } from '../state.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { filterByPeriod } from '../calculations.js';
import { exportTransactionsToCSV } from '../utils/exportImport.js';

export function renderIncomeView(container) {
  if (!container) return;

  const state = store.getState();
  const { incomes, currency, period, referenceMonth } = state;
  let currentIncomes = filterByPeriod(incomes, period, referenceMonth);

  // Estadísticas del período
  const totalAmount = currentIncomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const recurringCount = currentIncomes.filter(item => item.isRecurring).length;
  const avgAmount = currentIncomes.length > 0 ? totalAmount / currentIncomes.length : 0;

  container.innerHTML = `
    <div class="space-y-5">
      
      <!-- Encabezado de la Sección y Métricas Rápidas -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-lg bg-emerald-50 text-emerald-600 font-bold">💵</span>
            <div>
              <h2 class="text-xl font-bold text-slate-900">Gestión de Ingresos</h2>
              <p class="text-xs text-slate-500">Registro, auditoría y categorización de flujos de entrada de capital</p>
            </div>
          </div>
        </div>

        <!-- Acciones principales -->
        <div class="flex items-center gap-2.5">
          <button id="btn-export-income-csv" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Exportar CSV
          </button>
          <button id="btn-add-income" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Nuevo Ingreso
          </button>
        </div>
      </div>

      <!-- Tarjetas de Resumen Rápido (Campos Calculados / Blanco Puro) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Campo Calculado 1 -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingreso Total Período</span>
          <div class="text-2xl font-black text-emerald-600 mt-1">${formatCurrency(totalAmount, currency)}</div>
          <span class="text-[11px] text-slate-400">Total acumulado en el período activo</span>
        </div>

        <!-- Campo Calculado 2 -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Promedio por Transacción</span>
          <div class="text-2xl font-black text-slate-800 mt-1">${formatCurrency(avgAmount, currency)}</div>
          <span class="text-[11px] text-slate-400">Ticket promedio en ${currentIncomes.length} registros</span>
        </div>

        <!-- Campo Calculado 3 -->
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flujos Recurrentes</span>
          <div class="text-2xl font-black text-blue-600 mt-1">${recurringCount} <span class="text-sm font-normal text-slate-500">de ${currentIncomes.length}</span></div>
          <span class="text-[11px] text-slate-400">Ingresos fijos automáticos garantizados</span>
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="relative w-full sm:w-80">
          <input 
            type="text" 
            id="search-income" 
            placeholder="Buscar por descripción o categoría..." 
            class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
          />
          <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Leyenda de colores -->
          <div class="hidden md:flex items-center gap-3 text-[11px] text-slate-500 border-r border-slate-200 pr-3 mr-1">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-[#EFF6FF] border border-blue-200 inline-block"></span> Entrada Manual</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-white border border-slate-300 inline-block"></span> Campo Calculado</span>
          </div>

          <select id="filter-income-category" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-400 cursor-pointer">
            <option value="">Todas las Categorías</option>
            <option value="Salario Base">Salario Base</option>
            <option value="Consultoría / Freelance">Consultoría / Freelance</option>
            <option value="Rendimientos / Dividendos">Rendimientos / Dividendos</option>
            <option value="Bonificaciones">Bonificaciones</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
      </div>

      <!-- Contenedor de la Tabla con Encabezado Fijo (Sticky) -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="overflow-x-auto max-h-[500px]">
          <table class="w-full text-left border-collapse" id="table-incomes">
            
            <!-- Encabezado Oscuro en Azul Navy -->
            <thead class="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold sticky top-0 z-10 shadow-xs">
              <tr>
                <th class="py-3 px-4">Fecha</th>
                <th class="py-3 px-4">Categoría</th>
                <th class="py-3 px-4">Descripción (Manual)</th>
                <th class="py-3 px-4">Fuente / Medio</th>
                <th class="py-3 px-4 text-center">Recurrente</th>
                <th class="py-3 px-4 text-right">Monto</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>

            <!-- Cuerpo de la Tabla -->
            <tbody id="tbody-incomes" class="divide-y divide-slate-100 text-xs text-slate-700">
              <!-- Renderizado dinámico -->
            </tbody>

            <!-- Pie de Tabla con Totales Calculados (Fondo Blanco) -->
            <tfoot class="bg-white font-bold border-t-2 border-slate-200 text-xs text-slate-900 sticky bottom-0">
              <tr>
                <td colspan="5" class="py-3 px-4 text-right uppercase tracking-wider text-slate-500">Total Ingresos Período:</td>
                <td id="tfoot-total-income" class="py-3 px-4 text-right text-emerald-600 font-extrabold text-sm">
                  ${formatCurrency(totalAmount, currency)}
                </td>
                <td></td>
              </tr>
            </tfoot>

          </table>
        </div>
      </div>

    </div>
  `;

  const tbody = container.querySelector('#tbody-incomes');
  const searchInput = container.querySelector('#search-income');
  const catFilter = container.querySelector('#filter-income-category');
  const exportBtn = container.querySelector('#btn-export-income-csv');
  const addBtn = container.querySelector('#btn-add-income');

  function renderRows(items) {
    if (!items.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400">
            No se encontraron ingresos registrados para el período o filtro seleccionado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map((inc, index) => {
      const isAltRow = index % 2 === 1;
      const rowBg = isAltRow ? 'bg-[#F8FAFC]' : 'bg-white';

      return `
        <tr class="${rowBg} hover:bg-slate-100/70 transition-colors">
          <!-- Fecha -->
          <td class="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
            ${formatDate(inc.date)}
          </td>

          <!-- Categoría -->
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              ${inc.category || 'General'}
            </span>
          </td>

          <!-- Descripción (Entrada Manual: fondo suave #EFF6FF) -->
          <td class="py-3 px-4">
            <div class="px-2.5 py-1 rounded bg-[#EFF6FF] border border-blue-100 text-slate-800 font-medium max-w-xs truncate" title="${inc.description || ''}">
              ${inc.description || 'Sin descripción'}
            </div>
          </td>

          <!-- Fuente / Medio -->
          <td class="py-3 px-4 text-slate-600 whitespace-nowrap">
            ${inc.source || 'Transferencia'}
          </td>

          <!-- Recurrente -->
          <td class="py-3 px-4 text-center whitespace-nowrap">
            ${inc.isRecurring ? `
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                Fijo Mensual
              </span>
            ` : `
              <span class="text-slate-400 text-[11px]">Eventual</span>
            `}
          </td>

          <!-- Monto (Alineado a la derecha, Verde Positivo) -->
          <td class="py-3 px-4 text-right font-bold text-emerald-600 font-mono text-xs whitespace-nowrap">
            +${formatCurrency(inc.amount, currency)}
          </td>

          <!-- Acciones -->
          <td class="py-3 px-4 text-center whitespace-nowrap">
            <div class="inline-flex items-center gap-1.5">
              <button data-action="edit" data-id="${inc.id}" class="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer" title="Editar">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
              <button data-action="delete" data-id="${inc.id}" class="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer" title="Eliminar">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Filtrado reactivo
  function applyFilters() {
    const q = (searchInput.value || '').toLowerCase();
    const cat = catFilter.value;

    const filtered = currentIncomes.filter(item => {
      const matchQ = !q || (item.description && item.description.toLowerCase().includes(q)) || (item.category && item.category.toLowerCase().includes(q));
      const matchCat = !cat || item.category === cat;
      return matchQ && matchCat;
    });

    renderRows(filtered);

    // Actualizar total calculado en el pie
    const subtotal = filtered.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const footTotal = container.querySelector('#tfoot-total-income');
    if (footTotal) footTotal.textContent = formatCurrency(subtotal, currency);
  }

  // Render inicial
  renderRows(currentIncomes);

  // Event Listeners
  searchInput.addEventListener('input', applyFilters);
  catFilter.addEventListener('change', applyFilters);

  exportBtn.addEventListener('click', () => {
    exportTransactionsToCSV(currentIncomes.map(i => ({ ...i, type: 'income' })), `ingresos_${period}.csv`);
  });

  addBtn.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-transaction-modal', { detail: { type: 'income' } }));
  });

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'delete') {
      if (confirm('¿Estás seguro de eliminar este registro de ingreso?')) {
        store.deleteIncome(id);
      }
    } else if (action === 'edit') {
      const item = state.incomes.find(i => i.id === id);
      if (item) {
        window.dispatchEvent(new CustomEvent('open-transaction-modal', { detail: { type: 'income', item } }));
      }
    }
  });
}
