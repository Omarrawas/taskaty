import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";

const contactInfo = [
  {
    icon: Mail,
    title: "البريد الإلكتروني",
    value: "support@taskaty.app",
    description: "نرد خلال 24 ساعة",
  },
  {
    icon: Phone,
    title: "الهاتف",
    value: "+963 9XX XXX XXX",
    description: "متاح من السبت إلى الخميس",
  },
  {
    icon: MapPin,
    title: "الموقع",
    value: "دمشق، سوريا",
    description: "المقر الرئيسي",
  },
  {
    icon: Clock,
    title: "ساعات العمل",
    value: "9 صباحاً - 6 مساءً",
    description: "أيام العمل: السبت - الخميس",
  },
];

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("تم إرسال رسالتك بنجاح!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />

      {/* Hero */}
      <div className="pt-[72px] bg-gradient-to-br from-[#0D5D48] to-[#094533] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-white/80 text-lg">نحن هنا لمساعدتك. لا تتردد في التواصل معنا</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">معلومات التواصل</h2>
            <div className="space-y-6">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E8F5F0] text-[#0D5D48] rounded-xl flex items-center justify-center shrink-0">
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A1A2E]">{info.title}</h3>
                    <p className="text-[#0D5D48] font-medium">{info.value}</p>
                    <p className="text-gray-500 text-sm">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h3 className="font-bold text-[#1A1A2E] mb-4">تابعنا</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#E8F5F0] rounded-full flex items-center justify-center transition-colors">
                  <MessageCircle className="w-5 h-5 text-[#0D5D48]" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-100 hover:bg-[#E8F5F0] rounded-full flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5 text-[#0D5D48]" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">تم إرسال رسالتك!</h3>
                  <p className="text-gray-500 mb-6">سنتواصل معك في أقرب وقت ممكن</p>
                  <Button onClick={() => setIsSubmitted(false)} className="bg-[#0D5D48] hover:bg-[#094533] rounded-xl">
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">أرسل لنا رسالة</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1A1A2E]">الاسم</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="اسمك الكامل"
                        required
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#1A1A2E]">البريد الإلكتروني</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        required
                        className="rounded-xl h-12"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="text-sm font-medium text-[#1A1A2E]">الموضوع</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="موضوع الرسالة"
                      required
                      className="rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="text-sm font-medium text-[#1A1A2E]">الرسالة</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="اكتب رسالتك هنا..."
                      required
                      className="rounded-xl min-h-[150px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0D5D48] hover:bg-[#094533] rounded-xl px-8 h-12"
                  >
                    {isSubmitting ? (
                      "جاري الإرسال..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 ml-2" />
                        إرسال الرسالة
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
