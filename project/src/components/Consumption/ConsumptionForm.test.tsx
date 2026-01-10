import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConsumptionForm from './ConsumptionForm';
import { AuthContext, AuthContextType } from '../../contexts/AuthContext';
import { LanguageContext, LanguageContextType } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

// Mock the dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

vi.mock('./ConsumptionCalculator', () => ({
  __esModule: true,
  default: ({ onApply, defaultPricePerKwh }: { onApply: (data: { kwh: number; cost?: number | null }) => void; defaultPricePerKwh: number | null }) => (
    <div>
      <button onClick={() => onApply({ kwh: 10, cost: 2 })}>Calculate</button>
      <span>Default Price: {defaultPricePerKwh}</span>
    </div>
  ),
}));

const mockUser = { id: 'user-123' } as User;
const mockT = (key: string) => {
    const translations: { [key: string]: string } = {
        'consumption.form.title': 'Registrar Consumo',
        'consumption.form.edit': 'Editar Consumo',
        'common.close': 'Cerrar',
        'consumption.date': 'Fecha',
        'consumption.notes': 'Notas',
        'devices.cancel': 'Cancelar',
        'devices.save': 'Guardar',
        'common.loading': 'Guardando...',
    };
    return translations[key] || key;
};

const authContextValue: AuthContextType = {
  user: mockUser,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  signUp: vi.fn(),
};

const languageContextValue: LanguageContextType = {
  language: 'es',
  setLanguage: vi.fn(),
  t: mockT,
};

describe('ConsumptionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.from as vi.Mock).mockReturnThis();
    (supabase.select as vi.Mock).mockReturnThis();
    (supabase.eq as vi.Mock).mockResolvedValue({ data: { price_per_kwh: 1.5 }, error: null });
    (supabase.single as vi.Mock).mockResolvedValue({ data: { price_per_kwh: 1.5 }, error: null });

    // Mock useAuth and useLanguage
    vi.mocked(require('../../contexts/AuthContext').useAuth).mockReturnValue(authContextValue);
    vi.mocked(require('../../contexts/LanguageContext').useLanguage).mockReturnValue(languageContextValue);
  });

  it('renders correctly for creating a new record', () => {
    render(<ConsumptionForm record={null} onClose={vi.fn()} />);
    expect(screen.getByText('Registrar Consumo')).toBeInTheDocument();
  });

  it('renders correctly for editing an existing record', () => {
    const record = {
      id: 1,
      date: '2024-01-01',
      kwh_consumed: 100,
      cost: 150,
      notes: 'Test notes',
      user_id: 'user-123',
      created_at: '2024-01-01T00:00:00Z',
    };
    render(<ConsumptionForm record={record} onClose={vi.fn()} />);
    expect(screen.getByText('Editar Consumo')).toBeInTheDocument();
    expect((screen.getByLabelText('Fecha') as HTMLInputElement).value).toBe('2024-01-01');
    expect((screen.getByLabelText('Notas') as HTMLInputElement).value).toBe('Test notes');
  });

  it('closes the form when the close button is clicked', () => {
    const handleClose = vi.fn();
    render(<ConsumptionForm record={null} onClose={handleClose} />);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes the form when the cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(<ConsumptionForm record={null} onClose={handleClose} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('handles applying calculated values from ConsumptionCalculator', () => {
    render(<ConsumptionForm record={null} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Calculate'));
    // The form state for kwh_consumed and cost is internal, but we can test if it's submitted correctly.
    // This part of the test is implicitly covered in the submit test.
  });

  it('submits a new record with valid data', async () => {
    const handleClose = vi.fn();
    (supabase.insert as vi.Mock).mockResolvedValue({ error: null });
    
    render(<ConsumptionForm record={null} onClose={handleClose} />);

    fireEvent.click(screen.getByText('Calculate')); // This sets kwh to 10 and cost to 2

    const dateInput = screen.getByLabelText('Fecha');
    fireEvent.change(dateInput, { target: { value: '2024-07-30' } });

    const notesInput = screen.getByLabelText('Notas');
    fireEvent.change(notesInput, { target: { value: 'New test notes' } });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('consumption_records');
      expect(supabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2024-07-30',
          kwh_consumed: 10,
          cost: 2,
          notes: 'New test notes',
          user_id: 'user-123',
        })
      );
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('updates an existing record with valid data', async () => {
    const handleClose = vi.fn();
    const record = {
      id: 1,
      date: '2024-01-01',
      kwh_consumed: 100,
      cost: 150,
      notes: 'Test notes',
      user_id: 'user-123',
      created_at: '2024-01-01T00:00:00Z',
    };
    (supabase.update as vi.Mock).mockResolvedValue({ error: null });
    
    render(<ConsumptionForm record={record} onClose={handleClose} />);

    fireEvent.click(screen.getByText('Calculate')); // This sets kwh to 10 and cost to 2

    const notesInput = screen.getByLabelText('Notas');
    fireEvent.change(notesInput, { target: { value: 'Updated notes' } });
    
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('consumption_records');
      expect(supabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          kwh_consumed: 10,
          cost: 2,
          notes: 'Updated notes',
        })
      );
      expect(supabase.eq).toHaveBeenCalledWith('id', record.id);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an alert on submit if kwh is not calculated', async () => {
    const handleClose = vi.fn();
    window.alert = vi.fn();

    render(<ConsumptionForm record={null} onClose={handleClose} />);
    
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Por favor calcula el consumo con la "Calculadora rápida" antes de guardar.');
        expect(supabase.insert).not.toHaveBeenCalled();
        expect(handleClose).not.toHaveBeenCalled();
    });
  });
});
