import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiBellLine, RiCheckDoubleLine, RiDeleteBinLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notification.service';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationService.getNotifications({ limit: 10 });
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    fetchNotifications();
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) await notificationService.markAsRead(notif._id);
    setOpen(false);
    if (notif.link) navigate(notif.link);
    fetchNotifications();
  };

  if (!isAuthenticated) return null;

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <RiBellLine size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center min-w-[18px] h-[18px] px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 max-h-[420px] overflow-y-auto bg-navy-900/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-display font-bold text-white text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-[10px] text-accent-400 hover:text-accent-300 flex items-center gap-1">
                  <RiCheckDoubleLine /> Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left p-3.5 border-b border-white/5 hover:bg-white/5 transition-colors ${
                    !n.isRead ? 'bg-accent-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-accent-400 mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{n.title}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-slate-600 text-[10px] mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
