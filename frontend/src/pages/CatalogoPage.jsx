import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import CardProducto from "../components/CardProducto";

const POR_PAGINA = 12;

function buildEndpoint({ categoria, marca, esNuevo, esOferta, precioMin, precioMax, orden }) {
  const p = new URLSearchParams();
  if (categoria) p.set("categoria", categoria);
  if (marca) p.set("marca", marca);
  if (esNuevo) p.set("es_nuevo", "true");
  if (esOferta) p.set("es_oferta", "true");
  if (precioMin) p.set("precio_min", precioMin);
  if (precioMax) p.set("precio_max", precioMax);
  if (orden) p.set("orden", orden);
  return `/productos/?${p.toString()}`;
}

export default function CatalogoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState({
    marca: "",
    esNuevo: false,
    esOferta: false,
    precioMin: "",
    precioMax: "",
    orden: "",
  });

  const categoriaParam = searchParams.get("categoria");
  const categoriaActiva = categoriaParam ? parseInt(categoriaParam) : null;

  const { data: categorias } = useApi("/categorias/");
  const { data: marcas } = useApi("/marcas/");
  const { data: productos, cargando } = useApi(
    buildEndpoint({ categoria: categoriaActiva, ...filtros })
  );

  useEffect(() => {
    setPagina(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoriaActiva, filtros]);

  const lista = Array.isArray(productos) ? productos : [];
  const total = lista.length;
  const totalPaginas = Math.ceil(total / POR_PAGINA);
  const inicio = (pagina - 1) * POR_PAGINA;
  const enPagina = lista.slice(inicio, inicio + POR_PAGINA);

  function seleccionarCategoria(id) {
    const p = new URLSearchParams(searchParams);
    if (id === null) p.delete("categoria");
    else p.set("categoria", id);
    setSearchParams(p);
  }

  function setFiltro(key, value) {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-fenk-black">
      {/* Cabecera */}
      <div className="bg-fenk-dark border-b border-fenk-border py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="section-title mb-1">
            {categorias?.find((c) => c.id === categoriaActiva)?.nombre ?? "Catálogo"}{" "}
            <span className="text-fenk-red">completo</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {total > 0 ? `${total} producto${total !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filtros */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-fenk-dark border border-fenk-border rounded-lg p-5 space-y-6">
              {/* Categorías */}
              <div>
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Categoría
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => seleccionarCategoria(null)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded transition-colors ${
                      categoriaActiva === null
                        ? "text-fenk-red font-semibold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Todas
                  </button>
                  {categorias?.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => seleccionarCategoria(c.id)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded transition-colors ${
                        categoriaActiva === c.id
                          ? "text-fenk-red font-semibold"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {c.icono} {c.nombre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marcas */}
              {marcas?.length > 0 && (
                <div>
                  <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                    Marca
                  </h3>
                  <select
                    value={filtros.marca}
                    onChange={(e) => setFiltro("marca", e.target.value)}
                    className="w-full bg-fenk-card border border-fenk-border text-gray-300 text-sm rounded px-3 py-2 focus:border-fenk-red outline-none"
                  >
                    <option value="">Todas las marcas</option>
                    {marcas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Precio */}
              <div>
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Precio (USD)
                </h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filtros.precioMin}
                    onChange={(e) => setFiltro("precioMin", e.target.value)}
                    className="w-full bg-fenk-card border border-fenk-border text-gray-300 text-sm rounded px-2 py-1.5 focus:border-fenk-red outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filtros.precioMax}
                    onChange={(e) => setFiltro("precioMax", e.target.value)}
                    className="w-full bg-fenk-card border border-fenk-border text-gray-300 text-sm rounded px-2 py-1.5 focus:border-fenk-red outline-none"
                  />
                </div>
              </div>

              {/* Filtros rápidos */}
              <div>
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Filtros
                </h3>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={filtros.esNuevo}
                    onChange={(e) => setFiltro("esNuevo", e.target.checked)}
                    className="accent-fenk-red"
                  />
                  <span className="text-gray-400 text-sm">Nuevos ingresos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.esOferta}
                    onChange={(e) => setFiltro("esOferta", e.target.checked)}
                    className="accent-fenk-red"
                  />
                  <span className="text-gray-400 text-sm">En oferta</span>
                </label>
              </div>

              {/* Ordenar */}
              <div>
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Ordenar
                </h3>
                <select
                  value={filtros.orden}
                  onChange={(e) => setFiltro("orden", e.target.value)}
                  className="w-full bg-fenk-card border border-fenk-border text-gray-300 text-sm rounded px-3 py-2 focus:border-fenk-red outline-none"
                >
                  <option value="">Relevancia</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                  <option value="nombre">Nombre A-Z</option>
                </select>
              </div>

              <button
                onClick={() => setFiltros({ marca: "", esNuevo: false, esOferta: false, precioMin: "", precioMax: "", orden: "" })}
                className="w-full text-gray-500 hover:text-fenk-red text-xs font-heading uppercase tracking-wider transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </aside>

          {/* Grid */}
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
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {enPagina.map((producto, idx) => (
                  <div
                    key={producto.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
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
                    <button
                      key={n}
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
