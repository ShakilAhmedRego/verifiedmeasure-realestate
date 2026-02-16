export function maskEmail(email?: string): string {
  if (!email) return '•••@•••.com';
  const [user, domain] = email.split('@');
  if (!user || !domain) return '•••@•••.com';
  return `${user.substring(0, 2)}•••@${domain}`;
}

export function maskPhone(phone?: string): string {
  if (!phone) return '(•••) •••-••••';
  return `(•••) •••-${phone.slice(-4)}`;
}

export function maskCompany(company: string): string {
  if (company.length <= 3) return '•••';
  return `${company.substring(0, 3)}${'•'.repeat(Math.min(company.length - 3, 10))}`;
}

export function formatCurrency(value?: number): string {
  if (!value) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value?: number): string {
  if (!value) return '0';
  return new Intl.NumberFormat('en-US').format(value);
}
