const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className={`${sizeMap[size]} rounded-full border-gray-300 border-t-blue-600 animate-spin`} />
  </div>
);

export default LoadingSpinner;
