# Models

Sage 本地模型目录：只存模型的**元数据**，不存权重。客户端按条目里的
Hugging Face / 魔搭（ModelScope）仓库、版本、路径和 SHA-256 下载 GGUF。

## 文件

```text
models/
  index.json   # schemaVersion / runtime / models
  README.md
  TESTED.md    # 本机加载/工具调用/TPS 实测记录
```

`index.json` 由客户端 1 小时缓存；国内优先 Gitee 镜像，其他地区优先 GitHub。

## 条目

```json
{
  "id": "qwen3-4b-instruct-2507-q4-k-m",
  "displayName": "Qwen3 4B",
  "family": "qwen3",
  "paramsB": 4.0,
  "activeParamsB": 4.0,
  "moe": false,
  "quality": 62,
  "toolUse": true,
  "contextMax": 262144,
  "ctxDefault": 65536,
  "ctxMinAgent": 65536,
  "license": "apache-2.0",
  "capabilities": ["chat", "tools", "json", "multilingual"],
  "quant": {
    "id": "q4_k_m",
    "quant": "Q4_K_M",
    "filename": "Qwen3-4B-Instruct-2507-Q4_K_M.gguf",
    "size": 2497281120,
    "sha256": "3605803b...",
    "kvBytesPerToken": 147456,
    "cacheType": "q4_0"
  },
  "sources": {
    "modelscope": { "repo": "unsloth/Qwen3-4B-Instruct-2507-GGUF", "revision": "0b04...", "path": "Qwen3-4B-Instruct-2507-Q4_K_M.gguf" },
    "huggingface": { "repo": "unsloth/Qwen3-4B-Instruct-2507-GGUF", "revision": "main", "path": "Qwen3-4B-Instruct-2507-Q4_K_M.gguf" }
  }
}
```

规则：

- `id` 稳定、唯一，客户端用它作为模型目录名；不要随量化版本改变。
- `ctxMinAgent` 是本地 Agent 会话的最低上下文，必须 ≥ 65536；短任务模型填 `null`。
- `toolUse` 表示模型工具调用能力；只有同时满足 64K 和工具能力的模型会出现在「Agent 模型」。
- `quality` 是 Sage 评测的 0–100 质量分，用于同等内存下优先推荐更聪明的模型。
- `kvBytesPerToken` 按 GGUF 元数据计算：`2 × n_layers × n_kv_heads × head_dim × 2`。
- `quant.size` / `sha256` 必须来自实际文件；`sources` 两边指向同一份 GGUF 时共用该 SHA-256。
- `runtime.minBuild` 是所需的最低 llama.cpp build；客户端固定使用该 build 的 server。
