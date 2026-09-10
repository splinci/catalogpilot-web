"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function AtlasCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am **Splinci AI**, your executive operational assistant. Ask me anything about your inventory, sales revenue, or low-stock reorder recommendations!",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: promptToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToSend }),
      });
      const json = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: json.success ? json.reply : "Sorry, I encountered an issue fetching operational metrics.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "ai", text: "Network error connecting to AI Assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "⚡ Which products are low on stock?",
    "📊 What is my revenue & sales summary?",
    "📦 Show inventory health overview",
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/35 ring-4 ring-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        <Sparkles className="h-5 w-5 animate-pulse text-amber-300" />
        <span>Splinci AI Assistant</span>
      </button>

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-all">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Splinci AI</h3>
                  <p className="text-[11px] text-indigo-200">Executive Commerce Intelligence</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex gap-2 overflow-x-auto border-b bg-gray-50 p-3 text-xs scrollbar-none">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp)}
                  className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-slate-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "ai" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-2xs text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none font-semibold"
                        : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-none shadow-xs space-y-2"
                    }`}
                  >
                    {m.sender === "user" ? (
                      <p>{m.text}</p>
                    ) : (
                      <div className="space-y-1.5">
                        {m.text.split("\n").map((line, idx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;

                          const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ");
                          const cleanLine = isBullet ? trimmed.substring(2) : trimmed;

                          // Parse **bold** syntax
                          const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

                          const formattedLine = parts.map((part, pIdx) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                              return (
                                <strong key={pIdx} className="font-extrabold text-slate-900">
                                  {part.slice(2, -2)}
                                </strong>
                              );
                            }
                            return part;
                          });

                          if (isBullet) {
                            return (
                              <div key={idx} className="flex items-start gap-2 py-0.5">
                                <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                                <span className="text-slate-700">{formattedLine}</span>
                              </div>
                            );
                          }

                          return (
                            <p key={idx} className="text-slate-800 font-medium">
                              {formattedLine}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {m.sender === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-2xs">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-500 italic">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  Splinci AI is analyzing your commerce data...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="border-t p-3 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask Splinci AI anything about your business..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:border-indigo-600 focus:outline-hidden font-medium text-[#000]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors shadow-2xs cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
