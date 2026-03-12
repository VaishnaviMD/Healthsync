import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiAPI } from '@/services/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'assistant',
    content: "Hello! 👋 I'm your HealthSync AI assistant. I can help with questions about medications, nutrition, wellness, and women's health.\n\n⚠️ Important: I provide educational information only — not medical advice. Always consult a healthcare professional for personal medical decisions.",
    timestamp: new Date(),
  }
];

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const res = await aiAPI.chat(apiMessages);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment. For urgent health concerns, contact your healthcare provider directly.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What foods should I avoid with iron tablets?",
    "Tips for better sleep quality",
    "What is a healthy BMI range?",
    "Menopause symptoms explained",
  ];

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-lg flex items-center justify-center text-white"
        style={{ boxShadow: '0 8px 32px hsl(158, 64%, 40%, 0.4)' }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse indicator */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: '520px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div className="gradient-primary p-4 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">HealthSync AI</p>
                <p className="text-white/80 text-xs">Educational health assistant</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-white/80 text-xs">Online</span>
              </div>
            </div>

            {/* Disclaimer banner */}
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 shrink-0">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">Educational info only — not medical advice. Consult your doctor for personal health decisions.</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    msg.role === 'assistant' ? 'bg-primary/15' : 'gradient-primary'
                  )}>
                    {msg.role === 'assistant'
                      ? <Bot className="h-4 w-4 text-primary" />
                      : <User className="h-3.5 w-3.5 text-white" />
                    }
                  </div>
                  <div className={cn(
                    'max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                    msg.role === 'assistant'
                      ? 'bg-muted text-foreground rounded-tl-sm'
                      : 'gradient-primary text-white rounded-tr-sm'
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/50"
                        animate={{ y: [-3, 0, -3] }}
                        transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quick prompts — only show after first message */}
              {messages.length === 1 && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs text-muted-foreground font-medium">Quick questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => { setInput(prompt); }}
                        className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1.5 hover:bg-primary/20 transition-colors text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border shrink-0">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about health, nutrition, meds..."
                  disabled={loading}
                  className="flex-1 h-10 px-3 text-sm bg-muted rounded-lg outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground disabled:opacity-60"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
