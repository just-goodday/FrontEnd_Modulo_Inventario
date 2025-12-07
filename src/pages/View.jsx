import { Outlet } from "react-router-dom";
import CustomHeader from "../components/Header/Header.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";
import Style from "./View.module.css";
import StatCard from "../components/ui/StatCard.jsx";

export default function View() {
  const title = "Inicio";

  return (
    <div className={Style.Container}>
      <div className={Style.SideBar} style={{ backgroundColor: "#ffffff" }}>
        <Sidebar />
      </div>

      <div className={Style.Content}>
        <div className={Style.Header} style={{ backgroundColor: "#ffffff" }}>
          <CustomHeader title={title} isBack={title !== "Inicio"} />
        </div>

        {/* Contenido bajo el header */}
        <div className={Style.Outlet}>
          {/* Fila de cards */}
          <div className={Style.CardsRow}>
            <div className={Style.Card}>
              <StatCard
                icono_url="https://api.iconify.design/mdi:shopping.svg?color=white"
                background="#13c888"
                titulo="Total Productos"
                valor="1,247"
              />
            </div>
            <div className={Style.Card}>
              <StatCard
                icono_url="https://api.iconify.design/mdi:cart-outline.svg?color=white"
                background="#0ea5e9"
                titulo="Ventas Hoy"
                valor="57"
              />
            </div>
            <div className={Style.Card}>
              <StatCard
                icono_url="https://api.iconify.design/mdi:cash-multiple.svg?color=white"
                background="#f59e0b"
                titulo="Ingresos"
                valor="S/ 12,350"
              />
            </div>
            <div className={Style.Card}>
              <StatCard
                icono_url="https://api.iconify.design/mdi:package-variant-closed.svg?color=white"
                background="#ef4444"
                titulo="Stock Bajo"
                valor="23"
              />
            </div>
          </div>

          {/* Resto del contenido (rutas hijas) */}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
