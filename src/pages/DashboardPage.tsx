import StatsCard from '@/components/StatsCard'

import { Building2, DollarSign, Users, AlertCircle, TrendingUp, Clock, ArrowUpRight, Calendar, CheckCircle, CreditCard, Activity, Cloud, Server } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useGetDashboardQuery } from '@/redux/api/dashboardApi'

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useGetDashboardQuery({});
  const [revenueChart, setRevenueChart] = useState<
    { month: string; revenue: string }[]
  >([]);

  // Safe data access helpers
  const d = dashboardData?.data;

  useEffect(() => {
    if (d?.revenue?.trends) {
      setRevenueChart(
        d.revenue.trends.map((trend: any) => ({
          month: trend.month,
          revenue: parseFloat(trend.revenue) || 0,
        }))
      );
    }
  }, [d?.revenue?.trends]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Mapped values from API
  const totalTenants = d?.summary?.total_tenants?.value ?? 0;
  const centralizedTenants = d?.summary?.centralized_tenants?.value ?? 0;
  const selfHostedTenants = d?.summary?.self_hosted_tenants?.value ?? 0;
  const monthlyRevenue = d?.summary?.monthly_revenue?.formatted ?? "SAR 0";
  const totalRevenue = d?.invoices?.revenue ?? "0";
  const pendingRevenue =
    d?.invoices?.by_status?.pending?.formatted_amount ?? "SAR 0";
  const trialTenants = d?.trials?.count ?? 0;
  const conversionRate = d?.performance?.conversion_rate?.current ?? "0";
  const churnRate = d?.performance?.churn_rate?.current ?? "0";
  const systemUptime = d?.performance?.system_uptime ?? "99.9";
  const recentTenants = d?.tenants?.recent ?? [];
  const recentTickets = d?.support?.tickets ?? [];
  const resolvedTickets = parseInt(d?.support?.resolved ?? "0");
  const openTickets =
    parseInt(d?.support?.open ?? "0") +
    parseInt(d?.support?.in_progress ?? "0");

  return (
    <div className="space-y-6">
      {/* Header with Date */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          {d?.current_date ||
            new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
        </div>
      </div>

      {/* Main Stats Grid - API MAPPED */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tenants"
          value={totalTenants.toString()}
          icon={Building2}
          trend={{
            value: d?.summary?.total_tenants?.change ?? 0,
            isPositive: d?.summary?.total_tenants?.isPositive ?? true,
          }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Centralized"
          value={centralizedTenants.toString()}
          icon={Cloud}
          trend={{
            value: d?.summary?.centralized_tenants?.change ?? 0,
            isPositive: d?.summary?.centralized_tenants?.isPositive ?? true,
          }}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-100"
        />
        <StatsCard
          title="Self-Hosted"
          value={selfHostedTenants.toString()}
          icon={Server}
          trend={{
            value: d?.summary?.self_hosted_tenants?.change ?? 0,
            isPositive: d?.summary?.self_hosted_tenants?.isPositive ?? true,
          }}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Monthly Revenue"
          value={monthlyRevenue}
          icon={DollarSign}
          trend={{
            value: d?.summary?.monthly_revenue?.change ?? 0,
            isPositive: d?.summary?.monthly_revenue?.isPositive ?? true,
          }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
      </div>

      {/* Revenue Chart & Key Metrics - API MAPPED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2 bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Trend</CardTitle>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +24% vs last period
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueChart.map((item) => {
                const maxRevenue = Math.max(
                  ...revenueChart.map((r) => Number(r.revenue))
                );
                const width = (Number(item.revenue) / maxRevenue) * 100;
                return (
                  <div key={item.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-600">
                        {item.month}
                      </span>
                      <span className="font-bold text-gray-900">
                        {d?.revenue?.trends?.find(
                          (t: any) => t.month === item.month
                        )?.formatted_revenue || "SAR 0"}
                      </span>
                    </div>
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${width}%` }}
                      >
                        {width > 30 && (
                          <span className="text-xs font-semibold text-white">
                            {d?.revenue?.trends?.find(
                              (t: any) => t.month === item.month
                            )?.formatted_revenue || "SAR 0"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Key Performance Indicators - API MAPPED */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {conversionRate}%
              </p>
              <p className="text-xs text-green-600 mt-2">
                ↑ {d?.performance?.conversion_rate?.change ?? 0}% from last
                month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {d?.performance?.avg_response_time?.current || "2.4"}
                {d?.performance?.avg_response_time?.unit || "h"}
              </p>
              <p className="text-xs text-green-600 mt-2">
                {d?.performance?.avg_response_time?.isPositive ? "↓" : "↑"}{" "}
                {Math.abs(d?.performance?.avg_response_time?.change ?? 0)}h
                improvement
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
              <p className="text-3xl font-bold text-gray-900">{churnRate}%</p>
              <p className="text-xs text-green-600 mt-2">
                {d?.performance?.churn_rate?.isPositive ? "↓" : "↑"}{" "}
                {Math.abs(d?.performance?.churn_rate?.change ?? 0)}% improvement
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Health & Financial Metrics - API MAPPED */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">System Uptime</p>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{systemUptime}%</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${systemUptime}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {d?.invoices?.formatted_revenue || formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-2">All-time collected</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pending Revenue</p>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{pendingRevenue}</p>
            <p className="text-xs text-gray-500 mt-2">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Trial Accounts</p>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{trialTenants}</p>
            <p className="text-xs text-gray-500 mt-2">Active trials</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution - API MAPPED */}
      <Card className="bg-white/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Plan Distribution</CardTitle>
          <CardDescription>
            Revenue and market share by subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {d?.revenue?.plan_breakdown?.map((plan: any) => (
              <div
                key={plan.plan}
                className="p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">
                    {plan.plan}
                  </h3>
                  <Badge variant="default">{plan.tenant_count} tenants</Badge>
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {plan.formatted_revenue}/mo
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Market Share</span>
                    <span className="font-semibold text-gray-900">
                      {plan.market_share}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${plan.market_share}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-600">MRR</span>
                    <span className="font-semibold text-gray-900">
                      {plan.formatted_revenue}
                    </span>
                  </div>
                </div>
              </div>
            )) || []}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity - API MAPPED */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tenants */}
        <Card className="bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Tenants</CardTitle>
              <Badge variant="outline">{d?.tenants?.total || 0} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTenants.slice(0, 5).map((tenant: any) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {tenant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tenant.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-600">
                          {tenant.plan} •{" "}
                          {tenant.deployment === "centralized"
                            ? "Cloud"
                            : "Self-Hosted"}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            tenant.deployment === "centralized"
                              ? "bg-cyan-50 text-cyan-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {tenant.deployment}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    status={tenant.status === "1" ? "active" : "inactive"}
                    type="tenant"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Support Tickets - API MAPPED */}
        <Card className="bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Support Tickets</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {resolvedTickets} resolved
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700"
                >
                  {openTickets} open
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.slice(0, 5).map((ticket: any) => {
                const priorityColors = {
                  urgent: "bg-red-100 text-red-700",
                  high: "bg-orange-100 text-orange-700",
                  medium: "bg-yellow-100 text-yellow-700",
                  low: "bg-gray-100 text-gray-700",
                };
                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {ticket.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            priorityColors[
                              ticket.priority as keyof typeof priorityColors
                            ]
                          }`}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {ticket.company} • {ticket.date}
                      </p>
                    </div>
                    <StatusBadge status={ticket.status} type="ticket" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

