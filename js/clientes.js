import { supabase } from "./supabaseConfig.js";
import { abrirMapa } from "./mapa.js";

// Variables globales para la paginación
let paginaActual = 1;
const pageSize = 100;

/**
 * Carga los clientes desde Supabase y los muestra en la tabla.
 * @param {number} page - Número de página a mostrar.
 * @param {string} busqueda - Texto de búsqueda para filtrar clientes.
 */
export async function cargarClientes(page = 1, busqueda = "") {
  // Obtiene referencias a los elementos del DOM necesarios
  const spinnerContainer = document.getElementById("spinner-container");
  const progressBar = document.getElementById("progress-bar");
  const tbody = document.getElementById("clientes-body");
  const errorContainer = document.getElementById("error-container");
  const errorMessage = document.getElementById("error-message");

  // Oculta mensajes de error previos y muestra el spinner de carga
  if (errorContainer) errorContainer.style.display = "none";
  if (spinnerContainer) spinnerContainer.style.display = "block";
  if (progressBar) {
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";
  }
  if (tbody) tbody.innerHTML = "";

  let count = 0;
  try {
    // Calcula el rango de registros a solicitar según la página
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Construye la consulta a Supabase
    let query = supabase
      .from("clientes")
      .select("*", { count: "exact" })
      .eq("activo", true)
      .range(from, to);

    // Si hay texto de búsqueda, filtra por nombre (puedes ampliar a otros campos)
    if (busqueda && busqueda.trim() !== "") {
      // Filtra por nombre, razón o dirección (ajusta los campos según tu tabla)
      query = query.ilike("nombre", `%${busqueda}%`);
      // Si quieres buscar en varios campos, usa or:
      // query = query.or(`nombre.ilike.%${busqueda}%,razon.ilike.%${busqueda}%,direccion.ilike.%${busqueda}%`);
    }

    // Ejecuta la consulta y obtiene los datos
    const { data, error, count: total } = await query;

   
    count = total;

    // Simula una barra de progreso de carga (3 segundos)
    let porcentaje = 0;
    const intervalo = setInterval(() => {
      porcentaje += 20;
      if (progressBar) {
        progressBar.style.width = `${porcentaje}%`;
        progressBar.innerText = `${porcentaje}%`;
      }

      if (porcentaje >= 100) {
        clearInterval(intervalo);
        setTimeout(() => {
          // Renderiza las filas de la tabla con los datos recibidos
          if (tbody) {
            tbody.innerHTML = (data || [])
              .map((cliente) => {
                const ubicacionCompleta =
                  cliente.x !== null && cliente.y !== null;
                const bandera = ubicacionCompleta
                  ? `<td class="btn-mapa" 
                        data-x="${cliente.x}" 
                        data-y="${cliente.y}" 
                        data-nombre="${cliente.nombre || ''}" 
                        data-direccion="${cliente.direccion || ''}" 
                        style="cursor:pointer;">✓ Ver en mapa</td>`
                  : '<td class="bg-danger">⚠ Sin ubicación</td>';
                return `
                  <tr class="${cliente.activo ? 'table-success' : 'table-danger'}">
                    <td${cliente.id == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.id ?? ''}</td>
                    <td${cliente.codigo_alternativo == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.codigo_alternativo ?? ''}</td>
                    <td${cliente.nombre == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.nombre ?? ''}</td>
                    <td${cliente.razon == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.razon ?? ''}</td>
                    <td${cliente.direccion == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.direccion ?? ''}</td>
                    <td${cliente.telefono == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.telefono ?? ''}</td>
                    <td${cliente.rut == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.rut ?? ''}</td>
                    <td${cliente.x == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.x ?? ''}</td>
                    <td${cliente.y == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.y ?? ''}</td>
                    <td>${cliente.activo ? 'Sí' : 'No'}</td>
                    <td>
                      <button class="btn btn-sm btn-primary editar">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-danger eliminar">
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                `;
              })
              .join("");
          }

          // Asigna el evento click a los botones "Ver en mapa"
          document.querySelectorAll(".btn-mapa").forEach((btn) => {
            btn.addEventListener("click", function () {
              const x = this.getAttribute("data-x");
              const y = this.getAttribute("data-y");
              const nombre = this.getAttribute("data-nombre") || "";
              const direccion = this.getAttribute("data-direccion") || "";
              abrirMapa(x, y, nombre, direccion);
            });
          });

          // Oculta el spinner al terminar la carga
          if (spinnerContainer) spinnerContainer.style.display = "none";
        }, 500);
      }
    }, 600);
  } catch (error) {
    // Manejo de errores: muestra mensaje y oculta spinner
    if (errorMessage) errorMessage.innerText = error.message || "Error desconocido";
    if (errorContainer) errorContainer.style.display = "block";
    if (spinnerContainer) spinnerContainer.style.display = "none";
    if (tbody) tbody.innerHTML = "<tr><td colspan='11'>Error al cargar clientes.</td></tr>";
  }

  // Actualiza el número de página y el estado de los botones de paginación
  const paginaActualSpan = document.getElementById("pagina-actual");
  if (paginaActualSpan) {
    paginaActualSpan.textContent = `Página ${page} de ${Math.ceil((count || 1) / pageSize)}`;
  }
  const btnAnterior = document.getElementById("anterior");
  const btnSiguiente = document.getElementById("siguiente");
  if (btnAnterior) btnAnterior.disabled = page <= 1;
  if (btnSiguiente) btnSiguiente.disabled = (page * pageSize) >= (count || 0);
}

/**
 * Asigna los eventos a los botones de paginación "Anterior" y "Siguiente".
 */
export function asignarEventosPaginacion() {
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

/**
 * Asigna los eventos a la barra de búsqueda y al botón "Borrar".
 * Permite buscar clientes por nombre y limpiar la búsqueda.
 */
export function asignarBusquedaClientes() {
  const inputBusqueda = document.getElementById("busqueda-clientes");
  const btnBuscar = document.getElementById("btn-buscar");
  const btnBorrar = document.getElementById("btn-borrar-busqueda");
  if (inputBusqueda && btnBuscar) {
    btnBuscar.onclick = () => {
      cargarClientes(1, inputBusqueda.value);
    };
    inputBusqueda.onkeyup = (e) => {
      if (e.key === "Enter") {
        cargarClientes(1, inputBusqueda.value);
      }
    };
  }
  if (btnBorrar && inputBusqueda) {
    btnBorrar.onclick = () => {
      inputBusqueda.value = "";
      cargarClientes(1, "");
    };
  }
}