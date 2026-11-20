// Ported verbatim from design-board/life-design-board-v17.html (mountOrb, Claude-authored board).
var ORBS=[];
var LO_N=30,LO_TW=(function(){var P=[],s=11;function r(){s=(s*9301+49297)%233280;return s/233280}for(var i=0;i<LO_N;i++){var u=r()*2-1,th=r()*Math.PI*2,rr=.35+.65*Math.cbrt(r()),q=Math.sqrt(1-u*u);P.push([Math.cos(th)*q*rr,u*rr,Math.sin(th)*q*rr,r()*6.28,1.4+r()*2])}return P})();
var LO_SPH=(function(){var P=[];for(var i=0;i<30;i++){var y=1-2*(i+.5)/30,r=Math.sqrt(1-y*y),th=i*Math.PI*(3-Math.sqrt(5));P.push([Math.cos(th)*r,y,Math.sin(th)*r,i*1.37])}return P})();
var LO_S10=(function(){var P=[];for(var i=0;i<10;i++){var y=1-2*(i+.5)/10,r=Math.sqrt(1-y*y),th=i*Math.PI*(3-Math.sqrt(5));P.push([Math.cos(th)*r,y,Math.sin(th)*r])}return P})();
var LO_S10N=LO_S10.map(function(a,i){return LO_S10.map(function(b,j){return [j,a[0]*b[0]+a[1]*b[1]+a[2]*b[2]]}).filter(function(x){return x[0]!==i}).sort(function(p,q){return q[1]-p[1]}).slice(0,3).map(function(x){return x[0]})});
var ORB_N=10;
function mountOrb(el,size,state){var c=document.createElement('canvas'),d=Math.min(2,window.devicePixelRatio||1);c.width=c.height=size*d;c.style.width=c.style.height=size+'px';c.style.display='block';el.innerHTML='';el.appendChild(c);var x=c.getContext('2d');x.scale(d,d);
 function norm(s){return s==='sphere'||s==='core'?'thinking':s==='voice'?'listening':(s||'ring')}
 var dot=Math.max(2.6,size/12),R=size/2-Math.max(2,size/14)-dot/2,cx=size/2,cy=size/2,last=0;
 var o={sHead:0,sTrail:[],sAt:0,edges:{},state:norm(state),prev:null,switchAt:-1e9,frozen:null,spin:0,w1:0,w2:0,w3:0,t:0,lv:0,g:0,gv:0,doneAt:-1e9,vis:true,ink:el.dataset.ink||'',cur:[]};
 function rot(p,a,tl){var ca=Math.cos(a),sa=Math.sin(a),x1=p[0]*ca+p[2]*sa,z1=-p[0]*sa+p[2]*ca,ct=Math.cos(tl),st=Math.sin(tl);return [x1,p[1]*ct-z1*st,p[1]*st+z1*ct]}
 // where dot k wants to be in a state: [x, y, depth 0..1, alpha, size]
 function at(st,k){var t=o.t,i=k%10,tail=.3+.7*(i/10),a=i/10*Math.PI*2+o.spin;
  if(st==='ring'||st==='done'){return [Math.cos(a)*R,Math.sin(a)*R,.5,k<10?tail:0,1]}
  if(st==='thinking'){var p=LO_SPH[k],q=rot(p,t*.42,.32),pr=3.2/(3.2-q[2]),dp=(q[2]+1)/2,tw=.5+.5*Math.sin(t*2.2+p[3]);return [q[0]*R*.96*pr,q[1]*R*.96*pr,dp,(.1+.9*Math.pow(dp,1.5))*(.82+.18*tw),.5+.62*dp]}
  if(st==='working'){if(k<10)return [Math.cos(a+o.w1)*R,Math.sin(a+o.w1)*R,.5,tail,1];if(k<17){var j=k-10,b=j/7*Math.PI*2+o.w2;return [Math.cos(b)*R*.6,Math.sin(b)*R*.6,.5,.3+.7*(j/7),.82]}if(k<21){var j=k-17,b=j/4*Math.PI*2+o.w3;return [Math.cos(b)*R*.27,Math.sin(b)*R*.27,.5,.3+.7*(j/4),.66]}return [Math.cos(a)*R,Math.sin(a)*R,.5,0,1]}
  if(st==='searching'){if(k>=10)return [Math.cos(a)*R,Math.sin(a)*R,.5,0,1];var q=rot(LO_S10[k],t*.3,.35),pr=3.2/(3.2-q[2]),dp=(q[2]+1)/2,ti=o.sTrail.indexOf(k),hop=k===o.sHead?1:ti>=0?.8-ti*.14:.3;return [q[0]*R*pr,q[1]*R*pr,dp,hop*(.45+.55*dp),(.78+.34*dp)*(k===o.sHead?1.15:1)]}
  if(st==='listening'){if(k>=10)return [Math.cos(a)*R,Math.sin(a)*R,.5,0,1];var rip=.5+.5*Math.sin(t*6-i*.9),push=o.lv*(.35+.65*rip),rr=R*(1+.24*push);return [Math.cos(a)*rr,Math.sin(a)*rr,.5,.78+.22*push,1+.35*push]}
  return [0,0,.5,0,1]}
 o.set=function(s){s=norm(s);if(s===o.state&&s!=='done')return;o.frozen=o.cur.map(function(v){return v.slice()});o.prev=o.state;o.state=s;o.switchAt=performance.now();if(s==='done')o.doneAt=o.switchAt};
 o.setRings=function(){};
 function ease(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
 function frame(now){requestAnimationFrame(frame);var dt=last?Math.min(50,now-last):16;last=now;if(!o.vis)return;o.t+=dt/1000;
  var lis=o.state==='listening'?1:0;o.spin+=dt/12000*Math.PI*2*(1-.85*lis*Math.min(1,(now-o.switchAt)/700));
  var wk=o.state==='working'?1:0;o.w1=(o.w1||0)+dt/12000*Math.PI*2*1.2*wk;o.w2-=dt/5200*Math.PI*2;o.w3+=dt/3400*Math.PI*2;
  var env=.25+.75*Math.pow(Math.abs(Math.sin(o.t*1.7)*Math.sin(o.t*.61+.9)),.6);o.lv+=((lis?env:0)-o.lv)*.2;
  if(o.state==='done'&&now-o.doneAt>1000){o.state='ring'}
  var gt=now-o.doneAt<450?1:0;o.gv+=(gt-o.g)*.16;o.gv*=.74;o.g+=o.gv;var gR=1-.62*Math.max(-.2,o.g),gg=Math.min(1,Math.max(0,o.g));
  if(o.state==='searching'&&o.t-o.sAt>.55){o.sAt=o.t;var nb=LO_S10N[o.sHead].filter(function(j){return o.sTrail.indexOf(j)<0});if(!nb.length)nb=LO_S10N[o.sHead];var nx=nb[Math.floor((o.t*7.31)%nb.length)];var key=Math.min(o.sHead,nx)+'-'+Math.max(o.sHead,nx);o.edges[key]={a:o.sHead,b:nx,born:o.t};o.sTrail.unshift(o.sHead);o.sTrail=o.sTrail.slice(0,3);o.sHead=nx}
  if(o.state!=='searching'&&Object.keys(o.edges).length&&now-o.switchAt>700){o.edges={};o.sTrail=[]}
  var ink=o.ink||getComputedStyle(el).color;x.clearRect(0,0,size,size);x.fillStyle=ink;var L=[];
  for(var k=0;k<LO_N;k++){var to=at(o.state,k),u=Math.min(1,Math.max(0,(now-o.switchAt-(k%10)*38-(k>=10?120:0))/720)),e=ease(u),v;
   if(e>=1||!o.frozen||!o.frozen[k]){v=to}else{var fr=o.frozen[k];v=[fr[0]+(to[0]-fr[0])*e,fr[1]+(to[1]-fr[1])*e,fr[2]+(to[2]-fr[2])*e,fr[3]+(to[3]-fr[3])*e,fr[4]+(to[4]-fr[4])*e]}
   o.cur[k]=v;var al=v[3]*(1-gg)+(k<10?.95*gg:0);L.push([v[2],cx+v[0]*gR,cy+v[1]*gR,al,v[4]*(1+.2*gg)])}
  // searching: each hop draws a line from node to node (pen-tip draw-on), connections build into a network
  var sb=o.state==='searching'?Math.min(1,(now-o.switchAt)/900):Math.max(0,1-(now-o.switchAt)/450);if(sb>0){x.strokeStyle=ink;x.lineWidth=Math.max(1,dot/3.6);x.lineCap='round';for(var ek in o.edges){var E=o.edges[ek],A=o.cur[E.a],B=o.cur[E.b];if(!A||!B)continue;var age=o.t-E.born,pg=Math.min(1,age/.35),fade=age<1.2?.85:Math.max(.34,.85-(age-1.2)*.35);var ax=cx+A[0]*gR,ay=cy+A[1]*gR,bx=cx+B[0]*gR,by=cy+B[1]*gR;x.globalAlpha=fade*sb*(.5+.5*(A[2]+B[2])/2);x.beginPath();x.moveTo(ax,ay);x.lineTo(ax+(bx-ax)*pg,ay+(by-ay)*pg);x.stroke()}}
  L.sort(function(a,b){return a[0]-b[0]});L.forEach(function(q){if(q[3]<.02)return;x.globalAlpha=Math.min(1,q[3]);x.beginPath();x.arc(q[1],q[2],dot/2*q[4],0,7);x.fill()});x.globalAlpha=1}
 for(var k=0;k<LO_N;k++)o.cur[k]=at(o.state,k);
 requestAnimationFrame(frame);
 if('IntersectionObserver' in window){new IntersectionObserver(function(es){o.vis=es[0].isIntersecting}).observe(el)}
 ORBS.push(o);return o}
window.mountOrb=mountOrb;window.ORBS=ORBS;
