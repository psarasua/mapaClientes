import { supabase } from './supabaseConfig.js';
// Configurar conexión con Supabase
export async function cargarRepartos() {
    const { data, error } = await supabase.from('camion_dias_entrega').select(`*, 
        camiones (descripcion),
        dias_entrega (descripcion),
        clientes (nombre)`);
    if (error) {
        console.error("Error al cargar datos:", error);
        return;
    }

    const tableBody = document.getElementById("camion_clienteTableBody");
    tableBody.innerHTML = ""; // Limpiar tabla

    data.forEach(camion => {
        let fila = `<tr>
            <td>${camion.id}</td>
            <td contenteditable="true">${camion.camiones.descripcion}</td>
            <td contenteditable="true">${camion.dias_entrega.descripcion}</td>
            <td contenteditable="true">${camion.clientes.nombre}</td>
            <td><button onclick="actualizarCamion(${camion.id}, this)">Guardar</button></td>
        </tr>`;
        tableBody.innerHTML += fila;
    });
}

// Si necesitas que sea global:
window.cargarRepartos = cargarRepartos;