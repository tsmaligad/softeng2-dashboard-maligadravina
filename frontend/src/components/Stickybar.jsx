import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/sweettreats_logo-removebg-preview.png";
import SearchIcon from "../assets/search.png";
import CartIcon from "../assets/shopping-cart.png";
import UserIcon from "../assets/user.png";
import { api } from "../utils/api"; // ✅ use PHP backend API

const Stickybar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Check session on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await api.me();
        setIsLoggedIn(!!res?.success);
      } catch {
        setIsLoggedIn(false);
      }
    })();
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

  // ✅ Proper logout
  async function handleLogout() {
    try {
      await api.logout(); // clear session in PHP
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setMenuOpen(false);
      setIsLoggedIn(false);
      navigate("/login"); // send back to login page
    }
  }

  function handleUserClick() {
    if (isLoggedIn) {
      setMenuOpen((o) => !o);
    } else {
      navigate("/login");
    }
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#F5EFEF] shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
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
              <a
                href="/"
                className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#products"
                className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4"
              >
                Products
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="#faqs"
                className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4"
              >
                FAQs
              </a>
            </li>
            <li>
              <a
                href="#about-us"
                className="text-[#5B4220] no-underline hover:underline hover:decoration-[#5B4220] hover:underline-offset-4"
              >
                About Us
              </a>
            </li>
          </ul>
        </nav>

        {/* Right: Icons */}
        <div className="flex items-center justify-end gap-6">
          <button aria-label="Search" className="bg-transparent p-0 border-0 focus:outline-none">
            <img src={SearchIcon} alt="Search" className="h-[22px] w-[22px] mr-[7px]" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              aria-label="User menu"
              onClick={handleUserClick}
              className="bg-transparent p-0 border-0 focus:outline-none"
            >
              <img src={UserIcon} alt="User Account" className="h-[22px] w-[22px] mr-[7px]" />
            </button>

            {/* Dropdown only if logged in */}
            {isLoggedIn && menuOpen && (
              <div
                className="absolute right-0 mt-[30px] w-[100px] bg-[#F5EFEF] border border-[#d4c9b9] rounded-lg shadow-md"
                style={{ top: "100%" }}
              >
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-[#332601] hover:bg-[#e6ddd2]"
                >
                  View Account
                </Link>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout(); // ✅ call backend + redirect
                  }}
                  className="block px-4 py-2 text-sm text-[#332601] hover:bg-[#e6ddd2]"
                >
                  Logout
                </a>
              </div>
            )}
          </div>

          <button aria-label="Shopping Cart" className="bg-transparent p-0 border-0 focus:outline-none">
            <img src={CartIcon} alt="Shopping Cart" className="h-[22px] w-[22px] mr-[30px]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Stickybar;
