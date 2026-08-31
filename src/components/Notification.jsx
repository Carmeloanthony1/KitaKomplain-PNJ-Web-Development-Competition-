import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Notification.css";

export default function Notification({ isOpen, setIsOpen }) {
    const navigate = useNavigate();

    //izin hardcode sementara
    const [notifications, setNotifications] = useState([
        { id: 1, username: "John", message: "liked your post.", time: "1d", read: false },
        { id: 2, username: "Sarah", message: "commented on your post", time: "2d", read: false },
        { id: 3, message: "(PostName) has reached 100 polls!", time: "3d", read: true }
    ]);
    const currentUserId = localStorage.getItem("user_id");

    useEffect(() =>
    {
        // Only fetch when the panel is open and user is logged in
        if (!isOpen || !currentUserId) return;

        const fetchNotifications = async () =>
        {
            const { data, error } = await supabase
                .from("notifications")
                .select(`
                    id,
                    type,
                    is_read,
                    created_at,
                    post_id,
                    actor:actor_id (username, avatar_url)
                `)
                .eq("user_id", currentUserId)
                .order("created_at", { ascending: false });

            if (!error && data) 
            {
                // Format the Supabase data to match your UI structure
                const formattedNotifications = data.map((n) =>
                {
                    // Simple time formatting (ex: "12 Aug")
                    const date = new Date(n.created_at);
                    const timeString = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;

                    // Determine the message text based on the notification type
                    let messageText = "interacted with your post.";
                    if (n.type === 'like')
                        messageText = "liked your post.";
                    else if (n.type === 'comment')
                        messageText = "commented on your post.";
                    else if (n.type === 'rank_top_5')
                        messageText = "is trending! Your post made it to the Most Polling! 🏆";
                    else if (n.type.startsWith('milestone'))
                    {
                        const voteCount = n.type.split('_')[1];
                        messageText = `helped your post reach ${voteCount} polls! 🎉`;
                    }

                    return{
                        id: n.id,
                        username: n.actor?.username || "Someone",
                        avatar: n.actor?.avatar_url || "👤",
                        message: messageText,
                        time: timeString,
                        read: n.is_read
                    };
                });
                
                setNotifications(formattedNotifications);
            }
        };

        fetchNotifications();
    }, [isOpen, currentUserId]);

    const handleNotificationClick = async (notification) =>
    {
        // Update UI
        setNotifications((prev) => prev.map((item) => item.id === notification.id ? { ...item, read: true } : item));

        // Update database
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", notification.id);
    };

    return (
        <>
            {/* Overlay only shows when open */}
            {isOpen &&
                (
                    <div
                        className="notification-overlay"
                        onClick={() => setIsOpen(false)}
                    />
                )
            }

            {/* Dynamically add the '-open' class based on state */}
            <div className={`notification-panel ${isOpen ? "notification-panel-open" : ""}`}>
                <div className="notification-header">
                    <h1>Notifications</h1>
                    <button className="notification-close" onClick={() => setIsOpen(false)}>
                        x
                    </button>
                </div>

                <div className="notification-list">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.read ? "notification-unread" : ""}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-avatar">
                                    {notification.avatar !== "👤" ?
                                        (
                                            <img src={notification.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                        ) :
                                        (
                                            "👤"
                                        )
                                    }
                            </div>

                            <div className="notification-content">
                                <p>
                                    <strong>{notification.username}</strong> {notification.message}
                                </p>
                                <span>{notification.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}