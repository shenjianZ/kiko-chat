import { useEffect, useMemo, useState } from "react";
import { Minus, Square, X } from "lucide-react";

function legacyTauriFlags(): { hasIpc: boolean; hasV2: boolean; result: boolean } {
  if (typeof window === "undefined") {
    return { hasIpc: false, hasV2: false, result: false };
  }
  const hasIpc = "__TAURI_IPC__" in window;
  const hasV2 = "__TAURI__" in (window as unknown as Record<string, unknown>);
  const result = hasIpc || hasV2;
  return { hasIpc, hasV2, result };
}

export default function DesktopTitlebar() {
  const [tauriAvailable, setTauriAvailable] = useState<boolean | null>(null);
  const flags = useMemo(() => legacyTauriFlags(), []);

  useEffect(() => {
    // 最可靠的方式：尝试动态 import Tauri API
    (async () => {
      try {
        const mod = await import("@tauri-apps/api/window");
        const ok = typeof mod.getCurrentWindow === "function";
        setTauriAvailable(ok);
        console.log("[DesktopTitlebar] tauri module loaded:", { ok, flags });
      } catch (e) {
        setTauriAvailable(false);
        console.log("[DesktopTitlebar] tauri module load failed", e, { flags });
      }
    })();
  }, [flags]);

  useEffect(() => {
    if (!tauriAvailable) return;
    let unlisten: (() => void) | undefined;
    (async () => {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      try {
        const un1 = await win.onResized(() => {});
        unlisten = () => { un1(); };
      } catch {}
    })();
    return () => { if (unlisten) unlisten(); };
  }, [tauriAvailable]);

  if (!tauriAvailable) {
    // null 期间或非 Tauri 均不渲染
    return null;
  }

  const handleMinimize = async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    win.minimize();
  };

  const handleToggleMaximize = async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    await win.toggleMaximize();
  };

  const handleClose = async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    win.close();
  };

  return (
    <div className="titlebar h-8 w-full flex items-center justify-between select-none bg-gradient-to-r from-sky-500/10 via-background to-indigo-500/10 border-b border-border">
      <div className="pl-2 text-[11px] text-muted-foreground tracking-wide">QQ Chat</div>
      <div className="flex items-center gap-0.5 pr-1">
        <button onClick={handleMinimize} className="titlebar-button h-8 w-10 grid place-items-center hover:bg-muted/40 rounded-sm">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleToggleMaximize} className="titlebar-button h-8 w-10 grid place-items-center hover:bg-muted/40 rounded-sm">
          <Square className="h-3 w-3" />
        </button>
        <button onClick={handleClose} className="titlebar-button h-8 w-10 grid place-items-center rounded-sm hover:bg-red-500 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}


