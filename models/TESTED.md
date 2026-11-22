# 本机实测记录

测试机：AMD Ryzen 7 5800H / 13 GB RAM / NVIDIA RTX 3050 Laptop 4 GB /
llama.cpp b12631 / Linux。Agent 模型按 64K 上下文加载，短任务模型按各自
默认上下文加载。TPS 为 llama.cpp 自报的 `predicted_per_second`。

| 模型 | 加载 | 工具调用 | 实测 TPS | 结论 |
|---|---|---:|---:|---|
| Qwen3.5 4B Q4_K_M | 正常 | 成功 | 13–21 | 保留，默认 Agent |
| Llama 3.2 3B Q4_K_M | 正常 | 成功 | 28.8 | 保留，快速 Agent |
| Ling mini 2.0 Q4_K_M | 正常 | 成功 | 29.2 | 保留，32K 短任务 |
| Nemotron 3.5 Bolt E4B UD-Q4_K_XL | 正常 | 成功 | 15.7 | 可用，已删除腾位 |
| Granite 4.0 Micro Q4_K_M | 正常 | 成功 | 28.2 | 可用，已删除腾位 |
| SmolLM3 3B 128K Q4_K_M | 正常 | 未发出工具调用 | 37.3 | 仅短任务 |
| Gemma 3 4B Q4_K_M | 正常 | 模板无工具 | 22.0 | 仅短任务 |
| Phi-4 Mini Q4_K_M | 正常 | 模板无工具 | 23.5 | 仅短任务 |
| MiniCPM 4.1 8B Q4_K_M | 正常 | 模板无工具 | 9.0 | 仅短任务 |
| GLM-4 9B Q4_K_M | 正常 | 未测试 | 6.0 | 仅短任务 |
| Qwen3 4B Q4_K_M | 正常 | 成功 | 5.3–12.1 | 可用，已删除腾位 |
| Qwen3 1.7B Q4_K_M | 正常 | 不适用 | 44.4 | 可用，已删除腾位 |
| Qwen3 0.6B Q4_K_M | 正常 | 不适用 | 145.0 | 可用，已删除腾位 |
| Qwen3 30B-A3B Q4_K_M | 未加载 | — | — | 本机内存不足 |

最终本机保留：Qwen3.5 4B、Llama 3.2 3B、Ling mini 2.0。
