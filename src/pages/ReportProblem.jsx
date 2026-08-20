import { useState } from "react";
import "./ReportProblem.css"

export default function ReportProblem()
{
    const developerEmail = "kentdjiorlando90@gmail.com";

    const[email, setEmail] = useState('');
    const[category, setCategory] = useState('');
    const[details, setDetails] = useState('');

    const [lastoken, setLasttoken] = useState(null);

    const handleSubmit = (event) =>
    {
        event.preventDefault();

        if(!email || !category || !details)
            return;

        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const ticket = `Ticket-${randomNum}`;

        const subject = encodeURIComponent(`[Support Ticket ${ticket} - ${category}]`);
        const bodytext = 
        `
        [Ticket : ${ticket}]
        Email: ${email}
        Category: ${category}
        
        Details:
        ${details}`;

        const body = encodeURIComponent(bodytext);

        const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(developerEmail)}` +
        `&su=${subject}` +
        `&body=${body}`;

        window.open(gmailUrl, '_blank');

        //window.location.href = `mailto:${developerEmail}?subject=${subject}&body=${body}`;

        //otomatis bikin email biar user langsung bisa kirim aja
        setLasttoken(ticket);
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