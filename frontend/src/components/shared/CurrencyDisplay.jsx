import { formatCurrency } from '../../utils/formatCurrency';

const CurrencyDisplay = ({ amount, currency = 'EUR', type, className = '' }) => {
  const colorClass =
    type === 'INCOME'
      ? 'text-emerald-600'
      : type === 'EXPENSE'
      ? 'text-red-600'
      : 'text-gray-900';

  const prefix = type === 'INCOME' ? '+' : type === 'EXPENSE' ? '-' : '';

  return (
    <span className={`font-medium ${colorClass} ${className}`}>
      {prefix}{formatCurrency(Math.abs(amount), currency)}
    </span>
  );
};

export default CurrencyDisplay;
