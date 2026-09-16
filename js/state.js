/**
 * Antigravity Finance - State Store
 * Almacenamiento reactivo con persistencia local en localStorage y datos iniciales de referencia.
 */

const STORAGE_KEY = 'antigravity_finance_state_v1';

// Conjunto de datos iniciales calibrados exactamente con los ejemplos de la especificación
const DEFAULT_STATE = {
  currency: 'USD',
  period: 'current_month',
  referenceMonth: '2026-09',
  initialBalance: 28500, // Patrimonio líquido acumulado base

  incomes: [
    // Septiembre 2026 (Total: $8,450.00)
    { id: 'inc-2026-09-1', date: '2026-09-01', category: 'Salario Base', description: 'Nómina Quincenal + Base Empresa Tech', amount: 6500, source: 'Transferencia Bancaria', isRecurring: true },
    { id: 'inc-2026-09-2', date: '2026-09-12', category: 'Consultoría / Freelance', description: 'Asesoría Arquitectura Cloud Fintech', amount: 1450, source: 'Stripe / Depósito', isRecurring: false },
    { id: 'inc-2026-09-3', date: '2026-09-15', category: 'Rendimientos / Dividendos', description: 'Dividendos ETFs Globales Vanguard', amount: 500, source: 'Broker de Inversión', isRecurring: true },

    // Agosto 2026 (Total: $7,518.00 -> Septiembre es +12.4% vs mes anterior)
    { id: 'inc-2026-08-1', date: '2026-08-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia Bancaria', isRecurring: true },
    { id: 'inc-2026-08-2', date: '2026-08-15', category: 'Consultoría / Freelance', description: 'Proyecto Web UX Audit', amount: 1018, source: 'Depósito', isRecurring: false },

    // Julio 2026
    { id: 'inc-2026-07-1', date: '2026-07-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia Bancaria', isRecurring: true },
    { id: 'inc-2026-07-2', date: '2026-07-18', category: 'Consultoría / Freelance', description: 'Auditoría DevOps', amount: 1200, source: 'Transferencia', isRecurring: false },

    // Junio 2026
    { id: 'inc-2026-06-01', date: '2026-06-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia', isRecurring: true },
    { id: 'inc-2026-06-15', date: '2026-06-15', category: 'Consultoría / Freelance', description: 'Sprint Fullstack', amount: 1600, source: 'Stripe', isRecurring: false },

    // Mayo 2026
    { id: 'inc-2026-05-01', date: '2026-05-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia', isRecurring: true },
    { id: 'inc-2026-05-20', date: '2026-05-20', category: 'Rendimientos / Dividendos', description: 'Rendimientos trimestrales', amount: 480, source: 'Broker', isRecurring: false },

    // Abril 2026
    { id: 'inc-2026-04-01', date: '2026-04-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia', isRecurring: true }
  ],

  expenses: [
    // Septiembre 2026 (Total: $3,200.00)
    // Tasa de ahorro: (8450 - 3200)/8450 = 62.1% | Balance Neto: $5,250
    { id: 'exp-2026-09-1', date: '2026-09-02', category: 'Vivienda', description: 'Alquiler / Hipoteca Apartamento Central', amount: 1200, paymentMethod: 'Transferencia', isRecurring: true },
    { id: 'exp-2026-09-2', date: '2026-09-05', category: 'Alimentación', description: 'Supermercado Mensual Orgánico', amount: 650, paymentMethod: 'Tarjeta de Débito', isRecurring: false },
    { id: 'exp-2026-09-3', date: '2026-09-08', category: 'Servicios', description: 'Fibra Óptica 1Gbps + Electricidad', amount: 280, paymentMethod: 'Débito Automático', isRecurring: true },
    { id: 'exp-2026-09-4', date: '2026-09-10', category: 'Transporte', description: 'Gasolina y Mantenimiento Vehicular', amount: 320, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },
    { id: 'exp-2026-09-5', date: '2026-09-12', category: 'Entretenimiento', description: 'Cenas, Restaurantes y Streaming', amount: 250, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },
    { id: 'exp-2026-09-6', date: '2026-09-04', category: 'Salud', description: 'Póliza Médica y Gimnasio Premium', amount: 300, paymentMethod: 'Tarjeta de Crédito', isRecurring: true },
    { id: 'exp-2026-09-7', date: '2026-09-06', category: 'Educación', description: 'Suscripción Cursos de Arquitectura Cloud', amount: 200, paymentMethod: 'Tarjeta de Crédito', isRecurring: true },

    // Agosto 2026 (Total: $3,337.00 -> Septiembre es -4.1% vs mes anterior)
    { id: 'exp-2026-08-1', date: '2026-08-02', category: 'Vivienda', description: 'Alquiler', amount: 1200, paymentMethod: 'Transferencia', isRecurring: true },
    { id: 'exp-2026-08-2', date: '2026-08-05', category: 'Alimentación', description: 'Supermercado', amount: 710, paymentMethod: 'Tarjeta de Débito', isRecurring: false },
    { id: 'exp-2026-08-3', date: '2026-08-08', category: 'Servicios', description: 'Servicios Públicos', amount: 290, paymentMethod: 'Débito Automático', isRecurring: true },
    { id: 'exp-2026-08-4', date: '2026-08-12', category: 'Transporte', description: 'Combustible', amount: 350, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },
    { id: 'exp-2026-08-5', date: '2026-08-18', category: 'Entretenimiento', description: 'Salidas y Cine', amount: 310, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },
    { id: 'exp-2026-08-6', date: '2026-08-04', category: 'Salud', description: 'Póliza Médica', amount: 300, paymentMethod: 'Tarjeta de Crédito', isRecurring: true },
    { id: 'exp-2026-08-7', date: '2026-08-25', category: 'Otros', description: 'Artículos del hogar', amount: 177, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },

    // Julio 2026
    { id: 'exp-2026-07-1', date: '2026-07-02', category: 'Vivienda', description: 'Alquiler', amount: 1200, paymentMethod: 'Transferencia', isRecurring: true },
    { id: 'exp-2026-07-2', date: '2026-07-06', category: 'Alimentación', description: 'Supermercado', amount: 680, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-07-3', date: '2026-07-10', category: 'Transporte', description: 'Transporte', amount: 330, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-07-4', date: '2026-07-14', category: 'Entretenimiento', description: 'Vacaciones Fin de Semana', amount: 750, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-07-5', date: '2026-07-04', category: 'Salud', description: 'Póliza Médica', amount: 300, paymentMethod: 'Tarjeta', isRecurring: true },

    // Junio 2026
    { id: 'exp-2026-06-02', date: '2026-06-02', category: 'Vivienda', description: 'Alquiler', amount: 1200, paymentMethod: 'Transferencia', isRecurring: true },
    { id: 'exp-2026-06-05', date: '2026-06-05', category: 'Alimentación', description: 'Supermercado', amount: 640, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-06-10', date: '2026-06-10', category: 'Transporte', description: 'Transporte', amount: 310, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-06-15', date: '2026-06-15', category: 'Servicios', description: 'Servicios', amount: 275, paymentMethod: 'Débito', isRecurring: true },
    { id: 'exp-2026-06-04', date: '2026-06-04', category: 'Salud', description: 'Póliza Médica', amount: 300, paymentMethod: 'Tarjeta', isRecurring: true },

    // Mayo 2026
    { id: 'exp-2026-05-02', date: '2026-05-02', category: 'Vivienda', description: 'Alquiler', amount: 1200, paymentMethod: 'Transferencia', isRecurring: true },
    { id: 'exp-2026-05-07', date: '2026-05-07', category: 'Alimentación', description: 'Supermercado', amount: 620, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-05-12', date: '2026-05-12', category: 'Transporte', description: 'Transporte', amount: 300, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-05-04', date: '2026-05-04', category: 'Salud', description: 'Póliza Médica', amount: 300, paymentMethod: 'Tarjeta', isRecurring: true },

    // Abril 2026
    { id: 'exp-2026-04-02', date: '2026-04-02', category: 'Vivienda', description: 'Alquiler', amount: 1200, paymentMethod: 'Transferencia', isRecurring: true },
    { id: 'exp-2026-04-06', date: '2026-04-06', category: 'Alimentación', description: 'Supermercado', amount: 630, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-04-10', date: '2026-04-10', category: 'Transporte', description: 'Transporte', amount: 290, paymentMethod: 'Tarjeta', isRecurring: false }
  ],

  budgets: [
    { id: 'bg-1', category: 'Vivienda', allocated: 1300, notes: 'Alquiler y mantenimiento residencial' },
    { id: 'bg-2', category: 'Alimentación', allocated: 800, notes: 'Supermercado y comida en casa' },
    { id: 'bg-3', category: 'Transporte', allocated: 400, notes: 'Gasolina, peajes y mantenimiento' },
    { id: 'bg-4', category: 'Servicios', allocated: 350, notes: 'Luz, agua, internet, telefonía' },
    { id: 'bg-5', category: 'Salud', allocated: 350, notes: 'Seguro médico y bienestar físico' },
    { id: 'bg-6', category: 'Entretenimiento', allocated: 400, notes: 'Cenas recreativas y ocio' },
    { id: 'bg-7', category: 'Educación', allocated: 250, notes: 'Cursos, libros y desarrollo profesional' }
  ],

  goals: [
    { id: 'goal-1', title: 'Fondo de Emergencia (6 Meses)', targetAmount: 19200, currentAmount: 14500, deadline: '2026-12-31', category: 'Seguridad Financiera', priority: 'Alta' },
    { id: 'goal-2', title: 'Portafolio de Inversión ETFs S&P500', targetAmount: 25000, currentAmount: 12250, deadline: '2027-06-30', category: 'Inversión y Patrimonio', priority: 'Media' },
    { id: 'goal-3', title: 'Enganche Apartamento Propio', targetAmount: 45000, currentAmount: 18000, deadline: '2028-12-31', category: 'Bienes Raíces', priority: 'Alta' },
    { id: 'goal-4', title: 'Vacaciones Tour Europa / Japón', targetAmount: 4500, currentAmount: 3800, deadline: '2027-03-31', category: 'Recreación y Viajes', priority: 'Baja' }
  ]
};

class Store {
  constructor() {
    this.subscribers = new Set();
    this.state = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Mezclar con valores predeterminados para asegurar estructura intacta
        return {
          ...DEFAULT_STATE,
          ...parsed,
          incomes: parsed.incomes || DEFAULT_STATE.incomes,
          expenses: parsed.expenses || DEFAULT_STATE.expenses,
          budgets: parsed.budgets || DEFAULT_STATE.budgets,
          goals: parsed.goals || DEFAULT_STATE.goals
        };
      }
    } catch (e) {
      console.warn('Error al leer de localStorage, usando datos predeterminados:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.saveToStorage();
    this.notify();
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  notify() {
    this.subscribers.forEach(listener => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error en suscriptor del Store:', err);
      }
    });
  }

  // Operaciones de Configuración
  setCurrency(currency) {
    this.setState({ currency });
  }

  setPeriod(period) {
    this.setState({ period });
  }

  setReferenceMonth(referenceMonth) {
    this.setState({ referenceMonth });
  }

  // CRUD Ingresos
  addIncome(income) {
    const newItem = {
      id: 'inc-' + Date.now(),
      ...income,
      amount: Number(income.amount) || 0
    };
    this.setState({ incomes: [newItem, ...this.state.incomes] });
    return newItem;
  }

  updateIncome(id, updatedFields) {
    const incomes = this.state.incomes.map(item =>
      item.id === id ? { ...item, ...updatedFields, amount: Number(updatedFields.amount !== undefined ? updatedFields.amount : item.amount) } : item
    );
    this.setState({ incomes });
  }

  deleteIncome(id) {
    const incomes = this.state.incomes.filter(item => item.id !== id);
    this.setState({ incomes });
  }

  // CRUD Gastos
  addExpense(expense) {
    const newItem = {
      id: 'exp-' + Date.now(),
      ...expense,
      amount: Number(expense.amount) || 0
    };
    this.setState({ expenses: [newItem, ...this.state.expenses] });
    return newItem;
  }

  updateExpense(id, updatedFields) {
    const expenses = this.state.expenses.map(item =>
      item.id === id ? { ...item, ...updatedFields, amount: Number(updatedFields.amount !== undefined ? updatedFields.amount : item.amount) } : item
    );
    this.setState({ expenses });
  }

  deleteExpense(id) {
    const expenses = this.state.expenses.filter(item => item.id !== id);
    this.setState({ expenses });
  }

  // CRUD Presupuestos
  addBudget(budget) {
    const newItem = {
      id: 'bg-' + Date.now(),
      ...budget,
      allocated: Number(budget.allocated) || 0
    };
    this.setState({ budgets: [...this.state.budgets, newItem] });
    return newItem;
  }

  updateBudget(id, updatedFields) {
    const budgets = this.state.budgets.map(b =>
      b.id === id ? { ...b, ...updatedFields, allocated: Number(updatedFields.allocated !== undefined ? updatedFields.allocated : b.allocated) } : b
    );
    this.setState({ budgets });
  }

  deleteBudget(id) {
    const budgets = this.state.budgets.filter(b => b.id !== id);
    this.setState({ budgets });
  }

  // CRUD Metas
  addGoal(goal) {
    const newItem = {
      id: 'goal-' + Date.now(),
      ...goal,
      targetAmount: Number(goal.targetAmount) || 0,
      currentAmount: Number(goal.currentAmount) || 0
    };
    this.setState({ goals: [...this.state.goals, newItem] });
    return newItem;
  }

  updateGoal(id, updatedFields) {
    const goals = this.state.goals.map(g =>
      g.id === id ? {
        ...g,
        ...updatedFields,
        targetAmount: Number(updatedFields.targetAmount !== undefined ? updatedFields.targetAmount : g.targetAmount),
        currentAmount: Number(updatedFields.currentAmount !== undefined ? updatedFields.currentAmount : g.currentAmount)
      } : g
    );
    this.setState({ goals });
  }

  deleteGoal(id) {
    const goals = this.state.goals.filter(g => g.id !== id);
    this.setState({ goals });
  }

  contributeToGoal(id, amount) {
    const num = Number(amount) || 0;
    const goals = this.state.goals.map(g =>
      g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + num) } : g
    );
    this.setState({ goals });
  }

  // Restaurar y Reset
  resetToDefaults() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveToStorage();
    this.notify();
  }

  importData(importedState) {
    if (!importedState || typeof importedState !== 'object') throw new Error('Estructura de datos inválida');
    this.state = {
      ...DEFAULT_STATE,
      ...importedState,
      incomes: Array.isArray(importedState.incomes) ? importedState.incomes : DEFAULT_STATE.incomes,
      expenses: Array.isArray(importedState.expenses) ? importedState.expenses : DEFAULT_STATE.expenses,
      budgets: Array.isArray(importedState.budgets) ? importedState.budgets : DEFAULT_STATE.budgets,
      goals: Array.isArray(importedState.goals) ? importedState.goals : DEFAULT_STATE.goals
    };
    this.saveToStorage();
    this.notify();
  }
}

export const store = new Store();
