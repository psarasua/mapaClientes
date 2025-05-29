import { supabase } from "./supabaseConfig.js";
import { abrirMapa } from "./mapa.js";

export async function cargarClientes() {
  const spinnerContainer = document.getElementById("spinner-container");
  const progressBar = document.getElementById("progress-bar");
  const tbody = document.getElementById("clientes-body");
  const errorContainer = document.getElementById("error-container");
  const errorMessage = document.getElementById("error-message");

  // Ocultar error previo y mostrar el spinner
  errorContainer.style.display = "none";
  spinnerContainer.style.display = "block";
  progressBar.style.width = "0%";
  progressBar.innerText = "0%";

  try {
    const { data, error } = await supabase.from("clientes").select("*");
    if (error) throw new Error(error.message);

    // Simular carga progresiva de 3 segundos
    let porcentaje = 0;
    const intervalo = setInterval(() => {
      porcentaje += 20;
      progressBar.style.width = `${porcentaje}%`;
      progressBar.innerText = `${porcentaje}%`;

      if (porcentaje >= 100) {
        clearInterval(intervalo);
        setTimeout(() => {
          tbody.innerHTML = data
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
                <tr data-id="${cliente.id}">
                  <td${cliente.codigo_alternativo == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.codigo_alternativo ?? ''}</td>
                  <td${cliente.nombre == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.nombre ?? ''}</td>
                  <td${cliente.razon == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.razon ?? ''}</td>
                  <td${cliente.direccion == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.direccion ?? ''}</td>
                  <td${cliente.telefono == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.telefono ?? ''}</td>
                  <td${cliente.rut == null ? ' style="background-color:#fff3cd;"' : ''}>${cliente.rut ?? ''}</td>
                    ${bandera}
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

          spinnerContainer.style.display = "none";
        }, 500);
      }
    }, 600);
  } catch (error) {
    // Mostrar el mensaje de error en el alert de Bootstrap
    errorMessage.innerText = error.message || "Error desconocido";
    errorContainer.style.display = "block";
    spinnerContainer.style.display = "none";
    tbody.innerHTML = "<tr><td colspan='7'>Error al cargar clientes.</td></tr>";
  }
}
window.cargarClientes = cargarClientes;
