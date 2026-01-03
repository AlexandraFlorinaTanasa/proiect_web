// app/components/TaskList.tsx
'use client';

import React, { useEffect, useState } from 'react';
// Importăm componentele și tipurile necesare pentru Drag & Drop
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import TaskItem from './TaskItem';

// Definim tipurile (trebuie să coincidă cu ce ai în TaskItem)
interface Task {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  deadline?: string;
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
}

export default function TaskList({ tasks, onToggle, onDelete, onReorder }: TaskListProps) {
  // Hack pentru Next.js: Drag & Drop are nevoie să știe că rulează în browser
  // Altfel primești eroare de "Hydration failed"
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  const handleDragEnd = (result: DropResult) => {
    // Dacă am dat drumul la task în afara listei, nu facem nimic
    if (!result.destination) return;

    // Copiem lista curentă
    const items = Array.from(tasks);
    // Scoatem elementul de la poziția veche
    const [reorderedItem] = items.splice(result.source.index, 1);
    // Îl introducem la poziția nouă
    items.splice(result.destination.index, 0, reorderedItem);

    // Trimitem noua listă către părinte (page.tsx)
    onReorder(items);
  };

  // Dacă lista e goală, afișăm mesajul prietenos
  if (tasks.length === 0) {
    return (
        <div className="text-center text-gray-400 mt-10">
            <p>Nu ai nicio sarcină.</p>
            <p className="text-sm">Adaugă una nouă mai sus! 👆</p>
        </div>
    );
  }

  // Dacă nu s-a încărcat încă în browser, nu randăm DragDropContext (previne erori vizuale)
  if (!enabled) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className="w-full max-w-lg space-y-3"
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    // Adăugăm un stil inline pentru a evita problemele de suprapunere în timpul drag-ului
                    style={{ ...provided.draggableProps.style }}
                  >
                    <TaskItem 
                        task={task} 
                        onToggle={onToggle} 
                        onDelete={onDelete} 
                    />
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