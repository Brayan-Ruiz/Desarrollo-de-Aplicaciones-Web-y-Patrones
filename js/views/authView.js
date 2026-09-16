/**
 * Finanzas Bombetas - Auth View
 * Pantalla de inicio de sesión y registro de usuarios con bóvedas cifradas de extremo a extremo.
 */

import { store } from '../state.js';

export function renderAuthView(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div class="max-w-md w-full space-y-6">
        
        <!-- Logo y Encabezado de la Plataforma -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-emerald-400 border border-slate-700 shadow-md text-2xl mb-1">
            🧨
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Finanzas <span class="text-emerald-600">Bombetas</span>
          </h1>
          <p class="text-xs text-slate-500 font-medium">
            Bóveda Financiera Personal con Cifrado Militar AES-256
          </p>

          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-2">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <span>Privacidad Total de Extremo a Extremo</span>
          </div>
        </div>

        <!-- Tarjeta Principal de Autenticación -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          
          <!-- Botón de Acceso Rápido Demo -->
          <div class="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="text-left">
              <div class="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>⚡</span> Acceso Rápido de Prueba
              </div>
              <div class="text-[11px] text-slate-500">Explora la plataforma con los datos de demostración de Septiembre 2026.</div>
            </div>
            <button id="btn-login-demo" class="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer">
              Entrar con Demo
            </button>
          </div>

          <div class="relative flex items-center justify-center">
            <div class="border-t border-slate-200 w-full"></div>
            <span class="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">o tu bóveda personal</span>
          </div>

          <!-- Selector de Pestañas: Iniciar Sesión / Crear Cuenta -->
          <div class="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button id="tab-login" class="py-2 text-xs font-bold rounded-lg transition-all bg-white text-slate-900 shadow-xs cursor-pointer">
              Iniciar Sesión
            </button>
            <button id="tab-register" class="py-2 text-xs font-bold rounded-lg transition-all text-slate-500 hover:text-slate-900 cursor-pointer">
              Crear Cuenta
            </button>
          </div>

          <!-- Mensajes de Alerta / Error -->
          <div id="auth-alert" class="hidden p-3 rounded-lg text-xs font-medium border"></div>

          <!-- Formulario: Iniciar Sesión -->
          <form id="form-login" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico / Usuario</label>
              <input 
                type="email" 
                id="login-email" 
                required 
                placeholder="tu@correo.com" 
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Contraseña Maestra de tu Bóveda</label>
              <input 
                type="password" 
                id="login-password" 
                required 
                placeholder="••••••••" 
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 transition-colors"
              />
              <p class="text-[10px] text-slate-400 mt-1">Tu contraseña se usa localmente para descifrar tus finanzas con AES-256.</p>
            </div>

            <button type="submit" id="btn-submit-login" class="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
              <span>Desbloquear Bóveda</span>
            </button>
          </form>

          <!-- Formulario: Registro de Cuenta -->
          <form id="form-register" class="space-y-3.5 hidden">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Tu Nombre Completo</label>
              <input 
                type="text" 
                id="reg-name" 
                required 
                placeholder="ej. Brayan Ruiz" 
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                id="reg-email" 
                required 
                placeholder="tu@correo.com" 
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Contraseña Maestra (Mínimo 6 caracteres)</label>
              <input 
                type="password" 
                id="reg-password" 
                required 
                minlength="6"
                placeholder="••••••••" 
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Confirmar Contraseña</label>
              <input 
                type="password" 
                id="reg-confirm-password" 
                required 
                minlength="6"
                placeholder="••••••••" 
                class="w-full px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
              />
            </div>

            <button type="submit" id="btn-submit-reg" class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2">
              <span>Crear Bóveda Encriptada</span>
            </button>
          </form>

        </div>

        <!-- Garantía de Seguridad y Privacidad -->
        <div class="p-3.5 rounded-xl border border-slate-200 bg-white/70 text-[11px] text-slate-500 space-y-1">
          <div class="font-bold text-slate-700 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            ¿Cómo protegemos tus datos?
          </div>
          <p>
            Tus datos financieros se cifran directamente en tu navegador usando tu contraseña como clave. Nada viaja en texto plano y nadie sin tu contraseña puede descifrar tu información.
          </p>
        </div>

      </div>
    </div>
  `;

  // Controladores de interfaz y eventos
  const tabLogin = container.querySelector('#tab-login');
  const tabRegister = container.querySelector('#tab-register');
  const formLogin = container.querySelector('#form-login');
  const formRegister = container.querySelector('#form-register');
  const alertBox = container.querySelector('#auth-alert');
  const demoBtn = container.querySelector('#btn-login-demo');

  const showAlert = (message, type = 'error') => {
    alertBox.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'border-red-200', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
    if (type === 'error') {
      alertBox.classList.add('bg-red-50', 'text-red-700', 'border-red-200');
    } else {
      alertBox.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
    }
    alertBox.textContent = message;
  };

  const switchTab = (mode) => {
    alertBox.classList.add('hidden');
    if (mode === 'login') {
      tabLogin.className = 'py-2 text-xs font-bold rounded-lg transition-all bg-white text-slate-900 shadow-xs cursor-pointer';
      tabRegister.className = 'py-2 text-xs font-bold rounded-lg transition-all text-slate-500 hover:text-slate-900 cursor-pointer';
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
    } else {
      tabRegister.className = 'py-2 text-xs font-bold rounded-lg transition-all bg-white text-slate-900 shadow-xs cursor-pointer';
      tabLogin.className = 'py-2 text-xs font-bold rounded-lg transition-all text-slate-500 hover:text-slate-900 cursor-pointer';
      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
    }
  };

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabRegister.addEventListener('click', () => switchTab('register'));

  // Acceso Demo
  demoBtn.addEventListener('click', async () => {
    demoBtn.disabled = true;
    demoBtn.textContent = 'Descifrando...';
    try {
      await store.loginDemo();
    } catch (err) {
      showAlert(err.message || 'Error al entrar en modo demo');
      demoBtn.disabled = false;
      demoBtn.textContent = 'Entrar con Demo';
    }
  });

  // Envío Formulario Login
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = container.querySelector('#login-email').value.trim();
    const password = container.querySelector('#login-password').value;
    const btn = container.querySelector('#btn-submit-login');

    btn.disabled = true;
    btn.innerHTML = 'Descifrando Bóveda...';

    try {
      await store.login(email, password);
    } catch (err) {
      showAlert(err.message || 'Credenciales incorrectas o error al descifrar.');
      btn.disabled = false;
      btn.innerHTML = `
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
        <span>Desbloquear Bóveda</span>
      `;
    }
  });

  // Envío Formulario Registro
  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = container.querySelector('#reg-name').value.trim();
    const email = container.querySelector('#reg-email').value.trim();
    const password = container.querySelector('#reg-password').value;
    const confirmPass = container.querySelector('#reg-confirm-password').value;
    const btn = container.querySelector('#btn-submit-reg');

    if (password !== confirmPass) {
      showAlert('Las contraseñas no coinciden. Verifícalas e inténtalo de nuevo.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Generando Claves y Cifrando...';

    try {
      await store.register(name, email, password);
    } catch (err) {
      showAlert(err.message || 'Error al registrar la cuenta.');
      btn.disabled = false;
      btn.textContent = 'Crear Bóveda Encriptada';
    }
  });
}
