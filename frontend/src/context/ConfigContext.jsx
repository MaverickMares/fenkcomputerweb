import { createContext, useContext } from "react";
import { useApi } from "../hooks/useApi";

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const { data, cargando } = useApi("/configuracion/");
  // El endpoint devuelve objeto único (no lista)
  const config = Array.isArray(data) ? data[0] : data;

  return (
    <ConfigContext.Provider value={{ config, cargando }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
