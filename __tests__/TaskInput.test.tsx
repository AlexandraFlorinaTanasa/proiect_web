// app/__tests__/TaskInput.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskInput from '../app/components/TaskInput'; 

describe('TaskInput Component', () => {
  it('randează input-ul și butonul', () => {
    const mockHandler = vi.fn();
    render(<TaskInput onAddTask={mockHandler} />);
    
    // Verificăm dacă elementele apar pe ecran
    expect(screen.getByPlaceholderText(/Adaugă o sarcină nouă.../i)).toBeInTheDocument();
    expect(screen.getByText(/Adaugă Sarcina/i)).toBeInTheDocument();
  });

  it('permite utilizatorului să scrie', () => {
    const mockHandler = vi.fn();
    render(<TaskInput onAddTask={mockHandler} />);
    
    const input = screen.getByPlaceholderText(/Adaugă o sarcină nouă.../i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Sarcina de test' } });
    
    expect(input.value).toBe('Sarcina de test');
  });

  it('NU apelează funcția dacă textul este gol', () => {
    const mockHandler = vi.fn(); 
    // Mockuim fereastra de alertă ca să nu apară pop-up real în test
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<TaskInput onAddTask={mockHandler} />);
    
    const button = screen.getByText(/Adaugă Sarcina/i);
    fireEvent.click(button);

    // Ne așteptăm ca funcția de adăugare să NU fi fost chemată
    expect(mockHandler).not.toHaveBeenCalled();
    // Ne așteptăm să fi apărut alerta
    expect(alertMock).toHaveBeenCalledWith("Te rugăm să introduci un text pentru sarcină.");
    
    alertMock.mockRestore(); 
  });
});