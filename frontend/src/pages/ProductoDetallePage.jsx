import { useParams, Link, useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { useConfig } from "../context/ConfigContext";
import GaleriaFotos from "../components/GaleriaFotos";
import ProductosRelacionados from "../components/ProductosRelacionados";

export default function ProductoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { config } = useConfig();
  const { data: producto, cargando, error } = useApi(`/productos/${id}/`);

  const whatsapp = (config?.whatsapp || "+51999999999").replace(/\D/g, "");
  const msgWa = producto
    ? encodeURIComponent(
        `Hola! Me interesa el producto: ${producto.nombre}\nPrecio: S/ ${parseFloat(producto.precio_soles).toFixed(2)} / USD $${parseFloat(producto.precio_usd).toFixed(2)}\n¿Está disponible?`
      )
    : "";

  if (cargando) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-[4/3] bg-fenk-dark rounded-xl" />
          <div className="space-y-4 pt-4">
            <div className="h-3 bg-fenk-border rounded w-1/4" />
            <div className="h-8 bg-fenk-border rounded w-3/4" />
            <div className="h-6 bg-fenk-border rounded w-1/4" />
            <div className="h-12 bg-fenk-red/30 rounded mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="text-center py-24 px-4">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="font-heading text-2xl text-gray-400 mb-4">Producto no encontrado</h2>
        <Link to="/catalogo" className="btn-red">Ver catálogo</Link>
      </div>
    );
  }

  const specs = producto.especificaciones && Object.keys(producto.especificaciones).length > 0
    ? producto.especificaciones
    : null;

  return (
    <div className="bg-fenk-black min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-fenk-dark border-b border-fenk-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/" className="hover:text-fenk-red transition-colors">Inicio</Link>
            <span>›</span>
            <Link to="/catalogo" className="hover:text-fenk-red transition-colors">Catálogo</Link>
            {producto.categoria_nombre && (
              <>
                <span>›</span>
                <Link
                  to={`/catalogo?categoria=${producto.categoria}`}
                  className="hover:text-fenk-red transition-colors"
                >
                  {producto.categoria_nombre}
                </Link>
              </>
            )}
            <span>›</span>
            <span className="text-gray-300 truncate max-w-[200px]">{producto.nombre}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Galería */}
          <div className="animate-fade-in">
            <GaleriaFotos imagenPrincipal={producto.imagen} galeria={producto.galeria || []} />
          </div>

          {/* Información */}
          <div className="animate-slide-up">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {producto.es_nuevo && <span className="badge-new">Nuevo</span>}
              {producto.es_oferta && <span className="badge-offer">Oferta</span>}
              {producto.consultar_disponibilidad && <span className="badge-consult">Consultar</span>}
              {producto.marca_nombre && (
                <span className="text-xs font-heading font-semibold text-fenk-red uppercase border border-fenk-red/30 px-2 py-0.5 rounded">
                  {producto.marca_nombre}
                </span>
              )}
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              {producto.nombre}
            </h1>

            {/* Precios */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-heading text-4xl font-bold text-fenk-red">
                S/ {parseFloat(producto.precio_soles).toFixed(2)}
              </span>
            </div>
            <div className="text-gray-500 text-sm mb-4">
              USD ${parseFloat(producto.precio_usd).toFixed(2)}
            </div>

            {/* Stock */}
            <div className="mb-5">
              {producto.stock > 0 ? (
                <span className="text-green-400 text-sm font-semibold">
                  ✓ En stock ({producto.stock} unidades)
                </span>
              ) : (
                <span className="text-red-400 text-sm font-semibold">✗ Sin stock</span>
              )}
            </div>

            <div className="w-12 h-0.5 bg-fenk-red mb-5" />

            {/* Descripción */}
            {producto.descripcion && (
              <p className="text-gray-400 leading-relaxed text-sm mb-6">{producto.descripcion}</p>
            )}

            {/* Especificaciones rápidas */}
            {specs && (
              <div className="bg-fenk-dark border border-fenk-border rounded-lg p-4 mb-6">
                <h3 className="font-heading font-bold text-white text-sm uppercase tracking-wider mb-3">
                  Especificaciones
                </h3>
                <div className="space-y-1.5">
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} className="flex gap-3 text-sm">
                      <span className="text-gray-500 min-w-[120px] shrink-0">{k}</span>
                      <span className="text-gray-300">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA WhatsApp */}
            <a
              href={`https://wa.me/${whatsapp}?text=${msgWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full btn-red py-4 text-base mb-3"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Cotizar por WhatsApp
            </a>

            <button
              onClick={() => navigate(-1)}
              className="w-full border border-fenk-border text-gray-500 hover:border-fenk-red hover:text-fenk-red font-heading font-semibold py-3 rounded transition-colors text-sm uppercase tracking-wider"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>

      <ProductosRelacionados categoriaId={producto.categoria} productoActualId={producto.id} />
    </div>
  );
}
