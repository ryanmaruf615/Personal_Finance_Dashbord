const Select = ({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        {...props}
        className={`
          w-full px-3 py-2.5 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors appearance-none bg-white
          bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M3%204.5l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')]
          bg-no-repeat bg-[right_12px_center]
          ${error ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-gray-300'}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
