import { useState } from "react";
import "./ReportProblem.css"

export default function ReportProblem()
{
    const[email, setEmail] = useState('');
    const[category, setCategory] = useState('');
    const[details, setDetails] = useState('');

    const handleSubmit = async (event) =>
    {
        event.preventDefault();

        
    }

    return(
        <div className = "report-background">

            <div className = "report-card-background">

                <h1 className = "report-card-title">
                    Report a Problem
                </h1>

                <form onSubmit = {handleSubmit} className = "report-form">
                    <input
                        type = "email"
                        placeholder = "Email"
                        value = {email}
                        onChange = {(event) => setEmail(event.target.value)}
                        className = "report-input"
                        required
                    />

                    <input
                        type = "text"
                        placeholder = "Category"
                        value = {category}
                        onChange = {(event) => setCategory(event.target.value)}
                        className = "report-input"
                        required
                    />

                    <div className = "details-text-container">
                        <p className = "details-text"> Details: </p>
                    </div>
                    
                    <textarea
                        name = "message"
                        cols = {60}
                        value = {details}
                        onChange = {(event) => setDetails(event.target.value)}
                        className = "report-textarea"
                        required
                    />

                    <div className = "submit-button-container">
                        <button className = "submit-button">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}