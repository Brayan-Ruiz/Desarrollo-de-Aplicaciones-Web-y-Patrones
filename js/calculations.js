/**
 * Antigravity Finance - Calculations Engine
 * Motor de cálculos financieros, métricas KPI, semáforo de salud y proyecciones.
 */

/**
 * Filtra transacciones por período seleccionado.
 * @param {Array} items Lista de transacciones
 * @param {string} period 'current_month' | 'last_3_months' | 'current_year' | 'all'
 * @param {string} referenceMonth 'YYYY-MM' (default '2026-09')
 * @returns {Array}
 */
export function filterByPeriod(items, period = 'current_month', referenceMonth = '2026-09') {
  if (!items || !items.length) return [];
  if (period === 'all') return items;

  const [refYear, refMonth] = referenceMonth.split('-').map(Number);
  const refDate = new Date(refYear, refMonth - 1, 1);

  return items.filter(item => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    const itemYear = itemDate.getFullYear();
    const itemMonth = itemDate.getMonth();

    if (period === 'current_month') {
      return itemYear === refYear && itemMonth === (refMonth - 1);
    }

    if (period === 'last_3_months') {
      // 3 meses: [refMonth - 2, refMonth - 1, refMonth]
      const diffMonths = (refYear - itemYear) * 12 + ((refMonth - 1) - itemMonth);
      return diffMonths >= 0 && diffMonths < 3;
    }

    if (period === 'current_year') {
      return itemYear === refYear;
    }

    return true;
  });
}

/**
 * Calcula los KPIs financieros y sus variaciones vs el período anterior.
 * @param {Array} incomes
 * @param {Array} expenses
 * @param {string} referenceMonth 'YYYY-MM'
 * @returns {object}
 */
export function calculateKPIs(incomes = [], expenses = [], referenceMonth = '2026-09') {
  // Período actual (Mes actual de referencia)
  const currentIncomes = filterByPeriod(incomes, 'current_month', referenceMonth);
  const currentExpenses = filterByPeriod(expenses, 'current_month', referenceMonth);

  const totalIncome = currentIncomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpenses = currentExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netFlow / totalIncome) * 100) : 0;

  // Período anterior (Mes previo)
  const [year, month] = referenceMonth.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1); // un mes antes
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  const prevIncomes = filterByPeriod(incomes, 'current_month', prevMonthStr);
  const prevExpenses = filterByPeriod(expenses, 'current_month', prevMonthStr);

  const prevTotalIncome = prevIncomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const prevTotalExpenses = prevExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const prevNetFlow = prevTotalIncome - prevTotalExpenses;
  const prevSavingsRate = prevTotalIncome > 0 ? ((prevNetFlow / prevTotalIncome) * 100) : 0;

  // Variaciones porcentuales
  const calcChange = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const incomeChange = calcChange(totalIncome, prevTotalIncome);
  const expenseChange = calcChange(totalExpenses, prevTotalExpenses);
  const savingsRateDiff = savingsRate - prevSavingsRate;
  const netFlowChange = calcChange(netFlow, prevNetFlow);

  return {
    current: {
      totalIncome,
      totalExpenses,
      netFlow,
      savingsRate
    },
    previous: {
      totalIncome: prevTotalIncome,
      totalExpenses: prevTotalExpenses,
      netFlow: prevNetFlow,
      savingsRate: prevSavingsRate
    },
    changes: {
      incomeChange,
      expenseChange,
      savingsRateDiff,
      netFlowChange
    }
  };
}

/**
 * Determina el Semáforo de Salud Financiera General.
 * @param {number} savingsRate Tasa de ahorro (%)
 * @param {number} netFlow Flujo neto
 * @param {Array} budgetStatuses Lista de presupuestos evaluados
 * @returns {object} { status: 'healthy'|'warning'|'critical', label: string, color: string, badgeBg: string, textColor: string, message: string }
 */
