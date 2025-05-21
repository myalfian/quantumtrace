import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DailyActivityForm from './Activity/DailyActivityForm';
import ActivityReview from './Activity/ActivityReview';

export default function DailyActivities() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserRole(profile.role);
    } catch (err) {
      console.error('Error checking user:', err);
    } finally {
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Daily Activities</h1>
      
      {userRole === 'engineer' && (
        <DailyActivityForm />
      )}

      {userRole === 'supervisor' && (
        <ActivityReview />
      )}

      {userRole === 'admin' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Activity Review</h2>
            <ActivityReview />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Submit Activity</h2>
            <DailyActivityForm />
          </div>
        </div>
      )}

      {!userRole && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-yellow-700">Please log in to view and manage daily activities.</p>
        </div>
      )}
    </div>
  );
}