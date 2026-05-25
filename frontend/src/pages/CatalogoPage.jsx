import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import CardProducto from "../components/CardProducto";

const POR_PAGINA = 12;

// Árbol estático de grupos y subcategorías (catId → category pk en la DB)
const GRUPOS = [
  {
    label: "Laptops", icon: "💻", catIds: [16],
    subs: [
      { label: "Laptops Gaming",    catId: 16 },
      { label: "Laptops Oficina",   catId: 16 },
      { label: "Laptops Estudiante",catId: 16 },
    ],
  },
  {
    label: "PCs Completas", icon: "🖥️", catIds: [17],
    subs: [
      { label: "PCs Gaming",      catId: 17 },
      { label: "PCs Oficina",     catId: 17 },
      { label: "PCs Workstation", catId: 17 },
    ],
  },
  {
    label: "Componentes", icon: "⚙️", catIds: [1, 2, 3, 4, 5, 6, 7],
    subs: [
      { label: "Procesadores",    catId: 1 },
      { label: "Placas Madre",    catId: 2 },
      { label: "Memorias RAM",    catId: 3 },
      { label: "Tarjetas de Video",catId: 5 },
      { label: "Almacenamiento",  catId: 4 },
      { label: "Fuentes de Poder",catId: 6 },
      { label: "Gabinetes",       catId: 7 },
      { label: "Refrigeración",   catId: null },
    ],
  },
  {
    label: "Monitores", icon: "🖥️", catIds: [8],
    subs: [
      { label: "Monitor Gaming",     catId: 8 },
      { label: "Monitor Curvo",      catId: 8 },
      { label: "Monitor 2K QHD",     catId: 8 },
      { label: "Monitor 4K",         catId: 8 },
      { label: "Monitor Profesional",catId: 8 },
    ],
  },
  {
    label: "Periféricos PC", icon: "🖱️", catIds: [9, 10, 11, 12, 13, 14, 15],
    subs: [
      { label: "Teclados",           catId: 9 },
      { label: "Mouse",              catId: 10 },
      { label: "Auriculares",        catId: 11 },
      { label: "Micrófonos",         catId: 14 },
      { label: "Mousepad",           catId: 12 },
      { label: "Cámaras Web",        catId: 15 },
      { label: "Estabilizadores UPS",catId: 13 },
    ],
  },
  {
    label: "Sillas Gaming", icon: "🪑", catIds: [18],
    subs: [
      { label: "Sillas Racing",    catId: 18 },
      { label: "Escritorios Gaming",catId: null },
    ],
  },
];

function buildEndpoint({ categoria, marca, esNuevo, esOferta, precioMin, precioMax, orden }) {
  const p = new URLSearchParams();
  if (categoria) p.set("categoria", categoria);
  if (marca)     p.set("marca", marca);
  if (esNuevo)   p.set("es_nuevo", "true");
  if (esOferta)  p.set("es_oferta", "true");
  if (precioMin) p.set("precio_min", precioMin);
  if (precioMax) p.set("precio_max", precioMax);
  if (orden)     p.set("orden", orden);
  return `/productos/?${p.toString()}`;
}

