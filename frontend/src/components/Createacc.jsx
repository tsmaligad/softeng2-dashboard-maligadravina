import React, { useState } from "react";
import Stickybar from "./Stickybar.jsx"; 
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";   // ✅ backend API

export default function Createacc() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.register(form); // ✅ call PHP backend register
      navigate("/login");       // redirect to login page after success
    } catch (err) {
      setError(err.message || "Registration failed.");
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
              Create an account
            </h1>

            <form className="w-full" onSubmit={onSubmit}>
              <div className="space-y-[10px]">
                <input
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={onChange}
                  required
                  className="w-[540px] h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />
                <input
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={onChange}
                  required
                  className="w-[540px] h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={onChange}
                  required
                  autoComplete="email"
                  className="w-[540px] h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={onChange}
                  required
                  autoComplete="new-password"
                  className="w-[540px] h-[35px] rounded-full border border-[#5B4220] bg-white pl-[20px] text-base text-[#332601] placeholder-[#8b7760] outline-none"
                />
              </div>

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                className="w-full h-[35px] mb-[15px] mt-[50px] rounded-full border border-[#5B4220] bg-[#F8B8B8] text-[#332601] font-medium"
              >
                Sign up
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="block w-full h-[35px] mt-3 rounded-full border border-[#5B4220] bg-[#F5EFEF] text-[#332601] text-center leading-[35px] font-medium cursor-pointer"
              >
                Back to login
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
