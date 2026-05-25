import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(!!endpoint);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) {
      setCargando(false);
      return;
    }
    const controller = new AbortController();

    async function fetchData() {
      try {
        setCargando(true);
        const res = await fetch(`${API_BASE}${endpoint}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        setData(json.results ?? json);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setCargando(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [endpoint]);

  return { data, cargando, error };
}
