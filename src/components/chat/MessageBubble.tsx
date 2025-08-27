import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { type Message } from "@/utils/messageStorage";

export function MessageBubble({ message, align, onContextMenu }: { message: Message; align: "left" | "right"; onContextMenu?: (e: React.MouseEvent, message: Message) => void }) {
  const isRight = align === "right";
  return (
    <div className={`flex items-start gap-3 ${isRight ? "justify-end" : ""}`} onContextMenu={(e) => onContextMenu?.(e, message)}>
      {!isRight && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>TA</AvatarFallback>
        </Avatar>
      )}
      <Card className={`max-w-[70%] ${isRight ? "bg-primary text-primary-foreground" : ""}`}>
        <CardContent className="p-3">
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        </CardContent>
      </Card>
      {isRight && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>我</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default MessageBubble;


