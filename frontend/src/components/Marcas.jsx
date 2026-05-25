import { useApi } from "../hooks/useApi";

export default function Marcas() {
  const { data: marcas, cargando } = useApi("/marcas/");

  if (cargando || !marcas?.length) return null;

  return (
    <section className="bg-fenk-dark border-y border-fenk-border py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="h-px flex-1 bg-fenk-border" />
          <span className="text-gray-600 text-xs font-heading uppercase tracking-widest px-2">
            Marcas disponibles
          </span>
          <div className="h-px flex-1 bg-fenk-border" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {marcas.map((marca) => (
            <span
              key={marca.id}
              className="text-gray-500 hover:text-white transition-colors font-heading font-bold text-xl tracking-widest cursor-default uppercase"
            >
              {marca.nombre}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
