import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Marcas from "../components/Marcas";
import SeccionProductos from "../components/SeccionProductos";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marcas />
      <SeccionProductos
        titulo="Nuevos"
        acento="Ingresos"
        params="es_nuevo=true"
        verMasLink="/catalogo"
      />
      <SeccionProductos
        titulo="Tarjetas de"
        acento="Video"
        params="categoria=3"
        verMasLink="/catalogo?categoria=3"
      />

      {/* CTA Configurador */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-fenk-red/5 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#e63535 1px, transparent 1px), linear-gradient(90deg, #e63535 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">
            ARMA TU{" "}
            <span className="text-fenk-red drop-shadow-[0_0_15px_rgba(230,53,53,0.7)]">
              PC GAMING
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Selecciona procesador, placa madre, RAM y GPU paso a paso. Cotiza
            todo por WhatsApp en segundos.
          </p>
          <Link to="/configurador" className="btn-red text-base px-10 py-4">
            Iniciar configurador →
          </Link>
        </div>
      </section>
    </>
  );
}
