import { supabase } from "./supabaseConfig.js";
import { abrirMapa } from "./mapa.js";

let paginaActual = 1;
const pageSize = 100;

export async function cargarClientes(page = 1, busqueda = "") {
  const spinnerContainer = document.getElementById("spinner-container");
  const progressBar = document.getElementById("progress-bar");
  const tbody = document.getElementById("clientes-body");
  const errorContainer = document.getElementById("error-container");
  const errorMessage = document.getElementById("error-message");

  // Ocultar error previo y mostrar el spinner
  if (errorContainer) errorContainer.style.display = "none";
  if (spinnerContainer) spinnerContainer.style.display = "block";
  if (progressBar) {
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";
  }
  if (tbody) tbody.innerHTML = "";

  let count = 0;
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("clientes")
      .select("*", { count: "exact" })
      .range(from, to);

    if (busqueda && busqueda.trim() !== "") {
      // Filtra por nombre, razón o dirección (ajusta los campos según tu tabla)
      query = query.ilike("nombre", `%${busqueda}%`);
      // Si quieres buscar en varios campos, usa or:
      // query = query.or(`nombre.ilike.%${busqueda}%,razon.ilike.%${busqueda}%,direccion.ilike.%${busqueda}%`);
    }

    const { data, error, count: total } = await query;

    console.log("data:", data, "error:", error, "total:", total);
    
    count = total;

    // Simular carga progresiva de 3 segundos
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

          // Agrega el evento click a los botones "Ver en mapa"
          document.querySelectorAll(".btn-mapa").forEach((btn) => {
            btn.addEventListener("click", function () {
              const x = this.getAttribute("data-x");
              const y = this.getAttribute("data-y");
              const nombre = this.getAttribute("data-nombre") || "";
              const direccion = this.getAttribute("data-direccion") || "";
              abrirMapa(x, y, nombre, direccion);
            });
          });

          if (spinnerContainer) spinnerContainer.style.display = "none";
        }, 500);
      }
    }, 600);
  } catch (error) {
    if (errorMessage) errorMessage.innerText = error.message || "Error desconocido";
    if (errorContainer) errorContainer.style.display = "block";
    if (spinnerContainer) spinnerContainer.style.display = "none";
    if (tbody) tbody.innerHTML = "<tr><td colspan='11'>Error al cargar clientes.</td></tr>";
  }

  // Actualiza el número de página y botones
  const paginaActualSpan = document.getElementById("pagina-actual");
  if (paginaActualSpan) {
    paginaActualSpan.textContent = `Página ${page} de ${Math.ceil((count || 1) / pageSize)}`;
  }
  const btnAnterior = document.getElementById("anterior");
  const btnSiguiente = document.getElementById("siguiente");
  if (btnAnterior) btnAnterior.disabled = page <= 1;
  if (btnSiguiente) btnSiguiente.disabled = (page * pageSize) >= (count || 0);
}

// Eventos de paginación
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
