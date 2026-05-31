import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Clock, TrendingUp, X, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

const STORAGE_KEY = "taskaty_search_history";
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

function addToSearchHistory(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const history = getSearchHistory();
    const filtered = history.filter((h) => h !== query);
    const newHistory = [query, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch {
    // Ignore storage errors
  }
}

function removeFromSearchHistory(query: string) {
  if (typeof window === "undefined") return;
  try {
    const history = getSearchHistory();
    const filtered = history.filter((h) => h !== query);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore storage errors
  }
}

function clearSearchHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

const trendingSearches = [
  "تصميم شعار",
  "برمجة موقع",
  "ترجمة",
  "تسويق رقمي",
  "تصميم جرافيك",
  "كتابة محتوى",
];

export default function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "ابحث في الخدمات...",
  className = "",
  showSuggestions = true,
}: SearchInputProps) {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToSearchHistory(query.trim());
      setHistory(getSearchHistory());
    }
    setIsFocused(false);
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/services?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      handleSearch(value);
    }
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const handleRemoveFromHistory = (query: string) => {
    removeFromSearchHistory(query);
    setHistory(getSearchHistory());
  };

  const showDropdown = showSuggestions && isFocused;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-2 flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-0 shadow-none focus-visible:ring-0 text-right text-[#1A1A2E] placeholder:text-gray-400 bg-transparent flex-1 h-12"
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <button
          onClick={() => handleSearch(value)}
          className="bg-[#0D5D48] hover:bg-[#094533] text-white rounded-xl px-6 h-12 font-semibold shrink-0 transition-colors"
        >
          بحث
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden z-50">
          {/* Search History */}
          {history.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-[#1A1A2E] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  عمليات البحث الأخيرة
                </h4>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  مسح الكل
                </button>
              </div>
              <div className="space-y-1">
                {history.slice(0, 5).map((query, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between group"
                  >
                    <button
                      onClick={() => {
                        onChange(query);
                        handleSearch(query);
                      }}
                      className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{query}</span>
                    </button>
                    <button
                      onClick={() => handleRemoveFromHistory(query)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-[#1A1A2E] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0D5D48]" />
              عمليات بحث شائعة
            </h4>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onChange(query);
                    handleSearch(query);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-[#E8F5F0] text-sm text-gray-700 hover:text-[#0D5D48] rounded-full transition-colors"
                >
                  <Search className="w-3 h-3" />
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <Link
              to="/services"
              onClick={() => setIsFocused(false)}
              className="flex items-center justify-center gap-2 text-sm font-medium text-[#0D5D48] hover:text-[#094533] transition-colors"
            >
              تصفح جميع الخدمات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
