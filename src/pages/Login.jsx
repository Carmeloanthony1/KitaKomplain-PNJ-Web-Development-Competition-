import { useState } from "react";
import "./Login.css"

function Login()
{
    const[identifier, setIdentifier] = useState('')
    const[password, setPassword] = useState('')

    const handleSubmit = (event) =>
    {
        event.preventDefault()

        // taro login logic disini

        console.log("Identifier: ", identifier)
        console.log("Password: ", password)
    }

    return(
        <div className = "login-whole-background">

            {/*Left Side*/}
            <div className = "login-left-background">
                <h1 className = "login-logo">
                    Kita
                    <br />
                    Komplain
                </h1>
            </div>

            {/*Right Side*/}
            <div className = "login-right-background">
                <div className = "login-card-background">
                        <h2 className = "login-card-text">
                            Login
                        </h2>

                        <form onSubmit = {handleSubmit} className = "login-form">
                            
                            <input
                                type = "text"
                                placeholder = "Username/Email"
                                value = {identifier}
                                onChange = {(event) => setIdentifier(event.target.value)}
                                className = "login-input"
                                required
                            />

                            <input
                                type ="password"
                                placeholder = "Password"
                                value = {password}
                                onChange = {(event) => setPassword(event.target.value)}
                                className = "login-input"
                                required
                            />

                            <div className = "login-button-container">
                                <button
                                    type = "submit"
                                    className = "login-button"
                                >
                                    Submit
                                </button>  
                            </div>

                            <p className = "login-signup">
                                Don't have an account?{' '}
                                <button
                                    type = "button"
                                    className = "login-signup-button"
                                >
                                    Sign Up
                                </button>
                            </p>
                        </form>
                </div>
            </div>
        </div>
    )
}

export default Login