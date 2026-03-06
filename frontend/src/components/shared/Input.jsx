const Input = ({
  label,
  error,
  icon,
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
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            w-full px-3 py-2.5 border rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            placeholder-gray-400 transition-colors
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
          `}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
