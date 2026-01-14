import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserTasks, updateTask } from '../api/tasks';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Draggable Task Component
const DraggableTask = ({ task, isAdmin }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isAdmin ? listeners : {})}
      className={`bg-white rounded shadow-sm p-3 border ${isAdmin ? 'cursor-move hover:shadow-md transition-shadow' : 'cursor-default'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {task.name}
        </h4>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
        {task.description}
      </p>
      <div className="text-xs text-gray-500 space-y-1">
        <p>Project: {task.list?.project?.name || 'Unknown'}</p>
        <p>List: {task.list?.name || 'Unknown'}</p>
        <p>Due: {formatDate(task.dueDate)}</p>
      </div>
    </div>
  );
};

// Droppable Column Component
const DroppableColumn = ({ statusKey, config, tasks, isAdmin }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: statusKey,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 ${config.color} p-4 transition-colors ${
        isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
      }`}
    >
      <div className={`rounded-t ${config.headerColor} px-3 py-2 mb-3`}>
        <h3 className="font-semibold text-gray-800 text-sm">
          {config.label} ({tasks.length})
        </h3>
      </div>
      <div className="space-y-3 min-h-[200px]">
        <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <DraggableTask key={task._id} task={task} isAdmin={isAdmin} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-300 rounded">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

const Timeline = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // Status configuration
  const statusConfig = {
    todo: { label: 'To Do', color: 'bg-gray-100 border-gray-300', headerColor: 'bg-gray-200' },
    reopened: { label: 'Reopened', color: 'bg-red-100 border-red-300', headerColor: 'bg-red-200' },
    inprogress: { label: 'In Progress', color: 'bg-yellow-100 border-yellow-300', headerColor: 'bg-yellow-200' },
    await_release: { label: 'Await Release', color: 'bg-blue-100 border-blue-300', headerColor: 'bg-blue-200' },
    in_review: { label: 'In Review', color: 'bg-blue-100 border-blue-300', headerColor: 'bg-blue-200' },
    closed: { label: 'Closed', color: 'bg-green-100 border-green-300', headerColor: 'bg-green-200' }
  };

  // Filter tasks based on user role
  const filteredTasks = user?.role === 'admin' ? tasks : tasks.filter(task => task.assignee?._id === user?._id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If dropped on the same container, do nothing
    if (activeId === overId) return;

    // Find the task being moved
    const activeTask = filteredTasks.find(task => task._id === activeId);
    if (!activeTask) return;

    // Determine new status based on drop target
    let newStatus = activeTask.status;
    if (Object.keys(statusConfig).includes(overId)) {
      newStatus = overId;
    }

    if (newStatus === activeTask.status) return;

    try {
      // Update task status via API
      await updateTask(activeId, { status: newStatus });

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === activeId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }

    setActiveId(null);
  };

  const fetchTasks = async () => {
    try {
      console.log('Fetching user tasks...');
      console.log('User context:', user);
      const data = await getUserTasks();
      console.log('Received tasks:', data);
      console.log('Number of tasks:', data.length);
      setTasks(data);

      // Extract unique projects
      const uniqueProjects = [...new Set(data.map(task => task.list?.project).filter(Boolean))];
      setProjects(uniqueProjects);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User is logged in, fetching tasks...');
      fetchTasks();
    } else {
      console.log('No user logged in');
    }
  }, [user]);

  // Group tasks by status
  const tasksByStatus = filteredTasks.reduce((acc, task) => {
    const status = task.status || 'todo';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {});

  // Get status counts
  const getStatusCount = (status) => tasksByStatus[status]?.length || 0;

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Project Timeline</h1>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Status Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {Object.entries(statusConfig).map(([statusKey, config]) => (
              <DroppableColumn
                key={statusKey}
                statusKey={statusKey}
                config={config}
                tasks={tasksByStatus[statusKey] || []}
                isAdmin={user?.role === 'admin'}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white rounded shadow-lg p-3 border rotate-3 opacity-90">
                {(() => {
                  const task = filteredTasks.find(t => t._id === activeId);
                  return task ? (
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{task.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Summary Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredTasks.length}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getStatusCount('closed')}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{getStatusCount('inprogress')}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{getStatusCount('reopened')}</div>
              <div className="text-sm text-gray-600">Reopened</div>
            </div>
          </div>
        </div>

        {filteredTasks.length === 0 && (
          <div className="bg-white shadow rounded-lg p-6 text-center mt-6">
            <p className="text-gray-500">No tasks assigned to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;