import React from "react";
import { useState } from "react";

export default function History() {
    const [history, setHistory] = useState([]);

    return (
        <div className="history-container">
            <h1>History</h1>
        </div>
    );
}