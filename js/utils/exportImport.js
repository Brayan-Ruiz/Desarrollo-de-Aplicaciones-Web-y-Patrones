/**
 * Antigravity Finance - Export and Import Utilities
 * Respaldo completo en JSON y exportación a formato CSV compatible con Excel.
 */

/**
 * Exporta un objeto a un archivo JSON y lo descarga en el navegador.
 * @param {object} data
 * @param {string} filename
 */
export function exportToJSON(data, filename = `antigravity_finance_backup_${new Date().toISOString().split('T')[0]}.json`) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Lee un archivo JSON cargado por el usuario y retorna el objeto parsed.
 * @param {File} file
 * @returns {Promise<object>}
 */
export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No se seleccionó ningún archivo'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        resolve(parsed);
      } catch (err) {
        reject(new Error('El archivo no contiene un formato JSON válido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}

/**
 * Convierte un arreglo de transacciones a formato CSV y lo descarga.
 * @param {Array} items
 * @param {string} filename
 */
export function exportTransactionsToCSV(items, filename = `transacciones_${new Date().toISOString().split('T')[0]}.csv`) {
  if (!items || !items.length) {
    alert('No hay datos disponibles para exportar a CSV');
    return;
  }

  const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Método / Fuente', 'Recurrente'];
  const rows = items.map(t => [
    `"${t.id || ''}"`,
    `"${t.date || ''}"`,
    `"${t.type === 'income' ? 'Ingreso' : 'Gasto'}"`,
    `"${t.category || ''}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    Number(t.amount || 0).toFixed(2),
    `"${t.source || t.paymentMethod || ''}"`,
    t.isRecurring ? 'Sí' : 'No'
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Utilidad privada para disparar la descarga de un Blob en el navegador.
 * @param {Blob} blob
 * @param {string} filename
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
