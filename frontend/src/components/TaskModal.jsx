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
  const [assignee, setAssignee] = useState(
    task.assignee 
      ? (typeof task.assignee === 'string' ? task.assignee : task.assignee._id) 
      : ''
  );
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [list, setList] = useState(typeof task.list === 'string' ? task.list : task.list._id);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLogId, setCurrentLogId] = useState(null);
  const [newSubtaskName, setNewSubtaskName] = useState('');

  console.log('TaskModal - task.assignee:', task.assignee, 'assignee state:', assignee);

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
      console.log('Saving task with data:', updatedTask);
      console.log('Assignee value:', assignee, 'Type:', typeof assignee);
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={onClose}>
      <div className="relative top-8 mx-auto p-6 w-11/12 max-w-4xl" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-xl shadow-xl border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-bold text-gray-900 border-0 border-b-2 border-blue-500 focus:ring-0 focus:border-blue-600 px-0 py-1 w-full bg-transparent"
                  placeholder="Task name"
                />
              ) : (
                <h3 className="text-2xl font-bold text-gray-900">{task.name}</h3>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Edit Mode */}
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                    rows={3}
                    placeholder="Describe this task..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-2">
                      Assignee
                    </label>
                    <select
                      id="assignee"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="">Unassigned</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="todo">To Do</option>
                      <option value="inprogress">In Progress</option>
                      <option value="await_release">Await Release</option>
                      <option value="in_review">In Review</option>
                      <option value="reopened">Reopened</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="list" className="block text-sm font-medium text-gray-700 mb-2">
                      List
                    </label>
                    <select
                      id="list"
                      value={list}
                      onChange={(e) => setList(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      {lists.map(l => (
                        <option key={l._id} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                {/* Task Overview */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{task.description || 'No description provided'}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      priority === 'high' ? 'bg-red-100 text-red-800' :
                      priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </span>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      status === 'done' ? 'bg-green-100 text-green-800' :
                      status === 'inprogress' ? 'bg-blue-100 text-blue-800' :
                      status === 'await_release' ? 'bg-blue-100 text-blue-800' :
                      status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                      status === 'reopened' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {status === 'todo' ? 'To Do' :
                       status === 'inprogress' ? 'In Progress' :
                       status === 'await_release' ? 'Await Release' :
                       status === 'in_review' ? 'In Review' :
                       status === 'reopened' ? 'Reopened' :
                       status === 'done' ? 'Done' : status}
                    </span>
                    
                    {task.assignee && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Assigned to {task.assignee.name}
                      </span>
                    )}
                    
                    {dueDate && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Due {new Date(dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time Tracking */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Time Tracking</h4>
                    {isTracking ? (
                      <button 
                        onClick={handleStopTracking} 
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        Stop Tracking
                      </button>
                    ) : (
                      <button 
                        onClick={handleStartTracking} 
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3 7.5A9.5 9.5 0 1121.5 12 9.5 9.5 0 0112 2.5z" />
                        </svg>
                        Start Tracking
                      </button>
                    )}
                  </div>
                  
                  {timeLogs.length > 0 && (
                    <div className="space-y-3">
                      {timeLogs.map(log => (
                        <div key={log._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">{log.user.name}</span>
                            <span className="text-sm text-gray-600">{log.duration || 'Ongoing'} minutes</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.startTime).toLocaleString()} - {log.endTime ? new Date(log.endTime).toLocaleString() : 'Ongoing'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtasks */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Subtasks</h4>
                  <form onSubmit={handleCreateSubtask} className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubtaskName}
                        onChange={(e) => setNewSubtaskName(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Add a new subtask..."
                      />
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add
                      </button>
                    </div>
                  </form>
                  
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="space-y-2">
                      {task.subtasks.map(subtask => (
                        <div key={subtask._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm text-gray-900">{subtask.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{subtask.status}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Attachments */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h4>
                  <div className="mb-4">
                    <input 
                      type="file" 
                      onChange={handleFileUpload} 
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors duration-200"
                    />
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map(attachment => (
                        <div key={attachment._id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <a 
                            href={`http://localhost:5000/uploads/${attachment.filename}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {attachment.originalName}
                          </a>
                          <button 
                            onClick={() => handleDeleteAttachment(attachment._id)} 
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Comments</h4>
                  <form onSubmit={handleAddComment} className="mb-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                      rows={3}
                      placeholder="Add a comment..."
                    />
                    <div className="flex justify-end mt-2">
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Add Comment
                      </button>
                    </div>
                  </form>
                  
                  {comments.length > 0 && (
                    <div className="space-y-4">
                      {comments.map(comment => (
                        <div key={comment._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-900 mb-2">{comment.text}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              By {comment.author.name} on {new Date(comment.createdAt).toLocaleString()}
                            </p>
                            <button 
                              onClick={() => handleDeleteComment(comment._id)} 
                              className="text-red-600 hover:text-red-700 text-xs font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!isEditing && (
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button 
                onClick={() => setIsEditing(true)} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Task
              </button>
              
              <button 
                onClick={handleDelete} 
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;