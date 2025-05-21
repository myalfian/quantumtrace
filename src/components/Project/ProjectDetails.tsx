import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Project, ProjectUpdate } from '../../types';
import { format } from 'date-fns';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    progress: 0,
    notes: '',
    attachments: [] as string[],
  });

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
      fetchProjectUpdates();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const fetchProjectUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', id)
        .order('date', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('project_updates')
        .insert({
          project_id: id,
          progress: newUpdate.progress,
          notes: newUpdate.notes,
          attachments: newUpdate.attachments,
          date: new Date().toISOString(),
        });

      if (error) throw error;

      // Refresh updates
      await fetchProjectUpdates();
      setShowUpdateForm(false);
      setNewUpdate({ progress: 0, notes: '', attachments: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        uploadedFiles.push(filePath);
      }

      setNewUpdate(prev => ({
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

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const latestUpdate = updates[0];
  const progress = latestUpdate?.progress || 0;

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-1 text-gray-500">{project.description}</p>
          </div>
          <button
            onClick={() => setShowUpdateForm(!showUpdateForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add Update
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1 text-gray-900">{project.location}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Person in Charge</h3>
            <p className="mt-1 text-gray-900">{project.personInCharge}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
            <p className="mt-1 text-gray-900">
              {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-500">Progress</h3>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Update Form */}
      {showUpdateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add Progress Update</h2>
          <form onSubmit={handleSubmitUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Progress</label>
              <input
                type="range"
                min="0"
                max="100"
                value={newUpdate.progress}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{newUpdate.progress}%</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={newUpdate.notes}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Attachments</label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="mt-1 block w-full"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUpdateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Submit Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Updates History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Update History</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {updates.map((update) => (
            <div key={update.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(update.date), 'MMM d, yyyy')}
                  </p>
                  <p className="mt-1 text-gray-900">{update.notes}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {update.progress}%
                </span>
              </div>
              {update.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {update.attachments.map((attachment, index) => (
                      <a
                        key={index}
                        href={`${supabase.storage.from('project-attachments').getPublicUrl(attachment).data.publicUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 