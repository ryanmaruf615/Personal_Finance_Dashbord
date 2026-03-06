const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate || ''}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="text-sm text-gray-500 flex-shrink-0">to</span>
        <input
          type="date"
          value={endDate || ''}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
