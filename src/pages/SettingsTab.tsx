import { useState, useEffect } from "react";
import { 
  Bell, Shield, Trash2, AlertTriangle,
  Mail, Phone, Eye, MessageCircle, Wallet, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function SettingsTab() {
  const { user, logout } = useAuth();

  const { data: settings, isLoading } = trpc.auth.getSettings.useQuery();

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    messages: true,
    payments: true,
    promotions: false,
  });

  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    showProfile: true,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    if (settings) {
      if (settings.notifications) {
        setNotifications(settings.notifications);
      }
      if (settings.privacy) {
        setPrivacy(settings.privacy);
      }
    }
  }, [settings]);

  const updateSettings = trpc.auth.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الإعدادات بنجاح");
    },
    onError: (err) => {
      toast.error(err.message || "فشل في حفظ الإعدادات");
    },
  });

  const deleteAccount = trpc.auth.deleteAccount.useMutation({
    onSuccess: async () => {
      toast.success("تم حذف الحساب بنجاح");
      await logout();
    },
    onError: (err) => {
      toast.error(err.message || "فشل في حذف الحساب");
    },
  });

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    updateSettings.mutate({ notifications: { [key]: value } });
  };

  const handlePrivacyChange = (key: keyof typeof privacy, value: boolean) => {
    const newPrivacy = { ...privacy, [key]: value };
    setPrivacy(newPrivacy);
    updateSettings.mutate({ privacy: { [key]: value } });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== user?.email) {
      toast.error("يرجى كتابة بريدك الإلكتروني للتأكيد");
      return;
    }
    deleteAccount.mutate();
  };

  if (isLoading) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">الإعدادات</h2>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A2E]">إعدادات الإشعارات</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-[#1A1A2E]">تحديثات الطلبات</p>
                <p className="text-xs text-gray-500">إشعارات عند تغيير حالة الطلب</p>
              </div>
            </div>
            <Switch
              checked={notifications.orderUpdates}
              onCheckedChange={(checked) => handleNotificationChange("orderUpdates", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-[#1A1A2E]">الرسائل</p>
                <p className="text-xs text-gray-500">إشعارات عند استلام رسالة جديدة</p>
              </div>
            </div>
            <Switch
              checked={notifications.messages}
              onCheckedChange={(checked) => handleNotificationChange("messages", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-[#1A1A2E]">المدفوعات</p>
                <p className="text-xs text-gray-500">إشعارات عند الدفع أو السحب</p>
              </div>
            </div>
            <Switch
              checked={notifications.payments}
              onCheckedChange={(checked) => handleNotificationChange("payments", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-[#1A1A2E]">العروض والترويج</p>
                <p className="text-xs text-gray-500">إشعارات عن العروض والخصومات</p>
              </div>
            </div>
            <Switch
              checked={notifications.promotions}
              onCheckedChange={(checked) => handleNotificationChange("promotions", checked)}
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A2E]">إعدادات الخصوصية</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-[#1A1A2E]">إظهار البريد الإلكتروني</p>
                <p className="text-xs text-gray-500">السماح لمستخدمين آخرين برؤية بريدك</p>
              </div>
            </div>
            <Switch
              checked={privacy.showEmail}
              onCheckedChange={(checked) => handlePrivacyChange("showEmail", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-[#1A1A2E]">إظهار رقم الهاتف</p>
                <p className="text-xs text-gray-500">السماح لمستخدمين آخرين برؤية رقم هاتفك</p>
              </div>
            </div>
            <Switch
              checked={privacy.showPhone}
              onCheckedChange={(checked) => handlePrivacyChange("showPhone", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-sm text-[#1A1A2E]">الملف الشخصي العام</p>
                <p className="text-xs text-gray-500">السماح بالاطلاع على ملفك الشخصي</p>
              </div>
            </div>
            <Switch
              checked={privacy.showProfile}
              onCheckedChange={(checked) => handlePrivacyChange("showProfile", checked)}
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-red-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-red-600">منطقة الخطر</h3>
        </div>

        <div className="bg-red-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-700 leading-relaxed">
            <strong>تحذير:</strong> حذف الحساب إجراء لا رجعة فيه. سيتم حذف جميع بياناتك بما في ذلك:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-600">
            <li>- الملف الشخصي والبيانات</li>
            <li>- الخدمات المنشورة (كبائع)</li>
            <li>- سجل الطلبات والمعاملات</li>
            <li>- الرسائل والمحادثات</li>
            <li>- الرصيد المتبقي في المحفظة</li>
          </ul>
        </div>

        <Button
          onClick={() => setShowDeleteModal(true)}
          variant="destructive"
          className="rounded-xl"
        >
          <Trash2 className="w-4 h-4 ml-2" />
          حذف الحساب نهائياً
        </Button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-[#1A1A2E] mb-2 text-center">حذف الحساب نهائياً؟</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 text-center">
              هذا الإجراء لا رجعة فيه. يرجى كتابة بريدك الإلكتروني <strong>{user?.email}</strong> للتأكيد.
            </p>
            
            <input
              type="email"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني للتأكيد"
              className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all mb-6"
            />

            <div className="flex flex-col gap-3">
              <Button
                disabled={deleteAccount.isPending || deleteConfirmation !== user?.email}
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-red-200"
              >
                {deleteAccount.isPending ? "جاري الحذف..." : "تأكيد الحذف النهائي"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
                className="h-12 rounded-xl text-gray-400 font-bold hover:text-gray-600"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Package(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
