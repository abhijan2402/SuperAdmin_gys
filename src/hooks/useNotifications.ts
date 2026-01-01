import { useState, useEffect } from "react";
import type { Notification, NotificationFormData } from "@/types/notification";
import { toast } from "sonner";
import {
  useAddNotificationMutation,
  useDeleteNotificationApiMutation,
  useGetNotificationListQuery,
  useGetUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from "@/redux/api/notificationApi";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: unreadNotificationCount } = useGetUnreadNotificationsQuery("");
  const { data: notificationList, isFetching } =
    useGetNotificationListQuery("");
  const [deleteNotificationApi] = useDeleteNotificationApiMutation();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [addNotification, {isLoading: isSendingNotification}] = useAddNotificationMutation();

  useEffect(() => {
    if (notificationList) {
      setNotifications(notificationList?.data);
    }
  }, [notificationList]);

  const createNotification = async (data: NotificationFormData) => {
    const payload = {
      title: data.title,
      message: data.message,
      type: data.type,
      recipient_type: data.targetTenants[0],
    };

    try {
      await addNotification(payload).unwrap();
      toast.success("Notification created successfully");
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.data?.message || err?.error || "Failed to create notification"
      );
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id).unwrap();
      toast.success("Notification marked as read");
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.data?.message || err?.error || "Failed to mark notification"
      );
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteNotificationApi(id).unwrap();
      toast.success("Notification deleted");
    } catch (err: any) {
      console.error(err);

      toast.error(
        err?.data?.message || err?.error || "Failed to delete notification"
      );
    }
  };

  const unreadCount = unreadNotificationCount?.data?.unread_count;

  return {
    notifications,
    isFetching,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
    isSendingNotification,
  };
}
