// 消息类型定义
export interface Message {
  id: string;
  chatId: string;
  sender: "me" | "them";
  content: string;
  timestamp: number;
  synced?: boolean; // 是否已同步到服务器
}

export interface ChatData {
  id: string;
  messages: Message[];
  lastSyncTime: number;
}

// 本地存储键名
const STORAGE_KEY = 'qq_chat_messages';
const CHAT_LIST_KEY = 'qq_chat_list';

/**
 * 消息存储管理类
 */
export class MessageStorage {
  
  /**
   * 获取本地存储的聊天消息
   */
  static getLocalMessages(chatId: string): Message[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const allChats: Record<string, ChatData> = JSON.parse(data);
      return allChats[chatId]?.messages || [];
    } catch (error) {
      console.error('获取本地消息失败:', error);
      return [];
    }
  }

  /**
   * 保存消息到本地存储
   */
  static saveLocalMessages(chatId: string, messages: Message[]): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const allChats: Record<string, ChatData> = data ? JSON.parse(data) : {};
      
      allChats[chatId] = {
        id: chatId,
        messages,
        lastSyncTime: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allChats));
    } catch (error) {
      console.error('保存本地消息失败:', error);
    }
  }

  /**
   * 添加新消息到本地存储
   */
  static addLocalMessage(message: Message): void {
    const existingMessages = this.getLocalMessages(message.chatId);
    const updatedMessages = [...existingMessages, message];
    this.saveLocalMessages(message.chatId, updatedMessages);
  }

  /**
   * 获取最后同步时间
   */
  static getLastSyncTime(chatId: string): number {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return 0;
      
      const allChats: Record<string, ChatData> = JSON.parse(data);
      return allChats[chatId]?.lastSyncTime || 0;
    } catch (error) {
      console.error('获取同步时间失败:', error);
      return 0;
    }
  }

  /**
   * 从服务器获取新消息
   */
  static async fetchNewMessages(chatId: string, lastSyncTime: number): Promise<Message[]> {
    try {
      // 模拟API调用
      const response = await fetch(`/api/messages/${chatId}?since=${lastSyncTime}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('从服务器获取消息失败:', error);
      // 返回模拟的新消息（用于演示）
      return this.getMockNewMessages(chatId, lastSyncTime);
    }
  }

  /**
   * 发送消息到服务器
   */
  static async sendMessageToServer(message: Message): Promise<boolean> {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(message)
      });

      return response.ok;
    } catch (error) {
      console.error('发送消息到服务器失败:', error);
      return false;
    }
  }

  /**
   * 同步聊天消息（本地 + 服务器）
   */
  static async syncMessages(chatId: string): Promise<Message[]> {
    // 1. 获取本地消息
    const localMessages = this.getLocalMessages(chatId);
    
    // 2. 获取最后同步时间
    const lastSyncTime = this.getLastSyncTime(chatId);
    
    // 3. 从服务器获取新消息
    const newMessages = await this.fetchNewMessages(chatId, lastSyncTime);
    
    // 4. 合并消息（去重）
    const allMessages = this.mergeMessages(localMessages, newMessages);
    
    // 5. 保存到本地
    this.saveLocalMessages(chatId, allMessages);
    
    return allMessages;
  }

  /**
   * 合并消息并去重
   */
  static mergeMessages(localMessages: Message[], newMessages: Message[]): Message[] {
    const messageMap = new Map<string, Message>();
    
    // 添加本地消息
    localMessages.forEach(msg => messageMap.set(msg.id, msg));
    
    // 添加新消息（覆盖重复的）
    newMessages.forEach(msg => messageMap.set(msg.id, msg));
    
    // 按时间戳排序
    return Array.from(messageMap.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * 获取认证token
   */
  static getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * 模拟新消息（用于演示）
   */
  static getMockNewMessages(chatId: string, lastSyncTime: number): Message[] {
    const now = Date.now();
    if (now - lastSyncTime < 30000) return []; // 30秒内不生成新消息
    
    const mockMessages: Record<string, Message[]> = {
      "1": [
        {
          id: `mock_${now}_1`,
          chatId,
          sender: "them",
          content: "刚刚看到你的代码，有个小建议",
          timestamp: now,
          synced: true
        }
      ],
      "3": [
        {
          id: `mock_${now}_2`,
          chatId,
          sender: "them", 
          content: "新的设计规范文档已经发布了",
          timestamp: now,
          synced: true
        }
      ]
    };
    
    return mockMessages[chatId] || [];
  }

  /**
   * 清除本地存储
   */
  static clearLocalStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CHAT_LIST_KEY);
  }
}