export function evaluateFinancialHealth(savingsRate, netFlow, budgetStatuses = []) {
  const exceededBudgets = budgetStatuses.filter(b => b.percentage >= 100).length;
  const warningBudgets = budgetStatuses.filter(b => b.percentage >= 80 && b.percentage < 100).length;

  if (netFlow < 0 || savingsRate < 0 || exceededBudgets >= 2) {
    return {
      status: 'critical',
      label: '🔴 Salud Crítica',
      color: '#EF4444',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      message: 'Tus gastos superan a tus ingresos o tienes múltiples presupuestos sobrepasados. Requiere ajuste urgente.'
    };
  }

  if (savingsRate < 20 || warningBudgets > 0 || exceededBudgets === 1) {
    return {
      status: 'warning',
      label: '🟡 Atención Requerida',
      color: '#F59E0B',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      message: 'Tu tasa de ahorro está por debajo del 20% recomendado o algunos presupuestos están al límite.'
    };
  }

  return {
    status: 'healthy',
    label: '🟢 Saludable',
    color: '#10B981',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    message: 'Excelente gestión financiera. Mantienes una tasa de ahorro saludable (>20%) y presupuestos bajo control.'
  };
}

/**
 * Evalúa los presupuestos comparando gasto real de la categoría vs presupuesto establecido.
 * @param {Array} budgets
 * @param {Array} currentExpenses
 * @returns {Array}
 */
export function evaluateBudgets(budgets = [], currentExpenses = []) {
  return budgets.map(budget => {
    const categoryExpenses = currentExpenses.filter(e => e.category === budget.category);
    const spent = categoryExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const allocated = Number(budget.allocated) || 0;
    const remaining = allocated - spent;
    const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;

    let status = 'healthy';
    let color = '#10B981'; // Emerald
    let badgeClass = 'bg-emerald-100 text-emerald-800';

    if (percentage >= 100) {
      status = 'danger';
      color = '#EF4444'; // Red
      badgeClass = 'bg-red-100 text-red-800';
    } else if (percentage >= 75) {
      status = 'warning';
      color = '#F59E0B'; // Amber
      badgeClass = 'bg-amber-100 text-amber-800';
    }

    return {
      ...budget,
      spent,
      remaining,
      percentage: Math.min(percentage, 200), // tope visual
      realPercentage: percentage,
      status,
      color,
      badgeClass
    };
  });
}

/**
 * Agrupa transacciones por mes para gráficos históricos.
 * @param {Array} incomes
 * @param {Array} expenses
 * @param {number} monthCount
 * @param {string} referenceMonth 'YYYY-MM'
 * @returns {Array<{ month: string, label: string, income: number, expense: number, net: number }>}
 */
export function getMonthlyHistory(incomes = [], expenses = [], monthCount = 6, referenceMonth = '2026-09') {
  const [refYear, refMonth] = referenceMonth.split('-').map(Number);
  const months = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(refYear, refMonth - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(d);
    months.push({ key, label, income: 0, expense: 0, net: 0 });
  }

  // Acumular ingresos
  incomes.forEach(inc => {
    if (!inc.date) return;
    const key = inc.date.substring(0, 7);
    const m = months.find(item => item.key === key);
    if (m) m.income += Number(inc.amount) || 0;
  });

  // Acumular gastos
  expenses.forEach(exp => {
    if (!exp.date) return;
    const key = exp.date.substring(0, 7);
    const m = months.find(item => item.key === key);
    if (m) m.expense += Number(exp.amount) || 0;
  });

  // Calcular balance neto
  months.forEach(m => {
    m.net = m.income - m.expense;
  });

  return months;
}

/**
 * Agrupa gastos por categoría.
 * @param {Array} expenses
 * @returns {Array<{ category: string, total: number, percentage: number }>}
 */
