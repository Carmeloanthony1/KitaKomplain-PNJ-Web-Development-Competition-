import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./History.css";

export default function History({ isOpen, setIsOpen }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [historyList, setHistoryList] = useState([]);

    // Ambil history pencarian dari localStorage setiap kali sidebar dibuka
    useEffect(() => 
    {
        if (isOpen)
        {
            const savedHistory = JSON.parse(localStorage.getItem("search_history")) || [];
            setHistoryList(savedHistory);
            setSearchQuery(""); // Reset kolom pencarian saat dibuka
        }
    }, [isOpen]);

    // Filter history berdasarkan input di search bar sidebar
    const filteredHistory = historyList.filter((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleHistoryClick = (tag) => 
    {
        setIsOpen(false);
        navigate(`/search?tag=${encodeURIComponent(tag)}`);
    };

    const clearHistory = () => 
    {
        localStorage.removeItem("search_history");
        setHistoryList([]);
    };

    return (
        <>
            {isOpen && (
                <div
                    className="history-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`history-panel ${isOpen ? "history-panel-open" : ""}`}>
                <div className="history-header">
                    <h1>History</h1>
                    <button className="history-close" onClick={() => setIsOpen(false)}>
                        ✕
                    </button>
                </div>

                {/* Search Bar Area */}
                <div className="history-search-container">
                    <div className="history-search-wrapper">
                        <svg className="history-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Filter history..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="history-search-input"
                        />
                    </div>
                    {historyList.length > 0 && (
                        <button onClick={clearHistory} className="history-clear-btn">
                            Clear
                        </button>
                    )}
                </div>

                {/* History List */}
                <div className="history-list">
                    {historyList.length === 0 ? (
                        <p className="no-history">Belum ada history pencarian.</p>
                    ) : filteredHistory.length === 0 ? (
                        <p className="no-history">Tag tidak ditemukan.</p>
                    ) : (
                        filteredHistory.map((tag, index) => (
                            <div
                                key={index}
                                className="history-item"
                                onClick={() => handleHistoryClick(tag)}
                            >
                                <div className="history-avatar">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>

                                <div className="history-content">
                                    <p>
                                        <strong>#{tag}</strong>
                                    </p>
                                    <span>Pencarian sebelumnya</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}