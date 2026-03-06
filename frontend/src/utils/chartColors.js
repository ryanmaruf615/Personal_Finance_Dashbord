export const CHART_COLORS = [
  '#4F46E5', // indigo
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo-light
  '#14B8A6', // teal
  '#E11D48', // rose
];

export const getChartColor = (index) => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

export const INCOME_COLOR = '#10B981';
export const EXPENSE_COLOR = '#EF4444';
export const NET_COLOR = '#3B82F6';
export const BUDGET_COLOR = '#F59E0B';
export const OVER_BUDGET_COLOR = '#EF4444';
