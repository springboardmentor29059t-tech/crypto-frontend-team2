import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { X, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, Info, TrendingUp } from "lucide-react";

const notificationIcons = {
  price: TrendingUp,
  risk: AlertTriangle,
  trade: Shield,
  system: Info,
};

export function NotificationList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    retry: false,
    onError: () => {
      // Silently handle errors to prevent UI crashes
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  const notifications = data?.items || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="flex flex-col max-h-[500px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isLoading}
            className="text-xs"
          >
            <CheckCheck className="w-3 h-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Loading notifications...
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No notifications
          </div>
        )}

        {!isLoading &&
          notifications.map((notification: any) => {
            const Icon =
              notificationIcons[notification.type as keyof typeof notificationIcons] ||
              Info;

            return (
              <div
                key={notification.id}
                className={cn(
                  "p-4 border-b hover:bg-secondary/50 transition-colors",
                  !notification.read && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      notification.type === "risk" && "bg-destructive/10",
                      notification.type === "price" && "bg-success/10",
                      notification.type === "trade" && "bg-primary/10",
                      notification.type === "system" && "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        notification.type === "risk" && "text-destructive",
                        notification.type === "price" && "text-success",
                        notification.type === "trade" && "text-primary"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            !notification.read && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markReadMutation.mutate(notification.id)}
                            className="p-1 rounded hover:bg-secondary"
                            title="Mark as read"
                          >
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(notification.id)}
                          className="p-1 rounded hover:bg-secondary"
                          title="Delete"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

