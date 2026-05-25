import { useState, useEffect } from "react";
import { useConfig } from "../context/ConfigContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_MEDIA = API_BASE.replace("/api", "");

const PASOS = [
  { key: "cpu", label: "Procesador", tipo: "CPU" },
  { key: "placa", label: "Placa Madre", tipo: "PLACA" },
  { key: "ram", label: "Memoria RAM", tipo: "RAM" },
  { key: "gpu", label: "Tarjeta de Video", tipo: "GPU" },
  { key: "almacenamiento", label: "Almacenamiento", tipo: "ALMACENAMIENTO" },
];

function useComponentes(tipo, filtros = {}) {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!tipo) return;
    const ctrl = new AbortController();
    setCargando(true);
    const params = new URLSearchParams({ tipo, ...filtros });
    fetch(`${API_BASE}/componentes/?${params}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setData(Array.isArray(d) ? d : d.results || []))
      .catch(() => {})
      .finally(() => setCargando(false));
    return () => ctrl.abort();
  }, [tipo, JSON.stringify(filtros)]);

  return { data, cargando };
}

function ComponentCard({ componente, seleccionado, onSelect }) {
  const prod = componente.producto;
  const imgUrl = prod.imagen ? `${API_MEDIA}${prod.imagen}` : null;

  return (
    <button
      onClick={() => onSelect(componente)}
      className={`card-gaming text-left w-full transition-all duration-200 ${
        seleccionado ? "border-fenk-red shadow-red-glow" : ""
      }`}
    >
      {imgUrl ? (
        <img src={imgUrl} alt={prod.nombre} className="w-full h-28 object-cover" />
      ) : (
        <div className="w-full h-28 bg-fenk-dark flex items-center justify-center text-gray-700">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
      )}
      <div className="p-3">
        {prod.marca_nombre && (
          <div className="text-fenk-red text-xs font-heading font-semibold uppercase mb-0.5">
            {prod.marca_nombre}
          </div>
        )}
        <h4 className="font-heading font-bold text-white text-xs leading-snug mb-2 line-clamp-2">
          {prod.nombre}
        </h4>
        <div className="text-fenk-red font-bold font-heading">
          S/ {parseFloat(prod.precio_soles).toFixed(2)}
        </div>
        <div className="text-gray-600 text-xs">USD ${parseFloat(prod.precio_usd).toFixed(2)}</div>
        {seleccionado && (
          <div className="mt-2 text-fenk-red text-xs font-heading font-semibold">✓ Seleccionado</div>
        )}
      </div>
    </button>
  );
}

export default function ConfiguradorPage() {
  const { config } = useConfig();
  const [pasoActual, setPasoActual] = useState(0);
  const [sel, setSel] = useState({ cpu: null, placa: null, ram: null, gpu: null, almacenamiento: null });

  const socketCPU = sel.cpu?.socket_compatible || "";
  const tipoRamPlaca = sel.placa?.tipo_ram_compatible || "";

  const { data: cpus, cargando: cCpus } = useComponentes("CPU");
  const { data: placas, cargando: cPlacas } = useComponentes(
    pasoActual >= 1 ? "PLACA" : null,
    socketCPU ? { socket_compatible: socketCPU } : {}
  );
  const { data: rams, cargando: cRam } = useComponentes(
    pasoActual >= 2 ? "RAM" : null,
    tipoRamPlaca ? { tipo_ram_compatible: tipoRamPlaca } : {}
  );
  const { data: gpus, cargando: cGpus } = useComponentes(pasoActual >= 3 ? "GPU" : null);
  const { data: storage, cargando: cStorage } = useComponentes(pasoActual >= 4 ? "ALMACENAMIENTO" : null);

  const whatsapp = (config?.whatsapp || "+51999999999").replace(/\D/g, "");

  const totalUSD = Object.values(sel).reduce((acc, c) => acc + (c ? parseFloat(c.producto.precio_usd) : 0), 0);
  const totalSoles = Object.values(sel).reduce((acc, c) => acc + (c ? parseFloat(c.producto.precio_soles) : 0), 0);
  const tieneSeleccion = Object.values(sel).some(Boolean);

  function seleccionar(key, componente) {
    setSel((prev) => ({ ...prev, [key]: componente }));
    if (pasoActual < PASOS.length - 1) setPasoActual((p) => p + 1);
  }

  function buildMensaje() {
    const lineas = ["Hola! Quiero cotizar este armado de PC:", ""];
    PASOS.forEach(({ key, label }) => {
      if (sel[key]) {
        lineas.push(`${label}: ${sel[key].producto.nombre} — $${parseFloat(sel[key].producto.precio_usd).toFixed(0)}`);
      }
    });
    lineas.push("", `Total estimado: USD $${totalUSD.toFixed(2)} / S/ ${totalSoles.toFixed(2)}`);
    return encodeURIComponent(lineas.join("\n"));
  }

  const datosPaso = [
    { lista: cpus, cargando: cCpus, key: "cpu" },
    { lista: placas, cargando: cPlacas, key: "placa" },
    { lista: rams, cargando: cRam, key: "ram" },
    { lista: gpus, cargando: cGpus, key: "gpu" },
    { lista: storage, cargando: cStorage, key: "almacenamiento" },
  ][pasoActual];

  return (
    <div className="min-h-screen bg-fenk-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="section-title mb-1">
            Arma tu <span className="text-fenk-red">PC Gaming</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Selecciona tus componentes paso a paso y cotiza por WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-5">
            {/* Progreso */}
            <div className="flex gap-1.5">
              {PASOS.map((p, i) => (
                <button
                  key={p.key}
                  onClick={() => setPasoActual(i)}
                  className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded transition-all ${
                    i === pasoActual
                      ? "bg-fenk-red text-white"
                      : i < pasoActual
                      ? "bg-fenk-dark border border-fenk-red/40 text-fenk-red"
                      : "bg-fenk-dark border border-fenk-border text-gray-600"
                  }`}
                >
                  <span className="hidden sm:inline">{i + 1}. {p.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
              ))}
            </div>

            {/* Contenido del paso */}
            <div className="bg-fenk-dark border border-fenk-border rounded-lg p-6">
              <h2 className="font-heading font-bold text-white text-xl mb-1 uppercase">
                {pasoActual + 1}. {PASOS[pasoActual].label}
              </h2>
              {pasoActual === 1 && socketCPU && (
                <p className="text-gray-500 text-xs mb-4">
                  Mostrando placas compatibles con socket {socketCPU}
                </p>
              )}
              {pasoActual === 2 && tipoRamPlaca && (
                <p className="text-gray-500 text-xs mb-4">
                  Mostrando RAM compatible con {tipoRamPlaca}
                </p>
              )}
              {!socketCPU && pasoActual === 1 && (
                <p className="text-yellow-500 text-xs mb-4">
                  Selecciona un procesador primero para ver placas compatibles
                </p>
              )}

              {datosPaso.cargando ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="card-gaming h-48 animate-pulse" />
                  ))}
                </div>
              ) : datosPaso.lista.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="mb-1">No hay componentes disponibles actualmente.</p>
                  <p className="text-sm">Consulta por WhatsApp para más opciones.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {datosPaso.lista.map((c) => (
                    <ComponentCard
                      key={c.id}
                      componente={c}
                      seleccionado={sel[datosPaso.key]?.id === c.id}
                      onSelect={(comp) => seleccionar(datosPaso.key, comp)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Navegación */}
            <div className="flex justify-between">
              <button
                onClick={() => setPasoActual((p) => Math.max(0, p - 1))}
                disabled={pasoActual === 0}
                className="btn-outline-red disabled:opacity-30 disabled:cursor-not-allowed text-sm py-2"
              >
                ← Anterior
              </button>
              {pasoActual < PASOS.length - 1 ? (
                <button onClick={() => setPasoActual((p) => p + 1)} className="btn-red text-sm py-2">
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={() => { setSel({ cpu: null, placa: null, ram: null, gpu: null, almacenamiento: null }); setPasoActual(0); }}
                  className="text-gray-500 hover:text-white transition-colors text-sm font-heading uppercase"
                >
                  Reiniciar
                </button>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-fenk-dark border border-fenk-border rounded-lg p-5 sticky top-24">
              <h3 className="font-heading font-bold text-white text-lg mb-4 uppercase tracking-wider">
                Tu configuración
              </h3>

              {!tieneSeleccion ? (
                <p className="text-gray-600 text-sm">
                  Selecciona componentes para ver el resumen aquí.
                </p>
              ) : (
                <div className="space-y-3">
                  {PASOS.map(({ key, label }) =>
                    sel[key] ? (
                      <div key={key} className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="text-gray-500 text-xs font-heading uppercase">{label}</div>
                          <div className="text-white text-xs leading-snug truncate">{sel[key].producto.nombre}</div>
                        </div>
                        <div className="text-fenk-red text-sm font-bold font-heading shrink-0">
                          ${parseFloat(sel[key].producto.precio_usd).toFixed(0)}
                        </div>
                      </div>
                    ) : null
                  )}

                  <div className="border-t border-fenk-border pt-3 mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-500 text-xs font-heading uppercase">Total USD</span>
                      <span className="text-fenk-red font-bold font-heading text-xl">
                        ${totalUSD.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs font-heading uppercase">Total Soles</span>
                      <span className="text-white font-heading font-bold">
                        S/ {totalSoles.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${whatsapp}?text=${buildMensaje()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-red w-full text-center block mt-3 text-sm"
                  >
                    Cotizar por WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
