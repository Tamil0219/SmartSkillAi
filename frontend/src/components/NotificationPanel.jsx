import { useState, useEffect } from "react";
import API from "../services/api";
import { Bell, Check, X } from "lucide-react";

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/mentor/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/mentor/notifications/unread-count");
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/mentor/notifications/${notificationId}/read`);
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-brand-text-secondary hover:text-brand-crystal" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 top-12 w-80 bg-brand-card border border-white/10 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-brand-card p-4 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-brand-text-secondary">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 ${notif.isRead ? "bg-brand-sidebar/30" : "bg-brand-crystal/10"
                    } hover:bg-white/5 transition-colors`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {notif.type === "exam_attended" && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded font-bold">
                            EXAM
                          </span>
                        )}
                        {notif.type === "course_added" && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded font-bold">
                            COURSE
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white mt-1">
                        {notif.title}
                      </p>
                      <p className="text-xs text-brand-text-secondary mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-brand-text-secondary mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="mt-1 p-1 hover:bg-white/10 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-brand-crystal" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="sticky bottom-0 bg-brand-card p-3 border-t border-white/10 text-center">
            <button
              onClick={() => setShowPanel(false)}
              className="text-xs text-brand-crystal hover:text-brand-crystal/80"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
