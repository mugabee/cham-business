import { verifySession } from "@/lib/dal";
import {
  getNewLoansOverTime,
  getPortfolioValueOverTime,
  getCollectionRateByMonth,
  getOverdueAging,
} from "@/lib/analytics";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

export default async function AnalyticsPage() {
  await verifySession();

  const [newLoans, portfolioValue, collectionRate, overdueAging] = await Promise.all([
    getNewLoansOverTime(),
    getPortfolioValueOverTime(),
    getCollectionRateByMonth(),
    getOverdueAging(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h1>
      <AnalyticsCharts
        newLoans={newLoans}
        portfolioValue={portfolioValue}
        collectionRate={collectionRate}
        overdueAging={overdueAging}
      />
    </div>
  );
}
