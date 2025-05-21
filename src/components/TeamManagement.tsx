import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'engineer' | 'supervisor' | 'admin';
  created_at: string;
  user: {
    email: string;
    full_name: string;
  };
}

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  members: TeamMember[];
}

export default function TeamManagement() {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
  });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'engineer' as const,
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            *,
            user:profiles(*)
          )
        `)
        .order('name');

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert([newTeam])
        .select()
        .single();

      if (teamError) throw teamError;

      // Add the creator as an admin
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: team.id,
            user_id: currentUser.id,
            role: 'admin',
          },
        ]);

      if (memberError) throw memberError;

      setNewTeam({ name: '', description: '' });
      fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    try {
      // First, get the user's ID from their email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newMember.email)
        .single();

      if (userError) throw userError;

      // Then add them to the team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: selectedTeam.id,
            user_id: user.id,
            role: newMember.role,
          },
        ]);

      if (memberError) throw memberError;

      setNewMember({ email: '', role: 'engineer' });
      fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: 'engineer' | 'supervisor' | 'admin') => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      fetchTeams();
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
        <h2 className="text-lg font-semibold mb-4">Create New Team</h2>
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="teamDescription"
              value={newTeam.description}
              onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Team
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Your Teams</h2>
        <div className="space-y-6">
          {teams.map((team) => (
            <div key={team.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{team.name}</h3>
                  <p className="text-gray-600 mt-1">{team.description}</p>
                </div>
                <button
                  onClick={() => setSelectedTeam(team)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Manage Members
                </button>
              </div>

              {selectedTeam?.id === team.id && (
                <div className="mt-4 space-y-4">
                  <form onSubmit={handleAddMember} className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="email"
                        placeholder="Member's email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="w-40">
                      <select
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value as 'engineer' | 'supervisor' | 'admin' })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="engineer">Engineer</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add Member
                    </button>
                  </form>

                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{member.user.full_name}</p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as 'engineer' | 'supervisor' | 'admin')}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="engineer">Engineer</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {teams.length === 0 && (
            <p className="text-gray-500 text-center py-4">No teams yet</p>
          )}
        </div>
      </div>
    </div>
  );
}