import { useState } from 'react'
import "./SignUp.css"

function SignUp()
{
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  //Arrow operators: const func = (parameter) => {return value} 

  const handleSubmit = (event) => 
  {
    event.preventDefault() //don't reload page after submit or link when clicked

    if (password !== confirmPassword) //12345 != "12345"
    {
      alert('Passwords do not match!')
      return
    }

    console.log(email, password)
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
              type = "email"
              placeholder = "Email"
              value = {email}
              onChange = {(event) => setEmail(event.target.value)}
              className = "signup-input"
            />

            <input
              type = "password"
              placeholder = "Password"
              value = {password}
              onChange = {(event) => setPassword(event.target.value)}
              className = "signup-input"
            />

            <input
              type = "password"
              placeholder = "Confirm Password"
              value = {confirmPassword}
              onChange = {(event) => setConfirmPassword(event.target.value)}
              className = "signup-input"
            />

            <div className = "signup-button-container">
              <button
                type = "submit"
                className = "signup-button"
              >
                Submit
              </button>
            </div>

            <p className = "signup-login">
              Already have an account?{' '}
              <button type = "button" className = "signup-login-button">
                Log in
              </button>
            </p>

          </form>

        </div>

      </div>

    </div>
  )
}

export default SignUp