// src/components/Stickybar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/sweettreats_logo-removebg-preview.png";
import SearchIcon from "../assets/search.png";
import CartIcon from "../assets/shopping-cart.png";
import UserIcon from "../assets/user.png";

// ✅ Use unified API for auth
import { api } from "../utils/api";

const Stickybar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null); // 'admin' | 'customer' | null

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Ask backend who we are (reads JWT), then set role locally
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          if (!cancelled) {
            setIsLoggedIn(false);
            setRole(null);
          }
          return;
        }
        const me = await api.me(); // { success, user_id, role }
        if (!cancelled) {
          setIsLoggedIn(!!me?.success);
          setRole(me?.role || null);
        }
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
          setRole(null);
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleUserClick() {
    if (authLoading) return;           // wait until we know auth state
    if (isLoggedIn) setMenuOpen(o => !o);
    else navigate("/login");           // not logged in → go to LoginPage.jsx route
  }

  // Logout: clear token/session, close menu, send to LoginPage.jsx
  async function handleLogout() {
    try { await api.logout(); } catch {}
    localStorage.removeItem("token");
    setMenuOpen(false);
    setIsLoggedIn(false);
    setRole(null);
    navigate("/login");                // your LoginPage.jsx route
  }

  return (
    <header className="fixed top-0 left-0 w-full z-[99999] bg-[#F5EFEF] shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-3 items-center px-8 md:px-14 lg:px-20 h-[72px]">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" aria-label="Go to homepage">
            <img
              src={Logo}
              alt="Sweet Treats Logo"
              className="h-[60px] w-auto object-contain ml-[20px]"
            />
          </Link>
        </div>

        {/* Center: Nav */}
        <nav className="flex items-center justify-center">
          <ul className="flex gap-[3rem] text-sm font-medium list-none m-0 p-0">
            <li>
              <Link to="/" className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4" >
                Home
              </Link>
            </li>

            <li>
              <Link to ="/products-page" className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4">
              Products
              </Link>
            </li>

            <li>
              <Link to ="/contact-page" className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4">
              Contact
              </Link>
            </li>

            <li>
              <Link to ="/faq-page" className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4">
              FAQ
              </Link>
            </li>

            <li>
            <Link to ="/about-us" className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4">
              About Us
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right: Icons */}
        <div className="flex items-center justify-end gap-6">
        

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="User menu"
              onClick={handleUserClick}
              disabled={authLoading}
              className="bg-transparent mr-[6px] p-0 border-0 focus:outline-none disabled:opacity-50"
            >
              <img src={UserIcon} alt="User Account" className="h-[22px] w-[22px] mr-[7px]" />
            </button>

            {isLoggedIn && menuOpen && (
              <div
                className="absolute right-0 ml-[-90px] mt-[20px] w-[200px] bg-[#F5EFEF] border border-[#d4c9b9] rounded-lg shadow-md"
                style={{ top: "100%" }}
              >
                {role === "admin" ? (
                  <>
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="mt-[8px]  block px-4 py-2 text-sm text-[#332601] hover:bg-[#e6ddd2] no-underline"
                    >
                      View Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-[8px] mb-[8px] block w-full text-left px-4 py-2 text-sm text-[#332601] hover:bg-[#e6ddd2] bg-transparent border-0 appearance-none focus:outline-none"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Customer: show View Account (no nav yet if you haven't built /account) */}
                    <Link
  to="/my-account"
  className="mt-[8px]  block w-full text-left px-4 py-2 text-sm text-[#332601] hover:bg-[#e6ddd2] no-underline"
>
  View Account
</Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-[8px] mb-[8px]  block w-full text-left px-4 py-2 text-sm text-[#332601] hover:bg-[#e6ddd2] bg-transparent border-0 appearance-none focus:outline-none"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/cart" aria-label="Shopping Cart">
  <img
    src={CartIcon}
    alt="Shopping Cart"
    className="h-[22px] w-[22px] mr-[30px]"
  />
</Link>

        </div>
      </div>
    </header>
  );
};

export default Stickybar;
