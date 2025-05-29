import { cargarClientes } from './clientes.js';
import { cargarCamiones } from './camiones.js';
import { cargarDiasEntrega } from './dias_entrega.js';
import { cargarRepartos } from './camiones_clientes.js';

async function cargarContenido(seccion) {
  const contenido = document.getElementById("contenido-container");

  if (!contenido) {
    console.error("❌ Error: No se encontró #contenido-container en el DOM.");
    return;
  }

  try {
    // Hacer fetch de la sección correspondiente
    const respuesta = await fetch(`partials/${seccion}.html`);
    if (!respuesta.ok)
      throw new Error(
        `Error ${respuesta.status}: No se pudo cargar ${seccion}.html`
      );

    // Insertar el HTML de la sección en contenido-container
    contenido.innerHTML = await respuesta.text();

    // Si la sección es "clientes", intentar ejecutar cargarClientes si existe
    if (seccion === "clientes") {
      cargarClientes();
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
  }
});
