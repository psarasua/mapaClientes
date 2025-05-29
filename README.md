# Proyecto Sidebar + Carga Dinámica de Secciones

## ✅ Objetivo
Implementar un sidebar colapsable que carga contenido dinámicamente con `fetch()` y muestra datos almacenados en Supabase.

---

## 📌 Configuración de Supabase
**Archivo:** `supabaseConfig.js`
- Se estableció la conexión con Supabase usando `createClient()`.
- Se exportó el objeto `supabase` para su uso en otros scripts.

---

## 🔄 Carga de Clientes desde Supabase
**Archivo:** `clientes.js`
- Se creó la función `cargarClientes()` que obtiene datos de Supabase y llena la tabla.
- Se exportó `cargarClientes()` para ser utilizada desde `main.js`.
- Se aplicaron estilos con Bootstrap para mejorar la visualización de la tabla.

---

## 📲 Carga Dinámica de Secciones
**Archivo:** `main.js`
- Se creó la función `cargarContenido(seccion)`, que utiliza `fetch()` para traer cada sección (`inicio.html`, `perfil.html`, `clientes.html`, etc.).
- Si la sección es "Clientes", `cargarClientes()` se ejecuta automáticamente.
- Se agregó un evento que detecta cambios en el `hash` (`#clientes`, `#perfil`) para cargar la sección correspondiente.

---

## 📂 Sidebar Colapsable
**Archivo:** `sidebar.js`
- Se implementó la función `toggleSidebar()` para colapsar/expandir el menú lateral.
- Se ajustaron estilos en `styles.css` para que el contenido principal aparezca a la derecha del sidebar.
- Se conectó el sidebar con `cargarContenido()` para cambiar secciones de manera dinámica.

---

## 📋 Estructura de la Tabla de Clientes
**Archivo:** `clientes.html`
- Se creó una tabla HTML con `id="clientes-body"` donde JavaScript insertará los datos dinámicamente.
- Se integró Bootstrap para mejorar el diseño y la usabilidad.

---

## ⚙ Corrección de Errores
✔ Se solucionó el error `cargarClientes() already declared`.
✔ Se corrigió el error `cargarContenido is not defined`, asegurando que `main.js` se carga correctamente.
✔ Se ajustó la ruta de `fetch()` para evitar errores `404` (`clientes.html` no encontrado).
✔ Se agregó `type="module"` en `index.html` para permitir `imports`.

---

¡Este README.md te ayudará a mantener el proyecto bien documentado y organizado! 🚀 Si necesitas ajustes o agregar más información, dime cómo puedo ayudar. 😃