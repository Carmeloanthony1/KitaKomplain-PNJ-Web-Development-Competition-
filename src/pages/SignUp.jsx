import { useState } from 'react'
import "./SignUp.css"
import { useNavigate } from 'react-router-dom'
import { useStatus } from "../components/StatusContext"
import Verify from "../components/Verify";

function SignUp({ switchToLogin })
{
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  
  const { showStatus } = useStatus()
  const navigate = useNavigate()

  const handleSubmit = async (event) => 
  {
    event.preventDefault()

    if (password !== confirmPassword)
    {
      showStatus('Passwords do not match!', 'error')
      return
    }

    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://kitakomplainback.vercel.app';
      
      // Proses Sign Up
      const response = await fetch(`${API_URL}/api/auth/sign_up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if(!response.ok){
        throw new Error(data.message || 'Gagal melakukan sign up')
      }

      // 2. OTOMATIS LOGIN AGAR MENDAPATKAN TOKEN UNTUK OTP
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        
        // Simpan token dan data user
        localStorage.setItem("token", loginData.token);
        localStorage.setItem("user_id", loginData.user.id);
        localStorage.setItem("user", JSON.stringify(loginData.user));
        
        showStatus('Sign up berhasil! Mengirimkan kode OTP...', 'success');
        
        // Munculkan Modal Verifikasi (ini akan otomatis mengirim OTP dari useEffect VerifyAccount)
        setIsVerifyOpen(true);
      } else {
        // Fallback jika auto-login gagal
        showStatus('Sign up berhasil! Silahkan login.', 'success')
        if(switchToLogin) switchToLogin(); else navigate('/login');
      }

    } catch (error){
      showStatus(error.message || 'Gagal melakukan sign up', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Fungsi saat proses verifikasi selesai (atau ditutup)
  const handleVerificationDone = () =>
  {
    setIsVerifyOpen(false);
    navigate('/home');
  }

  const handleVerificationCancel = () =>
  {
    setIsVerifyOpen(false);
    
    // Hapus seluruh data sesi secara paksa (Logout)
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user");
    
    showStatus("Sign Up dibatalkan. Anda wajib memverifikasi email untuk masuk.", "error");
    
    // Kembalikan ke halaman login
    if (switchToLogin)
      switchToLogin(); 
    else
      navigate('/login');
  }

  return (
    <div className="signup-whole-background">
      <div className="signup-left-background">
        <h1 className="signup-logo">
          Kita
          <br/>
          Komplain
        </h1>
      </div>

      <div className="signup-right-background">
        <div className="signup-card-background">
          <h2 className="signup-card-text">
            Sign Up
          </h2>

          <form onSubmit={handleSubmit} className="signup-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="signup-input" 
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="signup-input" 
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="signup-input" 
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="signup-input" 
              required
            />

            <div className="signup-button-container">
              <button
                type="submit"
                className="signup-button"
                disabled={loading}
              > 
                {loading ? 'Memproses...' : 'Submit'}
              </button>
            </div>

            <p className="signup-login">
              Already have an account?{' '}
              <button 
                type="button"  
                onClick={() => navigate('/login')} 
                className="signup-login-button"
              >
                Login
              </button>
            </p>  
          </form>
        </div>
      </div>

      {/* Render modal state verifikasi */}
      {isVerifyOpen && (
        <Verify 
          isOpen={isVerifyOpen}
          onClose={handleVerificationCancel} // Jika ditutup, tidak bisa lanjut ke home
          onSuccess={handleVerificationDone} // Jika sukses, lanjut ke home
        />
      )}
    </div>
  )
}

export default SignUp