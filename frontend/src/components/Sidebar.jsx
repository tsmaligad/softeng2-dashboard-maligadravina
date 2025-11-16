// src/components/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import groupicon from "../assets/group.png";
import logoutIcon from "../assets/softeng2_logout.png";
import logo from "../assets/sweettreats_logo.png";
import dashboardicon from "../assets/dashboard1.png";
import home from "../assets/home.png";
import inventorylogo from "../assets/inventory.png";
import cake from "../assets/birthday-cake.png";
import order from "../assets/order.png";
import mail from "../assets/mail.png";
import rm from "../assets/raw-materials.png";
import editp from "../assets/editpages.png";

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
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

const Sidebar = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "Name",
    email: "email@addu.edu.ph",
  });

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true"; // default = false if nothing saved
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
    return () => {
      cancelled = true;
    };
  }, []);


  // 💾 save collapsed state to localStorage whenever it changes
useEffect(() => {
  localStorage.setItem("sidebarCollapsed", collapsed ? "true" : "false");
}, [collapsed]);



  // Base pill (no width / padding here so we can change when collapsed)
  const itemBase =
    "relative group inline-flex items-center gap-[10px] h-[32px] rounded-full transition-colors duration-200 " +
    "select-none no-underline visited:no-underline focus:outline-none focus:ring-0";

  const activeItemExpanded = "ml-[10px] pl-[10px] bg-[#FFC6C6] text-[#1D1B20]";
  const activeItemCollapsed = "bg-[#FFC6C6] text-[#1D1B20]";

  const inactiveItem =
    "!text-white filter brightness-0 invert no-underline decoration-transparent visited:!text-white hover:!text-white focus:!text-white active:!text-white hover:bg-white/10";

    const getItemClass = (isActive) =>
      `${itemBase} ${
        collapsed
          ? `justify-center w-[32px] px-0 ml-[-30px] ${isActive ? activeItemCollapsed : ""}`
          : `justify-start w-[160px] pl-4 pr-4 ${isActive ? activeItemExpanded : ""}`
      } ${!isActive ? inactiveItem : ""}`;
    
    
    
    
    
  async function handleLogout() {
    try {
      await api.logout();
    } catch {}
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <aside
  className={`sidebar sticky top-0 self-start shrink-0 overflow-visible min-h-screen bg-[#4A3600] text-white flex flex-col items-center py-6 transition-all duration-200 ${
    collapsed ? "w-[64px] px-2" : "w-[240px] px-8"
  }`}
>

  

      {/* Scoped rules: remove forced colors so you control them manually */}
      <style>{`
  .sidebar a,
  .sidebar a:visited,
  .sidebar a:hover,
  .sidebar a:focus,
  .sidebar a:active {
    text-decoration: none !important;
  }

  .chevron-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.2s;
  }

  .chevron-btn:hover {
    background: rgba(255,255,255,0.25);
  }

  .chevron {
    width: 6px;
    height: 6px;
    border-top: 2px solid white;
    border-right: 2px solid white;
    transform: rotate(225deg); /* default: ‹ */
    transition: 0.2s;
  }

  .chevron.collapsed {
    transform: rotate(45deg); /* › */
  }
`}</style>


      {/* Collapse toggle */}
      <button
  type="button"
  onClick={() => setCollapsed(prev => !prev)}
  className="chevron-btn mt-[20px] mb-2 focus:outline-none focus:ring-0 border-0 outline-none"
>
  <div className={`chevron ${collapsed ? "collapsed" : ""}`} />
</button>




      {/* Profile */}
      <div className="w-full flex flex-col items-center mt-[10px] text-white">
      <div className={`${collapsed ? "w-8 h-8" : "w-[60px] h-[60px]"} rounded-full overflow-hidden bg-[#E6E1E5] flex items-center justify-center shadow-inner`}>

      <img
  src={logo}
  alt="Avatar"
  className={`${collapsed ? "w-[35px] h-[35px]" : "w-[60px] h-[60px]"} object-cover`}
/>


        </div>

        {!collapsed && (
          <>
            <p
              style={{ color: "white", fontWeight: "bold" }}
              className="text-[20px] leading-tight mt-[16px]"
            >
              {profile.name}
            </p>
            <p style={{ color: "white" }} className="text-[12px] mt-[-10px]">
              {profile.email}
            </p>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className={`w-full ${collapsed ? "mt-[100px]" : "mt-[50px]"}`}>
        <ul className="list-none space-y-[10px]">
          {/* BALIK TO HOMEPAGE */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
          <NavLink
  to="/"
  title={collapsed ? "Home" : ""}
  className={({ isActive }) => getItemClass(isActive)}
>

<img
  src={home}
  alt="Home"
  className={`w-[16px] h-[16px] ${
    location.pathname === "/" ? "filter-none" : "filter brightness-0 invert"
  } ${
    collapsed
      ? ""
      : location.pathname === "/"
      ? "ml-[5px]"
      : "ml-[25px]"
  }`}
/>

              {!collapsed && <span className="text-[15px] ml-[5px]">Home</span>}

              {collapsed && (
                <span className="top-1/2 -translate-y-1/2 transition-all duration-200 group-hover:translate-x-1
 pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Home
                </span>
              )}
            </NavLink>
          </li>

          {/* Dashboard */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
            <NavLink
  to="/admin-dashboard"
  end
  title={collapsed ? "Dashboard" : ""}
  className={({ isActive }) => getItemClass(isActive)}
>

<img
  src={dashboardicon}
  alt="Dashboard"
  className={`w-[16px] h-[16px] ${
    location.pathname === "/admin-dashboard"
      ? "filter-none"
      : "filter brightness-0 invert"
  } ${
    collapsed
      ? ""
      : location.pathname === "/admin-dashboard"
      ? "ml-[5px]"
      : "ml-[25px]"
  }`}
/>

              {!collapsed && <span className="text-[15px] ml-[5px]">Dashboard</span>}

              {collapsed && (
                <span className="pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Dashboard
                </span>
              )}
            </NavLink>
          </li>

          {/* Edit Pages */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
          <NavLink to="/editpages" title={collapsed ? "Edit Pages" : ""} className={({ isActive }) => getItemClass(isActive)}>

          <img
  src={editp}
  alt="Edit Pages"
  className={`w-[16px] h-[16px] ${
    location.pathname === "/editpages"
      ? "filter-none"
      : "filter brightness-0 invert"
  } ${
    collapsed
      ? ""
      : location.pathname === "/editpages"
      ? "ml-[5px]"
      : "ml-[25px]"
  }`}
/>

              {!collapsed && <span className="text-[15px] ml-[5px]">Edit Pages</span>}

              {collapsed && (
                <span className="pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Edit Pages
                </span>
              )}
            </NavLink>
          </li>

          {/* Users */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
          <NavLink to="/userlist" title={collapsed ? "Users" : ""} className={({ isActive }) => getItemClass(isActive)}>

          <img
  src={groupicon}
  alt="Users"
  className={`w-[16px] h-[16px] ${
    location.pathname === "/userlist"
      ? "filter-none"
      : "filter brightness-0 invert"
  } ${
    collapsed
      ? ""
      : location.pathname === "/userlist"
      ? "ml-[5px]"
      : "ml-[25px]"
  }`}
/>

              {!collapsed && <span className="text-[15px] ml-[5px]">Users</span>}

              {collapsed && (
                <span className="pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Users
                </span>
              )}
            </NavLink>
          </li>

          {/* Inventory */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
          <NavLink to="/inventory" title={collapsed ? "Inventory" : ""} className={({ isActive }) => getItemClass(isActive)}>

          <img
  src={inventorylogo}
  alt="Inventory"
  className={`w-[16px] h-[16px] ${
    location.pathname === "/inventory"
      ? "filter-none"
      : "filter brightness-0 invert"
  } ${
    collapsed
      ? ""
      : location.pathname === "/inventory"
      ? "ml-[5px]"   // when ACTIVE: smaller margin
      : "ml-[25px]"  // when NOT active: your original margin
  }`}
/>

              {!collapsed && <span className="text-[15px] ml-[5px]">Inventory</span>}

              {collapsed && (
                <span className="pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Inventory
                </span>
              )}
            </NavLink>
          </li>

          {/* Raw Materials */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
          <NavLink to="/rawmaterials" title={collapsed ? "Raw Materials" : ""} className={({ isActive }) => getItemClass(isActive)}>

          <img
  src={rm}
  alt="Raw Materials"
  className={`w-[16px] h-[16px] ${
    location.pathname === "/rawmaterials"
      ? "filter-none"
      : "filter brightness-0 invert"
  } ${
    collapsed
      ? ""
      : location.pathname === "/rawmaterials"
      ? "ml-[5px]"
      : "ml-[25px]"
  }`}
/>

              {!collapsed && <span className="text-[15px] ml-[5px]">Raw Materials</span>}

              {collapsed && (
                <span className="pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Raw Materials
                </span>
              )}
            </NavLink>
          </li>

          {/* Products */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
          <NavLink to="/productmanagement" title={collapsed ? "Products" : ""} className={({ isActive }) => getItemClass(isActive)}>

          <img
  src={cake}
  alt="Products"
  className={`w-[16px] h-[16px] ${
    location.pathname === "/productmanagement"
      ? "filter-none"
      : "filter brightness-0 invert"
  } ${
    collapsed
      ? ""
      : location.pathname === "/productmanagement"
      ? "ml-[5px]"
      : "ml-[25px]"
  }`}
/>

              {!collapsed && <span className="text-[15px] ml-[5px]">Products</span>}

              {collapsed && (
                <span className="pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Products
                </span>
              )}
            </NavLink>
          </li>

          {/* Orders */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
          <NavLink to="/joborder" title={collapsed ? "Orders" : ""} className={({ isActive }) => getItemClass(isActive)}>

          <img
  src={order}
  alt="Orders"
  className={`w-[16px] h-[16px] ${
    location.pathname === "/joborder"
      ? "filter-none"
      : "filter brightness-0 invert"
  } ${
    collapsed
      ? ""
      : location.pathname === "/joborder"
      ? "ml-[5px]"
      : "ml-[25px]"
  }`}
/>

              {!collapsed && <span className="text-[15px] ml-[5px]">Orders</span>}

              {collapsed && (
                <span className="pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Orders
                </span>
              )}
            </NavLink>
          </li>

          {/* Contact Forms */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
          <NavLink to="/admincontact" title={collapsed ? "Contact Forms" : ""} className={({ isActive }) => getItemClass(isActive)}>

          <img
  src={mail}
  alt="Contact Forms"
  className={`w-[16px] h-[16px] ${
    location.pathname === "/admincontact"
      ? "filter-none"
      : "filter brightness-0 invert"
  } ${
    collapsed
      ? ""
      : location.pathname === "/admincontact"
      ? "ml-[5px]"
      : "ml-[25px]"
  }`}
/>

              {!collapsed && (
                <span className="text-[15px] ml-[5px]">Contact Forms</span>
              )}

              {collapsed && (
                <span className="pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Contact Forms
                </span>
              )}
            </NavLink>
          </li>

          {/* Logout */}
          <li className={`flex ${collapsed ? "justify-center" : "justify-start"}`}>
          <button type="button" title={collapsed ? "Logout" : ""} onClick={handleLogout} className={`${getItemClass(false)} bg-transparent border-0 appearance-none cursor-pointer`}>

              <img
                src={logoutIcon}
                alt="Logout"
                className={`w-[16px] h-[16px] shrink-0 filter invert brightness-0 ${
                  collapsed ? "" : "ml-[20px]"
                }`}
              />
              {!collapsed && (
                <span className="text-[13px] leading-none ml-[5px]">Logout</span>
              )}

              {collapsed && (
                <span className="pointer-events-none absolute left-[55px] z-20 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Logout
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
