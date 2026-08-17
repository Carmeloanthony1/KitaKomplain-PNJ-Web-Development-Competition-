import { useState } from 'react'

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
    <div className = "min-h-screen flex">

      {/*Left side*/}
      <div className = "w-1/2 min-h-screen bg-gradient-to-r from-[#f5eadc] to-[#f9d9d0] flex items-center px-20">
        <h1 className = "text-[#ad003c] text-8xl font-bold">
          Kita
          <br />
          Komplain
        </h1>
      </div>

      {/*Right side*/}
      <div className = "w-1/2 min-h-screen bg-white flex items-center justify-center p-10">

        <div className = "w-full max-w-xl bg-[#f5f2e9] border-[5px] border-[#ad003c] rounded-[40px] px-16 py-14">

          <h2 className = "text-center text-5xl font-bold text-[#ad003c] mb-14">
            Sign Up
          </h2>

          <form onSubmit = {handleSubmit} className = "space-y-6">

            <input
              type = "email"
              placeholder = "Input your email"
              value = {email}
              onChange = {(event) => setEmail(event.target.value)}
              className = "w-full h-24 px-8 rounded-[40px] border-[4px] border-[#ad003c] text-center"
            />

            <input
              type = "password"
              placeholder = "Input your password"
              value = {password}
              onChange = {(event) => setPassword(event.target.value)}
              className = "w-full h-24 px-8 rounded-[40px] border-[4px] border-[#ad003c] text-center"
            />

            <input
              type = "password"
              placeholder = "Input your password again"
              value = {confirmPassword}
              onChange = {(event) => setConfirmPassword(event.target.value)}
              className = "w-full h-24 px-8 rounded-[40px] border-[4px] border-[#ad003c] text-center"
            />

            <div className = "flex justify-center pt-4">
              <button
                type = "submit"
                className = "w-64 h-16 rounded-full bg-[#ff8585] text-white text-xl font-bold"
              >
                Submit
              </button>
            </div>

            <p className = "text-center text-[#8f0033] font-semibold">
              Already have an account?{' '}
              <button type = "button" className = "hover:underline">
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