# 潘新月 · 作品集

纯静态站点，零依赖、零构建、零外部网络请求。改完直接推，GitHub Pages 就是最新的。

## 目录结构

```
index.html                 首页
case-voice-layout.html     主案例：语音厅布局系统
gallery.html               照片集（3D 翻页书）

assets/
  css/
    fonts.css              @font-face（自托管字体）
    tokens.css             ← 设计变量唯一真源：颜色 / 圆角 / 缓动 / 字体栈
    base.css               reset + 排版 + .wrap / .kicker / .on-dark
    motion.css             动效层
  js/
    motion.js              动效驱动（三页共用）
  fonts/                   woff2 字体文件
  img/                     站点图片 + favicon

photos/                    ← 照片集用的照片放这里（g1.jpg … g9.jpg）
```

**改颜色只改 `assets/css/tokens.css`。** 三个页面都从那里取值，不会漏。
页面专属的样式仍写在各自 HTML 的 `<style>` 里——刻意不做成一个大 CSS，
免得改一个页面把另外两个改坏。

## 本地预览

```bash
python3 -m http.server 5180
# 打开 http://localhost:5180/
```

直接双击 HTML 也能看个大概，但 `file://` 下字体和照片探测会受限，建议起 server。

---

## ⚠️ 发出去之前必须做的三件事

页面现在是**草稿模式**——`index.html` 的 `<body class="draft">` 会显示一条黑色提示条，
以及若干黄色虚线框，圈出所有「我没法替你确认的内容」。

### 1. 改掉三处草稿内容

| 位置 | 现在是什么 | 要改成 |
|---|---|---|
| 关于（About） | 两段代写的自我介绍 | 你自己的话。现在这两段只是基于案例页内容推出来的，**语气和事实都要你自己核一遍** |
| 联系（Contact） | `你的邮箱@example.com` / `你的微信号` / 作品平台链接 | 真实联系方式 |
| 案例 02 / 03 / 04 | 三个「案例整理中」占位卡 | 真实案例，或直接删掉这一整块 `<div class="wrap soon-grid ...">` |

### 2. 确认无误后关掉草稿模式

把 `index.html` 里的 `<body class="draft">` 改成 `<body>`。
黑色提示条和所有黄色虚线框会一起消失。**这一步不做就别发出去。**

### 3. 处理仓库里那四张模板自带的图

`project-one.jpg`、`project-two.png`、`project-three.gif`、`project-four.webp`
是原来那套模板自带的填充素材，不是你的作品——其中 `project-one` 带着别人的品牌名
"ADOM Mobile Banking App"，`project-four` 是另一套拳击 App 的稿子。

页面已经全部不再引用它们，但**文件还在公开仓库里**。建议删掉：

```bash
git rm project-one.jpg project-two.png project-three.gif project-four.webp
```

---

## 换照片集的照片

`gallery.html` 会**自动探测哪些照片真的存在**——放进去就出现，没放的自动跳过，
一张都没有就显示「整理中」占位页。不会出现碎图。

现在 `photos/` 里放了 2 张占位图，方便你直接看翻页效果。
把它们换成你自己的照片即可（保持文件名 `g1.jpg` / `g2.jpg`），
或者继续往下加 `g3.jpg` … `g9.jpg`。

想改每页的标题和年份，编辑 `gallery.html` 里的 `PHOTOS` 数组：

```js
const PHOTOS = [
  {src:'photos/g1.jpg', t:'Maldives', yr:'2023'},
  // 继续追加即可，文件不存在的会被自动跳过
];
```

---

## 动效怎么用

动效全部通过 HTML 上的 `data-*` 属性声明，**不用写 JS**。
在任意元素上加属性即可：

| 属性 | 效果 |
|---|---|
| `data-reveal` | 进入视口时淡入上移 |
| `data-stagger="80"` | 子元素依次进场，值是步长（毫秒） |
| `data-words` | 标题按词拆开，逐词升起 |
| `data-count="900"` | 数字从 0 滚到目标值，配 `data-prefix` / `data-suffix` / `data-decimals` |
| `data-magnetic="12"` | 元素轻微跟随鼠标，值是最大位移（px） |
| `data-tilt="9"` | 元素跟随鼠标做 3D 倾斜，值是最大角度 |
| `data-spotlight` | 深色区块跟随鼠标的柔光 |
| `data-progress` | 页面顶部的阅读进度条 |
| `data-copy="#id"` | 点击复制指定元素的文字 |

