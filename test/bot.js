// Bot tự chơi (chạy TRONG trang): BFS trên bản đồ thật, bấm đúng các nút DOM như người chơi, trả lời sai theo xác suất wrongRate.
module.exports = function botFactory(opts) {
  opts = Object.assign({ wrongRate: 0.35 }, opts || {});
  const bot = { frames: 0, log: [], stuck: null, answered: 0, wrong: 0, battles: 0, shots: {}, menuPlan: null, lastSig: '', lastChange: 0, goalName: '' };
  const S = () => G.S, Wd = G.Wd;
  const DIRS = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
  const SOLIDC = '#RW~';
  const mapNpcs = id => { const m = G.MAPS[id]; if (id === S().map) return Wd.npcs; const tk = S().taken[id] || {}; return m.npcs.filter(n => !(n.kind === 'item' && tk[n.id])); };
  function bfs(goalFn, allowDoor1) {
    const s0 = [S().map, S().x, S().y], key = (m, x, y) => m + ':' + x + ',' + y, prev = new Map([[key(...s0), null]]), q = [s0];
    while (q.length) {
      const [m, x, y] = q.shift();
      if (goalFn(m, x, y)) { const path = []; let k = key(m, x, y); while (k) { const p = prev.get(k); path.push(k); k = p && p.k; } return path.reverse(); }
      const M = G.MAPS[m], npcs = mapNpcs(m);
      for (const d of ['u', 'd', 'l', 'r']) {
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
        if (nx < 0 || ny < 0 || nx >= M.w || ny >= M.h) continue;
        const c = M.rows[ny][nx]; if (SOLIDC.includes(c)) continue;
        if ((c === '2' || c === '3') || (c === '1' && !allowDoor1)) continue;
        const npc = npcs.find(n => n.x === nx && n.y === ny);
        if (npc && !goalFn(m, nx, ny)) continue;
        let tm = m, tx = nx, ty = ny; const w = M.warps[nx + ',' + ny];
        if (w) { tm = w.map; tx = w.x; ty = w.y; }
        const k2 = key(tm, tx, ty); if (prev.has(k2)) continue;
        prev.set(k2, { k: key(m, x, y), d, from: [x, y], m }); q.push([tm, tx, ty]);
      }
    }
    return null;
  }
  // trả về hướng đi đầu tiên tới đích
  function firstDir(goalFn, allowDoor1) {
    const path = bfs(goalFn, allowDoor1); if (!path || path.length < 2) return null;
    const [m1, c1] = path[1].split(':'), [x1, y1] = c1.split(',').map(Number);
    // tìm hướng từ ô hiện tại tới ô tiếp theo (kể cả warp)
    const cur = [S().x, S().y];
    for (const d of ['u', 'd', 'l', 'r']) { const nx = cur[0] + DIRS[d][0], ny = cur[1] + DIRS[d][1]; const M = G.MAPS[S().map]; const w = M.warps[nx + ',' + ny]; if (w ? (w.map === m1 && w.x === x1 && w.y === y1) : (m1 === S().map && nx === x1 && ny === y1)) return d; }
    return null;
  }
  function holdDir(d) { for (const k of ['u', 'd', 'l', 'r']) G.Inp.held[k] = k === d ? 1 : 0; }
  const buttons = sel => [...document.querySelectorAll(sel)];
  const need = () => G.CH && (Math.min(60, [4, 10, 16, 22, 28, 34, 40, 46][S().cur] + 5));
  const hpFrac = () => { const p = S().party; return p.length ? p.reduce((a, m) => a + m.hp / (18 + m.lv * 4), 0) / p.length : 1; };

  function answerQuiz() {
    const c = G.Quiz.cur; if (!c || c.st.done) return;
    bot.answered++;
    const wrong = G.rand() < opts.wrongRate; if (wrong) bot.wrong++;
    let idx = c.cidx; if (wrong) idx = [0, 1, 2, 3].filter(i => i !== c.cidx)[Math.floor(G.rand() * 3)];
    document.querySelector(`.ch[data-i="${idx}"]`).click();
  }
  function handleChoose() {
    const m = document.getElementById('bmenu'), btns = [...m.querySelectorAll('.mb')], title = (m.querySelector('.ti') || {}).textContent || '';
    const en = btns.filter(b => !b.disabled), txt = b => b.textContent;
    const click = b => { if (b) b.click(); };
    if (/Chọn Tideling đầu tiên/.test(title)) return click(btns[bot.starterPick || 0]);
    if (/Xác nhận/.test(title)) return click(btns[0]);
    if (/Chọn chiêu/.test(title)) { const mv = en.filter(b => !/Quay lại/.test(txt(b))); return click(mv[mv.length - 1] || en[0]); }
    if (/Mua gì/.test(title)) return click(btns[btns.length - 1]);
    if (/Chọn lưới/.test(title)) return click(btns[0]);
    if (/Đổi sang|Chọn Tideling tiếp/.test(title)) return click(en[0]);
    if (/Làm gì/.test(title)) {
      const foe = G.S && document.querySelector('#hud .hb'); const wild = bot.curWild;
      const fruit = en.find(b => /Tidefruit/.test(txt(b))), net = en.find(b => /Lưới/.test(txt(b))), fight = en.find(b => /Chiêu/.test(txt(b)));
      const lead = S().party.find(x => x.hp > 0);
      if (lead && lead.hp / (18 + lead.lv * 4) < 0.35 && fruit) return click(fruit);
      if (net && !S().flags.caught0 && S().cur === 0 && G.B.foe && G.B.foe.hp / (18 + G.B.foe.lv * 4) < 0.5) return click(net);
      return click(fight);
    }
    // sensei: [Luyện tập, Để sau]
    if (btns.some(b => /Luyện tập 3 câu/.test(txt(b)))) return click(btns[0]);
    return click(en[0]);
  }
  function modalAct() {
    const mod = document.getElementById('modal');
    if (bot.menuPlan && bot.menuPlan.length) {
      const [kind, arg] = bot.menuPlan[0];
      const el = kind === 'k' ? mod.querySelector(`[data-k="${arg}"]`) : mod.querySelector(`.isl[data-i="${arg}"]`);
      if (el) { bot.menuPlan.shift(); if (!bot.menuPlan.length) bot.menuPlan = null; el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
      bot.menuPlan = null;
    }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  }
  function plan() { // chọn mục tiêu & điều hướng
    const s = S(), i = s.cur, here = G.MAPS[s.map];
    if (G.busy()) return;
    if (i === 0 && !s.flags.starter) return;
    const needHeal = hpFrac() < 0.5 && s.bag.fruit < 1;
    const sensei = Wd.npcs.find(n => n.kind === 'sensei');
    let goal, name;
    if (needHeal || (hpFrac() < 0.3)) {
      name = 'heal'; goal = (m, x, y) => m === `i${i}_town` && G.MAPS[m].rows[y][x] === '1';
      const d = firstDir(goal, true); if (d) return move(d, name);
    }
    if (!s.flags['drill' + i] && sensei) {
      name = 'drill';
      const goalAdj = (m, x, y) => m === `i${i}_town` && Math.abs(x - 5) + Math.abs(y - 6) === 1;
      if (Math.abs(s.x - 5) + Math.abs(s.y - 6) === 1 && s.map === `i${i}_town`) { // quay mặt về sensei rồi bấm A
        const dx = 5 - s.x, dy = 6 - s.y, d = dx > 0 ? 'r' : dx < 0 ? 'l' : dy > 0 ? 'd' : 'u';
        holdDir(d); G.Inp.a = 1; bot.goalName = name; return;
      }
      const d = firstDir(goalAdj); if (d) return move(d, name);
    }
    const lead = Math.max(...s.party.map(m => m.lv));
    const ready = lead >= need() && (i !== 0 || s.flags.caught0);
    if (!s.flags['boss' + i]) {
      if (!ready) { // luyện cấp trong cỏ cao ở đường mòn
        name = 'grind';
        const rid = `i${i}_route`;
        if (s.map === rid && Wd.mv === 0 && here.rows[s.y][s.x] === 'g') { // đi qua lại giữa 2 ô cỏ
          const opts_ = ['u', 'd', 'l', 'r'].filter(d => { const nx = s.x + DIRS[d][0], ny = s.y + DIRS[d][1]; return here.rows[ny] && here.rows[ny][nx] === 'g' && !Wd.npcs.some(n => n.x === nx && n.y === ny); });
          if (opts_.length) return move(opts_[Math.floor(G.rand() * opts_.length)], name);
        }
        const d = firstDir((m, x, y) => m === rid && G.MAPS[m].rows[y][x] === 'g' && !(y < 4)); if (d) return move(d, name);
      } else {
        name = 'boss';
        const gid = `i${i}_gym`, d = firstDir((m, x, y) => m === gid && x === 6 && y === 3); if (d) return move(d, name);
        // đã ở (6,3): quay lên bấm A nói chuyện với boss
        if (s.map === gid && s.x === 6 && s.y === 3) { holdDir('u'); G.Inp.a = 1; return; }
      }
    } else if (i < 7) {
      name = 'sail'; holdDir(null);
      if (!bot.menuPlan) bot.menuPlan = [['k', 'sea'], ['i', i + 1], ['k', 'sail']];
      G.Inp.m = 1; bot.goalName = name; bot.menuTries = (bot.menuTries || 0) + 1; return;
    }
  }
  function move(d, name) { bot.goalName = name; holdDir(d); }
  bot.step = function () {
    bot.frames++;
    G.sim(1);
    const ui = G.ui(), mode = G.mode;
    if (ui === 'quiz') return answerQuiz();
    if (ui === 'explain') { document.getElementById('qnext').click(); return; }
    if (ui === 'choose') { holdDir(null); return handleChoose(); }
    if (ui === 'dialog') { holdDir(null); G.Inp.a = 1; return; }
    if (ui === 'modal') return modalAct();
    if (ui === 'script') { holdDir(null); return; }
    if (mode === 'world') { if (bot.idle) { holdDir(null); G.Inp.m = 0; } else plan(); }
  };
  bot.sig = () => { const s = S(); return [s.map, s.x, s.y, G.ui(), s.qCount, s.party.map(m => m.lv + ':' + m.hp).join(), s.pearls, Object.keys(s.flags).length].join('|'); };
  /* chạy tối đa maxFrames hoặc tới khi cond() đúng; phát hiện kẹt */
  bot.run = function (maxFrames, cond) {
    for (let f = 0; f < maxFrames; f++) {
      bot.step();
      if (G.errors.length) return { status: 'error', errors: G.errors.slice(0, 3) };
      if (f % 50 === 0) { const sg = bot.sig(); if (sg !== bot.lastSig) { bot.lastSig = sg; bot.lastChange = bot.frames; } else if (bot.frames - bot.lastChange > 4000) return { status: 'stuck', sig: sg, goal: bot.goalName }; }
      if (cond && cond()) return { status: 'done' };
    }
    return { status: 'budget' };
  };
  bot.summary = () => { const s = S(); return { frames: bot.frames, answered: bot.answered, wrong: bot.wrong, wrongPct: bot.answered ? Math.round(bot.wrong / bot.answered * 100) : 0, cur: s.cur, maxCh: s.maxCh, lv: s.party.map(m => m.lv), party: s.party.length, caught: Object.keys(s.caught).length, pearls: s.pearls, leit: Object.keys(s.leit).length, pend: s.pend.length, flags: Object.keys(s.flags).join(',') }; };
  return bot;
};
