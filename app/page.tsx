"use client";

import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase'; 
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, addDoc, query, onSnapshot, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LogOut, FileText, Download, Upload, Share2, FileSpreadsheet, FileJson, Calendar, Clock, Inbox, WifiOff, RefreshCw } from 'lucide-react';

// Utilitare Offline
import { saveTaskOffline, getOfflineTasks, clearOfflineTasks } from '../lib/indexedDB';

// Componente locale
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import Auth from './components/Auth';
import { Task } from './components/TaskItem';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [offlineTasks, setOfflineTasks] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt'); 
  const [isSynced, setIsSynced] = useState(true);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // --- HELPER: FORMATARE DATĂ (Zi Lună An) ---
  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // 1. Gestionare Autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => { 
      setUser(u); 
      setLoading(false); 
    });
    return () => unsubscribe();
  }, []);

  // 2. Sincronizare Firestore + Detectare Conexiune
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'tasks'), where("uid", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setIsSynced(true);
        const fbTasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
        
        let combined = [...fbTasks, ...offlineTasks];
        combined.sort((a, b) => {
          if (sortBy === 'deadline') return (a.deadline || '9999').localeCompare(b.deadline || '9999');
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });
        setTasks(combined);
      },
      (error) => {
        if (error.code === 'unavailable') setIsSynced(false);
      }
    );
    return () => unsubscribe();
  }, [user, sortBy, offlineTasks]);

  // 3. Management Offline & Sincronizare Automată
  useEffect(() => {
    const loadAndSync = async () => {
      const stored = await getOfflineTasks();
      setOfflineTasks(stored);

      if (navigator.onLine && user && stored.length > 0) {
        for (const task of stored) {
          const { id, ...data } = task;
          await addDoc(collection(db, 'tasks'), data);
        }
        await clearOfflineTasks();
        setOfflineTasks([]);
      }
    };

    loadAndSync();
    window.addEventListener('online', loadAndSync);
    return () => window.removeEventListener('online', loadAndSync);
  }, [user]);

  // --- LOGICA CRUD ---
  const handleAddTask = async (taskData: any) => {
    if (!user) return;
    const newTask = { 
      ...taskData, 
      uid: user.uid, 
      completed: false, 
      createdAt: new Date().toISOString() 
    };

    if (navigator.onLine && isSynced) {
      try {
        await addDoc(collection(db, 'tasks'), newTask);
      } catch (err) {
        saveLocal(newTask);
      }
    } else {
      saveLocal(newTask);
    }
  };

  const saveLocal = async (task: any) => {
    await saveTaskOffline(task);
    setOfflineTasks(prev => [...prev, task]);
    alert("Salvat local (Offline)");
  };

  const toggleComplete = async (task: Task) => { 
    if (!task.id) return alert("Task offline - așteptați sincronizarea.");
    
    const taskRef = doc(db, 'tasks', task.id);
    const isNowCompleted = !task.completed;

    if (isNowCompleted && task.recurring && task.recurring !== 'none') {
      let date = task.deadline ? new Date(task.deadline) : new Date();
      task.recurring === 'daily' ? date.setDate(date.getDate() + 1) : date.setDate(date.getDate() + 7);
      
      const nextDate = date.toISOString().split('T')[0];
      await updateDoc(taskRef, { deadline: nextDate, completed: false });
      alert(`Următorul termen: ${getFormattedDate(nextDate)}`);
    } else {
      await updateDoc(taskRef, { completed: isNowCompleted });
    }
  };

  // --- LOGICA IMPORT / EXPORT ---
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const workbook = XLSX.read(ev.target?.result, { type: 'binary' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];
        for (const r of rows) {
          const text = r.Sarcina || r.text || r.Task;
          if (text) handleAddTask({
            text: text.toString().substring(0, 100),
            category: r.Categorie || 'Personal',
            deadline: r.Termen || '',
            recurring: r.Recurenta || 'none'
          });
        }
        alert("Import finalizat!");
      } catch { alert("Eroare import."); }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("MANAGER SARCINI 2026", 14, 20);
    autoTable(doc, {
      startY: 25,
      head: [['Sarcina', 'Categorie', 'Termen', 'Status']],
      body: tasks.map(t => [t.text, t.category, getFormattedDate(t.deadline || ""), t.completed ? 'Gata' : 'Activ']),
      headStyles: { fillColor: [0, 0, 0] }
    });
    doc.save("Raport_Sarcini.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tasks.map(t => ({
      Sarcina: t.text, Categorie: t.category, Termen: getFormattedDate(t.deadline || ""), Status: t.completed ? 'Finalizat' : 'Activ'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sarcini");
    XLSX.writeFile(wb, "Sarcini_2026.xlsx");
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(tasks.map(t => ({ Sarcina: t.text, Categorie: t.category, Termen: getFormattedDate(t.deadline || "") })));
    const blob = new Blob([XLSX.utils.sheet_to_csv(ws)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sarcini.csv'; a.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sarcini.json'; a.click();
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black bg-[#F1F5F9] italic">ÎNCĂRCARE...</div>;
  if (!user) return <Auth />;

  return (
    <main className="min-h-screen bg-[#F1F5F9] py-12 px-4 text-slate-900">
      <div className="max-w-2xl mx-auto">
        
        {/* Sync Indicator */}
        <div className="mb-6 flex justify-center">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
            isSynced ? 'bg-green-100 text-green-600 border-green-200' : 'bg-amber-100 text-amber-600 border-amber-200 animate-pulse'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-green-500' : 'bg-amber-500'}`} />
            {isSynced ? "Cloud Sync: Activ" : "Cloud Sync: Deconectat (Offline)"}
          </div>
        </div>

        <header className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-black tracking-tighter text-black">Task Manager</h1>
          <button onClick={() => signOut(auth)} className="p-4 bg-white rounded-2xl shadow-sm hover:text-red-600 transition-all border border-slate-100"><LogOut size={24}/></button>
        </header>

        <TaskInput onAddTask={handleAddTask} />

        <div className="flex justify-between items-center my-8 px-2 font-black uppercase text-[10px] text-slate-400">
          <span>Sortează</span>
          <div className="flex gap-2">
            <button onClick={() => setSortBy('createdAt')} className={`px-4 py-2 rounded-xl ${sortBy === 'createdAt' ? 'bg-black text-white' : 'bg-white'}`}>Recente</button>
            <button onClick={() => setSortBy('deadline')} className={`px-4 py-2 rounded-xl ${sortBy === 'deadline' ? 'bg-black text-white' : 'bg-white'}`}>Deadline</button>
          </div>
        </div>

        <TaskList tasks={tasks} onToggle={toggleComplete} onDelete={(id) => deleteDoc(doc(db, 'tasks', id))} onReorder={setTasks} />

        <div className="mt-20 bg-white p-10 rounded-[50px] shadow-2xl border border-white">
          <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-2 text-black"><Share2 size={24} /> Administrare Date</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-black">
            <button onClick={exportPDF} className="flex flex-col items-center gap-2 p-5 bg-slate-50 rounded-3xl hover:bg-black group hover:text-white text-red-500 transition-all"><FileText size={20} /><span className="text-[10px] font-black">PDF</span></button>
            <button onClick={exportExcel} className="flex flex-col items-center gap-2 p-5 bg-slate-50 rounded-3xl hover:bg-black group hover:text-white text-green-600 transition-all"><FileSpreadsheet size={20} /><span className="text-[10px] font-black">EXCEL</span></button>
            <button onClick={exportCSV} className="flex flex-col items-center gap-2 p-5 bg-slate-50 rounded-3xl hover:bg-black group hover:text-white text-blue-600 transition-all"><Download size={20} /><span className="text-[10px] font-black">CSV</span></button>
            <button onClick={exportJSON} className="flex flex-col items-center gap-2 p-5 bg-slate-50 rounded-3xl hover:bg-black group hover:text-white text-purple-600 transition-all"><FileJson size={20} /><span className="text-[10px] font-black">JSON</span></button>
          </div>
          <button onClick={() => csvInputRef.current?.click()} className="w-full p-6 bg-black text-white rounded-[30px] font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition shadow-xl uppercase">
            <Upload size={24}/> Importă din CSV
          </button>
          <input type="file" ref={csvInputRef} className="hidden" accept=".csv" onChange={handleImportCSV} />
        </div>
      </div>
    </main>
  );
}