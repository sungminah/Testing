// Chạy: node test/run.js [--full]   (cần ./build.sh trước; `npm test` làm cả hai)
const fs = require('fs'), path = require('path');
const { open } = require('./lib'), validate = require('./validate'), botFactory = require('./bot');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const FULL = process.argv.includes('--full');
let failed = 0; const ok = (c, m) => { console.log((c ? '  ✔ ' : '  ✘ ') + m); if (!c) failed++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const t0 = Date.now();
  const { browser, page, errs } = await open({ viewport: { width: 960, height: 720 } });
  console.log('1) Kiểm tra dữ liệu');
  const v = await page.evaluate(`(${validate.toString()})()`);
  console.log('   ', JSON.stringify(v.info));
  v.errors.slice(0, 30).forEach(e => console.log('    - ' + e));
  ok(v.errors.length === 0, `dữ liệu hợp lệ (${v.errors.length} lỗi)`);
  await page.evaluate('G.step(5)'); await page.screenshot({ path: path.join(OUT, '00-title.png') });

  console.log('2) Bot tự chơi chương 1 (trả lời sai ~35%)');
  await page.evaluate('G.seed(20240229)'); // bot & game dùng chung RNG có hạt giống → chạy lại được
  await page.click('#bt-new');
  await page.evaluate(`window.__bot=(${botFactory.toString()})({wrongRate:0.35})`);
  const want = { quiz: '10-quiz', explainNg: '11-explain-wrong', explainOk: '12-explain-correct', choose: '13-battle-menu', dialog: '14-dialog', world: '15-world', sea: '16-sea' };
  const got = {}; const shot = async k => { if (got[k]) return; got[k] = 1; await page.evaluate('G.drawNow()'); await page.screenshot({ path: path.join(OUT, want[k] + '.png') }); };
  let res = null, rounds = 0;
  const cond = `(()=>{const u=G.ui();const m=document.getElementById('modal');
    if(u==='quiz')return 'quiz'; if(u==='explain')return m.querySelector('.res.ng')?'explainNg':'explainOk';
    if(u==='choose'&&G.mode==='battle'&&!window.__got_choose)return 'choose'; if(u==='dialog')return 'dialog'; if(u==='world'&&G.S.flags.starter)return 'world';
    if(m.querySelector('#sea'))return 'sea'; return null;})()`;
  while (rounds++ < 4000) {
    res = await page.evaluate(`(()=>{ const b=window.__bot; const r=b.run(400,()=>{ const k=${cond}; if(k&&!(window.__seen=window.__seen||{})[k]){window.__seen[k]=1; window.__hit=k; return true;} return false; }); return {r, hit:window.__hit}; })()`);
    if (res.r.status === 'done' && res.hit) { await shot(res.hit); await page.evaluate('window.__hit=null'); if (res.hit === 'choose') await page.evaluate('window.__got_choose=1'); continue; }
    if (res.r.status === 'stuck' || res.r.status === 'error') break;
    const s = await page.evaluate('G.S.flags.boss0?1:0'); if (s) break;
    if (rounds % 20 === 0) console.log('   …', JSON.stringify(await page.evaluate('__bot.summary()')));
  }
  const sum = await page.evaluate('__bot.summary()');
  console.log('   tóm tắt:', JSON.stringify(sum), 'status:', res && res.r.status);
  ok(sum.flags.includes('boss0'), 'bot đánh bại boss chương 1');
  ok(res && res.r.status !== 'stuck' && res.r.status !== 'error', 'không kẹt, không lỗi (' + (res && res.r.status) + ')');
  ok(sum.maxCh >= 1, 'đảo 2 được mở khoá');
  ok(sum.caught >= 2, 'bắt được thêm Tideling (' + sum.caught + ')');
  ok(sum.answered < 30 || (sum.wrongPct > 15 && sum.wrongPct < 55), 'tỉ lệ sai ~35% (' + sum.wrongPct + '% / ' + sum.answered + ' câu)');
  ok(sum.pend >= 0 && sum.leit > 10, 'Leitner ghi nhận ' + sum.leit + ' câu');
  const hist = await page.evaluate(`(()=>{const q=Object.values(G.S.leit);return {total:q.length, reasked:q.filter(r=>r.seen>1).length}})()`);
  ok(hist.reasked > 0, 'có câu được hỏi lại sau khi sai (' + hist.reasked + ')');

  console.log('3) Giao diện: menu, hải đồ, sổ Tideling, tiến độ');
  const clickStep = async sel => { await page.click(sel); await page.evaluate('G.step(6)'); };
  await page.evaluate(`__bot.idle = true; __bot.menuPlan = null; __bot.run(4000, () => G.ui() === 'world' && !G.busy())`);
  await page.evaluate('G.step(30)');
  await page.keyboard.press('m'); await page.evaluate('G.step(6)');
  await page.screenshot({ path: path.join(OUT, '20-menu.png') });
  for (const [k, f] of [['party', '21-party'], ['dex', '22-dex'], ['prog', '23-progress'], ['journal', '24-journal'], ['sea', '25-sea']]) {
    await clickStep(`[data-k="${k}"]`); await page.screenshot({ path: path.join(OUT, f + '.png'), fullPage: false });
    if (k === 'sea') { await page.click('.isl[data-i="2"]'); await page.evaluate('G.step(3)'); await page.screenshot({ path: path.join(OUT, '26-sea-locked.png') }); await page.click('.isl[data-i="1"]'); await page.evaluate('G.step(3)'); }
    await page.keyboard.press('Escape'); await page.evaluate('G.step(6)');
  }
  const modalOpen = await page.evaluate('!document.getElementById("modal").hidden');
  if (modalOpen) { await page.keyboard.press('Escape'); await page.evaluate('G.step(6)'); }
  ok(!(await page.evaluate('!document.getElementById("modal").hidden')), 'menu đóng được bằng Esc');
  ok((await page.evaluate('G.errors')).length === 0 && errs.length === 0, 'không có lỗi JS: ' + JSON.stringify(errs.concat(await page.evaluate('G.errors'))).slice(0, 300));

  console.log('3b) Hải đồ: đi tàu bằng giao diện, lối tắt & điều kiện');
  const sail = await page.evaluate(`(()=>{ __bot.idle=false; const r=__bot.run(4000, ()=>G.S.cur===1 && G.ui()==='world' && !G.busy()); return {r:r.status, cur:G.S.cur, map:G.S.map}; })()`);
  ok(sail.cur === 1 && /^i1_/.test(sail.map), 'bot ra khơi tới Đảo San Hô qua Hải đồ (' + JSON.stringify(sail) + ')');
  const sea = await page.evaluate(`(()=>{ const bak=JSON.stringify(G.S), S=G.S, r={};
    S.maxCh=7; S.cur=0; S.sc={}; S.items={};
    r.adj=canSail(1); r.far=canSail(2); S.sc.root=1; r.short=canSail(2); S.cur=2; r.rev=canSail(0); S.cur=0; S.maxCh=1; r.locked=canSail(2); S.maxCh=7;
    r.item1=scCond(SHORTCUTS[1]).ok; S.items.buoy=1; r.item2=scCond(SHORTCUTS[1]).ok; r.dex=scCond(SHORTCUTS[2]).ok; r.lv=scCond(SHORTCUTS[4]).ok;
    Object.assign(G.S, JSON.parse(bak)); return r; })()`);
  ok(sea.adj && !sea.far && sea.short && sea.rev && !sea.locked, 'đi tàu: kề nhau được, xa thì cần lối tắt, đảo khoá không đi được ' + JSON.stringify(sea));
  ok(!sea.item1 && sea.item2 && !sea.dex, 'điều kiện lối tắt (vật phẩm / sổ Tideling) hoạt động');
  console.log('3c) Lưu & tiếp tục');
  await page.evaluate('save()'); const before = await page.evaluate('JSON.stringify({c:G.S.cur,l:G.S.party.map(m=>m.lv),leit:Object.keys(G.S.leit).length})');
  await page.reload(); await page.evaluate('G.step(3)');
  const hasCont = await page.$('#bt-cont');
  if (!hasCont) console.log('   (bỏ qua: trình duyệt không giữ localStorage với file://)');
  else { await page.click('#bt-cont'); await page.evaluate('G.step(5)'); const after = await page.evaluate('JSON.stringify({c:G.S.cur,l:G.S.party.map(m=>m.lv),leit:Object.keys(G.S.leit).length})'); ok(before === after, 'bản lưu khôi phục đúng ' + after); }
  console.log('3d) Trạm y tế, cửa hàng, nhặt đồ, tiến hoá, whiteout');
  await page.evaluate(`window.__bot2=(${botFactory.toString()})({wrongRate:0})`);
  const drive = async (cond, max = 3000) => page.evaluate(`(()=>{ for(let i=0;i<${max};i++){ if(${cond}) return true; if(G.ui()==='dialog') G.Inp.a=1; G.sim(1); } return false; })()`);
  const base = await page.evaluate('(()=>{ loadMap("i1_town", 3, 4, "u"); const m=G.S.party[0]; m.hp=1; G.S.pearls=100; return G.S.bag.net; })()');
  await page.evaluate('loadMap("i1_clinic", 5, 3, "u"); G.run(()=>nurse(G.Wd.npcs.find(n=>n.kind==="nurse")))'); await drive('!G.busy()');
  ok(await page.evaluate('G.S.party.every(m=>m.hp===18+m.lv*4)'), 'trạm y tế hồi đầy HP');
  await page.evaluate('loadMap("i1_shop", 5, 3, "u"); G.run(()=>shopMenu(G.Wd.npcs.find(n=>n.kind==="shop")))');
  await drive(`G.ui()==='choose' && document.querySelector('#bmenu .ti')?.textContent.includes('Mua')`);
  await page.click('#bmenu .mb[data-i="0"]'); await drive("G.S.pearls===80 && G.ui()==='choose'", 200);
  ok(await page.evaluate(`G.S.bag.net===${base}+1 && G.S.pearls===80`), 'mua lưới: +1 lưới, -20 ngọc trai');
  await page.click('#bmenu .mb[data-i="3"]'); await drive('!G.busy()');
  await page.evaluate('loadMap("i1_route", 9, 18, "u")');
  const buoy = await page.evaluate('(()=>{ const n=G.Wd.npcs.find(x=>x.id==="item_buoy"); G.run(()=>pickup(n)); return !!n; })()'); await drive('!G.busy()');
  ok(buoy && await page.evaluate('G.S.items.buoy===1 && !G.Wd.npcs.some(x=>x.id==="item_buoy")'), 'nhặt "Dây phao" (vật phẩm lối tắt)');
  const evo = await page.evaluate('(()=>{ const m=newMon(0,11), out=[]; gainXp(m,300,out); return {lv:m.lv, form:m.form, out}; })()');
  ok(evo.form === 2 && evo.out.some(t => /tiến hoá/.test(t)), 'tiến hoá ở cấp ' + evo.lv + ': ' + evo.out.join(' | '));
  await page.evaluate('(()=>{ G.S.party.forEach(m=>m.hp=0); G.run(()=>whiteout()); })()'); await drive('!G.busy()');
  ok(await page.evaluate('G.S.party.every(m=>m.hp>0) && G.S.map==="i1_town"'), 'whiteout: hồi phục và về thị trấn');
  if (FULL) {
    console.log('4) Bot chơi tiếp qua cả 8 chương');
    await page.evaluate(`window.__bot=(${botFactory.toString()})({wrongRate:0.35})`);
    let r2, n = 0;
    while (n++ < 400) {
      r2 = await page.evaluate(`__bot.run(2500, ()=>G.S.flags.boss7)`);
      const s2 = await page.evaluate('__bot.summary()'); if (n % 10 === 0) console.log('   …', JSON.stringify(s2));
      if (r2.status !== 'budget') break;
    }
    const s3 = await page.evaluate('__bot.summary()'); console.log('   ', JSON.stringify(s3), r2.status);
    ok(s3.flags.includes('boss7'), 'bot hoàn thành cả 8 chương');
    await page.screenshot({ path: path.join(OUT, '30-final.png') });
  }
  console.log('4b) Chỉ dùng bàn phím (không chuột)');
  {
    const k = await open({ viewport: { width: 960, height: 720 } });
    await k.page.evaluate('G.step(3)'); await k.page.keyboard.press('Enter'); await k.page.evaluate('G.step(60)');
    ok(await k.page.evaluate('G.mode==="world" && G.busy()'), 'Enter ở màn hình tiêu đề bắt đầu game');
    await k.page.evaluate(`(()=>{ for(let i=0;i<8000 && G.busy();i++){ const u=G.ui(); if(u==='dialog'||u==='choose') G.Inp.a=1; G.sim(1);} })()`);
    await k.page.evaluate('G.run(()=>Quiz.ask({area:"town"}))'); await k.page.evaluate('G.step(5)');
    await k.page.keyboard.press('ArrowDown'); await k.page.keyboard.press('ArrowDown'); await k.page.keyboard.press('Enter'); await k.page.evaluate('G.step(5)');
    ok(await k.page.evaluate('!!document.getElementById("qnext")'), 'mũi tên + Enter chọn đáp án → hiện giải thích');
    await k.page.keyboard.press('Enter'); await k.page.evaluate('G.step(10)');
    ok(await k.page.evaluate('document.getElementById("modal").hidden'), 'Enter đóng bảng giải thích');
    await k.page.evaluate('G.sim(60)'); await k.page.keyboard.press('m'); await k.page.evaluate('G.step(5)');
    await k.page.keyboard.press('ArrowDown'); await k.page.keyboard.press('ArrowDown'); await k.page.keyboard.press('Enter'); await k.page.evaluate('G.step(5)');
    ok(await k.page.evaluate('!!document.querySelector("#modal h2") && /Túi đồ/.test(document.querySelector("#modal h2").textContent)'), 'menu: mũi tên + Enter mở Túi đồ');
    await k.page.keyboard.press('Escape'); await k.page.evaluate('G.step(5)');
    await k.browser.close();
  }
  console.log('5) Giao diện điện thoại (cảm ứng)');
  const m = await open({ viewport: { width: 390, height: 780 }, touch: true });
  await m.page.click('#bt-new'); await m.page.evaluate('G.step(40)');
  await m.page.screenshot({ path: path.join(OUT, '40-mobile.png') });
  const padVisible = await m.page.evaluate('getComputedStyle(document.getElementById("pad")).display!=="none"');
  ok(padVisible, 'có nút điều khiển cảm ứng trên điện thoại');
  const box = await m.page.evaluate('(()=>{const r=document.getElementById("screen").getBoundingClientRect();return [r.width,r.height,document.documentElement.scrollWidth,innerWidth]})()');
  ok(box[2] <= box[3], 'không cuộn ngang trên điện thoại ' + JSON.stringify(box));
  await m.browser.close(); await browser.close();
  console.log(`\n${failed ? '✘ ' + failed + ' kiểm tra thất bại' : '✔ Tất cả kiểm tra đạt'} (${((Date.now() - t0) / 1000).toFixed(0)}s). Ảnh: test/out/`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
