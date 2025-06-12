import { supabase } from './supabaseConfig.js';
// Configurar conexión con Supabase
export async function cargarDiasEntrega() {
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
            cargarDatosDias();
        }
    }, 200);

    async function cargarDatosDias() {
        const { data, error } = await supabase.from('dias_entrega').select('*');
        if (error) {
            errorMessage.innerText = error.message || "Error desconocido";
            errorContainer.style.display = "block";
            spinnerContainer.style.display = "none";
            return;
        }

        const tableBody = document.getElementById("diasEntregaTableBody");
        tableBody.innerHTML = ""; // Limpiar tabla
        data.forEach(dia => {
            let fila = `<tr>
                <td>${dia.id}</td>
                <td>${dia.descripcion}</td>
                <td>
                    <button class="btn btn-sm btn-primary editar" data-id="${dia.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger eliminar" data-id="${dia.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
            tableBody.innerHTML += fila;
        });

        // Ocultar spinner al terminar
        spinnerContainer.style.display = "none";
    }
}

function asignarEventosDiasEntrega() {
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.onclick = async function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Seguro que deseas eliminar este día de entrega?')) {
        const { error } = await supabase
          .from('dias_entrega')
          .delete()
          .eq('id', id);
        if (!error) {
          alert('Eliminado correctamente');
          cargarDiasEntrega();
        } else {
          alert('Error al eliminar');
        }
      }
    };
  });

  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.onclick = async function() {
      const id = this.getAttribute('data-id');
      // Aquí puedes abrir el modal y cargar los datos para editar
      // Ejemplo:
      const { data, error } = await supabase
        .from('dias_entrega')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) {
        document.getElementById('descripcion').value = data.descripcion;
        document.getElementById('diaEntregaIdEditar').value = id;
        const modal = new bootstrap.Modal(document.getElementById('modalDiaEntrega'));
        modal.show();
      } else {
        alert('Error al cargar datos');
      }
    };
  });
}

// Si necesitas que sea global:
window.cargarDiasEntrega = cargarDiasEntrega;
asignarEventosDiasEntrega();
