import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ProductivityMetrics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [teams, setTeams] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetchTeams();
    fetchMetrics();
  }, [selectedPeriod, selectedTeam]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      let query = supabase.from('productivity_metrics').select('*');
      
      if (selectedTeam !== 'all') {
        query = query.eq('team_id', selectedTeam);
      }

      // Date filtering based on selected period
      const today = new Date();
      let startDate;
      
      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 3);
          break;
      }

      query = query.gte('date', startDate.toISOString().split('T')[0]);

      const { data, error } = await query;

      if (error) throw error;
      setMetrics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (metrics.length === 0) return { 
      projectsCompleted: 0,
      avgCompletionTime: 0,
      teamEfficiency: 0,
      topPerformer: 'N/A'
    };

    const projectsCompleted = metrics.filter(m => m.status === 'completed').length;
    
    // Calculate average completion time
    const completedProjects = metrics.filter(m => m.status === 'completed');
    const avgCompletionTime = completedProjects.length > 0 
      ? completedProjects.reduce((sum, project) => sum + project.completion_days, 0) / completedProjects.length
      : 0;
    
    // Calculate team efficiency (example calculation)
    const teamEfficiency = metrics.length > 0
      ? (metrics.reduce((sum, m) => sum + m.efficiency_score, 0) / metrics.length) * 100
      : 0;
    
    // Find top performer
    const performerMap: {[key: string]: number} = {};
    metrics.forEach(m => {
      if (m.assigned_to) {
        performerMap[m.assigned_to] = (performerMap[m.assigned_to] || 0) + m.efficiency_score;
      }
    });
    
    const topPerformer = Object.keys(performerMap).length > 0
      ? Object.keys(performerMap).reduce((a, b) => performerMap[a] > performerMap[b] ? a : b)
      : 'N/A';
    
    return {
      projectsCompleted,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      teamEfficiency: Math.round(teamEfficiency),
      topPerformer
    };
  };

  const summaryMetrics = calculateSummaryMetrics();

  if (loading && metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Productivity Metrics</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-4 py-2 text-sm rounded-md ${
                  selectedPeriod === 'week'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-4 py-2 text-sm rounded-md ${
                  selectedPeriod === 'month'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setSelectedPeriod('quarter')}
                className={`px-4 py-2 text-sm rounded-md ${
                  selectedPeriod === 'quarter'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Quarter
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Projects Completed</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summaryMetrics.projectsCompleted}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg. Completion Time</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summaryMetrics.avgCompletionTime} days</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Team Efficiency</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{summaryMetrics.teamEfficiency}%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Top Performer</h3>
          <p className="mt-2 text-xl font-bold text-gray-900 truncate">{summaryMetrics.topPerformer}</p>
        </div>
      </div>
      
      {/* Main chart area */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Productivity Trends</h2>
        <div className="h-80 flex items-center justify-center border border-gray-200 rounded">
          <p className="text-gray-500">
            Chart visualization would be displayed here. 
            Consider integrating a chart library like Chart.js or Recharts.
          </p>
        </div>
      </div>
      
      {/* Details table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Metrics Details</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : metrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.map((metric) => (
                  <tr key={metric.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(metric.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.team_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.project_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          metric.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : metric.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {metric.status.charAt(0).toUpperCase() + metric.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.completion_days || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {metric.efficiency_score ? `${metric.efficiency_score.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No metrics data available</p>
          </div>
        )}
      </div>
    </div>
  );
}