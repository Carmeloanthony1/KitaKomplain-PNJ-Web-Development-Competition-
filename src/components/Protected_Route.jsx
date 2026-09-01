import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom"; //outlet biar nanti user bisa di arahkan ke page lain kalau bukan admin
import { supabase } from "../supabaseClient";

export default function Protected_Route() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const current_user_id = localStorage.getItem("user_id");

    useEffect(() => {
        async function check_is_admin(){
            if(!current_user_id){
                setIsAdmin(false);
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .role("role")
                .eq("id", current_user_id)
                .single();

            if(!error && data && data.role === "admin"){
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        }
        check_is_admin();
    }, [current_user_id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-[#292828] text-gray-500 font-medium">
                Memeriksa hak akses...
            </div>
        );
    }
    return isAdmin ? <Outlet /> : <Navigate to="/Home" replace />;
}
