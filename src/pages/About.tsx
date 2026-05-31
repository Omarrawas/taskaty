import { Link } from "react-router";
import { Target, Users, Heart, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const stats = [
  { value: "12,000+", label: "خدمة متاحة" },
  { value: "5,000+", label: "بائع مسجل" },
  { value: "25,000+", label: "طلب منجز" },
  { value: "4.8", label: "متوسط التقييم" },
];

const values = [
  {
    icon: Shield,
    title: "الثقة والأمان",
    description: "نضع ثقة مستخدمينا في المقام الأول من خلال نظام الضمان المالي وحماية البيانات.",
  },
  {
    icon: Heart,
    title: "جودة الخدمة",
    description: "نحرص على تقديم أفضل الخدمات الرقمية من خلال بائعين موثوقين ومعتمدين.",
  },
  {
    icon: Users,
    title: "مجتمع متكامل",
    description: "نبني مجتمعاً يربط بين المشترين والبائعين بطريقة عادلة وم-profitable للجميع.",
  },
  {
    icon: Globe,
    title: "توسع مستمر",
    description: "نسعى لتوسيع خدماتنا وجعلها متاحة للمستخدمين في جميع أنحاء المنطقة العربية.",
  },
];

const team = [
  {
    name: "فريق التطوير",
    role: "ال开发 التقني",
    description: "نعمل على تطوير المنصة وتحسينها باستمرار لتقديم أفضل تجربة ممكنة.",
  },
  {
    name: "فريق الدعم",
    role: "خدمة العملاء",
    description: "فريق متخصص لمساعدتك في أي استفسار أو مشكلة قد تواجهك.",
  },
  {
    name: "فريق الجودة",
    description: "نراقب جودة الخدمات المقدمة على المنصة لضمان رضا المستخدمين.",
    role: "المراقبة والجودة",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />

      {/* Hero */}
      <div className="pt-[72px] bg-gradient-to-br from-[#0D5D48] to-[#094533] text-white py-20">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">عن Taskaty</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            منصة رقمية سورية تهدف إلى تمكين الأفراد والشركات من تقديم وشراء الخدمات الرقمية بطريقة سهلة وآمنة
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white py-12 border-b border-[#E5E5DF]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-bold text-[#0D5D48] mb-1">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-[1200px] mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-[#0D5D48]" />
              <span className="text-[#0D5D48] font-medium">رسالتنا</span>
            </div>
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-6">
              تمكين المواهب السورية من الوصول للعالم
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              نؤمن بأن سوريا تمتلك مواهب استثنائية في مختلف المجالات التقنية والإبداعية. مهمتنا هي توفير منصة احترافية تربط هذه المواهب بالعملاء من جميع أنحاء العالم العربي والمجتمع الدولي.
            </p>
            <p className="text-gray-600 leading-relaxed">
              نسعى لبناء اقتصاد رقمي مزدهر يساهم في تنمية المجتمع السوري وتمكين الشباب من كسب عيشهم الكريم من خلال مهاراتهم وإبداعاتهم.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#E8F5F0] to-[#D4EBE1] rounded-3xl p-8 text-center">
            <div className="w-24 h-24 bg-[#0D5D48] text-white rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Globe className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2">رؤيةنا</h3>
            <p className="text-gray-600">
              أن نكون المنصة الرقمية الأولى في المنطقة العربية للخدمات الرقمية
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">قيمنا</h2>
            <p className="text-gray-500">المبادئ التي نعمل بها يومياً</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="w-14 h-14 bg-[#E8F5F0] text-[#0D5D48] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{value.title}</h3>
                <p className="text-gray-500 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-[1200px] mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1A1A2E] mb-4">فريق العمل</h2>
          <p className="text-gray-500">الأشخاص الذين يجعلون Taskaty يحدث</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center">
              <div className="w-20 h-20 bg-[#E8F5F0] text-[#0D5D48] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-1">{member.name}</h3>
              <p className="text-[#0D5D48] text-sm font-medium mb-3">{member.role}</p>
              <p className="text-gray-500 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0D5D48] py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">انضم إلى مسيرة النجاح</h2>
          <p className="text-white/80 mb-8">كن جزءاً من المجتمع المتنامي على Taskaty</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild className="bg-white text-[#0D5D48] hover:bg-gray-100 rounded-xl px-8 h-12">
              <Link to="/register">ابدأ الآن</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl px-8 h-12">
              <Link to="/services">تصفح الخدمات</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
