export function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString('es-CO', { timeZone: 'UTC' }) + ' UTC' : '—';
}

export const STATUS_LABEL = { open: 'Abierto', overdue: 'Vencido', closed: 'Cerrado' };
