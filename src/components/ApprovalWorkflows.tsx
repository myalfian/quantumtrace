import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

import type { Database } from '../types/supabase';

type Tables = Database['public']['Tables'];
type LeaveRequest = Tables['leave_requests']['Row'] & {
  profiles?: {
    full_name: string;
    email: string;
  };
  type: string;
  reason: string;
  start_date: string;
  end_date: string;
};

type DailyActivity = Tables['activities']['Row'] & {
  profiles?: {
    full_name: string;
    email: string;
  };
  description: string;
  location: string;
  date: string;
};

function isLeaveRequest(request: LeaveRequest | DailyActivity): request is LeaveRequest {
  return 'type' in request && 'reason' in request;
}

export default function ApprovalWorkflows() {
  const { currentUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<(LeaveRequest | DailyActivity)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchPendingRequests();
    }
  }, [currentUser]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'supervisor') {
        throw new Error('Unauthorized access');
      }

      const { data: leaveData, error: leaveError } = await supabase
        .from('leave_requests')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq('status', 'pending') as { data: LeaveRequest[] | null; error: any };

      if (leaveError) throw leaveError;

      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .eq('status', 'pending') as { data: DailyActivity[] | null; error: any };

      if (activityError) throw activityError;

      const combinedRequests = [
        ...(leaveData || []),
        ...(activityData || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPendingRequests(combinedRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };



  const handleStatusUpdate = async (requestType: 'leave' | 'activity', requestId: string, status: 'approved' | 'rejected') => {
    try {
      const tableName = requestType === 'leave' ? 'leave_requests' : 'activities';
      const { error } = await supabase
        .from(tableName)
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh the list of pending requests
      fetchPendingRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleApproveRequest = (requestType: 'leave' | 'activity', requestId: string) => {
    handleStatusUpdate(requestType, requestId, 'approved');
  };

  const handleRejectRequest = (requestType: 'leave' | 'activity', requestId: string) => {
    handleStatusUpdate(requestType, requestId, 'rejected');
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
        <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
      <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
        <div>
                  <h3 className="font-medium">
                    {isLeaveRequest(request) ? 'Leave Request' : 'Daily Activity'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isLeaveRequest(request) ? (
                      <>
                        {request.type} - {request.reason}<br />
                        From: {format(new Date(request.start_date), 'MMM d, yyyy')} to {format(new Date(request.end_date), 'MMM d, yyyy')}
                      </>
                    ) : (
                      <>
                        {request.description}<br />
                        Location: {request.location}<br />
                        Date: {format(new Date(request.date), 'MMM d, yyyy')}
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted by: {request.profiles?.full_name || 'Unknown'}<br />
                    Created on: {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
              </div>
              <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveRequest(isLeaveRequest(request) ? 'leave' : 'activity', request.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectRequest(isLeaveRequest(request) ? 'leave' : 'activity', request.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Reject
                  </button>
              </div>
              </div>
            </div>
          ))}
          {pendingRequests.length === 0 && (
            <p className="text-gray-500 text-center py-4">No pending approvals</p>
          )}
        </div>
      </div>
    </div>
  );
}
