function getDetailImages(config) {
    if (!config) return [];
    if (Array.isArray(config.images) && config.images.length) return config.images;
    if (config.image) return [{ src: config.image, title: config.title }];
    return [];
}

function parseDetailMarkdown(text) {
    if (!text) return '';
    let html = text;
    html = html.replace(/^###\s+(.*)$/gm, '<h4 class="text-sm font-bold text-slate-200 mt-3 mb-1">$1</h4>');
    html = html.replace(/^##\s+(.*)$/gm, '<h3 class="text-base font-bold text-white border-b border-slate-700/50 pb-1 mb-2 mt-4 first:mt-0">$1</h3>');
    html = html.replace(/^>\s+(.*)$/gm, '<div class="mt-2 p-2 bg-amber-500/10 border-l-2 border-amber-500 text-amber-200 text-sm rounded-r">$1</div>');
    html = html.replace(/^\s*[·•*-]\s+(.*)$/gm, '<li class="ml-4 list-disc text-slate-300 text-sm">$1</li>');
    html = html.split('\n').join('<br>');
    return html;
}
