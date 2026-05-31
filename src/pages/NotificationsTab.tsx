import { Bell, Check, CheckCheck, Package, MessageCircle, Wallet, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";

const notificationIcons: Record<string, typeof Bell> = {
  order: Package,
  message: MessageCircle,
  payment: Wallet,
  dispute: AlertTriangle,
  info: Info,
};

const notificationColors: Record<string, string> = {
  order: "bg-blue-50 text-blue-600",
  message: "bg-purple-50 text-purple-600",
  payment: "bg-green-50 text-green-600",
  dispute: "bg-red-50 text-red-600",
  info: "bg-gray-50 text-gray-600",
};

export default function NotificationsTab() {
  const utils = trpc.useUtils();

  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();
  const { data: unreadData } = trpc.notifications.unreadCount.useQuery();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: async () => {
      await utils.notifications.list.invalidate();
      await utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: async () => {
      await utils.notifications.list.invalidate();
      await utils.notifications.unreadCount.invalidate();
    },
  });

  const unreadCount = unreadData?.count ?? 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]">الإشعارات</h2>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="rounded-xl h-10 gap-2 border-[#E5E5DF]"
          >
            <CheckCheck className="w-4 h-4" />
            قراءة الكل
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification: any) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const iconColor = notificationColors[notification.type] || notificationColors.info;
              
              return (
                <div
                  key={notification.id}
                  className={`p-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors ${
                    !notification.isRead ? "bg-[#FAFBF7]" : ""
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#1A1A2E]">{notification.title}</h4>
                        {!notification.isRead && (
                          <Badge className="bg-[#0D5D48] text-white text-[10px] px-2 py-0">جديد</Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString("ar-SY", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markRead.mutate({ id: notification.id })}
                        disabled={markRead.isPending}
                        className="mt-2 h-8 text-xs text-[#0D5D48] hover:text-[#094533] hover:bg-[#E8F5F0]"
                      >
                        <Check className="w-3 h-3 ml-1" />
                        تحديد كمقروء
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">لا توجد إشعارات</h3>
            <p className="text-gray-500 text-sm">ستظهر هنا جميع إشعاراتك عند وصولها.</p>
          </div>
        )}
      </div>
    </div>
  );
}
