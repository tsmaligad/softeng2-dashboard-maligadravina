import React, { useState, useEffect } from "react";
import Stickybar from "./Stickybar.jsx"; 
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api"; 

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in (check backend session)
  useEffect(() => {
    (async () => {
      try {
        const me = await api.adminMe();
        if (me) navigate("/dashboard", { replace: true });
      } catch {
        // not logged in, do nothing
      }
    })();
  }, [navigate]);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.adminLogin({ email: form.email, password: form.password });
      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
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
              Login
            </h1>

            <form className="w-full" onSubmit={onSubmit}>
              <div className="space-y-[10px]">
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={onChange}
                  required
                  autoComplete="email"
                  className="w-full h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />

                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={onChange}
                  required
                  autoComplete="current-password"
                  className="w-full h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />
              </div>

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              <div className="mt-[40px] flex justify-between items-center mb-[15px]">
  <a href="/admin-login" className="text-sm text-[#8b7760]">
    Admin Login
  </a>
  <a href="/forgot-password" className="text-sm text-[#8b7760]">
    Forgot your password?
  </a>
</div>


<button
  type="submit"
  disabled={loading}
  className="w-full h-[35px] mb-[15px] mt-6 rounded-full border border-[#5B4220] bg-[#F8B8B8] text-base font-medium text-[#332601]"
>
  {loading ? "Signing in…" : "Sign in"}
</button>


              <button
                type="button"
                onClick={() => navigate("/create-account")}
                className="w-full h-[35px] mt-3 rounded-full border border-[#5B4220] bg-[#F5EFEF] text-base font-medium text-[#332601] cursor-pointer"
              >
                Create new account
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
