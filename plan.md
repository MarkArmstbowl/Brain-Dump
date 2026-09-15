# Material Design 控件迁移计划

## 概要

从当前干净的 `refactor/react-migration` 分支创建 `codex/material-design-controls`，引入 MUI 并以定制主题将全站交互控件迁移为 Material 风格；保留现有背景、装饰、内容布局和全部业务行为。

## 关键改动

- 安装 `@mui/material`、Emotion 运行时与 `@mui/icons-material`；在应用入口提供定制的浅色主题，沿用现有的鼠尾草绿、暖米色与圆角视觉语言，并统一 focus、disabled、error 状态。
- 将 Capture / Organize 导航替换为可访问的 MUI `Tabs` / `Tab`，保留现有键盘切换、面板关联和数量徽标。
- 将所有按钮按语义迁移为 Material 变体：
  - 主操作使用 contained（添加、拆分、保存、接受建议等）。
  - 次操作使用 outlined/text（取消、编辑、选择其他分类等）。
  - 删除与移除草稿使用带图标的 error/text 或 icon button，并保留清晰的无障碍名称。
- 将全部多行输入迁移为 MUI `TextField multiline`，保留受控值、自动聚焦、占位符、校验错误和辅助文字。
- 将所有分类原生下拉框迁移为 MUI `Select` / `MenuItem` / `FormControl`，使草稿、编辑和 AI 覆盖流程复用同一分类控件。
- 将分类筛选迁移为 MUI `ToggleButtonGroup`；保留单选筛选语义与现有类别色彩。
- 调整 `src/styles.css`：删除已被 MUI 接管的原生控件皮肤，仅保留页面布局、非交互卡片、分组、拖放和响应式样式；为 MUI 包装层补齐与现有版式的尺寸、间距和窄屏适配。
- 用 Material 图标替换交互控件中的装饰性 Unicode 操作符（添加、删除、箭头、AI 提示），保留非交互的品牌装饰。

## 验证

- 运行生产构建，确保依赖、主题和 JSX 均可编译。
- 按 README 的 Sprint Review 路径回归：单条/批量添加、类别筛选、编辑取消与保存、删除、拖放重排、AI 建议接受与覆盖、刷新持久化。
- 键盘验证标签页切换、各控件焦点状态、错误提示与 disabled/loading 状态；检查窄屏下控件不会溢出或遮挡。

## 假设

- 分支名采用 `codex/material-design-controls`。
- 使用当前稳定版 MUI，按 Material 3 的色彩、圆角与状态层原则定制主题；不重构现有业务状态、存储、AI 请求或拖放实现。
- “所有控件”包含导航、筛选、表单输入、分类选择、AI 操作及编辑/删除操作，不包含纯展示性的装饰图形。
