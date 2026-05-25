import { Link } from "react-router-dom";
import { useConfig } from "../context/ConfigContext";

export default function Hero() {
  const { config } = useConfig();
  const whatsapp = (config?.whatsapp || "+51999999999").replace(/\D/g, "");

  return (
    <section className="relative bg-fenk-black min-h-[85vh] flex items-center overflow-hidden">
      {/* Grid de fondo */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#e63535 1px, transparent 1px), linear-gradient(90deg, #e63535 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />
      {/* Glow central */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] bg-fenk-red opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-fenk-red/10 border border-fenk-red/30 text-fenk-red text-xs font-heading font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            Lima, Perú · Gaming & Tech
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-heading text-white leading-tight mb-6 animate-slide-up">
            EQUIPA TU{" "}
            <span className="text-fenk-red drop-shadow-[0_0_20px_rgba(230,53,53,0.8)]">
              SETUP
            </span>
            <br />
            AL SIGUIENTE
            <br />
            NIVEL
          </h1>

          <p className="text-gray-400 text-lg mb-8 max-w-lg leading-relaxed">
            Laptops, PCs armadas, componentes y accesorios gaming. Los mejores
            precios en Lima con garantía y soporte técnico especializado.
          </p>

          <div className="flex flex-wrap gap-4 mb-14">
            <Link to="/catalogo" className="btn-red text-base px-8 py-3">
              Ver catálogo
            </Link>
            <Link to="/configurador" className="btn-outline-red text-base px-8 py-3">
              Arma tu PC
            </Link>
          </div>

          <div className="flex flex-wrap gap-10">
            {[
              { valor: "+200", texto: "Productos" },
              { valor: "20+", texto: "Marcas top" },
              { valor: "+1,000", texto: "Clientes" },
              { valor: "12 meses", texto: "Garantía" },
            ].map((s) => (
              <div key={s.texto}>
                <div className="text-2xl font-bold font-heading text-fenk-red">{s.valor}</div>
                <div className="text-gray-500 text-sm">{s.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
