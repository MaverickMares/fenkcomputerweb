import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import CardProducto from "../components/CardProducto";

const POR_PAGINA = 12;

// matchFn filtra la lista ya cargada por la API (sin cambio de catId)
const GRUPOS = [
  {
    label: "Laptops", icon: "💻", catIds: [16],
    subs: [
      { label: "Laptops Gaming",    catId: 16, subKey: "laptops-gaming",    matchFn: (p) => /rog|legion|katana|gaming|rtx/i.test(p.nombre) },
      { label: "Laptops Oficina",   catId: 16, subKey: "laptops-oficina",   matchFn: (p) => /oficina/i.test(p.nombre) },
      { label: "Laptops Estudiante",catId: 16, subKey: "laptops-estudiante",matchFn: () => true },
    ],
  },
  {
    label: "PCs Completas", icon: "🖥️", catIds: [17],
    subs: [
      { label: "PCs Gaming",      catId: 17, subKey: "pcs-gaming",      matchFn: (p) => /gamer|gaming/i.test(p.nombre) },
      { label: "PCs Oficina",     catId: 17, subKey: "pcs-oficina",     matchFn: (p) => /oficina/i.test(p.nombre) },
      { label: "PCs Workstation", catId: 17, subKey: "pcs-workstation", matchFn: (p) => /workstation/i.test(p.nombre) },
    ],
  },
  {
    label: "Componentes", icon: "⚙️", catIds: [1, 2, 3, 4, 5, 6, 7],
    subs: [
      { label: "Procesadores",     catId: 1,    subKey: null },
      { label: "Placas Madre",     catId: 2,    subKey: null },
      { label: "Memorias RAM",     catId: 3,    subKey: null },
      { label: "Tarjetas de Video",catId: 5,    subKey: null },
      { label: "Almacenamiento",   catId: 4,    subKey: null },
      { label: "Fuentes de Poder", catId: 6,    subKey: null },
      { label: "Gabinetes",        catId: 7,    subKey: null },
      { label: "Refrigeración",    catId: null, subKey: null },
    ],
  },
  {
    label: "Monitores", icon: "🖥️", catIds: [8],
    subs: [
      { label: "Monitor Gaming",     catId: 8, subKey: "monitor-gaming",     matchFn: (p) => /144hz|165hz|170hz|240hz/i.test(p.nombre) },
      { label: "Monitor Curvo",      catId: 8, subKey: "monitor-curvo",      matchFn: (p) => /curvo/i.test(p.nombre) },
      { label: "Monitor 2K QHD",     catId: 8, subKey: "monitor-2k",         matchFn: (p) => /2k|qhd/i.test(p.nombre) },
      { label: "Monitor 4K",         catId: 8, subKey: "monitor-4k",         matchFn: (p) => /4k|uhd/i.test(p.nombre) },
      { label: "Monitor Profesional",catId: 8, subKey: "monitor-pro",        matchFn: () => true },
    ],
  },
  {
    label: "Periféricos PC", icon: "🖱️", catIds: [9, 10, 11, 12, 13, 14, 15],
    subs: [
      { label: "Teclados",           catId: 9,  subKey: null },
      { label: "Mouse",              catId: 10, subKey: null },
      { label: "Auriculares",        catId: 11, subKey: null },
      { label: "Micrófonos",         catId: 14, subKey: null },
      { label: "Mousepad",           catId: 12, subKey: null },
      { label: "Cámaras Web",        catId: 15, subKey: null },
      { label: "Estabilizadores UPS",catId: 13, subKey: null },
    ],
  },
  {
    label: "Sillas Gaming", icon: "🪑", catIds: [18],
    subs: [
      { label: "Sillas Racing",    catId: 18,   subKey: "sillas-racing",   matchFn: () => true },
      { label: "Escritorios Gaming",catId: null, subKey: null },
    ],
  },
];

const TODAS_SUBS = GRUPOS.flatMap((g) => g.subs);

