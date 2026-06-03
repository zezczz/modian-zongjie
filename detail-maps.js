/**
 * 总览页路由表 — 把章节 id 映射到 pages/ 下的独立 HTML
 * 新增板块：1) 在 pages/ 复制一份 html  2) 在此注册  3) 在 main.html 给分组加 detailId
 */
const CHAPTER_PAGES = {
    ch01: 'pages/ch01.html',
    ch02: 'pages/ch02.html',
    ch03: 'pages/ch03.html',
    ch45: 'pages/ch45.html',
    ch06: 'pages/ch06.html',
    ch79: 'pages/ch79.html',
    ch08: 'pages/ch08.html',
    ch10: 'pages/ch10.html',
    ch11: 'pages/ch11.html',
    ch07: 'pages/ch79.html'  // 旧 id 兼容
};

const CHAPTER_DETAIL = {
    grp00000000000001: 'ch01',
    grp00000000000002: 'ch02',
    grp00000000000003: 'ch03',
    grp00000000000004: 'ch45',
    grp00000000000006: 'ch06',
    grp00000000000007: 'ch79',
    grp00000000000008: 'ch08',
    grp00000000000010: 'ch10',
    grp00000000000011: 'ch11'
};

function getDetailIdForNode(node) {
    if (!node) return null;
    if (node.detailId && CHAPTER_PAGES[node.detailId]) return node.detailId;
    if (CHAPTER_DETAIL[node.id]) return CHAPTER_DETAIL[node.id];
    const id = node.id || '';
    if (id.startsWith('ch01') || id === 'ch01hub') return 'ch01';
    if (id.startsWith('ch02') || id === 'ch02hub') return 'ch02';
    if (id.startsWith('ch03') || id === 'ch03hub') return 'ch03';
    if (id.startsWith('ch45') || id === 'ch45hub') return 'ch45';
    if (id.startsWith('ch06') || id === 'ch06hub') return 'ch06';
    if (id.startsWith('ch07') || id.startsWith('ch09') || id === 'ch79hub' || id === 'ch07hub') return 'ch79';
    if (id.startsWith('ch08') || id === 'ch08hub') return 'ch08';
    if (id.startsWith('ch10') || id === 'ch10hub') return 'ch10';
    if (id.startsWith('ch11') || id === 'ch11hub') return 'ch11';
    return null;
}

function openDetailPage(detailId) {
    const page = detailId && CHAPTER_PAGES[detailId];
    if (!page) return;
    window.location.href = page;
}

function getOverviewText(node) {
    if (!node || !node.text) return '';
    if (node.summary) return node.summary;
    const detailId = getDetailIdForNode(node);
    const stripped = node.text.replace(/!\[[^\]]*\]\([^)]+\)/g, '').trim();
    const titleMatch = stripped.match(/^#{1,3}\s+.+/m);
    if (detailId) {
        return titleMatch ? titleMatch[0] : '## 详细导图';
    }
    const lines = stripped.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 2) return stripped;
    const title = lines[0];
    const body = lines.find((l, i) => i > 0 && !l.startsWith('#') && !l.startsWith('>'));
    if (!body) return title;
    const short = body.length > 36 ? body.slice(0, 36) + '…' : body;
    return title + '\n' + short;
}

/** 旧链接 detail.html?id=xxx 兼容跳转 */
const LEGACY_DETAIL_REDIRECT = CHAPTER_PAGES;