export default function CatalogoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState({
    marca: "", esNuevo: false, esOferta: false, precioMin: "", precioMax: "", orden: "",
  });

  const categoriaParam  = searchParams.get("categoria");
  const categoriaActiva = categoriaParam ? parseInt(categoriaParam) : null;

  // Determinar cuál grupo está activo para auto-expandir
  const grupoActivoLabel = GRUPOS.find((g) => g.catIds.includes(categoriaActiva))?.label ?? null;

  // Grupos expandidos: auto-expande el grupo de la categoría activa
  const [abiertos, setAbiertos] = useState(() => {
    const inicial = new Set();
    if (grupoActivoLabel) inicial.add(grupoActivoLabel);
    return inicial;
  });

  useEffect(() => {
    if (grupoActivoLabel) {
      setAbiertos((prev) => new Set([...prev, grupoActivoLabel]));
    }
  }, [grupoActivoLabel]);

  const { data: marcas }   = useApi("/marcas/");
  const { data: productos, cargando } = useApi(buildEndpoint({ categoria: categoriaActiva, ...filtros }));

  useEffect(() => {
    setPagina(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoriaActiva, filtros]);

  const lista        = Array.isArray(productos) ? productos : [];
  const total        = lista.length;
  const totalPaginas = Math.ceil(total / POR_PAGINA);
  const inicio       = (pagina - 1) * POR_PAGINA;
  const enPagina     = lista.slice(inicio, inicio + POR_PAGINA);

  function seleccionarCategoria(id) {
    const p = new URLSearchParams(searchParams);
    if (id === null) p.delete("categoria");
    else p.set("categoria", id);
    setSearchParams(p);
  }

  function setFiltro(key, value) {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  }

  function toggleGrupo(label) {
    setAbiertos((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleMarca(id) {
    setFiltro("marca", filtros.marca === String(id) ? "" : String(id));
  }

  const limpiarFiltros = () =>
    setFiltros({ marca: "", esNuevo: false, esOferta: false, precioMin: "", precioMax: "", orden: "" });

  return (
    <div className="min-h-screen bg-fenk-black">
      {/* Cabecera */}
      <div className="bg-fenk-dark border-b border-fenk-border py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="section-title mb-1">
            {categoriaActiva
              ? GRUPOS.flatMap((g) => g.subs).find((s) => s.catId === categoriaActiva)?.label
                ?? "Catálogo"
              : "Catálogo"}{" "}
            <span className="text-fenk-red">completo</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {total > 0 ? `${total} producto${total !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ── */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-fenk-dark border border-fenk-border rounded-lg p-5 space-y-6">

              {/* Categorías con árbol expandible */}
              <div>
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Categorías
                </h3>

                {/* Todas */}
                <button
                  onClick={() => seleccionarCategoria(null)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded transition-colors mb-1 ${
                    categoriaActiva === null ? "text-fenk-red font-semibold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Todas
                </button>

                {/* Grupos expandibles */}
                <div className="space-y-0.5">
                  {GRUPOS.map((grupo) => {
                    const estaAbierto = abiertos.has(grupo.label);
                    const grupoActivo = grupo.catIds.includes(categoriaActiva);
                    return (
                      <div key={grupo.label}>
                        {/* Cabecera del grupo */}
                        <button
                          onClick={() => toggleGrupo(grupo.label)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                            grupoActivo
                              ? "text-fenk-red font-semibold"
                              : "text-gray-300 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-base leading-none">{grupo.icon}</span>
                            <span className="font-heading font-semibold">{grupo.label}</span>
                          </span>
                          <span className={`text-gray-600 text-xs transition-transform duration-200 ${estaAbierto ? "rotate-90" : ""}`}>
                            ▶
                          </span>
                        </button>

                        {/* Subcategorías */}
                        {estaAbierto && (
                          <div className="ml-4 border-l border-fenk-border pl-3 mt-0.5 mb-1 space-y-0.5">
                            {grupo.subs.map((sub) => (
                              <button
                                key={sub.label}
                                onClick={() => seleccionarCategoria(sub.catId)}
                                disabled={sub.catId === null}
                                className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                                  sub.catId === null
                                    ? "text-gray-700 cursor-default"
                                    : categoriaActiva === sub.catId
                                    ? "text-fenk-red font-semibold"
                                    : "text-gray-500 hover:text-white"
                                }`}
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Marcas — checkboxes */}
              {marcas?.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                    Marcas
                  </h3>
                  <div className="space-y-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                    {marcas.map((m) => {
                      const checked = filtros.marca === String(m.id);
                      return (
                        <label key={m.id}
                          className="flex items-center gap-2 cursor-pointer group">
                          <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                            checked ? "bg-fenk-red border-fenk-red" : "border-gray-600 group-hover:border-gray-400"
                          }`} onClick={() => toggleMarca(m.id)}>
                            {checked && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                          <span
                            onClick={() => toggleMarca(m.id)}
                            className={`text-sm transition-colors ${checked ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-200"}`}
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

          {/* Grid de productos */}
          <div className="flex-1 min-w-0">
            {cargando ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => <div key={i} className="card-gaming h-80 animate-pulse" />)}
              </div>
            ) : enPagina.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🔍</p>
                <p className="font-heading text-xl text-gray-500">Sin productos con estos filtros</p>
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
                <button onClick={() => { setPagina((p) => p - 1); window.scrollTo({ top: 0 }); }}
                  disabled={pagina === 1}
                  className="px-5 py-2 rounded border border-fenk-border text-gray-400 hover:border-fenk-red hover:text-fenk-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-heading font-semibold">
                  ← Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => { setPagina(n); window.scrollTo({ top: 0 }); }}
                      className={`w-9 h-9 rounded text-sm font-heading font-semibold transition-colors ${
                        n === pagina ? "bg-fenk-red text-white" : "text-gray-500 hover:text-white"
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setPagina((p) => p + 1); window.scrollTo({ top: 0 }); }}
                  disabled={pagina === totalPaginas}
                  className="px-5 py-2 rounded border border-fenk-border text-gray-400 hover:border-fenk-red hover:text-fenk-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-heading font-semibold">
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
