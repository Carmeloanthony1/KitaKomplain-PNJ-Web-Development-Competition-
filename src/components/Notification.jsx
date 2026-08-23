import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Notification() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    return (
        <div className="notification-container">
            <h1>Notification</h1>
        </div>
    );
}