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
    allok&=check(f'{i}.town',tr,tuple(tdock[:2]),[(k,npos(a)) for k,a in tnpcs],'town')
    allok&=check(f'{i}.route',rr,arrival(rr,'V'),[(k,npos(a)) for k,a in rnpcs],'route')
    allok&=check(f'{i}.gym',gr,arrival(gr,'V'),[(k,npos(a)) for k,a in gnpcs],'gym')
    # đường từ V của đường mòn tới cửa G
    seen=bfs(rr,arrival(rr,'V')); ga=arrival(rr,'G')
    if ga not in seen: print('!!',i,'route: không tới được cửa gym',file=sys.stderr); allok=False
    ISL[i]=dict(town=dict(rows=tr,dock=tdock,npcs=tnpcs),route=dict(rows=rr,npcs=rnpcs),gym=dict(rows=gr,npcs=gnpcs))
    return allok

# ======================= 3 · Xanh Lục: trang trại, đi ngang (đông–tây), bến tàu phía tây =======================
g=Grid(28,14); g.border('#'); g.rect(1,1,3,12,'~'); g.rect(1,6,4,2,'B'); g.put(27,6,'U'); g.put(27,7,'U')
for x,d in ((7,'1'),(13,'2'),(19,'3')): g.house(x,2,d)
g.text(22,5,'RRRR'); g.text(22,6,'WWWW')
g.rect(7,8,5,3,'f'); g.text(6,7,'FFFFFFF'); g.text(6,11,'FFFFFFF'); [g.put(6,y,'F') for y in (8,9,10)]; [g.put(12,y,'F') for y in (8,10)]
g.rect(16,8,5,3,'~'); g.put(10,4,'l'); g.put(16,4,'l'); g.put(23,4,'l'); g.text(22,9,'##'); g.put(22,10,'#'); g.put(25,10,'o'); g.put(19,12,'o')
T3=g
g=Grid(30,14); g.border('#'); g.text(24,1,'RRRRR'); g.text(24,2,'WWGWW'); g.put(26,2,'G'); g.put(0,6,'V'); g.put(0,7,'V')
g.rect(12,1,2,12,'~'); g.rect(12,6,2,2,'B')
g.rect(3,2,6,3,'g'); g.rect(16,8,7,3,'g'); g.rect(3,9,5,3,'g'); g.text(15,4,'FFFFF'); g.put(9,7,'o'); g.put(18,5,'o'); g.put(21,6,'o'); g.text(16,2,'###'); g.text(20,2,'##'); g.rect(5,6,3,1,'f'); g.rect(22,10,3,1,'f')
R3=g
g=Grid(20,13); g.border('#'); g.text(9,12,'VV'); g.rect(2,3,3,3,'~'); g.rect(15,3,3,3,'~'); g.rect(9,3,2,8,'r')
for x,y in ((6,4),(13,4),(6,8),(13,8)): g.put(x,y,'o')
g.put(1,1,'P'); g.put(18,1,'P'); G3=g

# ======================= 4 · Hải Đăng: đảo đứng (bắc–nam), tầng bậc thang, hải đăng =======================
g=Grid(20,22); g.border('#'); g.text(9,0,'UU'); g.rect(0,19,20,3,'~'); g.rect(9,19,2,3,'b'); g.rect(1,18,18,1,'s')
g.rect(14,2,3,1,'R'); g.rect(14,3,3,4,'W'); g.house(2,2,'1'); g.house(2,9,'2'); g.house(14,9,'3')
g.text(1,7,'FFFFFFF'); g.text(12,7,'FFFFFFF'); g.text(1,14,'FFFFFFF'); g.text(12,14,'FFFFFFF')
for x,y in ((8,5),(11,5),(8,12),(11,12)): g.put(x,y,'l')
g.text(1,16,'OO'); g.text(17,16,'OO'); g.text(4,12,'ff'); g.text(14,12,'ff'); g.text(5,5,'ff')
T4=g
g=Grid(20,26); g.border('#'); g.text(12,1,'RRRRR'); g.text(12,2,'WWGWW'); g.put(14,2,'G'); g.text(9,25,'VV')
g.rect(1,6,18,2,'~'); g.rect(3,6,2,2,'b'); g.rect(1,13,18,2,'~'); g.rect(15,13,2,2,'b'); g.rect(1,19,18,2,'~'); g.rect(3,19,2,2,'b')
g.rect(2,3,5,2,'g'); g.rect(12,9,6,2,'g'); g.rect(2,16,5,2,'g'); g.rect(11,22,6,2,'g')
for x,y in ((9,4),(8,10),(14,17),(5,23)): g.put(x,y,'o')
g.text(16,4,'##'); g.text(1,10,'##'); g.text(17,16,'##'); g.text(1,22,'##')
R4=g
g=Grid(14,16); g.border('#'); g.text(6,15,'VV'); g.rect(6,3,2,11,'r')
for x,y in ((3,4),(10,4),(3,9),(10,9)): g.put(x,y,'o')
g.put(1,1,'P'); g.put(12,1,'P'); G4=g

