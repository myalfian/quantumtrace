import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { DailyActivity } from '../../types';
import { format } from 'date-fns';

export default function ActivityReview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchActivities();
  }, [filterDate]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          user:user_id (
            full_name,
            email
          )
        `)
        .eq('date', filterDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (activityId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({
          status,
          supervisor_comment: comment,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', activityId);

      if (error) throw error;

      setActivities(prev =>
        prev.map(activity =>
          activity.id === activityId
            ? { ...activity, status, supervisor_comment: comment, reviewed_at: new Date().toISOString() }
            : activity
        )
      );

      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Daily Activity Review</h2>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium">{activity.user?.full_name || 'Unknown User'}</h3>
                <p className="text-sm text-gray-500">{activity.user?.email || 'No email'}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  activity.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : activity.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-gray-700">{activity.description}</p>
              <p className="text-sm text-gray-500">Location: {activity.location}</p>
              
              {activity.attachments && activity.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {activity.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={`${supabase.storage.from('daily-activities').getPublicUrl(attachment).data.publicUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Attachment {index + 1}
                    </a>
                  ))}
                </div>
              )}

              {activity.status === 'pending' && (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment (optional)"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleStatusUpdate(activity.id, 'rejected')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(activity.id, 'approved')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )}

              {activity.supervisor_comment && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Supervisor Comment:</span> {activity.supervisor_comment}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No activities found for this date
          </div>
        )}
      </div>
    </div>
  );
}