# Markdown使用

[官方教程](https://markdown.com.cn/basic-syntax/horizontal-rules.html)

## 注意事项

1. **HTML与Markdown混合**：在HTML标签内部（如`<table>`、`<div>`）不能使用Markdown语法，必须用纯HTML
2. **代码显示**：在HTML中使用`<code>`标签包裹代码，而不是反引号
3. **表格**：如果不想用HTML，可以用纯Markdown表格语法：

### 纯Markdown表格示例：

| 步骤 | 代码 | 说明 |
|------|------|------|
| 初始化 | `git init` | 创建本地仓库 |
| 添加文件 | `git add .` | 添加所有文件到暂存区 |
| 提交 | `git commit -m "消息"` | 提交到本地仓库 |

4. **图片路径**：使用相对路径，确保图片文件在指定位置