# ======================= 5 · Mây: các hòn đảo nổi nối bằng cầu =======================
g=Grid(26,18,'~'); g.rect(2,2,6,6,'.'); g.rect(10,5,7,8,'.'); g.rect(11,1,4,4,'.'); g.text(12,0,'UU'); g.rect(19,2,6,6,'.'); g.rect(19,10,6,6,'.')
g.house(3,3,'1'); g.house(20,3,'2'); g.house(20,11,'3')
g.rect(8,6,2,1,'B'); g.rect(17,6,2,1,'B'); g.rect(17,11,2,1,'B'); g.rect(21,8,1,2,'b'); g.rect(12,13,2,5,'b')
g.put(11,6,'l'); g.put(15,6,'l'); g.text(5,6,'ff'); g.text(22,6,'ff'); g.text(22,14,'ff'); g.put(14,9,'o'); g.put(3,6,'o')
T5=g
g=Grid(22,22,'~'); g.border('#')
g.rect(4,17,14,4,'.'); g.rect(2,11,8,4,'.'); g.rect(12,11,8,4,'.'); g.rect(6,2,10,7,'.')
g.text(10,21,'VV'); g.rect(5,15,1,2,'b'); g.rect(10,12,2,2,'B'); g.rect(14,9,1,2,'b')
g.text(9,2,'RRRRR'); g.text(9,3,'WWGWW'); g.put(11,3,'G')
g.rect(5,18,4,2,'g'); g.rect(3,12,3,2,'g'); g.rect(14,12,4,2,'g'); g.rect(7,5,3,2,'g'); g.rect(13,6,2,2,'g'); g.put(14,18,'o'); g.put(7,13,'o'); g.put(9,7,'o')
R5=g
g=Grid(16,16); g.border('#'); g.text(7,15,'VV'); g.rect(5,6,6,4,'~'); g.rect(7,3,2,11,'r'); g.rect(7,6,2,4,'b')
for x,y in ((3,4),(12,4),(3,11),(12,11)): g.put(x,y,'o')
g.put(1,1,'P'); g.put(14,1,'P'); G5=g

# ======================= 6 · Hoàng Hôn: bãi biển rộng, lối ra phía tây, đường mòn đi từ đông sang tây =======================
g=Grid(30,12,'s'); g.border('#'); g.put(0,5,'U'); g.put(0,6,'U'); g.rect(1,9,28,2,'~'); g.rect(14,9,2,2,'b')
for x,d in ((3,'1'),(12,'2'),(22,'3')): g.house(x,2,d)
for x,y in ((8,5),(18,6),(27,5),(10,7),(26,8),(2,8)): g.put(x,y,'#')
for x,y in ((7,4),(17,4),(27,4)): g.put(x,y,'l')
g.text(16,7,'OO'); g.put(5,7,'O'); g.put(24,6,'O'); g.rect(20,6,3,2,'~'); g.text(9,6,'FFF')
T6=g
g=Grid(28,12,'s'); g.border('#'); g.text(2,1,'RRRRR'); g.text(2,2,'WWGWW'); g.put(4,2,'G'); g.put(27,5,'V'); g.put(27,6,'V')
g.rect(8,3,2,3,'O'); g.rect(8,8,2,3,'O'); g.rect(15,1,2,5,'O'); g.rect(15,8,2,3,'O')
g.rect(11,3,3,3,'g'); g.rect(11,8,3,3,'g'); g.rect(19,2,4,3,'g'); g.rect(19,8,4,3,'g'); g.rect(21,5,2,2,'~')
for x,y in ((6,6),(25,3),(25,9),(2,9)): g.put(x,y,'#')
R6=g
g=Grid(18,11); g.border('#'); g.text(8,10,'VV'); g.rect(8,3,2,7,'r')
for x,y in ((3,3),(14,3),(3,7),(14,7)): g.put(x,y,'o')
g.put(1,1,'P'); g.put(16,1,'P'); G6=g

