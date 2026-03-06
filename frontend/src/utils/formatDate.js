import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString, pattern = 'dd MMM yyyy') => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, pattern) : dateString;
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  return formatDate(dateString, 'dd MMM yyyy, HH:mm');
};

export const formatMonthYear = (yearMonth) => {
  if (!yearMonth) return '';
  try {
    const date = parseISO(`${yearMonth}-01`);
    return isValid(date) ? format(date, 'MMMM yyyy') : yearMonth;
  } catch {
    return yearMonth;
  }
};

export const getCurrentYearMonth = () => {
  return format(new Date(), 'yyyy-MM');
};

export const getMonthOptions = (count = 12) => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    });
  }
  return options;
};
