# 💬 QQ Chat (Tauri + React + shadcn/ui)

一个仿 QQ 的桌面聊天应用示例，基于 Tauri 2 + React 19 + Tailwind CSS 4 + shadcn/ui。包含消息列表、联系人、聊天窗口、设置抽屉、移动端覆盖层等交互，适合作为桌面 IM 应用的起始模板。

## ✨ 特性

- **🎯 Tauri 2.0**：使用 Rust 构建跨平台桌面应用，窗口透明与自定义标题栏
- **⚛️ React 19**：现代特性与更佳的并发体验
- **🎨 shadcn/ui**：一致的无障碍 UI 规范
- **🎨 Tailwind CSS 4.0**：原子化样式与主题变量
- **📝 TypeScript**：完整的类型安全支持
- **🔧 ESLint**：内置规范与质量保障
- **📱 响应式设计**：桌面端 + 小屏（含移动端覆盖层）
- **🌙 深色模式**：内置主题切换
- **💾 本地消息存储**：`MessageStorage` 工具支持本地保存、同步、撤回

## 🏗️ 项目结构

```
qq-chat/
├── src/                    # React 前端源码
│   ├── components/         # UI 组件（聊天、布局、shadcn/ui）
│   │   └── ui/             # shadcn/ui 组件封装
│   ├── pages/              # 页面（Chat）
│   ├── utils/              # 工具（消息存储等）
│   ├── lib/                # 公共工具与配置
│   ├── App.tsx             # 路由与主题提供
│   └── index.css           # 全局样式
├── src-tauri/             # Rust 后端源码（Tauri 配置与入口）
│   ├── src/               # Rust 源代码
│   └── Cargo.toml         # Rust 依赖配置
├── components.json         # shadcn/ui 配置
├── package.json            # Node.js 依赖
└── README.md              # 项目文档
```

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/)（推荐 18+）
- [pnpm](https://pnpm.io/)（包管理器）
- [Rust](https://rustup.rs/)（Tauri 后端）

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm tauri dev
```

### 构建应用

```bash
pnpm tauri build
```

如仅需前端静态构建（不打包 Tauri）：

```bash
pnpm build && pnpm preview
```

## 🎨 使用 shadcn/ui 组件

### 添加新组件

```bash
npx shadcn@latest add [component-name]
```

### 可用组件

- `avatar`、`badge`、`button`、`card`、`dropdown-menu`、`input`、`separator`、`tabs` 等

## 🔧 配置说明

### TypeScript 配置

项目使用 TypeScript 5.8+，支持：
- 路径别名（`@/*`，见 `vite.config.ts`）
- 严格类型检查
- 现代 ES 特性

### Tailwind CSS 配置

- 使用 Tailwind CSS 4.0
- 支持 CSS 变量与主题
- 响应式设计工具

### ESLint 配置

- React Hooks 规则
- TypeScript 支持
- 代码质量检查

### Tauri 配置

- 固定开发端口 `1420`，HMR 端口 `1421`
- 忽略监视 `src-tauri`，防止 Vite 误报
- 自定义窗口：`decorations=false`、`transparent=true`

## 📱 桌面应用特性

### Tauri 命令

在 `src-tauri/src/lib.rs` 中定义 Rust 函数：

```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

在前端调用：

```typescript
import { invoke } from '@tauri-apps/api/core';

const message = await invoke('greet', { name: 'World' });
```

### 平台支持

- ✅ Windows
- ✅ macOS
- ✅ Linux
- ✅ Android（实验性）

### UI 功能点

- 左侧侧边栏与消息/联系人切换（`SidebarNav`）
- 中间会话列表与搜索（未读角标、最后消息、时间）
- 右侧聊天面板（发送、同步、撤回、聊天设置）
- 设置抽屉（全局设置与聊天设置）
- 移动端聊天覆盖层（小屏适配）
- 本地消息存储与周期同步（见 `src/utils/messageStorage.ts`）

## 🎯 开发指南

### 添加新页面

1. 在 `src/pages/` 目录创建页面组件
2. 使用 shadcn/ui 组件构建界面
3. 在路由（`App.tsx`）中添加新页面

### 自定义主题

修改 `src/index.css` 中的 CSS 变量：

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* 更多变量... */
}
```

### 添加新依赖

```bash
pnpm add [package-name]
```

## 🚀 部署

### 构建生产版本

```bash
pnpm tauri build
```

### 发布到应用商店

- Windows：Microsoft Store
- macOS：Mac App Store
- Linux：AppImage / Snap / Flatpak

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [shadcn/ui](https://ui.shadcn.com/) - 美观的 UI 组件
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [React](https://react.dev/) - 用户界面库

---

**🎉 开始构建你的下一个桌面应用吧！**