# ======================= 7 · Trăng: hồ lớn với đền ở giữa =======================
g=Grid(22,20); g.border('#'); g.text(10,0,'UU'); g.rect(6,6,10,7,'~'); g.rect(9,8,4,4,'.'); g.rect(10,6,2,2,'b')
g.text(10,9,'RR'); g.text(10,10,'WW'); g.house(2,2,'1'); g.house(17,2,'2'); g.house(2,14,'3')
g.rect(1,16,20,1,'s'); g.rect(0,17,22,3,'~'); g.rect(10,17,2,3,'b')
for x,y in ((8,4),(13,4),(5,10),(17,10)): g.put(x,y,'l')
for x,y in ((4,8),(18,8),(17,13)): g.put(x,y,'o')
g.put(1,8,'#'); g.put(19,12,'#'); g.text(3,6,'FFF'); g.text(17,6,'FFF')
T7=g
g=Grid(20,24); g.border('#'); g.text(2,1,'RRRRR'); g.text(2,2,'WWGWW'); g.put(4,2,'G'); g.text(15,23,'VV')
g.rect(8,4,4,3,'~'); g.rect(3,12,4,3,'~'); g.rect(13,16,4,3,'~')
g.rect(1,6,3,3,'#'); g.rect(15,6,3,5,'#'); g.rect(8,9,3,2,'#'); g.rect(1,16,4,4,'#'); g.rect(9,19,4,3,'#')
g.rect(5,8,3,3,'g'); g.rect(12,12,4,3,'g'); g.rect(6,17,3,3,'g'); g.rect(14,3,4,2,'g')
for x,y in ((5,14),(11,15),(17,13)): g.put(x,y,'o')
for x,y in ((6,4),(12,9),(8,13),(13,21)): g.put(x,y,'l')
R7=g
g=Grid(18,14); g.border('#'); g.text(8,13,'VV'); g.rect(2,4,4,6,'~'); g.rect(12,4,4,6,'~'); g.rect(8,3,2,10,'r')
for x,y in ((7,5),(10,5),(7,9),(10,9)): g.put(x,y,'o')
g.put(1,1,'P'); g.put(16,1,'P'); G7=g

# ======================= 8 · Sao: thành phố có đại lộ, quảng trường và đài phun nước =======================
g=Grid(30,20); g.border('#'); g.text(14,0,'UU'); g.rect(1,16,28,1,'s'); g.rect(1,17,28,2,'~'); g.rect(14,17,2,2,'b')
g.house(2,2,'1'); g.house(7,2,None); g.house(20,2,None); g.house(25,2,'3'); g.house(2,8,None); g.house(7,8,'2'); g.house(20,8,None); g.house(25,8,None)
g.rect(12,12,6,3,'~')
for x,y in ((11,11),(18,11),(11,15),(18,15)): g.put(x,y,'l')
g.text(1,6,'FFFFFFF'); g.text(22,6,'FFFFFFF'); g.text(4,12,'ffff'); g.text(23,12,'ffff'); g.text(2,11,'##'); g.text(27,11,'##')
T8=g
g=Grid(20,28); g.border('#'); g.text(8,1,'RRRRR'); g.text(8,2,'WWGWW'); g.put(10,2,'G'); g.text(9,27,'VV')
for y in (5,9,13,17,21,25): g.put(4,y,'l'); g.put(15,y,'l')
for y in (7,15,23): g.text(2,y,'FFFF'); g.text(14,y,'FFFF')
g.rect(1,9,2,5,'g'); g.rect(17,9,2,5,'g'); g.rect(1,17,2,5,'g'); g.rect(17,17,2,5,'g'); g.rect(6,11,2,2,'g'); g.rect(12,19,2,2,'g'); g.put(7,19,'o'); g.put(12,5,'o')
R8=g
g=Grid(20,16); g.border('#'); g.text(9,15,'VV'); g.rect(9,3,2,12,'r'); g.rect(2,4,3,8,'~'); g.rect(15,4,3,8,'~')
for x,y in ((6,4),(13,4),(6,9),(13,9),(6,13),(13,13)): g.put(x,y,'o')
g.put(1,1,'P'); g.put(18,1,'P'); G8=g

