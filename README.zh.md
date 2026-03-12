# MCPCloud

[English](README.md) | 中文版

基于 [MCPHub](https://github.com/samanhappy/mcphub) 的 Fork — 统一管理多个 MCP 服务器的中心化 Hub。感谢原项目。

## 本项目的更新（相对 MCPHub）

- **公开首页**（`/`）— 落地页含 Hero、统计（已连接服务器、工具数、市场）、功能卡片、在线服务器网格、精选市场预览
- **阿里云 ACR** — 支持 [阿里云容器镜像服务](https://www.aliyun.com/product/acr) 一键构建镜像：绑定 GitHub 仓库、开启代码变更自动构建、配置构建规则（Dockerfile 位于仓库根目录）

## 快速开始

```bash
git clone https://github.com/Zhaobudaoyuema/mcpcloud.git
cd mcpcloud
pnpm install
pnpm dev
```

创建 `mcp_settings.json` 配置 MCP 服务器。打开 `http://localhost:3000`，使用 `admin` / `admin123` 登录。

连接 AI 客户端：
- `http://localhost:3000/mcp` — 所有服务器
- `http://localhost:3000/mcp/{group}` — 特定分组
- `http://localhost:3000/mcp/{server}` — 特定服务器
- `http://localhost:3000/mcp/$smart` — 智能路由

> MCP 端点默认需认证。若需匿名访问，请在密钥设置中关闭 **启用 Bearer 认证**（仅建议在受信任环境使用）。

## 致谢

感谢 [MCPHub](https://github.com/samanhappy/mcphub) 原项目。

## 许可证

[Apache 2.0](LICENSE)
