// Configurar conexión con Supabase
import { supabase } from "./supabaseConfig.js";
//Alert Eliminar camión
document.addEventListener("click", async (event) => {
  if (event.target.closest(".delete-btn")) {
    const camionId = event.target.closest(".delete-btn").dataset.id;

    Swal.fire({
      title: "¿Eliminar camión?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await eliminarCamion(camionId);
        Swal.fire("Eliminado", "El camión ha sido eliminado.", "success");
        // Recargar la tabla de camiones después de eliminar
        cargarCamiones();
      }
    });
  }
});
async function eliminarCamion(camionId) {
  const { error } = await supabase.from("camiones").delete().eq("id", camionId);

  if (error) {
    Swal.fire("Error", "No se pudo eliminar el camión.", "error");
  }
}

export async function cargarCamiones() {
  // Mostrar spinner y barra de progreso
  const spinnerContainer = document.getElementById("spinner-container");
  const progressBar = document.getElementById("progress-bar");
  const errorContainer = document.getElementById("error-container");
  const errorMessage = document.getElementById("error-message");

  errorContainer.style.display = "none";
  spinnerContainer.style.display = "block";
  progressBar.style.width = "0%";
  progressBar.innerText = "0%";

  // Simular carga progresiva (opcional)
  let porcentaje = 0;
  const intervalo = setInterval(() => {
    porcentaje += 20;
    progressBar.style.width = `${porcentaje}%`;
    progressBar.innerText = `${porcentaje}%`;
    if (porcentaje >= 100) {
      clearInterval(intervalo);
      cargarDatosCamiones();
    }
  }, 200);

  async function cargarDatosCamiones() {
    const { data, error } = await supabase.from("camiones").select("*");
    if (error) {
      console.error("Error al cargar datos:", error);
      errorMessage.innerText = error.message || "Error desconocido";
      errorContainer.style.display = "block";
      spinnerContainer.style.display = "none";
      return;
    }

    const tableBody = document.getElementById("camionesTableBody");
    tableBody.innerHTML = ""; // Limpiar tabla

    data.forEach((camion) => {
      let fila = `<tr>
                <td>${camion.id}</td>
                <td contenteditable="true">${camion.descripcion}</td>
                <td>
                    <button class="btn btn-sm btn-primary editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${camion.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
      tableBody.innerHTML += fila;
    });

    // Asignar evento a los botones editar
    document.querySelectorAll('.editar').forEach(btn => {
      btn.onclick = function() {
        const fila = btn.closest('tr');
        const id = fila.children[0].innerText;
        const descripcion = fila.children[1].innerText.trim();

        // Carga los datos en el modal
        document.getElementById("descripcion").value = descripcion;
        document.getElementById("camionIdEditar").value = id;

        // Abre el modal
        const modal = new bootstrap.Modal(document.getElementById("modalCamion"));
        modal.show();
      };
    });

    // Ocultar spinner al terminar
    spinnerContainer.style.display = "none";
  }

  // Agrega el event listener al form SOLO si existe y aún no tiene el listener
  const form = document.getElementById("formCamion");
  if (form && !form.dataset.listenerAdded) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const descripcion = document.getElementById("descripcion").value;
      const id = document.getElementById("camionIdEditar").value;

      let data, error;
      if (id) {
        // Es edición
        ({ data, error } = await supabase
          .from("camiones")
          .update({ descripcion })
          .eq("id", id));
      } else {
        // Es alta
        ({ data, error } = await supabase
          .from("camiones")
          .insert([{ descripcion }]));
      }

      if (error) {
        // Mostrar toast de error
        const toastError = new bootstrap.Toast(
          document.getElementById("toastError")
        );
        toastError.show();
      } else {
        // Mostrar toast de éxito
        const toastExito = new bootstrap.Toast(
          document.getElementById("toastExito")
        );
        toastExito.show();
        form.reset();
        document.getElementById("camionIdEditar").value = ""; // Limpia el hidden
        let modal = bootstrap.Modal.getInstance(
          document.getElementById("modalCamion")
        );
        modal.hide();
        // Mueve el foco a un botón fuera del modal
        document.getElementById("btn-agregar-camion")?.focus();
        cargarCamiones();
      }
    });
    form.dataset.listenerAdded = "true";
  }
}

// Si necesitas que sea global:
window.cargarCamiones = cargarCamiones;


