# 🧨 Finanzas Bombetas — Personal Finance OS & Encrypted Vault

Aplicación Web Completa de Finanzas Personales con diseño premium de grado **Fintech / SaaS**, arquitectura multiusuario y **bóvedas con cifrado militar de extremo a extremo (AES-GCM de 256 bits y PBKDF2)**. 

Optimizada para ser alojada de forma **100% gratuita en GitHub Pages y Cloudflare Pages**.

---

## 🔐 1. Seguridad, Privacidad y Cifrado Zero-Knowledge

La plataforma garantiza que los datos financieros de cada persona permanezcan estrictamente privados e inaccesibles para terceros:

1. **Cifrado Militar AES-GCM (256 bits):**
   - Todos los ingresos, egresos, metas de ahorro, presupuestos y notas se cifran localmente en el navegador antes de guardarse en el almacenamiento persistente (`localStorage`).
   - El almacenamiento solo contiene un bloque binario cifrado (*ciphertext* + *IV* único por guardado).
2. **Derivación Robusta de Claves (PBKDF2):**
   - A partir de la contraseña maestra del usuario y una sal criptográfica aleatoria única (`crypto.getRandomValues`), se derivan las claves simétricas mediante 100,000 iteraciones con SHA-256.
   - Las claves maestras existen **únicamente en la memoria volátil** mientras la sesión esté activa; nunca se almacenan en disco.
3. **Aislamiento Multiusuario:**
   - Múltiples usuarios pueden registrarse en el mismo dispositivo o navegador. Cada cuenta mantiene su propia bóveda cifrada e independiente.
4. **Acceso Demo con 1 Clic:**
   - Para evaluar la aplicación sin registrarse, la pantalla de inicio incluye el botón **"⚡ Entrar con Demo"** (precargada con los datos de Septiembre 2026).
   - Credenciales Demo: `demo@bombetas.com` / `Bombetas2026!`

---

## 🎨 2. Identidad Visual y Diseño Estético (UX/UI)

Diseño inspirado en plataformas fintech institucionales:
- **Azul Navy (`#1E293B` / `#0F172A`):** Títulos, navegación superior, encabezados congelados de tablas y acentos institucionales.
- **Verde Esmeralda (`#10B981` / `#065F46`):** Ingresos, ahorro, flujo neto favorable, escenario optimista y semáforo saludable.
- **Rojo Suave (`#EF4444` / `#991B1B`):** Gastos, déficit, pérdidas, presupuestos sobrepasados y alertas críticas.
- **Amarillo / Ámbar (`#F59E0B`):** Advertencias preventivas y presupuestos entre el 75% y 99% de consumo.
- **Slate Claro (`#F8FAFC` / `#E2E8F0`):** Fondo de tarjetas, bordes sutiles de `1px` y filas alternadas en tablas.
- **Blanco Puro (`#FFFFFF`):** Fondo principal y tarjetas de métricas calculadas.

### 📝 Diferenciación Visual de Campos en Tablas
- **Campos de Entrada Manual:** Resaltados sutilmente con fondo azul claro suave (`#EFF6FF`).
- **Campos Calculados (Fórmulas):** Fondo blanco puro (`#FFFFFF`) con tipografía destacada.

---

## 📱 3. Módulos y Navegación

1. **🔐 Pantalla de Inicio y Autenticación:**
   - Iniciar sesión en bóvedas existentes o crear una nueva bóveda encriptada.
   - Acceso con un clic a la cuenta de prueba de Septiembre 2026.
2. **📊 Dashboard:**
   - Selector de período y selector de divisas en tiempo real (**USD `$`, EUR `€`, CRC `₡`, MXN `$`, GBP `£`, COP `$`**).
   - Diagnóstico de salud financiera (🟢 Saludable | 🟡 Atención | 🔴 Crítica).
   - 4 Tarjetas KPI con comparativa vs período anterior.
   - Gráfico de Evolución (Ingresos vs Gastos en área suave) y Dona de distribución de egresos con Chart.js.
   - Proyecciones a 12 meses: Línea sólida histórica + líneas punteadas para 3 escenarios (🟢 Optimista, 🔵 Esperado, 🔘 Conservador).
3. **💵 Ingresos:** Tabla con encabezado fijo, campos manuales `#EFF6FF`, filtros y exportación CSV.
4. **💸 Gastos:** Clasificación fija vs variable, control de métodos de pago y filtros.
5. **🎯 Presupuesto:** Semáforo de consumo (🟢 <75%, 🟡 75%-99%, 🔴 >=100%) y margen restante.
6. **🔄 Flujo de Caja:** Matriz de liquidez mensual y cálculo de meses de colchón (*Runway*).
7. **📈 Proyecciones:** Simulador interactivo con horizontes de 6, 12 y 24 meses.
8. **🏆 Metas:** Seguimiento de objetivos de ahorro y estimación de tiempo de cumplimiento.

---

## 🌐 4. Despliegue en GitHub Pages y Cloudflare Pages

### Link Público en GitHub Pages:
👉 **[https://brayan-ruiz.github.io/Desarrollo-de-Aplicaciones-Web-y-Patrones/](https://brayan-ruiz.github.io/Desarrollo-de-Aplicaciones-Web-y-Patrones/)**

### Despliegue en Cloudflare Pages:
1. Conecta el repositorio de GitHub o arrastra la carpeta en [dash.cloudflare.com](https://dash.cloudflare.com/) > **Workers & Pages** > **Upload assets**.
2. Al estar construido en HTML/JS/CSS modular sin dependencias pesadas, se despliega en segundos.
