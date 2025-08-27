import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function SettingsDrawer({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[360px] p-4">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="关闭">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function GeneralSettingsContent() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h3 className="text-sm font-medium">主题</h3>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">亮色/暗色切换</span>
          <ModeToggle />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChatSettingsContent() {
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-medium">会话选项</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
            <span className="text-sm text-muted-foreground">消息免打扰（占位）</span>
            <Badge variant="outline">未实现</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
            <span className="text-sm text-muted-foreground">置顶聊天（占位）</span>
            <Badge variant="outline">未实现</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-sm font-medium">资料</h3>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            这里显示群公告/联系人签名、成员数、创建时间等（占位）。
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default SettingsDrawer;


