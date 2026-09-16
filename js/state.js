/**
 * Finanzas Bombetas - Reactive State Store con Bóvedas Cifradas
 * Aislamiento multiusuario y cifrado simétrico AES-GCM (Zero-Knowledge) de 256 bits.
 */

import { generateSalt, deriveKey, hashPassword, encryptVault, decryptVault } from './crypto.js';

const USERS_STORAGE_KEY = 'finanzas_bombetas_users_v1';
const SESSION_STORAGE_KEY = 'finanzas_bombetas_session_v1';

// Conjunto de datos base de demostración (Septiembre 2026)
const DEMO_STATE = {
  currency: 'USD',
  period: 'current_month',
  referenceMonth: '2026-09',
  initialBalance: 28500,

  incomes: [
    { id: 'inc-2026-09-1', date: '2026-09-01', category: 'Salario Base', description: 'Nómina Quincenal + Base Empresa Tech', amount: 6500, source: 'Transferencia Bancaria', isRecurring: true },
    { id: 'inc-2026-09-2', date: '2026-09-12', category: 'Consultoría / Freelance', description: 'Asesoría Arquitectura Cloud Fintech', amount: 1450, source: 'Stripe / Depósito', isRecurring: false },
    { id: 'inc-2026-09-3', date: '2026-09-15', category: 'Rendimientos / Dividendos', description: 'Dividendos ETFs Globales Vanguard', amount: 500, source: 'Broker de Inversión', isRecurring: true },
    { id: 'inc-2026-08-1', date: '2026-08-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia Bancaria', isRecurring: true },
    { id: 'inc-2026-08-2', date: '2026-08-15', category: 'Consultoría / Freelance', description: 'Proyecto Web UX Audit', amount: 1018, source: 'Depósito', isRecurring: false },
    { id: 'inc-2026-07-1', date: '2026-07-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia Bancaria', isRecurring: true },
    { id: 'inc-2026-07-2', date: '2026-07-18', category: 'Consultoría / Freelance', description: 'Auditoría DevOps', amount: 1200, source: 'Transferencia', isRecurring: false },
    { id: 'inc-2026-06-01', date: '2026-06-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia', isRecurring: true },
    { id: 'inc-2026-06-15', date: '2026-06-15', category: 'Consultoría / Freelance', description: 'Sprint Fullstack', amount: 1600, source: 'Stripe', isRecurring: false },
    { id: 'inc-2026-05-01', date: '2026-05-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia', isRecurring: true },
    { id: 'inc-2026-05-20', date: '2026-05-20', category: 'Rendimientos / Dividendos', description: 'Rendimientos trimestrales', amount: 480, source: 'Broker', isRecurring: false },
    { id: 'inc-2026-04-01', date: '2026-04-01', category: 'Salario Base', description: 'Nómina Base', amount: 6500, source: 'Transferencia', isRecurring: true }
  ],

  expenses: [
    { id: 'exp-2026-09-1', date: '2026-09-02', category: 'Vivienda', description: 'Alquiler / Hipoteca Apartamento Central', amount: 1200, paymentMethod: 'Transferencia', isRecurring: true },
    { id: 'exp-2026-09-2', date: '2026-09-05', category: 'Alimentación', description: 'Supermercado Mensual Orgánico', amount: 650, paymentMethod: 'Tarjeta de Débito', isRecurring: false },
    { id: 'exp-2026-09-3', date: '2026-09-08', category: 'Servicios', description: 'Fibra Óptica 1Gbps + Electricidad', amount: 280, paymentMethod: 'Débito Automático', isRecurring: true },
    { id: 'exp-2026-09-4', date: '2026-09-10', category: 'Transporte', description: 'Gasolina y Mantenimiento Vehicular', amount: 320, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },
    { id: 'exp-2026-09-5', date: '2026-09-12', category: 'Entretenimiento', description: 'Cenas, Restaurantes y Streaming', amount: 250, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },
    { id: 'exp-2026-09-6', date: '2026-09-04', category: 'Salud', description: 'Póliza Médica y Gimnasio Premium', amount: 300, paymentMethod: 'Tarjeta de Crédito', isRecurring: true },
    { id: 'exp-2026-09-7', date: '2026-09-06', category: 'Educación', description: 'Suscripción Cursos de Arquitectura Cloud', amount: 200, paymentMethod: 'Tarjeta de Crédito', isRecurring: true },
    { id: 'exp-2026-08-1', date: '2026-08-02', category: 'Vivienda', description: 'Alquiler', amount: 1200, paymentMethod: 'Transferencia', isRecurring: true },
    { id: 'exp-2026-08-2', date: '2026-08-05', category: 'Alimentación', description: 'Supermercado', amount: 710, paymentMethod: 'Tarjeta de Débito', isRecurring: false },
    { id: 'exp-2026-08-3', date: '2026-08-08', category: 'Servicios', description: 'Servicios Públicos', amount: 290, paymentMethod: 'Débito Automático', isRecurring: true },
    { id: 'exp-2026-08-4', date: '2026-08-12', category: 'Transporte', description: 'Combustible', amount: 350, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },
    { id: 'exp-2026-08-5', date: '2026-08-18', category: 'Entretenimiento', description: 'Salidas y Cine', amount: 310, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },
    { id: 'exp-2026-08-6', date: '2026-08-04', category: 'Salud', description: 'Póliza Médica', amount: 300, paymentMethod: 'Tarjeta de Crédito', isRecurring: true },
    { id: 'exp-2026-08-7', date: '2026-08-25', category: 'Otros', description: 'Artículos del hogar', amount: 177, paymentMethod: 'Tarjeta de Crédito', isRecurring: false },
    { id: 'exp-2026-07-1', date: '2026-07-02', category: 'Vivienda', description: 'Alquiler', amount: 1200, paymentMethod: 'Transferencia', isRecurring: true },
    { id: 'exp-2026-07-2', date: '2026-07-06', category: 'Alimentación', description: 'Supermercado', amount: 680, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-07-3', date: '2026-07-10', category: 'Transporte', description: 'Transporte', amount: 330, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-07-4', date: '2026-07-14', category: 'Entretenimiento', description: 'Vacaciones Fin de Semana', amount: 750, paymentMethod: 'Tarjeta', isRecurring: false },
    { id: 'exp-2026-07-5', date: '2026-07-04', category: 'Salud', description: 'Póliza Médica', amount: 300, paymentMethod: 'Tarjeta', isRecurring: true }
  ],

  budgets: [
    { id: 'bg-1', category: 'Vivienda', allocated: 1300, notes: 'Alquiler y mantenimiento' },
    { id: 'bg-2', category: 'Alimentación', allocated: 800, notes: 'Supermercado' },
    { id: 'bg-3', category: 'Transporte', allocated: 400, notes: 'Combustible y servicios' },
    { id: 'bg-4', category: 'Servicios', allocated: 350, notes: 'Luz, agua, internet' },
    { id: 'bg-5', category: 'Salud', allocated: 350, notes: 'Seguro médico' },
    { id: 'bg-6', category: 'Entretenimiento', allocated: 400, notes: 'Cenas y salidas' },
    { id: 'bg-7', category: 'Educación', allocated: 250, notes: 'Cursos y libros' }
  ],

  goals: [
    { id: 'goal-1', title: 'Fondo de Emergencia (6 Meses)', targetAmount: 19200, currentAmount: 14500, deadline: '2026-12-31', category: 'Seguridad Financiera', priority: 'Alta' },
    { id: 'goal-2', title: 'Portafolio de Inversión ETFs S&P500', targetAmount: 25000, currentAmount: 12250, deadline: '2027-06-30', category: 'Inversión y Patrimonio', priority: 'Media' },
    { id: 'goal-3', title: 'Enganche Apartamento Propio', targetAmount: 45000, currentAmount: 18000, deadline: '2028-12-31', category: 'Bienes Raíces', priority: 'Alta' },
    { id: 'goal-4', title: 'Vacaciones Tour Europa / Japón', targetAmount: 4500, currentAmount: 3800, deadline: '2027-03-31', category: 'Recreación y Viajes', priority: 'Baja' }
  ]
};

