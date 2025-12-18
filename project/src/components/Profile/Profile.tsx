import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { User as UserIcon, Upload, Loader2 } from 'lucide-react';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    full_name: profile?.full_name || '',
    birthdate: (profile as any)?.birthdate || '',
    gender: (profile as any)?.gender || '',
    height_cm: (profile as any)?.height_cm ?? '',
    weight_kg: (profile as any)?.weight_kg ?? '',
    avatar_url: (profile as any)?.avatar_url || '',
  }));

  useEffect(() => {
    setFormData({
      full_name: profile?.full_name || '',
      birthdate: (profile as any)?.birthdate || '',
      gender: (profile as any)?.gender || '',
      height_cm: (profile as any)?.height_cm ?? '',
      weight_kg: (profile as any)?.weight_kg ?? '',
      avatar_url: (profile as any)?.avatar_url || '',
    });
  }, [profile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    // Validaciones: solo JPG y <= 2MB
    const maxBytes = 2 * 1024 * 1024; // 2MB
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const isJpg = file.type === 'image/jpeg' || ext === 'jpg' || ext === 'jpeg';
    if (!isJpg) {
      setError('Solo se permiten imágenes JPG.');
      return;
    }
    if (file.size > maxBytes) {
      setError('El archivo supera el tamaño máximo de 2MB.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Generar nombre único y subir al bucket 'avatars'
      const fileExt = 'jpg';
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtener URL pública (getPublicUrl es síncrono)
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = publicData?.publicUrl || '';

      if (!publicUrl) throw new Error('No se pudo obtener la URL pública del avatar.');

      // Intentar borrar avatar antiguo (opcional)
      try {
        const prevUrl: string | undefined = (profile as any)?.avatar_url;
        if (prevUrl && prevUrl.includes('/avatars/')) {
          const oldName = prevUrl.split('/avatars/')[1];
          if (oldName && oldName !== fileName) {
            await supabase.storage.from('avatars').remove([oldName]);
          }
        }
      } catch (e) {
        // no bloquear todo por fallo al borrar antiguo
        console.warn('No se pudo borrar avatar anterior:', e);
      }

      // Actualizar perfil con nueva URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

  setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
  await refreshProfile();
  setSaved(true);
  setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      const msg = (err as any)?.message || (err as any)?.error || JSON.stringify(err);
      setError(typeof msg === 'string' ? msg : 'Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Validaciones y parsing (aceptar coma como separador decimal)
      const parseNumber = (v: any) => {
        if (v === null || v === undefined || v === '') return null;
        const s = String(v).replace(',', '.').trim();
        const n = Number(s);
        return Number.isFinite(n) ? n : NaN;
      };

      const heightParsed = parseNumber(formData.height_cm);
      const weightParsed = parseNumber(formData.weight_kg);
      if (Number.isNaN(heightParsed)) {
        setError('Altura inválida');
        setLoading(false);
        return;
      }
      if (Number.isNaN(weightParsed)) {
        setError('Peso inválido');
        setLoading(false);
        return;
      }

      const updatePayload: any = {
        full_name: formData.full_name.trim() || null,
        birthdate: formData.birthdate || null,
        gender: formData.gender || null,
        height_cm: heightParsed,
        weight_kg: weightParsed,
        avatar_url: formData.avatar_url || null,
      };

      const { error: updateError } = await supabase.from('profiles').update(updatePayload).eq('id', profile.id);
      if (updateError) throw updateError;

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      const msg = (err as any)?.message || (err as any)?.error || JSON.stringify(err);
      setError(typeof msg === 'string' ? msg : 'Error al guardar los cambios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const calcAge = (birth?: string) => {
    if (!birth) return '';
    try {
      const b = new Date(birth);
      const diff = Date.now() - b.getTime();
      const ageDt = new Date(diff);
      return Math.abs(ageDt.getUTCFullYear() - 1970).toString();
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <UserIcon className="w-8 h-8 text-emerald-600" />
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Avatar Upload Section */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover border-2 border-emerald-600"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-emerald-600" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-lg flex items-center gap-2 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Subiendo...' : 'Cambiar foto'}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Solo imágenes JPG. Máximo 2MB.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border"
              placeholder="Escribe tu nombre completo"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.birthdate')}</label>
              <input
                type="date"
                value={formData.birthdate}
                onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.age')}</label>
              <input type="text" value={calcAge(formData.birthdate)} readOnly className="w-full px-3 py-2 rounded-lg border bg-gray-50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.gender')}</label>
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 rounded-lg border">
                <option value="">{t('profile.selectGender')}</option>
                <option value="masculino">{t('profile.gender.masculino')}</option>
                <option value="femenino">{t('profile.gender.femenino')}</option>
                <option value="otro">{t('profile.gender.otro')}</option>
                <option value="prefiero_no_decir">{t('profile.gender.prefiero_no_decir')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.height')}</label>
              <div className="flex">
                <input type="number" step="0.1" value={formData.height_cm as any} onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })} className="w-full px-3 py-2 rounded-l-lg border" />
                <div className="px-3 py-2 bg-gray-50 border rounded-r-lg">cm</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.weight')}</label>
              <div className="flex">
                <input type="number" step="0.1" value={formData.weight_kg as any} onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })} className="w-full px-3 py-2 rounded-l-lg border" />
                <div className="px-3 py-2 bg-gray-50 border rounded-r-lg">kg</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading || uploading} 
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            {saved && (
              <div className="text-emerald-600 flex items-center gap-2 animate-fadeIn">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                Cambios guardados correctamente
              </div>
            )}
            {error && (
              <div className="text-red-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
