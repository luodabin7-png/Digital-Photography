# 光影自习室 · Digital Photography Lab

一个简体中文数字摄影学习网站。七章知识卡片与交互练习帮助初学者理解相机、曝光、构图、用光和后期。纯 HTML、CSS 和 JavaScript，无框架、无运行时依赖。

## 可以做什么

- 阅读七章、二十一个知识卡片，按章节筛选或关键词搜索。
- 调整光圈、快门和 ISO，查看相对场景基准的亮度与档位变化。
- 切换三分法、中心构图、对角线，以及四种布光方向示意。
- 从十二道原创题中随机抽取六题，查看解释并复习错题。
- 使用仅保存在当前浏览器的拍摄清单，随时一键清空。

曝光实验只展示相对亮度。景深、运动模糊和噪声以文字说明，不进行物理渲染。场景参数是教学基准，实际拍摄请结合测光与回放。

## 本地运行

直接打开 `index.html` 即可使用。也可以在安装 Node.js 20 或更新版本后执行：

```sh
npm start
```

在浏览器打开终端显示的本地地址。无须执行 `npm install`。

```sh
npm test
npm run check
npm run build
```

构建结果位于 `dist/`，通过明确文件清单复制站点资源，不包含开发脚本或教学源文件。

## GitHub Pages

本项目适用于仓库子路径，站点资源全部使用相对链接。仓库自带 Pages 工作流：

1. 将完整源代码推送到公开仓库的 `main` 分支。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 在 **Actions → Deploy photography lab → Run workflow** 手动运行，之后每次推送自动更新。
4. 部署成功后，在工作流的 `github-pages` environment 中查看站点地址。

部署过程参考 [GitHub 官方 Pages 文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。也可以将仓库根目录设为传统分支发布源，本项目含 `.nojekyll`。

## 修改内容

| 文件 | 用途 |
| --- | --- |
| `index.html` | 页面结构与无障碍标签 |
| `styles.css` | 颜色、排版、移动端布局与打印样式 |
| `data.js` | 知识卡片、题库、布光说明、检查清单 |
| `math.js` | 相对曝光档位计算、搜索、随机排序 |
| `app.js` | 页面交互与本地清单 |
| `assets/` | 原创 SVG 示意图与图标 |

## 隐私与内容来源

公开内容为围绕通用摄影知识重新编写的说明、练习和原创示意图。仓库不包含原始课件、课件截图、试卷、作者信息、私人照片或本机路径。源课件中的第三方素材未被复制或转授许可。

网站无注册、上传、统计追踪、第三方脚本、外链字体或远程 API 请求。清单仅使用本地存储。托管方可能按其政策记录网络访问；公开仓库的账号归属也由 GitHub 展示。详见 [隐私说明](PRIVACY.md)。

提交更改或新增素材前，请检查文件内容、图像元数据及 Git 提交署名，避免提交联系方式、地址、位置、凭据或身份信息。

## 许可

本仓库代码、重新编写的教学说明及原创 SVG 按 [MIT License](LICENSE) 开源。未随库提供的原始资料及第三方作品不在本许可范围内。
