import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
};

export function ChatList({ items, query, onQuery, activeChatId, onSelect }: {
  items: ChatItem[];
  query: string;
  onQuery: (v: string) => void;
  activeChatId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="w-[310px] flex-none border-r border-border flex flex-col">
      <div className="p-3">
        <Input placeholder="搜索" value={query} onChange={(e) => onQuery(e.target.value)} />
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {items.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className={`w-full px-3 py-3 flex items-center gap-3 text-left hover:bg-muted/60 ${
              activeChatId === chat.id ? "bg-muted" : ""
            }`}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>{chat.name.slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium truncate">{chat.name}</p>
                <span className="text-xs text-muted-foreground ml-2">{chat.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <Badge className="ml-auto h-5 px-2 text-xs">{chat.unread}</Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default ChatList;


