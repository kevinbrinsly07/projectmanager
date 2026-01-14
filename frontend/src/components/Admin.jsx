import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllUsers, updateUserRole, getAllProjects, deleteAnyProject, updateProjectMembers } from '../api/admin';
import { getUsers } from '../api/users';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
      fetchProjects();
      fetchAllUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const data = await getUsers();
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteAnyProject(projectId);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleQuickUpdateMembers = async (projectId, memberIds) => {
    try {
      await updateProjectMembers(projectId, memberIds);
      fetchProjects();
    } catch (error) {
      console.error('Error updating members:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-2xl inline-block mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 text-lg">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* User Management Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map((u, index) => (
            <div
              key={u._id}
              className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{u.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{u.email}</p>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-red-100 text-red-800' :
                        u.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label htmlFor={`role-${u._id}`} className="block text-sm font-semibold text-gray-700 mb-2">
                    Change Role
                  </label>
                  <select
                    id={`role-${u._id}`}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Projects Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">All Projects</h2>
            <p className="text-gray-600">Manage all projects in the system</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={project._id}
              className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-gray-600 line-clamp-2 text-sm mb-3">{project.description}</p>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>Owner: {project.owner?.name || 'None'}</p>
                      <p>Members: {project.members?.filter(m => m).map(m => m.name).join(', ') || 'None'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <label htmlFor={`members-${project._id}`} className="block text-sm font-semibold text-gray-700 mb-2">
                      Quick Add Member
                    </label>
                    <select
                      id={`members-${project._id}`}
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          const currentMembers = project.members?.filter(m => m).map(m => m._id) || [];
                          handleQuickUpdateMembers(project._id, [...currentMembers, e.target.value]);
                          e.target.value = ''; // Reset select
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 text-sm"
                    >
                      <option value="">Select a user to add</option>
                      {allUsers.filter(user => !project.members?.some(m => m._id === user._id)).map((u) => (
                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteProject(project._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;