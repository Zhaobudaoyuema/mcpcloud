# MCPCloud 远程 Docker 部署（本地构建 → 服务器 load/run）

本文档只覆盖「本地构建镜像 → `docker save` 导出 → 上传到远程服务器 → 服务器 `docker load` + `docker run`」这一流程，并附带常用排查与删除命令。

---

## 一、本地构建镜像

在项目根目录执行（本地开发机）：

```bash
# 第一次可先安装依赖（可选）
pnpm install

# 构建 Docker 镜像，镜像名为 mcpcloud
docker build -t mcpcloud:latest .

# 确认镜像已构建
docker images mcpcloud
```

如需区分版本，可自行改成 `mcpcloud:v1`、`mcpcloud:2026-03-05` 等，但下面示例统一以 `mcpcloud:latest` 为例。

---

## 二、本地导出镜像并上传到服务器

在本地机执行：

```bash
# 导出镜像为 tar 文件
docker save -o mcpcloud.tar mcpcloud:latest

# 查看文件大小，确认导出成功
ls -lh mcpcloud.tar
```

将 `mcpcloud.tar` 上传到远程服务器（任选一种方式）：

- **scp**：示例  
  `scp mcpcloud.tar root@YOUR_SERVER_IP:/root/`
- 或使用 XFTP、宝塔上传、RDP 拖拽等任意方式，只要最终文件在服务器上即可。

假设最终文件位置为服务器上的 `/root/mcpcloud.tar`。

---

## 三、服务器上加载镜像并运行容器

下面操作均在「远程服务器」上执行（确保服务器已安装 Docker）。

### 1. 加载镜像

```bash
# 进入 tar 所在目录
cd /root

# 加载镜像
docker load -i mcpcloud.tar

# 确认镜像已存在
docker images mcpcloud
```

### 2. 准备配置和数据目录

推荐在服务器上为 MCPCloud 单独准备目录（可按需修改）：

```bash
mkdir -p /opt/mcpcloud/data

# 如果你已经有一份 mcp_settings.json，可放到这里
# 也可以在容器启动后再从容器中拷贝出来修改，这里只给示例路径
touch /opt/mcpcloud/mcp_settings.json
```

后续运行容器时会把 `/opt/mcpcloud/mcp_settings.json` 和 `/opt/mcpcloud/data` 挂载到容器内部。

### 3. 首次运行容器

```bash
docker run -d \
  --name mcpcloud \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /opt/mcpcloud/mcp_settings.json:/app/mcp_settings.json \
  -v /opt/mcpcloud/data:/app/data \
  mcpcloud:latest
```

说明：

- 若希望通过 80 端口访问，可改为 `-p 80:3000`。
- `--restart unless-stopped`：服务器重启后自动拉起容器。

### 4. 更新镜像（重新打包后的部署流程）

当你在本地修改代码并重新构建镜像时，推荐流程如下：

1. 本地重新 `docker build -t mcpcloud:latest .`
2. 本地重新 `docker save -o mcpcloud.tar mcpcloud:latest`
3. 上传新的 `mcpcloud.tar` 到服务器，覆盖旧文件
4. 在服务器执行：

```bash
# 停止并删除旧容器
docker stop mcpcloud || true
docker rm mcpcloud || true

# 重新加载新镜像
cd /root
docker load -i mcpcloud.tar

# 重新启动容器（命令保持一致即可）
docker run -d \
  --name mcpcloud \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /opt/mcpcloud/mcp_settings.json:/app/mcp_settings.json \
  -v /opt/mcpcloud/data:/app/data \
  mcpcloud:latest
```

---

## 四、常用 Docker 排查命令（建议收藏）

下面所有命令都只与 Docker 运维排查相关，可在服务器上直接使用。

### 1. 查看容器/镜像/资源状态

```bash
# 查看正在运行的容器
docker ps

# 查看所有容器（包括已退出的）
docker ps -a

# 查看 mcpcloud 镜像
docker images mcpcloud

# 查看 Docker 整体信息（版本、存储驱动、Cgroup 等）
docker info

# 查看 Docker 版本
docker version

# 查看 Docker 磁盘占用
docker system df
```

### 2. 查看日志 & 实时日志

```bash
# 查看最近 200 行日志
docker logs --tail=200 mcpcloud

# 实时跟随日志（Ctrl + C 退出）
docker logs -f mcpcloud

# 只看错误关键字（配合 grep）
docker logs mcpcloud 2>&1 | grep -i error
```

