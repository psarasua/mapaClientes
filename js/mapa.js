import * as L from "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js";

let mapaInstancia = null;

export function abrirMapa(x, y, nombre = "", direccion = "") {
  const lat = Number(y);
  const lng = Number(x);

  const modal = new bootstrap.Modal(document.getElementById("map-modal"));
  modal.show();

  setTimeout(() => {
    if (mapaInstancia) {
      mapaInstancia.remove();
      mapaInstancia = null;
    }

    mapaInstancia = L.map("map").setView([lat, lng], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapaInstancia);

    const popupContent = `
      <strong>${nombre}</strong><br/>
      ${direccion}
    `;

    const marker = L.marker([lat, lng])
      .addTo(mapaInstancia)
      .bindPopup(popupContent);

    setTimeout(() => {
      marker.openPopup();
    }, 300);
  }, 500);
}
