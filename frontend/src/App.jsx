import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "./context/ConfigContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CatalogoPage from "./pages/CatalogoPage";
import ProductoDetallePage from "./pages/ProductoDetallePage";
import ConfiguradorPage from "./pages/ConfiguradorPage";

function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-fenk-black">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogo" element={<CatalogoPage />} />
              <Route path="/producto/:id" element={<ProductoDetallePage />} />
              <Route path="/configurador" element={<ConfiguradorPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
