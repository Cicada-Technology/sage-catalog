# Sage Plugin Template

最小声明式插件示例。复制这个目录到独立的 `sage-plugin-*` 仓库即可开始。

```text
sage.plugin.json   # 清单：id / publisher / version / permissions / contributes
```

发布新版本时：

1. 修改 `version`，提交并打 tag（例如 `v1.0.1`）；
2. 构建产物（声明式插件没有 `main.js`；JS 插件增加 `main.js` / `styles.css`）；
3. 生成 `plugin.zip` 和 SHA-256；
4. 在 `plugins/index.json` 增加对应版本条目，或提交 PR 到本仓库。

字段说明见仓库根目录 `README.md`。
