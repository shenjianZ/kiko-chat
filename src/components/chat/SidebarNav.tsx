import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Users, Star, Folder, Grid, Bell, Settings } from "lucide-react";

export function SidebarNav({ active, onChange, onOpenSettings }: { active: string; onChange: (v: string) => void; onOpenSettings: () => void }) {
  return (
    <Card className="w-16 flex-none flex flex-col border-0 shadow-none">
      <CardContent className="flex flex-col items-center py-4 px-2 gap-4 h-full">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-12 w-12">
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <Badge variant="secondary" className="text-[10px]">在线</Badge>
        </div>
        
        <div className="w-full h-px bg-border my-2" />
        
        <nav className="flex flex-col items-center gap-3 flex-1">
          <IconButton active={active === "messages"} onClick={() => onChange("messages")}>
            <MessageSquare className="h-5 w-5" />
          </IconButton>
          <IconButton active={active === "contacts"} onClick={() => onChange("contacts")}>
            <Users className="h-5 w-5" />
          </IconButton>
          <IconButton><Star className="h-5 w-5" /></IconButton>
          <IconButton><Folder className="h-5 w-5" /></IconButton>
          <IconButton><Grid className="h-5 w-5" /></IconButton>
          <IconButton><Bell className="h-5 w-5" /></IconButton>
        </nav>
        
        <div className="mt-auto">
          <IconButton onClick={onOpenSettings}>
            <Settings className="h-5 w-5" />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );
}

function IconButton({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <Button onClick={onClick} variant={active ? "default" : "ghost"} size="icon" className={active ? "" : "text-muted-foreground"}>
      {children}
    </Button>
  );
}

export default SidebarNav;


