# portfolio

纯静态站点，零依赖、零构建、零外部网络请求。

```
index.html                     首页
portfolio-voice-layout.html    案例：语音厅布局系统
gallery.html                   照片集（3D 翻页书）

assets/
  css/  fonts.css / tokens.css / base.css / motion.css
  js/   motion.js
  fonts/ img/
photos/                        照片集的照片（g1.jpg … g9.jpg）
```

本地预览：`python3 -m http.server 5180` → http://localhost:5180/

---

> **改动清单见 [CHANGES.md](CHANGES.md)** —— 逐条交代了每个文件改了什么、为什么，
> 以及哪些没动、哪些等你决定。

---

## 动效

通过 HTML 上的 `data-*` 属性声明，不用写 JS：

| 属性 | 效果 |
|---|---|
| `data-reveal` | 进入视口时淡入上移 |
| `data-stagger="80"` | 子元素依次进场，值是步长（毫秒） |
| `data-words` | 标题按词拆开，逐词升起 |
| `data-count="900"` | 数字滚动，配 `data-prefix` / `data-suffix` / `data-decimals` |
| `data-magnetic="12"` | 轻微跟随鼠标 |
| `data-tilt="9"` | 跟随鼠标做 3D 倾斜 |
| `data-spotlight` | 深色区块跟随鼠标的柔光 |
| `data-progress` | 页面顶部阅读进度条 |
| `data-copy="#id"` | 点击复制指定元素的文字 |

三条底线：关掉 JS 内容完整可读；`prefers-reduced-motion` 一律降级；
动画只在进入视口时播放，滚走就停。跨页跳转用 View Transitions API，不支持的浏览器无感降级。

**改颜色只改 `assets/css/tokens.css`**，三个页面从同一处取值。
页面专属样式仍在各自 HTML 的 `<style>` 里，刻意不合并，免得改一页坏另外两页。

---

## 改代码时容易踩的坑

1. `gallery.html` 的返回按钮类名必须是 `.backlink`，不能叫 `.back`（见上）。
2. `<img>` 写了 `width`/`height` 属性但 CSS 只覆盖 `width` 时，
   `height` 会被当字面像素值用，图会拉变形。
3. grid 单列写 `minmax(0,1fr)` 而不是 `1fr` —— `1fr` 轨道下限是内容 min-content，
   会被固定宽度的子元素撑破窄屏。
4. 绝对定位元素不要用负的 `right`，会撑出横向滚动。
5. **入场动画用 `data-reveal`，不要手写 `class="reveal"`。**
   `.reveal` 是 `motion.js` 运行时加的；手写这个 class 的元素永远不会被观察到，
   会永久停在 `opacity:0` —— 页面上就是一块空白。

---

## 部署

Settings → Pages → Source 选 `Deploy from a branch` → 分支 `main` / 目录 `/ (root)`。
地址：`https://xinyuepan1999.github.io/portfolio/`
