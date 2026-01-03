"use client";

import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Importuri Biblioteci Externe
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Importuri Componente
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Auth from './components/Auth';
// Importăm și interfața Task din TaskItem
import { Task } from './components/TaskItem';

import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc,
  where
} from 'firebase/firestore';


export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // 1. Verificăm Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Citire Date + SORTARE
  useEffect(() => {
    if (!user) {
        setTasks([]); 
        return; 
    }

    const q = query(
      collection(db, 'tasks'), 
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let tasksArr: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksArr.push({ ...doc.data(), id: doc.id } as Task);
      });

      tasksArr.sort((a, b) => {
        if (sortBy === 'deadline') {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return a.deadline.localeCompare(b.deadline);
        } else {
            return (b.createdAt || '').localeCompare(a.createdAt || '');
        }
      });

      setTasks(tasksArr);
    });

    return () => unsubscribe();
  }, [user, sortBy]);

  // --- CRUD Functions ---

  const handleAddTask = async (taskData: any) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), {
      ...taskData,
      uid: user.uid,
      completed: false,
      createdAt: new Date().toISOString(),
    });
  };

  const toggleComplete = async (task: Task) => { 
    await updateDoc(doc(db, 'tasks', task.id), { completed: !task.completed });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const handleReorder = (newTasksOrder: Task[]) => {
    setTasks(newTasksOrder);
  };

  const handleLogout = async () => {
      await signOut(auth);
  };

  // --- FUNCȚII AUXILIARE ---
  const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      return dateString.split('-').reverse().join('/');
  };

  // --- EXPORT ---

  const handleExportJSON = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(tasks, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "sarcinile_mele.json";
    link.click();
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Sarcina,Categorie,Deadline,Status,Data Crearii\n";

    tasks.forEach(task => {
        const safeText = task.text.replace(/"/g, '""');
        const status = task.completed ? "Finalizat" : "In Asteptare";
        const prettyDeadline = formatDate(task.deadline); 

        const row = [
            `"${safeText}"`,
            task.category,
            prettyDeadline,
            status,
            task.createdAt
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "raport_sarcini.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Raport Sarcini", 14, 22);
    doc.setFontSize(11);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Sarcina", "Categorie", "Deadline", "Status"];
    const tableRows: any[] = [];

    tasks.forEach(task => {
      const prettyDeadline = task.deadline ? task.deadline.split('-').reverse().join('/') : '-';
      
      const taskData = [
        task.text,
        task.category,
        prettyDeadline,
        task.completed ? "Finalizat" : "In Asteptare",
      ];
      tableRows.push(taskData);
    });

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244] },
    });

    doc.save("raport_sarcini.pdf");
  };

  // --- IMPORT ---

  const handleImportJSON = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const importedTasks = JSON.parse(content);
          if (Array.isArray(importedTasks)) {
            let count = 0;
            for (const task of importedTasks) {
               if(task.text) {
                   await addDoc(collection(db, 'tasks'), {
                       text: task.text,
                       category: task.category || 'Personal',
                       deadline: task.deadline || '',
                       completed: task.completed || false,
                       createdAt: new Date().toISOString(),
                       uid: user.uid
                   });
                   count++;
               }
            }
            alert(`Succes: ${count} sarcini importate!`);
          }
        }
      } catch (error) {
        alert("JSON invalid.");
      }
    };
    reader.readAsText(file);
    if (event.target) event.target.value = ''; 
  };

  const handleImportExcel = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            let count = 0;
            for (const row of jsonData as any[]) {
                const text = row['Sarcina'] || row['text'];
                if (text) {
                    const isCompleted = row['Status'] === 'Finalizat' || row['completed'] === true;
                    let deadlineImport = row['Deadline'] === 'N/A' ? '' : (row['Deadline'] || '');

                    await addDoc(collection(db, 'tasks'), {
                        text: text,
                        category: row['Categorie'] || row['category'] || 'Personal',
                        deadline: deadlineImport,
                        completed: isCompleted,
                        createdAt: new Date().toISOString(),
                        uid: user.uid
                    });
                    count++;
                }
            }
            alert(`Succes: ${count} sarcini importate din Excel!`);
        } catch (err) {
            alert("Eroare la citirea Excel.");
        }
    };
    reader.readAsArrayBuffer(file);
    if (event.target) event.target.value = '';
  };

  // --- RENDER ---

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-600">Se încarcă...</div>;
  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center font-sans pb-20">
      
      {/* Header */}
      <div className="w-full max-w-lg flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Task Manager
        </h1>
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">{user.email}</span>
            <button 
                onClick={handleLogout}
                className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded bg-white hover:bg-red-50 transition"
            >
                Ieșire
            </button>
        </div>
      </div>
      
      <TaskInput onAddTask={handleAddTask} />

      {/* Controale Sortare */}
      <div className="w-full max-w-lg flex justify-between items-center mb-4 px-2">
          <span className="text-gray-500 text-sm font-medium">Sortează:</span>
          <div className="flex gap-2">
              <button 
                onClick={() => setSortBy('createdAt')} 
                className={`px-3 py-1 rounded-md text-sm transition ${sortBy === 'createdAt' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Recente
              </button>
              <button 
                onClick={() => setSortBy('deadline')} 
                className={`px-3 py-1 rounded-md text-sm transition ${sortBy === 'deadline' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Deadline
              </button>
          </div>
      </div>

      <div className="w-full max-w-lg text-right mb-2">
        <span className="text-xs text-gray-400">
          Tip: Trage de sarcini pentru a le reordona
        </span>
      </div>

      <TaskList 
        tasks={tasks} 
        onToggle={toggleComplete} 
        onDelete={deleteTask} 
        onReorder={handleReorder}
      />

      {/* --- ZONA DE EXPORT / IMPORT --- */}
      <div className="mt-12 w-full max-w-lg pt-6 border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-500 mb-3 text-center uppercase tracking-wider">
            Zona de Date
        </h3>
        
        {/* Inputuri ascunse */}
        <input type="file" accept=".json" ref={jsonInputRef} style={{ display: 'none' }} onChange={handleImportJSON} />
        <input type="file" accept=".xlsx, .xls, .csv" ref={excelInputRef} style={{ display: 'none' }} onChange={handleImportExcel} />

        <div className="grid grid-cols-2 gap-3">
            {/* Rândul 1: Exporturi */}
            <button onClick={handleExportJSON} className="flex justify-center items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition">
                ⬇️ Export JSON
            </button>
            <button onClick={handleExportCSV} className="flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition">
                📊 Export Excel
            </button>

             {/* Rândul 2: PDF */}
            <button onClick={handleExportPDF} className="col-span-2 flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition font-bold">
                📄 Export Raport PDF
            </button>
          
        </div>
      </div>
      
    </div>
  );
}