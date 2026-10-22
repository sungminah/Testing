#!/usr/bin/env python3
"""Dựng bản đồ cho các đảo 3–8 từ mô tả ngắn, tự kiểm tra (kích thước, đường đi, NPC) rồi in ra JS để dán vào src/js/39-islands.js.
Chạy: python3 tools/gen_islands.py > /tmp/islands.js"""
import sys, json
from collections import deque
SOLID=set('#RW~KLTPEoOFl')

class Grid:
    def __init__(s,w,h,fill='.'):
        s.w,s.h=w,h; s.g=[[fill]*w for _ in range(h)]
    def put(s,x,y,c):
        assert 0<=x<s.w and 0<=y<s.h,(x,y,c); s.g[y][x]=c
    def text(s,x,y,t):
        for i,c in enumerate(t): s.put(x+i,y,c)
    def rect(s,x,y,w,h,c):
        for yy in range(y,y+h):
            for xx in range(x,x+w): s.put(xx,yy,c)
    def border(s,c='#'):
        for x in range(s.w): s.put(x,0,c); s.put(x,s.h-1,c)
        for y in range(s.h): s.put(0,y,c); s.put(s.w-1,y,c)
    def house(s,x,y,door,wide=3):
        for i in range(wide): s.put(x+i,y,'R'); s.put(x+i,y+1,'W')
        if door: s.put(x+wide//2,y+1,door)
    def rows(s): return [''.join(r) for r in s.g]
    def find(s,c): return [(x,y) for y in range(s.h) for x in range(s.w) if s.g[y][x]==c]

def town(exit_x, houses, dock_x, deco, water_rows=3, shore='.', side='#'):
    g=Grid(24,16); g.border('#')
    for y in range(1,12):
        pass
    g.rect(0,12,24,1,'#'); g.rect(1,12,22,1,shore)
    g.rect(0,13,24,3,'~'); g.text(dock_x,13,'bb'); g.text(dock_x,14,'bb'); g.text(dock_x,15,'bb')
    g.text(exit_x,0,'UU')
    for x,d in houses: g.house(x,2,d)
    deco(g); return g

def route(w,h,gx,vx,feat):
    g=Grid(w,h); g.border('#')
    g.text(gx-2,1,'RRRRR'); g.text(gx-2,2,'WWGWW'); g.put(gx,2,'G')
    g.text(vx,h-1,'VV')
    feat(g); return g

def gym(w,h,vx,deco):
    g=Grid(w,h); g.border('#'); g.text(vx,h-1,'VV'); deco(g); return g

def bfs(rows, start, solid=SOLID, passable_extra=''):
    h=len(rows); w=len(rows[0]); seen={start}; q=deque([start])
    while q:
        x,y=q.popleft()
        for dx,dy in ((0,1),(1,0),(0,-1),(-1,0)):
            nx,ny=x+dx,y+dy
            if 0<=nx<w and 0<=ny<h and (nx,ny) not in seen and rows[ny][nx] not in solid:
                seen.add((nx,ny)); q.append((nx,ny))
    return seen

def arrival(rows,ch):
    w=len(rows[0]); t=None
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c==ch and t is None: t=(x,y)
    prefs=[(0,-1),(0,1),(1,0),(-1,0)] if ch=='V' else [(0,1),(0,-1),(1,0),(-1,0)]
    for dx,dy in prefs:
        x,y=t[0]+dx,t[1]+dy
        if 0<=y<len(rows) and 0<=x<w and rows[y][x] not in SOLID and rows[y][x] not in 'UVG123': return (x,y)
    raise Exception('no arrival '+ch)

def npos(a): return (a[2],a[3]) if a[0] in ('phrase','trainer') else (a[1],a[2])
def check(name, rows, start, npcs, kind):
    ws={len(r) for r in rows}; assert len(ws)==1,(name,'width',ws)
    seen=bfs(rows,start); ok=True
    for tag,pos in npcs:
        x,y=pos
        if rows[y][x] in SOLID: print('!!',name,tag,pos,'trên ô cứng',rows[y][x],file=sys.stderr); ok=False
        elif not any((x+dx,y+dy) in seen for dx,dy in ((0,1),(1,0),(0,-1),(-1,0))): print('!!',name,tag,pos,'không tới gần được',file=sys.stderr); ok=False
    for c in 'UVG123':
        for (x,y) in [(x,y) for y,r in enumerate(rows) for x,ch in enumerate(r) if ch==c]:
            if not any((x+dx,y+dy) in seen for dx,dy in ((0,1),(1,0),(0,-1),(-1,0))) and (x,y)!=start: print('!!',name,c,(x,y),'không tới được',file=sys.stderr); ok=False
    return ok

ISL={}
def emit(i,t,tdock,tnpcs,r,rnpcs,gy,gnpcs):
    tr,rr,gr=t.rows(),r.rows(),gy.rows()
    allok=True
    allok&=check(f'{i}.town',tr,tdock,[(k,npos(a)) for k,a in tnpcs],'town')
    allok&=check(f'{i}.route',rr,arrival(rr,'V'),[(k,npos(a)) for k,a in rnpcs],'route')
    allok&=check(f'{i}.gym',gr,arrival(gr,'V'),[(k,npos(a)) for k,a in gnpcs],'gym')
    # đường từ V của đường mòn tới cửa G
    seen=bfs(rr,arrival(rr,'V')); ga=arrival(rr,'G')
    if ga not in seen: print('!!',i,'route: không tới được cửa gym',file=sys.stderr); allok=False
    ISL[i]=dict(town=dict(rows=tr,dock=tdock,npcs=tnpcs),route=dict(rows=rr,npcs=rnpcs),gym=dict(rows=gr,npcs=gnpcs))
    return allok

# ======================= 3 · Xanh Lục: đồng hoa & trang trại =======================
def d3(g):
    g.rect(3,6,6,3,'f'); g.text(2,5,'FFFFFFFF'); g.text(2,9,'FFFFFFFF')
    for y in (6,7,8): g.put(2,y,'F')
    g.put(9,6,'F'); g.put(9,8,'F')
    g.text(15,8,'~~~~~~'); g.text(15,9,'~~~~~~'); g.text(15,10,'~~~~~~'); g.text(18,9,'bb') if False else None
    g.text(12,5,'RRRR'); g.text(12,6,'WWWW'); g.text(14,9,'ff'); g.text(17,5,'ffff'); g.text(17,6,'ffff'); g.text(3,10,'###'); g.text(3,11,'##'); g.text(6,11,'ff'); g.text(19,11,'###'); g.put(7,4,'l'); g.put(12,4,'l'); g.put(22,4,'l'); g.put(12,10,'o'); g.put(21,10,'f'); g.put(22,9,'f')
T3=town(9,[(3,'1'),(15,'2'),(19,'3')],11,d3)
def r3f(g):
    g.rect(2,4,5,2,'g'); g.rect(15,4,5,2,'g'); g.text(3,8,'FFFF'); g.text(14,8,'FFFF')
    g.rect(1,10,20,2,'~'); g.text(6,10,'bb'); g.text(6,11,'bb'); g.text(15,10,'bb'); g.text(15,11,'bb')
    g.rect(3,13,4,3,'g'); g.rect(14,14,5,2,'g'); g.put(10,13,'o'); g.put(11,16,'o'); g.put(18,18,'#'); g.put(3,18,'#')
    g.rect(2,6,2,1,'f'); g.rect(17,7,3,1,'f')
R3=route(22,22,10,9,r3f)
def g3(g):
    g.text(2,1,'PP'); g.text(12,1,'PP'); g.rect(3,4,3,2,'~'); g.rect(10,4,3,2,'~')
    g.rect(7,5,2,5,'r'); g.text(3,8,'o'); g.text(12,8,'o'); g.put(7,12,'r'); g.put(8,12,'r')
    for y in (3,4,6,7,8,9,10,11): pass
G3=gym(16,14,7,g3)

# ======================= 4 · Hải Đăng: vách đá & ngọn hải đăng =======================
def d4(g):
    g.rect(11,1,3,1,'.')
    # ngọn hải đăng: tháp W cao 4 ô, mái R
    g.text(11,3,'R'); g.rect(10,4,3,3,'W'); g.put(11,2,'R'); g.put(11,3,'R')
    g.put(10,3,'R'); g.put(12,3,'R'); g.put(11,5,'W')
    g.rect(3,7,4,3,'O') if False else None
    g.text(2,7,'OOO'); g.text(2,8,'OO'); g.text(19,7,'OOO'); g.text(20,8,'OO'); g.text(15,10,'o'); g.text(8,10,'o')
    g.rect(1,12,22,1,'s'); g.put(5,6,'l'); g.put(16,6,'l'); g.text(14,8,'ss') if False else None
T4=town(20,[(3,'1'),(15,'2'),(19,'3')],9,d4,shore='s')
def r4f(g):
    g.rect(1,3,20,1,'s'); g.rect(1,12,20,1,'s')
    g.rect(2,5,4,2,'g'); g.rect(15,5,4,2,'g'); g.text(9,5,'OO'); g.text(9,6,'O')
    g.rect(1,8,20,2,'~'); g.text(10,8,'bb'); g.text(10,9,'bb'); g.text(10,10,'') 
    g.rect(2,14,5,3,'g'); g.rect(13,14,5,3,'g'); g.text(9,15,'o'); g.text(11,17,'oo'); g.put(4,12,'o'); g.put(18,12,'o')
R4=route(22,21,14,6,r4f)
def g4(g):
    for x in (3,12): 
        for y in (3,6,9): g.put(x,y,'o')
    g.rect(7,3,2,8,'r'); g.rect(1,1,1,1,'P'); g.put(14,1,'P'); g.rect(2,5,3,1,'~') if False else None
G4=gym(16,13,7,g4)

# ======================= 5 · Mây: cao nguyên & cầu treo =======================
def d5(g):
    g.rect(1,6,22,2,'~'); g.text(5,6,'bb'); g.text(5,7,'bb'); g.text(17,6,'bb'); g.text(17,7,'bb')
    g.text(3,9,'ffff'); g.text(18,9,'ffff'); g.put(11,4,'l'); g.put(8,4,'l'); g.put(14,4,'l'); g.put(11,9,'o'); g.put(12,10,'o')
    g.rect(9,5,1,1,'f'); g.rect(14,5,1,1,'f')
T5=town(11,[(3,'1'),(15,'2'),(19,'3')],6,d5,shore='.')
def r5f(g):
    g.rect(1,4,20,2,'~'); g.text(4,4,'bb'); g.text(4,5,'bb'); g.rect(1,9,20,2,'~'); g.text(16,9,'bb'); g.text(16,10,'bb')
    g.rect(1,14,20,2,'~'); g.text(9,14,'bb'); g.text(9,15,'bb')
    g.rect(2,7,5,1,'g'); g.rect(13,12,6,1,'g'); g.rect(3,17,4,2,'g'); g.rect(15,17,3,2,'g'); g.put(10,7,'o'); g.put(8,12,'o'); g.put(12,18,'o'); g.rect(8,17,3,1,'f')
R5=route(22,21,7,10,r5f)
def g5(g):
    g.rect(2,3,4,2,'~'); g.rect(10,3,4,2,'~'); g.text(2,3,'~') if False else None
    g.rect(6,5,4,1,'b'); g.rect(7,5,2,6,'r'); g.put(1,1,'P'); g.put(14,1,'P'); g.put(3,9,'o'); g.put(12,9,'o')
G5=gym(16,13,7,g5)

# ======================= 6 · Hoàng Hôn: bãi biển & cọ =======================
def d6(g):
    g.rect(1,4,22,8,'s') ; g.rect(1,1,22,3,'.') if False else None
    g.text(4,5,'#'); g.text(9,6,'#'); g.text(18,5,'#'); g.text(21,8,'#'); g.text(2,9,'#')
    g.put(7,4,'l'); g.put(12,4,'l'); g.put(22,4,'l'); g.text(14,8,'OO'); g.text(7,9,'O')
    g.text(6,7,'~~'); g.text(6,8,'~~')
    g.rect(1,12,22,1,'s')
T6=town(10,[(3,'1'),(15,'2'),(19,'3')],11,d6,shore='s')
def r6f(g):
    g.rect(1,3,20,15,'s'); g.rect(1,18,20,1,'s')
    g.text(3,5,'OOO'); g.text(15,5,'OO'); g.text(8,8,'O'); g.text(17,9,'OOO'); g.text(4,12,'OO'); g.text(12,13,'O')
    g.rect(2,7,4,2,'g'); g.rect(14,11,5,2,'g'); g.rect(3,15,5,2,'g'); g.rect(13,16,4,2,'g')
    g.text(9,3,'~~~') if False else None
    g.text(8,10,'~~~~'); g.text(8,11,'~~~~'); g.text(10,10,'bb') if False else None
    g.put(6,14,'#'); g.put(18,14,'#'); g.put(10,16,'#'); g.put(2,3,'#'); g.put(19,3,'#')
R6=route(22,20,10,10,r6f)
def g6(g):
    g.text(1,1,'P'); g.put(14,1,'P'); g.rect(7,3,2,8,'r'); g.put(3,5,'o'); g.put(12,5,'o'); g.put(3,8,'o'); g.put(12,8,'o'); g.rect(3,3,2,1,'~') if False else None
G6=gym(16,13,7,g6)

# ======================= 7 · Trăng: đền & hồ =======================
def d7(g):
    g.rect(8,5,8,5,'~'); g.text(11,7,'ss') if False else None
    g.text(11,5,'bb'); g.text(11,6,'bb'); g.text(11,7,'bb'); g.text(11,8,'bb'); g.text(11,9,'bb')
    g.put(8,4,'l'); g.put(15,4,'l'); g.put(6,10,'l'); g.put(17,10,'l'); g.text(3,6,'OO'); g.text(19,6,'OO'); g.text(2,9,'#'); g.text(21,9,'#')
    g.text(5,8,'FFF') ; g.text(17,8,'FFF')
T7=town(11,[(3,'1'),(15,'2'),(19,'3')],9,d7)
def r7f(g):
    g.rect(1,3,20,1,'.'); g.rect(1,5,3,5,'#'); g.rect(18,5,3,5,'#'); g.put(8,4,'l'); g.put(13,4,'l'); g.put(8,10,'l'); g.put(13,10,'l')
    g.rect(6,6,2,3,'g'); g.rect(14,6,2,3,'g'); g.rect(1,12,20,2,'~'); g.text(9,12,'bb'); g.text(9,13,'bb')
    g.rect(3,15,5,3,'g'); g.rect(14,15,5,3,'g'); g.put(10,16,'o'); g.put(11,16,'o'); g.rect(8,15,1,1,'f'); g.text(2,18,'#')
R7=route(22,21,13,9,r7f)
def g7(g):
    g.rect(2,3,3,2,'~'); g.rect(11,3,3,2,'~'); g.rect(7,3,2,8,'r'); g.rect(6,6,4,1,'b') if False else None
    g.put(1,1,'P'); g.put(14,1,'P'); g.put(4,8,'o'); g.put(11,8,'o')
G7=gym(16,13,7,g7)

# ======================= 8 · Sao: thành phố & quảng trường =======================
def d8(g):
    for x in (1,6): g.house(x,2,None)   # nhà trang trí
    g.house(10,2,None) if False else None
    g.rect(9,6,6,3,'~'); g.text(11,7,'bb') if False else None
    g.put(8,5,'l'); g.put(15,5,'l'); g.put(8,9,'l'); g.put(15,9,'l'); g.text(2,7,'ff'); g.text(21,7,'f') ; g.text(2,10,'FFF'); g.text(19,10,'FFF')
T8=town(11,[(10,'1'),(15,'2'),(19,'3')],11,d8)
def r8f(g):
    g.rect(1,3,20,1,'.')
    for y in (5,9,13,17): g.put(3,y,'l'); g.put(18,y,'l')
    g.text(2,6,'FFFF'); g.text(16,6,'FFFF'); g.text(2,12,'FFFF'); g.text(16,12,'FFFF'); g.rect(5,7,3,2,'g'); g.rect(14,14,4,3,'g'); g.rect(3,15,3,2,'g'); g.rect(15,8,3,2,'g'); g.put(9,10,'o'); g.put(12,10,'o')
R8=route(22,20,10,10,r8f)
def g8(g):
    g.text(1,1,'PP'); g.text(13,1,'PP'); g.rect(7,3,2,8,'r'); g.rect(2,4,2,6,'~'); g.rect(12,4,2,6,'~'); g.put(5,5,'o'); g.put(10,5,'o'); g.put(5,9,'o'); g.put(10,9,'o')
G8=gym(16,13,7,g8)

# NPC theo đảo: (tag,(kind,x,y,...))
S={
 3:(T3,(11,14),[('guide',('guide',11,6,'d')),('sensei',('sensei',7,10,'l')),('p0',('phrase',0,14,7,'l')),('p1',('phrase',1,21,8,'l')),('p2',('phrase',2,13,11,'l'))],
    R3,[('t0',('trainer',0,12,7,'l',6)),('t1',('trainer',1,16,17,'l',6)),('i',('item',20,3)),('f',('fruit',2,19))],
    G3,[('t2',('trainer',2,3,10,'r',6)),('t3',('trainer',3,12,6,'l',6)),('b',('boss',7,2,'d'))]),
 4:(T4,(9,14),[('guide',('guide',8,6,'r')),('sensei',('sensei',5,9,'r')),('p0',('phrase',0,17,5,'l')),('p1',('phrase',1,21,10,'l')),('p2',('phrase',2,13,11,'l'))],
    R4,[('t0',('trainer',0,15,10,'d',6)),('t1',('trainer',1,3,14,'r',6)),('i',('item',20,3)),('f',('fruit',2,19))],
    G4,[('t2',('trainer',2,3,5,'r',6)),('t3',('trainer',3,12,8,'l',6)),('b',('boss',7,2,'d'))]),
 5:(T5,(6,14),[('guide',('guide',11,8,'d')),('sensei',('sensei',3,10,'r')),('p0',('phrase',0,15,10,'l')),('p1',('phrase',1,20,10,'l')),('p2',('phrase',2,14,11,'l'))],
    R5,[('t0',('trainer',0,9,12,'d',6)),('t1',('trainer',1,6,18,'r',6)),('i',('item',19,2)),('f',('fruit',2,19))],
    G5,[('t2',('trainer',2,3,7,'r',6)),('t3',('trainer',3,12,7,'l',6)),('b',('boss',7,2,'d'))]),
 6:(T6,(11,14),[('guide',('guide',11,10,'d')),('sensei',('sensei',8,5,'r')),('p0',('phrase',0,16,6,'l')),('p1',('phrase',1,20,9,'l')),('p2',('phrase',2,13,11,'l'))],
    R6,[('t0',('trainer',0,9,14,'r',6)),('t1',('trainer',1,16,7,'l',6)),('i',('item',19,5)),('f',('fruit',2,18))],
    G6,[('t2',('trainer',2,3,6,'r',6)),('t3',('trainer',3,12,9,'l',6)),('b',('boss',7,2,'d'))]),
 7:(T7,(9,14),[('guide',('guide',5,6,'d')),('sensei',('sensei',4,9,'r')),('p0',('phrase',0,18,5,'l')),('p1',('phrase',1,20,10,'l')),('p2',('phrase',2,13,11,'l'))],
    R7,[('t0',('trainer',0,10,6,'r',6)),('t1',('trainer',1,12,17,'l',6)),('i',('item',19,3)),('f',('fruit',2,15))],
    G7,[('t2',('trainer',2,3,7,'r',6)),('t3',('trainer',3,12,9,'l',6)),('b',('boss',7,2,'d'))]),
 8:(T8,(11,14),[('guide',('guide',11,10,'d')),('sensei',('sensei',4,9,'r')),('p0',('phrase',0,17,5,'l')),('p1',('phrase',1,20,9,'l')),('p2',('phrase',2,6,11,'r'))],
    R8,[('t0',('trainer',0,10,6,'d',6)),('t1',('trainer',1,10,14,'l',6)),('i',('item',19,3)),('f',('fruit',2,18))],
    G8,[('t2',('trainer',2,4,6,'r',6)),('t3',('trainer',3,11,8,'l',6)),('b',('boss',7,2,'d'))]),
}
allok=True
for i,(T,td,tn,R,rn,G,gn) in S.items():
    allok&=emit(i,T,td,tn,R,rn,G,gn)
def jsnpc(a):
    k=a[0]
    if k=='guide': return f"h.guide({a[1]}, {a[2]}, '{a[3]}')"
    if k=='sensei': return f"h.sensei({a[1]}, {a[2]}, '{a[3]}')"
    if k=='phrase': return f"h.phrase({a[1]}, {a[2]}, {a[3]}, '{a[4]}')"
    if k=='trainer': return f"h.trainer({a[1]}, {a[2]}, {a[3]}, '{a[4]}', {a[5]})"
    if k=='item': return f"h.item({a[1]}, {a[2]})"
    if k=='fruit': return f"h.fruit({a[1]}, {a[2]})"
    if k=='boss': return f"h.boss({a[1]}, {a[2]}, '{a[3]}')"
names={3:'Đảo Xanh Lục: đồng hoa & trang trại',4:'Đảo Hải Đăng: vách đá & ngọn hải đăng',5:'Đảo Mây: cao nguyên & cầu treo',6:'Đảo Hoàng Hôn: bãi biển & cọ',7:'Đảo Trăng: đền & hồ',8:'Đảo Sao: thành phố & quảng trường'}
out=[]
for i in sorted(ISL):
    d=ISL[i]
    def blk(k,extra=''):
        rows=',\n'.join("        '%s'"%r for r in d[k]['rows'])
        npcs=', '.join(jsnpc(a[1]) for a in d[k]['npcs'])
        return f"    {k}: {{\n{extra}      rows: [\n{rows}\n      ],\n      npcs: h => [{npcs}]\n    }}"
    ex="      dock: [%d, %d],\n"%tuple(d['town']['dock'])
    out.append(f"  /* ---------- {i} · {names[i]} ---------- */\n  {i}: {{\n{blk('town',ex)},\n{blk('route')},\n{blk('gym')}\n  }}")
print(',\n'.join(out))
print('OK' if allok else 'CÓ LỖI',file=sys.stderr)
