import { useState, useEffect } from "react";
import { useConfig } from "../context/ConfigContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_MEDIA = API_BASE.replace("/api", "");

const PASOS = [
  { key: "cpu",           label: "Procesador (CPU)",    short: "CPU",     tipo: "CPU" },
  { key: "placa",         label: "Placa Madre",          short: "Placa",   tipo: "PLACA" },
  { key: "ram",           label: "Memoria RAM",          short: "RAM",     tipo: "RAM" },
  { key: "almacenamiento",label: "Almacenamiento",       short: "Storage", tipo: "ALMACENAMIENTO" },
  { key: "gpu",           label: "Tarjeta de Video",     short: "GPU",     tipo: "GPU" },
  { key: "fuente",        label: "Fuente de Poder",      short: "PSU",     tipo: "FUENTE" },
  { key: "gabinete",      label: "Gabinete",             short: "Case",    tipo: "CASE" },
];

const PERIFERICOS = [
  { key: "monitor",    label: "Monitor",          tipo: "MONITOR" },
  { key: "teclado",    label: "Teclado",          tipo: "TECLADO" },
  { key: "mouse",      label: "Mouse",            tipo: "MOUSE" },
  { key: "auriculares",label: "Auriculares",      tipo: "AURICULARES" },
  { key: "mousepad",   label: "Mousepad",         tipo: "MOUSEPAD" },
  { key: "ups",        label: "Estabilizador UPS",tipo: "UPS" },
  { key: "microfono",  label: "Micrófono",        tipo: "MICROFONO" },
  { key: "camara",     label: "Cámara Web",       tipo: "CAMARA" },
];

const SEL_INICIAL  = { cpu: null, placa: null, ram: null, almacenamiento: null, gpu: null, fuente: null, gabinete: null };
const PERI_INICIAL = { monitor: null, teclado: null, mouse: null, auriculares: null, mousepad: null, ups: null, microfono: null, camara: null };

function useComponentes(tipo, filtros = {}) {
  const [data, setData]       = useState([]);
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
  const prod   = componente.producto;
  const imgUrl = prod.imagen
    ? (prod.imagen.startsWith("http") ? prod.imagen : `${API_MEDIA}${prod.imagen}`)
    : null;
  return (
    <button
      onClick={() => onSelect(componente)}
      className={`card-gaming text-left w-full transition-all duration-200 ${seleccionado ? "border-fenk-red shadow-red-glow" : ""}`}
    >
      {imgUrl ? (
        <img src={imgUrl} alt={prod.nombre} className="w-full h-28 object-cover" />
      ) : (
        <div className="w-full h-28 bg-fenk-dark flex items-center justify-center text-gray-700">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
      )}
      <div className="p-3">
        {prod.marca_nombre && (
          <div className="text-fenk-red text-xs font-heading font-semibold uppercase mb-0.5">{prod.marca_nombre}</div>
        )}
        <h4 className="font-heading font-bold text-white text-xs leading-snug mb-2 line-clamp-2">{prod.nombre}</h4>
        <div className="text-fenk-red font-bold font-heading">S/ {parseFloat(prod.precio_soles).toFixed(2)}</div>
        <div className="text-gray-600 text-xs">USD ${parseFloat(prod.precio_usd).toFixed(2)}</div>
        {seleccionado && <div className="mt-2 text-fenk-red text-xs font-heading font-semibold">✓ Seleccionado</div>}
      </div>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => <div key={i} className="card-gaming h-48 animate-pulse" />)}
    </div>
  );
}

