import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./Notification.css";

export default function Notification({ isOpen, setIsOpen }) {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
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
                    users!actor_id (username, avatar_url)
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
                    let showUsername = true; 
                    let systemAvatar = null;

                    if (n.type === 'like')
                        messageText = "liked your post.";
                    else if (n.type === 'comment')
                        messageText = "commented on your post.";
                    else if (n.type === 'rank_top_5')
                    {
                        messageText = "Your post is trending! It made it to the Most Polling Top 5!";
                        showUsername = false;
                        systemAvatar = "🏆";
                    }
                    else if (n.type.startsWith('milestone'))
                    {
                        const voteCount = n.type.split('_')[1];
                        messageText = `Your post reached ${voteCount} polls!`;
                        showUsername = false;
                        systemAvatar = "🎉";
                    }

                    return {
                        id: n.id,
                        username: n.users?.username || "Someone",
                        avatar: systemAvatar || n.users?.avatar_url || "👤",
                        isSystemAvatar: !!systemAvatar,
                        showUsername: showUsername,
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
            {isOpen &&
                (
                    <div
                        className="notification-overlay"
                        onClick={() => setIsOpen(false)}
                    />
                )
            }

            <div className={`notification-panel ${isOpen ? "notification-panel-open" : ""}`}>
                <div className="notification-header">
                    <h1>Notifications</h1>
                    <button className="notification-close" onClick={() => setIsOpen(false)}>
                        x
                    </button>
                </div>

                <div className="notification-list">
                    {notifications.length === 0 ? (
                        <p className="no-notifications">Belum ada notifikasi.</p>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.read ? "notification-unread" : ""}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div 
                                    className="notification-avatar"
                                    style={{ backgroundColor: notification.isSystemAvatar ? "transparent" : "" }}
                                >
                                    {/* Properly checking for system emojis so it doesn't break the image tag */}
                                    {notification.isSystemAvatar ? (
                                        notification.avatar
                                    ) : notification.avatar !== "👤" ? (
                                        <img src={notification.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        "👤"
                                    )}
                                </div>

                                <div className="notification-content">
                                    <p>
                                        {/* Conditionally render the username */}
                                        {notification.showUsername && (
                                            <><strong>{notification.username}</strong>{" "}</>
                                        )}
                                        {notification.message}
                                    </p>
                                    <span>{notification.time}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}