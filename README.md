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

## 修了什么

**入口与死链**
- 新建 `index.html`（原 `paul-style-replica.html`）。此前没有 index，静态托管打开根路径是 404，
  案例页两处「返回作品集」也因此是死链。

**碎图**
- `7d91d17` 删掉的 `hero.png` 和 `avatar.jpg` 其实都在用（About 个人照、gallery 灵动岛头像），
  已由 `hero-photo.jpg` 派生方图补回。

**照片集**
- `g1–g9.jpg` 从未提交过，整本翻页书是空的。改为自动探测实际存在的照片：
  放进 `photos/` 就出现，缺失自动跳过，一张都没有时显示占位页。
  现放了 2 张占位图方便看翻页效果。
- 修了一个类名冲突：返回按钮原来叫 `.back`，会命中翻页书页面背面的 `.face.back`，
  导致每张背面页被套上按钮的 `position:fixed` / 100px 圆角 / `text-transform:uppercase`。
  按钮改名 `.backlink`。

**字体**
- 原来依赖 `fonts.googleapis.com`，国内不可达 —— 导航栏手写体名字、正文、gallery
  全站字体都会掉回系统默认。改为自托管子集化 woff2（OFL 允许），424 KB → 65 KB。
  中文由系统 PingFang SC 渲染，不走 webfont。

**体积**
- 首页图片 6.9 MB（其中 `project-three.gif` 单个 5.8 MB）→ 相关图片转 webp。

**鲁棒性**
- 入场动画原本是内容默认 `opacity:0` + IntersectionObserver 揭示，IO 不触发就是整页空白。
  现在动画只在 `<html class="js">` 时启用（这个 class 由 `motion.js` 自己加），
  并有 `setTimeout(revealAll, 3000)` 兜底。

**其他**
- 补 favicon 和 OG 标签（分享到微信/LinkedIn 原来是白卡）。

---

## 已知问题（未处理，等本人决定）

- **Contact 表单是假的**：`onsubmit="return false"`，点「Send message」没有任何反应。
- **社交链接**都是 `href="#"`。
- **导航里的语言切换器**（中国国旗那个）没绑任何事件，纯装饰。
- **About / FAQ 里的 `【Placeholder】`** 尚未替换。
- **四张 project 图不是本人作品**：是原模板自带的填充素材，其中 `project-one.jpg`
  带着别人的品牌名 "ADOM Mobile Banking App"，`project-four.webp` 是另一套拳击 App 的稿子。
  仓库是公开的。要删的话：
  ```bash
  git rm project-one.jpg project-two.png project-three.gif project-four.webp
  ```

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
