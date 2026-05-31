import { useState } from "react";
import { Star, Search, Users, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";

export default function Sellers() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  const { data: sellers, isLoading } = trpc.sellers.list.useQuery({
    limit: 50,
  });

  const filtered = (sellers ?? []).filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.bio ?? "").toLowerCase().includes(q);
  }).sort((a, b) => {
    if (sortBy === "rating") return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
    if (sortBy === "orders") return (b.totalOrders || 0) - (a.totalOrders || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#FAFBF7]">
      <Header />

      <div className="bg-gradient-to-br from-[#0D5D48] to-[#094533] py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-1 bg-amber-400 rounded-full" />
             <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">نخبة البائعين</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">أفضل البائعين في خدماتي</h1>
          <p className="text-white/70 text-lg max-w-xl leading-relaxed">تواصل مع أفضل الخبراء والمبدعين المستعدين لتحويل أفكارك إلى واقع بجودة استثنائية.</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
          <div className="relative w-full sm:w-[400px]">
            <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="ابحث بالنص أو اسم البائع..." 
              className="pr-12 h-14 rounded-2xl border-gray-100 shadow-sm focus:ring-[#0D5D48]" 
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-bold text-gray-400 shrink-0">ترتيب حسب:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="px-4 py-3 rounded-2xl border-gray-100 bg-white text-sm font-bold text-[#1A1A2E] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0D5D48] transition-all"
            >
              <option value="rating">الأعلى تقييماً</option>
              <option value="orders">الأكثر طلباً ومبيعاً</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((seller, i) => (
              <div
                key={seller.id}
                className="bg-white rounded-[2rem] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-[#E5E5DF]/50 hover:border-[#0D5D48]/20 transition-all group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <div className="relative mb-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <img 
                        src={seller.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${seller.name}`} 
                        alt={seller.name} 
                        className="w-20 h-20 rounded-3xl object-cover shadow-md group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#1A1A2E] text-xl mb-1">{seller.name}</h3>
                      <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-0 text-[10px] font-black uppercase">
                        {(seller as any).level || "بائع موثوق"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-6 px-1">
                   <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-black text-[#1A1A2E]">{seller.rating || "0"}</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-bold">{seller.totalOrders || 0} عميل</span>
                   </div>
                   <div className="flex items-center gap-1.5 text-gray-400">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-bold">100% رد</span>
                   </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 h-10 mb-8 italic">
                  "{seller.bio || "بائع خبير في منصة خدماتي يسعى لتقديم الأفضل لعملائه."}"
                </p>

                <Button variant="outline" className="w-full bg-[#E8F5F0] border-transparent text-[#0D5D48] hover:bg-[#0D5D48] hover:text-white rounded-2xl h-12 font-black transition-all active:scale-[0.98]" asChild>
                  <Link to={`/sellers/${seller.id}`}>بناء استشارة معه</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لم نعثر على أي بائع يطابق بحثك حالياً</p>
            <Button variant="link" onClick={() => setQuery("")} className="text-[#0D5D48]">إظهار الكل</Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
