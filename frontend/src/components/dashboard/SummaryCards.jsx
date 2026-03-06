import { formatCurrency } from '../../utils/formatCurrency';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
    <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
    <div className="h-8 w-32 bg-gray-200 rounded" />
  </div>
);

const StatCard = ({ label, value, icon, iconBg, iconColor, prefix = '' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {prefix}{value}
        </p>
      </div>
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
    </div>
  </div>
);

const SummaryCards = ({ data, totalTransactions, loading, currency = 'EUR' }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(data.income || 0, currency),
      icon: 'M7 11l5-5m0 0l5 5m-5-5v12',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(data.expenses || 0, currency),
      icon: 'M17 13l-5 5m0 0l-5-5m5 5V6',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      label: 'Net Savings',
      value: formatCurrency(data.net || 0, currency),
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Transactions',
      value: totalTransactions || 0,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
};

export default SummaryCards;
