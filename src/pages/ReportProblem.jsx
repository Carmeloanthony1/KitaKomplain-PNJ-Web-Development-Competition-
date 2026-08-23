import { useState } from "react";
import "./ReportProblem.css"

export default function ReportProblem()
{
    //const[email, setEmail] = useState('');
    const[category, setCategory] = useState('');
    const[details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [lastoken, setLasttoken] = useState(null);

    const handleSubmit = async (event) =>
    {
        event.preventDefault();

        if (!category || !details)
            return;

        setIsSubmitting(true);

        try
        {
            const token = localStorage.getItem("token");
            const response = await fetch(
                "http://localhost:5000/api/reports",
                {
                    method: "POST",

                    headers:
                    {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify(
                    {
                        category,
                        details
                    })
                }
            );

            const data = await response.json();

            if (!response.ok)
            {
                alert(data.message);
                return;
            }

            setLasttoken(data.ticket);

            alert(`Report berhasil dikirim!\nTicket: ${data.ticket}`);

            setCategory('');
            setDetails('');
        }
        catch (error)
        {
            console.error("Error:", error);
            alert("Tidak dapat terhubung ke server.");
        }
        finally
        {
            setIsSubmitting(false);
        }
    };

    return(
        <div className = "report-background">

            <div className = "report-card-background">

                <h1 className = "report-card-title">
                    Report a Problem
                </h1>

                <form onSubmit = {handleSubmit} className = "report-form">
                    {/*
                    <input
                        type = "email"
                        placeholder = "Email"
                        value = {email}
                        onChange = {(event) => setEmail(event.target.value)}
                        className = "report-input"
                        required
                    />
                    */}

                    <div className = "input-text-description-container">
                        <p className = "input-text-description"> Subject: </p>
                    </div>

                    <input
                        type = "text"
                        value = {category}
                        onChange = {(event) => setCategory(event.target.value)}
                        className = "report-input"
                        required
                    />

                    <div className = "input-text-description-container">
                        <p className = "input-text-description"> Details: </p>
                    </div>
                    
                    <textarea
                        name = "message"
                        cols = {60}
                        value = {details}
                        onChange = {(event) => setDetails(event.target.value)}
                        className = "report-textarea"
                        required
                    />

                    <div className = "submit-button-container" disabled = {isSubmitting}>
                        <button className = "submit-button">
                            {isSubmitting ? "Sending..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}