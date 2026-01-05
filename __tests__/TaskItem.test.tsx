// app/__tests__/TaskItem.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskItem, { Task } from '../app/components/TaskItem';

const mockTask: Task = {
  id: '1',
  text: 'Sarcina Test',
  category: 'Work',
  completed: false,
  deadline: '2026-12-25',
  recurring: 'daily',
  uid: 'test-user',
  createdAt: new Date().toISOString()
};

describe('TaskItem Component', () => {
  it('afișează toate elementele inclusiv recurența', () => {
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Sarcina Test')).toBeInTheDocument();
    expect(screen.getByText('Zilnic')).toBeInTheDocument(); // Verificăm recurența
  });

  it('apelează onDelete cu ID-ul corect', () => {
    const mockDelete = vi.fn();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={mockDelete} />);

    // Căutăm butonul după aria-label (trebuie adăugat în componentă)
    const deleteBtn = screen.getByLabelText('Șterge sarcina');
    fireEvent.click(deleteBtn);

    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});