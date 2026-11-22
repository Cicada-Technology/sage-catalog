# Sage Catalog

Sage 官方目录：统一收录 **技能（skills）/ MCP 连接器 / 插件（plugins）/ 本地模型（models）** 的来源链接与元数据。

仓库不保存技能文件、MCP 可执行文件或插件资产；安装仍由客户端从原始仓库、包管理器或插件索引完成。

## 目录结构

```text
skills/
  skills.json          # 技能链接：id / owner / repo / branch / path / url / category
  i18n/<locale>.json   # 技能 id -> { name, description }
mcp/
  mcp.json             # MCP 定义：transport / command / args / url / env / headers
  i18n/<locale>.json   # MCP id -> { name, description }
models/
  index.json           # 本地模型：量化、文件大小/SHA-256、64K 门槛、HF/魔搭来源
plugins/
  plugins.json         # 元数据源：id / repo / category / author
  index.json           # 完整索引：版本、资产、SHA-256、archive
  i18n/<locale>.json   # 插件 id -> { name, description }
```

支持的语言（与 Sage 界面一致）：

```text
en, zh, zh-TW, ja, ko, de, fr, es, pt-BR, ru, ar, hi-IN, bn, id, bo
```

## 技能

```json
{
  "id": "anthropics/skills:skills/pdf",
  "owner": "anthropics",
  "repo": "skills",
  "branch": "main",
  "path": "skills/pdf",
  "url": "https://github.com/anthropics/skills/blob/main/skills/pdf/SKILL.md",
  "category": "docs"
}
```

- `id` 必须稳定，格式为 `owner/repo:path`，用于关联翻译。
- `path` 是包含 `SKILL.md` 的目录；根目录技能按约定使用仓库名。
- `category` 取 `admin / finance / legal / docs / dev / design / other`。
- 缺失翻译时客户端回退：当前语言 → en → 路径最后一段。

## MCP

```json
{
  "id": "blender",
  "serverName": "blender",
  "icon": "boxes",
  "category": "design",
  "transport": "stdio",
  "command": "uvx",
  "args": ["mcp-for-blender"],
  "repo": "https://github.com/ahujasid/mcp-for-blender",
  "docs": "https://mcp-for-blender.com/",
  "prerequisites": ["uv", "blenderAddon"],
  "env": [],
  "headers": []
}
```

- `transport` 为 `stdio` 或 `http`；`stdio` 用 `command`/`args`，`http` 用 `url`。
- `env` / `headers` 只描述字段，不保存密钥；安装时由用户填写，客户端写入本机 600 配置。
- 目录只声明“怎么装”和“需要什么”，安装器负责校验命令白名单与字段合法性。

## 插件

`plugins/index.json` 是 Sage 自有插件索引：客户端只读它来发现、选择版本和校验资产。`plugins/plugins.json` 保留为生成索引的元数据源（id / repo / category / author），不参与安装。

索引条目示例：

```json
{
  "id": "com.cicada.git-workbench",
  "repo": "Cicada-Technology/sage-plugin-git-workbench",
  "category": "dev",
  "name": "Git Workbench",
  "description": "View branches, changes, staged files and recent commits; stage, unstage and commit without leaving Sage.",
  "author": "Cicada Technology",
  "versions": [{
    "version": "0.1.0",
    "tier": "js",
    "minAppVersion": "1.2.5",
    "sdkVersion": "^0.3",
    "permissions": ["ui:panel-tab", "exec:git"],
    "files": {},
    "archive": "https://github.com/Cicada-Technology/sage-plugin-git-workbench/releases/download/v0.1.0/plugin.zip",
    "archiveSha256": "sha256...",
    "icon": null,
    "screenshots": []
  }]
}
```

- `files`：平铺 Release 资产，客户端逐个下载并按哈希校验。
- `archive` + `archiveSha256`：`plugin.zip`，存在时优先于 `files`；客户端下载、校验、解包后再走同一套安装事务。
- `category` 取 `dev / productivity / integration / appearance / other`。
- `plugins/i18n/<locale>.json` 提供名称/描述翻译。

`plugins/featured.json` 是市场顶部轮播的编辑精选，只列索引里存在的 id：

```json
[
  { "id": "com.cicada.git-workbench" },
  { "id": "com.cicada.ai-quota" }
]
```

可选字段 `tagline` / `note` 提供推荐文案，`image` 提供封面；省略时客户端回退到该插件的本地化描述与自己的截图/图标。

## 客户端取数

仓库根地址：

```text
GitHub: https://raw.githubusercontent.com/Cicada-Technology/sage-catalog/main/
Gitee:  https://gitee.com/Cicada-Technology/sage-catalog/raw/main/
```

客户端按语言选择首选源：

```text
zh / zh-TW / bo -> Gitee
其他语言        -> GitHub
```

首选源失败时自动回退另一个；结果缓存 6 小时。Gitee raw 会 302 到签名地址，客户端必须跟随重定向。

## GitHub → Gitee 同步

GitHub 是唯一源仓库。Gitee 仓库不要直接编辑，使用 Gitee 自带的 GitHub 同步：

https://help.gitee.com/repository/settings/sync-between-gitee-github

在 Gitee 仓库的 **设置 → 仓库镜像/同步** 中绑定：

```text
https://github.com/Cicada-Technology/sage-catalog.git
```

同步方向选择 GitHub → Gitee，分支 `main`。之后只维护 GitHub。
Gitee 仓库必须保持 **public**，默认分支设为 `main`；私有仓库匿名 raw 会返回 404。

## 维护

1. 新增/删除条目：编辑对应目录下的 JSON。
2. 翻译：编辑 `i18n/<locale>.json`；缺失时客户端自动回退到 en。
3. 校验：

```bash
node scripts/validate.mjs
```

4. 提交到 GitHub 的 `main`；Gitee 由同步功能更新。

## 说明

- 本仓库不重新分发技能、MCP 服务或插件代码，只提供索引与翻译元数据。
- 安装与使用受原始仓库/包的许可证约束。
