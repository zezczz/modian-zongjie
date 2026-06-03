/** 总览画布：平移、缩放、章节导航 */
(function () {
    const palette = {
        1: { bg: 'bg-teal-950/30', border: 'border-teal-700/50', text: 'text-teal-300' },
        2: { bg: 'bg-sky-950/30', border: 'border-sky-700/50', text: 'text-sky-300' },
        3: { bg: 'bg-orange-950/30', border: 'border-orange-700/50', text: 'text-orange-300' },
        4: { bg: 'bg-purple-950/30', border: 'border-purple-700/50', text: 'text-purple-300' },
        5: { bg: 'bg-indigo-950/30', border: 'border-indigo-700/50', text: 'text-indigo-300' },
        6: { bg: 'bg-rose-950/30', border: 'border-rose-700/50', text: 'text-rose-300' }
    };

    const state = { scale: 0.5, ox: 0, oy: 0, drag: false, sx: 0, sy: 0 };
    const workspace = document.getElementById('workspace');
    const canvas = document.getElementById('canvas');
    const svg = document.getElementById('svg-edges');

    function tagOf(node) {
        const s = node.label || node.text || '';
        if (s.includes('必考')) return '必考';
        if (s.includes('重点')) return '重点';
        if (s.includes('高频')) return '高频';
        return '';
    }

    function bounds() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        mapData.nodes.forEach(n => {
            minX = Math.min(minX, n.x);
            minY = Math.min(minY, n.y);
            maxX = Math.max(maxX, n.x + (n.width || 220));
            maxY = Math.max(maxY, n.y + (n.height || 88));
        });
        return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
    }

    function fitView(pad = 48) {
        const b = bounds();
        const vw = workspace.clientWidth, vh = workspace.clientHeight;
        const s = Math.min((vw - pad * 2) / b.w, (vh - pad * 2) / b.h, 1.2);
        state.scale = Math.max(s, 0.1);
        const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
        state.ox = vw / 2 - cx * state.scale;
        state.oy = vh / 2 - cy * state.scale;
        applyTransform();
    }

    function applyTransform() {
        const t = `translate(${state.ox}px,${state.oy}px) scale(${state.scale})`;
        canvas.style.transform = t;
        svg.style.transform = t;
    }

    function resizeCanvas() {
        const b = bounds(), pad = 80;
        const w = Math.ceil(b.w + pad * 2), h = Math.ceil(b.h + pad * 2);
        canvas.style.width = svg.style.width = w + 'px';
        canvas.style.height = svg.style.height = h + 'px';
    }

    function anchor(node, side) {
        const hw = (node.width || 220) / 2, hh = (node.height || 88) / 2;
        const cx = node.x + hw, cy = node.y + hh;
        return { top: [cx, node.y], bottom: [cx, node.y + hh * 2], left: [node.x, cy], right: [node.x + hw * 2, cy] }[side] || [cx, cy];
    }

    function drawEdges() {
        const defs = `<defs><marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 1 L10 5 L0 9z" fill="#64748b"/></marker></defs>`;
        const paths = mapData.edges.map(e => {
            const a = mapData.nodes.find(n => n.id === e.fromNode);
            const b = mapData.nodes.find(n => n.id === e.toNode);
            if (!a || !b) return '';
            const [x1, y1] = anchor(a, e.fromSide || 'bottom');
            const [x2, y2] = anchor(b, e.toSide || 'top');
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            const d = `M${x1} ${y1} Q${mx} ${y1} ${mx} ${my} T${x2} ${y2}`;
            const label = e.label ? `<text x="${mx}" y="${my - 6}" fill="#94a3b8" font-size="10" text-anchor="middle">${e.label}</text>` : '';
            return `<path d="${d}" fill="none" stroke="#475569" stroke-width="1.5" marker-end="url(#arrow)"/>${label}`;
        }).join('');
        svg.innerHTML = defs + paths;
    }

    function openChapter(node) {
        const id = getDetailIdForNode(node);
        if (id) openDetailPage(id);
    }

    function render() {
        canvas.innerHTML = '';
        mapData.nodes.forEach(n => {
            if (n.type === 'text') {
                const el = document.createElement('div');
                el.className = 'root-card absolute pointer-events-none';
                el.style.cssText = `left:${n.x}px;top:${n.y}px;width:${n.width}px;min-height:${n.height}px`;
                const lines = n.text.split('\n');
                el.innerHTML = `<h2>${lines[0].replace(/^#\s*/, '')}</h2><p>${lines[1] || ''}</p>`;
                canvas.appendChild(el);
                return;
            }
            const pal = palette[n.color] || palette[1];
            const canOpen = !!getDetailIdForNode(n);
            const el = document.createElement('div');
            el.id = n.id;
            el.className = `chapter-box absolute rounded-2xl border-2 backdrop-blur-sm p-4 flex flex-col justify-center pointer-events-auto ${pal.bg} ${pal.border} ${canOpen ? 'can-open' : ''}`;
            el.style.cssText = `left:${n.x}px;top:${n.y}px;width:${n.width}px;height:${n.height}px`;
            el.dataset.tag = tagOf(n);
            el.innerHTML = `
                <div class="font-bold text-sm ${pal.text}">${n.label.replace(/\s*\[[^\]]+\]\s*$/, '')}</div>
                <div class="text-[10px] text-slate-500 mt-1">${(n.label.match(/\[([^\]]+)\]/) || [])[1] || ''}</div>
                ${canOpen ? '<div class="open-hint"><i class="fa-solid fa-arrow-up-right-from-square"></i> 详细导图</div>' : ''}`;
            if (canOpen) el.onclick = () => openChapter(n);
            canvas.appendChild(el);
        });
        resizeCanvas();
        drawEdges();
    }

    function renderSidebar() {
        const list = document.getElementById('chapter-list');
        list.innerHTML = mapData.nodes.filter(n => n.type === 'group').map(n => {
            const short = n.label.split(/\s+/)[0];
            const tag = (n.label.match(/\[(.+?)\]/) || [])[1] || '';
            return `<button type="button" data-id="${n.id}" class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-left text-xs transition">
                <span class="font-semibold text-slate-200">${short}</span>
                <span class="block text-[10px] text-slate-500 mt-0.5">${tag}</span>
            </button>`;
        }).join('');
        list.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                const node = mapData.nodes.find(n => n.id === btn.dataset.id);
                if (node) openChapter(node);
            };
        });
    }

    window.resetView = fitView;
    window.zoom = function (f) {
        state.scale = Math.min(Math.max(state.scale * f, 0.08), 2.5);
        applyTransform();
    };
    window.startDrag = function (e) {
        if (e.target.closest('.chapter-box')) return;
        state.drag = true;
        state.sx = e.clientX - state.ox;
        state.sy = e.clientY - state.oy;
        workspace.classList.add('dragging');
    };
    window.drag = function (e) {
        if (!state.drag) return;
        state.ox = e.clientX - state.sx;
        state.oy = e.clientY - state.sy;
        applyTransform();
    };
    window.endDrag = function () {
        state.drag = false;
        workspace.classList.remove('dragging');
    };

    workspace.addEventListener('wheel', e => {
        e.preventDefault();
        const r = workspace.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        const cx = (mx - state.ox) / state.scale, cy = (my - state.oy) / state.scale;
        state.scale *= e.deltaY < 0 ? 1.1 : 0.9;
        state.scale = Math.min(Math.max(state.scale, 0.08), 2.5);
        state.ox = mx - cx * state.scale;
        state.oy = my - cy * state.scale;
        applyTransform();
    }, { passive: false });

    window.addEventListener('resize', () => { clearTimeout(window._rt); window._rt = setTimeout(fitView, 120); });

    render();
    renderSidebar();
    fitView();
})();