# NPC theo đảo: (tag,(kind,...)). dock = (x,y[,hướng])
S={
 3:(T3,(2,6,'r'),[('guide',('guide',9,6,'d')),('sensei',('sensei',14,9,'l')),('p0',('phrase',0,17,6,'l')),('p1',('phrase',1,21,7,'r')),('p2',('phrase',2,9,12,'r'))],
    R3,[('t0',('trainer',0,8,10,'u',4)),('t1',('trainer',1,20,4,'d',5)),('i',('item',28,5)),('f',('fruit',3,12))],
    G3,[('t2',('trainer',2,4,7,'r',6)),('t3',('trainer',3,15,10,'l',6)),('b',('boss',9,2,'d'))]),
 4:(T4,(9,20),[('guide',('guide',10,16,'d')),('sensei',('sensei',6,12,'r')),('p0',('phrase',0,13,13,'l')),('p1',('phrase',1,4,6,'r')),('p2',('phrase',2,16,16,'l'))],
    R4,[('t0',('trainer',0,4,11,'u',4)),('t1',('trainer',1,15,17,'u',3)),('i',('item',18,3)),('f',('fruit',1,23))],
    G4,[('t2',('trainer',2,2,6,'r',6)),('t3',('trainer',3,11,11,'l',6)),('b',('boss',6,2,'d'))]),
 5:(T5,(12,16),[('guide',('guide',13,8,'d')),('sensei',('sensei',11,10,'r')),('p0',('phrase',0,5,6,'r')),('p1',('phrase',1,22,6,'l')),('p2',('phrase',2,22,14,'l'))],
    R5,[('t0',('trainer',0,12,18,'l',6)),('t1',('trainer',1,16,13,'l',5)),('i',('item',18,12)),('f',('fruit',16,19))],
    G5,[('t2',('trainer',2,2,12,'r',6)),('t3',('trainer',3,13,3,'l',6)),('b',('boss',7,2,'d'))]),
 6:(T6,(14,10),[('guide',('guide',14,6,'d')),('sensei',('sensei',8,7,'r')),('p0',('phrase',0,19,5,'l')),('p1',('phrase',1,25,6,'l')),('p2',('phrase',2,12,8,'r'))],
    R6,[('t0',('trainer',0,13,7,'l',5)),('t1',('trainer',1,24,7,'l',6)),('i',('item',25,1)),('f',('fruit',2,10))],
    G6,[('t2',('trainer',2,3,5,'r',6)),('t3',('trainer',3,14,8,'l',6)),('b',('boss',8,2,'d'))]),
 7:(T7,(10,18),[('guide',('guide',10,4,'d')),('sensei',('sensei',4,10,'r')),('p0',('phrase',0,18,5,'l')),('p1',('phrase',1,18,11,'l')),('p2',('phrase',2,13,15,'l'))],
    R7,[('t0',('trainer',0,6,10,'r',5)),('t1',('trainer',1,10,17,'l',6)),('i',('item',18,2)),('f',('fruit',2,21))],
    G7,[('t2',('trainer',2,3,11,'r',6)),('t3',('trainer',3,14,11,'l',6)),('b',('boss',8,2,'d'))]),
 8:(T8,(14,18),[('guide',('guide',14,10,'d')),('sensei',('sensei',5,12,'r')),('p0',('phrase',0,22,12,'l')),('p1',('phrase',1,10,5,'r')),('p2',('phrase',2,19,5,'l'))],
    R8,[('t0',('trainer',0,6,8,'r',6)),('t1',('trainer',1,13,18,'l',6)),('i',('item',18,2)),('f',('fruit',1,26))],
    G8,[('t2',('trainer',2,5,6,'r',6)),('t3',('trainer',3,14,11,'l',6)),('b',('boss',9,2,'d'))]),
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
    ex="      dock: [%s],\n"%', '.join(repr(v) if not isinstance(v,str) else "'%s'"%v for v in d['town']['dock'])
    out.append(f"  /* ---------- {i} · {names[i]} ---------- */\n  {i}: {{\n{blk('town',ex)},\n{blk('route')},\n{blk('gym')}\n  }}")
print(',\n'.join(out))
print('OK' if allok else 'CÓ LỖI',file=sys.stderr)
