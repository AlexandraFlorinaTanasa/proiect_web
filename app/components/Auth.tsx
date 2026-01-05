// app/components/Auth.tsx
'use client'; // <--- 1. OBLIGATORIU pentru butoane și input-uri

import React, { useState } from 'react';
// 2. Ajustăm calea: ieșim din 'components' (..), ieșim din 'app' (..), găsim 'firebase'
import { auth } from '@/lib/firebase'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 3. Adăugăm tipul evenimentului pentru TypeScript (React.FormEvent)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      // Simplificare erori pentru utilizator
      if (err.code === 'auth/invalid-credential') {
          setError('Email sau parolă incorectă.');
      } else if (err.code === 'auth/email-already-in-use') {
          setError('Acest email este deja folosit.');
      } else if (err.code === 'auth/weak-password') {
          setError('Parola trebuie să aibă minim 6 caractere.');
      } else {
          setError(err.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isRegistering ? 'Creează cont' : 'Autentificare'}
        </h2>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mt-1 text-black"
              placeholder="nume@exemplu.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parolă</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mt-1 text-black"
              placeholder="******"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            {isRegistering ? 'Înregistrează-te' : 'Loghează-te'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isRegistering ? 'Ai deja cont?' : 'Nu ai cont?'}
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 font-bold ml-1 hover:underline"
          >
            {isRegistering ? 'Loghează-te' : 'Creează unul'}
          </button>
        </p>
      </div>
    </div>
  );
}