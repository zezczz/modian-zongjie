/** 详细页查看器 — 读取 window.PAGE_CONFIG 并渲染 */
function initDetailViewer(config, options = {}) {
    const homeLink = options.homeLink || '../main.html';

    const workspace = document.getElementById('workspace');
    const canvas = document.getElementById('canvas');
    const loading = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const notesPanel = document.getElementById('notes-panel');
    const notesContent = document.getElementById('notes-content');
    const toggleNotesBtn = document.getElementById('toggle-notes-btn');
    const imageNav = document.getElementById('image-nav');
    const homeBtn = document.getElementById('home-link');
    if (homeBtn) homeBtn.href = homeLink;

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let minFitScale = 0.05;
    let notesOpen = false;
    let contentWidth = 0;
    let contentHeight = 0;
    const imageBlocks = [];

    function updateTransform() {
        canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }

    window.fitToView = function fitToView(padding = 24) {
        const vw = workspace.clientWidth;
        const vh = workspace.clientHeight;
        if (!contentWidth || !contentHeight) return;
        const scaleX = (vw - padding * 2) / contentWidth;
        const scaleY = (vh - padding * 2) / contentHeight;
        minFitScale = Math.min(scaleX, scaleY);
        scale = Math.max(minFitScale, 0.02);
        offsetX = (vw - contentWidth * scale) / 2;
        offsetY = (vh - contentHeight * scale) / 2;
        updateTransform();
    };

    window.focusBlock = function focusBlock(index, padding = 40) {
        const block = imageBlocks[index];
        if (!block) return;
        const vw = workspace.clientWidth;
        const vh = workspace.clientHeight;
        const bw = block.width;
        const bh = block.height;
        const scaleX = (vw - padding * 2) / bw;
        const scaleY = (vh - padding * 2) / bh;
        scale = Math.min(scaleX, scaleY, 2.5);
        scale = Math.max(scale, minFitScale * 0.5);
        offsetX = (vw - bw * scale) / 2 - block.x * scale;
        offsetY = (vh - bh * scale) / 2 - block.y * scale;
        updateTransform();
        imageNav.querySelectorAll('button').forEach((btn, i) => btn.classList.toggle('active', i === index));
    };

    window.zoom = function zoom(factor) {
        scale = Math.min(Math.max(scale * factor, minFitScale * 0.25), 12);
        updateTransform();
    };

    window.startDrag = function startDrag(e) {
        if (e.target.closest('#image-nav') || e.target.closest('button')) return;
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
        workspace.style.cursor = 'grabbing';
    };

    window.drag = function drag(e) {
        if (!isDragging) return;
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        updateTransform();
    };

    window.endDrag = function endDrag() {
        isDragging = false;
        workspace.style.cursor = 'grab';
    };

    window.toggleNotes = function toggleNotes(force) {
        notesOpen = typeof force === 'boolean' ? force : !notesOpen;
        notesPanel.classList.toggle('open', notesOpen);
        document.getElementById('toggle-notes-label').textContent = notesOpen ? '收起笔记' : '展开笔记';
        if (notesOpen && window.MathJax && MathJax.typesetPromise) {
            MathJax.typesetPromise([notesContent]);
        }
        setTimeout(window.fitToView, 320);
    };

    workspace.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = workspace.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const canvasX = (mouseX - offsetX) / scale;
        const canvasY = (mouseY - offsetY) / scale;
        const factor = e.deltaY < 0 ? 1.12 : 0.89;
        scale = Math.min(Math.max(scale * factor, minFitScale * 0.25), 12);
        offsetX = mouseX - canvasX * scale;
        offsetY = mouseY - canvasY * scale;
        updateTransform();
    }, { passive: false });

    window.addEventListener('resize', () => window.fitToView());

    function renderNotes() {
        if (!config.sections || !config.sections.length) return;
        notesContent.innerHTML = config.sections.map(s => `
            <section class="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
                <h3 class="text-sm font-bold text-white mb-2 pb-1 border-b border-slate-700/50">${s.title}</h3>
                <div>${parseDetailMarkdown(s.body)}</div>
            </section>
        `).join('');
        toggleNotesBtn.classList.remove('hidden');
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(src));
            img.src = src;
        });
    }

    function renderImageNav(items) {
        if (items.length <= 1) return;
        imageNav.innerHTML = items.map((item, i) => `
            <button type="button" onclick="focusBlock(${i})"
                class="text-left text-[10px] px-2 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white transition truncate">
                ${i + 1}. ${item.title || '导图 ' + (i + 1)}
            </button>
        `).join('');
        imageNav.classList.remove('hidden');
    }

    async function buildCanvas(items) {
        canvas.innerHTML = '';
        imageBlocks.length = 0;
        const gap = 56;
        const padX = 40;
        let y = 40;
        let maxW = 0;
        const loaded = await Promise.all(items.map(item => loadImage(item.src)));

        loaded.forEach((imgEl, i) => {
            const item = items[i];
            const block = document.createElement('div');
            block.className = 'mindmap-block';
            block.style.top = `${y}px`;
            block.style.left = `${padX}px`;

            if (item.title) {
                const label = document.createElement('div');
                label.className = 'mindmap-label';
                label.textContent = item.title;
                block.appendChild(label);
            }

            imgEl.className = 'mindmap-img-item';
            imgEl.alt = item.title || config.title;
            imgEl.draggable = false;
            block.appendChild(imgEl);
            canvas.appendChild(block);

            const labelH = item.title ? 36 : 0;
            const bw = imgEl.naturalWidth;
            const bh = labelH + imgEl.naturalHeight;
            maxW = Math.max(maxW, bw);
            imageBlocks.push({ x: padX, y, width: bw, height: bh, el: block });
            y += bh + gap;
        });

        contentWidth = maxW + padX * 2;
        contentHeight = y - gap + 40;
        canvas.style.width = `${contentWidth}px`;
        canvas.style.height = `${contentHeight}px`;
    }

    function showError(msg) {
        loading.classList.add('hidden');
        errorEl.classList.remove('hidden');
        document.getElementById('error-text').textContent = msg;
    }

    async function run() {
        if (!config) {
            showError('未配置 PAGE_CONFIG');
            return;
        }
        const items = getDetailImages(config);
        if (!items.length) {
            showError('请在 PAGE_CONFIG.images 中添加导图图片');
            return;
        }

        document.title = config.title + ' · 详细导图';
        document.getElementById('page-title').textContent = config.title;
        const countHint = items.length > 1 ? `共 ${items.length} 张 · ` : '';
        document.getElementById('page-subtitle').textContent = countHint + (config.subtitle || '详细思维导图');
        renderNotes();
        renderImageNav(items);

        try {
            await buildCanvas(items);
            loading.classList.add('hidden');
            window.fitToView();
            if (window.MathJax && MathJax.typesetPromise) {
                MathJax.typesetPromise([notesContent]).catch(() => {});
            }
        } catch (err) {
            showError('图片加载失败：' + err.message);
        }
    }

    run();
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.PAGE_CONFIG) {
        initDetailViewer(window.PAGE_CONFIG);
    }
});
