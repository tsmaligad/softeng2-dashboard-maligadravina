// frontend/src/routes/AdminRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../utils/api"; // ✅ use the existing api.js

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState({ loading: true, ok: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me(); // { success, user_id, role }
        if (!cancelled) {
          setStatus({
            loading: false,
            ok: !!me?.success && me?.role === "admin",
          });
        }
      } catch {
        if (!cancelled) setStatus({ loading: false, ok: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status.loading) {
    // 👇 you can style this however you like
    return <div className="p-8 text-center text-[#332601]">Checking admin access…</div>;
  }

  if (!status.ok) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
