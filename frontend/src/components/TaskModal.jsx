import { useState, useEffect } from 'react';
import { updateTask, deleteTask, createTask } from '../api/tasks';
import { getComments, createComment, deleteComment } from '../api/comments';
import { getAttachments, uploadAttachment, deleteAttachment } from '../api/attachments';
import { getTimeLogs, startTimeTracking, stopTimeTracking } from '../api/timelogs';
import { getUsers } from '../api/users';

const TaskModal = ({ task, onClose, onUpdate, users, lists }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');
  const [assignee, setAssignee] = useState(task.assignee?._id || '');
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [list, setList] = useState(task.list._id);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLogId, setCurrentLogId] = useState(null);
  const [newSubtaskName, setNewSubtaskName] = useState('');

  useEffect(() => {
    fetchComments();
    fetchAttachments();
    fetchTimeLogs();
  }, [task._id]);

  const fetchComments = async () => {
    try {
      const data = await getComments(task._id);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchAttachments = async () => {
    try {
      const data = await getAttachments(task._id);
      setAttachments(data);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const fetchTimeLogs = async () => {
    try {
      const data = await getTimeLogs(task._id);
      setTimeLogs(data);
    } catch (error) {
      console.error('Error fetching time logs:', error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedTask = {
        name,
        description,
        assignee: assignee || null,
        dueDate: dueDate || null,
        priority,
        status,
        list,
      };
      await updateTask(task._id, updatedTask);
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task._id);
        onUpdate();
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment({ text: newComment, task: task._id });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadAttachment(task._id, file);
      fetchAttachments();
    } catch (error) {
      console.error('Error uploading attachment:', error);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      fetchAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const handleStartTracking = async () => {
    try {
      const log = await startTimeTracking(task._id);
      setIsTracking(true);
      setCurrentLogId(log._id);
      fetchTimeLogs();
    } catch (error) {
      console.error('Error starting time tracking:', error);
    }
  };

  const handleStopTracking = async () => {
    try {
      await stopTimeTracking(currentLogId);
      setIsTracking(false);
      setCurrentLogId(null);
      fetchTimeLogs();
    } catch (error) {
      console.error('Error stopping time tracking:', error);
    }
  };

  const handleCreateSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskName.trim()) return;
    try {
      const subtask = await createTask({ name: newSubtaskName, list: task.list._id });
      // Add to parent's subtasks
      const updatedSubtasks = [...(task.subtasks || []), subtask._id];
      await updateTask(task._id, { subtasks: updatedSubtasks });
      setNewSubtaskName('');
      onUpdate();
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={onClose}>
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-2xl font-bold text-gray-900 border rounded px-2 py-1"
              />
            ) : (
              <h3 className="text-2xl font-bold text-gray-900">{task.name}</h3>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
          </div>

          {isEditing ? (
            <div className="mb-4">
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">Assignee</label>
                  <select
                    id="assignee"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="list" className="block text-sm font-medium text-gray-700">List</label>
                  <select
                    id="list"
                    value={list}
                    onChange={(e) => setList(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {lists.map(l => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save</button>
                <button onClick={() => setIsEditing(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-gray-600">{task.description || 'No description'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded text-xs ${priority === 'high' ? 'bg-red-100 text-red-800' : priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {priority}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${status === 'done' ? 'bg-green-100 text-green-800' : status === 'inprogress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {status}
                </span>
                {task.assignee && <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">Assigned to {task.assignee.name}</span>}
                {dueDate && <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">Due {new Date(dueDate).toLocaleDateString()}</span>}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold">Time Tracking</h4>
              {isTracking ? (
                <button onClick={handleStopTracking} className="bg-red-600 text-white px-4 py-2 rounded">Stop Tracking</button>
              ) : (
                <button onClick={handleStartTracking} className="bg-green-600 text-white px-4 py-2 rounded">Start Tracking</button>
              )}
            </div>
            <div className="space-y-2">
              {timeLogs.map(log => (
                <div key={log._id} className="bg-gray-50 p-2 rounded">
                  <p className="text-sm">{log.user.name}: {log.duration || 'Ongoing'} minutes</p>
                  <p className="text-xs text-gray-500">{new Date(log.startTime).toLocaleString()} - {log.endTime ? new Date(log.endTime).toLocaleString() : 'Ongoing'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Subtasks</h4>
            <form onSubmit={handleCreateSubtask} className="mb-2">
              <input
                type="text"
                value={newSubtaskName}
                onChange={(e) => setNewSubtaskName(e.target.value)}
                className="w-full border rounded px-2 py-1"
                placeholder="New subtask name"
              />
              <button type="submit" className="mt-1 bg-indigo-600 text-white px-4 py-2 rounded">Add Subtask</button>
            </form>
            <div className="space-y-2">
              {task.subtasks && task.subtasks.map(subtask => (
                <div key={subtask._id} className="bg-gray-50 p-2 rounded">
                  <p className="text-sm">{subtask.name}</p>
                  <p className="text-xs text-gray-500">{subtask.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Attachments</h4>
            <input type="file" onChange={handleFileUpload} className="mb-2" />
            <div className="space-y-2">
              {attachments.map(attachment => (
                <div key={attachment._id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <a href={`http://localhost:5000/uploads/${attachment.filename}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600">{attachment.originalName}</a>
                  <button onClick={() => handleDeleteAttachment(attachment._id)} className="text-red-600">Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Comments</h4>
            <form onSubmit={handleAddComment} className="mb-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border rounded px-2 py-1"
                rows={2}
                placeholder="Add a comment..."
              />
              <button type="submit" className="mt-1 bg-indigo-600 text-white px-4 py-2 rounded">Add Comment</button>
            </form>
            <div className="space-y-2">
              {comments.map(comment => (
                <div key={comment._id} className="bg-gray-50 p-2 rounded">
                  <p className="text-sm">{comment.text}</p>
                  <p className="text-xs text-gray-500">By {comment.author.name} on {new Date(comment.createdAt).toLocaleString()}</p>
                  <button onClick={() => handleDeleteComment(comment._id)} className="text-red-600 text-xs">Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Edit Task</button>
            <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete Task</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;