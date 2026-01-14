import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchUnreadNotifications } from "@/lib/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationList } from "./NotificationList";

export function NotificationBell() {
  const { data } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: fetchUnreadNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false,
    onError: () => {
      // Silently handle errors to prevent UI crashes
    },
  });

  const unreadCount = data?.count || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
}

