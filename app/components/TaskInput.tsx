'use client';

import React, { useState } from 'react';
import DatePicker, { registerLocale } from "react-datepicker";
import { ro } from 'date-fns/locale/ro';
import "react-datepicker/dist/react-datepicker.css";
import { Plus } from 'lucide-react';

registerLocale('ro', ro);

interface TaskInputProps {
  onAddTask: (task: { text: string; category: string; deadline: string; recurring: string; }) => void;
}

export default function TaskInput({ onAddTask }: TaskInputProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Personal');
  const [recurring, setRecurring] = useState('none');
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
        formattedDeadline = deadlineDate.toISOString().split('T')[0];
    }

    onAddTask({ text, category, deadline: formattedDeadline, recurring });
    setText('');
    setDeadlineDate(null);
    setRecurring('none');
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
<div className="flex gap-3"></div>
        
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

           
<div className="flex gap-2">
          <select 
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
               className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
              <option value="none">Fără</option>
              <option value="daily">Zilnic</option>
              <option value="weekly">Săptămânal</option>
          </select>
<div className="flex gap-1"></div>
          <DatePicker 
              selected={deadlineDate}
              onChange={(date: Date | null) => setDeadlineDate(date)}
              locale="ro"
              dateFormat="dd/MM/yyyy"
              placeholderText="Selectează data"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              wrapperClassName="w-full"
          />
      </div>
</div>

      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg transform active:scale-95"
        >
          Adaugă Sarcina
      </button>
      
    </form>
  );
}