import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SidebarNav from "@/components/chat/SidebarNav";
import DesktopTitlebar from "@/components/layout/DesktopTitlebar";
import { type ChatItem } from "@/components/chat/ChatList";
import RightChatPanel from "@/components/chat/RightChatPanel";
import MobileChatOverlay from "@/components/chat/MobileChatOverlay";
import SettingsDrawer, { GeneralSettingsContent, ChatSettingsContent } from "@/components/chat/SettingsDrawer";
import ContactsPanel from "@/components/chat/ContactsPanel";
import { MessageStorage, type Message } from "@/utils/messageStorage";



const sampleChats: ChatItem[] = [
  { id: "1", name: "前端开发群", lastMessage: "张三: 这个组件的性能优化有什么建议吗？", timestamp: "14:32", unread: 2 },
  { id: "2", name: "产品经理-王丽", lastMessage: "下午3点的需求评审会议别忘了参加", timestamp: "13:05", unread: 0 },
  { id: "3", name: "设计组", lastMessage: "李设计师: 新版本的UI设计稿已经上传", timestamp: "昨天", unread: 5 },
  { id: "4", name: "后端开发-小陈", lastMessage: "API接口文档更新了，请查看", timestamp: "昨天", unread: 1 },
  { id: "5", name: "测试团队", lastMessage: "发现了几个bug，已提交到系统", timestamp: "2天前", unread: 3 },
  { id: "6", name: "技术分享群", lastMessage: "周五晚上有技术分享会，欢迎参加", timestamp: "3天前", unread: 0 },
  { id: "7", name: "项目经理-老王", lastMessage: "项目进度汇报已发送，请查收", timestamp: "1周前", unread: 0 },
];