function buildEndpoint({ categorias, marca, esNuevo, esOferta, precioMin, precioMax, orden }) {
  const p = new URLSearchParams();
  if (categorias) p.set("categorias", categorias);
  if (marca)      p.set("marca", marca);
  if (esNuevo)    p.set("es_nuevo", "true");
  if (esOferta)   p.set("es_oferta", "true");
  if (precioMin)  p.set("precio_min", precioMin);
  if (precioMax)  p.set("precio_max", precioMax);
  if (orden)      p.set("orden", orden);
  return `/productos/?${p.toString()}`;
}

export default function CatalogoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState({
    marca: "", esNuevo: false, esOferta: false, precioMin: "", precioMax: "", orden: "",
  });

  // Parámetros de URL: ?categorias=8&sub=monitor-4k
  const categoriasParam  = searchParams.get("categorias") || "";
  const selectedSub      = searchParams.get("sub")        || null;
  const selectedCatIds   = categoriasParam.split(",").map(Number).filter(Boolean);

  // Grupo activo (para auto-expand y header)
  const grupoActivo = GRUPOS.find((g) => g.catIds.some((id) => selectedCatIds.includes(id)));

  // Sub activa (para highlighting preciso)
  const subActiva = selectedSub
    ? TODAS_SUBS.find((s) => s.subKey === selectedSub) ?? null
    : selectedCatIds.length === 1
      ? TODAS_SUBS.find((s) => !s.subKey && s.catId === selectedCatIds[0]) ?? null
      : null;

  // Grupos expandidos — auto-expande el grupo activo
  const [abiertos, setAbiertos] = useState(() => {
    const s = new Set();
    if (grupoActivo) s.add(grupoActivo.label);
    return s;
  });

  useEffect(() => {
    if (grupoActivo) {
      setAbiertos((prev) => new Set([...prev, grupoActivo.label]));
    }
  }, [grupoActivo?.label]);

  const { data: marcas } = useApi("/marcas/");
  const { data: productos, cargando } = useApi(
    buildEndpoint({ categorias: categoriasParam, ...filtros })
  );

  useEffect(() => {
    setPagina(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoriasParam, selectedSub, filtros]);

  // Aplicar matchFn de la subcategoría activa (filtrado en frontend)
  const listaBase = Array.isArray(productos) ? productos : [];
  const lista = (subActiva?.matchFn && selectedSub)
    ? listaBase.filter((p) => subActiva.matchFn(p))
    : listaBase;

  const total        = lista.length;
  const totalPaginas = Math.ceil(total / POR_PAGINA);
  const inicio       = (pagina - 1) * POR_PAGINA;
  const enPagina     = lista.slice(inicio, inicio + POR_PAGINA);

  // ── Navegación ──────────────────────────────────────────────
  function irTodas() {
    setSearchParams({});
  }

  function clickGrupo(grupo) {
    const p = new URLSearchParams();
    p.set("categorias", grupo.catIds.join(","));
    setSearchParams(p);
  }

  function clickSub(sub) {
    if (!sub.catId) return;
    const p = new URLSearchParams();
    p.set("categorias", String(sub.catId));
    if (sub.subKey) p.set("sub", sub.subKey);
    setSearchParams(p);
  }

  function toggleGrupo(label) {
    setAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  // ── Marcas ──────────────────────────────────────────────────
  function toggleMarca(id) {
    setFiltros((prev) => ({ ...prev, marca: prev.marca === String(id) ? "" : String(id) }));
  }

  function setFiltro(key, value) {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  }

  function limpiarFiltros() {
    setFiltros({ marca: "", esNuevo: false, esOferta: false, precioMin: "", precioMax: "", orden: "" });
  }

  // ── Highlighting helpers ─────────────────────────────────────
  // Un sub está activo si:
  //  - tiene subKey: selectedSub === sub.subKey (y su catId coincide)
  //  - no tiene subKey: selectedCatIds solo contiene su catId y no hay sub
  function esSubActiva(sub) {
    if (!sub.catId) return false;
    if (sub.subKey) return selectedSub === sub.subKey && selectedCatIds.includes(sub.catId);
    return !selectedSub && selectedCatIds.length === 1 && selectedCatIds[0] === sub.catId;
  }

  // Un grupo está activo si alguno de sus catIds está seleccionado
  function esGrupoActivo(grupo) {
    return grupo.catIds.some((id) => selectedCatIds.includes(id));
  }

  // ── Título del header ─────────────────────────────────────────
  function getTitulo() {
    if (subActiva && selectedSub) return subActiva.label;
    if (grupoActivo) return grupoActivo.label;
    return null;
  }
  const titulo = getTitulo();

  return (
    <div className="min-h-screen bg-fenk-black">
      {/* Cabecera */}
      <div className="bg-fenk-dark border-b border-fenk-border py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="section-title mb-1">
            {titulo ?? "Catálogo"}{" "}
            <span className="text-fenk-red">completo</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {total > 0 ? `${total} producto${total !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-fenk-dark border border-fenk-border rounded-lg p-5 space-y-6">

              {/* Árbol de categorías */}
              <div>
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Categorías
                </h3>

                {/* Todas */}
                <button
                  onClick={irTodas}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded transition-colors mb-1 ${
                    !categoriasParam ? "text-fenk-red font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Todas
                </button>

                {/* Grupos expandibles */}
                <div className="space-y-0.5">
                  {GRUPOS.map((grupo) => {
                    const abierto = abiertos.has(grupo.label);
                    const activo  = esGrupoActivo(grupo);
                    return (
                      <div key={grupo.label}>
                        {/* Cabecera del grupo — clic expande Y filtra */}
                        <div className="flex items-center">
                          <button
                            onClick={() => clickGrupo(grupo)}
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-l text-sm transition-colors ${
                              activo ? "text-fenk-red font-semibold" : "text-gray-300 hover:text-white"
                            }`}
                          >
                            <span className="text-base leading-none">{grupo.icon}</span>
                            <span className="font-heading font-semibold">{grupo.label}</span>
                          </button>
                          {/* Toggle expand/collapse separado */}
                          <button
                            onClick={() => toggleGrupo(grupo.label)}
                            className={`px-2 py-2 text-xs transition-all duration-200 ${
                              activo ? "text-fenk-red" : "text-gray-600 hover:text-gray-400"
                            } ${abierto ? "rotate-90" : ""} inline-block`}
                            style={{ transform: abierto ? "rotate(90deg)" : "rotate(0deg)" }}
                          >
                            ▶
                          </button>
                        </div>

                        {/* Subcategorías */}
                        {abierto && (
                          <div className="ml-4 border-l border-fenk-border pl-3 mb-1 space-y-0.5">
                            {grupo.subs.map((sub) => {
                              const subAct = esSubActiva(sub);
                              return (
                                <button
                                  key={sub.label}
                                  onClick={() => clickSub(sub)}
                                  disabled={sub.catId === null}
                                  className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                                    sub.catId === null
                                      ? "text-gray-700 cursor-default"
                                      : subAct
                                      ? "text-fenk-red font-semibold bg-fenk-red/5"
                                      : "text-gray-500 hover:text-white"
                                  }`}
                                >
                                  {subAct && <span className="mr-1">›</span>}
                                  {sub.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Marcas — checkboxes single-select */}
              {marcas?.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                    Marcas
                  </h3>
                  <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                    {marcas.map((m) => {
                      const checked = filtros.marca === String(m.id);
                      return (
                        <label key={m.id} className="flex items-center gap-2 cursor-pointer group">
                          <span
                            onClick={() => toggleMarca(m.id)}
                            className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                              checked ? "bg-fenk-red border-fenk-red" : "border-gray-600 group-hover:border-gray-400"
                            }`}
                          >
                            {checked && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5"
                                  strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span
                            onClick={() => toggleMarca(m.id)}
                            className={`text-sm transition-colors select-none ${
                              checked ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-200"
                            }`}
                          >
                            {m.nombre}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Precio USD */}
              <div>
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Precio (USD)
                </h3>
                <div className="flex gap-2">
                  <input type="number" placeholder="Mín" value={filtros.precioMin}
                    onChange={(e) => setFiltro("precioMin", e.target.value)}
                    className="w-full bg-fenk-card border border-fenk-border text-gray-300 text-sm rounded px-2 py-1.5 focus:border-fenk-red outline-none" />
                  <input type="number" placeholder="Máx" value={filtros.precioMax}
                    onChange={(e) => setFiltro("precioMax", e.target.value)}
                    className="w-full bg-fenk-card border border-fenk-border text-gray-300 text-sm rounded px-2 py-1.5 focus:border-fenk-red outline-none" />
                </div>
              </div>

              {/* Filtros rápidos */}
              <div>
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Filtros
                </h3>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={filtros.esNuevo}
                    onChange={(e) => setFiltro("esNuevo", e.target.checked)}
                    className="accent-fenk-red" />
                  <span className="text-gray-400 text-sm">Nuevos ingresos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filtros.esOferta}
                    onChange={(e) => setFiltro("esOferta", e.target.checked)}
                    className="accent-fenk-red" />
                  <span className="text-gray-400 text-sm">En oferta</span>
                </label>
              </div>

              {/* Ordenar */}
              <div>
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Ordenar
                </h3>
                <select value={filtros.orden} onChange={(e) => setFiltro("orden", e.target.value)}
                  className="w-full bg-fenk-card border border-fenk-border text-gray-300 text-sm rounded px-3 py-2 focus:border-fenk-red outline-none">
                  <option value="">Relevancia</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                  <option value="nombre">Nombre A-Z</option>
                </select>
              </div>

              <button onClick={limpiarFiltros}
                className="w-full text-gray-500 hover:text-fenk-red text-xs font-heading uppercase tracking-wider transition-colors">
                Limpiar filtros
              </button>
            </div>
          </aside>

          {/* ── Grid de productos ──────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {cargando ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="card-gaming h-80 animate-pulse" />
                ))}
              </div>
            ) : enPagina.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-heading text-xl text-gray-500">Sin productos con estos filtros</p>
                {selectedSub && (
                  <button
                    onClick={() => { const p = new URLSearchParams(searchParams); p.delete("sub"); setSearchParams(p); }}
                    className="mt-4 text-fenk-red text-sm font-heading uppercase hover:underline"
                  >
                    Ver todos en esta categoría
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {enPagina.map((producto, idx) => (
                  <div key={producto.id} className="animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                    <CardProducto producto={producto} />
                  </div>
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => { setPagina((p) => p - 1); window.scrollTo({ top: 0 }); }}
                  disabled={pagina === 1}
                  className="px-5 py-2 rounded border border-fenk-border text-gray-400 hover:border-fenk-red hover:text-fenk-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-heading font-semibold"
                >
                  ← Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                    <button key={n}
                      onClick={() => { setPagina(n); window.scrollTo({ top: 0 }); }}
                      className={`w-9 h-9 rounded text-sm font-heading font-semibold transition-colors ${
                        n === pagina ? "bg-fenk-red text-white" : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setPagina((p) => p + 1); window.scrollTo({ top: 0 }); }}
                  disabled={pagina === totalPaginas}
                  className="px-5 py-2 rounded border border-fenk-border text-gray-400 hover:border-fenk-red hover:text-fenk-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-heading font-semibold"
                >
                  Siguiente →
                </button>
              </div>
            )}
            {totalPaginas > 1 && (
              <p className="text-center text-xs text-gray-600 mt-2">
                Página {pagina} de {totalPaginas} · {total} productos
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
