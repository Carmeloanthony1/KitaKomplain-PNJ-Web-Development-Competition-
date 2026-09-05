import { useState } from 'react'
import "./SignUp.css"
import { useNavigate } from 'react-router-dom'
import { useStatus } from "../components/StatusContext"

function SignUp({ switchToLogin })
{
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
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
      const API_URL = 'https://kitakomplainback.vercel.app';
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

      showStatus('Sign up berhasil! Silahkan login.', 'success')
      if(switchToLogin){
        switchToLogin()
      } else {
        navigate('/login')
      }
    } catch (error){
      showStatus(error.message || 'Gagal melakukan sign up', 'error')
    } finally {
      setLoading(false)
    }
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
    </div>
  )
}

export default SignUp