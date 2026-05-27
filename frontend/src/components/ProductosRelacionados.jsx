import { useApi } from "../hooks/useApi";
import CardProducto from "./CardProducto";

export default function ProductosRelacionados({ categoriaId, productoActualId }) {
  const { data: productos, cargando } = useApi(
    categoriaId ? `/productos/?categorias=${categoriaId}` : null
  );

  const relacionados = productos?.filter((p) => p.id !== productoActualId).slice(0, 3);

  if (!categoriaId || cargando || !relacionados?.length) return null;

  return (
    <section className="py-14 border-t border-fenk-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="section-title">
            Productos <span className="text-fenk-red">relacionados</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">De la misma categoría</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relacionados.map((producto, i) => (
            <div key={producto.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <CardProducto producto={producto} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
