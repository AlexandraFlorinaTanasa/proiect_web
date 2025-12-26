// app/__tests__/TaskInput.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskInput from '../components/TaskInput'; 

describe('TaskInput Component', () => {
  it('randează input-ul și butonul', () => {
    const mockHandler = vi.fn();
    render(<TaskInput onAddTask={mockHandler} />);
    
    // Acum textele se potrivesc
    expect(screen.getByPlaceholderText(/Adaugă o sarcină nouă.../i)).toBeInTheDocument();
    expect(screen.getByText(/Adaugă Sarcina/i)).toBeInTheDocument();
  });

  it('permite utilizatorului să scrie', () => {
    const mockHandler = vi.fn();
    render(<TaskInput onAddTask={mockHandler} />);
    
    const input = screen.getByPlaceholderText(/Adaugă o sarcină nouă.../i);
    fireEvent.change(input, { target: { value: 'Sarcina de test' } });
    
    expect(input.value).toBe('Sarcina de test');
  });

  it('NU apelează funcția dacă textul este gol', () => {
    const mockHandler = vi.fn(); 
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<TaskInput onAddTask={mockHandler} />);
    
    const button = screen.getByText(/Adaugă Sarcina/i);
    fireEvent.click(button);

    expect(mockHandler).not.toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith("Te rugăm să introduci un text pentru sarcină.");
    
    alertMock.mockRestore(); 
  });
});