import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Send } from "lucide-react";

// Semua request ke backend Railway - API key TIDAK boleh di frontend
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Berapa kalori ayam goreng?",
  "Rekomendasi makanan tinggi protein",
  "Apa manfaat brokoli?",
  "Menu sehat untuk diet",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Halo! Saya GiziBot, asisten nutrisi kamu 👋\n\nTanya apa saja tentang gizi, kandungan makanan, atau rekomendasi menu sehat!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Panggil backend Railway - bukan Gemini langsung
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { 
        role: "assistant", 
        content: data.reply || "Maaf, saya tidak dapat menjawab saat ini." 
      }]);
    } catch {
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "Maaf, terjadi kesalahan. Coba lagi ya!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-black px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">🤖</div>
        <div>
          <p className="font-syne font-bold text-white text-sm">GiziBot</p>
          <p className="text-gray-400 text-xs">Asisten nutrisi kamu</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto" style={{ minHeight: "calc(100vh - 240px)", maxHeight: "calc(100vh - 240px)" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user" ? "bg-black text-white rounded-tr-none" : "bg-gray-100 text-black rounded-tl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-xs px-3 py-2 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex gap-3 items-center bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Tanya soal gizi..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm outline-none text-black"
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="w-10 h-10 bg-black rounded-full flex items-center justify-center disabled:opacity-40 flex-shrink-0">
          <Send size={16} className="text-white" />
        </button>
      </div>
    </Layout>
  );
}