设计上的三条底线：

1. **关掉 JS，内容必须完整可读。** 动画只在 `<html class="js">` 时启用，
   而这个 class 是 `motion.js` 自己加的。
2. **`prefers-reduced-motion` 一律降级。** 系统开了「减少动态效果」，
   所有动效自动关掉，只留内容。
3. **不做无人观看的动画。** 首页那个语音厅舞台只在进入视口时播放，滚走就停。

跨页跳转用了 View Transitions API（Chrome / Edge 支持），
不支持的浏览器完全无感，就是普通跳转。

---

## 技术说明（给未来的自己 / 接手的人）

**字体是自托管的，不要改回 Google Fonts。**
`assets/fonts/` 是从 Google Fonts 下载并子集化的 woff2（OFL 协议允许自托管）：

- `plus-jakarta-sans-var.woff2` — 可变字体，一个文件覆盖 400–800 全字重（15 KB）
- `caveat-700.woff2` — 手写体，只用于 "Xinyue Pan"（41 KB）
- `space-mono-400/700.woff2` — 只有 gallery 用（各 5 KB）

原因：`fonts.googleapis.com` 在国内不可达。用 Google Fonts 的话，导航栏那个手写体名字、
正文、gallery 全站字体都会掉回系统默认，而且还要先等 preconnect 超时。
中文由系统 PingFang SC 渲染，不走 webfont。

**页面重量**：首屏约 122 KB，滚动后再加 45 KB。

**案例页没有产品截图是刻意的**——用 CSS 线框示意代替，规避脱敏风险。
首页主案例卡片的封面（会呼吸的那个语音厅舞台）也是同一套线框语言画的，保持一致。

**六个容易踩的坑**（都已经修了，别改回去）：

1. `gallery.html` 里返回按钮的类名是 `.backlink` 不是 `.back`——
   `.back` 会和翻页书页面背面的 `.face.back` 撞样式，导致每张背面页被套上按钮的
   `position:fixed` / 100px 圆角 / `text-transform:uppercase`。
2. 给 `<img>` 写 `width`/`height` 属性时，如果 CSS 只覆盖了 `width`，
   `height` 属性会被当成字面像素值用，图会被拉变形。`.polaroid .sig` 因此显式写了 `height:auto`。
3. 窄屏下 `.about-grid` 用的是 `minmax(0,1fr)` 不是 `1fr`——
   `1fr` 轨道的下限是内容的 min-content，会被固定宽度的子元素撑破视口。
4. 绝对定位元素不要用负的 `right`，会撑出横向溢出。
   同理固定尺寸元素用 `width:100% + max-width`，不用 `width:330px + max-width:100%`——
   后者会和由自身撑开的父级循环求值。
5. Hero 三件套（`Hello!` / 照片 / `:)`）在 520px 以下必须留在同一行。
   一旦 flex 换行，悬在照片下方的签名就会压住 `:)`。所以有一条 `@media(max-width:520px)` 专门缩尺寸。
6. **入场动画要用 `data-reveal`，不要写 `class="reveal"`。**
   `.reveal` 是 `motion.js` 运行时加上去的；手写这个 class 的元素永远不会被观察到，
   会永久停在 `opacity:0`——页面上就是一块空白。

**入场动画有 3 秒兜底**：所有 `data-reveal` 内容默认 `opacity:0`，靠 IntersectionObserver 揭示。
万一 IO 没触发就是整页空白，所以 `motion.js` 里加了 `setTimeout(revealAll, 3000)` 保底。

---

## 部署到 GitHub Pages

仓库 → Settings → Pages → Source 选 `Deploy from a branch` → 分支 `main` / 目录 `/ (root)` → Save。

一两分钟后可以访问：`https://xinyuepan1999.github.io/portfolio/`

建议顺手在仓库首页右上角 About 里填上这个网址和一句描述——现在是空的。
