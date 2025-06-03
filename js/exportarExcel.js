const XLSX = require('xlsx');

// Datos de ejemplo, reemplaza por tus datos reales
const data = [
  { nombre: 'Juan', email: 'juan@email.com' },
  { nombre: 'Ana', email: 'ana@email.com' }
];

// Convierte los datos a una hoja de Excel
const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');

// Guarda el archivo Excel
XLSX.writeFile(workbook, 'clientes.xlsx');