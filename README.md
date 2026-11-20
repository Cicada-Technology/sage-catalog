# Sage Catalog

Sage 官方目录：统一收录 **技能（skills）/ MCP 连接器 / 插件（plugins）** 的来源链接与名称/描述翻译。

仓库不保存技能文件、MCP 可执行文件或插件资产；安装仍由客户端从原始仓库、包管理器或插件索引完成。

## 目录结构

```text
skills/
  skills.json          # 技能链接：id / owner / repo / branch / path / url / category
  i18n/<locale>.json   # 技能 id -> { name, description }
mcp/
  mcp.json             # MCP 定义：transport / command / args / url / env / headers
  i18n/<locale>.json   # MCP id -> { name, description }
plugins/
  plugins.json         # 插件元数据覆盖层：id / repo / indexId / category
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

`plugins.json` 是**元数据覆盖层**，只负责翻译、分类和展示；版本、release 资产、SHA-256 与签名仍由现有插件索引提供，绝不由本仓库替代。

```json
{
  "id": "ai-quota-monitor",
  "repo": "libo-zhou/ccgui-plugin-ai-quota-monitor",
  "indexId": "ai-quota-monitor",
  "author": "libo-zhou",
  "category": "productivity"
}
```

- `category` 取 `dev / productivity / integration / appearance / other`。
- 安装时客户端用 `indexId` 回到插件索引解析版本与资产哈希；本仓库不提供下载地址。

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
