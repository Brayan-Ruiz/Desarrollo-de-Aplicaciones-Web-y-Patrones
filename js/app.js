/**
 * Antigravity Finance - Application Orchestrator
 * Enrutamiento de pestañas, gestión de modales, sincronización reactiva y controladores globales.
 */

import { store } from './state.js';
import { CURRENCIES, formatDate } from './utils/formatters.js';
import { calculateKPIs, evaluateFinancialHealth, evaluateBudgets, filterByPeriod } from './calculations.js';
import { exportToJSON, importFromJSON } from './utils/exportImport.js';

// Vistas
import { renderDashboard } from './views/dashboardView.js';
import { renderIncomeView } from './views/incomeView.js';
import { renderExpenseView } from './views/expenseView.js';
import { renderBudgetView } from './views/budgetView.js';
import { renderCashFlowView } from './views/cashFlowView.js';
import { renderProjectionsView } from './views/projectionsView.js';
import { renderGoalsView } from './views/goalsView.js';

// Categorías predefinidas
const INCOME_CATEGORIES = [
  'Salario Base',
  'Consultoría / Freelance',
  'Rendimientos / Dividendos',
  'Bonificaciones',
  'Venta de Activos',
  'Otros'
];

const EXPENSE_CATEGORIES = [
  'Vivienda',
  'Alimentación',
  'Transporte',
  'Servicios',
  'Salud',
  'Entretenimiento',
  'Educación',
  'Ahorro e Inversión',
  'Otros'
];

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.viewContainer = document.getElementById('view-container');
    this.navTabs = document.querySelectorAll('.nav-tab');

    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupGlobalControls();
    this.setupModals();
    this.setupStateSubscription();

    // Sincronizar selectores iniciales con el estado
    const state = store.getState();
    const curSelect = document.getElementById('select-currency');
    const perSelect = document.getElementById('select-period');
    if (curSelect) curSelect.value = state.currency;
    if (perSelect) perSelect.value = state.period;

    // Actualizar badge de salud en el encabezado
    this.updateHeaderHealthBadge();

    // Renderizar vista inicial
    this.renderCurrentView();

    // Escuchar eventos globales personalizados
    window.addEventListener('navigate-to', (e) => {
      if (e.detail && e.detail.view) this.navigateTo(e.detail.view);
    });

    window.addEventListener('open-transaction-modal', (e) => {
      this.openTransactionModal(e.detail);
    });

    window.addEventListener('open-budget-modal', (e) => {
      this.openBudgetModal(e.detail);
    });

    window.addEventListener('open-goal-modal', (e) => {
      this.openGoalModal(e.detail);
    });
  }

  // --- NAVEGACIÓN Y ENRUTAMIENTO ---
  setupNavigation() {
    this.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.dataset.tab;
        this.navigateTo(targetView);
      });
    });
  }

  navigateTo(viewName) {
    this.currentView = viewName;

    // Actualizar estilos visuales de las pestañas
    this.navTabs.forEach(tab => {
      const isTarget = tab.dataset.tab === viewName;
      if (isTarget) {
        tab.classList.add('active', 'text-white', 'bg-slate-800');
        tab.classList.remove('text-slate-400');
      } else {
        tab.classList.remove('active', 'text-white', 'bg-slate-800');
        tab.classList.add('text-slate-400');
      }
    });

    this.renderCurrentView();
  }

  renderCurrentView() {
    if (!this.viewContainer) return;
    this.viewContainer.innerHTML = '';

    switch (this.currentView) {
      case 'dashboard':
        renderDashboard(this.viewContainer);
        break;
      case 'income':
        renderIncomeView(this.viewContainer);
        break;
      case 'expense':
        renderExpenseView(this.viewContainer);
        break;
      case 'budget':
        renderBudgetView(this.viewContainer);
        break;
      case 'cashflow':
        renderCashFlowView(this.viewContainer);
        break;
      case 'projections':
        renderProjectionsView(this.viewContainer);
        break;
      case 'goals':
        renderGoalsView(this.viewContainer);
        break;
      default:
        renderDashboard(this.viewContainer);
    }
  }

  // --- CONTROLES GLOBALES (Moneda, Período, Respaldos) ---
  setupGlobalControls() {
    // Selector de Moneda
    const curSelect = document.getElementById('select-currency');
    if (curSelect) {
      curSelect.addEventListener('change', (e) => {
        store.setCurrency(e.target.value);
        this.showToast(`Moneda cambiada a ${e.target.value}`, 'info');
      });
    }

    // Selector de Período
    const perSelect = document.getElementById('select-period');
    if (perSelect) {
      perSelect.addEventListener('change', (e) => {
        store.setPeriod(e.target.value);
      });
    }

    // Botón global de nueva transacción en header
    const addTxBtn = document.getElementById('btn-global-add-tx');
    if (addTxBtn) {
      addTxBtn.addEventListener('click', () => {
        this.openTransactionModal({ type: 'expense' });
      });
    }

    // Botón de Configuración y Respaldos
    const settingsBtn = document.getElementById('btn-open-settings');
    const settingsModal = document.getElementById('modal-settings');
    const settingsClose = document.getElementById('modal-settings-close');

    if (settingsBtn && settingsModal) {
      settingsBtn.addEventListener('click', () => settingsModal.showModal());
      if (settingsClose) settingsClose.addEventListener('click', () => settingsModal.close());

      // Exportar JSON
      const exportBtn = document.getElementById('btn-export-backup');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          exportToJSON(store.getState());
          this.showToast('Copia de seguridad descargada exitosamente', 'success');
        });
      }

      // Importar JSON
      const importInput = document.getElementById('input-import-file');
      if (importInput) {
        importInput.addEventListener('change', async (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            try {
              const data = await importFromJSON(file);
              store.importData(data);
              settingsModal.close();
              this.showToast('Datos restaurados correctamente desde JSON', 'success');
            } catch (err) {
              alert(err.message || 'Error al restaurar archivo');
            }
          }
        });
      }

      // Reset a demostración
      const resetBtn = document.getElementById('btn-reset-demo');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (confirm('¿Restablecer el sistema a los datos iniciales de Septiembre 2026? Se borrarán los cambios locales.')) {
            store.resetToDefaults();
            settingsModal.close();
            this.showToast('Datos restablecidos a la configuración de demo', 'info');
          }
        });
      }
    }
  }

  // --- SUSCRIPCIÓN REACTIVA AL STORE ---
  setupStateSubscription() {
    store.subscribe(() => {
      this.updateHeaderHealthBadge();
      this.renderCurrentView();
    });
  }

  updateHeaderHealthBadge() {
    const state = store.getState();
    const kpis = calculateKPIs(state.incomes, state.expenses, state.referenceMonth);
    const currentExpenses = filterByPeriod(state.expenses, state.period, state.referenceMonth);
    const evaluatedBudgets = evaluateBudgets(state.budgets, currentExpenses);
    const health = evaluateFinancialHealth(kpis.current.savingsRate, kpis.current.netFlow, evaluatedBudgets);

    const badgeEl = document.getElementById('header-health-badge');
    const labelEl = document.getElementById('header-health-label');
    if (badgeEl && labelEl) {
      labelEl.textContent = health.label;
      if (health.status === 'healthy') {
        badgeEl.className = 'hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50';
      } else if (health.status === 'warning') {
        badgeEl.className = 'hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50';
      } else {
        badgeEl.className = 'hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/80 text-red-300 border border-red-700/50';
      }
    }
  }

  // --- MODAL: TRANSACCIONES (INGRESO / GASTO) ---
  setupModals() {
    // Cerrar modales con clic fuera del cuadro
    document.querySelectorAll('dialog').forEach(diag => {
      diag.addEventListener('click', (e) => {
        const rect = diag.getBoundingClientRect();
        const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        if (!isInDialog) diag.close();
      });
    });

    this.setupTransactionModalForm();
    this.setupBudgetModalForm();
    this.setupGoalModalForm();
  }

  setupTransactionModalForm() {
    const modal = document.getElementById('modal-transaction');
    const form = document.getElementById('form-transaction');
    const closeBtn = document.getElementById('modal-tx-close');
    const cancelBtn = document.getElementById('tx-btn-cancel');

    const btnTypeIncome = document.getElementById('tx-type-income');
    const btnTypeExpense = document.getElementById('tx-type-expense');
    const inputType = document.getElementById('tx-type');
    const selectCategory = document.getElementById('tx-category');
    const labelMethod = document.getElementById('tx-method-label');

    const updateTypeUI = (type) => {
      inputType.value = type;
      if (type === 'income') {
        btnTypeIncome.className = 'py-1.5 text-xs font-bold rounded-md transition-all bg-white text-emerald-600 shadow-xs cursor-pointer';
        btnTypeExpense.className = 'py-1.5 text-xs font-bold rounded-md transition-all text-slate-700 hover:text-slate-900 cursor-pointer';
        labelMethod.textContent = 'Fuente / Medio de Entrada';
        selectCategory.innerHTML = INCOME_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
      } else {
        btnTypeExpense.className = 'py-1.5 text-xs font-bold rounded-md transition-all bg-white text-red-600 shadow-xs cursor-pointer';
        btnTypeIncome.className = 'py-1.5 text-xs font-bold rounded-md transition-all text-slate-700 hover:text-slate-900 cursor-pointer';
        labelMethod.textContent = 'Método de Pago';
        selectCategory.innerHTML = EXPENSE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
      }
    };

    btnTypeIncome.addEventListener('click', () => updateTypeUI('income'));
    btnTypeExpense.addEventListener('click', () => updateTypeUI('expense'));

    closeBtn.addEventListener('click', () => modal.close());
    cancelBtn.addEventListener('click', () => modal.close());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('tx-id').value;
      const type = inputType.value;
      const amount = parseFloat(document.getElementById('tx-amount').value) || 0;
      const date = document.getElementById('tx-date').value;
      const category = document.getElementById('tx-category').value;
      const description = document.getElementById('tx-description').value;
      const method = document.getElementById('tx-method').value;
      const isRecurring = document.getElementById('tx-recurring').checked;

      if (type === 'income') {
        const itemData = { date, category, description, amount, source: method, isRecurring };
        if (id) store.updateIncome(id, itemData);
        else store.addIncome(itemData);
        this.showToast('Ingreso registrado correctamente', 'success');
      } else {
        const itemData = { date, category, description, amount, paymentMethod: method, isRecurring };
        if (id) store.updateExpense(id, itemData);
        else store.addExpense(itemData);
        this.showToast('Gasto registrado correctamente', 'success');
      }

      modal.close();
      form.reset();
    });
  }

  openTransactionModal(options = {}) {
    const modal = document.getElementById('modal-transaction');
    const form = document.getElementById('form-transaction');
    const titleEl = document.getElementById('modal-tx-title');
    const curSymbol = document.getElementById('tx-currency-symbol');

    const state = store.getState();
    const curConfig = CURRENCIES[state.currency] || CURRENCIES.USD;
    if (curSymbol) curSymbol.textContent = curConfig.symbol;

    form.reset();
    document.getElementById('tx-id').value = '';

    const type = options.type || 'expense';
    const item = options.item || null;

    // Disparar click en botón de tipo
    const typeBtn = type === 'income' ? document.getElementById('tx-type-income') : document.getElementById('tx-type-expense');
    if (typeBtn) typeBtn.click();

    // Fecha por defecto: hoy
    document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];

    if (item) {
      titleEl.textContent = `Editar ${type === 'income' ? 'Ingreso' : 'Gasto'}`;
      document.getElementById('tx-id').value = item.id;
      document.getElementById('tx-amount').value = item.amount;
      document.getElementById('tx-date').value = item.date;
      document.getElementById('tx-category').value = item.category;
      document.getElementById('tx-description').value = item.description;
      document.getElementById('tx-method').value = item.source || item.paymentMethod || 'Transferencia';
      document.getElementById('tx-recurring').checked = Boolean(item.isRecurring);
    } else {
      titleEl.textContent = `Registrar ${type === 'income' ? 'Ingreso' : 'Gasto'}`;
    }

    modal.showModal();
  }

  // --- MODAL: PRESUPUESTOS ---
  setupBudgetModalForm() {
    const modal = document.getElementById('modal-budget');
    const form = document.getElementById('form-budget');
    const closeBtn = document.getElementById('modal-budget-close');
    const cancelBtn = document.getElementById('budget-btn-cancel');

    closeBtn.addEventListener('click', () => modal.close());
    cancelBtn.addEventListener('click', () => modal.close());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('budget-id').value;
      const category = document.getElementById('budget-category').value;
      const allocated = parseFloat(document.getElementById('budget-allocated').value) || 0;
      const notes = document.getElementById('budget-notes').value;

      if (id) {
        store.updateBudget(id, { category, allocated, notes });
        this.showToast('Límite de presupuesto actualizado', 'success');
      } else {
        store.addBudget({ category, allocated, notes });
        this.showToast('Nuevo presupuesto creado', 'success');
      }

      modal.close();
      form.reset();
    });
  }

  openBudgetModal(options = {}) {
    const modal = document.getElementById('modal-budget');
    const form = document.getElementById('form-budget');
    const titleEl = document.getElementById('modal-budget-title');
    const budget = options.budget || null;

    form.reset();
    document.getElementById('budget-id').value = '';

    if (budget) {
      titleEl.textContent = 'Editar Presupuesto de Categoría';
      document.getElementById('budget-id').value = budget.id;
      document.getElementById('budget-category').value = budget.category;
      document.getElementById('budget-allocated').value = budget.allocated;
      document.getElementById('budget-notes').value = budget.notes || '';
    } else {
      titleEl.textContent = 'Nuevo Límite de Presupuesto';
    }

    modal.showModal();
  }

  // --- MODAL: METAS FINANCIERAS ---
  setupGoalModalForm() {
    const modal = document.getElementById('modal-goal');
    const form = document.getElementById('form-goal');
    const closeBtn = document.getElementById('modal-goal-close');
    const cancelBtn = document.getElementById('goal-btn-cancel');

    closeBtn.addEventListener('click', () => modal.close());
    cancelBtn.addEventListener('click', () => modal.close());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('goal-id').value;
      const title = document.getElementById('goal-title').value;
      const targetAmount = parseFloat(document.getElementById('goal-target').value) || 0;
      const currentAmount = parseFloat(document.getElementById('goal-current').value) || 0;
      const category = document.getElementById('goal-category').value;
      const priority = document.getElementById('goal-priority').value;
      const deadline = document.getElementById('goal-deadline').value;

      if (id) {
        store.updateGoal(id, { title, targetAmount, currentAmount, category, priority, deadline });
        this.showToast('Meta financiera actualizada', 'success');
      } else {
        store.addGoal({ title, targetAmount, currentAmount, category, priority, deadline });
        this.showToast('Nueva meta de ahorro registrada', 'success');
      }

      modal.close();
      form.reset();
    });
  }

  openGoalModal(options = {}) {
    const modal = document.getElementById('modal-goal');
    const form = document.getElementById('form-goal');
    const titleEl = document.getElementById('modal-goal-title');
    const goal = options.goal || null;

    form.reset();
    document.getElementById('goal-id').value = '';

    if (goal) {
      titleEl.textContent = 'Editar Meta Financiera';
      document.getElementById('goal-id').value = goal.id;
      document.getElementById('goal-title').value = goal.title;
      document.getElementById('goal-target').value = goal.targetAmount;
      document.getElementById('goal-current').value = goal.currentAmount;
      document.getElementById('goal-category').value = goal.category || '';
      document.getElementById('goal-priority').value = goal.priority || 'Media';
      document.getElementById('goal-deadline').value = goal.deadline || '';
    } else {
      titleEl.textContent = 'Nueva Meta Financiera';
    }

    modal.showModal();
  }

  // --- NOTIFICACIONES TOAST ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-800 text-white' : type === 'error' ? 'bg-red-800 text-white' : 'bg-slate-900 text-white';
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

    toast.className = `toast flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold ${bgClass}`;
    toast.innerHTML = `<span class="font-bold">${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
