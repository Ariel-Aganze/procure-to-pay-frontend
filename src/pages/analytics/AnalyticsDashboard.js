import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AnalyticsService } from '../../services/AnalyticsService';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowPathIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);
  
  // Analytics data state
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    totalValue: 0,
    avgProcessingTime: 0,
    approvalRate: 0,
    pendingRequests: 0,
    monthlyGrowth: 0,
  });
  
  const [chartData, setChartData] = useState({
    spendingTrend: [],
    requestsByStatus: [],
    requestsByPriority: [],
    departmentSpending: [],
    processingTimes: [],
    monthlyComparison: [],
  });

  const timeRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '12months', label: 'Last 12 Months' },
    { value: 'ytd', label: 'Year to Date' },
  ];

  const statusColors = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
  };

  const priorityColors = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444',
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');

    try {
      const analyticsData = await AnalyticsService.fetchAnalyticsData(timeRange);
      setMetrics(analyticsData.metrics);
      setChartData(analyticsData.charts);
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      
      // Fallback to basic mock data if API fails
      const fallbackData = generateBasicFallback(timeRange);
      setMetrics(fallbackData.metrics);
      setChartData(fallbackData.charts);
    } finally {
      setLoading(false);
    }
  };

  const generateBasicFallback = (range) => {
    // Simple fallback data if API fails
    return {
      metrics: {
        totalRequests: 0,
        totalValue: 0,
        avgProcessingTime: 0,
        approvalRate: 0,
        pendingRequests: 0,
        monthlyGrowth: 0,
      },
      charts: {
        spendingTrend: [],
        requestsByStatus: [],
        requestsByPriority: [],
        departmentSpending: [],
        processingTimes: [],
        monthlyComparison: [],
      }
    };
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Insights into procurement performance and spending patterns.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="btn-outline"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-800">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalRequests)}</p>
                <div className="ml-2 flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  +{metrics.monthlyGrowth}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{metrics.avgProcessingTime}</p>
                <span className="ml-1 text-sm text-gray-600">days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{metrics.approvalRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.spendingTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#14b8a6" 
                fill="#14b8a6" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Requests by Status */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.requestsByStatus}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.requestsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department Spending */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.departmentSpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="spending" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Processing Times */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Time Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.processingTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeRange" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-over-Year Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="thisYear" 
              stroke="#14b8a6" 
              strokeWidth={3}
              name="This Year"
            />
            <Line 
              type="monotone" 
              dataKey="lastYear" 
              stroke="#94a3b8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Last Year"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-500" />
            Top Insights
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Processing time improved by 15% this month</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>Engineering department leads in request volume</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span>High priority requests have 95% approval rate</span>
            </li>
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-yellow-500" />
            Pending Actions
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Requests pending approval</span>
              <span className="font-semibold">{metrics.pendingRequests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Avg approval time</span>
              <span className="font-semibold">{metrics.avgProcessingTime} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending PO generation</span>
              <span className="font-semibold">3</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-primary-500" />
            Quick Stats
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Most active department</span>
              <span className="font-semibold">Engineering</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Largest request</span>
              <span className="font-semibold">$12,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Active users</span>
              <span className="font-semibold">47</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;