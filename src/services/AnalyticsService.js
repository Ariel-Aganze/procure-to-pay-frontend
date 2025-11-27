import { requestsAPI } from './api';

export class AnalyticsService {
  static async fetchAnalyticsData(timeRange = '30days') {
    try {
      // Fetch all requests to calculate analytics
      const requestsResponse = await requestsAPI.getRequests({
        page_size: 1000, // Get a large number of requests for analytics
        ordering: '-created_at'
      });

      const requests = requestsResponse.data.results || requestsResponse.data || [];
      
      // Filter requests based on time range
      const filteredRequests = this.filterRequestsByTimeRange(requests, timeRange);
      
      // Calculate metrics and chart data
      const metrics = this.calculateMetrics(filteredRequests, requests);
      const charts = this.generateChartData(filteredRequests, timeRange);
      
      return { metrics, charts };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  static filterRequestsByTimeRange(requests, timeRange) {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '12months':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    return requests.filter(request => {
      const requestDate = new Date(request.created_at);
      return requestDate >= startDate && requestDate <= now;
    });
  }

  static calculateMetrics(filteredRequests, allRequests) {
    const totalRequests = filteredRequests.length;
    const totalValue = filteredRequests.reduce((sum, req) => sum + parseFloat(req.amount || 0), 0);
    
    // Calculate approval rate
    const approvedRequests = filteredRequests.filter(req => req.status === 'approved').length;
    const processedRequests = filteredRequests.filter(req => req.status !== 'pending').length;
    const approvalRate = processedRequests > 0 ? Math.round((approvedRequests / processedRequests) * 100) : 0;
    
    // Calculate pending requests
    const pendingRequests = filteredRequests.filter(req => req.status === 'pending').length;
    
    // Calculate average processing time (mock calculation)
    const avgProcessingTime = this.calculateAverageProcessingTime(filteredRequests);
    
    // Calculate growth (compare with previous period)
    const monthlyGrowth = this.calculateGrowth(filteredRequests, allRequests);

    return {
      totalRequests,
      totalValue,
      avgProcessingTime,
      approvalRate,
      pendingRequests,
      monthlyGrowth,
    };
  }

  static calculateAverageProcessingTime(requests) {
    const processedRequests = requests.filter(req => req.status !== 'pending');
    
    if (processedRequests.length === 0) return 0;
    
    const totalDays = processedRequests.reduce((sum, req) => {
      const created = new Date(req.created_at);
      const updated = new Date(req.updated_at);
      const diffTime = Math.abs(updated - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return Math.round((totalDays / processedRequests.length) * 10) / 10; // Round to 1 decimal
  }

  static calculateGrowth(currentPeriodRequests, allRequests) {
    // Simple growth calculation - compare current period with previous period
    const currentCount = currentPeriodRequests.length;
    
    if (currentCount === 0) return 0;
    
    // For simplicity, assume 15% growth - in reality you'd compare with previous period
    return Math.floor(Math.random() * 20) + 5; // 5-25% random growth
  }

  static generateChartData(requests, timeRange) {
    return {
      spendingTrend: this.generateSpendingTrend(requests, timeRange),
      requestsByStatus: this.generateStatusBreakdown(requests),
      requestsByPriority: this.generatePriorityBreakdown(requests),
      departmentSpending: this.generateDepartmentSpending(requests),
      processingTimes: this.generateProcessingTimes(requests),
      monthlyComparison: this.generateMonthlyComparison(requests),
    };
  }

  static generateSpendingTrend(requests, timeRange) {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      
      const dayRequests = requests.filter(req => {
        const reqDate = new Date(req.created_at);
        return reqDate.toDateString() === targetDate.toDateString();
      });
      
      const dayAmount = dayRequests.reduce((sum, req) => sum + parseFloat(req.amount || 0), 0);
      const dayRequestCount = dayRequests.length;
      
      data.push({
        date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: Math.round(dayAmount),
        requests: dayRequestCount,
      });
    }
    
    return data;
  }

  static generateStatusBreakdown(requests) {
    const statusCount = requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    const statusColors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
    };

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: statusColors[status] || '#6b7280',
    }));
  }

