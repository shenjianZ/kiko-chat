import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ContactsPanel() {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        我的好友: true,
        群聊: true,
    });

    const groups: Array<{ title: string; items: Array<{ name: string; status: "online" | "offline" }> }> = [
        {
            title: "我的好友", items: [
                { name: "张三", status: "online" },
                { name: "李四", status: "offline" },
            ]
        },
        {
            title: "群聊", items: [
                { name: "研发一组", status: "online" },
                { name: "设计讨论", status: "online" },
            ]
        },
    ];

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {groups.map((g, index) => (
                <Card key={g.title} className="border-0 shadow-none">
                    <CardContent className="p-3">
                        <button
                            onClick={() => setExpanded((prev) => ({ ...prev, [g.title]: !prev[g.title] }))}
                            className="w-full flex items-center justify-between py-2 text-xs uppercase text-muted-foreground font-medium"
                        >
                            <span>{g.title}</span>
                            <span>{expanded[g.title] ? "−" : "+"}</span>
                        </button>
                        {expanded[g.title] && (
                            <div className="space-y-2 mt-2">
                                {g.items.map((it) => (
                                    <div key={it.name} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{it.name.slice(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">{it.name}</p>
                                            <p className="text-xs text-muted-foreground">{it.status === "online" ? "在线" : "离线"}</p>
                                        </div>
                                        <Button variant="ghost" size="sm">发送消息</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default ContactsPanel;