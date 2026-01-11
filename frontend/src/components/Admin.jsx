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
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to access this page.</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Management</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map((u) => (
                  <li key={u._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800' :
                          u.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                          <option value="member">Member</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">All Projects</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <li key={project._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                        <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                        <p className="mt-1 text-sm text-gray-500">Owner: {project.owner?.name || 'None'}</p>
                        <p className="mt-1 text-sm text-gray-500">Members: {project.members?.filter(m => m).map(m => m.name).join(', ') || 'None'}</p>
                        <div className="mt-1">
                          <label className="block text-sm font-medium text-gray-700">Members</label>
                          <select
                            value={project.members?.filter(m => m).length > 0 ? project.members.filter(m => m)[0]._id : ''}
                            onChange={(e) => handleQuickUpdateMembers(project._id, e.target.value ? [e.target.value] : [])}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          >
                            <option value="">Select a member</option>
                            {allUsers.map((u) => (
                              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;