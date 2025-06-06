import { cargarClientes } from './clientes.js';
import { cargarCamiones } from './camiones.js';
import { cargarDiasEntrega } from './dias_entrega.js';
import { cargarRepartos } from './camiones_clientes.js';
import { supabase } from './supabaseConfig.js';

let excelData = [];

async function cargarContenido(seccion) {
  const contenido = document.getElementById("contenido-container");

  if (!contenido) {
    console.error("❌ Error: No se encontró #contenido-container en el DOM.");
    return;
  }

  try {
    const respuesta = await fetch(`partials/${seccion}.html`);
    if (!respuesta.ok)
      throw new Error(
        `Error ${respuesta.status}: No se pudo cargar ${seccion}.html`
      );

    contenido.innerHTML = await respuesta.text();

    // Asigna listeners solo si es cargarExcel
    if (seccion === "cargarExcel") {
      const excelFile = document.getElementById('excelFile');
      const uploadBtn = document.getElementById('uploadBtn');
      if (excelFile && uploadBtn) {
        excelFile.addEventListener('change', handleFile, false);
        uploadBtn.addEventListener('click', subirASupabase);
      }
    }

    // Si la sección es "clientes", intentar ejecutar cargarClientes si existe
    if (seccion === "clientes") {
      cargarClientes();
      // Asigna los eventos aquí
      const btnAnterior = document.getElementById("anterior");
      const btnSiguiente = document.getElementById("siguiente");
      if (btnAnterior && btnSiguiente) {
        btnAnterior.onclick = () => {
          if (paginaActual > 1) {
            paginaActual--;
            cargarClientes(paginaActual);
          }
        };
        btnSiguiente.onclick = () => {
          paginaActual++;
          cargarClientes(paginaActual);
        };
      }
    }
    if (seccion === "camiones") {
      cargarCamiones();
    }
    if (seccion === "dias_entrega") {
      cargarDiasEntrega();
    }
    if (seccion === "camiones_clientes") {
      cargarRepartos();
    }
     
  } catch (error) {
    contenido.innerHTML = "<h2>Error</h2><p>No se pudo cargar la sección.</p>";
    console.error("❌ Error al cargar la sección:", error);
  }
}

// Hacer la función global si se necesita en otros scripts
window.cargarContenido = cargarContenido;

// Manejar clicks en el menú de navegación
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      // Usa data-seccion en vez de analizar onclick
      const seccion = link.dataset.seccion;
      if (seccion) {
        cargarContenido(seccion);
        // Actualiza el hash de la URL para navegación directa
        window.location.hash = seccion;
      }
    });
  });

  // Si el usuario llega directamente a una sección con # en la URL, cargarla
  const hash = window.location.hash.replace("#", "");
  if (hash) {
    cargarContenido(hash);
  } else {
    cargarContenido('cargarExcel');
  }
});

// Define las columnas requeridas según tu tabla en Supabase
const columnasRequeridas = ['id','nombre', 'razon','codigo_alternativo', 'direccion','telefono','rut','x','y']; // Ajusta según tus necesidades

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    excelData = XLSX.utils.sheet_to_json(worksheet);

    // Validar columnas
    if (excelData.length === 0) {
      document.getElementById('mensaje').innerHTML = `<div class="alert alert-warning">El archivo está vacío.</div>`;
      return;
    }
    const columnasArchivo = Object.keys(excelData[0]);
   

    // Vista previa de los primeros 5 registros
    let preview = '<table class="table table-sm table-bordered mt-3"><thead><tr>';
    columnasArchivo.forEach(col => preview += `<th>${col}</th>`);
    preview += '</tr></thead><tbody>';
    excelData.slice(0, 5).forEach(row => {
      preview += '<tr>';
      columnasArchivo.forEach(col => preview += `<td>${row[col] ?? ''}</td>`);
      preview += '</tr>';
    });
    preview += '</tbody></table>';

    document.getElementById('mensaje').innerHTML = `
      <div class="alert alert-success">Archivo cargado correctamente (${excelData.length} registros).</div>
      <div><b>Vista previa:</b> ${preview}</div>
    `;
  };
  reader.readAsArrayBuffer(file);
}

function validarDatosExcel(data, columnasNumericas) {
  const errores = [];
  data.forEach((row, idx) => {
    columnasNumericas.forEach(col => {
      if (row[col] !== undefined && typeof row[col] === 'string') {
        // Quita puntos y reemplaza coma por punto
        const limpio = row[col].replace(/\./g, '').replace(',', '.');
        if (isNaN(Number(limpio))) {
          errores.push(`Fila ${idx + 2}: columna "${col}" valor "${row[col]}" no es numérico`);
        }
      }
    });
  });
  return errores;
}

async function subirASupabase() {
  if (!excelData.length) {
    document.getElementById('mensaje').innerHTML = `<div class="alert alert-warning">Primero selecciona un archivo Excel.</div>`;
    return;
  }

  // Limpia la columna rut quitando puntos y guiones
  excelData.forEach(row => {
    if (row.rut !== undefined && typeof row.rut === 'string') {
      row.rut = row.rut.replace(/\./g, '').replace(/-/g, '');
    }
  });

  // Validar datos antes de subir
  const errores = validarDatosExcel(excelData, [ 'x', 'y']);
  if (errores.length) {
    document.getElementById('mensaje').innerHTML = `<div class="alert alert-danger">${errores.join('<br>')}</div>`;
    return;
  }

  document.getElementById('mensaje').innerHTML = `<div class="alert alert-info">Subiendo datos...</div>`;
  const { error } = await supabase
    .from('clientes') // Cambia por el nombre de tu tabla
    .insert(excelData);

  if (error) {
    document.getElementById('mensaje').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
  } else {
    document.getElementById('mensaje').innerHTML = `<div class="alert alert-success">Datos subidos correctamente.</div>`;
    excelData = [];
    document.getElementById('excelFile').value = '';
  }
}
