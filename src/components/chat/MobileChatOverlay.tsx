import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Camera, Image as ImageIcon, Mic, MoreVertical, Paperclip, Phone, Send, Smile, Video, Settings } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import MessageBubble from "./MessageBubble";
import { type Message } from "@/utils/messageStorage";

export function MobileChatOverlay({
  title,
  messages,
  onSend,
  onBack,
  onOpenChatSettings,
}: {
  title: string;
  messages: Message[];
  onSend: (text: string) => void;
  onBack: () => void;
  onOpenChatSettings: () => void;
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div className="lg:hidden fixed inset-0 z-40 bg-background">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="返回">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <p className="font-semibold">{title}</p>
            <Badge variant="outline">成员 32</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled title="语音通话功能未实现" aria-disabled>
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" disabled title="视频通话功能未实现" aria-disabled>
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onOpenChatSettings} title="聊天设置">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" title="更多选项">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} align={m.sender === "me" ? "right" : "left"} />
            ))}
          </div>
          
          <div className="border-t p-4">
            <div className="flex items-center gap-2 mb-3">
              <Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><ImageIcon className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><Camera className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><Mic className="h-5 w-5" /></Button>
            </div>
            <div className="flex items-end gap-2">
              <textarea
                placeholder="输入消息，按 Enter 发送"
                rows={2}
                ref={inputRef}
                onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const value = (e.currentTarget.value || "").trim();
                    if (!value) return;
                    onSend(value);
                    e.currentTarget.value = "";
                  }
                }}
                className="flex-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none dark:border-input dark:bg-background dark:focus:ring-ring"
              />
              <Button onClick={() => {
                const el = inputRef.current;
                if (!el) return;
                const value = (el.value || "").trim();
                if (!value) return;
                onSend(value);
                el.value = "";
              }}>
                <Send className="h-4 w-4 mr-1" />
                发送
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MobileChatOverlay;