const DEMO_EMAIL = 'demo@bombetas.com';
const DEMO_PASS = 'Bombetas2026!';

class EncryptedStore {
  constructor() {
    this.subscribers = new Set();
    this.currentUser = null;   // { email, name, salt }
    this.activeKey = null;     // CryptoKey en memoria (nunca se guarda en disco)
    this.state = null;         // Datos descifrados en memoria activa
    this.init();
  }

  async init() {
    await this.ensureDemoUserExists();
  }

  getUsersDatabase() {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Error leyendo la base de usuarios:', e);
      return {};
    }
  }

  saveUsersDatabase(users) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error guardando base de usuarios:', e);
    }
  }

  /**
   * Garantiza que exista el usuario demo con su bóveda pre-cifrada.
   */
  async ensureDemoUserExists() {
    const users = this.getUsersDatabase();
    if (!users[DEMO_EMAIL]) {
      const salt = generateSalt();
      const passHash = await hashPassword(DEMO_PASS, salt);
      const key = await deriveKey(DEMO_PASS, salt);
      const encrypted = await encryptVault(DEMO_STATE, key);

      users[DEMO_EMAIL] = {
        name: 'Usuario Demo (Septiembre 2026)',
        email: DEMO_EMAIL,
        salt: salt,
        passwordHash: passHash,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        createdAt: new Date().toISOString()
      };

      this.saveUsersDatabase(users);
    }
  }

  isAuthenticated() {
    return this.currentUser !== null && this.activeKey !== null && this.state !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getState() {
    return this.state || DEMO_STATE;
  }

  async saveToStorage() {
    if (!this.isAuthenticated()) return;

    try {
      // Cifrar el estado con la clave activa en memoria
      const encrypted = await encryptVault(this.state, this.activeKey);
      const users = this.getUsersDatabase();
      const user = users[this.currentUser.email];

      if (user) {
        user.ciphertext = encrypted.ciphertext;
        user.iv = encrypted.iv;
        user.updatedAt = new Date().toISOString();
        this.saveUsersDatabase(users);
      }
    } catch (e) {
      console.error('Error al cifrar y guardar la bóveda:', e);
    }
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  notify() {
    this.subscribers.forEach(listener => {
      try {
        listener(this.state, this.currentUser);
      } catch (err) {
        console.error('Error en suscriptor:', err);
      }
    });
  }

  // --- AUTENTICACIÓN: LOGIN, REGISTRO Y LOGOUT ---

  async login(email, password) {
    const users = this.getUsersDatabase();
    const userRecord = users[email.toLowerCase()];

    if (!userRecord) {
      throw new Error('No existe ninguna bóveda registrada con este correo electrónico.');
    }

    // Verificar hash de contraseña
    const testHash = await hashPassword(password, userRecord.salt);
    if (testHash !== userRecord.passwordHash) {
      throw new Error('Contraseña incorrecta. La bóveda permanece bloqueada.');
    }

    // Derivar la clave de descifrado y descifrar la bóveda
    const key = await deriveKey(password, userRecord.salt);
    const decryptedState = await decryptVault(userRecord.ciphertext, userRecord.iv, key);

    this.currentUser = {
      name: userRecord.name,
      email: userRecord.email,
      salt: userRecord.salt
    };
    this.activeKey = key;
    this.state = decryptedState;

    this.notify();
    return this.currentUser;
  }

  async loginDemo() {
    return await this.login(DEMO_EMAIL, DEMO_PASS);
  }

  async register(name, email, password) {
    const cleanEmail = email.toLowerCase().trim();
    const users = this.getUsersDatabase();

    if (users[cleanEmail]) {
      throw new Error('Ya existe una bóveda registrada con este correo electrónico.');
    }

    const salt = generateSalt();
    const passHash = await hashPassword(password, salt);
    const key = await deriveKey(password, salt);

    // Estado inicial limpio para el nuevo usuario
    const initialUserState = {
      currency: 'USD',
      period: 'current_month',
      referenceMonth: new Date().toISOString().substring(0, 7),
      initialBalance: 0,
      incomes: [],
      expenses: [],
      budgets: [
        { id: 'bg-1', category: 'Vivienda', allocated: 500, notes: 'Presupuesto inicial' },
        { id: 'bg-2', category: 'Alimentación', allocated: 300, notes: 'Supermercado' },
        { id: 'bg-3', category: 'Transporte', allocated: 150, notes: 'Transporte' },
        { id: 'bg-4', category: 'Servicios', allocated: 100, notes: 'Servicios' }
      ],
      goals: [
        { id: 'goal-1', title: 'Fondo de Emergencia', targetAmount: 3000, currentAmount: 0, deadline: '2026-12-31', category: 'Seguridad', priority: 'Alta' }
      ]
    };

    const encrypted = await encryptVault(initialUserState, key);

    users[cleanEmail] = {
      name: name.trim(),
      email: cleanEmail,
      salt: salt,
      passwordHash: passHash,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      createdAt: new Date().toISOString()
    };

    this.saveUsersDatabase(users);

    // Iniciar sesión inmediatamente en la nueva bóveda
    this.currentUser = { name: name.trim(), email: cleanEmail, salt: salt };
    this.activeKey = key;
    this.state = initialUserState;

    this.notify();
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    this.activeKey = null;
    this.state = null;
    this.notify();
  }

  // --- OPERACIONES FINANCIERAS (CRUD) ---

  setState(partialState) {
    if (!this.state) return;
    this.state = { ...this.state, ...partialState };
    this.saveToStorage();
    this.notify();
  }

  setCurrency(currency) {
    this.setState({ currency });
  }

  setPeriod(period) {
    this.setState({ period });
  }

  setReferenceMonth(referenceMonth) {
    this.setState({ referenceMonth });
  }

  addIncome(income) {
    const newItem = {
      id: 'inc-' + Date.now(),
      ...income,
      amount: Number(income.amount) || 0
    };
    this.setState({ incomes: [newItem, ...(this.state.incomes || [])] });
    return newItem;
  }

  updateIncome(id, updatedFields) {
    const incomes = (this.state.incomes || []).map(item =>
      item.id === id ? { ...item, ...updatedFields, amount: Number(updatedFields.amount !== undefined ? updatedFields.amount : item.amount) } : item
    );
    this.setState({ incomes });
  }

  deleteIncome(id) {
    const incomes = (this.state.incomes || []).filter(item => item.id !== id);
    this.setState({ incomes });
  }

  addExpense(expense) {
    const newItem = {
      id: 'exp-' + Date.now(),
      ...expense,
      amount: Number(expense.amount) || 0
    };
    this.setState({ expenses: [newItem, ...(this.state.expenses || [])] });
    return newItem;
  }

  updateExpense(id, updatedFields) {
    const expenses = (this.state.expenses || []).map(item =>
      item.id === id ? { ...item, ...updatedFields, amount: Number(updatedFields.amount !== undefined ? updatedFields.amount : item.amount) } : item
    );
    this.setState({ expenses });
  }

  deleteExpense(id) {
    const expenses = (this.state.expenses || []).filter(item => item.id !== id);
    this.setState({ expenses });
  }

  addBudget(budget) {
    const newItem = {
      id: 'bg-' + Date.now(),
      ...budget,
      allocated: Number(budget.allocated) || 0
    };
    this.setState({ budgets: [...(this.state.budgets || []), newItem] });
    return newItem;
  }

  updateBudget(id, updatedFields) {
    const budgets = (this.state.budgets || []).map(b =>
      b.id === id ? { ...b, ...updatedFields, allocated: Number(updatedFields.allocated !== undefined ? updatedFields.allocated : b.allocated) } : b
    );
    this.setState({ budgets });
  }

  deleteBudget(id) {
    const budgets = (this.state.budgets || []).filter(b => b.id !== id);
    this.setState({ budgets });
  }

  addGoal(goal) {
    const newItem = {
      id: 'goal-' + Date.now(),
      ...goal,
      targetAmount: Number(goal.targetAmount) || 0,
      currentAmount: Number(goal.currentAmount) || 0
    };
    this.setState({ goals: [...(this.state.goals || []), newItem] });
    return newItem;
  }

  updateGoal(id, updatedFields) {
    const goals = (this.state.goals || []).map(g =>
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
    const goals = (this.state.goals || []).filter(g => g.id !== id);
    this.setState({ goals });
  }

  contributeToGoal(id, amount) {
    const num = Number(amount) || 0;
    const goals = (this.state.goals || []).map(g =>
      g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + num) } : g
    );
    this.setState({ goals });
  }

  resetToDefaults() {
    this.setState(JSON.parse(JSON.stringify(DEMO_STATE)));
  }

  importData(importedState) {
    if (!importedState || typeof importedState !== 'object') throw new Error('Estructura de datos inválida');
    this.setState({
      ...this.state,
      ...importedState,
      incomes: Array.isArray(importedState.incomes) ? importedState.incomes : this.state.incomes,
      expenses: Array.isArray(importedState.expenses) ? importedState.expenses : this.state.expenses,
      budgets: Array.isArray(importedState.budgets) ? importedState.budgets : this.state.budgets,
      goals: Array.isArray(importedState.goals) ? importedState.goals : this.state.goals
    });
  }
}

export const store = new EncryptedStore();
