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
        <td>
          <button class="btn btn-sm btn-primary btn-editar" data-id="${camion.id}">Editar</button>
          <button class="btn btn-sm btn-danger btn-eliminar" data-id="${camion.id}">Eliminar</button>
        </td>
    </tr>`;
    tableBody.innerHTML += fila;
  });

  // Asigna eventos después de renderizar la tabla
  asignarEventosRepartos();
}

// Si necesitas que sea global:
window.cargarRepartos = cargarRepartos;

// Esta función asigna los eventos a los botones del modal.
// Llama a esta función después de insertar el HTML del partial en el DOM o después de cargar la tabla.
export function asignarEventosRepartos() {
  // Botón Agregar
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

      // Limpia selección de checkboxes y selects
      if (selectCamion) selectCamion.selectedIndex = 0;
      if (selectDia) selectDia.selectedIndex = 0;
      document.querySelectorAll('.cliente-checkbox').forEach(cb => cb.checked = false);

      // Cambia el texto del botón
      const btnConfirmar = document.getElementById('btn-confirmar-agregar');
      if (btnConfirmar) btnConfirmar.textContent = "Confirmar";

      // Abre el modal (Bootstrap 5)
      const modal = new bootstrap.Modal(document.getElementById('modalAgregarReparto'));
      modal.show();

      // Asigna evento para alta (evita duplicados)
      if (btnConfirmar) {
        btnConfirmar.onclick = async () => {
          const camion_id = selectCamion.value;
          const dia_id = selectDia.value;
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
            dia_id
          }));

          const { error } = await supabase
            .from('camion_dias_entrega')
            .insert([{ camion_id, cliente_id, dia_id }]);

          if (!error) {
            alert('Alta exitosa');
            cargarRepartos();
            bootstrap.Modal.getInstance(document.getElementById('modalAgregarReparto')).hide();
          } else {
            alert('Error al dar de alta');
          }
        };
      }
    };
  }

  // Botón Eliminar
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.onclick = async function() {
      const id = this.getAttribute('data-id');
      if (confirm('¿Seguro que deseas eliminar este reparto?')) {
        const { error } = await supabase
          .from('camion_dias_entrega')
          .delete()
          .eq('id', id);
        if (!error) {
          alert('Eliminado correctamente');
          cargarRepartos();
        } else {
          alert('Error al eliminar');
        }
      }
    };
  });

  // Botón Editar
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.onclick = async function() {
      const id = this.getAttribute('data-id');
      // Obtén los datos actuales del reparto
      const { data, error } = await supabase
        .from('camion_dias_entrega')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        alert('Error al cargar datos');
        return;
      }

      // Carga camiones y selecciona el actual
      const { data: camiones } = await supabase.from('camiones').select('id, descripcion');
      const selectCamion = document.getElementById('select-camion');
      if (selectCamion && camiones) {
        selectCamion.innerHTML = camiones.map(c => `<option value="${c.id}">${c.descripcion}</option>`).join('');
        selectCamion.value = data.camion_id;
      }

      // Carga días de entrega y selecciona el actual
      const { data: dias } = await supabase.from('dias_entrega').select('id, descripcion');
      const selectDia = document.getElementById('select-dia');
      if (selectDia && dias) {
        selectDia.innerHTML = dias.map(d => `<option value="${d.id}">${d.descripcion}</option>`).join('');
        selectDia.value = String(data.dia_id); // <-- aquí el cambio
      }

      // Carga clientes y marca el correspondiente
      const { data: clientes } = await supabase.from('clientes').select('id, nombre');
      const listaClientes = document.getElementById('lista-clientes-checkboxes');
      if (listaClientes && clientes) {
        listaClientes.innerHTML = clientes.map(c =>
          `<div>
            <input type="checkbox" class="cliente-checkbox" value="${c.id}" id="cliente-${c.id}">
            <label for="cliente-${c.id}">${c.nombre}</label>
          </div>`
        ).join('');
        // Limpia todos los checkboxes
        document.querySelectorAll('.cliente-checkbox').forEach(cb => cb.checked = false);
        // Marca el cliente correspondiente
        const checkbox = document.getElementById(`cliente-${data.cliente_id}`);
        if (checkbox) checkbox.checked = true;
      }

      // Cambia el texto del botón
      const btnConfirmar = document.getElementById('btn-confirmar-agregar');
      if (btnConfirmar) btnConfirmar.textContent = "Guardar cambios";

      // Abre el modal
      const modal = new bootstrap.Modal(document.getElementById('modalAgregarReparto'));
      modal.show();

      // Asigna evento para editar (evita duplicados)
      if (btnConfirmar) {
        btnConfirmar.onclick = async () => {
          const camion_id = selectCamion.value;
          const dia_id = Number(selectDia.value); // <-- fuerza a número si tu campo es numérico
          const checkboxes = document.querySelectorAll('.cliente-checkbox:checked');
          const clientesSeleccionados = Array.from(checkboxes).map(cb => cb.value);

          if (clientesSeleccionados.length === 0) {
            alert('Selecciona al menos un cliente');
            return;
          }

          // Si solo permites un cliente por reparto, toma el primero
          const cliente_id = clientesSeleccionados[0];

          console.log("ID a actualizar:", id, typeof id);
          console.log("Valores a actualizar:", { camion_id, cliente_id, dia_id });

          const { data: updateData, error } = await supabase
            .from('camion_dias_entrega')
            .update({ camion_id, cliente_id, dia_id })
            .eq('id', Number(id))
            .select();


          if (!error) {
            alert('Modificado correctamente');
            cargarRepartos();
            bootstrap.Modal.getInstance(document.getElementById('modalAgregarReparto')).hide();
          } else {
            alert('Error al modificar');
          }
        };
      }
    };
  });

  const modalElement = document.getElementById('modalAgregarReparto');
  modalElement.addEventListener('hidden.bs.modal', function () {
    document.getElementById('btn-agregar-reparto')?.focus();
  }, { once: true });
}

