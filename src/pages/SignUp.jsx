import { useState } from 'react'
import "./SignUp.css"

function SignUp({ switchToLogin })
{
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false); //awalnya ga loading karena memang belum loading
  //Arrow operators: const func = (parameter) => {return value} 

  const handleSubmit = async (event) => 
  {
    event.preventDefault() //don't reload page after submit or link when clicked

    if (password !== confirmPassword) //12345 != "12345"
    {
      alert('Passwords do not match!')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/sign_up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json();

      if(!response.ok){
        throw new Error(data.message || 'Gagal melakukan sign up')
      }

      alert('Sign up berhasil! Silahkan login.')
      if(switchToLogin){
        switchToLogin()
      }
    } catch (error){
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  // return == masuk ke HTML/CSS
  return(
    <div className = "signup-whole-background">

      {/*Left side*/}
      <div className = "signup-left-background">
        <h1 className = "signup-logo">
          Kita
          <br />
          Komplain
        </h1>
      </div>

      {/*Right side*/}
      <div className = "signup-right-background">

        <div className = "signup-card-background">

          <h2 className = "signup-card-text">
            Sign Up
          </h2>

          <form onSubmit = {handleSubmit} className = "signup-form">

            <input
              type = "text"
              placeholder = "Username"
              value = {username}
              onChange = {(event) => setUsername(event.target.value)}
              className = "signup-input" required
            />

            <input
              type = "email"
              placeholder = "Email" /* to show gray text on box*/
              value = {email}
              onChange = {(event) => setEmail(event.target.value)}
              className = "signup-input" required
            />

            <input
              type = "password"
              placeholder = "Password"
              value = {password}
              onChange = {(event) => setPassword(event.target.value)}
              className = "signup-input" required
            />

            <input
              type = "password"
              placeholder = "Confirm Password"
              value = {confirmPassword}
              onChange = {(event) => setConfirmPassword(event.target.value)}
              className = "signup-input" required
            />

            <div className = "signup-button-container">
              <button
                type = "submit"
                className = "signup-button"
                disabled={loading}
              > {loading ? 'Memproses...' : 'Submit'}
              </button>
            </div>

            <p className = "signup-login">
              Already have an account?{' '}
              <button type = "button"  onClick = {switchToLogin} className = "signup-login-button">
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