export function ChatLayout() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"messages" | "contacts">("messages");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState<boolean>(false);

  // 使用状态管理聊天列表，支持动态更新未读消息数
  const [chats, setChats] = useState<ChatItem[]>(sampleChats);
  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId) || null, [chats, activeChatId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 定期同步消息
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (activeChatId) {
        try {
          const syncedMessages = await MessageStorage.syncMessages(activeChatId);
          setMessages(syncedMessages);

          // 检查是否有新消息，更新聊天列表
          if (syncedMessages.length > 0) {
            const lastMessage = syncedMessages[syncedMessages.length - 1];
            setChats(prev => prev.map(chat =>
              chat.id === activeChatId
                ? {
                  ...chat,
                  lastMessage: lastMessage.content,
                  timestamp: new Date(lastMessage.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                }
                : chat
            ));
          }
        } catch (error) {
          console.error('定期同步失败:', error);
        }
      }
    }, 30000); // 每30秒同步一次

    return () => clearInterval(syncInterval);
  }, [activeChatId, setChats]);

  const filtered = useMemo(() => {
    if (!query.trim()) return chats;
    return chats.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, chats]);

  const handleSendMessage = async (content: string) => {
    if (!activeChatId) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      chatId: activeChatId,
      sender: "me",
      content,
      timestamp: Date.now(),
      synced: false
    };

    // 立即更新UI
    setMessages(prev => [...prev, newMessage]);

    // 保存到本地存储
    MessageStorage.addLocalMessage(newMessage);

    // 更新聊天列表中的最新消息和时间戳
    setChats(prev => prev.map(chat =>
      chat.id === activeChatId
        ? {
          ...chat,
          lastMessage: content,
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
        : chat
    ));

    // 异步发送到服务器
    try {
      const success = await MessageStorage.sendMessageToServer(newMessage);
      if (success) {
        // 标记为已同步
        const syncedMessage = { ...newMessage, synced: true };
        MessageStorage.addLocalMessage(syncedMessage);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  // 撤回消息：监听来自子组件的事件
  useEffect(() => {
    const onRecall = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string } | undefined;
      if (!detail?.id) return;
      setMessages(prev => prev.filter(m => m.id !== detail.id));
      if (activeChatId) {
        const remaining = MessageStorage.getLocalMessages(activeChatId).filter(m => m.id !== detail.id);
        MessageStorage.saveLocalMessages(activeChatId, remaining);
      }
    };
    window.addEventListener("chat:recall-message", onRecall as EventListener);
    return () => window.removeEventListener("chat:recall-message", onRecall as EventListener);
  }, [activeChatId]);

  const handleSelectChat = async (id: string) => {
    setActiveChatId(id);
    setIsChatOpen(true);
    setIsLoading(true);

    // 清除未读消息数
    setChats(prev => prev.map(chat =>
      chat.id === id
        ? { ...chat, unread: 0 }
        : chat
    ));

    try {
      // 1. 先从本地加载消息（快速显示）
      const localMessages = MessageStorage.getLocalMessages(id);
      if (localMessages.length > 0) {
        setMessages(localMessages);
      } else {
        // 如果本地没有消息，使用默认消息
        const defaultMessages = getDefaultMessages(id);
        setMessages(defaultMessages);
        // 保存默认消息到本地
        MessageStorage.saveLocalMessages(id, defaultMessages);
      }

      // 2. 异步从服务器同步新消息
      const syncedMessages = await MessageStorage.syncMessages(id);
      setMessages(syncedMessages);

      // 3. 检查是否有新消息，更新聊天列表
      if (syncedMessages.length > 0) {
        const lastMessage = syncedMessages[syncedMessages.length - 1];
        setChats(prev => prev.map(chat =>
          chat.id === id
            ? {
              ...chat,
              lastMessage: lastMessage.content,
              timestamp: new Date(lastMessage.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
            }
            : chat
        ));
      }
    } catch (error) {
      console.error('加载聊天消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取默认聊天消息的函数（用于初始化）
  const getDefaultMessages = (chatId: string): Message[] => {
    // 这里可以根据chatId返回不同的默认消息历史
    const messageMap: Record<string, Message[]> = {
      "1": [
        { id: "m1", chatId: "1", sender: "them", content: "大家好，有个前端问题想请教一下", timestamp: Date.now() - 3600000, synced: true },
        { id: "m2", chatId: "1", sender: "me", content: "什么问题？说来听听", timestamp: Date.now() - 3500000, synced: true },
        { id: "m3", chatId: "1", sender: "them", content: "就是关于React Hook的使用，useEffect的依赖数组应该怎么处理？", timestamp: Date.now() - 3400000, synced: true },
        { id: "m4", chatId: "1", sender: "me", content: "这个要看具体场景，一般来说依赖数组要包含所有在effect中使用的变量", timestamp: Date.now() - 3300000, synced: true },
        { id: "m5", chatId: "1", sender: "them", content: "明白了，还有一个问题就是性能优化方面", timestamp: Date.now() - 3200000, synced: true },
        { id: "m6", chatId: "1", sender: "them", content: "张三: 这个组件的性能优化有什么建议吗？", timestamp: Date.now() - 3100000, synced: true },
        { id: "m7", chatId: "1", sender: "them", content: "李四: 可以考虑使用React.memo和useMemo", timestamp: Date.now() - 3000000, synced: true },
      ],
      "2": [
        { id: "m1", chatId: "2", sender: "them", content: "你好，关于下午的产品评审会议", timestamp: Date.now() - 7200000, synced: true },
        { id: "m2", chatId: "2", sender: "me", content: "嗯，什么时间？", timestamp: Date.now() - 7100000, synced: true },
        { id: "m3", chatId: "2", sender: "them", content: "下午3点，会议室A", timestamp: Date.now() - 7000000, synced: true },
        { id: "m4", chatId: "2", sender: "me", content: "好的，我会准时参加", timestamp: Date.now() - 6900000, synced: true },
        { id: "m5", chatId: "2", sender: "them", content: "记得带上需求文档", timestamp: Date.now() - 6800000, synced: true },
        { id: "m6", chatId: "2", sender: "me", content: "收到", timestamp: Date.now() - 6700000, synced: true },
        { id: "m7", chatId: "2", sender: "them", content: "下午3点的需求评审会议别忘了参加", timestamp: Date.now() - 6600000, synced: true },
      ],
      "3": [
        { id: "m1", chatId: "3", sender: "them", content: "设计稿的最新版本已经完成了", timestamp: Date.now() - 10800000, synced: true },
        { id: "m2", chatId: "3", sender: "me", content: "太好了，在哪里可以查看？", timestamp: Date.now() - 10700000, synced: true },
        { id: "m3", chatId: "3", sender: "them", content: "已经上传到公司的设计平台了", timestamp: Date.now() - 10600000, synced: true },
        { id: "m4", chatId: "3", sender: "me", content: "我去看看，有什么变化吗？", timestamp: Date.now() - 10500000, synced: true },
        { id: "m5", chatId: "3", sender: "them", content: "主要是优化了用户交互流程", timestamp: Date.now() - 10400000, synced: true },
        { id: "m6", chatId: "3", sender: "them", content: "还有一些视觉细节的调整", timestamp: Date.now() - 10300000, synced: true },
        { id: "m7", chatId: "3", sender: "them", content: "李设计师: 新版本的UI设计稿已经上传", timestamp: Date.now() - 10200000, synced: true },
        { id: "m8", chatId: "3", sender: "them", content: "王设计师: 记得查看移动端的适配", timestamp: Date.now() - 10100000, synced: true },
        { id: "m9", chatId: "3", sender: "them", content: "赵设计师: 颜色规范也更新了", timestamp: Date.now() - 10000000, synced: true },
      ],
      "4": [
        { id: "m1", chatId: "4", sender: "them", content: "后端接口开发进度汇报", timestamp: Date.now() - 14400000, synced: true },
        { id: "m2", chatId: "4", sender: "me", content: "进展如何？", timestamp: Date.now() - 14300000, synced: true },
        { id: "m3", chatId: "4", sender: "them", content: "用户模块的接口已经完成了", timestamp: Date.now() - 14200000, synced: true },
        { id: "m4", chatId: "4", sender: "me", content: "测试过了吗？", timestamp: Date.now() - 14100000, synced: true },
        { id: "m5", chatId: "4", sender: "them", content: "基本功能测试通过，文档也更新了", timestamp: Date.now() - 14000000, synced: true },
        { id: "m6", chatId: "4", sender: "them", content: "API接口文档更新了，请查看", timestamp: Date.now() - 13900000, synced: true },
      ],
      "5": [
        { id: "m1", chatId: "5", sender: "them", content: "今天的测试结果出来了", timestamp: Date.now() - 18000000, synced: true },
        { id: "m2", chatId: "5", sender: "me", content: "怎么样？", timestamp: Date.now() - 17900000, synced: true },
        { id: "m3", chatId: "5", sender: "them", content: "发现了几个小问题", timestamp: Date.now() - 17800000, synced: true },
        { id: "m4", chatId: "5", sender: "them", content: "主要是UI显示的bug", timestamp: Date.now() - 17700000, synced: true },
        { id: "m5", chatId: "5", sender: "them", content: "还有一个数据加载的问题", timestamp: Date.now() - 17600000, synced: true },
        { id: "m6", chatId: "5", sender: "me", content: "严重吗？", timestamp: Date.now() - 17500000, synced: true },
        { id: "m7", chatId: "5", sender: "them", content: "不算严重，都是可以快速修复的", timestamp: Date.now() - 17400000, synced: true },
        { id: "m8", chatId: "5", sender: "them", content: "发现了几个bug，已提交到系统", timestamp: Date.now() - 17300000, synced: true },
      ],
      "6": [
        { id: "m1", chatId: "6", sender: "them", content: "大家好，本周的技术分享安排", timestamp: Date.now() - 21600000, synced: true },
        { id: "m2", chatId: "6", sender: "me", content: "这次分享什么主题？", timestamp: Date.now() - 21500000, synced: true },
        { id: "m3", chatId: "6", sender: "them", content: "微服务架构的最佳实践", timestamp: Date.now() - 21400000, synced: true },
        { id: "m4", chatId: "6", sender: "me", content: "很有意思的话题", timestamp: Date.now() - 21300000, synced: true },
        { id: "m5", chatId: "6", sender: "them", content: "周五晚上有技术分享会，欢迎参加", timestamp: Date.now() - 21200000, synced: true },
      ],
      "7": [
        { id: "m1", chatId: "7", sender: "them", content: "项目进度需要汇报一下", timestamp: Date.now() - 25200000, synced: true },
        { id: "m2", chatId: "7", sender: "me", content: "好的，目前进展如何？", timestamp: Date.now() - 25100000, synced: true },
        { id: "m3", chatId: "7", sender: "them", content: "整体进度符合预期", timestamp: Date.now() - 25000000, synced: true },
        { id: "m4", chatId: "7", sender: "me", content: "有什么需要协调的吗？", timestamp: Date.now() - 24900000, synced: true },
        { id: "m5", chatId: "7", sender: "them", content: "暂时没有，继续按计划推进", timestamp: Date.now() - 24800000, synced: true },
        { id: "m6", chatId: "7", sender: "them", content: "项目进度汇报已发送，请查收", timestamp: Date.now() - 24700000, synced: true },
      ],
    };

    return messageMap[chatId] || [
      { id: "default", chatId, sender: "them", content: "你好，这里是示例消息。", timestamp: Date.now(), synced: true },
    ];
  };



  return (
    <div className="flex h-screen bg-muted/20 flex-col app-no-select">
      <DesktopTitlebar />
      <div className="flex flex-1 min-h-0">
      {/* Left Sidebar */}
      <div className="border-r">
      <SidebarNav
        active={activeTab}
        onChange={(v: string) => setActiveTab(v as "messages" | "contacts")}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      </div>

      {/* Middle List */}
      {activeTab === "messages" ? (
        <Card className="w-[310px] flex-none flex flex-col border-0 shadow-none">
          <CardHeader className="pb-3">
            <Input placeholder="搜索" value={query} onChange={(e) => setQuery(e.target.value)} />
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
              {filtered.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/40 transition-colors rounded-md ${activeChatId === chat.id ? "bg-muted/60" : ""
                    }`}
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">{chat.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{chat.name}</p>
                      <span className="text-xs text-muted-foreground ml-2">{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t">
              <Button variant="secondary" className="w-full">添加好友/群组</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-[310px] flex-none flex flex-col border-0 shadow-none">
          <CardHeader className="pb-3">
            <Input placeholder="搜索联系人/群…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ContactsPanel />
          </CardContent>
        </Card>
      )}

      {/* Right Content (only visible when a chat is open) */}
      {isChatOpen && activeChat && (
        <RightChatPanel
          title={activeChat.name}
          messages={messages}
          onSend={handleSendMessage}
          onClose={() => setIsChatOpen(false)}
          onOpenChatSettings={() => setIsChatSettingsOpen(true)}
        />
      )}

      {/* Mobile Chat Overlay (Android/small screens) */}
      {isChatOpen && activeChat && (
        <MobileChatOverlay
          title={activeChat.name}
          messages={messages}
          onSend={handleSendMessage}
          onBack={() => setIsChatOpen(false)}
          onOpenChatSettings={() => setIsChatSettingsOpen(true)}
        />
      )}

      {/* Settings Panel */}
      <SettingsDrawer
        title="设置"
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      >
        <GeneralSettingsContent />
      </SettingsDrawer>

      {/* Chat Settings Panel */}
      <SettingsDrawer
        title="聊天设置"
        open={isChatSettingsOpen}
        onClose={() => setIsChatSettingsOpen(false)}
      >
        <ChatSettingsContent />
      </SettingsDrawer>
      </div>
    </div>
  );
}




export default ChatLayout;


