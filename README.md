# 音乐歌词编辑工具

这是一个基于 Next.js 开发的音乐歌词编辑工具，帮助用户搜索、查看、编辑和下载音乐歌词。

项目源码: [GitHub 仓库](https://github.com/Loosand/lyrics-download-tool)

## 主要功能

- 🔍 **歌曲搜索**：支持按歌名、歌手名搜索音乐
- ✏️ **歌词编辑**：编辑原文歌词和翻译歌词
- 📝 **融合显示**：支持原文和翻译歌词的融合显示模式
- 💾 **歌词下载**：支持 LRC 和 SRT 格式歌词下载
- 🖼️ **封面下载**：下载歌曲专辑封面图片

## 技术栈

- [Next.js](https://nextjs.org/) - React 框架
- [React](https://react.dev/) - 用户界面库
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Sonner](https://sonner.emilkowal.ski/) - 通知提示组件

## 开始使用

### 环境要求

- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/Loosand/lyrics-download-tool.git
cd lyrics-download-tool
```

2. 安装依赖

```bash
npm install
# 或使用 yarn
yarn install
# 或使用 pnpm
pnpm install
# 或使用 bun
bun install
```

3. 运行开发服务器

```bash
npm run dev
# 或使用 yarn
yarn dev
# 或使用 pnpm
pnpm dev
# 或使用 bun
bun dev
```

4. 在浏览器中访问 [http://localhost:3000](http://localhost:3000) 查看应用

## 使用说明

1. 在搜索框中输入歌曲名称或歌手名
2. 点击歌曲卡片中的"查看详情"按钮查看歌词
3. 可以切换原文、翻译或融合显示模式
4. 编辑歌词后可以下载为 LRC 或 SRT 格式
5. 可以下载歌曲的专辑封面图片

## 开发指南

- 修改 `src/app/page.tsx` 可以编辑主页面
- 项目使用 Next.js App Router 架构
- 页面自动热更新，修改代码后立即可见效果

## 部署

推荐使用 [Vercel 平台](https://vercel.com/new) 部署 Next.js 应用：

1. 将代码推送到 GitHub、GitLab 或 Bitbucket
2. 在 Vercel 中导入项目
3. Vercel 会自动部署应用

## 许可证

[MIT](LICENSE)

## 项目仓库

本项目开源于 GitHub: [https://github.com/Loosand/lyrics-download-tool](https://github.com/Loosand/lyrics-download-tool)

## 声明

仅供学习交流，24 小时侵删