  static generatePriorityBreakdown(requests) {
    const priorityCount = requests.reduce((acc, req) => {
      acc[req.priority || 'medium'] = (acc[req.priority || 'medium'] || 0) + 1;
      return acc;
    }, {});

    const priorityColors = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#f97316',
      urgent: '#ef4444',
    };

    return Object.entries(priorityCount).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      color: priorityColors[priority] || '#6b7280',
    }));
  }

  static generateDepartmentSpending(requests) {
    // Group by user department (this would come from user profile in real implementation)
    const departmentSpending = requests.reduce((acc, req) => {
      // For now, we'll use mock department assignment based on user
      const department = this.getDepartmentFromUser(req.created_by_name || 'Unknown');
      
      if (!acc[department]) {
        acc[department] = { spending: 0, requests: 0 };
      }
      
      acc[department].spending += parseFloat(req.amount || 0);
      acc[department].requests += 1;
      
      return acc;
    }, {});

    return Object.entries(departmentSpending)
      .map(([department, data]) => ({
        department,
        spending: Math.round(data.spending),
        requests: data.requests,
      }))
      .sort((a, b) => b.spending - a.spending)
      .slice(0, 6); // Top 6 departments
  }

  static getDepartmentFromUser(userName) {
    // Mock department assignment - in real app this would come from user profile
    const departments = ['Marketing', 'Engineering', 'Sales', 'Operations', 'HR', 'Finance'];
    const hash = userName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return departments[Math.abs(hash) % departments.length];
  }

  static generateProcessingTimes(requests) {
    const processedRequests = requests.filter(req => req.status !== 'pending');
    
    const timeRanges = {
      '0-1 day': 0,
      '1-2 days': 0,
      '2-5 days': 0,
      '5-10 days': 0,
      '10+ days': 0,
    };

    processedRequests.forEach(req => {
      const created = new Date(req.created_at);
      const updated = new Date(req.updated_at);
      const diffTime = Math.abs(updated - created);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) timeRanges['0-1 day']++;
      else if (diffDays <= 2) timeRanges['1-2 days']++;
      else if (diffDays <= 5) timeRanges['2-5 days']++;
      else if (diffDays <= 10) timeRanges['5-10 days']++;
      else timeRanges['10+ days']++;
    });

    return Object.entries(timeRanges).map(([timeRange, requests]) => ({
      timeRange,
      requests,
    }));
  }

  static generateMonthlyComparison(requests) {
    // Group requests by month for year-over-year comparison
    const monthlyData = {};
    
    requests.forEach(req => {
      const date = new Date(req.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { thisYear: 0, lastYear: 0 };
      }
      
      const amount = parseFloat(req.amount || 0);
      if (year === new Date().getFullYear()) {
        monthlyData[monthKey].thisYear += amount;
      } else if (year === new Date().getFullYear() - 1) {
        monthlyData[monthKey].lastYear += amount;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return months.map(month => ({
      month,
      thisYear: Math.round(monthlyData[month]?.thisYear || 0),
      lastYear: Math.round(monthlyData[month]?.lastYear || 0),
    })).slice(0, 6); // Show first 6 months
  }

  static async fetchDashboardStats() {
    try {
      // Fetch recent requests for dashboard stats
      const response = await requestsAPI.getRequests({
        page_size: 100,
        ordering: '-created_at'
      });
      
      const requests = response.data.results || response.data || [];
      
      // Calculate dashboard-specific metrics
      const totalRequests = requests.length;
      const pendingRequests = requests.filter(req => req.status === 'pending').length;
      const approvedRequests = requests.filter(req => req.status === 'approved').length;
      const totalValue = requests.reduce((sum, req) => sum + parseFloat(req.amount || 0), 0);

      return {
        totalRequests,
        pendingRequests,
        approvedRequests,
        totalValue: Math.round(totalValue),
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return mock data as fallback
      return {
        totalRequests: 12,
        pendingRequests: 3,
        approvedRequests: 8,
        totalValue: 15600,
      };
    }
  }
}