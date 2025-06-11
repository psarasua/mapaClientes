import { supabase } from './supabaseConfig.js';

// Cargar los repartos existentes y mostrarlos en la tabla
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
  if (!tableBody) return;
  tableBody.innerHTML = ""; // Limpiar tabla

  data.forEach(camion => {
    let fila = `<tr>
        <td>${camion.id}</td>
        <td>${camion.camiones?.descripcion ?? ''}</td>
        <td>${camion.dias_entrega?.descripcion ?? ''}</td>
        <td>${camion.clientes?.nombre ?? ''}</td>
        <td><button onclick="actualizarCamion(${camion.id}, this)">Guardar</button></td>
    </tr>`;
    tableBody.innerHTML += fila;
  });
}

// Si necesitas que sea global:
window.cargarRepartos = cargarRepartos;

// Esta función asigna los eventos a los botones del modal.
// Llama a esta función después de insertar el HTML del partial en el DOM.
export function asignarEventosRepartos() {
  const btnAgregar = document.getElementById('btn-agregar-reparto');
  if (btnAgregar) {
    btnAgregar.onclick = async () => {
      // Carga camiones
      const { data: camiones } = await supabase.from('camiones').select('id, descripcion');
      const selectCamion = document.getElementById('select-camion');
      if (selectCamion && camiones) {
        selectCamion.innerHTML = camiones.map(c => `<option value="${c.id}">${c.descripcion}</option>`).join('');
      }

      // Carga clientes
      const { data: clientes } = await supabase.from('clientes').select('id, nombre');
      let clientesOriginales = clientes; // Para el filtro
      const listaClientes = document.getElementById('lista-clientes-checkboxes');
      if (listaClientes && clientes) {
        listaClientes.innerHTML = clientes.map(c =>
          `<div>
            <input type="checkbox" class="cliente-checkbox" value="${c.id}" id="cliente-${c.id}">
            <label for="cliente-${c.id}">${c.nombre}</label>
          </div>`
        ).join('');
      }

      // Evento para filtrar clientes
      const buscador = document.getElementById('buscador-cliente-modal');
      if (buscador) {
        buscador.oninput = function() {
          const texto = buscador.value.toLowerCase();
          const filtrados = clientesOriginales.filter(c =>
            c.nombre && c.nombre.toLowerCase().includes(texto)
          );
          listaClientes.innerHTML = filtrados.map(c =>
            `<div>
              <input type="checkbox" class="cliente-checkbox" value="${c.id}" id="cliente-${c.id}">
              <label for="cliente-${c.id}">${c.nombre}</label>
            </div>`
          ).join('');
        };
      }

      // Carga días de entrega
      const { data: dias } = await supabase.from('dias_entrega').select('id, descripcion');
      const selectDia = document.getElementById('select-dia');
      if (selectDia && dias) {
        selectDia.innerHTML = dias.map(d => `<option value="${d.id}">${d.descripcion}</option>`).join('');
      }

      // Abre el modal (Bootstrap 5)
      const modal = new bootstrap.Modal(document.getElementById('modalAgregarReparto'));
      modal.show();
    };
  }

  // Evento para confirmar el alta
  const btnConfirmar = document.getElementById('btn-confirmar-agregar');
  if (btnConfirmar) {
    btnConfirmar.onclick = async () => {
      const camion_id = document.getElementById('select-camion').value;
      const dia_entrega_id = document.getElementById('select-dia').value;
      const checkboxes = document.querySelectorAll('.cliente-checkbox:checked');
      const clientesSeleccionados = Array.from(checkboxes).map(cb => cb.value);

      if (clientesSeleccionados.length === 0) {
        alert('Selecciona al menos un cliente');
        return;
      }

      // Inserta todos los clientes seleccionados
      const inserts = clientesSeleccionados.map(cliente_id => ({
        camion_id,
        cliente_id,
        dia_id: dia_entrega_id
      }));

      const { error } = await supabase
        .from('camion_dias_entrega')
        .insert(inserts);

      if (!error) {
        alert('Alta exitosa');
        cargarRepartos();
        bootstrap.Modal.getInstance(document.getElementById('modalAgregarReparto')).hide();
      } else {
        alert('Error al dar de alta');
      }
    };
  }
}

// Si cargas el HTML de forma estática, puedes llamar aquí:
if (document.getElementById('btn-agregar-reparto')) {
  asignarEventosRepartos();
}