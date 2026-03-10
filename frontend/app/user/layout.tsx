"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { messagesApi } from "@/lib/messages";
import UserSidebar from "./components/UserSidebar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth({ redirect: false });
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) return;
        const fetchUnreadCount = async () => {
            try {
                const response = await messagesApi.getUnreadCount();
                setUnreadCount(response.data.unread_count);
            } catch (error) {
                console.error("Failed to fetch unread count:", error);
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    return (
        <div className="flex min-h-screen bg-[#f5f7fa]">
            <UserSidebar unreadCount={unreadCount} />
            {/* offset content to the right of the fixed sidebar */}
            <div className="flex-1 ml-64 min-w-0">
                {children}
            </div>
        </div>
    );
}