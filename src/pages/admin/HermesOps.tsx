import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORED_CHAT_ID_KEY = "hermes_chat_id";

interface Message {
  role: "user" | "hermes";
  text: string;
  time: string;
}

export const HermesPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "hermes", text: "👊 Hermes web interface active. Send me commands just like Telegram.", time: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(() => localStorage.getItem(STORED_CHAT_ID_KEY) || "");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const saveChatId = (id: string) => {
    setChatId(id);
    if (id) localStorage.setItem(STORED_CHAT_ID_KEY, id);
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatId) return;
    const text = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text, time: new Date().toLocaleTimeString() }]);
    setLoading(true);

    try {
      const { error: sendErr } = await supabase.functions.invoke("hermes-telegram", {
        body: { action: "sendMessage", chat_id: chatId, text },
      });
      if (sendErr) throw sendErr;

      await new Promise(r => setTimeout(r, 4000));

      const { data: updates, error: updErr } = await supabase.functions.invoke("hermes-telegram", {
        body: { action: "getUpdates" },
      });
      if (updErr) throw updErr;

      const botReplies: string[] = updates?.replies || [];
      if (botReplies.length > 0) {
        setMessages(prev => [...prev, { role: "hermes", text: botReplies[botReplies.length - 1], time: new Date().toLocaleTimeString() }]);
      } else {
        setMessages(prev => [...prev, { role: "hermes", text: "✅ Command sent to Hermes via Telegram. Check your Telegram for the response.", time: new Date().toLocaleTimeString() }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "hermes", text: "❌ Failed to reach Hermes. Check your connection.", time: new Date().toLocaleTimeString() }]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {!chatId && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="font-semibold mb-2">Enter your Telegram Chat ID to connect:</p>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="e.g. 123456789"
              onBlur={e => saveChatId(e.target.value)}
              className="w-48"
            />
            <span className="text-sm text-muted-foreground">
              Send /start to @USAGrappling_hermesbot to get your Chat ID
            </span>
          </div>
        </Card>
      )}

      <Card className="flex flex-col h-[600px]">
        <div className="flex items-center gap-2 p-4 border-b">
          <Bot className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <h3 className="font-semibold">Hermes — USA Grappling Ops</h3>
            <p className="text-xs text-muted-foreground">Commands route to Telegram</p>
          </div>
          {chatId && (
            <Button size="sm" variant="ghost" onClick={() => saveChatId("")}>Reset</Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                <p className="text-[10px] opacity-60 mt-1">{m.time}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 p-4 border-t">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder='Try: "show kanban" or "show gyms in FL" or "flag for claude: ..."'
            disabled={loading || !chatId}
          />
          <Button onClick={sendMessage} disabled={loading || !chatId || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-muted/30">
        <p className="font-semibold text-sm mb-2">Quick commands:</p>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• "show kanban" — active project board</li>
          <li>• "/marketing FL" — FL marketing targets</li>
          <li>• "what's overdue this week" — urgent tasks</li>
          <li>• "flag for claude: [message]" — send to Claude inbox</li>
        </ul>
      </Card>
    </div>
  );
};
