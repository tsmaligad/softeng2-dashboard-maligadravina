// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import folder from "../assets/softeng2_folder.png";
import groupicon from "../assets/group.png";
import logoutIcon from "../assets/softeng2_logout.png";
import logo from "../assets/sweettreats_logo.png";
import dashboardicon from "../assets/dashboard1.png";
import home from "../assets/home.png";

// ✅ use api.js instead of authService
import { api } from "../utils/api";

function nameFromEmail(email = "") {
  const local = String(email).split("@")[0] || "";
  if (!local) return "Name";
  // replace separators with spaces, title-case each part
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

const Sidebar = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "Name",
    email: "email@addu.edu.ph",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me(); // expect { success, name?, email? }
        if (!cancelled && me?.success) {
          const email = me.email || profile.email;
          const name = me.name || nameFromEmail(email);
          setProfile({ name, email });
        }
      } catch {
        // leave defaults
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Base pill
  const itemBase =
    "relative inline-flex items-center gap-[10px] justify-start pl-4 pr-4 h-[32px] rounded-full transition-colors duration-200 " +
    "select-none no-underline visited:no-underline focus:outline-none focus:ring-0 w-[160px]";

  const activeItem   = "bg-[#FFC6C6] text-[#1D1B20]";
  const inactiveItem =
    "!text-white filter brightness-0 invert no-underline decoration-transparent visited:!text-white hover:!text-white focus:!text-white active:!text-white hover:bg-white/10";

  async function handleLogout() {
    try { await api.logout(); } catch {}
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <aside className="sidebar w-[240px] min-h-screen bg-[#4A3600] text-white flex flex-col items-center px-8 py-6 ">
      {/* Scoped rules: remove forced colors so you control them manually */}
      <style>{`
        .sidebar a,
        .sidebar a:visited,
        .sidebar a:hover,
        .sidebar a:focus,
        .sidebar a:active {
          text-decoration: none !important;
        }
      `}</style>

      {/* Profile */}
      <div className="w-full flex flex-col items-center mt-[40px] text-white">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E6E1E5] flex items-center justify-center shadow-inner">
          <img src={logo} alt="Avatar" className="w-[70px] h-[70px] object-cover" />
        </div>
        <p
          style={{ color: "white", fontWeight: "bold" }}
          className="text-[20px] leading-tight mt-[16px]"
        >
          {profile.name}
        </p>
        <p
          style={{ color: "white" }}
          className="text-[12px] mt-[-10px]"
        >
          {profile.email}
        </p>
      </div>

      {/* Nav */}
      <nav className="w-full mt-[20px]">
        <ul className="list-none space-y-[10px]">
          {/* Dashboard */}
<li className="flex justify-start">
  <NavLink
    to="/admin-dashboard"
    end
    className={({ isActive }) =>
      `${itemBase} ${isActive ? activeItem : inactiveItem} flex items-center gap-2`
    }
  >
    <img
      src={dashboardicon}
      alt="Dashboard"
      className={`w-[16px] ml-[25px] h-[16px] ${location.pathname === "/admin-dashboard" ? "filter-none" : "filter brightness-0 invert"}`}
    />
    <span className="text-[15px] ml-[5px]">Dashboard</span>
  </NavLink>
</li>

{/* Users */}
<li className="flex justify-start">
  <NavLink
    to="/userlist"
    className={({ isActive }) =>
      `${itemBase} ${isActive ? activeItem : inactiveItem}`
    }
  >
    <img
      src={groupicon}
      alt="Users"
      className={`w-[16px] ml-[25px] h-[16px] ${location.pathname === "/userlist" ? "filter-none" : "filter brightness-0 invert"}`}
    />
    <span className="text-[15px] ml-[5px]">Users</span>
  </NavLink>
</li>

{/* BALIK TO HOMEPAGE */}
<li className="flex justify-start">
  <NavLink
    to="/"
    className={({ isActive }) =>
      `${itemBase} ${isActive ? activeItem : inactiveItem}`
    }
  >
    <img
      src={home}
      alt="Home"
      className={`w-[16px] ml-[25px] h-[16px] ${location.pathname === "/userlist" ? "filter-none" : "filter brightness-0 invert"}`}
    />
    <span className="text-[15px] ml-[5px]">Home</span>
  </NavLink>
</li>

{/* Logout */}
<li className="flex justify-start">
  <button
    type="button"
    onClick={handleLogout}
    className={`${itemBase} ${inactiveItem} bg-transparent border-0 appearance-none cursor-pointer flex items-center gap-[10px]`}
  >
    <img
      src={logoutIcon}
      alt="Logout"
      className="w-[16px] h-[16px] shrink-0 filter invert brightness-0 ml-[20px]"
    />
    <span className="text-[13px] leading-none ml-[5px]">Logout</span>
  </button>
</li>


        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
