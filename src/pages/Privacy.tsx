import { Link } from "react-router";
import { Lock, Eye, Shield, Database, Share2, Bell } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    icon: Database,
    title: "1. المعلومات التي نجمعها",
    content: `نجمع المعلومات التالية عند التسجيل واستخدام المنصة:
    - معلومات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف
    - معلومات الدفع: بيانات المحافظ الإلكتروني (مشفرة)
    - معلومات الاستخدام: سجل البحث، الخدمات المشاهدة
    - المعلومات التقنية: عنوان IP، نوع المتصفح، الجهاز`,
  },
  {
    icon: Eye,
    title: "2. كيف نستخدم معلوماتك",
    content: `نستخدم معلوماتك للأغراض التالية:
    - تقديم وتحسين خدماتنا
    - معالجة المعاملات المالية
    - التواصل معك بخصوص حسابك وطلباتك
    - إرسال إشعارات وتحديثات
    - منع الاحتيال وحماية أمن المستخدمين
    - الامتثال للقوانين والأنظمة المعمول بها`,
  },
  {
    icon: Share2,
    title: "3. مشاركة المعلومات",
    content: `لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:
    - مع البائع عند إتمام عملية شراء (الاسم فقط)
    - عند الطلب من الجهات القانونية المختصة
    - لحماية حقوقنا وسلامة مستخدمينا
    - مع مزودي الخدمات الذين يساعدوننا في تشغيل المنصة`,
  },
  {
    icon: Lock,
    title: "4. أمن البيانات",
    content: `نتخذ تدابير أمنية صارمة لحماية معلوماتك:
    - تشفير جميع البيانات الحساسة (SSL/TLS)
    - حماية كلمات المرور بالتشفير
    - مراقبة الوصول غير المصرح به
    - تحديث أنظمة الأمان بانتظام
    - لا نخزن بيانات البطاقات البنكية على خوادمنا`,
  },
  {
    icon: Bell,
    title: "5. الإشعارات والتواصل",
    content: `نستخدم معلوماتك لإرسال:
    - إشعارات حول طلباتك وحسابك
    - تحديثات مهمة عن خدماتنا
    - عروض ترويجية واختيارات (يمكنك إلغاء الاشتراك)
    - نتائج البحث والاقتراحات`,
  },
  {
    icon: Shield,
    title: "6. حقوقك",
    content: `لك الحق في:
    - الاطلاع على معلوماتك الشخصية المحفوظة
    - تعديل أو تحديث معلوماتك
    - حذف حسابك وجميع بياناتك
    - الاعتراض على معالجة معلوماتك
    - تصدير بياناتك
    - سحب الموافقة على معالجة بياناتك`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />

      {/* Hero */}
      <div className="pt-[72px] bg-gradient-to-br from-[#0D5D48] to-[#094533] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-4">سياسة الخصوصية</h1>
          <p className="text-white/80">آخر تحديث: يناير 2025</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-16">
        {/* Intro */}
        <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] mb-8">
          <p className="text-gray-600 leading-relaxed text-lg">
            في <strong className="text-[#0D5D48]">Taskaty</strong>، نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. تشرح هذه السياسة كيف نجمع ونستخدم ونحمي معلوماتك.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#E8F5F0] text-[#0D5D48] rounded-xl flex items-center justify-center">
                  <section.icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#1A1A2E]">{section.title}</h2>
              </div>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Cookies */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] mt-6">
          <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">7. ملفات تعريف الارتباط (Cookies)</h2>
          <p className="text-gray-600 leading-relaxed">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من متصفحك. يرجى ملاحظة أن تعطيل بعض ملفات تعريف الارتباط قد يؤثر على وظائف المنصة.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-[#E8F5F0] rounded-2xl p-6 mt-8">
          <h3 className="font-bold text-[#0D5D48] mb-2">هل لديك أسئلة؟</h3>
          <p className="text-gray-600 text-sm mb-4">
            إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر:
          </p>
          <Link to="/contact" className="text-[#0D5D48] font-medium hover:underline">
            صفحة التواصل معنا
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
