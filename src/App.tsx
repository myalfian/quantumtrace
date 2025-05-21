import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Welcome from './pages/Welcome';
import DashboardLayout from './components/DashboardLayout';
import ProjectTracking from './components/ProjectTracking';
import DailyActivities from './components/DailyActivities';
import LeaveRequests from './components/LeaveRequests';
import ProductivityMetrics from './components/ProductivityMetrics';
import DailyTaskInput from './components/DailyTaskInput';
import ActivityLog from './components/ActivityLog';
import Reminders from './components/Reminders';
import TeamManagement from './components/TeamManagement';
import ApprovalWorkflows from './components/ApprovalWorkflows';
import SystemConfig from './components/SystemConfig';
import UserManagement from './components/UserManagement';

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

// Dashboard component
const Dashboard = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Project Stats Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Active Projects</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">12</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Completed</span>
            <span className="text-green-600 dark:text-green-400 font-semibold">45</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">In Progress</span>
            <span className="text-yellow-600 dark:text-yellow-400 font-semibold">8</span>
          </div>
        </div>
      </div>

      {/* Team Activity Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Activity</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Active Members</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">24</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Tasks Completed</span>
            <span className="text-green-600 dark:text-green-400 font-semibold">156</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">Hours Logged</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">892</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
            <div>
              <p className="text-sm text-gray-900 dark:text-white">New project created</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
            <div>
              <p className="text-sm text-gray-900 dark:text-white">Team meeting scheduled</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500"></div>
            <div>
              <p className="text-sm text-gray-900 dark:text-white">Task deadline updated</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            >
              <Route path="projects" element={<ProjectTracking />} />
              <Route path="activities" element={<DailyActivities />} />
              <Route path="leaves" element={<LeaveRequests />} />
              <Route path="metrics" element={<ProductivityMetrics />} />
              <Route path="tasks" element={<DailyTaskInput />} />
              <Route path="activity-log" element={<ActivityLog />} />
              <Route path="reminders" element={<Reminders />} />
              <Route path="teams" element={<TeamManagement />} />
              <Route path="approvals" element={<ApprovalWorkflows />} />
              <Route path="config" element={<SystemConfig />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
            {/* Add more routes for other dashboard pages */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
