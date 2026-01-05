"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { RefreshCw, Calendar, GripVertical, Trash2, Check } from 'lucide-react';
import { Task } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
}

export default function TaskList({ tasks, onToggle, onDelete, onReorder }: TaskListProps) {
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onReorder(items);
  };

  // FUNCȚIE FORMATĂRI DATĂ: Zi Lună An (ex: 05 Ian 2026)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Work': return 'bg-blue-100 text-blue-700';
      case 'Shopping': return 'bg-orange-100 text-orange-700';
      default: return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {tasks.map((task, index) => (
              <Draggable key={task.id || `temp-${index}`} draggableId={task.id || `temp-${index}`} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center justify-between p-4 bg-white rounded-[20px] border border-slate-100 shadow-sm transition-all ${
                      task.completed ? 'opacity-60 bg-slate-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div {...provided.dragHandleProps} className="text-slate-300 cursor-grab active:cursor-grabbing">
                        <GripVertical size={18} />
                      </div>

                      {/* BIFA PĂTRATĂ NEAGRĂ */}
                      <button
                        onClick={() => onToggle(task)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          task.completed 
                            ? 'bg-black border-black text-white' 
                            : 'bg-white border-slate-200 text-transparent hover:border-black'
                        }`}
                      >
                        {task.completed && <Check size={16} strokeWidth={4} />}
                      </button>

                      <div className="flex flex-col">
                        <span className={`font-bold text-base tracking-tight leading-tight ${
                          task.completed ? 'line-through text-slate-400' : 'text-black'
                        }`}>
                          {task.text}
                        </span>
                        
                        <div className="flex gap-2 mt-1 items-center flex-wrap">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${getCategoryStyle(task.category)}`}>
                            {task.category}
                          </span>

                          {/* INDICATOR RECURENȚĂ */}
                          {task.recurring && task.recurring !== 'none' && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest bg-green-100 text-green-700 flex items-center gap-1">
                              <RefreshCw size={8} /> 
                              {task.recurring === 'daily' ? 'Zilnic' : 'Săptămânal'}
                            </span>
                          )}

                          {/* DATA FORMATATĂ: ZI LUNĂ AN */}
                          {task.deadline && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest bg-slate-100 text-slate-500 flex items-center gap-1">
                              <Calendar size={10} /> 
                              {formatDate(task.deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}