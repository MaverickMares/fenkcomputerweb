import { Link } from "react-router-dom";
import { useConfig } from "../context/ConfigContext";

export default function Footer() {
  const { config } = useConfig();
  const whatsapp = (config?.whatsapp || "+51999999999").replace(/\D/g, "");

  return (
    <footer className="bg-fenk-dark border-t border-fenk-border">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold font-heading text-fenk-red drop-shadow-[0_0_10px_rgba(230,53,53,0.7)]">
                FENK
              </span>
              <span className="text-white font-heading font-semibold text-lg">Computers</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Tu tienda gaming en Lima, Perú. Laptops, PCs, componentes y accesorios con garantía y soporte técnico.
            </p>
            <div className="flex gap-4">
              {config?.instagram && (
                <a
                  href={`https://instagram.com/${config.instagram.replace("@", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-fenk-red transition-colors text-sm font-heading font-semibold"
                >
                  Instagram
                </a>
              )}
              {config?.facebook && (
                <a
                  href={`https://facebook.com/${config.facebook.replace("/", "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-fenk-red transition-colors text-sm font-heading font-semibold"
                >
                  Facebook
                </a>
              )}
              {config?.tiktok && (
                <a
                  href={`https://tiktok.com/${config.tiktok}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-gray-500 hover:text-fenk-red transition-colors text-sm font-heading font-semibold"
                >
                  TikTok
                </a>
              )}
            </div>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="font-heading font-bold text-white text-lg mb-4 uppercase tracking-wider">
              Navegación
            </h3>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Inicio" },
                { to: "/catalogo", label: "Catálogo" },
                { to: "/configurador", label: "Arma tu PC" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-gray-400 hover:text-fenk-red transition-colors text-sm"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-heading font-bold text-white text-lg mb-4 uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              {config?.whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-fenk-red transition-colors"
                  >
                    WhatsApp: {config.whatsapp}
                  </a>
                </li>
              )}
              {config?.direccion && <li>{config.direccion}</li>}
            </ul>
          </div>
        </div>

        <div className="border-t border-fenk-border mt-10 pt-6 text-center">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} FENK Computers. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
