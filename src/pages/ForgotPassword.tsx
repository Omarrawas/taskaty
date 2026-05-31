import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowRight, CheckCircle, Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("تم إرسال رابط إعادة التعيين");
    } catch (error: any) {
      let errorMsg = "فشل في إرسال الرسالة";
      if (error.code === "auth/user-not-found") {
        errorMsg = "لا يوجد حساب مرتبط بهذا البريد الإلكتروني";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "البريد الإلكتروني غير صالح";
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm border-2 shadow-xl">
        <CardHeader className="text-center space-y-1">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <Hexagon className="w-8 h-8 text-[#0D5D48] fill-[#0D5D48]" />
            <span className="text-[#0D5D48] text-2xl font-medium">Taskaty</span>
          </Link>
          
          {sent ? (
            <>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">تم الإرسال!</CardTitle>
              <CardDescription className="text-sm">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#E8F5F0] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#0D5D48]" />
              </div>
              <CardTitle className="text-2xl font-bold">نسيت كلمة المرور؟</CardTitle>
              <CardDescription className="text-sm">
                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-500">
                لم تستلم الرسالة؟ تحقق من مجلد البريد العشوائي
              </p>
              <Button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full h-12"
              >
                إرسال مرة أخرى
              </Button>
              <Link to="/login" className="block text-center text-sm text-[#0D5D48] hover:underline">
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1A1A2E]">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  dir="ltr"
                  className="h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12" disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </Button>
              <Link to="/login" className="block text-center text-sm text-gray-500 hover:text-[#0D5D48]">
                <ArrowRight className="w-4 h-4 inline ml-1" />
                العودة لتسجيل الدخول
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
