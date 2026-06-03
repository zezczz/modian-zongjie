/** 总览导图数据 — 仅维护章节坐标与连线 */
(function () {
    const W = 220, H = 88;
    const root = { id: 'root', x: 500, y: 300, w: 240, h: 72 };

    const chapters = [
        { id: 'grp01', detailId: 'ch01', label: 'Ch1 导论 [了解]', color: '1', x: 40, y: 260 },
        { id: 'grp02', detailId: 'ch02', label: 'Ch2 运放 [必考]', color: '2', x: 300, y: 60 },
        { id: 'grp03', detailId: 'ch03', label: 'Ch3 二极管 [必考]', color: '3', x: 520, y: 60 },
        { id: 'grp04', detailId: 'ch45', label: 'Ch4-5 晶体管 [必考]', color: '4', x: 740, y: 60 },
        { id: 'grp06', detailId: 'ch06', label: 'Ch6 频响 [重点]', color: '1', x: 960, y: 200 },
        { id: 'grp07', detailId: 'ch79', label: 'Ch7-9 差放·功放 [必考]', color: '2', x: 500, y: 480 },
        { id: 'grp08', detailId: 'ch08', label: 'Ch8 反馈 [必考]', color: '3', x: 500, y: 620 },
        { id: 'grp10', detailId: 'ch10', label: 'Ch10 信号 [重点]', color: '6', x: 40, y: 420 },
        { id: 'grp11', detailId: 'ch11', label: 'Ch11 电源 [重点]', color: '5', x: 40, y: 580 }
    ];

    const idMap = {
        root: 'root00000000000001',
        grp01: 'grp00000000000001', grp02: 'grp00000000000002', grp03: 'grp00000000000003',
        grp04: 'grp00000000000004', grp06: 'grp00000000000006', grp07: 'grp00000000000007',
        grp08: 'grp00000000000008', grp10: 'grp00000000000010', grp11: 'grp00000000000011'
    };

    const edges = [
        ['root', 'top', 'grp02', 'bottom'],
        ['root', 'top', 'grp03', 'bottom'],
        ['root', 'top', 'grp04', 'bottom'],
        ['root', 'right', 'grp06', 'left', '器件频响'],
        ['root', 'bottom', 'grp07', 'top'],
        ['root', 'left', 'grp01', 'right'],
        ['grp01', 'bottom', 'grp10', 'top'],
        ['grp10', 'bottom', 'grp11', 'top', '信号→电源'],
        ['grp02', 'bottom', 'grp07', 'top', '集成运放'],
        ['grp03', 'right', 'grp04', 'left', '→晶体管'],
        ['grp03', 'right', 'grp06', 'left'],
        ['grp04', 'bottom', 'grp07', 'right', '放大电路'],
        ['grp07', 'bottom', 'grp08', 'top', '负反馈'],
        ['grp08', 'left', 'grp10', 'right', '振荡比较']
    ];

    const nodes = [
        {
            id: idMap.root, type: 'text',
            text: '# 模拟电子技术基础\n\n全11章脉络总览',
            x: root.x, y: root.y, width: root.w, height: root.h, color: '5'
        },
        ...chapters.map(c => ({
            id: idMap[c.id], type: 'group', detailId: c.detailId,
            label: c.label, x: c.x, y: c.y, width: W, height: H, color: c.color
        }))
    ];

    window.mapData = {
        nodes,
        edges: edges.map(([from, fs, to, ts, label], i) => ({
            id: 'e' + i,
            fromNode: idMap[from], fromSide: fs,
            toNode: idMap[to], toSide: ts,
            ...(label ? { label } : {})
        }))
    };
})();
