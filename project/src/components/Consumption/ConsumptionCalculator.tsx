import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Device } from '../../types';

interface CalculatorResult {
  kwh: number;
  cost?: number | null;
}

interface Props {
  onApply: (res: CalculatorResult) => void;
  defaultPricePerKwh?: number | null;
}

export default function ConsumptionCalculator({ onApply, defaultPricePerKwh = null }: Props) {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  // Device inputs
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [manualWatts, setManualWatts] = useState<string>('');
  const [hoursUse, setHoursUse] = useState<string>('1');

  // Price
  const [pricePerKwh, setPricePerKwh] = useState<string | null>(
    defaultPricePerKwh != null ? String(defaultPricePerKwh) : null
  );

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoadingDevices(true);
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      if (!error && data) setDevices(data as Device[]);
      setLoadingDevices(false);
    };
    load();
  }, [user]);

  const selectedDevice = useMemo(() => devices.find((d) => d.id === selectedDeviceId) || null, [devices, selectedDeviceId]);

  function parseNumber(value: string) {
    const v = Number(value);
    return Number.isFinite(v) ? v : NaN;
  }

  function computeFromDevice(): number {
    const watts = selectedDevice ? Number(selectedDevice.watts) : parseNumber(manualWatts);
    const hours = parseNumber(hoursUse);
    if (Number.isNaN(watts) || Number.isNaN(hours)) return NaN;
    return (watts * hours) / 1000; // kWh
  }

  function computeCost(kwh: number): number | null {
    const price = pricePerKwh ? parseNumber(pricePerKwh) : NaN;
    if (Number.isNaN(price)) return null;
    return kwh * price;
  }

  const calculatedKwh = useMemo(() => {
    return computeFromDevice();
  }, [selectedDeviceId, manualWatts, hoursUse, selectedDevice]);

  const calculatedCost = useMemo(() => {
    const k = calculatedKwh;
    if (Number.isNaN(k)) return null;
    return computeCost(k);
  }, [calculatedKwh, pricePerKwh]);

  function handleApply() {
    if (Number.isNaN(calculatedKwh) || calculatedKwh < 0) return;
    onApply({ kwh: Number(calculatedKwh.toFixed(3)), cost: calculatedCost != null ? Number((calculatedCost).toFixed(2)) : null });
  }

  return (
    <div className="border-t pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-gray-600">Seleccionar dispositivo</label>
          <select value={selectedDeviceId || ''} onChange={(e) => setSelectedDeviceId(e.target.value || null)} className="w-full px-3 py-2 rounded-md border">
            <option value="">-- Manual / ninguno --</option>
            {loadingDevices ? <option>cargando...</option> : devices.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.watts} W</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600">Potencia (W) manual</label>
          <input type="number" value={manualWatts} onChange={(e) => setManualWatts(e.target.value)} className="w-full px-3 py-2 rounded-md border" />
        </div>
        <div>
          <label className="text-xs text-gray-600">Horas de uso</label>
          <input type="number" value={hoursUse} onChange={(e) => setHoursUse(e.target.value)} className="w-full px-3 py-2 rounded-md border" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-xs text-gray-600">Precio por kWh (opcional)</label>
          <input type="number" value={pricePerKwh ?? ''} onChange={(e) => setPricePerKwh(e.target.value || null)} className="w-full px-3 py-2 rounded-md border" />
        </div>
        <div>
          <div className="text-sm text-gray-700">kWh calculados</div>
          <div className="text-lg font-semibold">{Number.isNaN(calculatedKwh) ? '-' : Number(calculatedKwh).toFixed(3)} kWh</div>
        </div>
        <div>
          <div className="text-sm text-gray-700">Coste estimado</div>
          <div className="text-lg font-semibold">{calculatedCost == null ? '-' : `$${calculatedCost.toFixed(2)}`}</div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button type="button" onClick={handleApply} className="px-4 py-2 bg-emerald-600 text-white rounded-md">Usar resultado</button>
        <button type="button" onClick={() => { setPrevReading(''); setCurrReading(''); setMeterFactor('1'); setManualWatts(''); setHoursUse('1'); setSelectedDeviceId(null); setPricePerKwh(defaultPricePerKwh != null ? String(defaultPricePerKwh) : null); }} className="px-4 py-2 bg-gray-100 rounded-md">Limpiar</button>
      </div>
    </div>
  );
}
