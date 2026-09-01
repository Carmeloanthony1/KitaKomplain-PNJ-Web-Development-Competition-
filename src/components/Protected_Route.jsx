import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ProtectedRoute() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = localStorage.getItem("user_id");

  useEffect(() => {
    async function checkAdminRole() {
      if (!currentUserId) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Pastikan query Supabase-nya seperti ini:
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", currentUserId)
        .single();

      if (!error && data && data.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }

    checkAdminRole();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#292828] text-gray-500 font-medium">
        Memeriksa hak akses...
      </div>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}