# 📊 Antigravity Finance — Personal Finance OS

Aplicación Web Completa de Finanzas Personales con diseño premium de grado **Fintech / SaaS**, interactiva, modular y lista para ser alojada de forma **100% gratuita en Cloudflare Pages / Workers**.

---

## 🎨 1. Identidad Visual y Diseño Estético (UX/UI)

El diseño está construido bajo principios de software financiero institucional: minimalista, tipografía de alta legibilidad (*Plus Jakarta Sans* y números tabulares en *JetBrains Mono*), micro-interacciones suaves y una paleta estricta de 5 colores:

- **Azul Navy (`#1E293B` / `#0F172A`):** Títulos, navegación principal, encabezados congelados de tablas y acentos institucionales.
- **Verde Esmeralda (`#10B981` / `#065F46`):** Ingresos, ahorro, flujo neto favorable, escenario optimista y semáforo saludable.
- **Rojo Suave (`#EF4444` / `#991B1B`):** Gastos, déficit, pérdidas, presupuestos sobrepasados y alertas críticas.
- **Amarillo / Ámbar (`#F59E0B`):** Advertencias preventivas y presupuestos entre el 75% y 99% de consumo.
- **Slate Claro (`#F8FAFC` / `#E2E8F0`):** Fondo de tarjetas, bordes sutiles de `1px` y filas alternadas en tablas.
- **Blanco Puro (`#FFFFFF`):** Fondo principal y tarjetas de métricas calculadas.

### 📝 Diferenciación Visual de Campos en Tablas
- **Campos de Entrada Manual:** Resaltados sutilmente con fondo azul claro suave (`#EFF6FF`) y borde azul claro.
- **Campos Calculados (Fórmulas):** Fondo blanco puro (`#FFFFFF`) con tipografía bold/black.
- **Resultados Positivos:** Badges y tipografía en Verde Esmeralda.
- **Alertas / Déficit:** Badges y tipografía en Rojo Suave.

---

## 📱 2. Módulos y Navegación

La barra superior y la navegación fija permiten alternar instantáneamente entre las 7 vistas principales:

1. **📊 Dashboard (Vista Principal):**
   - Encabezado con selector de período (Mes Actual - Septiembre 2026, Últimos 3 Meses, Año en Curso, Todo el Histórico).
   - Selector de Divisa reactivo en tiempo real: **USD ($)**, **EUR (€)**, **CRC (₡)**, **MXN ($)**, **GBP (£)**, **COP ($)**.
   - Badge dinámico de Salud Financiera: 🟢 Saludable | 🟡 Atención | 🔴 Crítica.
   - **4 Tarjetas KPI:** Ingresos Totales (`$8,450.00` | `↑ 12.4%`), Gastos Totales (`$3,200.00` | `↓ 4.1%`), Tasa de Ahorro (`62.1%` | `↑ 2.5%`), Balance Neto (`$5,250.00` | `↑ 18.0%`).
   - **Gráfico de Evolución:** Área y líneas suaves comparando Ingresos vs. Gastos mes a mes.
   - **Distribución de Gastos:** Dona minimalista recortada al 72% con colores corporativos.
   - **Proyecciones Patrimoniales:** Histórico sólido + 3 escenarios proyectados a 12 meses en líneas punteadas.
   - **Semáforo de Presupuestos y Metas:** Alertas rápidas de consumo.

2. **💵 Ingresos:**
   - Tabla profesional con encabezado congelado Navy (`sticky top-0`).
   - Diferenciación de entrada manual `#EFF6FF` vs calculados.
   - Búsqueda en tiempo real, filtro por categoría, selector de recurrencia y exportación a CSV.

3. **💸 Gastos:**
   - Tabla de egresos por categoría y método de pago (Tarjeta de Crédito, Débito, Transferencia, etc.).
   - Clasificación entre gasto fijo o variable.
   - Búsqueda, filtros dinámicos, edición y exportación a CSV.

4. **🎯 Presupuesto:**
   - Auditoría de consumo por categoría de gasto.
   - Barras de progreso con semáforo dinámico (🟢 <75%, 🟡 75%-99%, 🔴 >=100%).
   - Cálculo automático de margen restante o déficit.

5. **🔄 Flujo de Caja:**
   - Matriz mensual de liquidez (Ingresos Operativos - Gastos Operativos = Flujo Libre).
   - Tasa de ahorro mensual, balance acumulado continuo y cálculo de meses de colchón de supervivencia (*Runway*).

6. **📈 Proyecciones:**
   - Modelado predictivo a 6, 12 y 24 meses.
   - 3 Escenarios cuantitativos:
     - 🟢 **Optimista:** +10% ingresos, -5% gastos fijos, 7% retorno anual.
     - 🔵 **Esperado (Caso Base):** Media histórica, inflación 3.5%, retorno 4%.
     - 🔘 **Conservador:** -5% ingresos por imprevistos, +10% inflación/gastos.

7. **🏆 Metas:**
   - Planificación de propósitos financieros con barra de avance porcentual.
   - Estimación matemática de meses restantes para completarse al ritmo de ahorro actual.
   - Botón directo de "+ Aportar Capital".

---

## 🌐 3. Guía de Despliegue Gratuito en Cloudflare Pages

Esta aplicación está optimizada con **cero sobrecarga de compilación**, lo que garantiza una velocidad instantánea de carga y compatibilidad nativa con el plan gratuito de Cloudflare.

### Método 1: Arrastrar y Soltar (Direct Upload - En 30 segundos)
1. Inicia sesión en [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Dirígete a **Workers & Pages** > **Create application** > **Pages** > **Upload assets**.
3. Asigna un nombre a tu proyecto (ej. `antigravity-finance`).
4. Arrastra la carpeta de este proyecto (`Paginas de Pruebas`) al recuadro de carga.
5. Haz clic en **Deploy site**. ¡Tu sitio estará en vivo inmediatamente en una URL `*.pages.dev` gratuita con SSL automático!

### Método 2: Conexión Automática con Git (GitHub / GitLab)
1. Sube este código a un repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Antigravity Finance Dashboard"
   git branch -M main
   git remote add origin <URL_DE_TU_REPOSITORIO>
   git push -u origin main
   ```
2. En Cloudflare Dashboard, ve a **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Selecciona tu repositorio.
4. En **Build settings**:
   - Framework preset: `None`
   - Build command: *(dejar vacío)*
   - Build output directory: `.`
5. Haz clic en **Save and Deploy**. A partir de ese momento, cada commit desplegará automáticamente los cambios.

### Método 3: Mediante Cloudflare Wrangler CLI
```bash
npx wrangler pages deploy . --project-name=antigravity-finance
```

---

## 🔒 4. Privacidad y Persistencia de Datos

- **100% Privado y Local:** Todos tus datos se almacenan en el `localStorage` de tu navegador; ninguna transacción personal sale a servidores de terceros de manera forzada.
- **Copia de Seguridad y Restauración:** Mediante el icono de engranaje en la barra superior puedes exportar un respaldo completo en formato **JSON** e importarlo en cualquier momento o dispositivo.
- **Exportación Contable:** Las tablas de Ingresos y Gastos cuentan con exportación nativa a **CSV** compatible con Microsoft Excel y Google Sheets.
- **Edge API Function:** Incluye `/functions/api/sync.js` preconfigurado en caso de que desees conectar Cloudflare KV o D1 como backend distribuido sin coste.
