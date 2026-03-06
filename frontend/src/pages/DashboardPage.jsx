import { useAnalytics } from '../hooks/useAnalytics';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import SummaryCards from '../components/dashboard/SummaryCards';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BudgetAlerts from '../components/dashboard/BudgetAlerts';
import { formatMonthYear, getCurrentYearMonth } from '../utils/formatDate';

const DashboardPage = () => {
  const currentMonth = getCurrentYearMonth();
  const { currentMonthData, monthlySummary, categoryBreakdown, loading: analyticsLoading } = useAnalytics();
  const { transactions, totalElements, loading: txLoading } = useTransactions({ size: 5, sort: 'transactionDate,desc' });
  const { budgetStatus, loading: budgetLoading } = useBudgets();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Financial overview for {formatMonthYear(currentMonth)}
        </p>
      </div>

      {/* Row 1: Summary Cards */}
      <SummaryCards
        data={currentMonthData}
        totalTransactions={totalElements}
        loading={analyticsLoading || txLoading}
      />

      {/* Row 2: Spending Chart + Budget Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SpendingChart monthlySummary={monthlySummary} loading={analyticsLoading} />
        </div>
        <div className="lg:col-span-2">
          <BudgetAlerts budgetStatus={budgetStatus} loading={budgetLoading} />
        </div>
      </div>

      {/* Row 3: Category Pie + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CategoryPieChart categoryBreakdown={categoryBreakdown} loading={analyticsLoading} />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions transactions={transactions} loading={txLoading} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
