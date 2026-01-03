'use client';

import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface TaskData {
  text: string;
  category: string;
  deadline: string;
}

interface TaskInputProps {
  onAddTask: (task: TaskData) => void;
}


export default function TaskInput({ onAddTask }: TaskInputProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Personal');
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (text.trim().length < 1) {
        alert("Te rugăm să introduci un text pentru sarcină.");
        return;
    }
    if (text.length > 100) {
        alert("Textul este prea lung (max 100 caractere).");
        return;
    }

    let formattedDeadline = '';
    if (deadlineDate) {
        const year = deadlineDate.getFullYear();
        const month = String(deadlineDate.getMonth() + 1).padStart(2, '0');
        const day = String(deadlineDate.getDate()).padStart(2, '0');
        formattedDeadline = `${year}-${month}-${day}`;
    }

    onAddTask({ 
        text, 
        category, 
        deadline: formattedDeadline 
    });

    setText('');
    setDeadlineDate(null);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-100">
      <div className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Adaugă o sarcină nouă..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-700"
        />

        <div className="flex gap-3">
            <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-3 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
                <option value="Personal">Personal</option>
                <option value="Muncă">Muncă</option>
                <option value="Cumpărături">Cumpărături</option>
                <option value="Facultate">Facultate</option>
            </select>

            <div className="flex-1">
                <DatePicker 
                    selected={deadlineDate}
                    onChange={(date: Date | null) => setDeadlineDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Selectează data"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
            </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg transform active:scale-95"
        >
          Adaugă Sarcina
        </button>
      </div>
    </form>
  );
}