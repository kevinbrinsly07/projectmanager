import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProjects, createProject, deleteProject } from '../api/projects';
import { getTasks } from '../api/tasks';
import { search } from '../api/search';
import { getUsers } from '../api/users';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectTasks, setProjectTasks] = useState({});
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ tasks: [], projects: [] });

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);

      // Fetch tasks for each project
      const tasksMap = {};
      for (const project of data) {
        try {
          const tasks = await getTasks(project._id);
          tasksMap[project._id] = tasks;
        } catch (error) {
          console.error(`Error fetching tasks for project ${project._id}:`, error);
          tasksMap[project._id] = [];
        }
      }
      setProjectTasks(tasksMap);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    else if (!loading && user) {
      fetchProjects();
      fetchUsers();
    }
  }, [user, loading, navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await createProject({
        name: newProjectName,
        description: newProjectDescription,
        members: selectedMembers,
      });
      setNewProjectName('');
      setNewProjectDescription('');
      setSelectedMembers([]);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    console.log('Deleting project with id:', id);
    try {
      await deleteProject(id);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults({ tasks: [], projects: [] });
      return;
    }
    try {
      const results = await search(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  return (
    <div>
      {/* Projects Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Projects</h2>
            <p className="text-gray-600">Manage and track your team's progress</p>
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
                    <p className="text-gray-600 line-clamp-2 text-sm">{project.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">{projectTasks[project._id]?.length || 0}</div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Tasks</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {projectTasks[project._id]?.filter((t) => t.status === 'done').length || 0}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">Completed</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      console.log('Navigating to project:', project._id);
                      navigate(`/projects/${project._id}`);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View Project
                  </button>

                  {(user?.id === project.owner || user?.role === 'admin' || user?.role === 'manager') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project._id);
                      }}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Project Section */}
      {user && (user.role === 'admin' || user.role === 'manager') && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h3>
          <form onSubmit={handleCreateProject} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-8 py-3 rounded-xl"
            >
              Create Project
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;