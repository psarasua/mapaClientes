const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

// Configura tu Supabase
const supabaseUrl = 'https://<TU-PROYECTO>.supabase.co';
const supabaseKey = '<TU-API-KEY>';
const supabase = createClient(supabaseUrl, supabaseKey);

// Lee el archivo Excel
const workbook = XLSX.readFile('clientes.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

// Inserta los datos en Supabase
async function cargarDatos() {
  const { data: inserted, error } = await supabase
    .from('clientes') // Cambia por el nombre de tu tabla
    .insert(data);

  if (error) {
    console.error('Error al insertar:', error);
  } else {
    console.log('Datos insertados:', inserted);
  }
}

cargarDatos();