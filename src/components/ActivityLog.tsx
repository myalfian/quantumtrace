import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface Activity {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  };
}

export default function ActivityLog() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    action: '',
  });

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (filter.startDate) {
        query = query.gte('created_at', filter.startDate);
      }
      if (filter.endDate) {
        query = query.lte('created_at', filter.endDate);
      }
      if (filter.action) {
        query = query.eq('action', filter.action);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h2>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Action Type
            </label>
            <select
              id="action"
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity History</h3>
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {activity.user?.full_name}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {activity.user?.email}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activity.action === 'create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                    activity.action === 'update' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                    activity.action === 'delete' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                  }`}>
                    {activity.action}
                  </span>
                </div>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  {activity.details}
                </p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400">No activities found</p>
          )}
        </div>
      </div>
    </div>
  );
}