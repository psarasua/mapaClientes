import { supabase } from './supabaseConfig.js';
// Configurar conexión con Supabase
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
        const { data, error } = await supabase.from('camiones').select('*');
        if (error) {
            console.error("Error al cargar datos:", error);
            errorMessage.innerText = error.message || "Error desconocido";
            errorContainer.style.display = "block";
            spinnerContainer.style.display = "none";
            return;
        }

        const tableBody = document.getElementById("camionesTableBody");
        tableBody.innerHTML = ""; // Limpiar tabla

        data.forEach(camion => {
            let fila = `<tr>
                <td>${camion.id}</td>
                <td contenteditable="true">${camion.descripcion}</td>
                <td>
                    <button class="btn btn-sm btn-primary editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>`;
            tableBody.innerHTML += fila;
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
            const { data, error } = await supabase.from('camiones').insert([{ descripcion }]);

            if (error) {
                // Mostrar toast de error
                const toastError = new bootstrap.Toast(document.getElementById('toastError'));
                toastError.show();
            } else {
                // Mostrar toast de éxito
                const toastExito = new bootstrap.Toast(document.getElementById('toastExito'));
                toastExito.show();
                form.reset();
                let modal = bootstrap.Modal.getInstance(document.getElementById("modalCamion"));
                modal.hide();
                cargarCamiones();
            }
        });
        form.dataset.listenerAdded = "true";
    }
}

// Si necesitas que sea global:
window.cargarCamiones = cargarCamiones;