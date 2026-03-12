# MCPCloud

[English](README.md) | [中文版](README.zh.md)

Fork of [MCPHub](https://github.com/samanhappy/mcphub) — a unified hub for centrally managing and orchestrating multiple MCP servers. Thanks to the original project.

## What's New (vs MCPHub)

- **Public Homepage** (`/`) — Landing page with hero, stats (connected servers, tools, market), feature cards, online servers grid, and featured market preview
- **Alibaba Cloud ACR** — One-click image build via [阿里云容器镜像服务](https://www.aliyun.com/product/acr): bind GitHub repo, enable auto-build on push, set build rules (Dockerfile at repo root)

## Quick Start

```bash
git clone https://github.com/Zhaobudaoyuema/mcpcloud.git
cd mcpcloud
pnpm install
pnpm dev
```

Create `mcp_settings.json` with your MCP servers. Open `http://localhost:3000` and log in with `admin` / `admin123`.

Connect AI clients via:
- `http://localhost:3000/mcp` — All servers
- `http://localhost:3000/mcp/{group}` — Specific group
- `http://localhost:3000/mcp/{server}` — Specific server
- `http://localhost:3000/mcp/$smart` — Smart routing

> MCP endpoints require authentication by default. Disable **Enable Bearer Authentication** in Keys settings for unauthenticated access (trusted environments only).

## License

[Apache 2.0](LICENSE)
