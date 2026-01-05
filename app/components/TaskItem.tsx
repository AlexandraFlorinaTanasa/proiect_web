'use client';

import React from 'react';
import { Trash2, Calendar, RefreshCcw } from 'lucide-react';

// app/components/TaskItem.ts
export interface Task {
  id: string;
  text: string;
  category: string;
  recurring: 'none' | 'daily' | 'weekly';
  deadline?: string; // Observă semnul întrebării (poate fi undefined)
  completed: boolean;
  uid: string;
  createdAt: string;
}

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  
  const getCategoryColor = (cat: string) => {
    switch(cat) {
        case 'Muncă': return 'bg-blue-100 text-blue-800';
        case 'Cumpărături': return 'bg-purple-100 text-purple-800';
        case 'Facultate': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateRO = (dateString?: string) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('ro-RO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
      });
  };
  
  return (
    <div className={`group bg-white p-5 rounded-[28px] shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md ${task.completed ? 'bg-gray-50 opacity-60' : ''}`}>
      
      <div className="flex items-start gap-4 cursor-pointer flex-1" onClick={() => onToggle(task)}>
        <input 
            type="checkbox" 
            checked={task.completed} 
            readOnly 
            className="mt-1 w-6 h-6 border-2 border-gray-300 text-black rounded-full accent-black cursor-pointer"
        />
        
        <div className="flex flex-col">
            <span className={`text-xl font-bold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.text}
            </span>
            
            <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${getCategoryColor(task.category)}`}>
                    {task.category}
                </span>
                
                {task.recurring !== 'none' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-orange-100 text-orange-700">
                    <RefreshCcw size={10} /> {task.recurring === 'daily' ? 'Zilnic' : 'Săptămânal'}
                  </span>
                )}

                {task.deadline && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 font-bold">
                        <Calendar size={14} /> {formatDateRO(task.deadline)}
                    </span>
                )}
            </div>
        </div>
      </div>

      // components/TaskItem.tsx (sau TaskList.tsx, depinde unde ai definit rândul)

<button
  onClick={() => onDelete(task.id)}
  aria-label="Șterge sarcina" // <--- ADAUGĂ ACEASTĂ LINIE
  className="text-gray-300 hover:text-red-500 p-3 rounded-2xl transition opacity-0 group-hover:opacity-100"
>
  <Trash2 size={22} />
</button>
    </div>
  );
}