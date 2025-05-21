import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Config {
  id: string;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function SystemConfig() {
  const { currentUser } = useAuth();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .order('key');

      if (error) throw error;
      setConfigs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('system_configs')
        .insert([newConfig]);

      if (error) throw error;

      setNewConfig({
        key: '',
        value: '',
        description: '',
      });
      fetchConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateConfig = async (id: string, value: string) => {
    try {
      const { error } = await supabase
        .from('system_configs')
        .update({ value })
        .eq('id', id);

      if (error) throw error;
      fetchConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      const { error } = await supabase
        .from('system_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Configuration</h2>
        <form onSubmit={handleCreateConfig} className="space-y-4">
          <div>
            <label htmlFor="configKey" className="block text-sm font-medium text-gray-700">
              Key
            </label>
            <input
              type="text"
              id="configKey"
              value={newConfig.key}
              onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="configValue" className="block text-sm font-medium text-gray-700">
              Value
            </label>
            <input
              type="text"
              id="configValue"
              value={newConfig.value}
              onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="configDescription" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="configDescription"
              value={newConfig.description}
              onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Configuration
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">System Configurations</h2>
        <div className="space-y-4">
          {configs.map((config) => (
            <div key={config.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{config.key}</h3>
                  <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={config.value}
                    onChange={(e) => handleUpdateConfig(config.id, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {configs.length === 0 && (
            <p className="text-gray-500 text-center py-4">No configurations found</p>
          )}
        </div>
      </div>
    </div>
  );
}