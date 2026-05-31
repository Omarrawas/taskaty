import { Link } from "react-router";
import { Store, CheckCircle, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const requirements = [
  "حساب مسجل في المنصة ببيانات صحيحة",
  "ملف شخصي مكتمل مع صورة حقيقية",
  "أثر عمل يعرض مهاراتك (معرض أعمال)",
  "وصف تفصيلي للخدمات التي تقدمها",
  "أسعار مناسبة وتنافسية",
];

const commissionTiers = [
  {
    level: "بائع جديد",
    orders: "0-10 طلبات",
    commission: "20%",
    color: "bg-gray-100 text-gray-700",
  },
  {
    level: "بائع موثوق",
    orders: "11-50 طلب",
    commission: "15%",
    color: "bg-blue-100 text-blue-700",
  },
  {
    level: "بائع مميز",
    orders: "51+ طلب",
    commission: "10%",
    color: "bg-amber-100 text-amber-700",
  },
];

const rules = [
  {
    icon: CheckCircle,
    title: "الالتزام بالجودة",
    description: "يجب تقديم عمل ي meeting توقعات المشتري كما هو وصف في الخدمة.",
  },
  {
    icon: CheckCircle,
    title: "التسليم في الوقت",
    description: "يلتزم البائع بتسليم العمل في الموعد المحدد أو إخطار المشتري بأي تأخير.",
  },
  {
    icon: CheckCircle,
    title: "التواصل الفعال",
    description: "الرد على رسائل المشترين في أسرع وقت ممكن وتحديث حالة العمل.",
  },
  {
    icon: Shield,
    title: "الامتناع عن المحتوى المحظور",
    description: "يُحظر تقديم خدمات تنتهك حقوق الملكية الفكرية أو غير قانونية.",
  },
];

const benefits = [
  "دخول مجتمعي من المشتريين الباحثين عن خدمات رقمية",
  "نظام ضمان يحمي أرباحك",
  "أدوات لإدارة خدماتك وطلباتك",
  "دعم فني متخصص للبائعين",
  "فرص للنمو وزيادة الدخل",
];

export default function SellerTerms() {
  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />

      {/* Hero */}
      <div className="pt-[72px] bg-gradient-to-br from-[#0D5D48] to-[#094533] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <Store className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-4">شروط البائعين</h1>
          <p className="text-white/80">القواعد والمتطلبات للمبتعدين على المنصة</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-16">
        {/* Requirements */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">متطلبات التسجيل كبائع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <CheckCircle className="w-5 h-5 text-[#0D5D48] shrink-0" />
                <span className="text-gray-700">{req}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Tiers */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">جدول العمولات</h2>
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-right p-4 font-bold text-[#1A1A2E]">المستوى</th>
                  <th className="text-right p-4 font-bold text-[#1A1A2E]">عدد الطلبات</th>
                  <th className="text-right p-4 font-bold text-[#1A1A2E]">العمولة</th>
                </tr>
              </thead>
              <tbody>
                {commissionTiers.map((tier, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${tier.color}`}>
                        {tier.level}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{tier.orders}</td>
                    <td className="p-4 text-[#0D5D48] font-bold">{tier.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rules */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">قواعد السلوك المهني</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#E8F5F0] text-[#0D5D48] rounded-xl flex items-center justify-center">
                    <rule.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#1A1A2E]">{rule.title}</h3>
                </div>
                <p className="text-gray-500 text-sm">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">مزايا البائعين</h2>
          <div className="bg-gradient-to-br from-[#E8F5F0] to-[#D4EBE1] rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-[#0D5D48] fill-[#0D5D48]" />
                  <span className="text-[#1A1A2E]">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-4">جاهز للبدء كبائع؟</h2>
          <p className="text-gray-500 mb-6">انضم الآن وابدأ في كسب الأرباح من مهاراتك</p>
          <Button asChild className="bg-[#0D5D48] hover:bg-[#094533] rounded-xl px-8 h-12">
            <Link to="/register">انضم كبائع الآن</Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
