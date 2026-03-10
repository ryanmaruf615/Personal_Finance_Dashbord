const Skeleton = ({ className = '', variant = 'text' }) => {
  const base = 'animate-pulse bg-gray-200 rounded';

  const variants = {
    text: `${base} h-4 w-full ${className}`,
    title: `${base} h-6 w-48 ${className}`,
    avatar: `${base} rounded-full h-10 w-10 ${className}`,
    button: `${base} h-9 w-24 rounded-lg ${className}`,
    badge: `${base} h-5 w-16 rounded-full ${className}`,
    custom: `${base} ${className}`,
  };

  return <div className={variants[variant] || variants.custom} />;
};

// ─── Preset skeleton layouts ────────────────────────────────────────

const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-5 w-32 bg-gray-200 rounded" />
      <div className="h-5 w-16 bg-gray-200 rounded-full" />
    </div>
    <div className="h-8 w-28 bg-gray-200 rounded mb-2" />
    <div className="h-4 w-20 bg-gray-200 rounded" />
  </div>
);

const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-4">
      {[...Array(cols)].map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 rounded flex-1" />
      ))}
    </div>
    {[...Array(rows)].map((_, r) => (
      <div key={r} className="px-4 py-3.5 flex gap-4 border-b border-gray-100 animate-pulse">
        {[...Array(cols)].map((_, c) => (
          <div key={c} className="h-4 bg-gray-200 rounded flex-1" style={{ maxWidth: c === 0 ? '80px' : undefined }} />
        ))}
      </div>
    ))}
  </div>
);

const ChartSkeleton = ({ height = 'h-64' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
    <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
    <div className={`${height} bg-gray-100 rounded-lg flex items-end gap-2 p-4`}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 rounded-t"
          style={{ height: `${25 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  </div>
);

const ListSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
    <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-1/2 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  </div>
);

Skeleton.Card = CardSkeleton;
Skeleton.Table = TableSkeleton;
Skeleton.Chart = ChartSkeleton;
Skeleton.List = ListSkeleton;

export default Skeleton;
