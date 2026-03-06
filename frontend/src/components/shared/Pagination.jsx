const Pagination = ({ page, totalPages, totalElements, size, onPageChange }) => {
  if (totalPages <= 1) return null;

  const start = page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between py-3">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{start}</span> to{' '}
        <span className="font-medium">{end}</span> of{' '}
        <span className="font-medium">{totalElements}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              p === page
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
