import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { DailyActivity } from '../../types';
import { format } from 'date-fns';

export default function DailyActivityForm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    attachments: [] as string[],
  });

  useEffect(() => {
    checkTodaySubmission();
  }, []);

  const checkTodaySubmission = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setHasSubmittedToday(!!data);
      if (data) {
        setActivity(data);
        setFormData({
          description: data.description,
          location: data.location,
          attachments: data.attachments || [],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = format(new Date(), 'yyyy-MM-dd');
      const activityData = {
        user_id: user.id,
        date: today,
        description: formData.description,
        location: formData.location,
        attachments: formData.attachments,
        status: 'pending',
      };

      if (hasSubmittedToday) {
        const { error } = await supabase
          .from('daily_activities')
          .update(activityData)
          .eq('id', activity?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_activities')
          .insert(activityData);

        if (error) throw error;
      }

      await checkTodaySubmission();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${format(new Date(), 'yyyy-MM-dd')}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('daily-activities')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        uploadedFiles.push(filePath);
      }

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedFiles],
      }));
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
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Daily Activity Report</h2>
        {hasSubmittedToday && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            Already submitted today
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            rows={4}
            required
            disabled={hasSubmittedToday && activity?.status === 'approved'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required
            disabled={hasSubmittedToday && activity?.status === 'approved'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Attachments</label>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="mt-1 block w-full"
            disabled={hasSubmittedToday && activity?.status === 'approved'}
          />
          {formData.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.attachments.map((attachment, index) => (
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
        </div>

        {activity?.status === 'approved' && (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-green-700">
              Your activity has been approved by your supervisor.
              {activity.supervisorComment && (
                <span className="block mt-2">
                  Comment: {activity.supervisorComment}
                </span>
              )}
            </p>
          </div>
        )}

        {activity?.status === 'rejected' && (
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-red-700">
              Your activity has been rejected by your supervisor.
              {activity.supervisorComment && (
                <span className="block mt-2">
                  Comment: {activity.supervisorComment}
                </span>
              )}
            </p>
          </div>
        )}

        {(!hasSubmittedToday || activity?.status !== 'approved') && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {hasSubmittedToday ? 'Update Submission' : 'Submit Activity'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
} 