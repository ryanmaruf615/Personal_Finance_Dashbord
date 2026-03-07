import { format, addMonths, subMonths, parseISO } from 'date-fns';

const MonthSelector = ({ yearMonth, onChange }) => {
  const date = parseISO(`${yearMonth}-01`);
  const label = format(date, 'MMMM yyyy');

  const handlePrev = () => {
    const prev = subMonths(date, 1);
    onChange(format(prev, 'yyyy-MM'));
  };

  const handleNext = () => {
    const next = addMonths(date, 1);
    onChange(format(next, 'yyyy-MM'));
  };

  const isCurrentMonth = yearMonth === format(new Date(), 'yyyy-MM');

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePrev}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <span className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
        {label}
      </span>

      <button
        onClick={handleNext}
        disabled={isCurrentMonth}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default MonthSelector;
