import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import CardProducto from "./CardProducto";

export default function SeccionProductos({ titulo, acento, params, verMasLink }) {
  const { data, cargando } = useApi(`/productos/?${params}`);
  const productos = Array.isArray(data) ? data : data?.results || [];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">
            {titulo} <span className="text-fenk-red">{acento}</span>
          </h2>
          {verMasLink && (
            <Link
              to={verMasLink}
              className="text-fenk-red hover:text-white transition-colors text-sm font-heading font-semibold uppercase tracking-wider"
            >
              Ver todos →
            </Link>
          )}
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-gaming h-72 animate-pulse" />
            ))}
          </div>
        ) : productos.length === 0 ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {productos.slice(0, 6).map((p, i) => (
              <div key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <CardProducto producto={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
