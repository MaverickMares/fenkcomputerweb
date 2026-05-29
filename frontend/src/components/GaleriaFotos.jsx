import { useState } from "react";

const API_MEDIA = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace("/api", "");

export default function GaleriaFotos({ imagenPrincipal, galeria = [] }) {
  const fotos = [
    { id: "principal", url: imagenPrincipal ? (imagenPrincipal.startsWith("http") ? imagenPrincipal : `${API_MEDIA}${imagenPrincipal}`) : null },
    ...galeria.map((g) => ({ id: g.id, url: g.imagen ? (g.imagen.startsWith("http") ? g.imagen : `${API_MEDIA}${g.imagen}`) : null })),
  ].filter((f) => f.url);

  const [activa, setActiva] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (!fotos.length) {
    return (
      <div
        className="rounded-xl bg-fenk-dark border border-fenk-border flex items-center justify-center text-gray-700"
        style={{ aspectRatio: "4/3" }}
      >
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Foto principal */}
      <div
        className="relative overflow-hidden rounded-xl bg-gray-900 border border-fenk-border cursor-zoom-in flex items-center justify-center"
        style={{ aspectRatio: "4/3" }}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        <img
          src={fotos[activa].url}
          alt="Foto del producto"
          className={`w-full h-full object-contain transition-transform duration-700 ${zoom ? "scale-110" : "scale-100"}`}
        />
        {fotos.length > 1 && (
          <>
            <button
              onClick={() => setActiva((i) => (i - 1 + fotos.length) % fotos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/70 hover:bg-fenk-red rounded-full flex items-center justify-center text-white transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => setActiva((i) => (i + 1) % fotos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/70 hover:bg-fenk-red rounded-full flex items-center justify-center text-white transition-colors"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {fotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiva(i)}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === activa ? "bg-fenk-red w-5" : "bg-white/40 w-1.5 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {fotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {fotos.map((foto, i) => (
            <button
              key={foto.id}
              onClick={() => setActiva(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === activa ? "border-fenk-red" : "border-fenk-border opacity-50 hover:opacity-80"
              }`}
            >
              <img src={foto.url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
