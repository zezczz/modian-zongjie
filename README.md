# 模电总结

模拟电子技术基础（模电）知识脉络脑图，全 11 章总览 + 分章详细导图。

## 使用

直接用浏览器打开 `main.html` 即可（无需服务器）。

- **总览页** `main.html`：可拖拽、缩放的大画布，点击有详细导图的章节进入子页
- **详细页** `pages/*.html`：各章节独立维护，修改底部 `PAGE_CONFIG` 即可

## 目录结构

```
main.html          总览入口（壳页面）
overview-data.js   总览章节布局与连线（改这里调位置）
overview.js        总览画布逻辑
detail-maps.js     总览 → 详细页路由
detail-viewer.js   详细页查看器
pages/             各章节详细页
images/            导图插图
```

## 章节

| 章节 | 详细页 | 导图 |
|------|--------|------|
| Ch1 导论 | pages/ch01.html | 文字笔记 |
| Ch2 运算放大器 | pages/ch02.html | images/运算放大器/ |
| Ch3 二极管 | pages/ch03.html | images/二极管/ |
| Ch4-5 晶体管 BJT·MOS | pages/ch45.html | images/bjt_changfang/ |
| Ch6 频率响应 | pages/ch06.html | images/频率响应/ |
| Ch7-9 差放·功放 | pages/ch79.html | images/差放/ |
| Ch8 反馈 | pages/ch08.html | images/反馈/ |
| Ch10 信号处理 | pages/ch10.html | images/信号/ |
| Ch11 直流电源 | pages/ch11.html | images/电源/ |

## 新增章节详细页

复制 `pages/_template.html`，修改 `PAGE_CONFIG`（图片路径、笔记），并在 `detail-maps.js` 的 `CHAPTER_PAGES` 中注册，最后在 `main.html` 对应分组加 `detailId` 或 hub 卡片。