### 3. 进入容器内部排查

```bash
# 进入容器交互式 shell
docker exec -it mcpcloud /bin/sh

# 在容器内查看环境变量
docker exec -it mcpcloud env

# 在容器内查看配置文件是否挂载成功
docker exec -it mcpcloud ls -lah /app
docker exec -it mcpcloud ls -lah /app/data
docker exec -it mcpcloud cat /app/mcp_settings.json
```

### 4. 检查容器配置/状态

```bash
# 查看容器详细信息（端口、环境变量、挂载、重启策略等）
docker inspect mcpcloud

# 只查看容器 IP / 网络信息（配合 jq 更方便）
docker inspect mcpcloud | grep -i ip

# 查看容器启动命令和状态
docker inspect --format '{{.Id}} {{.State.Status}} {{.Path}} {{.Args}}' mcpcloud
```

### 5. 检查端口、网络和性能

```bash
# 查看容器端口映射（确认是否映射到了宿主机 3000 或 80）
docker port mcpcloud

# 查看容器的进程列表
docker top mcpcloud

# 实时查看容器 CPU/内存/网络使用情况
docker stats mcpcloud

# 查看 Docker 实时事件（容器启动/停止/重启等）
docker events --since 10m

# 查看 Docker 网络列表
docker network ls

# 查看某个网络详情（例如默认 bridge）
docker network inspect bridge
```

### 6. 常见问题自查思路（简要）

- **访问不到网页**：
  - `docker ps` 看容器是否在运行；
  - `docker logs mcpcloud` 看是否有报错；
  - `docker port mcpcloud` 确认端口映射；
  - 在服务器上 `curl http://127.0.0.1:3000/api/health` 测试本机访问；
  - 如用 `-p 80:3000`，也可以 `curl http://127.0.0.1/`。
- **配置不生效**：
  - `docker exec -it mcpcloud ls /app`、`cat /app/mcp_settings.json` 确认挂载是否正确；
  - 检查 `docker run` 的 `-v` 路径是否写对。
- **容器频繁重启**：
  - `docker ps -a` 看 `STATUS`；
  - `docker logs mcpcloud` 看启动阶段报错；
  - `docker inspect mcpcloud` 查看 `RestartPolicy`。

---

## 五、删除 / 清理相关命令（容器 / 镜像 / 垃圾数据）

### 1. 删除容器

```bash
# 停止容器
docker stop mcpcloud

# 删除已停止的容器
docker rm mcpcloud

# 一条命令强制停止并删除（慎用）
docker rm -f mcpcloud
```

### 2. 删除镜像

```bash
# 删除指定镜像（镜像不能被正在运行的容器使用）
docker rmi mcpcloud:latest

# 如果镜像存在多个 tag，可用 IMAGE ID 删除
docker images mcpcloud
docker rmi <IMAGE_ID>
```

### 3. 清理无用资源（dangling 镜像 / 已退出容器等）

```bash
# 删除所有已退出的容器
docker container prune

# 删除未被任何容器使用的镜像
docker image prune

# 同时清理容器 + 镜像 + 网络（保留有标签的镜像）
docker system prune

# 最彻底清理（包含未使用的带标签镜像，磁盘空间紧张时使用，慎用）
docker system prune -a
```

### 4. 管理和删除卷 / 网络（如确实不再需要）

```bash
# 查看所有卷
docker volume ls

# 删除未被使用的卷（慎用，可能删除数据）
docker volume prune

# 单独删除某个卷（确认不再需要）
docker volume rm <VOLUME_NAME>

# 查看网络
docker network ls

# 删除自定义网络（不要删默认的 bridge/host/none）
docker network rm <NETWORK_NAME>
```

### 5. 删除本地打包文件

```bash
# 本地开发机删除导出的 tar
rm mcpcloud.tar

# 服务器上删除已不再需要的 tar
rm /root/mcpcloud.tar
```

---

## 六、访问地址与默认账号

- **管理控制台地址**：  
  - 如果映射为 `-p 3000:3000`：`http://服务器IP:3000`  
  - 如果映射为 `-p 80:3000`：`http://服务器IP/`
- **默认登录账号**：`admin` / `admin123`（建议首次登录后立刻修改密码，或在 `mcp_settings.json` 中自定义用户）。

