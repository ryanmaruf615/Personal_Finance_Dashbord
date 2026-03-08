import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const CsvUploader = ({ file, onFileSelect, disabled = false }) => {
  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) onFileSelect(accepted[0]);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled,
  });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isDragActive ? 'border-blue-500 bg-blue-50' : file ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
      `}
    >
      <input {...getInputProps()} />

      {file ? (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500 mt-1">{formatSize(file.size)}</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
            className="text-xs text-red-500 hover:text-red-700 mt-2 underline"
          >
            Remove file
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
          </p>
          <p className="text-xs text-gray-400 mt-1">or click to browse · .csv files only</p>
        </div>
      )}
    </div>
  );
};

export default CsvUploader;
