import { Link } from "react-router";
import { Search, CreditCard, Shield, CheckCircle, Users, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const steps = [
  {
    icon: Search,
    title: "ابحث عن الخدمة",
    description: "تصفح آلاف الخدمات الرقمية المتاحة أو استخدم البحث للعثور على ما تحتاجه بالضبط.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: CreditCard,
    title: "اختر واضمن الدفع",
    description: "اختر الباقة المناسبة وادفع بسلام عبر نظام الضمان المالي الذي يحمي أموالك.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Users,
    title: "تواصل مع البائع",
    description: "تواصل مباشرة مع البائع لمناقشة تفاصيل العمل ومتطلباتك.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: CheckCircle,
    title: "استلم عملك",
    description: "استلم العمل النهائي وقم بالمراجعة. يمكنك طلب التعديل إذا لزم الأمر.",
    color: "bg-amber-50 text-amber-600",
  },
];

const sellerSteps = [
  {
    icon: 1,
    title: "أنشئ حسابك",
    description: "سجّل حساباً مجانياً كبائع وقم بإعداد ملفك الشخصي.",
  },
  {
    icon: 2,
    title: "أضف خدماتك",
    description: "أنشئ خدماتك مع وصف تفصيلي وصور وتحديد الأسعار.",
  },
  {
    icon: 3,
    title: "ابدأ البيع",
    description: "تلقّى طلبات من العملاء وابدأ في تنفيذها.",
  },
  {
    icon: 4,
    title: "احصل على أرباحك",
    description: "اسحب أرباحك في أي وقت عبر طرق الدفع المتاحة.",
  },
];

const features = [
  {
    icon: Shield,
    title: "نظام الضمان",
    description: "أموالك محمية 100%. لا تُصرف إلا بعد استلام العمل والموافقة عليه.",
  },
  {
    icon: Star,
    title: "نظام التقييمات",
    description: "اختر البائعين بناءً على تقييمات العملاء السابقين.",
  },
  {
    icon: CreditCard,
    title: "دفع آمن",
    description: "多种 طرق الدفع المتاحة مع تشفير كامل للبيانات.",
  },
  {
    icon: Users,
    title: "دعم مستمر",
    description: "فريق الدعم متاح لمساعدتك في أي مشكلة.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />

      {/* Hero */}
      <div className="pt-[72px] bg-gradient-to-br from-[#0D5D48] to-[#094533] text-white py-20">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">كيف يعمل Taskaty؟</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            منصة تربط بين المشترين والبائعين لتقديم الخدمات الرقمية بأمان وسهولة
          </p>
        </div>
      </div>

      {/* Steps for Buyers */}
      <div className="max-w-[1200px] mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">للمشترين</h2>
          <p className="text-gray-500">خطوات بسيطة للحصول على الخدمات التي تحتاجها</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mb-4`}>
                <step.icon className="w-8 h-8" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0D5D48] text-white rounded-full flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps for Sellers */}
      <div className="bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">للبائعين</h2>
            <p className="text-gray-500">ابدأ في كسب المال من مهاراتك</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sellerSteps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-[#0D5D48] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild className="bg-[#0D5D48] hover:bg-[#094533] rounded-xl px-8 h-12">
              <Link to="/register">انضم كبائع الآن</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-[1200px] mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">لماذا Taskaty؟</h2>
          <p className="text-gray-500">مميزات تجعلنا الخيار الأفضل</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center">
              <div className="w-14 h-14 bg-[#E8F5F0] text-[#0D5D48] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0D5D48] py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">جاهز للبدء؟</h2>
          <p className="text-white/80 mb-8">انضم إلى آلاف المستخدمين الذين يثقون بـ Taskaty</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild className="bg-white text-[#0D5D48] hover:bg-gray-100 rounded-xl px-8 h-12">
              <Link to="/services">تصفح الخدمات</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl px-8 h-12">
              <Link to="/register">انضم كبائع</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
