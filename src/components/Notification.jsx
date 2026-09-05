import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useStatus } from "./StatusContext";
import Focuspost from "./FocusPost";
import "./Notification.css";


export default function Notification({ isOpen, setIsOpen }) {
    const navigate = useNavigate();
    const { showStatus } = useStatus();

    const [notifications, setNotifications] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isFocusOpen, setIsFocusOpen] = useState(false);

    const currentUserId = localStorage.getItem("user_id");

    useEffect(() => {
        if (!isOpen || !currentUserId) return;

        const fetchNotifications = async () => {
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

            if (!error && data) {
                const formattedNotifications = data.map((n) => {
                    const date = new Date(n.created_at);
                    const timeString = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;

                    let messageText = "interacted with your post.";
                    let showUsername = true; 
                    let systemAvatar = null;

                    if (n.type === 'like')
                        messageText = "liked your post.";
                    else if (n.type === 'comment')
                        messageText = "commented on your post.";
                    else if (n.type === 'rank_top_5') {
                        messageText = "Your post is trending! It made it to the Most Polling Top 5!";
                        showUsername = false;
                        systemAvatar = "🏆";
                    }
                    else if (n.type.startsWith('milestone')) {
                        const voteCount = n.type.split('_')[1];
                        messageText = `Your post reached ${voteCount} polls!`;
                        showUsername = false;
                        systemAvatar = "🎉";
                    }

                    return {
                        id: n.id,
                        post_id: n.post_id,
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
        // Sudah dibaca di UI
        setNotifications((prev) => prev.map((item) => item.id === notification.id ? { ...item, read: true } : item));

        // Update status read di database
        if (!notification.read) 
        {
            supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", notification.id)
                .then(); // Eksekusi berjalan di background
        }

        // Ambil data postingan dan buka FocusPost
        if (notification.post_id) 
        {
            const { data: postData, error } = await supabase
                .from("posts")
                .select(`
                    id, description, image_url, tag, is_anonim_mode, created_at, user_id, 
                    users (username, avatar_url)
                `)
                .eq("id", notification.post_id)
                .single();

            if (error || !postData) 
                showStatus("Postingan tidak ditemukan atau telah dihapus.", "error");
            else
            {
                setSelectedPost(postData);
                setIsFocusOpen(true);
                setIsOpen(false);
            }
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="notification-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`notification-panel ${isOpen ? "notification-panel-open" : ""}`}>
                <div className="notification-header">
                    <h1>Notifications</h1>
                    <button className="notification-close" onClick={() => setIsOpen(false)}>
                        ✕
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

            <Focuspost 
                post={selectedPost} 
                isOpen={isFocusOpen} 
                onClose={() => setIsFocusOpen(false)} 
            />
        </>
    );
}