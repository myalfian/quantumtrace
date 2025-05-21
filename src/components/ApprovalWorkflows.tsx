import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface Workflow {
  id: string;
  name: string;
  description: string;
  type: 'leave' | 'activity' | 'project';
  steps: WorkflowStep[];
  created_at: string;
}

interface WorkflowStep {
  id: string;
  workflow_id: string;
  role: 'engineer' | 'supervisor' | 'admin';
  order: number;
  created_at: string;
}

interface ApprovalRequest {
  id: string;
  workflow_id: string;
  request_type: 'leave' | 'activity' | 'project';
  request_id: string;
  current_step: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  workflow: Workflow;
  request: any; // This will be populated based on request_type
}

export default function ApprovalWorkflows() {
  const { currentUser } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    type: 'leave' as const,
    steps: [] as { role: 'engineer' | 'supervisor' | 'admin' }[],
  });

  useEffect(() => {
    fetchWorkflows();
    fetchApprovalRequests();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*)
        `)
        .order('name');

      if (error) throw error;
      setWorkflows(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          workflow:workflows(
            *,
            steps:workflow_steps(*)
          ),
          request:leave_requests(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApprovalRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      // Create the workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .insert([{
          name: newWorkflow.name,
          description: newWorkflow.description,
          type: newWorkflow.type,
        }])
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Create the workflow steps
      const steps = newWorkflow.steps.map((step, index) => ({
        workflow_id: workflow.id,
        role: step.role,
        order: index + 1,
      }));

      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(steps);

      if (stepsError) throw stepsError;

      setNewWorkflow({
        name: '',
        description: '',
        type: 'leave',
        steps: [],
      });
      fetchWorkflows();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddStep = () => {
    setNewWorkflow({
      ...newWorkflow,
      steps: [...newWorkflow.steps, { role: 'engineer' }],
    });
  };

  const handleRemoveStep = (index: number) => {
    setNewWorkflow({
      ...newWorkflow,
      steps: newWorkflow.steps.filter((_, i) => i !== index),
    });
  };

  const handleUpdateStepRole = (index: number, role: 'engineer' | 'supervisor' | 'admin') => {
    const newSteps = [...newWorkflow.steps];
    newSteps[index] = { role };
    setNewWorkflow({
      ...newWorkflow,
      steps: newSteps,
    });
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const request = approvalRequests.find(r => r.id === requestId);
      if (!request) return;

      const currentStep = request.workflow.steps.find(s => s.order === request.current_step);
      if (!currentStep) return;

      // Check if this is the last step
      const isLastStep = request.current_step === request.workflow.steps.length;

      if (isLastStep) {
        // Update the request status to approved
        const { error } = await supabase
          .from('approval_requests')
          .update({ status: 'approved' })
          .eq('id', requestId);

        if (error) throw error;

        // Update the original request based on type
        const updateData = { status: 'approved' };
        const { error: updateError } = await supabase
          .from(request.request_type === 'leave' ? 'leave_requests' : 'daily_activities')
          .update(updateData)
          .eq('id', request.request_id);

        if (updateError) throw updateError;
      } else {
        // Move to the next step
        const { error } = await supabase
          .from('approval_requests')
          .update({ current_step: request.current_step + 1 })
          .eq('id', requestId);

        if (error) throw error;
      }

      fetchApprovalRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const request = approvalRequests.find(r => r.id === requestId);
      if (!request) return;

      // Update the request status to rejected
      const { error } = await supabase
        .from('approval_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Update the original request based on type
      const updateData = { status: 'rejected' };
      const { error: updateError } = await supabase
        .from(request.request_type === 'leave' ? 'leave_requests' : 'daily_activities')
        .update(updateData)
        .eq('id', request.request_id);

      if (updateError) throw updateError;

      fetchApprovalRequests();
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
        <h2 className="text-lg font-semibold mb-4">Create New Workflow</h2>
        <form onSubmit={handleCreateWorkflow} className="space-y-4">
          <div>
            <label htmlFor="workflowName" className="block text-sm font-medium text-gray-700">
              Workflow Name
            </label>
            <input
              type="text"
              id="workflowName"
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="workflowDescription" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="workflowDescription"
              value={newWorkflow.description}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="workflowType" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="workflowType"
              value={newWorkflow.type}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, type: e.target.value as 'leave' | 'activity' | 'project' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="leave">Leave Request</option>
              <option value="activity">Daily Activity</option>
              <option value="project">Project</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Approval Steps
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className="text-blue-500 hover:text-blue-600"
              >
                Add Step
              </button>
            </div>
            <div className="space-y-2">
              {newWorkflow.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={step.role}
                    onChange={(e) => handleUpdateStepRole(index, e.target.value as 'engineer' | 'supervisor' | 'admin')}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="engineer">Engineer</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Workflow
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
        <div className="space-y-4">
          {approvalRequests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {request.request_type === 'leave' ? 'Leave Request' : 'Daily Activity'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created on {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Current Step: {request.current_step} of {request.workflow.steps.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveRequest(request.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
          {approvalRequests.length === 0 && (
            <p className="text-gray-500 text-center py-4">No pending approvals</p>
          )}
        </div>
      </div>
    </div>
  );
}