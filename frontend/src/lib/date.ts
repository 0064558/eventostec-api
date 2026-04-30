export function formatEventDate(dateValue: string): string {
  const parsedDate = new Date(dateValue);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate);
}

export function formatDateOnly(dateValue: string): string {
  const parsedDate = new Date(dateValue);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
  }).format(parsedDate);
}
