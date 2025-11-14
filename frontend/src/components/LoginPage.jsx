// frontend/src/components/LoginPage.jsx
import React, { useState, useEffect } from "react";
import Stickybar from "./Stickybar.jsx";
import { api } from "../utils/api";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("[LoginPage] mounted");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("[LoginPage] submit fired", {
      email,
      passwordLen: password.length,
      location: window.location.href,
    });

    try {
      console.log("[LoginPage] calling api.adminLogin…");
      const data = await api.login({ email, password });

      console.log("[LoginPage] api.adminLogin returned:", data);
      const saved = localStorage.getItem("token");
      console.log("[LoginPage] localStorage token length:", saved ? saved.length : 0);

      const success = !!data?.success || !!data?.token || !!saved;
      if (!success) {
        console.warn("[LoginPage] backend returned no success/token");
        setError(data?.message || data?.error || "Invalid email or password.");
        return;
      }

      if (data.role === "admin") {
        navigate("/admin-dashboard");   // admin → dashboard
      } else {
        navigate("/");            // user → homepage
      }


    } catch (err) {
      console.error("[LoginPage] error from api.adminLogin:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5EFEF]">
      <Stickybar />

      <div className="pt-[72px]">
        <section className="bg-[#4A3600] h-[90px] mb-[70px]" />

        <main className="flex items-start justify-center">
          <div className="w-full max-w-[560px] mx-auto px-6">
            <h1 className="text-5xl font-kapakana italic text-center text-[#332601] mb-[80px]">
              Login
            </h1>

            <form className="w-full" onSubmit={handleSubmit} noValidate>
              <div className="space-y-[10px]">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-[560px] mb-[6px] h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-[560px] h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-600" aria-live="polite">
                  {error}
                </p>
              )}

              <div className="mt-[40px] flex justify-end items-center mb-[15px]">
                <a href="/forgot-password" className="text-sm text-[#8b7760] no-underline">
                  Forgot your password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[35px] mb-[15px] mt-6 rounded-full border border-[#5B4220] bg-[#F8B8B8] text-base font-medium text-[#332601] disabled:opacity-70"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>

              <Link
                to="/create-account"
                className="inline-flex w-full h-[35px] items-center justify-center rounded-full border border-[#5B4220] bg-white text-base no-underline font-medium text-[#332601] hover:bg-[#FDF2F2] transition"
              >
                Create account
              </Link>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
