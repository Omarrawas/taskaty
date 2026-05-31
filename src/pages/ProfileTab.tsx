import { useState } from "react";
import { User, Camera, Save, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ProfileTab() {
  const { user, refresh } = useAuth();
  const utils = trpc.useUtils();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success("تم تحديث الملف الشخصي بنجاح");
      await utils.auth.me.invalidate();
      refresh();
    },
    onError: (err) => {
      toast.error(err.message || "فشل في تحديث الملف الشخصي");
    },
  });

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      toast.error(err.message || "فشل في تغيير كلمة المرور");
    },
  });

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }
    updateProfile.mutate({
      name: name.trim(),
      phone: phone.trim() || undefined,
      avatar: avatar.trim() || undefined,
    });
  };

  const handleChangePassword = () => {
    if (!newPassword) {
      toast.error("يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    changePassword.mutate({ newPassword });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">الملف الشخصي</h2>

      {/* Avatar Section */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 mb-6">
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">الصورة الشخصية</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={avatar || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "user"}`}
              alt=""
              className="w-24 h-24 rounded-2xl object-cover border-2 border-[#E5E5DF]"
            />
            <label className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#0D5D48] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#094533] transition-colors shadow-lg">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setAvatar(ev.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
          <div className="flex-1">
            <Label>رابط الصورة (URL)</Label>
            <Input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="rounded-xl h-11 border-[#E5E5DF] mt-2"
            />
            <p className="text-xs text-gray-400 mt-2">أو ارفع صورة من جهازك</p>
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 mb-6">
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">المعلومات الأساسية</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>الاسم الكامل</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسمك"
              className="rounded-xl h-11 border-[#E5E5DF]"
            />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              value={user?.email || ""}
              disabled
              className="rounded-xl h-11 border-[#E5E5DF] bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400">لا يمكن تغيير البريد الإلكتروني</p>
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+963 xxx xxx xxx"
              className="rounded-xl h-11 border-[#E5E5DF]"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>الدور</Label>
            <Input
              value={user?.role === "admin" ? "مدير" : user?.role === "seller" ? "بائع" : "مشتري"}
              disabled
              className="rounded-xl h-11 border-[#E5E5DF] bg-gray-50 text-gray-500"
            />
          </div>
        </div>
        <Button
          onClick={handleSaveProfile}
          disabled={updateProfile.isPending || !name.trim()}
          className="mt-6 bg-[#0D5D48] hover:bg-[#094533] rounded-xl px-8 h-11"
        >
          {updateProfile.isPending ? (
            "جاري الحفظ..."
          ) : (
            <>
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </>
          )}
        </Button>
        {updateProfile.error && (
          <p className="text-sm text-red-600 mt-3">{updateProfile.error.message}</p>
        )}
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50">
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">تغيير كلمة المرور</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>كلمة المرور الجديدة</Label>
            <div className="relative">
              <Input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                className="rounded-xl h-11 border-[#E5E5DF] pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>تأكيد كلمة المرور</Label>
            <Input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              className="rounded-xl h-11 border-[#E5E5DF]"
            />
          </div>
        </div>
        <Button
          onClick={handleChangePassword}
          disabled={changePassword.isPending || !newPassword || !confirmPassword}
          variant="outline"
          className="mt-6 rounded-xl px-8 h-11 border-[#E5E5DF]"
        >
          {changePassword.isPending ? (
            "جاري التغيير..."
          ) : (
            <>
              <Lock className="w-4 h-4 ml-2" />
              تغيير كلمة المرور
            </>
          )}
        </Button>
        {changePassword.error && (
          <p className="text-sm text-red-600 mt-3">{changePassword.error.message}</p>
        )}
        {changePassword.isSuccess && (
          <p className="text-sm text-green-600 mt-3 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            تم تغيير كلمة المرور بنجاح
          </p>
        )}
      </div>
    </div>
  );
}