export default function ConfiguradorPage() {
  const { config } = useConfig();
  const [pasoActual, setPasoActual] = useState(0);
  const [sel, setSel]               = useState(SEL_INICIAL);
  const [perifericos, setPerifericos] = useState(PERI_INICIAL);
  // null = sección no iniciada | 0-7 = periférico activo | 8 = completado
  const [periIndex, setPeriIndex]   = useState(null);

  const socketCPU       = sel.cpu?.socket_compatible    || "";
  const tipoRamPlaca    = sel.placa?.tipo_ram_compatible || "";
  const wattsGPU        = sel.gpu?.watts_recomendados   || 0;
  const formFactorPlaca = sel.placa?.form_factor        || "";

  const { data: cpus,      cargando: cCpus }     = useComponentes("CPU");
  const { data: placas,    cargando: cPlacas }   = useComponentes(pasoActual >= 1 ? "PLACA" : null, socketCPU ? { socket_compatible: socketCPU } : {});
  const { data: rams,      cargando: cRam }      = useComponentes(pasoActual >= 2 ? "RAM" : null, tipoRamPlaca ? { tipo_ram_compatible: tipoRamPlaca } : {});
  const { data: storage,   cargando: cStorage }  = useComponentes(pasoActual >= 3 ? "ALMACENAMIENTO" : null);
  const { data: gpus,      cargando: cGpus }     = useComponentes(pasoActual >= 4 ? "GPU" : null);
  const { data: fuentes,   cargando: cFuentes }  = useComponentes(pasoActual >= 5 ? "FUENTE" : null, wattsGPU ? { watts_min: wattsGPU } : {});
  const { data: gabinetes, cargando: cGabinetes} = useComponentes(pasoActual >= 6 ? "CASE" : null, formFactorPlaca ? { form_factor: formFactorPlaca } : {});

  const periActivo = (periIndex !== null && periIndex < PERIFERICOS.length) ? PERIFERICOS[periIndex] : null;
  const { data: periData, cargando: cPeri } = useComponentes(periActivo?.tipo || null);

  const whatsapp = (config?.whatsapp || "+51999999999").replace(/\D/g, "");

  function sumar(obj) {
    return Object.values(obj).reduce(
      (acc, c) => ({ usd: acc.usd + (c ? parseFloat(c.producto.precio_usd) : 0), soles: acc.soles + (c ? parseFloat(c.producto.precio_soles) : 0) }),
      { usd: 0, soles: 0 }
    );
  }
  const totComp  = sumar(sel);
  const totPeri  = sumar(perifericos);
  const totalUSD   = totComp.usd + totPeri.usd;
  const totalSoles = totComp.soles + totPeri.soles;
  const tieneSeleccion = Object.values(sel).some(Boolean) || Object.values(perifericos).some(Boolean);

  function seleccionar(key, comp) {
    setSel((prev) => ({ ...prev, [key]: comp }));
    if (pasoActual < PASOS.length - 1) setPasoActual((p) => p + 1);
  }

  function avanzarPeri() {
    setPeriIndex((prev) => (prev === null ? null : Math.min(prev + 1, PERIFERICOS.length)));
  }

  function retrocederPeri() {
    setPeriIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
  }

  function seleccionarPeri(key, comp) {
    setPerifericos((prev) => ({ ...prev, [key]: prev[key]?.id === comp.id ? null : comp }));
    avanzarPeri();
  }

  function buildMensaje() {
    const lineas = ["Hola! Quiero cotizar este armado de PC:", ""];
    lineas.push("*🔧 COMPONENTES:*");
    PASOS.forEach(({ key, label }) => {
      if (sel[key]) lineas.push(`• ${label}: ${sel[key].producto.nombre} — $${parseFloat(sel[key].producto.precio_usd).toFixed(0)}`);
    });
    const periSel = PERIFERICOS.filter(({ key }) => perifericos[key]);
    if (periSel.length > 0) {
      lineas.push("", "*🎮 PERIFÉRICOS:*");
      periSel.forEach(({ key, label }) => lineas.push(`• ${label}: ${perifericos[key].producto.nombre} — $${parseFloat(perifericos[key].producto.precio_usd).toFixed(0)}`));
    }
    lineas.push("", `*💰 Total estimado: USD $${totalUSD.toFixed(2)} / S/ ${totalSoles.toFixed(2)}*`);
    return encodeURIComponent(lineas.join("\n"));
  }

  const datosPaso = [
    { lista: cpus,      cargando: cCpus,      key: "cpu" },
    { lista: placas,    cargando: cPlacas,    key: "placa" },
    { lista: rams,      cargando: cRam,       key: "ram" },
    { lista: storage,   cargando: cStorage,   key: "almacenamiento" },
    { lista: gpus,      cargando: cGpus,      key: "gpu" },
    { lista: fuentes,   cargando: cFuentes,   key: "fuente" },
    { lista: gabinetes, cargando: cGabinetes, key: "gabinete" },
  ][pasoActual];

  function getCompatHint() {
    switch (pasoActual) {
      case 1: return socketCPU
        ? { warn: false, msg: `Mostrando placas compatibles con socket ${socketCPU}` }
        : { warn: true,  msg: "Selecciona un procesador primero para ver placas compatibles" };
      case 2: return tipoRamPlaca
        ? { warn: false, msg: `Mostrando RAM compatible con ${tipoRamPlaca}` }
        : { warn: true,  msg: "Selecciona una placa madre primero para filtrar RAM" };
      case 5: return wattsGPU
        ? { warn: false, msg: `Tu GPU requiere mínimo ${wattsGPU}W — mostrando fuentes compatibles` }
        : { warn: true,  msg: "Selecciona una GPU primero para ver fuentes recomendadas" };
      case 6: return formFactorPlaca
        ? { warn: false, msg: `Mostrando gabinetes compatibles con placa ${formFactorPlaca}` }
        : { warn: true,  msg: "Selecciona una placa madre primero para ver gabinetes compatibles" };
      default: return null;
    }
  }
  const hint = getCompatHint();

  function reiniciar() {
    setSel(SEL_INICIAL);
    setPerifericos(PERI_INICIAL);
    setPasoActual(0);
    setPeriIndex(null);
  }

  // Estado visual de cada píldora periférico
  function estadoPeri(i) {
    const key = PERIFERICOS[i].key;
    if (i === periIndex) return "activo";
    if (periIndex !== null && i < periIndex) return perifericos[key] ? "seleccionado" : "omitido";
    return "pendiente";
  }

  const clasePill = (estado) => {
    if (estado === "activo")      return "bg-fenk-red text-white border-fenk-red";
    if (estado === "seleccionado") return "bg-fenk-dark border-fenk-red/50 text-fenk-red";
    if (estado === "omitido")     return "bg-fenk-dark border-gray-700 text-gray-600";
    return "bg-fenk-dark border-fenk-border text-gray-700";
  };

  return (
    <div className="min-h-screen bg-fenk-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="section-title mb-1">Arma tu <span className="text-fenk-red">PC Gaming</span></h1>
          <p className="text-gray-500 text-sm">Selecciona tus componentes paso a paso y cotiza por WhatsApp.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-5">

            {/* Barra progreso — 7 pasos obligatorios */}
            <div className="flex gap-1">
              {PASOS.map((p, i) => (
                <button key={p.key} onClick={() => setPasoActual(i)} title={p.label}
                  className={`flex-1 py-2 text-xs font-heading font-bold uppercase tracking-wider rounded transition-all ${
                    i === pasoActual ? "bg-fenk-red text-white"
                    : i < pasoActual ? "bg-fenk-dark border border-fenk-red/40 text-fenk-red"
                    : "bg-fenk-dark border border-fenk-border text-gray-600"
                  }`}
                >
                  <span className="hidden md:inline">{p.short}</span>
                  <span className="md:hidden">{i + 1}</span>
                </button>
              ))}
            </div>

            {/* Panel del paso actual */}
            <div className="bg-fenk-dark border border-fenk-border rounded-lg p-6">
              <h2 className="font-heading font-bold text-white text-xl mb-1 uppercase">
                {pasoActual + 1}. {PASOS[pasoActual].label}
              </h2>
              {hint && (
                <p className={`text-xs mb-4 ${hint.warn ? "text-yellow-500" : "text-gray-500"}`}>{hint.msg}</p>
              )}
              {datosPaso.cargando ? <SkeletonGrid /> : datosPaso.lista.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p className="mb-1">No hay componentes disponibles actualmente.</p>
                  <p className="text-sm">Consulta por WhatsApp para más opciones.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {datosPaso.lista.map((c) => (
                    <ComponentCard key={c.id} componente={c}
                      seleccionado={sel[datosPaso.key]?.id === c.id}
                      onSelect={(comp) => seleccionar(datosPaso.key, comp)} />
                  ))}
                </div>
              )}
            </div>

            {/* Navegación pasos obligatorios */}
            <div className="flex justify-between">
              <button onClick={() => setPasoActual((p) => Math.max(0, p - 1))} disabled={pasoActual === 0}
                className="btn-outline-red disabled:opacity-30 disabled:cursor-not-allowed text-sm py-2">
                ← Anterior
              </button>
              {pasoActual < PASOS.length - 1 ? (
                <button onClick={() => setPasoActual((p) => p + 1)} className="btn-red text-sm py-2">Siguiente →</button>
              ) : (
                <button onClick={reiniciar}
                  className="text-gray-500 hover:text-white transition-colors text-sm font-heading uppercase">
                  Reiniciar
                </button>
              )}
            </div>

            {/* ────── SECCIÓN PERIFÉRICOS OPCIONALES ────── */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-fenk-border" />
                <h2 className="font-heading font-bold text-white text-base uppercase tracking-wider whitespace-nowrap">
                  Periféricos opcionales
                </h2>
                <div className="flex-1 h-px bg-fenk-border" />
              </div>

              {/* Estado: no iniciado */}
              {periIndex === null && (
                <div className="bg-fenk-dark border border-fenk-border rounded-lg p-6 text-center">
                  <p className="text-gray-400 text-sm mb-4">
                    ¿Deseas agregar monitor, teclado, mouse y más a tu build?
                  </p>
                  <button onClick={() => setPeriIndex(0)} className="btn-red text-sm">
                    Agregar periféricos →
                  </button>
                </div>
              )}

              {/* Estado: completado */}
              {periIndex === PERIFERICOS.length && (
                <div className="bg-fenk-dark border border-fenk-red/30 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-fenk-red font-heading font-bold text-sm uppercase tracking-wider">
                      ✓ Periféricos configurados
                    </span>
                    <button onClick={() => setPeriIndex(0)}
                      className="text-gray-500 hover:text-white text-xs font-heading uppercase transition-colors">
                      Editar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PERIFERICOS.map(({ key, label }) => (
                      <span key={key} className={`text-xs px-2 py-1 rounded border font-heading ${
                        perifericos[key] ? "border-fenk-red/50 text-fenk-red" : "border-gray-800 text-gray-700"
                      }`}>
                        {perifericos[key] ? "✓" : "—"} {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado: flujo secuencial activo (periIndex 0-7) */}
              {periIndex !== null && periIndex < PERIFERICOS.length && (
                <>
                  {/* Barra progreso periféricos */}
                  <div className="flex gap-1 mb-4">
                    {PERIFERICOS.map((p, i) => {
                      const estado = estadoPeri(i);
                      return (
                        <button key={p.key} onClick={() => setPeriIndex(i)} title={p.label}
                          className={`flex-1 py-1.5 text-xs font-heading font-bold uppercase rounded border transition-all ${clasePill(estado)}`}>
                          <span className="hidden lg:inline">
                            {estado === "seleccionado" ? "✓" : estado === "omitido" ? "—" : ""} {p.label.split(" ")[0]}
                          </span>
                          <span className="lg:hidden">{i + 1}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Panel periférico activo */}
                  <div className="bg-fenk-dark border border-fenk-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-bold text-white text-lg uppercase">
                        {periIndex + 1}. {PERIFERICOS[periIndex].label}
                      </h3>
                      <button onClick={avanzarPeri}
                        className="btn-outline-red text-xs py-1.5 px-3 shrink-0">
                        Omitir →
                      </button>
                    </div>
                    {cPeri ? <SkeletonGrid /> : periData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="mb-1">No hay opciones disponibles.</p>
                        <p className="text-sm">Consulta por WhatsApp para más opciones.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {periData.map((c) => (
                          <ComponentCard key={c.id} componente={c}
                            seleccionado={perifericos[PERIFERICOS[periIndex].key]?.id === c.id}
                            onSelect={(comp) => seleccionarPeri(PERIFERICOS[periIndex].key, comp)} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Navegación periféricos */}
                  <div className="flex justify-between mt-4">
                    <button onClick={retrocederPeri} disabled={periIndex === 0}
                      className="btn-outline-red disabled:opacity-30 disabled:cursor-not-allowed text-sm py-2">
                      ← Anterior
                    </button>
                    <button onClick={avanzarPeri} className="btn-red text-sm py-2">
                      {periIndex < PERIFERICOS.length - 1 ? "Omitir / Siguiente →" : "Finalizar →"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Resumen lateral */}
          <div className="lg:col-span-1">
            <div className="bg-fenk-dark border border-fenk-border rounded-lg p-5 sticky top-24">
              <h3 className="font-heading font-bold text-white text-lg mb-4 uppercase tracking-wider">
                Tu configuración
              </h3>

              {!tieneSeleccion ? (
                <p className="text-gray-600 text-sm">Selecciona componentes para ver el resumen aquí.</p>
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

                  {Object.values(perifericos).some(Boolean) && (
                    <div className="border-t border-fenk-border pt-3 space-y-2">
                      <div className="text-gray-600 text-xs font-heading uppercase mb-1">Periféricos</div>
                      {PERIFERICOS.map(({ key, label }) =>
                        perifericos[key] ? (
                          <div key={key} className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <div className="text-gray-600 text-xs font-heading uppercase">{label}</div>
                              <div className="text-white text-xs leading-snug truncate">{perifericos[key].producto.nombre}</div>
                            </div>
                            <div className="text-fenk-red text-sm font-bold font-heading shrink-0">
                              ${parseFloat(perifericos[key].producto.precio_usd).toFixed(0)}
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}

                  <div className="border-t border-fenk-border pt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-500 text-xs font-heading uppercase">Total USD</span>
                      <span className="text-fenk-red font-bold font-heading text-xl">${totalUSD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs font-heading uppercase">Total Soles</span>
                      <span className="text-white font-heading font-bold">S/ {totalSoles.toFixed(2)}</span>
                    </div>
                  </div>

                  <a href={`https://wa.me/${whatsapp}?text=${buildMensaje()}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-red w-full text-center block mt-3 text-sm">
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
