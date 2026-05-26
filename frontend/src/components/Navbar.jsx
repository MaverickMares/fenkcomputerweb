import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useConfig } from "../context/ConfigContext";

const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/configurador", label: "Arma tu PC" },
];

export default function Navbar() {
  const { config } = useConfig();
  const [abierto, setAbierto] = useState(false);
  const whatsapp = (config?.whatsapp || "+51999999999").replace(/\D/g, "");

  return (
    <nav className="bg-fenk-black border-b border-fenk-border sticky top-0 z-50">
      {/* Barra de categorías roja */}
      <div className="bg-fenk-red">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-8 overflow-x-auto">
          {[
            { label: "Laptops",       categorias: "16" },
            { label: "PCs Completas", categorias: "17" },
            { label: "Componentes",   categorias: "1,2,3,4,5,6,7" },
            { label: "Monitores",     categorias: "8" },
            { label: "Periféricos",   categorias: "9,10,11,12,13,14,15" },
            { label: "Sillas Gaming", categorias: "18" },
          ].map(({ label, categorias }) => (
            <Link
              key={label}
              to={`/catalogo?categorias=${categorias}`}
              className="text-white text-xs font-heading font-semibold uppercase tracking-wider whitespace-nowrap hover:text-black transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Navbar principal */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold font-heading text-fenk-red drop-shadow-[0_0_10px_rgba(230,53,53,0.7)]">
              FENK
            </span>
            <span className="text-white font-heading font-semibold text-lg tracking-wide">
              Computers
            </span>
          </Link>

          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `font-heading font-semibold text-sm uppercase tracking-wider transition-colors ${
                    isActive ? "text-fenk-red" : "text-gray-300 hover:text-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* CTA + hamburguesa */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-block btn-red text-sm py-2 px-5"
            >
              Cotizar
            </a>
            <button
              className="md:hidden text-white p-2"
              onClick={() => setAbierto(!abierto)}
              aria-label="Menú"
            >
              {abierto ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú mobile */}
      {abierto && (
        <div className="md:hidden bg-fenk-dark border-t border-fenk-border animate-fade-in">
          <div className="px-4 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setAbierto(false)}
                className={({ isActive }) =>
                  `font-heading font-semibold uppercase tracking-wider py-2 ${
                    isActive ? "text-fenk-red" : "text-gray-300"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-red text-sm text-center mt-1"
            >
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
