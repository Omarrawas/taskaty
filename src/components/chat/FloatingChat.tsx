import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minus, Search, Image, Paperclip, Download, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, addDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { uploadChatFile } from "@/lib/storage";

export default function FloatingChat() {
  const { user } = useAuth();
  const { conversations, loading } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [minimized, setMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) return null;

  const filteredConversations = conversations.filter((conv: any) => {
    const otherName = conv.otherName || "";
    return otherName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#0D5D48] text-white rounded-full shadow-lg shadow-[#0D5D48]/30 flex items-center justify-center hover:bg-[#094533] transition-all hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
        {conversations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {conversations.length > 9 ? "9+" : conversations.length}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#0D5D48] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg">المحادثات</h3>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{conversations.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMinimized(!minimized)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في المحادثات..."
                    className="w-full pr-10 pl-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5D48]"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-400 text-sm">جاري التحميل...</div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv: any) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      currentUserId={user.unionId}
                      onClick={() => setActiveChat(conv)}
                      isActive={activeChat?.id === conv.id}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">لا توجد محادثات</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Active Chat Window */}
      {activeChat && (
        <ChatWindow
          conversation={activeChat}
          currentUserId={user.unionId}
          currentUserName={user.name}
          onClose={() => setActiveChat(null)}
          onMinimize={() => setActiveChat(null)}
        />
      )}
    </>
  );
}

function ConversationItem({ conversation, currentUserId, onClick, isActive }: any) {
  const otherName = conversation.otherName || "مستخدم";
  const otherAvatar = conversation.otherAvatar;
  const lastMessage = conversation.lastMessage || "بدء محادثة جديدة...";
  const lastMessageAt = conversation.lastMessageAt?.toDate?.() || new Date();

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${isActive ? "bg-[#E8F5F0]" : ""}`}
    >
      <div className="relative">
        <img
          src={otherAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherName}`}
          alt=""
          className="w-12 h-12 rounded-full object-cover"
        />
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
      </div>
      <div className="flex-1 min-w-0 text-right">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-sm text-[#1A1A2E] truncate">{otherName}</span>
          <span className="text-[10px] text-gray-400">
            {lastMessageAt.toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{lastMessage}</p>
      </div>
    </button>
  );
}

function ChatWindow({ conversation, currentUserId, currentUserName, onClose, onMinimize }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherName = conversation.otherName || "مستخدم";
  const otherAvatar = conversation.otherAvatar;
  const otherId = conversation.participants?.find((p: string) => p !== currentUserId);

  useEffect(() => {
    if (!conversation?.id) return;

    const q = query(
      collection(db, "conversations", conversation.id, "messages")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      msgs.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("حجم الملف يجب أن يكون أقل من 10 ميغابايت");
      return;
    }

    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedFilePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFilePreview(null);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setSelectedFilePreview(null);
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || !conversation?.id) return;

    setIsUploading(true);
    const convRef = doc(db, "conversations", conversation.id);
    
    const messageData: any = {
      senderId: currentUserId,
      createdAt: serverTimestamp(),
    };

    // Upload file if selected
    if (selectedFile) {
      try {
        const uploadResult = await uploadChatFile(selectedFile, conversation.id, currentUserId);
        messageData.attachmentUrl = uploadResult.url;
        messageData.attachmentName = uploadResult.name;
        messageData.attachmentType = uploadResult.type;
        messageData.content = newMessage || `📎 ${uploadResult.name}`;
      } catch (err) {
        alert("فشل في رفع الملف. يرجى المحاولة مرة أخرى.");
        setIsUploading(false);
        return;
      }
    } else {
      messageData.content = newMessage;
    }

    await addDoc(collection(convRef, "messages"), messageData);

    await updateDoc(convRef, {
      lastMessage: selectedFile ? `📎 ${selectedFile.name}` : newMessage,
      lastMessageAt: serverTimestamp(),
    });

    // Send notification
    if (otherId) {
      try {
        await addDoc(collection(db, "users", otherId, "notifications"), {
          title: "رسالة جديدة",
          message: selectedFile 
            ? `أرسل ${currentUserName || "مستخدم"} ملف: ${selectedFile.name}`
            : `رسالة جديدة من ${currentUserName || "مستخدم"}`,
          type: "message",
          referenceId: conversation.id,
          referenceType: "conversation",
          isRead: false,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        // notification failed silently
      }
    }

    setNewMessage("");
    setSelectedFile(null);
    setSelectedFilePreview(null);
    setIsUploading(false);
  };

  return (
    <div className={`fixed bottom-24 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300 ${
      isMinimized ? "bottom-24 left-[420px] w-[350px] h-[60px]" : "bottom-24 left-[420px] w-[350px] h-[500px]"
    }`}>
      {/* Chat Header */}
      <div className="bg-[#0D5D48] text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={otherAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherName}`}
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#0D5D48] rounded-full"></span>
          </div>
          <div>
            <p className="font-bold text-sm">{otherName}</p>
            <p className="text-[10px] text-white/70">متصل الآن</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 h-[340px] overflow-y-auto p-4 bg-[#FAFBF7] space-y-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <img
                      src={otherAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherName}`}
                      alt=""
                      className="w-8 h-8 rounded-full ml-2 mt-auto"
                    />
                  )}
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-[#0D5D48] text-white rounded-br-md"
                      : "bg-white text-[#1A1A2E] rounded-bl-md shadow-sm border border-gray-100"
                  }`}>
                    {/* Attachment */}
                    {msg.attachmentUrl && (
                      <div className="mb-2">
                        {msg.attachmentType?.startsWith("image/") ? (
                          <img 
                            src={msg.attachmentUrl} 
                            alt={msg.attachmentName || "صورة"} 
                            className="rounded-xl max-w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.attachmentUrl, "_blank")}
                          />
                        ) : (
                          <a 
                            href={msg.attachmentUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2 rounded-xl ${isMe ? "bg-white/10 hover:bg-white/20" : "bg-gray-50 hover:bg-gray-100"} transition-colors`}
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="text-xs truncate flex-1">{msg.attachmentName}</span>
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-gray-400"}`}>
                      {msg.createdAt?.toDate?.().toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {selectedFilePreview ? (
                  <img src={selectedFilePreview} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A1A2E] truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={removeSelectedFile} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-10 h-10 text-gray-500 hover:text-[#0D5D48] hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Image className="w-5 h-5" />
              </button>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="اكتب رسالة..."
                disabled={isUploading}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0D5D48] disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={(!newMessage.trim() && !selectedFile) || isUploading}
                className="w-10 h-10 bg-[#0D5D48] text-white rounded-full flex items-center justify-center hover:bg-[#094533] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-[-2px]" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
