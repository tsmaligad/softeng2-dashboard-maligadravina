import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../utils/api";

export default function AdminRoute({ children }) {
  const [status, setStatus] = useState("loading"); // loading | authed | denied

  useEffect(() => {
    (async () => {
      try {
        const res = await api.adminMe();
        setStatus(res?.success ? "authed" : "denied");
      } catch {
        setStatus("denied");
      }
    })();
  }, []);

  if (status === "loading") return null;           // or a spinner
  if (status === "denied") return <Navigate to="/admin-login" replace />;
  return children;
}
