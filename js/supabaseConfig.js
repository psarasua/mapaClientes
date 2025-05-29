// js/supabaseConfig.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { mostrarToast } from './mostrarToast.js';

const SUPABASE_URL = 'https://sokhrvidmsebozscwtqj.supabase.co'; // Tu URL de Supabase
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNva2hydmlkbXNlYm96c2N3dHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAyNDIsImV4cCI6MjA2MzM0NjI0Mn0.qCndk7SRgGz0h3CpKMW-NR3oTZhB5Cj3Q96fsEwXHZU'; // Tu clave pública

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mostrar toast de conexión (opcional, ya que createClient no valida conexión real)
mostrarToast("¡Cliente Supabase inicializado!", "success");

export { supabase };