# GitHub Pages 入口

学生打开站点主页即可进入测试。研究者访问同一站点的 `admin/` 后，网页会跳转至所配置 HTTPS 服务的管理登录页面。登录后在后台建立批次，即可复制与本站仓库路径对应的学生分享链接。

发布工作流为 `.github/workflows/pages.yml`。在 GitHub 的 Pages 设置中选择 GitHub Actions，将公开 HTTPS 服务地址设为仓库变量 `STUDY_API_ORIGIN`。然后运行 **Publish study pages**。未设该变量时，页面会显示“答题服务准备中”，并停止收集信息。服务端需允许当前 Pages 源站的跨域访问。

Pages 构建产物包含学生页、后台跳转页和 `.nojekyll`。学生信息与所选答案直接提交到研究服务，研究者在后端域名下登录和导出数据。
