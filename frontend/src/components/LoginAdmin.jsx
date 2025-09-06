import React, { useState, useEffect } from "react";
import Stickybar from "./Stickybar.jsx"; 
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // if already logged in as admin, go to dashboard
  useEffect(() => {
    (async () => {
      try {
        const res = await api.adminMe();
        if (res?.success) navigate("/admin-dashboard");
      } catch {}
    })();
  }, [navigate]);

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.adminLogin({ email: form.email, password: form.password });
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message || "Admin login failed.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFEF]">
      <Stickybar />

      <div className="pt-[72px]">
        <section className="bg-[#4A3600] h-[90px] mb-[70px]"></section>

        <main className="flex items-start justify-center">
          <div className="w-full max-w-[560px] mx-auto px-6">
            <h1 className="text-5xl font-kapakana italic text-center text-[#332601] mb-[80px]">
              Admin Login
            </h1>

            <form className="w-full" onSubmit={onSubmit}>
              <div className="space-y-[10px]">
                <input
                  name="email"
                  type="email"
                  placeholder="Admin Email"
                  value={form.email}
                  onChange={onChange}
                  required
                  autoComplete="email"
                  className="w-full h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />

                <input
                  name="password"
                  type="password"
                  placeholder="Admin Password"
                  value={form.password}
                  onChange={onChange}
                  required
                  autoComplete="current-password"
                  className="w-full h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />
              </div>

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              <div className="mt-[40px] flex justify-end items-center mb-[15px]">
                <a href="/forgot-password" className="text-sm text-[#8b7760]">
                  Forgot your password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full h-[35px] mb-[15px] mt-6 rounded-full border border-[#5B4220] bg-[#F8B8B8] text-base font-medium text-[#332601]"
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full h-[35px] mt-3 rounded-full border border-[#5B4220] bg-[#F5EFEF] text-base font-medium text-[#332601] cursor-pointer"
              >
                Back to user login
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginAdmin;
