import { Link } from "react-router-dom";
import { useConfig } from "../context/ConfigContext";

const API_MEDIA = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace("/api", "");

export default function CardProducto({ producto }) {
  const { config } = useConfig();
  const whatsapp = (config?.whatsapp || "+51999999999").replace(/\D/g, "");
  const imgUrl = producto.imagen
    ? (producto.imagen.startsWith("http") ? producto.imagen : `${API_MEDIA}${producto.imagen}`)
    : null;

  const msgWa = encodeURIComponent(
    `Hola! Me interesa: ${producto.nombre} — S/ ${parseFloat(producto.precio_soles).toFixed(2)}`
  );

  return (
    <article className="card-gaming flex flex-col">
      {/* Imagen */}
      <Link
        to={`/producto/${producto.id}`}
        className="block relative overflow-hidden bg-fenk-dark"
        style={{ aspectRatio: "4/3" }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {producto.es_nuevo && <span className="badge-new">Nuevo</span>}
          {producto.es_oferta && <span className="badge-offer">Oferta</span>}
          {producto.consultar_disponibilidad && <span className="badge-consult">Consultar</span>}
        </div>
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-gray-300 font-heading font-bold text-sm uppercase tracking-wider">
              Sin stock
            </span>
          </div>
        )}
      </Link>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-1.5 mb-1">
          {producto.marca_nombre && (
            <span className="text-fenk-red text-xs font-heading font-semibold uppercase">
              {producto.marca_nombre}
            </span>
          )}
          {producto.marca_nombre && producto.categoria_nombre && (
            <span className="text-fenk-border text-xs">·</span>
          )}
          {producto.categoria_nombre && (
            <span className="text-gray-600 text-xs">{producto.categoria_nombre}</span>
          )}
        </div>

        <Link to={`/producto/${producto.id}`}>
          <h3 className="font-heading font-bold text-white text-sm leading-snug mb-3 hover:text-fenk-red transition-colors line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="text-fenk-red font-bold font-heading text-xl">
            S/ {parseFloat(producto.precio_soles).toFixed(2)}
          </div>
          <div className="text-gray-600 text-xs mb-2">
            USD ${parseFloat(producto.precio_usd).toFixed(2)}
          </div>
          <div className="text-xs mb-3">
            {producto.stock > 0 ? (
              <span className="text-green-400 font-semibold">En stock ({producto.stock})</span>
            ) : (
              <span className="text-red-400 font-semibold">Sin stock</span>
            )}
          </div>
          <a
            href={`https://wa.me/${whatsapp}?text=${msgWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-red w-full text-center text-sm py-2 block"
          >
            Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
