import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProject, updateProject } from '../api/projects';
import { getLists, createList } from '../api/lists';
import { getTasks, createTask, updateTask } from '../api/tasks';
import { getStats } from '../api/stats';
import { getUsers } from '../api/users';
import TaskModal from './TaskModal';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProject();
      fetchLists();
      fetchTasks();
      fetchStats();
      fetchUsers();
    }
  }, [id, user]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getStats(id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const foundProject = await getProject(id);
      setProject(foundProject);
      setName(foundProject.name);
      setDescription(foundProject.description);
      setMembers(foundProject.members ? foundProject.members.map(m => m._id) : []);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchLists = async () => {
    try {
      const data = await getLists(id);
      setLists(data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const data = await getTasks(id);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await updateProject(id, { name, description, members });
      setIsEditing(false);
      fetchProject();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await createList({ name: newListName, project: id });
      setNewListName('');
      fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleCreateTask = async (listId) => {
    if (!newTaskName.trim()) return;
    try {
      await createTask({ name: newTaskName, list: listId });
      setNewTaskName('');
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = () => {
    fetchTasks();
    fetchStats();
  };

  if (!project) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              {isEditing ? 'Cancel' : 'Edit Project'}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {isEditing ? (
            <form onSubmit={handleUpdateProject} className="bg-white shadow rounded-lg p-6 mb-8">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="members" className="block text-sm font-medium text-gray-700">
                  Members
                </label>
                <select
                  id="members"
                  value={members.length > 0 ? members[0] : ''}
                  onChange={(e) => setMembers(e.target.value ? [e.target.value] : [])}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a member</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Update Project
              </button>
            </form>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600">{project.description || 'No description'}</p>
            </div>
          )}
          {!isEditing && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Assigned Members</h2>
              {project.members && project.members.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.members.map((member) => (
                    <span key={member._id} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                      {member.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No members assigned</p>
              )}
            </div>
          )}
          <div className="mb-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats.totalTasks || 0}</p>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks || 0}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgressTasks || 0}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalTime || 0} min</p>
                <p className="text-sm text-gray-600">Total Time</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-6 overflow-x-auto">
            {lists.map((list) => (
              <div key={list._id} className="bg-white shadow rounded-lg p-4 w-80 flex-shrink-0">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{list.name}</h3>
                <div className="space-y-2">
                  {tasks.filter(task => task.list._id === list._id).map((task) => (
                    <div key={task._id} className="bg-gray-50 p-3 rounded-md cursor-pointer hover:bg-gray-100" onClick={() => handleTaskClick(task)}>
                      <p className="text-sm text-gray-900">{task.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">{task.status}</p>
                        {task.assignee && <p className="text-xs text-gray-500">{task.assignee.name}</p>}
                      </div>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    value={selectedList === list._id ? newTaskName : ''}
                    onChange={(e) => {
                      setNewTaskName(e.target.value);
                      setSelectedList(list._id);
                    }}
                    placeholder="New task"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateTask(list._id);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          users={users}
          lists={lists}
        />
      )}
    </div>
  );
};

export default ProjectDetail;