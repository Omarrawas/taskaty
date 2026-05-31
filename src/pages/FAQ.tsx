import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const faqCategories = [
  {
    title: "عام",
    questions: [
      {
        q: "ما هو Taskaty؟",
        a: "Taskaty هي منصة رقمية تربط بين المشترين والبائعين لتقديم和服务 الاستشارية والخدمات الرقمية في سوريا والمنطقة العربية.",
      },
      {
        q: "كيف يمكنني التسجيل في المنصة؟",
        a: "يمكنك التسجيل بسهولة عبر البريد الإلكتروني أو حساب Google الخاص بك. فقط اضغط على 'انضم كبائع' أو 'تسجيل الدخول' واتبع الخطوات.",
      },
      {
        q: "هل المنصة مجانية؟",
        a: "التسجيل والاستخدام أساسي مجاني. نخصم عمولة صغيرة فقط على كل عملية بيع ناجحة.",
      },
    ],
  },
  {
    title: "المشتريون",
    questions: [
      {
        q: "كيف أشتري خدمة؟",
        a: "تصفح الخدمات، اختر الخدمة المناسبة، اختر الباقة، واضغط 'اشترِ الآن'. سيتم حفظ المبلغ في نظام الضمان حتى تستلم عملك.",
      },
      {
        q: "ماذا أفعل إذا لم أكن راضياً عن العمل؟",
        a: "يمكنك طلب تعديل من البائع. إذا لم تتوصل لحل، يمكنك فتح نزاع وسيراجعه فريق الإدارة.",
      },
      {
        q: "كيف أسترد أموالي؟",
        a: "إذا ألغيت الطلب قبل قبول البائع له، يتم رد المبلغ تلقائياً لمحفظتك. يمكنك استخدامه لشراء خدمات أخرى أو سحبه.",
      },
      {
        q: "هل أمان الدفع آمن؟",
        a: "نعم، نستخدم نظام الضمان (Escrow) الذي يحمي أموالك. لا يُصرف المبلغ للبائع إلا بعد استلام العمل والموافقة عليه.",
      },
    ],
  },
  {
    title: "البائعون",
    questions: [
      {
        q: "كيف أبدأ البيع؟",
        a: "سجّل حساباً كبائع، أضف خدماتك مع وصف تفصيلي وصور، حدد الأسعار، وابدأ في تلقي الطلبات.",
      },
      {
        q: "كيف أحصل على أرباحي؟",
        a: "عند قبول المشتري للعمل، يتم تحويل الأرباح لمحفظتك. يمكنك سحبها في أي وقت عبر طرق السحب المتاحة.",
      },
      {
        q: "كم العمولة التي تأخذها المنصة؟",
        a: "تخصم المنصة عمولة بنسبة 10-20% على كل عملية بيع ناجحة. يمكنك الاطلاع على التفاصيل الكاملة في صفحة البائعين.",
      },
      {
        q: "كيف أتعامل مع طلبات التعديل؟",
        a: "يمكنك قبول أو رفض طلبات التعديل. إذا كان التعديل معقولاً، يُفضل العمل عليه للحفاظ على تقييمك.",
      },
    ],
  },
  {
    title: "الحساب والدفع",
    questions: [
      {
        q: "كيف أشحن محفظتي؟",
        a: "اذهب لمحفظتك في لوحة التحكم، اضغط 'شحن الرصيد'، اختر طريقة الدفع، وأرسل المبلغ للرقم المحدد. سيتم تأكيد الشحن من الإدارة.",
      },
      {
        q: "ما هي طرق الدفع المتاحة؟",
        a: "ندعم المحافظ الإلكترونية وتحويلات الشبكة المصرفية والدفع النقدي عبر مندوبين معتمدين.",
      },
      {
        q: "كيف أغير كلمة المرور؟",
        a: "اذهب لإعدادات الحساب في لوحة التحكم، واضغط 'تغيير كلمة المرور'. أدخل كلمة المرور الجديدة واحفظها.",
      },
      {
        q: "كيف أحذف حسابي؟",
        a: "من إعدادات الحساب، اضغط 'حذف الحساب'. يرجى ملاحظة أن هذا الإجراء لا رجعة فيه.",
      },
    ],
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleQuestion = (idx: string) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />

      {/* Hero */}
      <div className="pt-[72px] bg-gradient-to-br from-[#0D5D48] to-[#094533] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="text-white/80">إجابات على أكثر الأسئلة شيوعاً</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-16">
        {faqCategories.map((category, catIdx) => (
          <div key={catIdx} className="mb-10">
            <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">{category.title}</h2>
            <div className="space-y-3">
              {category.questions.map((item, qIdx) => {
                const idx = `${catIdx}-${qIdx}`;
                const isOpen = openIndex === idx;
                
                return (
                  <div
                    key={qIdx}
                    className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleQuestion(idx)}
                      className="w-full flex items-center justify-between p-5 text-right"
                    >
                      <span className="font-medium text-[#1A1A2E]">{item.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#0D5D48] shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-[#E8F5F0] rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">لم تجد إجابة؟</h3>
          <p className="text-gray-500 mb-6">فريق الدعم جاهز لمساعدتك</p>
          <Button asChild className="bg-[#0D5D48] hover:bg-[#094533] rounded-xl px-8">
            <Link to="/contact">
              <MessageCircle className="w-4 h-4 ml-2" />
              تواصل معنا
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
