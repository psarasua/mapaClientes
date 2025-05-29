function mostrarToast(mensaje, tipo = "success") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    console.error("No se encontró el contenedor de toasts (#toastContainer).");
    return;
  }

  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-bg-${tipo} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${mensaje}</div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML("beforeend", toastHTML);

  // Eliminar el toast después de 5 segundos
  setTimeout(() => {
    const toast = document.getElementById(toastId);
    if (toast) toast.remove();
  }, 5000);
}

export { mostrarToast };