import { Link } from "react-router";
import { AlertTriangle, Scale } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    title: "1. قبول الشروط",
    content: `باستخدامك لمنصة Taskaty، أنت توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.`,
  },
  {
    title: "2. تعريفات",
    content: `"المنصة" تشير إلى موقع Taskaty وتطبيقاته. "المستخدم" أي شخص يستخدم المنصة. "المشتري" هو من يشتري الخدمات. "البائع" هو من يقدم الخدمات. "الخدمة" هي العمل أو المنتج الذي يقدمه البائع.`,
  },
  {
    title: "3. حساب المستخدم",
    content: `أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور. أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك. يجب أن تبلغنا فوراً عن أي استخدام غير مصرح به لحسابك.`,
  },
  {
    title: "4. الطلبات والدفع",
    content: `عند تقديم طلب، يتم حفظ المبلغ في نظام الضمان (Escrow). لا يُصرف المبلغ للبائع إلا بعد استلام العمل والموافقة عليه من المشتري. يحق للمشتري طلب تعديل أو إلغاء الطلب وفقاً لسياسة الإلغاء.`,
  },
  {
    title: "5. التسليم والمراجعة",
    content: `يلتزم البائع بتسليم العمل في الوقت المحدد. يمكن للمشتري مراجعة العمل وطلبه التعديل إذا لم ي meeting المتطلبات. في حالة عدم التوصل لحل، يمكن فتح نزاع لحله من الإدارة.`,
  },
  {
    title: "6. الرسوم والعمولات",
    content: `تخصم المنصة عمولة على كل عملية بيع ناجحة. تُضاف ضريبة القيمة المضافة وفقاً للقوانين المعمول بها. يمكنك الاطلاع على جدول الرسوم الكامل في صفحة البائعين.`,
  },
  {
    title: "7. سياسة الإلغاء",
    content: `يمكن للمشتري إلغاء الطلب قبل قبوله من البائع. في حالة الإلغاء، يُسترد المبلغ بالكامل للمشتري. بعد بدء العمل، يمكن للجانبَين الاتفاق على الإلغاء أو المتابعة.`,
  },
  {
    title: "8. النزاعات",
    content: `في حالة عدم الرضا عن العمل، يمكن لأي من الطرفين فتح نزاع. تراجع الإدارة النزاع وتتخذ قرارها بناءً على الأدلة المقدمة. قرار الإدارة نهائي.`,
  },
  {
    title: "9. المحتوى والملكية الفكرية",
    content: `يحتفظ البائع بحقوق الملكية الفكرية لعمله حتى بعد التسليم، ما لم يتفق الطرفان على خلاف ذلك. يُحظر نسخ أو سرقة المحتوى من المنصة.`,
  },
  {
    title: "10. المسؤولية",
    content: `المنصة ليست مسؤولة عن جودة الخدمات المقدمة من البائعين. المنصة تعمل كمنصة وصل فقط. يتحمل البائع المسؤولية الكاملة عن خدماته.`,
  },
  {
    title: "11. تعديل الشروط",
    content: `نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية. استمرارك في استخدام المنصة بعد التعديلات يعني قبولك لها.`,
  },
  {
    title: "12. القانون الحاكم",
    content: `تخضع هذه الشروط لقوانين الدولة العربية السورية. أي نزاعات تحل وفقاً لقوانين الدولة.`,
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />

      {/* Hero */}
      <div className="pt-[72px] bg-gradient-to-br from-[#0D5D48] to-[#094533] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <Scale className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-4">الشروط والأحكام</h1>
          <p className="text-white/80">آخر تحديث: يناير 2025</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-16">
        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800 mb-1">تنبيه مهم</h3>
              <p className="text-amber-700 text-sm">
                يرجى قراءة هذه الشروط بعناية قبل استخدام المنصة. استخدامك للمنصة يعني موافقتك على جميع الشروط المذكورة أدناه.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="space-y-8">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-lg font-bold text-[#1A1A2E] mb-3">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 mb-4">
            لديك أسئلة حول الشروط والأحكام؟
          </p>
          <Link to="/contact" className="text-[#0D5D48] font-medium hover:underline">
            تواصل معنا
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