export function getExpensesByCategory(expenses = []) {
  const map = {};
  let grandTotal = 0;

  expenses.forEach(exp => {
    const cat = exp.category || 'Otros';
    const amt = Number(exp.amount) || 0;
    map[cat] = (map[cat] || 0) + amt;
    grandTotal += amt;
  });

  return Object.keys(map)
    .map(cat => ({
      category: cat,
      total: map[cat],
      percentage: grandTotal > 0 ? (map[cat] / grandTotal) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Genera el modelo predictivo a 6-12 meses con 3 escenarios:
 * - Histórico continuo (real)
 * - 🟢 Optimista (+10% ingresos, -5% gastos, retorno inversión 7% anual)
 * - 🔵 Esperado (promedio histórico neto con inflación moderada 3.5%)
 * - 🔘 Conservador (-5% ingresos por contingencia, +10% gastos, 2% retorno)
 * 
 * @param {Array} history Datos mensuales históricos
 * @param {number} horizonMonths Meses a proyectar (default 12)
 * @param {number} initialBalance Balance actual inicial acumulado
 * @returns {object}
 */
export function calculateProjections(history = [], horizonMonths = 12, initialBalance = 15400) {
  if (!history || history.length === 0) return { labels: [], historical: [], optimistic: [], expected: [], conservative: [] };

  // Calcular promedios mensuales reales
  const avgIncome = history.reduce((sum, h) => sum + h.income, 0) / history.length;
  const avgExpense = history.reduce((sum, h) => sum + h.expense, 0) / history.length;
  const baseMonthlyNet = avgIncome - avgExpense;

  const labels = [];
  const historicalSeries = [];
  const optimisticSeries = [];
  const expectedSeries = [];
  const conservativeSeries = [];

  // 1. Agregar puntos históricos
  let runningHistoric = initialBalance - history.reduce((s, h) => s + h.net, 0); // aproximar balance previo
  history.forEach(h => {
    runningHistoric += h.net;
    labels.push(h.label);
    historicalSeries.push(runningHistoric);
    // Para la serie histórica, los valores proyectados son null
    optimisticSeries.push(null);
    expectedSeries.push(null);
    conservativeSeries.push(null);
  });

  // El punto de anclaje de la proyección es el último punto histórico
  const lastRealBalance = historicalSeries[historicalSeries.length - 1];
  optimisticSeries[optimisticSeries.length - 1] = lastRealBalance;
  expectedSeries[expectedSeries.length - 1] = lastRealBalance;
  conservativeSeries[conservativeSeries.length - 1] = lastRealBalance;

  // 2. Generar meses proyectados
  const lastHistoryKey = history[history.length - 1].key;
  const [lastY, lastM] = lastHistoryKey.split('-').map(Number);

  let optBalance = lastRealBalance;
  let expBalance = lastRealBalance;
  let conBalance = lastRealBalance;

  for (let m = 1; m <= horizonMonths; m++) {
    const nextDate = new Date(lastY, lastM - 1 + m, 1);
    const label = new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit' }).format(nextDate);
    labels.push(label);
    historicalSeries.push(null); // el histórico ya no existe en el futuro

    // Escenario Optimista: Mayor ahorro e interés compuesto mensual (~0.6% mes)
    const optMonthlyNet = (avgIncome * 1.10) - (avgExpense * 0.95);
    optBalance = (optBalance * (1 + 0.07 / 12)) + optMonthlyNet;
    optimisticSeries.push(Math.round(optBalance));

    // Escenario Esperado: Inflación 3.5%, ahorro promedio
    const expMonthlyNet = baseMonthlyNet;
    expBalance = (expBalance * (1 + 0.04 / 12)) + expMonthlyNet;
    expectedSeries.push(Math.round(expBalance));

    // Escenario Conservador: -5% ingreso, +10% imprevistos
    const conMonthlyNet = (avgIncome * 0.95) - (avgExpense * 1.10);
    conBalance = (conBalance * (1 + 0.015 / 12)) + conMonthlyNet;
    conservativeSeries.push(Math.round(conBalance));
  }

  return {
    labels,
    historical: historicalSeries,
    optimistic: optimisticSeries,
    expected: expectedSeries,
    conservative: conservativeSeries
  };
}
