import { useState } from "react";


function Login()
{
    const[email, useEmail] = useState('')
    const[password, usePassword] = useState('')

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
                                type = "email"
                                placeholder = "Email"
                                value = {email}
                                onChange = {(event) => setEmail(event.target.value)}
                                className = "login-input"
                            />

                            <input
                                type ="password"
                                placeholder = "Password"
                                value = {password}
                                onChange = {(event) => setPassword(event.target.value)}
                                className = "login-input"
                            />

                        </form>

                </div>

            </div>


        </div>


    )
}