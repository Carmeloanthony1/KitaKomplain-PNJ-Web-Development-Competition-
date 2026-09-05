import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../supabaseClient";
import { useStatus } from "./StatusContext";

export default function Verify({ isOpen, onClose, onSuccess }) 
{
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { showStatus } = useStatus();

  const hasSentOtp = useRef(false);

  const API_URL = import.meta.env.VITE_API_URL || "https://kitakomplainback.vercel.app";

  useEffect(() => 
  {
    const currentUserId = localStorage.getItem("user_id");

    if (!isOpen) 
    {
      hasSentOtp.current = false;
      return;
    }

    if (!currentUserId || hasSentOtp.current) 
        return;

    hasSentOtp.current = true;

    const initVerification = async () =>
    {
      setOtp("");
      
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("id", currentUserId)
        .single();
      
      if (data?.email)
    {
        setUserEmail(data.email);
        await sendOtpToBackend(true);
      } else
        showStatus("Gagal mengambil data email user.", "error");
    };

    initVerification();
  }, [isOpen]);

  if (!isOpen) return null;

  const sendOtpToBackend = async (isInitial = false) => 
  {
    try 
    {
      const token = localStorage.getItem("token"); // Ambil token terbaru
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);
      
      if (!isInitial)
        showStatus("Email verifikasi baru telah dikirim!", "success");
    } 
    catch (error) 
    {
      console.error(error);
      showStatus(error.message || "Terjadi kesalahan saat mengirim OTP.", "error");
    }
  };

  const handleVerify = async (e) => 
  {
    e.preventDefault();

    if (otp.length < 6) 
    {
      showStatus("Masukkan 6 digit kode OTP yang valid.", "error");
      return;
    }

    setLoading(true);

    try 
    {
      const token = localStorage.getItem("token"); // Ambil token terbaru
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ otp }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      showStatus("Email berhasil diverifikasi!", "success");
      setOtp("");

      if (onSuccess) onSuccess();
    } 
    catch (error) 
    {
      showStatus(error.message || "Gagal memverifikasi akun.", "error");
    } 
    finally 
    {
      setLoading(false);
    }
  };

  const handleResend = () => {
    sendOtpToBackend(false);
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white dark:bg-[#1e1e1e] border-4 border-[#a50034]/50 dark:border-[#f1ece1] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center transition-colors"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="w-16 h-16 bg-red-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
            <svg
              className="w-8 h-8 stroke-[#a50034] dark:stroke-[#f1ece1] fill-none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-[#f1ece1]">
            Cek Email Anda
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 px-2">
            Kami telah mengirimkan kode OTP ke <strong>{userEmail}</strong>. Masukkan kode tersebut di bawah ini.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-4 mt-2">
          <input
            type="text"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="000000"
            disabled={loading}
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a50034] text-center font-black tracking-[0.5em] text-2xl text-gray-800 dark:text-white bg-gray-50 dark:bg-[#2a2a2a] transition-colors"
          />

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-[#a50034] dark:bg-[#f1ece1] text-white dark:text-black py-3 rounded-xl hover:bg-[#800028] dark:hover:bg-white transition-colors font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Belum menerima email?{" "}
          <button 
            type="button"
            onClick={handleResend}
            className="text-[#a50034] dark:text-[#f1ece1] font-bold hover:underline cursor-pointer"
          >
            Kirim ulang
          </button>
        </p>
      </div>
    </div>,
    document.body
  );
}