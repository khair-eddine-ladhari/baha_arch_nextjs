"use client"; // required: useState, useContext, sessionStorage, event handlers

import { useContext, useState } from "react";
import axios from "axios";
import { GlobalContext } from "../components/GlobalContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useContext(GlobalContext);

  const LABEL_CLS = "text-[0.65rem]  tracking-widest font-bold text-black";

  const INPUT_CLS =
    "w-full border-b border-black bg-transparent py-2 text-sm font-bold  tracking-widest text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors duration-[250ms]";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/login`, form);

      sessionStorage.setItem("adminToken", res.data.token);
      // Fixed order: update auth context BEFORE navigating away —
      // window.location.href triggers a full page navigation, so any
      // code after it is unlikely to execute.
      login(res.data.admin);
      window.location.href = "/admin";
    } catch (error) {
      setError(error.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col border-black">
      {/* Header */}
      <header className="border-b border-black px-8 py-4 flex justify-between items-center">
        <span className="text-[0.65rem] uppercase tracking-widest font-bold text-black">
          Baha Architecture
        </span>
        <span className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-400">
          Admin Portal
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="mb-12 border-b border-black pb-6">
            <p className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-400 mb-2">
              Restricted Access
            </p>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-black">
              Sign In
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col  gap-8 ">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className={LABEL_CLS}>Email</label>
              <input
                autoComplete="off"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="youremail@gmail.com"
                required
                className={INPUT_CLS}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className={LABEL_CLS}>Password</label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={INPUT_CLS + " pr-16"}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-[0.65rem] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors duration-[250ms]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[0.65rem] uppercase tracking-widest font-bold text-red-500">
                — {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 border border-black py-3 text-[0.65rem] cursor-pointer uppercase tracking-widest font-bold text-black hover:bg-black hover:text-white transition-colors duration-[250ms] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Enter"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black px-8 py-2">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <li className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600 list-none">
            Developed by KHAIR EDDINE LADHARI
          </li>
          <ul className="flex flex-wrap gap-6 items-center">
            <li className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600">
              © Baha Architecture
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default AdminLogin;