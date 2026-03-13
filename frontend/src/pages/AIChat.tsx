import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '../components/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { aiChatAPI } from '../services/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: 1,
  role: 'assistant',
  content: "Hello! I'm your Medora AI assistant. I provide educational health information about medications, nutrition, wellness, and women's health.\n\n⚠️ Important: My responses are for educational purposes only. Always consult a qualified healthcare professional for personal medical decisions.",
};

const quickPrompts = [
  "What are common drug-food interactions I should know about?",
  "How can I improve my sleep quality naturally?",
  "What vitamins are important for women's health?",
  "Tell me about symptoms of vitamin D deficiency",
  "What foods are high in protein?",
  "How much water should I drink daily?",
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;
    
    const userMsg: Message = { id: Date.now(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = [...messages, userMsg].slice(-12).map(m => ({ role: m.role, content: m.content }));

    try {
      const { data } = await aiChatAPI.chat(history);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: data.content }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm temporarily unavailable. For health questions, please consult your healthcare provider.",
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <AppLayout title="AI Health Assistant">
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8.5rem)]">
        {/* Disclaimer */}
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl mb-4 shrink-0">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            AI responses are for <strong>educational purposes only</strong>. Not a substitute for professional medical advice.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {messages.map(msg => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                msg.role === 'assistant' ? 'bg-primary/10' : 'gradient-primary'
              )}>
                {msg.role === 'assistant' ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-white" />}
              </div>
              <div className={cn(
                'max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'assistant'
                  ? 'bg-card border border-border text-card-foreground rounded-tl-sm'
                  : 'bg-primary text-white rounded-tr-sm shadow-md shadow-primary/20'
              )}>
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 bg-muted-foreground/40 rounded-full"
                    animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-3">Try asking about:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map(p => (
                  <motion.button key={p} whileHover={{ scale: 1.02 }} onClick={() => sendMessage(p)}
                    className="text-xs px-3 py-2 bg-muted hover:bg-accent border border-border rounded-full text-muted-foreground hover:text-foreground transition-colors text-left">
                    {p}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border pt-4 mt-4 shrink-0">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about medications, nutrition, wellness, women's health..."
              disabled={loading}
              className="flex-1 bg-muted/50 border border-border text-foreground text-sm px-4 py-3 rounded-xl outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground disabled:opacity-50"
            />
            <motion.button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 disabled:opacity-40 shrink-0"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
