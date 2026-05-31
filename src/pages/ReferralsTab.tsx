import { useState } from "react";
import { 
  Gift, Copy, Check, Share2, Users, Wallet, Star 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function ReferralsTab() {
  const [copied, setCopied] = useState(false);

  const { data: stats, isLoading } = trpc.referrals.stats.useQuery();
  const { data: linkData } = trpc.referrals.link.useQuery();

  const referralLink = linkData?.link || "";
  const referralCode = stats?.code || "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("تم نسخ رابط الدعوة");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("فشل في نسخ الرابط");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "انضم إلى Taskaty",
          text: "استخدم رابط الدعوة الخاص بي للحصول على مكافأة عند التسجيل!",
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
      <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">نظام الدعوات</h2>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0D5D48] to-[#094533] rounded-3xl p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">ادعُ أصدقاءك واحصل على مكافآت</h3>
              <p className="text-white/70 text-sm">شارك رابط الدعوة واحصل على 500 ل.س لكل صديق ينضم</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 text-center">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-[#1A1A2E]">{stats?.totalReferrals || 0}</p>
          <p className="text-xs text-gray-500 mt-1">مستخدم مدعو</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 text-center">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-[#0D5D48]">{(stats?.totalRewards || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">ل.س مكافآت</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 text-center">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">500</p>
          <p className="text-xs text-gray-500 mt-1">ل.س للدعوة</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 mb-6">
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">رابط الدعوة الخاص بك</h3>
        <div className="flex gap-3">
          <Input
            value={referralLink}
            readOnly
            className="rounded-xl h-12 border-[#E5E5DF] bg-gray-50 font-mono text-sm"
          />
          <Button
            onClick={handleCopyLink}
            className={`rounded-xl h-12 px-6 ${
              copied 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-[#0D5D48] hover:bg-[#094533]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 ml-2" />
                تم النسخ
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 ml-2" />
                نسخ
              </>
            )}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="rounded-xl h-12 px-6 border-[#E5E5DF]"
          >
            <Share2 className="w-4 h-4 ml-2" />
            مشاركة
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          كود الدعوة: <span className="font-mono font-bold text-[#0D5D48]">{referralCode}</span>
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50 mb-6">
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">كيف يعمل؟</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#E8F5F0] rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#0D5D48]">1</span>
            </div>
            <div>
              <p className="font-medium text-sm text-[#1A1A2E]">شارك رابط الدعوة</p>
              <p className="text-xs text-gray-500">انسخ الرابط أو شاركه مباشرة مع أصدقائك</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#E8F5F0] rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#0D5D48]">2</span>
            </div>
            <div>
              <p className="font-medium text-sm text-[#1A1A2E]">يسجل صديقك الحساب</p>
              <p className="text-xs text-gray-500">عند التسجيل عبر رابط الدعوة، يتم ربط الحساب بك</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-[#E8F5F0] rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#0D5D48]">3</span>
            </div>
            <div>
              <p className="font-medium text-sm text-[#1A1A2E]">احصل على مكافأة</p>
              <p className="text-xs text-gray-500">500 ل.س تُضاف تلقائياً لمحفظتك عند كل دعوة ناجحة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referred Users List */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5DF]/50">
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">الأصدقاء المدعوون</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-1" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : stats?.referredUsers && stats.referredUsers.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {stats.referredUsers.map((user: any) => (
              <div key={user.id} className="flex items-center gap-3 py-3">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm text-[#1A1A2E]">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    انضم في {new Date(user.createdAt).toLocaleDateString("ar-SY")}
                  </p>
                </div>
                <Badge className="bg-green-50 text-green-600 border-0 text-xs">
                  +500 ل.س
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">لم تقم بدعوة أي صديق بعد</p>
            <p className="text-gray-400 text-xs mt-1">شارك رابط الدعوة واحصل على مكافآت</p>
          </div>
        )}
      </div>
    </div>
  );
}
