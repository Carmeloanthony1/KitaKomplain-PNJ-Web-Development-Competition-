import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
export default function Login({ switchToSignup, onLoginSuccess }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault(); // Mencegah reload halaman
        setLoading(true);

        try {
            // Tembak API Login backend
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();
            console.log("data dari backend:", data);

            if (!response.ok) {
                throw new Error(data.message || 'Login gagal! Periksa kembali akunmu.');
            }

            // Simpan token JWT ke browser
            localStorage.setItem('token', data.token);

            if(data.user && data.user.id){
                localStorage.setItem('user_id', data.user.id);
            }
            // Langsung panggil callback buat pindah halaman di App.jsx tanpa alert
            if (onLoginSuccess) {
                onLoginSuccess(data.user);
            }

        } catch (error) {   
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-whole-background">

            {/* Left Side */}
            <div className="login-left-background">
                <h1 className="login-logo">
                    Kita
                    <br />
                    Komplain
                </h1>
            </div>

            {/* Right Side */}
            <div className="login-right-background">
                <div className="login-card-background">
                    <h2 className="login-card-text">
                        Login
                    </h2>

                    <form onSubmit={handleSubmit} className="login-form">
                        
                        <input
                            type="text"
                            placeholder="Username/Email"
                            value={identifier}
                            onChange={(event) => setIdentifier(event.target.value)}
                            className="login-input"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="login-input"
                            required
                        />

                        <div className="login-button-container">
                            <button
                                type="submit"
                                className="login-button" 
                                disabled={loading}
                            > {loading ? 'Memproses...' : 'Submit'}
                            </button>  
                        </div>

                        <p className="login-signup">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/SignUp')}
                                className="login-signup-button"
                            >
                                Sign Up
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}