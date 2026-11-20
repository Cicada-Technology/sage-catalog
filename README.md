# Sage Skills Catalog

Sage 官方技能索引。仓库只保存**技能来源链接**与**名称/描述翻译**，不保存技能文件、脚本或图标；安装时仍从原始 GitHub 仓库读取。

## 数据文件

```text
skills.json          # 技能链接：id / owner / repo / branch / path / url
i18n/<locale>.json   # id -> { name, description }
```

支持的语言（与 Sage 界面一致）：

```text
en, zh, zh-TW, ja, ko, de, fr, es, pt-BR, ru, ar, hi-IN, bn, id, bo
```

`skills.json` 条目：

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
- `path` 是包含 `SKILL.md` 的目录；安装时使用该目录。
- `url` 只用于界面「打开来源」。
- `category` 取 `admin / finance / legal / docs / dev / design / other`，用于发现页分类过滤。
- 没有翻译的条目允许缺省；客户端回退顺序为当前语言 → en → 路径最后一段。

## 客户端取数

- GitHub：`https://raw.githubusercontent.com/Cicada-Technology/skills/main/`
- Gitee：`https://gitee.com/Cicada-Technology/skills/raw/main/`

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
https://github.com/Cicada-Technology/skills.git
```

同步方向选择 GitHub → Gitee，分支 `main`。之后只维护 GitHub。
Gitee 仓库必须保持 **public**，默认分支设为 `main`；私有仓库匿名 raw 会返回 404。

## 维护

1. 新增/删除技能：编辑 `skills.json`。
2. 翻译：编辑对应 `i18n/<locale>.json`；缺失时客户端自动回退。
3. 校验：

```bash
node scripts/validate.mjs
```

4. 提交到 GitHub 的 `main`；Gitee 由同步功能更新。

## 说明

- 本仓库不重新分发技能代码，只提供索引与翻译元数据。
- 请保留来源链接；安装与使用受原仓库许可证约束。
