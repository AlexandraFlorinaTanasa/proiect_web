// app/__tests__/TaskItem.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';


// 1. CORECTAT IMPORTUL (Folosim @)
import TaskItem from '../app/components/TaskItem';

// Date de test (Mock Data)
const taskNecompletat = {
  id: '1',
  text: 'Sarcina Test',
  category: 'Muncă',
  completed: false,
  deadline: '2025-12-25'
};

const taskCompletat = {
  ...taskNecompletat,
  completed: true
};

describe('TaskItem Component', () => {

  // 1. Testare Afișare Simplă
  it('afișează textul și categoria corect', () => {
    const mockToggle = vi.fn();
    const mockDelete = vi.fn();

    render(<TaskItem task={taskNecompletat} onToggle={mockToggle} onDelete={mockDelete} />);

    // Verificăm textul
    expect(screen.getByText('Sarcina Test')).toBeInTheDocument();
    // Verificăm categoria
    expect(screen.getByText('Muncă')).toBeInTheDocument();
  });

  // 2. Testare Stiluri (Logică Vizuală)
  it('are stilul "line-through" (tăiat) dacă este completat', () => {
    const mockToggle = vi.fn();
    const mockDelete = vi.fn();

    render(<TaskItem task={taskCompletat} onToggle={mockToggle} onDelete={mockDelete} />);

    // Căutăm elementul care conține textul
    const textElement = screen.getByText('Sarcina Test');
    
    // Verificăm clasa CSS
    expect(textElement).toHaveClass('line-through');
  });

  // 3. Testare Interacțiuni (Butoane)
  it('apelează funcția de ștergere când apăsăm X', () => {
    const mockToggle = vi.fn();
    const mockDelete = vi.fn(); 

    render(<TaskItem task={taskNecompletat} onToggle={mockToggle} onDelete={mockDelete} />);

    // 2. CORECTAT SELECTORUL: Căutăm emoji-ul ❌, nu litera X
    const deleteBtn = screen.getByText('❌');
    
    // Simulăm click
    fireEvent.click(deleteBtn);

    // Verificăm dacă spionul a fost apelat cu ID-ul corect
    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});