import{r as Rt,u as $a,a as Yu,j as R,L as Ad,s as Hm,b as Cd}from"./index-BJrzLL8z.js";import{u as Gm}from"./selectionStore-CffvNx9y.js";import{f as pa,c as Rc,p as Wm,v as Xm,i as jm,a as Ym,d as qm,b as $m,n as Rd,r as Km,e as Zm,s as Jm,u as Qm,g as e_,h as Ff,m as eo,j as qu,k as t_,l as bl,o as rn,A as n_,V as El,C as i_,q as r_}from"./audio-visualiser-Bh4WI1nm.js";function Xi(r){if(r===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return r}function Pd(r,e){r.prototype=Object.create(e.prototype),r.prototype.constructor=r,r.__proto__=e}var $n={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},Hs={duration:.5,overwrite:!1,delay:0},$u,cn,Pt,li=1e8,Et=1/li,Pc=Math.PI*2,s_=Pc/4,a_=0,Dd=Math.sqrt,o_=Math.cos,l_=Math.sin,sn=function(e){return typeof e=="string"},Ut=function(e){return typeof e=="function"},er=function(e){return typeof e=="number"},Ku=function(e){return typeof e>"u"},Fi=function(e){return typeof e=="object"},Ln=function(e){return e!==!1},Zu=function(){return typeof window<"u"},to=function(e){return Ut(e)||sn(e)},Ld=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},Sn=Array.isArray,c_=/random\([^)]+\)/g,u_=/,\s*/g,Of=/(?:-?\.?\d|\.)+/gi,Nd=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,Ds=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,Il=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,Id=/[+-]=-?[.\d]+/,f_=/[^,'"\[\]\s]+/gi,h_=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,Lt,Ei,Dc,Ju,Zn={},ol={},Ud,Fd=function(e){return(ol=Gs(e,Zn))&&On},Qu=function(e,t){return console.warn("Invalid property",e,"set to",t,"Missing plugin? gsap.registerPlugin()")},Oa=function(e,t){return!t&&console.warn(e)},Od=function(e,t){return e&&(Zn[e]=t)&&ol&&(ol[e]=t)||Zn},Ba=function(){return 0},d_={suppressEvents:!0,isStart:!0,kill:!1},jo={suppressEvents:!0,kill:!1},p_={suppressEvents:!0},ef={},yr=[],Lc={},Bd,Gn={},Ul={},Bf=30,Yo=[],tf="",nf=function(e){var t=e[0],n,i;if(Fi(t)||Ut(t)||(e=[e]),!(n=(t._gsap||{}).harness)){for(i=Yo.length;i--&&!Yo[i].targetTest(t););n=Yo[i]}for(i=e.length;i--;)e[i]&&(e[i]._gsap||(e[i]._gsap=new lp(e[i],n)))||e.splice(i,1);return e},Kr=function(e){return e._gsap||nf(ci(e))[0]._gsap},kd=function(e,t,n){return(n=e[t])&&Ut(n)?e[t]():Ku(n)&&e.getAttribute&&e.getAttribute(t)||n},Nn=function(e,t){return(e=e.split(",")).forEach(t)||e},Bt=function(e){return Math.round(e*1e5)/1e5||0},Dt=function(e){return Math.round(e*1e7)/1e7||0},Is=function(e,t){var n=t.charAt(0),i=parseFloat(t.substr(2));return e=parseFloat(e),n==="+"?e+i:n==="-"?e-i:n==="*"?e*i:e/i},m_=function(e,t){for(var n=t.length,i=0;e.indexOf(t[i])<0&&++i<n;);return i<n},ll=function(){var e=yr.length,t=yr.slice(0),n,i;for(Lc={},yr.length=0,n=0;n<e;n++)i=t[n],i&&i._lazy&&(i.render(i._lazy[0],i._lazy[1],!0)._lazy=0)},rf=function(e){return!!(e._initted||e._startAt||e.add)},zd=function(e,t,n,i){yr.length&&!cn&&ll(),e.render(t,n,!!(cn&&t<0&&rf(e))),yr.length&&!cn&&ll()},Vd=function(e){var t=parseFloat(e);return(t||t===0)&&(e+"").match(f_).length<2?t:sn(e)?e.trim():e},Hd=function(e){return e},Jn=function(e,t){for(var n in t)n in e||(e[n]=t[n]);return e},__=function(e){return function(t,n){for(var i in n)i in t||i==="duration"&&e||i==="ease"||(t[i]=n[i])}},Gs=function(e,t){for(var n in t)e[n]=t[n];return e},kf=function r(e,t){for(var n in t)n!=="__proto__"&&n!=="constructor"&&n!=="prototype"&&(e[n]=Fi(t[n])?r(e[n]||(e[n]={}),t[n]):t[n]);return e},cl=function(e,t){var n={},i;for(i in e)i in t||(n[i]=e[i]);return n},Ea=function(e){var t=e.parent||Lt,n=e.keyframes?__(Sn(e.keyframes)):Jn;if(Ln(e.inherit))for(;t;)n(e,t.vars.defaults),t=t.parent||t._dp;return e},g_=function(e,t){for(var n=e.length,i=n===t.length;i&&n--&&e[n]===t[n];);return n<0},Gd=function(e,t,n,i,s){var a=e[i],o;if(s)for(o=t[s];a&&a[s]>o;)a=a._prev;return a?(t._next=a._next,a._next=t):(t._next=e[n],e[n]=t),t._next?t._next._prev=t:e[i]=t,t._prev=a,t.parent=t._dp=e,t},Tl=function(e,t,n,i){n===void 0&&(n="_first"),i===void 0&&(i="_last");var s=t._prev,a=t._next;s?s._next=a:e[n]===t&&(e[n]=a),a?a._prev=s:e[i]===t&&(e[i]=s),t._next=t._prev=t.parent=null},Tr=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},Zr=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var n=e;n;)n._dirty=1,n=n.parent;return e},x_=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},Nc=function(e,t,n,i){return e._startAt&&(cn?e._startAt.revert(jo):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,i))},v_=function r(e){return!e||e._ts&&r(e.parent)},zf=function(e){return e._repeat?Ws(e._tTime,e=e.duration()+e._rDelay)*e:0},Ws=function(e,t){var n=Math.floor(e=Dt(e/t));return e&&n===e?n-1:n},ul=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},wl=function(e){return e._end=Dt(e._start+(e._tDur/Math.abs(e._ts||e._rts||Et)||0))},Al=function(e,t){var n=e._dp;return n&&n.smoothChildTiming&&e._ts&&(e._start=Dt(n._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),wl(e),n._dirty||Zr(n,e)),e},Wd=function(e,t){var n;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(n=ul(e.rawTime(),t),(!t._dur||Ka(0,t.totalDuration(),n)-t._tTime>Et)&&t.render(n,!0)),Zr(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(n=e;n._dp;)n.rawTime()>=0&&n.totalTime(n._tTime),n=n._dp;e._zTime=-Et}},Ai=function(e,t,n,i){return t.parent&&Tr(t),t._start=Dt((er(n)?n:n||e!==Lt?ti(e,n,t):e._time)+t._delay),t._end=Dt(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),Gd(e,t,"_first","_last",e._sort?"_start":0),Ic(t)||(e._recent=t),i||Wd(e,t),e._ts<0&&Al(e,e._tTime),e},Xd=function(e,t){return(Zn.ScrollTrigger||Qu("scrollTrigger",t))&&Zn.ScrollTrigger.create(t,e)},jd=function(e,t,n,i,s){if(af(e,t,s),!e._initted)return 1;if(!n&&e._pt&&!cn&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&Bd!==Xn.frame)return yr.push(e),e._lazy=[s,i],1},S_=function r(e){var t=e.parent;return t&&t._ts&&t._initted&&!t._lock&&(t.rawTime()<0||r(t))},Ic=function(e){var t=e.data;return t==="isFromStart"||t==="isStart"},M_=function(e,t,n,i){var s=e.ratio,a=t<0||!t&&(!e._start&&S_(e)&&!(!e._initted&&Ic(e))||(e._ts<0||e._dp._ts<0)&&!Ic(e))?0:1,o=e._rDelay,l=0,c,u,d;if(o&&e._repeat&&(l=Ka(0,e._tDur,t),u=Ws(l,o),e._yoyo&&u&1&&(a=1-a),u!==Ws(e._tTime,o)&&(s=1-a,e.vars.repeatRefresh&&e._initted&&e.invalidate())),a!==s||cn||i||e._zTime===Et||!t&&e._zTime){if(!e._initted&&jd(e,t,i,n,l))return;for(d=e._zTime,e._zTime=t||(n?Et:0),n||(n=t&&!d),e.ratio=a,e._from&&(a=1-a),e._time=0,e._tTime=l,c=e._pt;c;)c.r(a,c.d),c=c._next;t<0&&Nc(e,t,n,!0),e._onUpdate&&!n&&Yn(e,"onUpdate"),l&&e._repeat&&!n&&e.parent&&Yn(e,"onRepeat"),(t>=e._tDur||t<0)&&e.ratio===a&&(a&&Tr(e,1),!n&&!cn&&(Yn(e,a?"onComplete":"onReverseComplete",!0),e._prom&&e._prom()))}else e._zTime||(e._zTime=t)},y_=function(e,t,n){var i;if(n>t)for(i=e._first;i&&i._start<=n;){if(i.data==="isPause"&&i._start>t)return i;i=i._next}else for(i=e._last;i&&i._start>=n;){if(i.data==="isPause"&&i._start<t)return i;i=i._prev}},Xs=function(e,t,n,i){var s=e._repeat,a=Dt(t)||0,o=e._tTime/e._tDur;return o&&!i&&(e._time*=a/e._dur),e._dur=a,e._tDur=s?s<0?1e10:Dt(a*(s+1)+e._rDelay*s):a,o>0&&!i&&Al(e,e._tTime=e._tDur*o),e.parent&&wl(e),n||Zr(e.parent,e),e},Vf=function(e){return e instanceof An?Zr(e):Xs(e,e._dur)},b_={_start:0,endTime:Ba,totalDuration:Ba},ti=function r(e,t,n){var i=e.labels,s=e._recent||b_,a=e.duration()>=li?s.endTime(!1):e._dur,o,l,c;return sn(t)&&(isNaN(t)||t in i)?(l=t.charAt(0),c=t.substr(-1)==="%",o=t.indexOf("="),l==="<"||l===">"?(o>=0&&(t=t.replace(/=/,"")),(l==="<"?s._start:s.endTime(s._repeat>=0))+(parseFloat(t.substr(1))||0)*(c?(o<0?s:n).totalDuration()/100:1)):o<0?(t in i||(i[t]=a),i[t]):(l=parseFloat(t.charAt(o-1)+t.substr(o+1)),c&&n&&(l=l/100*(Sn(n)?n[0]:n).totalDuration()),o>1?r(e,t.substr(0,o-1),n)+l:a+l)):t==null?a:+t},Ta=function(e,t,n){var i=er(t[1]),s=(i?2:1)+(e<2?0:1),a=t[s],o,l;if(i&&(a.duration=t[1]),a.parent=n,e){for(o=a,l=n;l&&!("immediateRender"in o);)o=l.vars.defaults||{},l=Ln(l.vars.inherit)&&l.parent;a.immediateRender=Ln(o.immediateRender),e<2?a.runBackwards=1:a.startAt=t[s-1]}return new Gt(t[0],a,t[s+1])},Pr=function(e,t){return e||e===0?t(e):t},Ka=function(e,t,n){return n<e?e:n>t?t:n},gn=function(e,t){return!sn(e)||!(t=h_.exec(e))?"":t[1]},E_=function(e,t,n){return Pr(n,function(i){return Ka(e,t,i)})},Uc=[].slice,Yd=function(e,t){return e&&Fi(e)&&"length"in e&&(!t&&!e.length||e.length-1 in e&&Fi(e[0]))&&!e.nodeType&&e!==Ei},T_=function(e,t,n){return n===void 0&&(n=[]),e.forEach(function(i){var s;return sn(i)&&!t||Yd(i,1)?(s=n).push.apply(s,ci(i)):n.push(i)})||n},ci=function(e,t,n){return Pt&&!t&&Pt.selector?Pt.selector(e):sn(e)&&!n&&(Dc||!js())?Uc.call((t||Ju).querySelectorAll(e),0):Sn(e)?T_(e,n):Yd(e)?Uc.call(e,0):e?[e]:[]},Fc=function(e){return e=ci(e)[0]||Oa("Invalid scope")||{},function(t){var n=e.current||e.nativeElement||e;return ci(t,n.querySelectorAll?n:n===e?Oa("Invalid scope")||Ju.createElement("div"):e)}},qd=function(e){return e.sort(function(){return .5-Math.random()})},$d=function(e){if(Ut(e))return e;var t=Fi(e)?e:{each:e},n=Jr(t.ease),i=t.from||0,s=parseFloat(t.base)||0,a={},o=i>0&&i<1,l=isNaN(i)||o,c=t.axis,u=i,d=i;return sn(i)?u=d={center:.5,edges:.5,end:1}[i]||0:!o&&l&&(u=i[0],d=i[1]),function(f,h,_){var g=(_||t).length,p=a[g],m,v,b,S,w,E,A,x,y;if(!p){if(y=t.grid==="auto"?0:(t.grid||[1,li])[1],!y){for(A=-li;A<(A=_[y++].getBoundingClientRect().left)&&y<g;);y<g&&y--}for(p=a[g]=[],m=l?Math.min(y,g)*u-.5:i%y,v=y===li?0:l?g*d/y-.5:i/y|0,A=0,x=li,E=0;E<g;E++)b=E%y-m,S=v-(E/y|0),p[E]=w=c?Math.abs(c==="y"?S:b):Dd(b*b+S*S),w>A&&(A=w),w<x&&(x=w);i==="random"&&qd(p),p.max=A-x,p.min=x,p.v=g=(parseFloat(t.amount)||parseFloat(t.each)*(y>g?g-1:c?c==="y"?g/y:y:Math.max(y,g/y))||0)*(i==="edges"?-1:1),p.b=g<0?s-g:s,p.u=gn(t.amount||t.each)||0,n=n&&g<0?sp(n):n}return g=(p[f]-p.min)/p.max||0,Dt(p.b+(n?n(g):g)*p.v)+p.u}},Oc=function(e){var t=Math.pow(10,((e+"").split(".")[1]||"").length);return function(n){var i=Dt(Math.round(parseFloat(n)/e)*e*t);return(i-i%1)/t+(er(n)?0:gn(n))}},Kd=function(e,t){var n=Sn(e),i,s;return!n&&Fi(e)&&(i=n=e.radius||li,e.values?(e=ci(e.values),(s=!er(e[0]))&&(i*=i)):e=Oc(e.increment)),Pr(t,n?Ut(e)?function(a){return s=e(a),Math.abs(s-a)<=i?s:a}:function(a){for(var o=parseFloat(s?a.x:a),l=parseFloat(s?a.y:0),c=li,u=0,d=e.length,f,h;d--;)s?(f=e[d].x-o,h=e[d].y-l,f=f*f+h*h):f=Math.abs(e[d]-o),f<c&&(c=f,u=d);return u=!i||c<=i?e[u]:a,s||u===a||er(a)?u:u+gn(a)}:Oc(e))},Zd=function(e,t,n,i){return Pr(Sn(e)?!t:n===!0?!!(n=0):!i,function(){return Sn(e)?e[~~(Math.random()*e.length)]:(n=n||1e-5)&&(i=n<1?Math.pow(10,(n+"").length-2):1)&&Math.floor(Math.round((e-n/2+Math.random()*(t-e+n*.99))/n)*n*i)/i})},w_=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(i){return t.reduce(function(s,a){return a(s)},i)}},A_=function(e,t){return function(n){return e(parseFloat(n))+(t||gn(n))}},C_=function(e,t,n){return Qd(e,t,0,1,n)},Jd=function(e,t,n){return Pr(n,function(i){return e[~~t(i)]})},R_=function r(e,t,n){var i=t-e;return Sn(e)?Jd(e,r(0,e.length),t):Pr(n,function(s){return(i+(s-e)%i)%i+e})},P_=function r(e,t,n){var i=t-e,s=i*2;return Sn(e)?Jd(e,r(0,e.length-1),t):Pr(n,function(a){return a=(s+(a-e)%s)%s||0,e+(a>i?s-a:a)})},ka=function(e){return e.replace(c_,function(t){var n=t.indexOf("[")+1,i=t.substring(n||7,n?t.indexOf("]"):t.length-1).split(u_);return Zd(n?i:+i[0],n?0:+i[1],+i[2]||1e-5)})},Qd=function(e,t,n,i,s){var a=t-e,o=i-n;return Pr(s,function(l){return n+((l-e)/a*o||0)})},D_=function r(e,t,n,i){var s=isNaN(e+t)?0:function(h){return(1-h)*e+h*t};if(!s){var a=sn(e),o={},l,c,u,d,f;if(n===!0&&(i=1)&&(n=null),a)e={p:e},t={p:t};else if(Sn(e)&&!Sn(t)){for(u=[],d=e.length,f=d-2,c=1;c<d;c++)u.push(r(e[c-1],e[c]));d--,s=function(_){_*=d;var g=Math.min(f,~~_);return u[g](_-g)},n=t}else i||(e=Gs(Sn(e)?[]:{},e));if(!u){for(l in t)sf.call(o,e,l,"get",t[l]);s=function(_){return cf(_,o)||(a?e.p:e)}}}return Pr(n,s)},Hf=function(e,t,n){var i=e.labels,s=li,a,o,l;for(a in i)o=i[a]-t,o<0==!!n&&o&&s>(o=Math.abs(o))&&(l=a,s=o);return l},Yn=function(e,t,n){var i=e.vars,s=i[t],a=Pt,o=e._ctx,l,c,u;if(s)return l=i[t+"Params"],c=i.callbackScope||e,n&&yr.length&&ll(),o&&(Pt=o),u=l?s.apply(c,l):s.call(c),Pt=a,u},ma=function(e){return Tr(e),e.scrollTrigger&&e.scrollTrigger.kill(!!cn),e.progress()<1&&Yn(e,"onInterrupt"),e},Ls,ep=[],tp=function(e){if(e)if(e=!e.name&&e.default||e,Zu()||e.headless){var t=e.name,n=Ut(e),i=t&&!n&&e.init?function(){this._props=[]}:e,s={init:Ba,render:cf,add:sf,kill:Y_,modifier:j_,rawVars:0},a={targetTest:0,get:0,getSetter:lf,aliases:{},register:0};if(js(),e!==i){if(Gn[t])return;Jn(i,Jn(cl(e,s),a)),Gs(i.prototype,Gs(s,cl(e,a))),Gn[i.prop=t]=i,e.targetTest&&(Yo.push(i),ef[t]=1),t=(t==="css"?"CSS":t.charAt(0).toUpperCase()+t.substr(1))+"Plugin"}Od(t,i),e.register&&e.register(On,i,In)}else ep.push(e)},bt=255,_a={aqua:[0,bt,bt],lime:[0,bt,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,bt],navy:[0,0,128],white:[bt,bt,bt],olive:[128,128,0],yellow:[bt,bt,0],orange:[bt,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[bt,0,0],pink:[bt,192,203],cyan:[0,bt,bt],transparent:[bt,bt,bt,0]},Fl=function(e,t,n){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(n-t)*e*6:e<.5?n:e*3<2?t+(n-t)*(2/3-e)*6:t)*bt+.5|0},np=function(e,t,n){var i=e?er(e)?[e>>16,e>>8&bt,e&bt]:0:_a.black,s,a,o,l,c,u,d,f,h,_;if(!i){if(e.substr(-1)===","&&(e=e.substr(0,e.length-1)),_a[e])i=_a[e];else if(e.charAt(0)==="#"){if(e.length<6&&(s=e.charAt(1),a=e.charAt(2),o=e.charAt(3),e="#"+s+s+a+a+o+o+(e.length===5?e.charAt(4)+e.charAt(4):"")),e.length===9)return i=parseInt(e.substr(1,6),16),[i>>16,i>>8&bt,i&bt,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),i=[e>>16,e>>8&bt,e&bt]}else if(e.substr(0,3)==="hsl"){if(i=_=e.match(Of),!t)l=+i[0]%360/360,c=+i[1]/100,u=+i[2]/100,a=u<=.5?u*(c+1):u+c-u*c,s=u*2-a,i.length>3&&(i[3]*=1),i[0]=Fl(l+1/3,s,a),i[1]=Fl(l,s,a),i[2]=Fl(l-1/3,s,a);else if(~e.indexOf("="))return i=e.match(Nd),n&&i.length<4&&(i[3]=1),i}else i=e.match(Of)||_a.transparent;i=i.map(Number)}return t&&!_&&(s=i[0]/bt,a=i[1]/bt,o=i[2]/bt,d=Math.max(s,a,o),f=Math.min(s,a,o),u=(d+f)/2,d===f?l=c=0:(h=d-f,c=u>.5?h/(2-d-f):h/(d+f),l=d===s?(a-o)/h+(a<o?6:0):d===a?(o-s)/h+2:(s-a)/h+4,l*=60),i[0]=~~(l+.5),i[1]=~~(c*100+.5),i[2]=~~(u*100+.5)),n&&i.length<4&&(i[3]=1),i},ip=function(e){var t=[],n=[],i=-1;return e.split(br).forEach(function(s){var a=s.match(Ds)||[];t.push.apply(t,a),n.push(i+=a.length+1)}),t.c=n,t},Gf=function(e,t,n){var i="",s=(e+i).match(br),a=t?"hsla(":"rgba(",o=0,l,c,u,d;if(!s)return e;if(s=s.map(function(f){return(f=np(f,t,1))&&a+(t?f[0]+","+f[1]+"%,"+f[2]+"%,"+f[3]:f.join(","))+")"}),n&&(u=ip(e),l=n.c,l.join(i)!==u.c.join(i)))for(c=e.replace(br,"1").split(Ds),d=c.length-1;o<d;o++)i+=c[o]+(~l.indexOf(o)?s.shift()||a+"0,0,0,0)":(u.length?u:s.length?s:n).shift());if(!c)for(c=e.split(br),d=c.length-1;o<d;o++)i+=c[o]+s[o];return i+c[d]},br=(function(){var r="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",e;for(e in _a)r+="|"+e+"\\b";return new RegExp(r+")","gi")})(),L_=/hsl[a]?\(/,rp=function(e){var t=e.join(" "),n;if(br.lastIndex=0,br.test(t))return n=L_.test(t),e[1]=Gf(e[1],n),e[0]=Gf(e[0],n,ip(e[1])),!0},za,Xn=(function(){var r=Date.now,e=500,t=33,n=r(),i=n,s=1e3/240,a=s,o=[],l,c,u,d,f,h,_=function g(p){var m=r()-i,v=p===!0,b,S,w,E;if((m>e||m<0)&&(n+=m-t),i+=m,w=i-n,b=w-a,(b>0||v)&&(E=++d.frame,f=w-d.time*1e3,d.time=w=w/1e3,a+=b+(b>=s?4:s-b),S=1),v||(l=c(g)),S)for(h=0;h<o.length;h++)o[h](w,f,E,p)};return d={time:0,frame:0,tick:function(){_(!0)},deltaRatio:function(p){return f/(1e3/(p||60))},wake:function(){Ud&&(!Dc&&Zu()&&(Ei=Dc=window,Ju=Ei.document||{},Zn.gsap=On,(Ei.gsapVersions||(Ei.gsapVersions=[])).push(On.version),Fd(ol||Ei.GreenSockGlobals||!Ei.gsap&&Ei||{}),ep.forEach(tp)),u=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&d.sleep(),c=u||function(p){return setTimeout(p,a-d.time*1e3+1|0)},za=1,_(2))},sleep:function(){(u?cancelAnimationFrame:clearTimeout)(l),za=0,c=Ba},lagSmoothing:function(p,m){e=p||1/0,t=Math.min(m||33,e)},fps:function(p){s=1e3/(p||240),a=d.time*1e3+s},add:function(p,m,v){var b=m?function(S,w,E,A){p(S,w,E,A),d.remove(b)}:p;return d.remove(p),o[v?"unshift":"push"](b),js(),b},remove:function(p,m){~(m=o.indexOf(p))&&o.splice(m,1)&&h>=m&&h--},_listeners:o},d})(),js=function(){return!za&&Xn.wake()},ot={},N_=/^[\d.\-M][\d.\-,\s]/,I_=/["']/g,U_=function(e){for(var t={},n=e.substr(1,e.length-3).split(":"),i=n[0],s=1,a=n.length,o,l,c;s<a;s++)l=n[s],o=s!==a-1?l.lastIndexOf(","):l.length,c=l.substr(0,o),t[i]=isNaN(c)?c.replace(I_,"").trim():+c,i=l.substr(o+1).trim();return t},F_=function(e){var t=e.indexOf("(")+1,n=e.indexOf(")"),i=e.indexOf("(",t);return e.substring(t,~i&&i<n?e.indexOf(")",n+1):n)},O_=function(e){var t=(e+"").split("("),n=ot[t[0]];return n&&t.length>1&&n.config?n.config.apply(null,~e.indexOf("{")?[U_(t[1])]:F_(e).split(",").map(Vd)):ot._CE&&N_.test(e)?ot._CE("",e):n},sp=function(e){return function(t){return 1-e(1-t)}},ap=function r(e,t){for(var n=e._first,i;n;)n instanceof An?r(n,t):n.vars.yoyoEase&&(!n._yoyo||!n._repeat)&&n._yoyo!==t&&(n.timeline?r(n.timeline,t):(i=n._ease,n._ease=n._yEase,n._yEase=i,n._yoyo=t)),n=n._next},Jr=function(e,t){return e&&(Ut(e)?e:ot[e]||O_(e))||t},os=function(e,t,n,i){n===void 0&&(n=function(l){return 1-t(1-l)}),i===void 0&&(i=function(l){return l<.5?t(l*2)/2:1-t((1-l)*2)/2});var s={easeIn:t,easeOut:n,easeInOut:i},a;return Nn(e,function(o){ot[o]=Zn[o]=s,ot[a=o.toLowerCase()]=n;for(var l in s)ot[a+(l==="easeIn"?".in":l==="easeOut"?".out":".inOut")]=ot[o+"."+l]=s[l]}),s},op=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},Ol=function r(e,t,n){var i=t>=1?t:1,s=(n||(e?.3:.45))/(t<1?t:1),a=s/Pc*(Math.asin(1/i)||0),o=function(u){return u===1?1:i*Math.pow(2,-10*u)*l_((u-a)*s)+1},l=e==="out"?o:e==="in"?function(c){return 1-o(1-c)}:op(o);return s=Pc/s,l.config=function(c,u){return r(e,c,u)},l},Bl=function r(e,t){t===void 0&&(t=1.70158);var n=function(a){return a?--a*a*((t+1)*a+t)+1:0},i=e==="out"?n:e==="in"?function(s){return 1-n(1-s)}:op(n);return i.config=function(s){return r(e,s)},i};Nn("Linear,Quad,Cubic,Quart,Quint,Strong",function(r,e){var t=e<5?e+1:e;os(r+",Power"+(t-1),e?function(n){return Math.pow(n,t)}:function(n){return n},function(n){return 1-Math.pow(1-n,t)},function(n){return n<.5?Math.pow(n*2,t)/2:1-Math.pow((1-n)*2,t)/2})});ot.Linear.easeNone=ot.none=ot.Linear.easeIn;os("Elastic",Ol("in"),Ol("out"),Ol());(function(r,e){var t=1/e,n=2*t,i=2.5*t,s=function(o){return o<t?r*o*o:o<n?r*Math.pow(o-1.5/e,2)+.75:o<i?r*(o-=2.25/e)*o+.9375:r*Math.pow(o-2.625/e,2)+.984375};os("Bounce",function(a){return 1-s(1-a)},s)})(7.5625,2.75);os("Expo",function(r){return Math.pow(2,10*(r-1))*r+r*r*r*r*r*r*(1-r)});os("Circ",function(r){return-(Dd(1-r*r)-1)});os("Sine",function(r){return r===1?1:-o_(r*s_)+1});os("Back",Bl("in"),Bl("out"),Bl());ot.SteppedEase=ot.steps=Zn.SteppedEase={config:function(e,t){e===void 0&&(e=1);var n=1/e,i=e+(t?0:1),s=t?1:0,a=1-Et;return function(o){return((i*Ka(0,a,o)|0)+s)*n}}};Hs.ease=ot["quad.out"];Nn("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(r){return tf+=r+","+r+"Params,"});var lp=function(e,t){this.id=a_++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:kd,this.set=t?t.getSetter:lf},Va=(function(){function r(t){this.vars=t,this._delay=+t.delay||0,(this._repeat=t.repeat===1/0?-2:t.repeat||0)&&(this._rDelay=t.repeatDelay||0,this._yoyo=!!t.yoyo||!!t.yoyoEase),this._ts=1,Xs(this,+t.duration,1,1),this.data=t.data,Pt&&(this._ctx=Pt,Pt.data.push(this)),za||Xn.wake()}var e=r.prototype;return e.delay=function(n){return n||n===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+n-this._delay),this._delay=n,this):this._delay},e.duration=function(n){return arguments.length?this.totalDuration(this._repeat>0?n+(n+this._rDelay)*this._repeat:n):this.totalDuration()&&this._dur},e.totalDuration=function(n){return arguments.length?(this._dirty=0,Xs(this,this._repeat<0?n:(n-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},e.totalTime=function(n,i){if(js(),!arguments.length)return this._tTime;var s=this._dp;if(s&&s.smoothChildTiming&&this._ts){for(Al(this,n),!s._dp||s.parent||Wd(s,this);s&&s.parent;)s.parent._time!==s._start+(s._ts>=0?s._tTime/s._ts:(s.totalDuration()-s._tTime)/-s._ts)&&s.totalTime(s._tTime,!0),s=s.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&n<this._tDur||this._ts<0&&n>0||!this._tDur&&!n)&&Ai(this._dp,this,this._start-this._delay)}return(this._tTime!==n||!this._dur&&!i||this._initted&&Math.abs(this._zTime)===Et||!this._initted&&this._dur&&n||!n&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=n),zd(this,n,i)),this},e.time=function(n,i){return arguments.length?this.totalTime(Math.min(this.totalDuration(),n+zf(this))%(this._dur+this._rDelay)||(n?this._dur:0),i):this._time},e.totalProgress=function(n,i){return arguments.length?this.totalTime(this.totalDuration()*n,i):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},e.progress=function(n,i){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-n:n)+zf(this),i):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},e.iteration=function(n,i){var s=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(n-1)*s,i):this._repeat?Ws(this._tTime,s)+1:1},e.timeScale=function(n,i){if(!arguments.length)return this._rts===-Et?0:this._rts;if(this._rts===n)return this;var s=this.parent&&this._ts?ul(this.parent._time,this):this._tTime;return this._rts=+n||0,this._ts=this._ps||n===-Et?0:this._rts,this.totalTime(Ka(-Math.abs(this._delay),this.totalDuration(),s),i!==!1),wl(this),x_(this)},e.paused=function(n){return arguments.length?(this._ps!==n&&(this._ps=n,n?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(js(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==Et&&(this._tTime-=Et)))),this):this._ps},e.startTime=function(n){if(arguments.length){this._start=Dt(n);var i=this.parent||this._dp;return i&&(i._sort||!this.parent)&&Ai(i,this,this._start-this._delay),this}return this._start},e.endTime=function(n){return this._start+(Ln(n)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},e.rawTime=function(n){var i=this.parent||this._dp;return i?n&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?ul(i.rawTime(n),this):this._tTime:this._tTime},e.revert=function(n){n===void 0&&(n=p_);var i=cn;return cn=n,rf(this)&&(this.timeline&&this.timeline.revert(n),this.totalTime(-.01,n.suppressEvents)),this.data!=="nested"&&n.kill!==!1&&this.kill(),cn=i,this},e.globalTime=function(n){for(var i=this,s=arguments.length?n:i.rawTime();i;)s=i._start+s/(Math.abs(i._ts)||1),i=i._dp;return!this.parent&&this._sat?this._sat.globalTime(n):s},e.repeat=function(n){return arguments.length?(this._repeat=n===1/0?-2:n,Vf(this)):this._repeat===-2?1/0:this._repeat},e.repeatDelay=function(n){if(arguments.length){var i=this._time;return this._rDelay=n,Vf(this),i?this.time(i):this}return this._rDelay},e.yoyo=function(n){return arguments.length?(this._yoyo=n,this):this._yoyo},e.seek=function(n,i){return this.totalTime(ti(this,n),Ln(i))},e.restart=function(n,i){return this.play().totalTime(n?-this._delay:0,Ln(i)),this._dur||(this._zTime=-Et),this},e.play=function(n,i){return n!=null&&this.seek(n,i),this.reversed(!1).paused(!1)},e.reverse=function(n,i){return n!=null&&this.seek(n||this.totalDuration(),i),this.reversed(!0).paused(!1)},e.pause=function(n,i){return n!=null&&this.seek(n,i),this.paused(!0)},e.resume=function(){return this.paused(!1)},e.reversed=function(n){return arguments.length?(!!n!==this.reversed()&&this.timeScale(-this._rts||(n?-Et:0)),this):this._rts<0},e.invalidate=function(){return this._initted=this._act=0,this._zTime=-Et,this},e.isActive=function(){var n=this.parent||this._dp,i=this._start,s;return!!(!n||this._ts&&this._initted&&n.isActive()&&(s=n.rawTime(!0))>=i&&s<this.endTime(!0)-Et)},e.eventCallback=function(n,i,s){var a=this.vars;return arguments.length>1?(i?(a[n]=i,s&&(a[n+"Params"]=s),n==="onUpdate"&&(this._onUpdate=i)):delete a[n],this):a[n]},e.then=function(n){var i=this,s=i._prom;return new Promise(function(a){var o=Ut(n)?n:Hd,l=function(){var u=i.then;i.then=null,s&&s(),Ut(o)&&(o=o(i))&&(o.then||o===i)&&(i.then=u),a(o),i.then=u};i._initted&&i.totalProgress()===1&&i._ts>=0||!i._tTime&&i._ts<0?l():i._prom=l})},e.kill=function(){ma(this)},r})();Jn(Va.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-Et,_prom:0,_ps:!1,_rts:1});var An=(function(r){Pd(e,r);function e(n,i){var s;return n===void 0&&(n={}),s=r.call(this,n)||this,s.labels={},s.smoothChildTiming=!!n.smoothChildTiming,s.autoRemoveChildren=!!n.autoRemoveChildren,s._sort=Ln(n.sortChildren),Lt&&Ai(n.parent||Lt,Xi(s),i),n.reversed&&s.reverse(),n.paused&&s.paused(!0),n.scrollTrigger&&Xd(Xi(s),n.scrollTrigger),s}var t=e.prototype;return t.to=function(i,s,a){return Ta(0,arguments,this),this},t.from=function(i,s,a){return Ta(1,arguments,this),this},t.fromTo=function(i,s,a,o){return Ta(2,arguments,this),this},t.set=function(i,s,a){return s.duration=0,s.parent=this,Ea(s).repeatDelay||(s.repeat=0),s.immediateRender=!!s.immediateRender,new Gt(i,s,ti(this,a),1),this},t.call=function(i,s,a){return Ai(this,Gt.delayedCall(0,i,s),a)},t.staggerTo=function(i,s,a,o,l,c,u){return a.duration=s,a.stagger=a.stagger||o,a.onComplete=c,a.onCompleteParams=u,a.parent=this,new Gt(i,a,ti(this,l)),this},t.staggerFrom=function(i,s,a,o,l,c,u){return a.runBackwards=1,Ea(a).immediateRender=Ln(a.immediateRender),this.staggerTo(i,s,a,o,l,c,u)},t.staggerFromTo=function(i,s,a,o,l,c,u,d){return o.startAt=a,Ea(o).immediateRender=Ln(o.immediateRender),this.staggerTo(i,s,o,l,c,u,d)},t.render=function(i,s,a){var o=this._time,l=this._dirty?this.totalDuration():this._tDur,c=this._dur,u=i<=0?0:Dt(i),d=this._zTime<0!=i<0&&(this._initted||!c),f,h,_,g,p,m,v,b,S,w,E,A;if(this!==Lt&&u>l&&i>=0&&(u=l),u!==this._tTime||a||d){if(o!==this._time&&c&&(u+=this._time-o,i+=this._time-o),f=u,S=this._start,b=this._ts,m=!b,d&&(c||(o=this._zTime),(i||!s)&&(this._zTime=i)),this._repeat){if(E=this._yoyo,p=c+this._rDelay,this._repeat<-1&&i<0)return this.totalTime(p*100+i,s,a);if(f=Dt(u%p),u===l?(g=this._repeat,f=c):(w=Dt(u/p),g=~~w,g&&g===w&&(f=c,g--),f>c&&(f=c)),w=Ws(this._tTime,p),!o&&this._tTime&&w!==g&&this._tTime-w*p-this._dur<=0&&(w=g),E&&g&1&&(f=c-f,A=1),g!==w&&!this._lock){var x=E&&w&1,y=x===(E&&g&1);if(g<w&&(x=!x),o=x?0:u%c?c:u,this._lock=1,this.render(o||(A?0:Dt(g*p)),s,!c)._lock=0,this._tTime=u,!s&&this.parent&&Yn(this,"onRepeat"),this.vars.repeatRefresh&&!A&&(this.invalidate()._lock=1,w=g),o&&o!==this._time||m!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(c=this._dur,l=this._tDur,y&&(this._lock=2,o=x?c:-1e-4,this.render(o,!0),this.vars.repeatRefresh&&!A&&this.invalidate()),this._lock=0,!this._ts&&!m)return this;ap(this,A)}}if(this._hasPause&&!this._forcing&&this._lock<2&&(v=y_(this,Dt(o),Dt(f)),v&&(u-=f-(f=v._start))),this._tTime=u,this._time=f,this._act=!b,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=i,o=0),!o&&u&&c&&!s&&!w&&(Yn(this,"onStart"),this._tTime!==u))return this;if(f>=o&&i>=0)for(h=this._first;h;){if(_=h._next,(h._act||f>=h._start)&&h._ts&&v!==h){if(h.parent!==this)return this.render(i,s,a);if(h.render(h._ts>0?(f-h._start)*h._ts:(h._dirty?h.totalDuration():h._tDur)+(f-h._start)*h._ts,s,a),f!==this._time||!this._ts&&!m){v=0,_&&(u+=this._zTime=-Et);break}}h=_}else{h=this._last;for(var D=i<0?i:f;h;){if(_=h._prev,(h._act||D<=h._end)&&h._ts&&v!==h){if(h.parent!==this)return this.render(i,s,a);if(h.render(h._ts>0?(D-h._start)*h._ts:(h._dirty?h.totalDuration():h._tDur)+(D-h._start)*h._ts,s,a||cn&&rf(h)),f!==this._time||!this._ts&&!m){v=0,_&&(u+=this._zTime=D?-Et:Et);break}}h=_}}if(v&&!s&&(this.pause(),v.render(f>=o?0:-Et)._zTime=f>=o?1:-1,this._ts))return this._start=S,wl(this),this.render(i,s,a);this._onUpdate&&!s&&Yn(this,"onUpdate",!0),(u===l&&this._tTime>=this.totalDuration()||!u&&o)&&(S===this._start||Math.abs(b)!==Math.abs(this._ts))&&(this._lock||((i||!c)&&(u===l&&this._ts>0||!u&&this._ts<0)&&Tr(this,1),!s&&!(i<0&&!o)&&(u||o||!l)&&(Yn(this,u===l&&i>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(u<l&&this.timeScale()>0)&&this._prom())))}return this},t.add=function(i,s){var a=this;if(er(s)||(s=ti(this,s,i)),!(i instanceof Va)){if(Sn(i))return i.forEach(function(o){return a.add(o,s)}),this;if(sn(i))return this.addLabel(i,s);if(Ut(i))i=Gt.delayedCall(0,i);else return this}return this!==i?Ai(this,i,s):this},t.getChildren=function(i,s,a,o){i===void 0&&(i=!0),s===void 0&&(s=!0),a===void 0&&(a=!0),o===void 0&&(o=-li);for(var l=[],c=this._first;c;)c._start>=o&&(c instanceof Gt?s&&l.push(c):(a&&l.push(c),i&&l.push.apply(l,c.getChildren(!0,s,a)))),c=c._next;return l},t.getById=function(i){for(var s=this.getChildren(1,1,1),a=s.length;a--;)if(s[a].vars.id===i)return s[a]},t.remove=function(i){return sn(i)?this.removeLabel(i):Ut(i)?this.killTweensOf(i):(i.parent===this&&Tl(this,i),i===this._recent&&(this._recent=this._last),Zr(this))},t.totalTime=function(i,s){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=Dt(Xn.time-(this._ts>0?i/this._ts:(this.totalDuration()-i)/-this._ts))),r.prototype.totalTime.call(this,i,s),this._forcing=0,this):this._tTime},t.addLabel=function(i,s){return this.labels[i]=ti(this,s),this},t.removeLabel=function(i){return delete this.labels[i],this},t.addPause=function(i,s,a){var o=Gt.delayedCall(0,s||Ba,a);return o.data="isPause",this._hasPause=1,Ai(this,o,ti(this,i))},t.removePause=function(i){var s=this._first;for(i=ti(this,i);s;)s._start===i&&s.data==="isPause"&&Tr(s),s=s._next},t.killTweensOf=function(i,s,a){for(var o=this.getTweensOf(i,a),l=o.length;l--;)_r!==o[l]&&o[l].kill(i,s);return this},t.getTweensOf=function(i,s){for(var a=[],o=ci(i),l=this._first,c=er(s),u;l;)l instanceof Gt?m_(l._targets,o)&&(c?(!_r||l._initted&&l._ts)&&l.globalTime(0)<=s&&l.globalTime(l.totalDuration())>s:!s||l.isActive())&&a.push(l):(u=l.getTweensOf(o,s)).length&&a.push.apply(a,u),l=l._next;return a},t.tweenTo=function(i,s){s=s||{};var a=this,o=ti(a,i),l=s,c=l.startAt,u=l.onStart,d=l.onStartParams,f=l.immediateRender,h,_=Gt.to(a,Jn({ease:s.ease||"none",lazy:!1,immediateRender:!1,time:o,overwrite:"auto",duration:s.duration||Math.abs((o-(c&&"time"in c?c.time:a._time))/a.timeScale())||Et,onStart:function(){if(a.pause(),!h){var p=s.duration||Math.abs((o-(c&&"time"in c?c.time:a._time))/a.timeScale());_._dur!==p&&Xs(_,p,0,1).render(_._time,!0,!0),h=1}u&&u.apply(_,d||[])}},s));return f?_.render(0):_},t.tweenFromTo=function(i,s,a){return this.tweenTo(s,Jn({startAt:{time:ti(this,i)}},a))},t.recent=function(){return this._recent},t.nextLabel=function(i){return i===void 0&&(i=this._time),Hf(this,ti(this,i))},t.previousLabel=function(i){return i===void 0&&(i=this._time),Hf(this,ti(this,i),1)},t.currentLabel=function(i){return arguments.length?this.seek(i,!0):this.previousLabel(this._time+Et)},t.shiftChildren=function(i,s,a){a===void 0&&(a=0);var o=this._first,l=this.labels,c;for(i=Dt(i);o;)o._start>=a&&(o._start+=i,o._end+=i),o=o._next;if(s)for(c in l)l[c]>=a&&(l[c]+=i);return Zr(this)},t.invalidate=function(i){var s=this._first;for(this._lock=0;s;)s.invalidate(i),s=s._next;return r.prototype.invalidate.call(this,i)},t.clear=function(i){i===void 0&&(i=!0);for(var s=this._first,a;s;)a=s._next,this.remove(s),s=a;return this._dp&&(this._time=this._tTime=this._pTime=0),i&&(this.labels={}),Zr(this)},t.totalDuration=function(i){var s=0,a=this,o=a._last,l=li,c,u,d;if(arguments.length)return a.timeScale((a._repeat<0?a.duration():a.totalDuration())/(a.reversed()?-i:i));if(a._dirty){for(d=a.parent;o;)c=o._prev,o._dirty&&o.totalDuration(),u=o._start,u>l&&a._sort&&o._ts&&!a._lock?(a._lock=1,Ai(a,o,u-o._delay,1)._lock=0):l=u,u<0&&o._ts&&(s-=u,(!d&&!a._dp||d&&d.smoothChildTiming)&&(a._start+=Dt(u/a._ts),a._time-=u,a._tTime-=u),a.shiftChildren(-u,!1,-1/0),l=0),o._end>s&&o._ts&&(s=o._end),o=c;Xs(a,a===Lt&&a._time>s?a._time:s,1,1),a._dirty=0}return a._tDur},e.updateRoot=function(i){if(Lt._ts&&(zd(Lt,ul(i,Lt)),Bd=Xn.frame),Xn.frame>=Bf){Bf+=$n.autoSleep||120;var s=Lt._first;if((!s||!s._ts)&&$n.autoSleep&&Xn._listeners.length<2){for(;s&&!s._ts;)s=s._next;s||Xn.sleep()}}},e})(Va);Jn(An.prototype,{_lock:0,_hasPause:0,_forcing:0});var B_=function(e,t,n,i,s,a,o){var l=new In(this._pt,e,t,0,1,pp,null,s),c=0,u=0,d,f,h,_,g,p,m,v;for(l.b=n,l.e=i,n+="",i+="",(m=~i.indexOf("random("))&&(i=ka(i)),a&&(v=[n,i],a(v,e,t),n=v[0],i=v[1]),f=n.match(Il)||[];d=Il.exec(i);)_=d[0],g=i.substring(c,d.index),h?h=(h+1)%5:g.substr(-5)==="rgba("&&(h=1),_!==f[u++]&&(p=parseFloat(f[u-1])||0,l._pt={_next:l._pt,p:g||u===1?g:",",s:p,c:_.charAt(1)==="="?Is(p,_)-p:parseFloat(_)-p,m:h&&h<4?Math.round:0},c=Il.lastIndex);return l.c=c<i.length?i.substring(c,i.length):"",l.fp=o,(Id.test(i)||m)&&(l.e=0),this._pt=l,l},sf=function(e,t,n,i,s,a,o,l,c,u){Ut(i)&&(i=i(s||0,e,a));var d=e[t],f=n!=="get"?n:Ut(d)?c?e[t.indexOf("set")||!Ut(e["get"+t.substr(3)])?t:"get"+t.substr(3)](c):e[t]():d,h=Ut(d)?c?G_:hp:of,_;if(sn(i)&&(~i.indexOf("random(")&&(i=ka(i)),i.charAt(1)==="="&&(_=Is(f,i)+(gn(f)||0),(_||_===0)&&(i=_))),!u||f!==i||Bc)return!isNaN(f*i)&&i!==""?(_=new In(this._pt,e,t,+f||0,i-(f||0),typeof d=="boolean"?X_:dp,0,h),c&&(_.fp=c),o&&_.modifier(o,this,e),this._pt=_):(!d&&!(t in e)&&Qu(t,i),B_.call(this,e,t,f,i,h,l||$n.stringFilter,c))},k_=function(e,t,n,i,s){if(Ut(e)&&(e=wa(e,s,t,n,i)),!Fi(e)||e.style&&e.nodeType||Sn(e)||Ld(e))return sn(e)?wa(e,s,t,n,i):e;var a={},o;for(o in e)a[o]=wa(e[o],s,t,n,i);return a},cp=function(e,t,n,i,s,a){var o,l,c,u;if(Gn[e]&&(o=new Gn[e]).init(s,o.rawVars?t[e]:k_(t[e],i,s,a,n),n,i,a)!==!1&&(n._pt=l=new In(n._pt,s,e,0,1,o.render,o,0,o.priority),n!==Ls))for(c=n._ptLookup[n._targets.indexOf(s)],u=o._props.length;u--;)c[o._props[u]]=l;return o},_r,Bc,af=function r(e,t,n){var i=e.vars,s=i.ease,a=i.startAt,o=i.immediateRender,l=i.lazy,c=i.onUpdate,u=i.runBackwards,d=i.yoyoEase,f=i.keyframes,h=i.autoRevert,_=e._dur,g=e._startAt,p=e._targets,m=e.parent,v=m&&m.data==="nested"?m.vars.targets:p,b=e._overwrite==="auto"&&!$u,S=e.timeline,w,E,A,x,y,D,P,I,k,V,H,z,B;if(S&&(!f||!s)&&(s="none"),e._ease=Jr(s,Hs.ease),e._yEase=d?sp(Jr(d===!0?s:d,Hs.ease)):0,d&&e._yoyo&&!e._repeat&&(d=e._yEase,e._yEase=e._ease,e._ease=d),e._from=!S&&!!i.runBackwards,!S||f&&!i.stagger){if(I=p[0]?Kr(p[0]).harness:0,z=I&&i[I.prop],w=cl(i,ef),g&&(g._zTime<0&&g.progress(1),t<0&&u&&o&&!h?g.render(-1,!0):g.revert(u&&_?jo:d_),g._lazy=0),a){if(Tr(e._startAt=Gt.set(p,Jn({data:"isStart",overwrite:!1,parent:m,immediateRender:!0,lazy:!g&&Ln(l),startAt:null,delay:0,onUpdate:c&&function(){return Yn(e,"onUpdate")},stagger:0},a))),e._startAt._dp=0,e._startAt._sat=e,t<0&&(cn||!o&&!h)&&e._startAt.revert(jo),o&&_&&t<=0&&n<=0){t&&(e._zTime=t);return}}else if(u&&_&&!g){if(t&&(o=!1),A=Jn({overwrite:!1,data:"isFromStart",lazy:o&&!g&&Ln(l),immediateRender:o,stagger:0,parent:m},w),z&&(A[I.prop]=z),Tr(e._startAt=Gt.set(p,A)),e._startAt._dp=0,e._startAt._sat=e,t<0&&(cn?e._startAt.revert(jo):e._startAt.render(-1,!0)),e._zTime=t,!o)r(e._startAt,Et,Et);else if(!t)return}for(e._pt=e._ptCache=0,l=_&&Ln(l)||l&&!_,E=0;E<p.length;E++){if(y=p[E],P=y._gsap||nf(p)[E]._gsap,e._ptLookup[E]=V={},Lc[P.id]&&yr.length&&ll(),H=v===p?E:v.indexOf(y),I&&(k=new I).init(y,z||w,e,H,v)!==!1&&(e._pt=x=new In(e._pt,y,k.name,0,1,k.render,k,0,k.priority),k._props.forEach(function(Q){V[Q]=x}),k.priority&&(D=1)),!I||z)for(A in w)Gn[A]&&(k=cp(A,w,e,H,y,v))?k.priority&&(D=1):V[A]=x=sf.call(e,y,A,"get",w[A],H,v,0,i.stringFilter);e._op&&e._op[E]&&e.kill(y,e._op[E]),b&&e._pt&&(_r=e,Lt.killTweensOf(y,V,e.globalTime(t)),B=!e.parent,_r=0),e._pt&&l&&(Lc[P.id]=1)}D&&mp(e),e._onInit&&e._onInit(e)}e._onUpdate=c,e._initted=(!e._op||e._pt)&&!B,f&&t<=0&&S.render(li,!0,!0)},z_=function(e,t,n,i,s,a,o,l){var c=(e._pt&&e._ptCache||(e._ptCache={}))[t],u,d,f,h;if(!c)for(c=e._ptCache[t]=[],f=e._ptLookup,h=e._targets.length;h--;){if(u=f[h][t],u&&u.d&&u.d._pt)for(u=u.d._pt;u&&u.p!==t&&u.fp!==t;)u=u._next;if(!u)return Bc=1,e.vars[t]="+=0",af(e,o),Bc=0,l?Oa(t+" not eligible for reset"):1;c.push(u)}for(h=c.length;h--;)d=c[h],u=d._pt||d,u.s=(i||i===0)&&!s?i:u.s+(i||0)+a*u.c,u.c=n-u.s,d.e&&(d.e=Bt(n)+gn(d.e)),d.b&&(d.b=u.s+gn(d.b))},V_=function(e,t){var n=e[0]?Kr(e[0]).harness:0,i=n&&n.aliases,s,a,o,l;if(!i)return t;s=Gs({},t);for(a in i)if(a in s)for(l=i[a].split(","),o=l.length;o--;)s[l[o]]=s[a];return s},H_=function(e,t,n,i){var s=t.ease||i||"power1.inOut",a,o;if(Sn(t))o=n[e]||(n[e]=[]),t.forEach(function(l,c){return o.push({t:c/(t.length-1)*100,v:l,e:s})});else for(a in t)o=n[a]||(n[a]=[]),a==="ease"||o.push({t:parseFloat(e),v:t[a],e:s})},wa=function(e,t,n,i,s){return Ut(e)?e.call(t,n,i,s):sn(e)&&~e.indexOf("random(")?ka(e):e},up=tf+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",fp={};Nn(up+",id,stagger,delay,duration,paused,scrollTrigger",function(r){return fp[r]=1});var Gt=(function(r){Pd(e,r);function e(n,i,s,a){var o;typeof i=="number"&&(s.duration=i,i=s,s=null),o=r.call(this,a?i:Ea(i))||this;var l=o.vars,c=l.duration,u=l.delay,d=l.immediateRender,f=l.stagger,h=l.overwrite,_=l.keyframes,g=l.defaults,p=l.scrollTrigger,m=l.yoyoEase,v=i.parent||Lt,b=(Sn(n)||Ld(n)?er(n[0]):"length"in i)?[n]:ci(n),S,w,E,A,x,y,D,P;if(o._targets=b.length?nf(b):Oa("GSAP target "+n+" not found. https://gsap.com",!$n.nullTargetWarn)||[],o._ptLookup=[],o._overwrite=h,_||f||to(c)||to(u)){if(i=o.vars,S=o.timeline=new An({data:"nested",defaults:g||{},targets:v&&v.data==="nested"?v.vars.targets:b}),S.kill(),S.parent=S._dp=Xi(o),S._start=0,f||to(c)||to(u)){if(A=b.length,D=f&&$d(f),Fi(f))for(x in f)~up.indexOf(x)&&(P||(P={}),P[x]=f[x]);for(w=0;w<A;w++)E=cl(i,fp),E.stagger=0,m&&(E.yoyoEase=m),P&&Gs(E,P),y=b[w],E.duration=+wa(c,Xi(o),w,y,b),E.delay=(+wa(u,Xi(o),w,y,b)||0)-o._delay,!f&&A===1&&E.delay&&(o._delay=u=E.delay,o._start+=u,E.delay=0),S.to(y,E,D?D(w,y,b):0),S._ease=ot.none;S.duration()?c=u=0:o.timeline=0}else if(_){Ea(Jn(S.vars.defaults,{ease:"none"})),S._ease=Jr(_.ease||i.ease||"none");var I=0,k,V,H;if(Sn(_))_.forEach(function(z){return S.to(b,z,">")}),S.duration();else{E={};for(x in _)x==="ease"||x==="easeEach"||H_(x,_[x],E,_.easeEach);for(x in E)for(k=E[x].sort(function(z,B){return z.t-B.t}),I=0,w=0;w<k.length;w++)V=k[w],H={ease:V.e,duration:(V.t-(w?k[w-1].t:0))/100*c},H[x]=V.v,S.to(b,H,I),I+=H.duration;S.duration()<c&&S.to({},{duration:c-S.duration()})}}c||o.duration(c=S.duration())}else o.timeline=0;return h===!0&&!$u&&(_r=Xi(o),Lt.killTweensOf(b),_r=0),Ai(v,Xi(o),s),i.reversed&&o.reverse(),i.paused&&o.paused(!0),(d||!c&&!_&&o._start===Dt(v._time)&&Ln(d)&&v_(Xi(o))&&v.data!=="nested")&&(o._tTime=-Et,o.render(Math.max(0,-u)||0)),p&&Xd(Xi(o),p),o}var t=e.prototype;return t.render=function(i,s,a){var o=this._time,l=this._tDur,c=this._dur,u=i<0,d=i>l-Et&&!u?l:i<Et?0:i,f,h,_,g,p,m,v,b,S;if(!c)M_(this,i,s,a);else if(d!==this._tTime||!i||a||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==u||this._lazy){if(f=d,b=this.timeline,this._repeat){if(g=c+this._rDelay,this._repeat<-1&&u)return this.totalTime(g*100+i,s,a);if(f=Dt(d%g),d===l?(_=this._repeat,f=c):(p=Dt(d/g),_=~~p,_&&_===p?(f=c,_--):f>c&&(f=c)),m=this._yoyo&&_&1,m&&(S=this._yEase,f=c-f),p=Ws(this._tTime,g),f===o&&!a&&this._initted&&_===p)return this._tTime=d,this;_!==p&&(b&&this._yEase&&ap(b,m),this.vars.repeatRefresh&&!m&&!this._lock&&f!==g&&this._initted&&(this._lock=a=1,this.render(Dt(g*_),!0).invalidate()._lock=0))}if(!this._initted){if(jd(this,u?i:f,a,s,d))return this._tTime=0,this;if(o!==this._time&&!(a&&this.vars.repeatRefresh&&_!==p))return this;if(c!==this._dur)return this.render(i,s,a)}if(this._tTime=d,this._time=f,!this._act&&this._ts&&(this._act=1,this._lazy=0),this.ratio=v=(S||this._ease)(f/c),this._from&&(this.ratio=v=1-v),!o&&d&&!s&&!p&&(Yn(this,"onStart"),this._tTime!==d))return this;for(h=this._pt;h;)h.r(v,h.d),h=h._next;b&&b.render(i<0?i:b._dur*b._ease(f/this._dur),s,a)||this._startAt&&(this._zTime=i),this._onUpdate&&!s&&(u&&Nc(this,i,s,a),Yn(this,"onUpdate")),this._repeat&&_!==p&&this.vars.onRepeat&&!s&&this.parent&&Yn(this,"onRepeat"),(d===this._tDur||!d)&&this._tTime===d&&(u&&!this._onUpdate&&Nc(this,i,!0,!0),(i||!c)&&(d===this._tDur&&this._ts>0||!d&&this._ts<0)&&Tr(this,1),!s&&!(u&&!o)&&(d||o||m)&&(Yn(this,d===l?"onComplete":"onReverseComplete",!0),this._prom&&!(d<l&&this.timeScale()>0)&&this._prom()))}return this},t.targets=function(){return this._targets},t.invalidate=function(i){return(!i||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(i),r.prototype.invalidate.call(this,i)},t.resetTo=function(i,s,a,o,l){za||Xn.wake(),this._ts||this.play();var c=Math.min(this._dur,(this._dp._time-this._start)*this._ts),u;return this._initted||af(this,c),u=this._ease(c/this._dur),z_(this,i,s,a,o,u,c,l)?this.resetTo(i,s,a,o,1):(Al(this,0),this.parent||Gd(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},t.kill=function(i,s){if(s===void 0&&(s="all"),!i&&(!s||s==="all"))return this._lazy=this._pt=0,this.parent?ma(this):this.scrollTrigger&&this.scrollTrigger.kill(!!cn),this;if(this.timeline){var a=this.timeline.totalDuration();return this.timeline.killTweensOf(i,s,_r&&_r.vars.overwrite!==!0)._first||ma(this),this.parent&&a!==this.timeline.totalDuration()&&Xs(this,this._dur*this.timeline._tDur/a,0,1),this}var o=this._targets,l=i?ci(i):o,c=this._ptLookup,u=this._pt,d,f,h,_,g,p,m;if((!s||s==="all")&&g_(o,l))return s==="all"&&(this._pt=0),ma(this);for(d=this._op=this._op||[],s!=="all"&&(sn(s)&&(g={},Nn(s,function(v){return g[v]=1}),s=g),s=V_(o,s)),m=o.length;m--;)if(~l.indexOf(o[m])){f=c[m],s==="all"?(d[m]=s,_=f,h={}):(h=d[m]=d[m]||{},_=s);for(g in _)p=f&&f[g],p&&((!("kill"in p.d)||p.d.kill(g)===!0)&&Tl(this,p,"_pt"),delete f[g]),h!=="all"&&(h[g]=1)}return this._initted&&!this._pt&&u&&ma(this),this},e.to=function(i,s){return new e(i,s,arguments[2])},e.from=function(i,s){return Ta(1,arguments)},e.delayedCall=function(i,s,a,o){return new e(s,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:i,onComplete:s,onReverseComplete:s,onCompleteParams:a,onReverseCompleteParams:a,callbackScope:o})},e.fromTo=function(i,s,a){return Ta(2,arguments)},e.set=function(i,s){return s.duration=0,s.repeatDelay||(s.repeat=0),new e(i,s)},e.killTweensOf=function(i,s,a){return Lt.killTweensOf(i,s,a)},e})(Va);Jn(Gt.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});Nn("staggerTo,staggerFrom,staggerFromTo",function(r){Gt[r]=function(){var e=new An,t=Uc.call(arguments,0);return t.splice(r==="staggerFromTo"?5:4,0,0),e[r].apply(e,t)}});var of=function(e,t,n){return e[t]=n},hp=function(e,t,n){return e[t](n)},G_=function(e,t,n,i){return e[t](i.fp,n)},W_=function(e,t,n){return e.setAttribute(t,n)},lf=function(e,t){return Ut(e[t])?hp:Ku(e[t])&&e.setAttribute?W_:of},dp=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},X_=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},pp=function(e,t){var n=t._pt,i="";if(!e&&t.b)i=t.b;else if(e===1&&t.e)i=t.e;else{for(;n;)i=n.p+(n.m?n.m(n.s+n.c*e):Math.round((n.s+n.c*e)*1e4)/1e4)+i,n=n._next;i+=t.c}t.set(t.t,t.p,i,t)},cf=function(e,t){for(var n=t._pt;n;)n.r(e,n.d),n=n._next},j_=function(e,t,n,i){for(var s=this._pt,a;s;)a=s._next,s.p===i&&s.modifier(e,t,n),s=a},Y_=function(e){for(var t=this._pt,n,i;t;)i=t._next,t.p===e&&!t.op||t.op===e?Tl(this,t,"_pt"):t.dep||(n=1),t=i;return!n},q_=function(e,t,n,i){i.mSet(e,t,i.m.call(i.tween,n,i.mt),i)},mp=function(e){for(var t=e._pt,n,i,s,a;t;){for(n=t._next,i=s;i&&i.pr>t.pr;)i=i._next;(t._prev=i?i._prev:a)?t._prev._next=t:s=t,(t._next=i)?i._prev=t:a=t,t=n}e._pt=s},In=(function(){function r(t,n,i,s,a,o,l,c,u){this.t=n,this.s=s,this.c=a,this.p=i,this.r=o||dp,this.d=l||this,this.set=c||of,this.pr=u||0,this._next=t,t&&(t._prev=this)}var e=r.prototype;return e.modifier=function(n,i,s){this.mSet=this.mSet||this.set,this.set=q_,this.m=n,this.mt=s,this.tween=i},r})();Nn(tf+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",function(r){return ef[r]=1});Zn.TweenMax=Zn.TweenLite=Gt;Zn.TimelineLite=Zn.TimelineMax=An;Lt=new An({sortChildren:!1,defaults:Hs,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});$n.stringFilter=rp;var Qr=[],qo={},$_=[],Wf=0,K_=0,kl=function(e){return(qo[e]||$_).map(function(t){return t()})},kc=function(){var e=Date.now(),t=[];e-Wf>2&&(kl("matchMediaInit"),Qr.forEach(function(n){var i=n.queries,s=n.conditions,a,o,l,c;for(o in i)a=Ei.matchMedia(i[o]).matches,a&&(l=1),a!==s[o]&&(s[o]=a,c=1);c&&(n.revert(),l&&t.push(n))}),kl("matchMediaRevert"),t.forEach(function(n){return n.onMatch(n,function(i){return n.add(null,i)})}),Wf=e,kl("matchMedia"))},_p=(function(){function r(t,n){this.selector=n&&Fc(n),this.data=[],this._r=[],this.isReverted=!1,this.id=K_++,t&&this.add(t)}var e=r.prototype;return e.add=function(n,i,s){Ut(n)&&(s=i,i=n,n=Ut);var a=this,o=function(){var c=Pt,u=a.selector,d;return c&&c!==a&&c.data.push(a),s&&(a.selector=Fc(s)),Pt=a,d=i.apply(a,arguments),Ut(d)&&a._r.push(d),Pt=c,a.selector=u,a.isReverted=!1,d};return a.last=o,n===Ut?o(a,function(l){return a.add(null,l)}):n?a[n]=o:o},e.ignore=function(n){var i=Pt;Pt=null,n(this),Pt=i},e.getTweens=function(){var n=[];return this.data.forEach(function(i){return i instanceof r?n.push.apply(n,i.getTweens()):i instanceof Gt&&!(i.parent&&i.parent.data==="nested")&&n.push(i)}),n},e.clear=function(){this._r.length=this.data.length=0},e.kill=function(n,i){var s=this;if(n?(function(){for(var o=s.getTweens(),l=s.data.length,c;l--;)c=s.data[l],c.data==="isFlip"&&(c.revert(),c.getChildren(!0,!0,!1).forEach(function(u){return o.splice(o.indexOf(u),1)}));for(o.map(function(u){return{g:u._dur||u._delay||u._sat&&!u._sat.vars.immediateRender?u.globalTime(0):-1/0,t:u}}).sort(function(u,d){return d.g-u.g||-1/0}).forEach(function(u){return u.t.revert(n)}),l=s.data.length;l--;)c=s.data[l],c instanceof An?c.data!=="nested"&&(c.scrollTrigger&&c.scrollTrigger.revert(),c.kill()):!(c instanceof Gt)&&c.revert&&c.revert(n);s._r.forEach(function(u){return u(n,s)}),s.isReverted=!0})():this.data.forEach(function(o){return o.kill&&o.kill()}),this.clear(),i)for(var a=Qr.length;a--;)Qr[a].id===this.id&&Qr.splice(a,1)},e.revert=function(n){this.kill(n||{})},r})(),Z_=(function(){function r(t){this.contexts=[],this.scope=t,Pt&&Pt.data.push(this)}var e=r.prototype;return e.add=function(n,i,s){Fi(n)||(n={matches:n});var a=new _p(0,s||this.scope),o=a.conditions={},l,c,u;Pt&&!a.selector&&(a.selector=Pt.selector),this.contexts.push(a),i=a.add("onMatch",i),a.queries=n;for(c in n)c==="all"?u=1:(l=Ei.matchMedia(n[c]),l&&(Qr.indexOf(a)<0&&Qr.push(a),(o[c]=l.matches)&&(u=1),l.addListener?l.addListener(kc):l.addEventListener("change",kc)));return u&&i(a,function(d){return a.add(null,d)}),this},e.revert=function(n){this.kill(n||{})},e.kill=function(n){this.contexts.forEach(function(i){return i.kill(n,!0)})},r})(),fl={registerPlugin:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];t.forEach(function(i){return tp(i)})},timeline:function(e){return new An(e)},getTweensOf:function(e,t){return Lt.getTweensOf(e,t)},getProperty:function(e,t,n,i){sn(e)&&(e=ci(e)[0]);var s=Kr(e||{}).get,a=n?Hd:Vd;return n==="native"&&(n=""),e&&(t?a((Gn[t]&&Gn[t].get||s)(e,t,n,i)):function(o,l,c){return a((Gn[o]&&Gn[o].get||s)(e,o,l,c))})},quickSetter:function(e,t,n){if(e=ci(e),e.length>1){var i=e.map(function(u){return On.quickSetter(u,t,n)}),s=i.length;return function(u){for(var d=s;d--;)i[d](u)}}e=e[0]||{};var a=Gn[t],o=Kr(e),l=o.harness&&(o.harness.aliases||{})[t]||t,c=a?function(u){var d=new a;Ls._pt=0,d.init(e,n?u+n:u,Ls,0,[e]),d.render(1,d),Ls._pt&&cf(1,Ls)}:o.set(e,l);return a?c:function(u){return c(e,l,n?u+n:u,o,1)}},quickTo:function(e,t,n){var i,s=On.to(e,Jn((i={},i[t]="+=0.1",i.paused=!0,i.stagger=0,i),n||{})),a=function(l,c,u){return s.resetTo(t,l,c,u)};return a.tween=s,a},isTweening:function(e){return Lt.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=Jr(e.ease,Hs.ease)),kf(Hs,e||{})},config:function(e){return kf($n,e||{})},registerEffect:function(e){var t=e.name,n=e.effect,i=e.plugins,s=e.defaults,a=e.extendTimeline;(i||"").split(",").forEach(function(o){return o&&!Gn[o]&&!Zn[o]&&Oa(t+" effect requires "+o+" plugin.")}),Ul[t]=function(o,l,c){return n(ci(o),Jn(l||{},s),c)},a&&(An.prototype[t]=function(o,l,c){return this.add(Ul[t](o,Fi(l)?l:(c=l)&&{},this),c)})},registerEase:function(e,t){ot[e]=Jr(t)},parseEase:function(e,t){return arguments.length?Jr(e,t):ot},getById:function(e){return Lt.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var n=new An(e),i,s;for(n.smoothChildTiming=Ln(e.smoothChildTiming),Lt.remove(n),n._dp=0,n._time=n._tTime=Lt._time,i=Lt._first;i;)s=i._next,(t||!(!i._dur&&i instanceof Gt&&i.vars.onComplete===i._targets[0]))&&Ai(n,i,i._start-i._delay),i=s;return Ai(Lt,n,0),n},context:function(e,t){return e?new _p(e,t):Pt},matchMedia:function(e){return new Z_(e)},matchMediaRefresh:function(){return Qr.forEach(function(e){var t=e.conditions,n,i;for(i in t)t[i]&&(t[i]=!1,n=1);n&&e.revert()})||kc()},addEventListener:function(e,t){var n=qo[e]||(qo[e]=[]);~n.indexOf(t)||n.push(t)},removeEventListener:function(e,t){var n=qo[e],i=n&&n.indexOf(t);i>=0&&n.splice(i,1)},utils:{wrap:R_,wrapYoyo:P_,distribute:$d,random:Zd,snap:Kd,normalize:C_,getUnit:gn,clamp:E_,splitColor:np,toArray:ci,selector:Fc,mapRange:Qd,pipe:w_,unitize:A_,interpolate:D_,shuffle:qd},install:Fd,effects:Ul,ticker:Xn,updateRoot:An.updateRoot,plugins:Gn,globalTimeline:Lt,core:{PropTween:In,globals:Od,Tween:Gt,Timeline:An,Animation:Va,getCache:Kr,_removeLinkedListItem:Tl,reverting:function(){return cn},context:function(e){return e&&Pt&&(Pt.data.push(e),e._ctx=Pt),Pt},suppressOverwrites:function(e){return $u=e}}};Nn("to,from,fromTo,delayedCall,set,killTweensOf",function(r){return fl[r]=Gt[r]});Xn.add(An.updateRoot);Ls=fl.to({},{duration:0});var J_=function(e,t){for(var n=e._pt;n&&n.p!==t&&n.op!==t&&n.fp!==t;)n=n._next;return n},Q_=function(e,t){var n=e._targets,i,s,a;for(i in t)for(s=n.length;s--;)a=e._ptLookup[s][i],a&&(a=a.d)&&(a._pt&&(a=J_(a,i)),a&&a.modifier&&a.modifier(t[i],e,n[s],i))},zl=function(e,t){return{name:e,headless:1,rawVars:1,init:function(i,s,a){a._onInit=function(o){var l,c;if(sn(s)&&(l={},Nn(s,function(u){return l[u]=1}),s=l),t){l={};for(c in s)l[c]=t(s[c]);s=l}Q_(o,s)}}}},On=fl.registerPlugin({name:"attr",init:function(e,t,n,i,s){var a,o,l;this.tween=n;for(a in t)l=e.getAttribute(a)||"",o=this.add(e,"setAttribute",(l||0)+"",t[a],i,s,0,0,a),o.op=a,o.b=l,this._props.push(a)},render:function(e,t){for(var n=t._pt;n;)cn?n.set(n.t,n.p,n.b,n):n.r(e,n.d),n=n._next}},{name:"endArray",headless:1,init:function(e,t){for(var n=t.length;n--;)this.add(e,n,e[n]||0,t[n],0,0,0,0,0,1)}},zl("roundProps",Oc),zl("modifiers"),zl("snap",Kd))||fl;Gt.version=An.version=On.version="3.14.2";Ud=1;Zu()&&js();ot.Power0;ot.Power1;ot.Power2;ot.Power3;ot.Power4;ot.Linear;ot.Quad;ot.Cubic;ot.Quart;ot.Quint;ot.Strong;ot.Elastic;ot.Back;ot.SteppedEase;ot.Bounce;ot.Sine;ot.Expo;ot.Circ;var Xf,gr,Us,uf,jr,jf,ff,eg=function(){return typeof window<"u"},tr={},zr=180/Math.PI,Fs=Math.PI/180,fs=Math.atan2,Yf=1e8,hf=/([A-Z])/g,tg=/(left|right|width|margin|padding|x)/i,ng=/[\s,\(]\S/,Ci={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},zc=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},ig=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},rg=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},sg=function(e,t){return t.set(t.t,t.p,e===1?t.e:e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},ag=function(e,t){var n=t.s+t.c*e;t.set(t.t,t.p,~~(n+(n<0?-.5:.5))+t.u,t)},gp=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},xp=function(e,t){return t.set(t.t,t.p,e!==1?t.b:t.e,t)},og=function(e,t,n){return e.style[t]=n},lg=function(e,t,n){return e.style.setProperty(t,n)},cg=function(e,t,n){return e._gsap[t]=n},ug=function(e,t,n){return e._gsap.scaleX=e._gsap.scaleY=n},fg=function(e,t,n,i,s){var a=e._gsap;a.scaleX=a.scaleY=n,a.renderTransform(s,a)},hg=function(e,t,n,i,s){var a=e._gsap;a[t]=n,a.renderTransform(s,a)},Nt="transform",Un=Nt+"Origin",dg=function r(e,t){var n=this,i=this.target,s=i.style,a=i._gsap;if(e in tr&&s){if(this.tfm=this.tfm||{},e!=="transform")e=Ci[e]||e,~e.indexOf(",")?e.split(",").forEach(function(o){return n.tfm[o]=ji(i,o)}):this.tfm[e]=a.x?a[e]:ji(i,e),e===Un&&(this.tfm.zOrigin=a.zOrigin);else return Ci.transform.split(",").forEach(function(o){return r.call(n,o,t)});if(this.props.indexOf(Nt)>=0)return;a.svg&&(this.svgo=i.getAttribute("data-svg-origin"),this.props.push(Un,t,"")),e=Nt}(s||t)&&this.props.push(e,t,s[e])},vp=function(e){e.translate&&(e.removeProperty("translate"),e.removeProperty("scale"),e.removeProperty("rotate"))},pg=function(){var e=this.props,t=this.target,n=t.style,i=t._gsap,s,a;for(s=0;s<e.length;s+=3)e[s+1]?e[s+1]===2?t[e[s]](e[s+2]):t[e[s]]=e[s+2]:e[s+2]?n[e[s]]=e[s+2]:n.removeProperty(e[s].substr(0,2)==="--"?e[s]:e[s].replace(hf,"-$1").toLowerCase());if(this.tfm){for(a in this.tfm)i[a]=this.tfm[a];i.svg&&(i.renderTransform(),t.setAttribute("data-svg-origin",this.svgo||"")),s=ff(),(!s||!s.isStart)&&!n[Nt]&&(vp(n),i.zOrigin&&n[Un]&&(n[Un]+=" "+i.zOrigin+"px",i.zOrigin=0,i.renderTransform()),i.uncache=1)}},Sp=function(e,t){var n={target:e,props:[],revert:pg,save:dg};return e._gsap||On.core.getCache(e),t&&e.style&&e.nodeType&&t.split(",").forEach(function(i){return n.save(i)}),n},Mp,Vc=function(e,t){var n=gr.createElementNS?gr.createElementNS((t||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),e):gr.createElement(e);return n&&n.style?n:gr.createElement(e)},qn=function r(e,t,n){var i=getComputedStyle(e);return i[t]||i.getPropertyValue(t.replace(hf,"-$1").toLowerCase())||i.getPropertyValue(t)||!n&&r(e,Ys(t)||t,1)||""},qf="O,Moz,ms,Ms,Webkit".split(","),Ys=function(e,t,n){var i=t||jr,s=i.style,a=5;if(e in s&&!n)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);a--&&!(qf[a]+e in s););return a<0?null:(a===3?"ms":a>=0?qf[a]:"")+e},Hc=function(){eg()&&window.document&&(Xf=window,gr=Xf.document,Us=gr.documentElement,jr=Vc("div")||{style:{}},Vc("div"),Nt=Ys(Nt),Un=Nt+"Origin",jr.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",Mp=!!Ys("perspective"),ff=On.core.reverting,uf=1)},$f=function(e){var t=e.ownerSVGElement,n=Vc("svg",t&&t.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),i=e.cloneNode(!0),s;i.style.display="block",n.appendChild(i),Us.appendChild(n);try{s=i.getBBox()}catch{}return n.removeChild(i),Us.removeChild(n),s},Kf=function(e,t){for(var n=t.length;n--;)if(e.hasAttribute(t[n]))return e.getAttribute(t[n])},yp=function(e){var t,n;try{t=e.getBBox()}catch{t=$f(e),n=1}return t&&(t.width||t.height)||n||(t=$f(e)),t&&!t.width&&!t.x&&!t.y?{x:+Kf(e,["x","cx","x1"])||0,y:+Kf(e,["y","cy","y1"])||0,width:0,height:0}:t},bp=function(e){return!!(e.getCTM&&(!e.parentNode||e.ownerSVGElement)&&yp(e))},wr=function(e,t){if(t){var n=e.style,i;t in tr&&t!==Un&&(t=Nt),n.removeProperty?(i=t.substr(0,2),(i==="ms"||t.substr(0,6)==="webkit")&&(t="-"+t),n.removeProperty(i==="--"?t:t.replace(hf,"-$1").toLowerCase())):n.removeAttribute(t)}},xr=function(e,t,n,i,s,a){var o=new In(e._pt,t,n,0,1,a?xp:gp);return e._pt=o,o.b=i,o.e=s,e._props.push(n),o},Zf={deg:1,rad:1,turn:1},mg={grid:1,flex:1},Ar=function r(e,t,n,i){var s=parseFloat(n)||0,a=(n+"").trim().substr((s+"").length)||"px",o=jr.style,l=tg.test(t),c=e.tagName.toLowerCase()==="svg",u=(c?"client":"offset")+(l?"Width":"Height"),d=100,f=i==="px",h=i==="%",_,g,p,m;if(i===a||!s||Zf[i]||Zf[a])return s;if(a!=="px"&&!f&&(s=r(e,t,n,"px")),m=e.getCTM&&bp(e),(h||a==="%")&&(tr[t]||~t.indexOf("adius")))return _=m?e.getBBox()[l?"width":"height"]:e[u],Bt(h?s/_*d:s/100*_);if(o[l?"width":"height"]=d+(f?a:i),g=i!=="rem"&&~t.indexOf("adius")||i==="em"&&e.appendChild&&!c?e:e.parentNode,m&&(g=(e.ownerSVGElement||{}).parentNode),(!g||g===gr||!g.appendChild)&&(g=gr.body),p=g._gsap,p&&h&&p.width&&l&&p.time===Xn.time&&!p.uncache)return Bt(s/p.width*d);if(h&&(t==="height"||t==="width")){var v=e.style[t];e.style[t]=d+i,_=e[u],v?e.style[t]=v:wr(e,t)}else(h||a==="%")&&!mg[qn(g,"display")]&&(o.position=qn(e,"position")),g===e&&(o.position="static"),g.appendChild(jr),_=jr[u],g.removeChild(jr),o.position="absolute";return l&&h&&(p=Kr(g),p.time=Xn.time,p.width=g[u]),Bt(f?_*s/d:_&&s?d/_*s:0)},ji=function(e,t,n,i){var s;return uf||Hc(),t in Ci&&t!=="transform"&&(t=Ci[t],~t.indexOf(",")&&(t=t.split(",")[0])),tr[t]&&t!=="transform"?(s=Ga(e,i),s=t!=="transformOrigin"?s[t]:s.svg?s.origin:dl(qn(e,Un))+" "+s.zOrigin+"px"):(s=e.style[t],(!s||s==="auto"||i||~(s+"").indexOf("calc("))&&(s=hl[t]&&hl[t](e,t,n)||qn(e,t)||kd(e,t)||(t==="opacity"?1:0))),n&&!~(s+"").trim().indexOf(" ")?Ar(e,t,s,n)+n:s},_g=function(e,t,n,i){if(!n||n==="none"){var s=Ys(t,e,1),a=s&&qn(e,s,1);a&&a!==n?(t=s,n=a):t==="borderColor"&&(n=qn(e,"borderTopColor"))}var o=new In(this._pt,e.style,t,0,1,pp),l=0,c=0,u,d,f,h,_,g,p,m,v,b,S,w;if(o.b=n,o.e=i,n+="",i+="",i.substring(0,6)==="var(--"&&(i=qn(e,i.substring(4,i.indexOf(")")))),i==="auto"&&(g=e.style[t],e.style[t]=i,i=qn(e,t)||i,g?e.style[t]=g:wr(e,t)),u=[n,i],rp(u),n=u[0],i=u[1],f=n.match(Ds)||[],w=i.match(Ds)||[],w.length){for(;d=Ds.exec(i);)p=d[0],v=i.substring(l,d.index),_?_=(_+1)%5:(v.substr(-5)==="rgba("||v.substr(-5)==="hsla(")&&(_=1),p!==(g=f[c++]||"")&&(h=parseFloat(g)||0,S=g.substr((h+"").length),p.charAt(1)==="="&&(p=Is(h,p)+S),m=parseFloat(p),b=p.substr((m+"").length),l=Ds.lastIndex-b.length,b||(b=b||$n.units[t]||S,l===i.length&&(i+=b,o.e+=b)),S!==b&&(h=Ar(e,t,g,b)||0),o._pt={_next:o._pt,p:v||c===1?v:",",s:h,c:m-h,m:_&&_<4||t==="zIndex"?Math.round:0});o.c=l<i.length?i.substring(l,i.length):""}else o.r=t==="display"&&i==="none"?xp:gp;return Id.test(i)&&(o.e=0),this._pt=o,o},Jf={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},gg=function(e){var t=e.split(" "),n=t[0],i=t[1]||"50%";return(n==="top"||n==="bottom"||i==="left"||i==="right")&&(e=n,n=i,i=e),t[0]=Jf[n]||n,t[1]=Jf[i]||i,t.join(" ")},xg=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var n=t.t,i=n.style,s=t.u,a=n._gsap,o,l,c;if(s==="all"||s===!0)i.cssText="",l=1;else for(s=s.split(","),c=s.length;--c>-1;)o=s[c],tr[o]&&(l=1,o=o==="transformOrigin"?Un:Nt),wr(n,o);l&&(wr(n,Nt),a&&(a.svg&&n.removeAttribute("transform"),i.scale=i.rotate=i.translate="none",Ga(n,1),a.uncache=1,vp(i)))}},hl={clearProps:function(e,t,n,i,s){if(s.data!=="isFromStart"){var a=e._pt=new In(e._pt,t,n,0,0,xg);return a.u=i,a.pr=-10,a.tween=s,e._props.push(n),1}}},Ha=[1,0,0,1,0,0],Ep={},Tp=function(e){return e==="matrix(1, 0, 0, 1, 0, 0)"||e==="none"||!e},Qf=function(e){var t=qn(e,Nt);return Tp(t)?Ha:t.substr(7).match(Nd).map(Bt)},df=function(e,t){var n=e._gsap||Kr(e),i=e.style,s=Qf(e),a,o,l,c;return n.svg&&e.getAttribute("transform")?(l=e.transform.baseVal.consolidate().matrix,s=[l.a,l.b,l.c,l.d,l.e,l.f],s.join(",")==="1,0,0,1,0,0"?Ha:s):(s===Ha&&!e.offsetParent&&e!==Us&&!n.svg&&(l=i.display,i.display="block",a=e.parentNode,(!a||!e.offsetParent&&!e.getBoundingClientRect().width)&&(c=1,o=e.nextElementSibling,Us.appendChild(e)),s=Qf(e),l?i.display=l:wr(e,"display"),c&&(o?a.insertBefore(e,o):a?a.appendChild(e):Us.removeChild(e))),t&&s.length>6?[s[0],s[1],s[4],s[5],s[12],s[13]]:s)},Gc=function(e,t,n,i,s,a){var o=e._gsap,l=s||df(e,!0),c=o.xOrigin||0,u=o.yOrigin||0,d=o.xOffset||0,f=o.yOffset||0,h=l[0],_=l[1],g=l[2],p=l[3],m=l[4],v=l[5],b=t.split(" "),S=parseFloat(b[0])||0,w=parseFloat(b[1])||0,E,A,x,y;n?l!==Ha&&(A=h*p-_*g)&&(x=S*(p/A)+w*(-g/A)+(g*v-p*m)/A,y=S*(-_/A)+w*(h/A)-(h*v-_*m)/A,S=x,w=y):(E=yp(e),S=E.x+(~b[0].indexOf("%")?S/100*E.width:S),w=E.y+(~(b[1]||b[0]).indexOf("%")?w/100*E.height:w)),i||i!==!1&&o.smooth?(m=S-c,v=w-u,o.xOffset=d+(m*h+v*g)-m,o.yOffset=f+(m*_+v*p)-v):o.xOffset=o.yOffset=0,o.xOrigin=S,o.yOrigin=w,o.smooth=!!i,o.origin=t,o.originIsAbsolute=!!n,e.style[Un]="0px 0px",a&&(xr(a,o,"xOrigin",c,S),xr(a,o,"yOrigin",u,w),xr(a,o,"xOffset",d,o.xOffset),xr(a,o,"yOffset",f,o.yOffset)),e.setAttribute("data-svg-origin",S+" "+w)},Ga=function(e,t){var n=e._gsap||new lp(e);if("x"in n&&!t&&!n.uncache)return n;var i=e.style,s=n.scaleX<0,a="px",o="deg",l=getComputedStyle(e),c=qn(e,Un)||"0",u,d,f,h,_,g,p,m,v,b,S,w,E,A,x,y,D,P,I,k,V,H,z,B,Q,ee,L,ce,ue,ke,He,Ye;return u=d=f=g=p=m=v=b=S=0,h=_=1,n.svg=!!(e.getCTM&&bp(e)),l.translate&&((l.translate!=="none"||l.scale!=="none"||l.rotate!=="none")&&(i[Nt]=(l.translate!=="none"?"translate3d("+(l.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(l.rotate!=="none"?"rotate("+l.rotate+") ":"")+(l.scale!=="none"?"scale("+l.scale.split(" ").join(",")+") ":"")+(l[Nt]!=="none"?l[Nt]:"")),i.scale=i.rotate=i.translate="none"),A=df(e,n.svg),n.svg&&(n.uncache?(Q=e.getBBox(),c=n.xOrigin-Q.x+"px "+(n.yOrigin-Q.y)+"px",B=""):B=!t&&e.getAttribute("data-svg-origin"),Gc(e,B||c,!!B||n.originIsAbsolute,n.smooth!==!1,A)),w=n.xOrigin||0,E=n.yOrigin||0,A!==Ha&&(P=A[0],I=A[1],k=A[2],V=A[3],u=H=A[4],d=z=A[5],A.length===6?(h=Math.sqrt(P*P+I*I),_=Math.sqrt(V*V+k*k),g=P||I?fs(I,P)*zr:0,v=k||V?fs(k,V)*zr+g:0,v&&(_*=Math.abs(Math.cos(v*Fs))),n.svg&&(u-=w-(w*P+E*k),d-=E-(w*I+E*V))):(Ye=A[6],ke=A[7],L=A[8],ce=A[9],ue=A[10],He=A[11],u=A[12],d=A[13],f=A[14],x=fs(Ye,ue),p=x*zr,x&&(y=Math.cos(-x),D=Math.sin(-x),B=H*y+L*D,Q=z*y+ce*D,ee=Ye*y+ue*D,L=H*-D+L*y,ce=z*-D+ce*y,ue=Ye*-D+ue*y,He=ke*-D+He*y,H=B,z=Q,Ye=ee),x=fs(-k,ue),m=x*zr,x&&(y=Math.cos(-x),D=Math.sin(-x),B=P*y-L*D,Q=I*y-ce*D,ee=k*y-ue*D,He=V*D+He*y,P=B,I=Q,k=ee),x=fs(I,P),g=x*zr,x&&(y=Math.cos(x),D=Math.sin(x),B=P*y+I*D,Q=H*y+z*D,I=I*y-P*D,z=z*y-H*D,P=B,H=Q),p&&Math.abs(p)+Math.abs(g)>359.9&&(p=g=0,m=180-m),h=Bt(Math.sqrt(P*P+I*I+k*k)),_=Bt(Math.sqrt(z*z+Ye*Ye)),x=fs(H,z),v=Math.abs(x)>2e-4?x*zr:0,S=He?1/(He<0?-He:He):0),n.svg&&(B=e.getAttribute("transform"),n.forceCSS=e.setAttribute("transform","")||!Tp(qn(e,Nt)),B&&e.setAttribute("transform",B))),Math.abs(v)>90&&Math.abs(v)<270&&(s?(h*=-1,v+=g<=0?180:-180,g+=g<=0?180:-180):(_*=-1,v+=v<=0?180:-180)),t=t||n.uncache,n.x=u-((n.xPercent=u&&(!t&&n.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-u)?-50:0)))?e.offsetWidth*n.xPercent/100:0)+a,n.y=d-((n.yPercent=d&&(!t&&n.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-d)?-50:0)))?e.offsetHeight*n.yPercent/100:0)+a,n.z=f+a,n.scaleX=Bt(h),n.scaleY=Bt(_),n.rotation=Bt(g)+o,n.rotationX=Bt(p)+o,n.rotationY=Bt(m)+o,n.skewX=v+o,n.skewY=b+o,n.transformPerspective=S+a,(n.zOrigin=parseFloat(c.split(" ")[2])||!t&&n.zOrigin||0)&&(i[Un]=dl(c)),n.xOffset=n.yOffset=0,n.force3D=$n.force3D,n.renderTransform=n.svg?Sg:Mp?wp:vg,n.uncache=0,n},dl=function(e){return(e=e.split(" "))[0]+" "+e[1]},Vl=function(e,t,n){var i=gn(t);return Bt(parseFloat(t)+parseFloat(Ar(e,"x",n+"px",i)))+i},vg=function(e,t){t.z="0px",t.rotationY=t.rotationX="0deg",t.force3D=0,wp(e,t)},Lr="0deg",ia="0px",Nr=") ",wp=function(e,t){var n=t||this,i=n.xPercent,s=n.yPercent,a=n.x,o=n.y,l=n.z,c=n.rotation,u=n.rotationY,d=n.rotationX,f=n.skewX,h=n.skewY,_=n.scaleX,g=n.scaleY,p=n.transformPerspective,m=n.force3D,v=n.target,b=n.zOrigin,S="",w=m==="auto"&&e&&e!==1||m===!0;if(b&&(d!==Lr||u!==Lr)){var E=parseFloat(u)*Fs,A=Math.sin(E),x=Math.cos(E),y;E=parseFloat(d)*Fs,y=Math.cos(E),a=Vl(v,a,A*y*-b),o=Vl(v,o,-Math.sin(E)*-b),l=Vl(v,l,x*y*-b+b)}p!==ia&&(S+="perspective("+p+Nr),(i||s)&&(S+="translate("+i+"%, "+s+"%) "),(w||a!==ia||o!==ia||l!==ia)&&(S+=l!==ia||w?"translate3d("+a+", "+o+", "+l+") ":"translate("+a+", "+o+Nr),c!==Lr&&(S+="rotate("+c+Nr),u!==Lr&&(S+="rotateY("+u+Nr),d!==Lr&&(S+="rotateX("+d+Nr),(f!==Lr||h!==Lr)&&(S+="skew("+f+", "+h+Nr),(_!==1||g!==1)&&(S+="scale("+_+", "+g+Nr),v.style[Nt]=S||"translate(0, 0)"},Sg=function(e,t){var n=t||this,i=n.xPercent,s=n.yPercent,a=n.x,o=n.y,l=n.rotation,c=n.skewX,u=n.skewY,d=n.scaleX,f=n.scaleY,h=n.target,_=n.xOrigin,g=n.yOrigin,p=n.xOffset,m=n.yOffset,v=n.forceCSS,b=parseFloat(a),S=parseFloat(o),w,E,A,x,y;l=parseFloat(l),c=parseFloat(c),u=parseFloat(u),u&&(u=parseFloat(u),c+=u,l+=u),l||c?(l*=Fs,c*=Fs,w=Math.cos(l)*d,E=Math.sin(l)*d,A=Math.sin(l-c)*-f,x=Math.cos(l-c)*f,c&&(u*=Fs,y=Math.tan(c-u),y=Math.sqrt(1+y*y),A*=y,x*=y,u&&(y=Math.tan(u),y=Math.sqrt(1+y*y),w*=y,E*=y)),w=Bt(w),E=Bt(E),A=Bt(A),x=Bt(x)):(w=d,x=f,E=A=0),(b&&!~(a+"").indexOf("px")||S&&!~(o+"").indexOf("px"))&&(b=Ar(h,"x",a,"px"),S=Ar(h,"y",o,"px")),(_||g||p||m)&&(b=Bt(b+_-(_*w+g*A)+p),S=Bt(S+g-(_*E+g*x)+m)),(i||s)&&(y=h.getBBox(),b=Bt(b+i/100*y.width),S=Bt(S+s/100*y.height)),y="matrix("+w+","+E+","+A+","+x+","+b+","+S+")",h.setAttribute("transform",y),v&&(h.style[Nt]=y)},Mg=function(e,t,n,i,s){var a=360,o=sn(s),l=parseFloat(s)*(o&&~s.indexOf("rad")?zr:1),c=l-i,u=i+c+"deg",d,f;return o&&(d=s.split("_")[1],d==="short"&&(c%=a,c!==c%(a/2)&&(c+=c<0?a:-a)),d==="cw"&&c<0?c=(c+a*Yf)%a-~~(c/a)*a:d==="ccw"&&c>0&&(c=(c-a*Yf)%a-~~(c/a)*a)),e._pt=f=new In(e._pt,t,n,i,c,ig),f.e=u,f.u="deg",e._props.push(n),f},eh=function(e,t){for(var n in t)e[n]=t[n];return e},yg=function(e,t,n){var i=eh({},n._gsap),s="perspective,force3D,transformOrigin,svgOrigin",a=n.style,o,l,c,u,d,f,h,_;i.svg?(c=n.getAttribute("transform"),n.setAttribute("transform",""),a[Nt]=t,o=Ga(n,1),wr(n,Nt),n.setAttribute("transform",c)):(c=getComputedStyle(n)[Nt],a[Nt]=t,o=Ga(n,1),a[Nt]=c);for(l in tr)c=i[l],u=o[l],c!==u&&s.indexOf(l)<0&&(h=gn(c),_=gn(u),d=h!==_?Ar(n,l,c,_):parseFloat(c),f=parseFloat(u),e._pt=new In(e._pt,o,l,d,f-d,zc),e._pt.u=_||0,e._props.push(l));eh(o,i)};Nn("padding,margin,Width,Radius",function(r,e){var t="Top",n="Right",i="Bottom",s="Left",a=(e<3?[t,n,i,s]:[t+s,t+n,i+n,i+s]).map(function(o){return e<2?r+o:"border"+o+r});hl[e>1?"border"+r:r]=function(o,l,c,u,d){var f,h;if(arguments.length<4)return f=a.map(function(_){return ji(o,_,c)}),h=f.join(" "),h.split(f[0]).length===5?f[0]:h;f=(u+"").split(" "),h={},a.forEach(function(_,g){return h[_]=f[g]=f[g]||f[(g-1)/2|0]}),o.init(l,h,d)}});var Ap={name:"css",register:Hc,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,n,i,s){var a=this._props,o=e.style,l=n.vars.startAt,c,u,d,f,h,_,g,p,m,v,b,S,w,E,A,x,y;uf||Hc(),this.styles=this.styles||Sp(e),x=this.styles.props,this.tween=n;for(g in t)if(g!=="autoRound"&&(u=t[g],!(Gn[g]&&cp(g,t,n,i,e,s)))){if(h=typeof u,_=hl[g],h==="function"&&(u=u.call(n,i,e,s),h=typeof u),h==="string"&&~u.indexOf("random(")&&(u=ka(u)),_)_(this,e,g,u,n)&&(A=1);else if(g.substr(0,2)==="--")c=(getComputedStyle(e).getPropertyValue(g)+"").trim(),u+="",br.lastIndex=0,br.test(c)||(p=gn(c),m=gn(u),m?p!==m&&(c=Ar(e,g,c,m)+m):p&&(u+=p)),this.add(o,"setProperty",c,u,i,s,0,0,g),a.push(g),x.push(g,0,o[g]);else if(h!=="undefined"){if(l&&g in l?(c=typeof l[g]=="function"?l[g].call(n,i,e,s):l[g],sn(c)&&~c.indexOf("random(")&&(c=ka(c)),gn(c+"")||c==="auto"||(c+=$n.units[g]||gn(ji(e,g))||""),(c+"").charAt(1)==="="&&(c=ji(e,g))):c=ji(e,g),f=parseFloat(c),v=h==="string"&&u.charAt(1)==="="&&u.substr(0,2),v&&(u=u.substr(2)),d=parseFloat(u),g in Ci&&(g==="autoAlpha"&&(f===1&&ji(e,"visibility")==="hidden"&&d&&(f=0),x.push("visibility",0,o.visibility),xr(this,o,"visibility",f?"inherit":"hidden",d?"inherit":"hidden",!d)),g!=="scale"&&g!=="transform"&&(g=Ci[g],~g.indexOf(",")&&(g=g.split(",")[0]))),b=g in tr,b){if(this.styles.save(g),y=u,h==="string"&&u.substring(0,6)==="var(--"){if(u=qn(e,u.substring(4,u.indexOf(")"))),u.substring(0,5)==="calc("){var D=e.style.perspective;e.style.perspective=u,u=qn(e,"perspective"),D?e.style.perspective=D:wr(e,"perspective")}d=parseFloat(u)}if(S||(w=e._gsap,w.renderTransform&&!t.parseTransform||Ga(e,t.parseTransform),E=t.smoothOrigin!==!1&&w.smooth,S=this._pt=new In(this._pt,o,Nt,0,1,w.renderTransform,w,0,-1),S.dep=1),g==="scale")this._pt=new In(this._pt,w,"scaleY",w.scaleY,(v?Is(w.scaleY,v+d):d)-w.scaleY||0,zc),this._pt.u=0,a.push("scaleY",g),g+="X";else if(g==="transformOrigin"){x.push(Un,0,o[Un]),u=gg(u),w.svg?Gc(e,u,0,E,0,this):(m=parseFloat(u.split(" ")[2])||0,m!==w.zOrigin&&xr(this,w,"zOrigin",w.zOrigin,m),xr(this,o,g,dl(c),dl(u)));continue}else if(g==="svgOrigin"){Gc(e,u,1,E,0,this);continue}else if(g in Ep){Mg(this,w,g,f,v?Is(f,v+u):u);continue}else if(g==="smoothOrigin"){xr(this,w,"smooth",w.smooth,u);continue}else if(g==="force3D"){w[g]=u;continue}else if(g==="transform"){yg(this,u,e);continue}}else g in o||(g=Ys(g)||g);if(b||(d||d===0)&&(f||f===0)&&!ng.test(u)&&g in o)p=(c+"").substr((f+"").length),d||(d=0),m=gn(u)||(g in $n.units?$n.units[g]:p),p!==m&&(f=Ar(e,g,c,m)),this._pt=new In(this._pt,b?w:o,g,f,(v?Is(f,v+d):d)-f,!b&&(m==="px"||g==="zIndex")&&t.autoRound!==!1?ag:zc),this._pt.u=m||0,b&&y!==u?(this._pt.b=c,this._pt.e=y,this._pt.r=sg):p!==m&&m!=="%"&&(this._pt.b=c,this._pt.r=rg);else if(g in o)_g.call(this,e,g,c,v?v+u:u);else if(g in e)this.add(e,g,c||e[g],v?v+u:u,i,s);else if(g!=="parseTransform"){Qu(g,u);continue}b||(g in o?x.push(g,0,o[g]):typeof e[g]=="function"?x.push(g,2,e[g]()):x.push(g,1,c||e[g])),a.push(g)}}A&&mp(this)},render:function(e,t){if(t.tween._time||!ff())for(var n=t._pt;n;)n.r(e,n.d),n=n._next;else t.styles.revert()},get:ji,aliases:Ci,getSetter:function(e,t,n){var i=Ci[t];return i&&i.indexOf(",")<0&&(t=i),t in tr&&t!==Un&&(e._gsap.x||ji(e,"x"))?n&&jf===n?t==="scale"?ug:cg:(jf=n||{})&&(t==="scale"?fg:hg):e.style&&!Ku(e.style[t])?og:~t.indexOf("-")?lg:lf(e,t)},core:{_removeProperty:wr,_getMatrix:df}};On.utils.checkPrefix=Ys;On.core.getStyleSaver=Sp;(function(r,e,t,n){var i=Nn(r+","+e+","+t,function(s){tr[s]=1});Nn(e,function(s){$n.units[s]="deg",Ep[s]=1}),Ci[i[13]]=r+","+e,Nn(n,function(s){var a=s.split(":");Ci[a[1]]=i[a[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");Nn("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(r){$n.units[r]="px"});On.registerPlugin(Ap);var ni=On.registerPlugin(Ap)||On;ni.core.Tween;function bg(r,e){for(var t=0;t<e.length;t++){var n=e[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(r,n.key,n)}}function Eg(r,e,t){return e&&bg(r.prototype,e),r}var on,$o,jn,vr,Sr,Os,Cp,Vr,Aa,Rp,$i,_i,Pp,Dp=function(){return on||typeof window<"u"&&(on=window.gsap)&&on.registerPlugin&&on},Lp=1,Ns=[],st=[],Li=[],Ca=Date.now,Wc=function(e,t){return t},Tg=function(){var e=Aa.core,t=e.bridge||{},n=e._scrollers,i=e._proxies;n.push.apply(n,st),i.push.apply(i,Li),st=n,Li=i,Wc=function(a,o){return t[a](o)}},Er=function(e,t){return~Li.indexOf(e)&&Li[Li.indexOf(e)+1][t]},Ra=function(e){return!!~Rp.indexOf(e)},yn=function(e,t,n,i,s){return e.addEventListener(t,n,{passive:i!==!1,capture:!!s})},Mn=function(e,t,n,i){return e.removeEventListener(t,n,!!i)},no="scrollLeft",io="scrollTop",Xc=function(){return $i&&$i.isPressed||st.cache++},pl=function(e,t){var n=function i(s){if(s||s===0){Lp&&(jn.history.scrollRestoration="manual");var a=$i&&$i.isPressed;s=i.v=Math.round(s)||($i&&$i.iOS?1:0),e(s),i.cacheID=st.cache,a&&Wc("ss",s)}else(t||st.cache!==i.cacheID||Wc("ref"))&&(i.cacheID=st.cache,i.v=e());return i.v+i.offset};return n.offset=0,e&&n},Cn={s:no,p:"left",p2:"Left",os:"right",os2:"Right",d:"width",d2:"Width",a:"x",sc:pl(function(r){return arguments.length?jn.scrollTo(r,$t.sc()):jn.pageXOffset||vr[no]||Sr[no]||Os[no]||0})},$t={s:io,p:"top",p2:"Top",os:"bottom",os2:"Bottom",d:"height",d2:"Height",a:"y",op:Cn,sc:pl(function(r){return arguments.length?jn.scrollTo(Cn.sc(),r):jn.pageYOffset||vr[io]||Sr[io]||Os[io]||0})},Dn=function(e,t){return(t&&t._ctx&&t._ctx.selector||on.utils.toArray)(e)[0]||(typeof e=="string"&&on.config().nullTargetWarn!==!1?console.warn("Element not found:",e):null)},wg=function(e,t){for(var n=t.length;n--;)if(t[n]===e||t[n].contains(e))return!0;return!1},Cr=function(e,t){var n=t.s,i=t.sc;Ra(e)&&(e=vr.scrollingElement||Sr);var s=st.indexOf(e),a=i===$t.sc?1:2;!~s&&(s=st.push(e)-1),st[s+a]||yn(e,"scroll",Xc);var o=st[s+a],l=o||(st[s+a]=pl(Er(e,n),!0)||(Ra(e)?i:pl(function(c){return arguments.length?e[n]=c:e[n]})));return l.target=e,o||(l.smooth=on.getProperty(e,"scrollBehavior")==="smooth"),l},jc=function(e,t,n){var i=e,s=e,a=Ca(),o=a,l=t||50,c=Math.max(500,l*3),u=function(_,g){var p=Ca();g||p-a>l?(s=i,i=_,o=a,a=p):n?i+=_:i=s+(_-s)/(p-o)*(a-o)},d=function(){s=i=n?0:i,o=a=0},f=function(_){var g=o,p=s,m=Ca();return(_||_===0)&&_!==i&&u(_),a===o||m-o>c?0:(i+(n?p:-p))/((n?m:a)-g)*1e3};return{update:u,reset:d,getVelocity:f}},ra=function(e,t){return t&&!e._gsapAllow&&e.preventDefault(),e.changedTouches?e.changedTouches[0]:e},th=function(e){var t=Math.max.apply(Math,e),n=Math.min.apply(Math,e);return Math.abs(t)>=Math.abs(n)?t:n},Np=function(){Aa=on.core.globals().ScrollTrigger,Aa&&Aa.core&&Tg()},Ip=function(e){return on=e||Dp(),!$o&&on&&typeof document<"u"&&document.body&&(jn=window,vr=document,Sr=vr.documentElement,Os=vr.body,Rp=[jn,vr,Sr,Os],on.utils.clamp,Pp=on.core.context||function(){},Vr="onpointerenter"in Os?"pointer":"mouse",Cp=zt.isTouch=jn.matchMedia&&jn.matchMedia("(hover: none), (pointer: coarse)").matches?1:"ontouchstart"in jn||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0?2:0,_i=zt.eventTypes=("ontouchstart"in Sr?"touchstart,touchmove,touchcancel,touchend":"onpointerdown"in Sr?"pointerdown,pointermove,pointercancel,pointerup":"mousedown,mousemove,mouseup,mouseup").split(","),setTimeout(function(){return Lp=0},500),Np(),$o=1),$o};Cn.op=$t;st.cache=0;var zt=(function(){function r(t){this.init(t)}var e=r.prototype;return e.init=function(n){$o||Ip(on)||console.warn("Please gsap.registerPlugin(Observer)"),Aa||Np();var i=n.tolerance,s=n.dragMinimum,a=n.type,o=n.target,l=n.lineHeight,c=n.debounce,u=n.preventDefault,d=n.onStop,f=n.onStopDelay,h=n.ignore,_=n.wheelSpeed,g=n.event,p=n.onDragStart,m=n.onDragEnd,v=n.onDrag,b=n.onPress,S=n.onRelease,w=n.onRight,E=n.onLeft,A=n.onUp,x=n.onDown,y=n.onChangeX,D=n.onChangeY,P=n.onChange,I=n.onToggleX,k=n.onToggleY,V=n.onHover,H=n.onHoverEnd,z=n.onMove,B=n.ignoreCheck,Q=n.isNormalizer,ee=n.onGestureStart,L=n.onGestureEnd,ce=n.onWheel,ue=n.onEnable,ke=n.onDisable,He=n.onClick,Ye=n.scrollSpeed,K=n.capture,te=n.allowClicks,se=n.lockAxis,Ne=n.onLockAxis;this.target=o=Dn(o)||Sr,this.vars=n,h&&(h=on.utils.toArray(h)),i=i||1e-9,s=s||0,_=_||1,Ye=Ye||1,a=a||"wheel,touch,pointer",c=c!==!1,l||(l=parseFloat(jn.getComputedStyle(Os).lineHeight)||22);var Ie,Re,lt,Ee,ze,$e,Be,X=this,U=0,pt=0,et=n.passive||!u&&n.passive!==!1,Ve=Cr(o,Cn),Se=Cr(o,$t),C=Ve(),M=Se(),F=~a.indexOf("touch")&&!~a.indexOf("pointer")&&_i[0]==="pointerdown",Z=Ra(o),J=o.ownerDocument||vr,q=[0,0,0],xe=[0,0,0],oe=0,Pe=function(){return oe=Ca()},Me=function(De,Ze){return(X.event=De)&&h&&wg(De.target,h)||Ze&&F&&De.pointerType!=="touch"||B&&B(De,Ze)},ie=function(){X._vx.reset(),X._vy.reset(),Re.pause(),d&&d(X)},ae=function(){var De=X.deltaX=th(q),Ze=X.deltaY=th(xe),_e=Math.abs(De)>=i,We=Math.abs(Ze)>=i;P&&(_e||We)&&P(X,De,Ze,q,xe),_e&&(w&&X.deltaX>0&&w(X),E&&X.deltaX<0&&E(X),y&&y(X),I&&X.deltaX<0!=U<0&&I(X),U=X.deltaX,q[0]=q[1]=q[2]=0),We&&(x&&X.deltaY>0&&x(X),A&&X.deltaY<0&&A(X),D&&D(X),k&&X.deltaY<0!=pt<0&&k(X),pt=X.deltaY,xe[0]=xe[1]=xe[2]=0),(Ee||lt)&&(z&&z(X),lt&&(p&&lt===1&&p(X),v&&v(X),lt=0),Ee=!1),$e&&!($e=!1)&&Ne&&Ne(X),ze&&(ce(X),ze=!1),Ie=0},ye=function(De,Ze,_e){q[_e]+=De,xe[_e]+=Ze,X._vx.update(De),X._vy.update(Ze),c?Ie||(Ie=requestAnimationFrame(ae)):ae()},Te=function(De,Ze){se&&!Be&&(X.axis=Be=Math.abs(De)>Math.abs(Ze)?"x":"y",$e=!0),Be!=="y"&&(q[2]+=De,X._vx.update(De,!0)),Be!=="x"&&(xe[2]+=Ze,X._vy.update(Ze,!0)),c?Ie||(Ie=requestAnimationFrame(ae)):ae()},de=function(De){if(!Me(De,1)){De=ra(De,u);var Ze=De.clientX,_e=De.clientY,We=Ze-X.x,Oe=_e-X.y,Xe=X.isDragging;X.x=Ze,X.y=_e,(Xe||(We||Oe)&&(Math.abs(X.startX-Ze)>=s||Math.abs(X.startY-_e)>=s))&&(lt||(lt=Xe?2:1),Xe||(X.isDragging=!0),Te(We,Oe))}},Ge=X.onPress=function(ve){Me(ve,1)||ve&&ve.button||(X.axis=Be=null,Re.pause(),X.isPressed=!0,ve=ra(ve),U=pt=0,X.startX=X.x=ve.clientX,X.startY=X.y=ve.clientY,X._vx.reset(),X._vy.reset(),yn(Q?o:J,_i[1],de,et,!0),X.deltaX=X.deltaY=0,b&&b(X))},N=X.onRelease=function(ve){if(!Me(ve,1)){Mn(Q?o:J,_i[1],de,!0);var De=!isNaN(X.y-X.startY),Ze=X.isDragging,_e=Ze&&(Math.abs(X.x-X.startX)>3||Math.abs(X.y-X.startY)>3),We=ra(ve);!_e&&De&&(X._vx.reset(),X._vy.reset(),u&&te&&on.delayedCall(.08,function(){if(Ca()-oe>300&&!ve.defaultPrevented){if(ve.target.click)ve.target.click();else if(J.createEvent){var Oe=J.createEvent("MouseEvents");Oe.initMouseEvent("click",!0,!0,jn,1,We.screenX,We.screenY,We.clientX,We.clientY,!1,!1,!1,!1,0,null),ve.target.dispatchEvent(Oe)}}})),X.isDragging=X.isGesturing=X.isPressed=!1,d&&Ze&&!Q&&Re.restart(!0),lt&&ae(),m&&Ze&&m(X),S&&S(X,_e)}},le=function(De){return De.touches&&De.touches.length>1&&(X.isGesturing=!0)&&ee(De,X.isDragging)},re=function(){return(X.isGesturing=!1)||L(X)},pe=function(De){if(!Me(De)){var Ze=Ve(),_e=Se();ye((Ze-C)*Ye,(_e-M)*Ye,1),C=Ze,M=_e,d&&Re.restart(!0)}},ne=function(De){if(!Me(De)){De=ra(De,u),ce&&(ze=!0);var Ze=(De.deltaMode===1?l:De.deltaMode===2?jn.innerHeight:1)*_;ye(De.deltaX*Ze,De.deltaY*Ze,0),d&&!Q&&Re.restart(!0)}},$=function(De){if(!Me(De)){var Ze=De.clientX,_e=De.clientY,We=Ze-X.x,Oe=_e-X.y;X.x=Ze,X.y=_e,Ee=!0,d&&Re.restart(!0),(We||Oe)&&Te(We,Oe)}},be=function(De){X.event=De,V(X)},Fe=function(De){X.event=De,H(X)},ut=function(De){return Me(De)||ra(De,u)&&He(X)};Re=X._dc=on.delayedCall(f||.25,ie).pause(),X.deltaX=X.deltaY=0,X._vx=jc(0,50,!0),X._vy=jc(0,50,!0),X.scrollX=Ve,X.scrollY=Se,X.isDragging=X.isGesturing=X.isPressed=!1,Pp(this),X.enable=function(ve){return X.isEnabled||(yn(Z?J:o,"scroll",Xc),a.indexOf("scroll")>=0&&yn(Z?J:o,"scroll",pe,et,K),a.indexOf("wheel")>=0&&yn(o,"wheel",ne,et,K),(a.indexOf("touch")>=0&&Cp||a.indexOf("pointer")>=0)&&(yn(o,_i[0],Ge,et,K),yn(J,_i[2],N),yn(J,_i[3],N),te&&yn(o,"click",Pe,!0,!0),He&&yn(o,"click",ut),ee&&yn(J,"gesturestart",le),L&&yn(J,"gestureend",re),V&&yn(o,Vr+"enter",be),H&&yn(o,Vr+"leave",Fe),z&&yn(o,Vr+"move",$)),X.isEnabled=!0,X.isDragging=X.isGesturing=X.isPressed=Ee=lt=!1,X._vx.reset(),X._vy.reset(),C=Ve(),M=Se(),ve&&ve.type&&Ge(ve),ue&&ue(X)),X},X.disable=function(){X.isEnabled&&(Ns.filter(function(ve){return ve!==X&&Ra(ve.target)}).length||Mn(Z?J:o,"scroll",Xc),X.isPressed&&(X._vx.reset(),X._vy.reset(),Mn(Q?o:J,_i[1],de,!0)),Mn(Z?J:o,"scroll",pe,K),Mn(o,"wheel",ne,K),Mn(o,_i[0],Ge,K),Mn(J,_i[2],N),Mn(J,_i[3],N),Mn(o,"click",Pe,!0),Mn(o,"click",ut),Mn(J,"gesturestart",le),Mn(J,"gestureend",re),Mn(o,Vr+"enter",be),Mn(o,Vr+"leave",Fe),Mn(o,Vr+"move",$),X.isEnabled=X.isPressed=X.isDragging=!1,ke&&ke(X))},X.kill=X.revert=function(){X.disable();var ve=Ns.indexOf(X);ve>=0&&Ns.splice(ve,1),$i===X&&($i=0)},Ns.push(X),Q&&Ra(o)&&($i=X),X.enable(g)},Eg(r,[{key:"velocityX",get:function(){return this._vx.getVelocity()}},{key:"velocityY",get:function(){return this._vy.getVelocity()}}]),r})();zt.version="3.14.2";zt.create=function(r){return new zt(r)};zt.register=Ip;zt.getAll=function(){return Ns.slice()};zt.getById=function(r){return Ns.filter(function(e){return e.vars.id===r})[0]};Dp()&&on.registerPlugin(zt);var Ce,Rs,rt,wt,Wn,_t,pf,ml,Wa,Pa,ga,ro,mn,Cl,Yc,Tn,nh,ih,Ps,Up,Hl,Fp,En,qc,Op,Bp,pr,$c,mf,Bs,_f,Da,Kc,Gl,so=1,_n=Date.now,Wl=_n(),ui=0,xa=0,rh=function(e,t,n){var i=Hn(e)&&(e.substr(0,6)==="clamp("||e.indexOf("max")>-1);return n["_"+t+"Clamp"]=i,i?e.substr(6,e.length-7):e},sh=function(e,t){return t&&(!Hn(e)||e.substr(0,6)!=="clamp(")?"clamp("+e+")":e},Ag=function r(){return xa&&requestAnimationFrame(r)},ah=function(){return Cl=1},oh=function(){return Cl=0},Ti=function(e){return e},va=function(e){return Math.round(e*1e5)/1e5||0},kp=function(){return typeof window<"u"},zp=function(){return Ce||kp()&&(Ce=window.gsap)&&Ce.registerPlugin&&Ce},is=function(e){return!!~pf.indexOf(e)},Vp=function(e){return(e==="Height"?_f:rt["inner"+e])||Wn["client"+e]||_t["client"+e]},Hp=function(e){return Er(e,"getBoundingClientRect")||(is(e)?function(){return el.width=rt.innerWidth,el.height=_f,el}:function(){return Yi(e)})},Cg=function(e,t,n){var i=n.d,s=n.d2,a=n.a;return(a=Er(e,"getBoundingClientRect"))?function(){return a()[i]}:function(){return(t?Vp(s):e["client"+s])||0}},Rg=function(e,t){return!t||~Li.indexOf(e)?Hp(e):function(){return el}},Ri=function(e,t){var n=t.s,i=t.d2,s=t.d,a=t.a;return Math.max(0,(n="scroll"+i)&&(a=Er(e,n))?a()-Hp(e)()[s]:is(e)?(Wn[n]||_t[n])-Vp(i):e[n]-e["offset"+i])},ao=function(e,t){for(var n=0;n<Ps.length;n+=3)(!t||~t.indexOf(Ps[n+1]))&&e(Ps[n],Ps[n+1],Ps[n+2])},Hn=function(e){return typeof e=="string"},xn=function(e){return typeof e=="function"},Sa=function(e){return typeof e=="number"},Hr=function(e){return typeof e=="object"},sa=function(e,t,n){return e&&e.progress(t?0:1)&&n&&e.pause()},Xl=function(e,t){if(e.enabled){var n=e._ctx?e._ctx.add(function(){return t(e)}):t(e);n&&n.totalTime&&(e.callbackAnimation=n)}},hs=Math.abs,Gp="left",Wp="top",gf="right",xf="bottom",es="width",ts="height",La="Right",Na="Left",Ia="Top",Ua="Bottom",Ht="padding",ri="margin",qs="Width",vf="Height",qt="px",si=function(e){return rt.getComputedStyle(e)},Pg=function(e){var t=si(e).position;e.style.position=t==="absolute"||t==="fixed"?t:"relative"},lh=function(e,t){for(var n in t)n in e||(e[n]=t[n]);return e},Yi=function(e,t){var n=t&&si(e)[Yc]!=="matrix(1, 0, 0, 1, 0, 0)"&&Ce.to(e,{x:0,y:0,xPercent:0,yPercent:0,rotation:0,rotationX:0,rotationY:0,scale:1,skewX:0,skewY:0}).progress(1),i=e.getBoundingClientRect();return n&&n.progress(0).kill(),i},_l=function(e,t){var n=t.d2;return e["offset"+n]||e["client"+n]||0},Xp=function(e){var t=[],n=e.labels,i=e.duration(),s;for(s in n)t.push(n[s]/i);return t},Dg=function(e){return function(t){return Ce.utils.snap(Xp(e),t)}},Sf=function(e){var t=Ce.utils.snap(e),n=Array.isArray(e)&&e.slice(0).sort(function(i,s){return i-s});return n?function(i,s,a){a===void 0&&(a=.001);var o;if(!s)return t(i);if(s>0){for(i-=a,o=0;o<n.length;o++)if(n[o]>=i)return n[o];return n[o-1]}else for(o=n.length,i+=a;o--;)if(n[o]<=i)return n[o];return n[0]}:function(i,s,a){a===void 0&&(a=.001);var o=t(i);return!s||Math.abs(o-i)<a||o-i<0==s<0?o:t(s<0?i-e:i+e)}},Lg=function(e){return function(t,n){return Sf(Xp(e))(t,n.direction)}},oo=function(e,t,n,i){return n.split(",").forEach(function(s){return e(t,s,i)})},nn=function(e,t,n,i,s){return e.addEventListener(t,n,{passive:!i,capture:!!s})},tn=function(e,t,n,i){return e.removeEventListener(t,n,!!i)},lo=function(e,t,n){n=n&&n.wheelHandler,n&&(e(t,"wheel",n),e(t,"touchmove",n))},ch={startColor:"green",endColor:"red",indent:0,fontSize:"16px",fontWeight:"normal"},co={toggleActions:"play",anticipatePin:0},gl={top:0,left:0,center:.5,bottom:1,right:1},Ko=function(e,t){if(Hn(e)){var n=e.indexOf("="),i=~n?+(e.charAt(n-1)+1)*parseFloat(e.substr(n+1)):0;~n&&(e.indexOf("%")>n&&(i*=t/100),e=e.substr(0,n-1)),e=i+(e in gl?gl[e]*t:~e.indexOf("%")?parseFloat(e)*t/100:parseFloat(e)||0)}return e},uo=function(e,t,n,i,s,a,o,l){var c=s.startColor,u=s.endColor,d=s.fontSize,f=s.indent,h=s.fontWeight,_=wt.createElement("div"),g=is(n)||Er(n,"pinType")==="fixed",p=e.indexOf("scroller")!==-1,m=g?_t:n,v=e.indexOf("start")!==-1,b=v?c:u,S="border-color:"+b+";font-size:"+d+";color:"+b+";font-weight:"+h+";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";return S+="position:"+((p||l)&&g?"fixed;":"absolute;"),(p||l||!g)&&(S+=(i===$t?gf:xf)+":"+(a+parseFloat(f))+"px;"),o&&(S+="box-sizing:border-box;text-align:left;width:"+o.offsetWidth+"px;"),_._isStart=v,_.setAttribute("class","gsap-marker-"+e+(t?" marker-"+t:"")),_.style.cssText=S,_.innerText=t||t===0?e+"-"+t:e,m.children[0]?m.insertBefore(_,m.children[0]):m.appendChild(_),_._offset=_["offset"+i.op.d2],Zo(_,0,i,v),_},Zo=function(e,t,n,i){var s={display:"block"},a=n[i?"os2":"p2"],o=n[i?"p2":"os2"];e._isFlipped=i,s[n.a+"Percent"]=i?-100:0,s[n.a]=i?"1px":0,s["border"+a+qs]=1,s["border"+o+qs]=0,s[n.p]=t+"px",Ce.set(e,s)},nt=[],Zc={},Xa,uh=function(){return _n()-ui>34&&(Xa||(Xa=requestAnimationFrame(Zi)))},ds=function(){(!En||!En.isPressed||En.startX>_t.clientWidth)&&(st.cache++,En?Xa||(Xa=requestAnimationFrame(Zi)):Zi(),ui||ss("scrollStart"),ui=_n())},jl=function(){Bp=rt.innerWidth,Op=rt.innerHeight},Ma=function(e){st.cache++,(e===!0||!mn&&!Fp&&!wt.fullscreenElement&&!wt.webkitFullscreenElement&&(!qc||Bp!==rt.innerWidth||Math.abs(rt.innerHeight-Op)>rt.innerHeight*.25))&&ml.restart(!0)},rs={},Ng=[],jp=function r(){return tn(it,"scrollEnd",r)||Yr(!0)},ss=function(e){return rs[e]&&rs[e].map(function(t){return t()})||Ng},Vn=[],Yp=function(e){for(var t=0;t<Vn.length;t+=5)(!e||Vn[t+4]&&Vn[t+4].query===e)&&(Vn[t].style.cssText=Vn[t+1],Vn[t].getBBox&&Vn[t].setAttribute("transform",Vn[t+2]||""),Vn[t+3].uncache=1)},qp=function(){return st.forEach(function(e){return xn(e)&&++e.cacheID&&(e.rec=e())})},Mf=function(e,t){var n;for(Tn=0;Tn<nt.length;Tn++)n=nt[Tn],n&&(!t||n._ctx===t)&&(e?n.kill(1):n.revert(!0,!0));Da=!0,t&&Yp(t),t||ss("revert")},$p=function(e,t){st.cache++,(t||!wn)&&st.forEach(function(n){return xn(n)&&n.cacheID++&&(n.rec=0)}),Hn(e)&&(rt.history.scrollRestoration=mf=e)},wn,ns=0,fh,Ig=function(){if(fh!==ns){var e=fh=ns;requestAnimationFrame(function(){return e===ns&&Yr(!0)})}},Kp=function(){_t.appendChild(Bs),_f=!En&&Bs.offsetHeight||rt.innerHeight,_t.removeChild(Bs)},hh=function(e){return Wa(".gsap-marker-start, .gsap-marker-end, .gsap-marker-scroller-start, .gsap-marker-scroller-end").forEach(function(t){return t.style.display=e?"none":"block"})},Yr=function(e,t){if(Wn=wt.documentElement,_t=wt.body,pf=[rt,wt,Wn,_t],ui&&!e&&!Da){nn(it,"scrollEnd",jp);return}Kp(),wn=it.isRefreshing=!0,Da||qp();var n=ss("refreshInit");Up&&it.sort(),t||Mf(),st.forEach(function(i){xn(i)&&(i.smooth&&(i.target.style.scrollBehavior="auto"),i(0))}),nt.slice(0).forEach(function(i){return i.refresh()}),Da=!1,nt.forEach(function(i){if(i._subPinOffset&&i.pin){var s=i.vars.horizontal?"offsetWidth":"offsetHeight",a=i.pin[s];i.revert(!0,1),i.adjustPinSpacing(i.pin[s]-a),i.refresh()}}),Kc=1,hh(!0),nt.forEach(function(i){var s=Ri(i.scroller,i._dir),a=i.vars.end==="max"||i._endClamp&&i.end>s,o=i._startClamp&&i.start>=s;(a||o)&&i.setPositions(o?s-1:i.start,a?Math.max(o?s:i.start+1,s):i.end,!0)}),hh(!1),Kc=0,n.forEach(function(i){return i&&i.render&&i.render(-1)}),st.forEach(function(i){xn(i)&&(i.smooth&&requestAnimationFrame(function(){return i.target.style.scrollBehavior="smooth"}),i.rec&&i(i.rec))}),$p(mf,1),ml.pause(),ns++,wn=2,Zi(2),nt.forEach(function(i){return xn(i.vars.onRefresh)&&i.vars.onRefresh(i)}),wn=it.isRefreshing=!1,ss("refresh")},Jc=0,Jo=1,Fa,Zi=function(e){if(e===2||!wn&&!Da){it.isUpdating=!0,Fa&&Fa.update(0);var t=nt.length,n=_n(),i=n-Wl>=50,s=t&&nt[0].scroll();if(Jo=Jc>s?-1:1,wn||(Jc=s),i&&(ui&&!Cl&&n-ui>200&&(ui=0,ss("scrollEnd")),ga=Wl,Wl=n),Jo<0){for(Tn=t;Tn-- >0;)nt[Tn]&&nt[Tn].update(0,i);Jo=1}else for(Tn=0;Tn<t;Tn++)nt[Tn]&&nt[Tn].update(0,i);it.isUpdating=!1}Xa=0},Qc=[Gp,Wp,xf,gf,ri+Ua,ri+La,ri+Ia,ri+Na,"display","flexShrink","float","zIndex","gridColumnStart","gridColumnEnd","gridRowStart","gridRowEnd","gridArea","justifySelf","alignSelf","placeSelf","order"],Qo=Qc.concat([es,ts,"boxSizing","max"+qs,"max"+vf,"position",ri,Ht,Ht+Ia,Ht+La,Ht+Ua,Ht+Na]),Ug=function(e,t,n){ks(n);var i=e._gsap;if(i.spacerIsNative)ks(i.spacerState);else if(e._gsap.swappedIn){var s=t.parentNode;s&&(s.insertBefore(e,t),s.removeChild(t))}e._gsap.swappedIn=!1},Yl=function(e,t,n,i){if(!e._gsap.swappedIn){for(var s=Qc.length,a=t.style,o=e.style,l;s--;)l=Qc[s],a[l]=n[l];a.position=n.position==="absolute"?"absolute":"relative",n.display==="inline"&&(a.display="inline-block"),o[xf]=o[gf]="auto",a.flexBasis=n.flexBasis||"auto",a.overflow="visible",a.boxSizing="border-box",a[es]=_l(e,Cn)+qt,a[ts]=_l(e,$t)+qt,a[Ht]=o[ri]=o[Wp]=o[Gp]="0",ks(i),o[es]=o["max"+qs]=n[es],o[ts]=o["max"+vf]=n[ts],o[Ht]=n[Ht],e.parentNode!==t&&(e.parentNode.insertBefore(t,e),t.appendChild(e)),e._gsap.swappedIn=!0}},Fg=/([A-Z])/g,ks=function(e){if(e){var t=e.t.style,n=e.length,i=0,s,a;for((e.t._gsap||Ce.core.getCache(e.t)).uncache=1;i<n;i+=2)a=e[i+1],s=e[i],a?t[s]=a:t[s]&&t.removeProperty(s.replace(Fg,"-$1").toLowerCase())}},fo=function(e){for(var t=Qo.length,n=e.style,i=[],s=0;s<t;s++)i.push(Qo[s],n[Qo[s]]);return i.t=e,i},Og=function(e,t,n){for(var i=[],s=e.length,a=n?8:0,o;a<s;a+=2)o=e[a],i.push(o,o in t?t[o]:e[a+1]);return i.t=e.t,i},el={left:0,top:0},dh=function(e,t,n,i,s,a,o,l,c,u,d,f,h,_){xn(e)&&(e=e(l)),Hn(e)&&e.substr(0,3)==="max"&&(e=f+(e.charAt(4)==="="?Ko("0"+e.substr(3),n):0));var g=h?h.time():0,p,m,v;if(h&&h.seek(0),isNaN(e)||(e=+e),Sa(e))h&&(e=Ce.utils.mapRange(h.scrollTrigger.start,h.scrollTrigger.end,0,f,e)),o&&Zo(o,n,i,!0);else{xn(t)&&(t=t(l));var b=(e||"0").split(" "),S,w,E,A;v=Dn(t,l)||_t,S=Yi(v)||{},(!S||!S.left&&!S.top)&&si(v).display==="none"&&(A=v.style.display,v.style.display="block",S=Yi(v),A?v.style.display=A:v.style.removeProperty("display")),w=Ko(b[0],S[i.d]),E=Ko(b[1]||"0",n),e=S[i.p]-c[i.p]-u+w+s-E,o&&Zo(o,E,i,n-E<20||o._isStart&&E>20),n-=n-E}if(_&&(l[_]=e||-.001,e<0&&(e=0)),a){var x=e+n,y=a._isStart;p="scroll"+i.d2,Zo(a,x,i,y&&x>20||!y&&(d?Math.max(_t[p],Wn[p]):a.parentNode[p])<=x+1),d&&(c=Yi(o),d&&(a.style[i.op.p]=c[i.op.p]-i.op.m-a._offset+qt))}return h&&v&&(p=Yi(v),h.seek(f),m=Yi(v),h._caScrollDist=p[i.p]-m[i.p],e=e/h._caScrollDist*f),h&&h.seek(g),h?e:Math.round(e)},Bg=/(webkit|moz|length|cssText|inset)/i,ph=function(e,t,n,i){if(e.parentNode!==t){var s=e.style,a,o;if(t===_t){e._stOrig=s.cssText,o=si(e);for(a in o)!+a&&!Bg.test(a)&&o[a]&&typeof s[a]=="string"&&a!=="0"&&(s[a]=o[a]);s.top=n,s.left=i}else s.cssText=e._stOrig;Ce.core.getCache(e).uncache=1,t.appendChild(e)}},Zp=function(e,t,n){var i=t,s=i;return function(a){var o=Math.round(e());return o!==i&&o!==s&&Math.abs(o-i)>3&&Math.abs(o-s)>3&&(a=o,n&&n()),s=i,i=Math.round(a),i}},ho=function(e,t,n){var i={};i[t.p]="+="+n,Ce.set(e,i)},mh=function(e,t){var n=Cr(e,t),i="_scroll"+t.p2,s=function a(o,l,c,u,d){var f=a.tween,h=l.onComplete,_={};c=c||n();var g=Zp(n,c,function(){f.kill(),a.tween=0});return d=u&&d||0,u=u||o-c,f&&f.kill(),l[i]=o,l.inherit=!1,l.modifiers=_,_[i]=function(){return g(c+u*f.ratio+d*f.ratio*f.ratio)},l.onUpdate=function(){st.cache++,a.tween&&Zi()},l.onComplete=function(){a.tween=0,h&&h.call(f)},f=a.tween=Ce.to(e,l),f};return e[i]=n,n.wheelHandler=function(){return s.tween&&s.tween.kill()&&(s.tween=0)},nn(e,"wheel",n.wheelHandler),it.isTouch&&nn(e,"touchmove",n.wheelHandler),s},it=(function(){function r(t,n){Rs||r.register(Ce)||console.warn("Please gsap.registerPlugin(ScrollTrigger)"),$c(this),this.init(t,n)}var e=r.prototype;return e.init=function(n,i){if(this.progress=this.start=0,this.vars&&this.kill(!0,!0),!xa){this.update=this.refresh=this.kill=Ti;return}n=lh(Hn(n)||Sa(n)||n.nodeType?{trigger:n}:n,co);var s=n,a=s.onUpdate,o=s.toggleClass,l=s.id,c=s.onToggle,u=s.onRefresh,d=s.scrub,f=s.trigger,h=s.pin,_=s.pinSpacing,g=s.invalidateOnRefresh,p=s.anticipatePin,m=s.onScrubComplete,v=s.onSnapComplete,b=s.once,S=s.snap,w=s.pinReparent,E=s.pinSpacer,A=s.containerAnimation,x=s.fastScrollEnd,y=s.preventOverlaps,D=n.horizontal||n.containerAnimation&&n.horizontal!==!1?Cn:$t,P=!d&&d!==0,I=Dn(n.scroller||rt),k=Ce.core.getCache(I),V=is(I),H=("pinType"in n?n.pinType:Er(I,"pinType")||V&&"fixed")==="fixed",z=[n.onEnter,n.onLeave,n.onEnterBack,n.onLeaveBack],B=P&&n.toggleActions.split(" "),Q="markers"in n?n.markers:co.markers,ee=V?0:parseFloat(si(I)["border"+D.p2+qs])||0,L=this,ce=n.onRefreshInit&&function(){return n.onRefreshInit(L)},ue=Cg(I,V,D),ke=Rg(I,V),He=0,Ye=0,K=0,te=Cr(I,D),se,Ne,Ie,Re,lt,Ee,ze,$e,Be,X,U,pt,et,Ve,Se,C,M,F,Z,J,q,xe,oe,Pe,Me,ie,ae,ye,Te,de,Ge,N,le,re,pe,ne,$,be,Fe;if(L._startClamp=L._endClamp=!1,L._dir=D,p*=45,L.scroller=I,L.scroll=A?A.time.bind(A):te,Re=te(),L.vars=n,i=i||n.animation,"refreshPriority"in n&&(Up=1,n.refreshPriority===-9999&&(Fa=L)),k.tweenScroll=k.tweenScroll||{top:mh(I,$t),left:mh(I,Cn)},L.tweenTo=se=k.tweenScroll[D.p],L.scrubDuration=function(_e){le=Sa(_e)&&_e,le?N?N.duration(_e):N=Ce.to(i,{ease:"expo",totalProgress:"+=0",inherit:!1,duration:le,paused:!0,onComplete:function(){return m&&m(L)}}):(N&&N.progress(1).kill(),N=0)},i&&(i.vars.lazy=!1,i._initted&&!L.isReverted||i.vars.immediateRender!==!1&&n.immediateRender!==!1&&i.duration()&&i.render(0,!0,!0),L.animation=i.pause(),i.scrollTrigger=L,L.scrubDuration(d),de=0,l||(l=i.vars.id)),S&&((!Hr(S)||S.push)&&(S={snapTo:S}),"scrollBehavior"in _t.style&&Ce.set(V?[_t,Wn]:I,{scrollBehavior:"auto"}),st.forEach(function(_e){return xn(_e)&&_e.target===(V?wt.scrollingElement||Wn:I)&&(_e.smooth=!1)}),Ie=xn(S.snapTo)?S.snapTo:S.snapTo==="labels"?Dg(i):S.snapTo==="labelsDirectional"?Lg(i):S.directional!==!1?function(_e,We){return Sf(S.snapTo)(_e,_n()-Ye<500?0:We.direction)}:Ce.utils.snap(S.snapTo),re=S.duration||{min:.1,max:2},re=Hr(re)?Pa(re.min,re.max):Pa(re,re),pe=Ce.delayedCall(S.delay||le/2||.1,function(){var _e=te(),We=_n()-Ye<500,Oe=se.tween;if((We||Math.abs(L.getVelocity())<10)&&!Oe&&!Cl&&He!==_e){var Xe=(_e-Ee)/Ve,Ft=i&&!P?i.totalProgress():Xe,qe=We?0:(Ft-Ge)/(_n()-ga)*1e3||0,At=Ce.utils.clamp(-Xe,1-Xe,hs(qe/2)*qe/.185),Xt=Xe+(S.inertia===!1?0:At),Ct,gt,mt=S,un=mt.onStart,Tt=mt.onInterrupt,fn=mt.onComplete;if(Ct=Ie(Xt,L),Sa(Ct)||(Ct=Xt),gt=Math.max(0,Math.round(Ee+Ct*Ve)),_e<=ze&&_e>=Ee&&gt!==_e){if(Oe&&!Oe._initted&&Oe.data<=hs(gt-_e))return;S.inertia===!1&&(At=Ct-Xe),se(gt,{duration:re(hs(Math.max(hs(Xt-Ft),hs(Ct-Ft))*.185/qe/.05||0)),ease:S.ease||"power3",data:hs(gt-_e),onInterrupt:function(){return pe.restart(!0)&&Tt&&Tt(L)},onComplete:function(){L.update(),He=te(),i&&!P&&(N?N.resetTo("totalProgress",Ct,i._tTime/i._tDur):i.progress(Ct)),de=Ge=i&&!P?i.totalProgress():L.progress,v&&v(L),fn&&fn(L)}},_e,At*Ve,gt-_e-At*Ve),un&&un(L,se.tween)}}else L.isActive&&He!==_e&&pe.restart(!0)}).pause()),l&&(Zc[l]=L),f=L.trigger=Dn(f||h!==!0&&h),Fe=f&&f._gsap&&f._gsap.stRevert,Fe&&(Fe=Fe(L)),h=h===!0?f:Dn(h),Hn(o)&&(o={targets:f,className:o}),h&&(_===!1||_===ri||(_=!_&&h.parentNode&&h.parentNode.style&&si(h.parentNode).display==="flex"?!1:Ht),L.pin=h,Ne=Ce.core.getCache(h),Ne.spacer?Se=Ne.pinState:(E&&(E=Dn(E),E&&!E.nodeType&&(E=E.current||E.nativeElement),Ne.spacerIsNative=!!E,E&&(Ne.spacerState=fo(E))),Ne.spacer=F=E||wt.createElement("div"),F.classList.add("pin-spacer"),l&&F.classList.add("pin-spacer-"+l),Ne.pinState=Se=fo(h)),n.force3D!==!1&&Ce.set(h,{force3D:!0}),L.spacer=F=Ne.spacer,Te=si(h),Pe=Te[_+D.os2],J=Ce.getProperty(h),q=Ce.quickSetter(h,D.a,qt),Yl(h,F,Te),M=fo(h)),Q){pt=Hr(Q)?lh(Q,ch):ch,X=uo("scroller-start",l,I,D,pt,0),U=uo("scroller-end",l,I,D,pt,0,X),Z=X["offset"+D.op.d2];var ut=Dn(Er(I,"content")||I);$e=this.markerStart=uo("start",l,ut,D,pt,Z,0,A),Be=this.markerEnd=uo("end",l,ut,D,pt,Z,0,A),A&&(be=Ce.quickSetter([$e,Be],D.a,qt)),!H&&!(Li.length&&Er(I,"fixedMarkers")===!0)&&(Pg(V?_t:I),Ce.set([X,U],{force3D:!0}),ie=Ce.quickSetter(X,D.a,qt),ye=Ce.quickSetter(U,D.a,qt))}if(A){var ve=A.vars.onUpdate,De=A.vars.onUpdateParams;A.eventCallback("onUpdate",function(){L.update(0,0,1),ve&&ve.apply(A,De||[])})}if(L.previous=function(){return nt[nt.indexOf(L)-1]},L.next=function(){return nt[nt.indexOf(L)+1]},L.revert=function(_e,We){if(!We)return L.kill(!0);var Oe=_e!==!1||!L.enabled,Xe=mn;Oe!==L.isReverted&&(Oe&&(ne=Math.max(te(),L.scroll.rec||0),K=L.progress,$=i&&i.progress()),$e&&[$e,Be,X,U].forEach(function(Ft){return Ft.style.display=Oe?"none":"block"}),Oe&&(mn=L,L.update(Oe)),h&&(!w||!L.isActive)&&(Oe?Ug(h,F,Se):Yl(h,F,si(h),Me)),Oe||L.update(Oe),mn=Xe,L.isReverted=Oe)},L.refresh=function(_e,We,Oe,Xe){if(!((mn||!L.enabled)&&!We)){if(h&&_e&&ui){nn(r,"scrollEnd",jp);return}!wn&&ce&&ce(L),mn=L,se.tween&&!Oe&&(se.tween.kill(),se.tween=0),N&&N.pause(),g&&i&&(i.revert({kill:!1}).invalidate(),i.getChildren?i.getChildren(!0,!0,!1).forEach(function(we){return we.vars.immediateRender&&we.render(0,!0,!0)}):i.vars.immediateRender&&i.render(0,!0,!0)),L.isReverted||L.revert(!0,!0),L._subPinOffset=!1;var Ft=ue(),qe=ke(),At=A?A.duration():Ri(I,D),Xt=Ve<=.01||!Ve,Ct=0,gt=Xe||0,mt=Hr(Oe)?Oe.end:n.end,un=n.endTrigger||f,Tt=Hr(Oe)?Oe.start:n.start||(n.start===0||!f?0:h?"0 0":"0 100%"),fn=L.pinnedContainer=n.pinnedContainer&&Dn(n.pinnedContainer,L),Qn=f&&Math.max(0,nt.indexOf(L))||0,jt=Qn,Yt,Jt,ki,ls,T,O,Y,W,G,fe,me,he,Ae;for(Q&&Hr(Oe)&&(he=Ce.getProperty(X,D.p),Ae=Ce.getProperty(U,D.p));jt-- >0;)O=nt[jt],O.end||O.refresh(0,1)||(mn=L),Y=O.pin,Y&&(Y===f||Y===h||Y===fn)&&!O.isReverted&&(fe||(fe=[]),fe.unshift(O),O.revert(!0,!0)),O!==nt[jt]&&(Qn--,jt--);for(xn(Tt)&&(Tt=Tt(L)),Tt=rh(Tt,"start",L),Ee=dh(Tt,f,Ft,D,te(),$e,X,L,qe,ee,H,At,A,L._startClamp&&"_startClamp")||(h?-.001:0),xn(mt)&&(mt=mt(L)),Hn(mt)&&!mt.indexOf("+=")&&(~mt.indexOf(" ")?mt=(Hn(Tt)?Tt.split(" ")[0]:"")+mt:(Ct=Ko(mt.substr(2),Ft),mt=Hn(Tt)?Tt:(A?Ce.utils.mapRange(0,A.duration(),A.scrollTrigger.start,A.scrollTrigger.end,Ee):Ee)+Ct,un=f)),mt=rh(mt,"end",L),ze=Math.max(Ee,dh(mt||(un?"100% 0":At),un,Ft,D,te()+Ct,Be,U,L,qe,ee,H,At,A,L._endClamp&&"_endClamp"))||-.001,Ct=0,jt=Qn;jt--;)O=nt[jt]||{},Y=O.pin,Y&&O.start-O._pinPush<=Ee&&!A&&O.end>0&&(Yt=O.end-(L._startClamp?Math.max(0,O.start):O.start),(Y===f&&O.start-O._pinPush<Ee||Y===fn)&&isNaN(Tt)&&(Ct+=Yt*(1-O.progress)),Y===h&&(gt+=Yt));if(Ee+=Ct,ze+=Ct,L._startClamp&&(L._startClamp+=Ct),L._endClamp&&!wn&&(L._endClamp=ze||-.001,ze=Math.min(ze,Ri(I,D))),Ve=ze-Ee||(Ee-=.01)&&.001,Xt&&(K=Ce.utils.clamp(0,1,Ce.utils.normalize(Ee,ze,ne))),L._pinPush=gt,$e&&Ct&&(Yt={},Yt[D.a]="+="+Ct,fn&&(Yt[D.p]="-="+te()),Ce.set([$e,Be],Yt)),h&&!(Kc&&L.end>=Ri(I,D)))Yt=si(h),ls=D===$t,ki=te(),xe=parseFloat(J(D.a))+gt,!At&&ze>1&&(me=(V?wt.scrollingElement||Wn:I).style,me={style:me,value:me["overflow"+D.a.toUpperCase()]},V&&si(_t)["overflow"+D.a.toUpperCase()]!=="scroll"&&(me.style["overflow"+D.a.toUpperCase()]="scroll")),Yl(h,F,Yt),M=fo(h),Jt=Yi(h,!0),W=H&&Cr(I,ls?Cn:$t)(),_?(Me=[_+D.os2,Ve+gt+qt],Me.t=F,jt=_===Ht?_l(h,D)+Ve+gt:0,jt&&(Me.push(D.d,jt+qt),F.style.flexBasis!=="auto"&&(F.style.flexBasis=jt+qt)),ks(Me),fn&&nt.forEach(function(we){we.pin===fn&&we.vars.pinSpacing!==!1&&(we._subPinOffset=!0)}),H&&te(ne)):(jt=_l(h,D),jt&&F.style.flexBasis!=="auto"&&(F.style.flexBasis=jt+qt)),H&&(T={top:Jt.top+(ls?ki-Ee:W)+qt,left:Jt.left+(ls?W:ki-Ee)+qt,boxSizing:"border-box",position:"fixed"},T[es]=T["max"+qs]=Math.ceil(Jt.width)+qt,T[ts]=T["max"+vf]=Math.ceil(Jt.height)+qt,T[ri]=T[ri+Ia]=T[ri+La]=T[ri+Ua]=T[ri+Na]="0",T[Ht]=Yt[Ht],T[Ht+Ia]=Yt[Ht+Ia],T[Ht+La]=Yt[Ht+La],T[Ht+Ua]=Yt[Ht+Ua],T[Ht+Na]=Yt[Ht+Na],C=Og(Se,T,w),wn&&te(0)),i?(G=i._initted,Hl(1),i.render(i.duration(),!0,!0),oe=J(D.a)-xe+Ve+gt,ae=Math.abs(Ve-oe)>1,H&&ae&&C.splice(C.length-2,2),i.render(0,!0,!0),G||i.invalidate(!0),i.parent||i.totalTime(i.totalTime()),Hl(0)):oe=Ve,me&&(me.value?me.style["overflow"+D.a.toUpperCase()]=me.value:me.style.removeProperty("overflow-"+D.a));else if(f&&te()&&!A)for(Jt=f.parentNode;Jt&&Jt!==_t;)Jt._pinOffset&&(Ee-=Jt._pinOffset,ze-=Jt._pinOffset),Jt=Jt.parentNode;fe&&fe.forEach(function(we){return we.revert(!1,!0)}),L.start=Ee,L.end=ze,Re=lt=wn?ne:te(),!A&&!wn&&(Re<ne&&te(ne),L.scroll.rec=0),L.revert(!1,!0),Ye=_n(),pe&&(He=-1,pe.restart(!0)),mn=0,i&&P&&(i._initted||$)&&i.progress()!==$&&i.progress($||0,!0).render(i.time(),!0,!0),(Xt||K!==L.progress||A||g||i&&!i._initted)&&(i&&!P&&(i._initted||K||i.vars.immediateRender!==!1)&&i.totalProgress(A&&Ee<-.001&&!K?Ce.utils.normalize(Ee,ze,0):K,!0),L.progress=Xt||(Re-Ee)/Ve===K?0:K),h&&_&&(F._pinOffset=Math.round(L.progress*oe)),N&&N.invalidate(),isNaN(he)||(he-=Ce.getProperty(X,D.p),Ae-=Ce.getProperty(U,D.p),ho(X,D,he),ho($e,D,he-(Xe||0)),ho(U,D,Ae),ho(Be,D,Ae-(Xe||0))),Xt&&!wn&&L.update(),u&&!wn&&!et&&(et=!0,u(L),et=!1)}},L.getVelocity=function(){return(te()-lt)/(_n()-ga)*1e3||0},L.endAnimation=function(){sa(L.callbackAnimation),i&&(N?N.progress(1):i.paused()?P||sa(i,L.direction<0,1):sa(i,i.reversed()))},L.labelToScroll=function(_e){return i&&i.labels&&(Ee||L.refresh()||Ee)+i.labels[_e]/i.duration()*Ve||0},L.getTrailing=function(_e){var We=nt.indexOf(L),Oe=L.direction>0?nt.slice(0,We).reverse():nt.slice(We+1);return(Hn(_e)?Oe.filter(function(Xe){return Xe.vars.preventOverlaps===_e}):Oe).filter(function(Xe){return L.direction>0?Xe.end<=Ee:Xe.start>=ze})},L.update=function(_e,We,Oe){if(!(A&&!Oe&&!_e)){var Xe=wn===!0?ne:L.scroll(),Ft=_e?0:(Xe-Ee)/Ve,qe=Ft<0?0:Ft>1?1:Ft||0,At=L.progress,Xt,Ct,gt,mt,un,Tt,fn,Qn;if(We&&(lt=Re,Re=A?te():Xe,S&&(Ge=de,de=i&&!P?i.totalProgress():qe)),p&&h&&!mn&&!so&&ui&&(!qe&&Ee<Xe+(Xe-lt)/(_n()-ga)*p?qe=1e-4:qe===1&&ze>Xe+(Xe-lt)/(_n()-ga)*p&&(qe=.9999)),qe!==At&&L.enabled){if(Xt=L.isActive=!!qe&&qe<1,Ct=!!At&&At<1,Tt=Xt!==Ct,un=Tt||!!qe!=!!At,L.direction=qe>At?1:-1,L.progress=qe,un&&!mn&&(gt=qe&&!At?0:qe===1?1:At===1?2:3,P&&(mt=!Tt&&B[gt+1]!=="none"&&B[gt+1]||B[gt],Qn=i&&(mt==="complete"||mt==="reset"||mt in i))),y&&(Tt||Qn)&&(Qn||d||!i)&&(xn(y)?y(L):L.getTrailing(y).forEach(function(ki){return ki.endAnimation()})),P||(N&&!mn&&!so?(N._dp._time-N._start!==N._time&&N.render(N._dp._time-N._start),N.resetTo?N.resetTo("totalProgress",qe,i._tTime/i._tDur):(N.vars.totalProgress=qe,N.invalidate().restart())):i&&i.totalProgress(qe,!!(mn&&(Ye||_e)))),h){if(_e&&_&&(F.style[_+D.os2]=Pe),!H)q(va(xe+oe*qe));else if(un){if(fn=!_e&&qe>At&&ze+1>Xe&&Xe+1>=Ri(I,D),w)if(!_e&&(Xt||fn)){var jt=Yi(h,!0),Yt=Xe-Ee;ph(h,_t,jt.top+(D===$t?Yt:0)+qt,jt.left+(D===$t?0:Yt)+qt)}else ph(h,F);ks(Xt||fn?C:M),ae&&qe<1&&Xt||q(xe+(qe===1&&!fn?oe:0))}}S&&!se.tween&&!mn&&!so&&pe.restart(!0),o&&(Tt||b&&qe&&(qe<1||!Gl))&&Wa(o.targets).forEach(function(ki){return ki.classList[Xt||b?"add":"remove"](o.className)}),a&&!P&&!_e&&a(L),un&&!mn?(P&&(Qn&&(mt==="complete"?i.pause().totalProgress(1):mt==="reset"?i.restart(!0).pause():mt==="restart"?i.restart(!0):i[mt]()),a&&a(L)),(Tt||!Gl)&&(c&&Tt&&Xl(L,c),z[gt]&&Xl(L,z[gt]),b&&(qe===1?L.kill(!1,1):z[gt]=0),Tt||(gt=qe===1?1:3,z[gt]&&Xl(L,z[gt]))),x&&!Xt&&Math.abs(L.getVelocity())>(Sa(x)?x:2500)&&(sa(L.callbackAnimation),N?N.progress(1):sa(i,mt==="reverse"?1:!qe,1))):P&&a&&!mn&&a(L)}if(ye){var Jt=A?Xe/A.duration()*(A._caScrollDist||0):Xe;ie(Jt+(X._isFlipped?1:0)),ye(Jt)}be&&be(-Xe/A.duration()*(A._caScrollDist||0))}},L.enable=function(_e,We){L.enabled||(L.enabled=!0,nn(I,"resize",Ma),V||nn(I,"scroll",ds),ce&&nn(r,"refreshInit",ce),_e!==!1&&(L.progress=K=0,Re=lt=He=te()),We!==!1&&L.refresh())},L.getTween=function(_e){return _e&&se?se.tween:N},L.setPositions=function(_e,We,Oe,Xe){if(A){var Ft=A.scrollTrigger,qe=A.duration(),At=Ft.end-Ft.start;_e=Ft.start+At*_e/qe,We=Ft.start+At*We/qe}L.refresh(!1,!1,{start:sh(_e,Oe&&!!L._startClamp),end:sh(We,Oe&&!!L._endClamp)},Xe),L.update()},L.adjustPinSpacing=function(_e){if(Me&&_e){var We=Me.indexOf(D.d)+1;Me[We]=parseFloat(Me[We])+_e+qt,Me[1]=parseFloat(Me[1])+_e+qt,ks(Me)}},L.disable=function(_e,We){if(_e!==!1&&L.revert(!0,!0),L.enabled&&(L.enabled=L.isActive=!1,We||N&&N.pause(),ne=0,Ne&&(Ne.uncache=1),ce&&tn(r,"refreshInit",ce),pe&&(pe.pause(),se.tween&&se.tween.kill()&&(se.tween=0)),!V)){for(var Oe=nt.length;Oe--;)if(nt[Oe].scroller===I&&nt[Oe]!==L)return;tn(I,"resize",Ma),V||tn(I,"scroll",ds)}},L.kill=function(_e,We){L.disable(_e,We),N&&!We&&N.kill(),l&&delete Zc[l];var Oe=nt.indexOf(L);Oe>=0&&nt.splice(Oe,1),Oe===Tn&&Jo>0&&Tn--,Oe=0,nt.forEach(function(Xe){return Xe.scroller===L.scroller&&(Oe=1)}),Oe||wn||(L.scroll.rec=0),i&&(i.scrollTrigger=null,_e&&i.revert({kill:!1}),We||i.kill()),$e&&[$e,Be,X,U].forEach(function(Xe){return Xe.parentNode&&Xe.parentNode.removeChild(Xe)}),Fa===L&&(Fa=0),h&&(Ne&&(Ne.uncache=1),Oe=0,nt.forEach(function(Xe){return Xe.pin===h&&Oe++}),Oe||(Ne.spacer=0)),n.onKill&&n.onKill(L)},nt.push(L),L.enable(!1,!1),Fe&&Fe(L),i&&i.add&&!Ve){var Ze=L.update;L.update=function(){L.update=Ze,st.cache++,Ee||ze||L.refresh()},Ce.delayedCall(.01,L.update),Ve=.01,Ee=ze=0}else L.refresh();h&&Ig()},r.register=function(n){return Rs||(Ce=n||zp(),kp()&&window.document&&r.enable(),Rs=xa),Rs},r.defaults=function(n){if(n)for(var i in n)co[i]=n[i];return co},r.disable=function(n,i){xa=0,nt.forEach(function(a){return a[i?"kill":"disable"](n)}),tn(rt,"wheel",ds),tn(wt,"scroll",ds),clearInterval(ro),tn(wt,"touchcancel",Ti),tn(_t,"touchstart",Ti),oo(tn,wt,"pointerdown,touchstart,mousedown",ah),oo(tn,wt,"pointerup,touchend,mouseup",oh),ml.kill(),ao(tn);for(var s=0;s<st.length;s+=3)lo(tn,st[s],st[s+1]),lo(tn,st[s],st[s+2])},r.enable=function(){if(rt=window,wt=document,Wn=wt.documentElement,_t=wt.body,Ce&&(Wa=Ce.utils.toArray,Pa=Ce.utils.clamp,$c=Ce.core.context||Ti,Hl=Ce.core.suppressOverwrites||Ti,mf=rt.history.scrollRestoration||"auto",Jc=rt.pageYOffset||0,Ce.core.globals("ScrollTrigger",r),_t)){xa=1,Bs=document.createElement("div"),Bs.style.height="100vh",Bs.style.position="absolute",Kp(),Ag(),zt.register(Ce),r.isTouch=zt.isTouch,pr=zt.isTouch&&/(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent),qc=zt.isTouch===1,nn(rt,"wheel",ds),pf=[rt,wt,Wn,_t],Ce.matchMedia?(r.matchMedia=function(c){var u=Ce.matchMedia(),d;for(d in c)u.add(d,c[d]);return u},Ce.addEventListener("matchMediaInit",function(){qp(),Mf()}),Ce.addEventListener("matchMediaRevert",function(){return Yp()}),Ce.addEventListener("matchMedia",function(){Yr(0,1),ss("matchMedia")}),Ce.matchMedia().add("(orientation: portrait)",function(){return jl(),jl})):console.warn("Requires GSAP 3.11.0 or later"),jl(),nn(wt,"scroll",ds);var n=_t.hasAttribute("style"),i=_t.style,s=i.borderTopStyle,a=Ce.core.Animation.prototype,o,l;for(a.revert||Object.defineProperty(a,"revert",{value:function(){return this.time(-.01,!0)}}),i.borderTopStyle="solid",o=Yi(_t),$t.m=Math.round(o.top+$t.sc())||0,Cn.m=Math.round(o.left+Cn.sc())||0,s?i.borderTopStyle=s:i.removeProperty("border-top-style"),n||(_t.setAttribute("style",""),_t.removeAttribute("style")),ro=setInterval(uh,250),Ce.delayedCall(.5,function(){return so=0}),nn(wt,"touchcancel",Ti),nn(_t,"touchstart",Ti),oo(nn,wt,"pointerdown,touchstart,mousedown",ah),oo(nn,wt,"pointerup,touchend,mouseup",oh),Yc=Ce.utils.checkPrefix("transform"),Qo.push(Yc),Rs=_n(),ml=Ce.delayedCall(.2,Yr).pause(),Ps=[wt,"visibilitychange",function(){var c=rt.innerWidth,u=rt.innerHeight;wt.hidden?(nh=c,ih=u):(nh!==c||ih!==u)&&Ma()},wt,"DOMContentLoaded",Yr,rt,"load",Yr,rt,"resize",Ma],ao(nn),nt.forEach(function(c){return c.enable(0,1)}),l=0;l<st.length;l+=3)lo(tn,st[l],st[l+1]),lo(tn,st[l],st[l+2])}},r.config=function(n){"limitCallbacks"in n&&(Gl=!!n.limitCallbacks);var i=n.syncInterval;i&&clearInterval(ro)||(ro=i)&&setInterval(uh,i),"ignoreMobileResize"in n&&(qc=r.isTouch===1&&n.ignoreMobileResize),"autoRefreshEvents"in n&&(ao(tn)||ao(nn,n.autoRefreshEvents||"none"),Fp=(n.autoRefreshEvents+"").indexOf("resize")===-1)},r.scrollerProxy=function(n,i){var s=Dn(n),a=st.indexOf(s),o=is(s);~a&&st.splice(a,o?6:2),i&&(o?Li.unshift(rt,i,_t,i,Wn,i):Li.unshift(s,i))},r.clearMatchMedia=function(n){nt.forEach(function(i){return i._ctx&&i._ctx.query===n&&i._ctx.kill(!0,!0)})},r.isInViewport=function(n,i,s){var a=(Hn(n)?Dn(n):n).getBoundingClientRect(),o=a[s?es:ts]*i||0;return s?a.right-o>0&&a.left+o<rt.innerWidth:a.bottom-o>0&&a.top+o<rt.innerHeight},r.positionInViewport=function(n,i,s){Hn(n)&&(n=Dn(n));var a=n.getBoundingClientRect(),o=a[s?es:ts],l=i==null?o/2:i in gl?gl[i]*o:~i.indexOf("%")?parseFloat(i)*o/100:parseFloat(i)||0;return s?(a.left+l)/rt.innerWidth:(a.top+l)/rt.innerHeight},r.killAll=function(n){if(nt.slice(0).forEach(function(s){return s.vars.id!=="ScrollSmoother"&&s.kill()}),n!==!0){var i=rs.killAll||[];rs={},i.forEach(function(s){return s()})}},r})();it.version="3.14.2";it.saveStyles=function(r){return r?Wa(r).forEach(function(e){if(e&&e.style){var t=Vn.indexOf(e);t>=0&&Vn.splice(t,5),Vn.push(e,e.style.cssText,e.getBBox&&e.getAttribute("transform"),Ce.core.getCache(e),$c())}}):Vn};it.revert=function(r,e){return Mf(!r,e)};it.create=function(r,e){return new it(r,e)};it.refresh=function(r){return r?Ma(!0):(Rs||it.register())&&Yr(!0)};it.update=function(r){return++st.cache&&Zi(r===!0?2:0)};it.clearScrollMemory=$p;it.maxScroll=function(r,e){return Ri(r,e?Cn:$t)};it.getScrollFunc=function(r,e){return Cr(Dn(r),e?Cn:$t)};it.getById=function(r){return Zc[r]};it.getAll=function(){return nt.filter(function(r){return r.vars.id!=="ScrollSmoother"})};it.isScrolling=function(){return!!ui};it.snapDirectional=Sf;it.addEventListener=function(r,e){var t=rs[r]||(rs[r]=[]);~t.indexOf(e)||t.push(e)};it.removeEventListener=function(r,e){var t=rs[r],n=t&&t.indexOf(e);n>=0&&t.splice(n,1)};it.batch=function(r,e){var t=[],n={},i=e.interval||.016,s=e.batchMax||1e9,a=function(c,u){var d=[],f=[],h=Ce.delayedCall(i,function(){u(d,f),d=[],f=[]}).pause();return function(_){d.length||h.restart(!0),d.push(_.trigger),f.push(_),s<=d.length&&h.progress(1)}},o;for(o in e)n[o]=o.substr(0,2)==="on"&&xn(e[o])&&o!=="onRefreshInit"?a(o,e[o]):e[o];return xn(s)&&(s=s(),nn(it,"refresh",function(){return s=e.batchMax()})),Wa(r).forEach(function(l){var c={};for(o in n)c[o]=n[o];c.trigger=l,t.push(it.create(c))}),t};var _h=function(e,t,n,i){return t>i?e(i):t<0&&e(0),n>i?(i-t)/(n-t):n<0?t/(t-n):1},ql=function r(e,t){t===!0?e.style.removeProperty("touch-action"):e.style.touchAction=t===!0?"auto":t?"pan-"+t+(zt.isTouch?" pinch-zoom":""):"none",e===Wn&&r(_t,t)},po={auto:1,scroll:1},kg=function(e){var t=e.event,n=e.target,i=e.axis,s=(t.changedTouches?t.changedTouches[0]:t).target,a=s._gsap||Ce.core.getCache(s),o=_n(),l;if(!a._isScrollT||o-a._isScrollT>2e3){for(;s&&s!==_t&&(s.scrollHeight<=s.clientHeight&&s.scrollWidth<=s.clientWidth||!(po[(l=si(s)).overflowY]||po[l.overflowX]));)s=s.parentNode;a._isScroll=s&&s!==n&&!is(s)&&(po[(l=si(s)).overflowY]||po[l.overflowX]),a._isScrollT=o}(a._isScroll||i==="x")&&(t.stopPropagation(),t._gsapAllow=!0)},Jp=function(e,t,n,i){return zt.create({target:e,capture:!0,debounce:!1,lockAxis:!0,type:t,onWheel:i=i&&kg,onPress:i,onDrag:i,onScroll:i,onEnable:function(){return n&&nn(wt,zt.eventTypes[0],xh,!1,!0)},onDisable:function(){return tn(wt,zt.eventTypes[0],xh,!0)}})},zg=/(input|label|select|textarea)/i,gh,xh=function(e){var t=zg.test(e.target.tagName);(t||gh)&&(e._gsapAllow=!0,gh=t)},Vg=function(e){Hr(e)||(e={}),e.preventDefault=e.isNormalizer=e.allowClicks=!0,e.type||(e.type="wheel,touch"),e.debounce=!!e.debounce,e.id=e.id||"normalizer";var t=e,n=t.normalizeScrollX,i=t.momentum,s=t.allowNestedScroll,a=t.onRelease,o,l,c=Dn(e.target)||Wn,u=Ce.core.globals().ScrollSmoother,d=u&&u.get(),f=pr&&(e.content&&Dn(e.content)||d&&e.content!==!1&&!d.smooth()&&d.content()),h=Cr(c,$t),_=Cr(c,Cn),g=1,p=(zt.isTouch&&rt.visualViewport?rt.visualViewport.scale*rt.visualViewport.width:rt.outerWidth)/rt.innerWidth,m=0,v=xn(i)?function(){return i(o)}:function(){return i||2.8},b,S,w=Jp(c,e.type,!0,s),E=function(){return S=!1},A=Ti,x=Ti,y=function(){l=Ri(c,$t),x=Pa(pr?1:0,l),n&&(A=Pa(0,Ri(c,Cn))),b=ns},D=function(){f._gsap.y=va(parseFloat(f._gsap.y)+h.offset)+"px",f.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+parseFloat(f._gsap.y)+", 0, 1)",h.offset=h.cacheID=0},P=function(){if(S){requestAnimationFrame(E);var Q=va(o.deltaY/2),ee=x(h.v-Q);if(f&&ee!==h.v+h.offset){h.offset=ee-h.v;var L=va((parseFloat(f&&f._gsap.y)||0)-h.offset);f.style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, "+L+", 0, 1)",f._gsap.y=L+"px",h.cacheID=st.cache,Zi()}return!0}h.offset&&D(),S=!0},I,k,V,H,z=function(){y(),I.isActive()&&I.vars.scrollY>l&&(h()>l?I.progress(1)&&h(l):I.resetTo("scrollY",l))};return f&&Ce.set(f,{y:"+=0"}),e.ignoreCheck=function(B){return pr&&B.type==="touchmove"&&P()||g>1.05&&B.type!=="touchstart"||o.isGesturing||B.touches&&B.touches.length>1},e.onPress=function(){S=!1;var B=g;g=va((rt.visualViewport&&rt.visualViewport.scale||1)/p),I.pause(),B!==g&&ql(c,g>1.01?!0:n?!1:"x"),k=_(),V=h(),y(),b=ns},e.onRelease=e.onGestureStart=function(B,Q){if(h.offset&&D(),!Q)H.restart(!0);else{st.cache++;var ee=v(),L,ce;n&&(L=_(),ce=L+ee*.05*-B.velocityX/.227,ee*=_h(_,L,ce,Ri(c,Cn)),I.vars.scrollX=A(ce)),L=h(),ce=L+ee*.05*-B.velocityY/.227,ee*=_h(h,L,ce,Ri(c,$t)),I.vars.scrollY=x(ce),I.invalidate().duration(ee).play(.01),(pr&&I.vars.scrollY>=l||L>=l-1)&&Ce.to({},{onUpdate:z,duration:ee})}a&&a(B)},e.onWheel=function(){I._ts&&I.pause(),_n()-m>1e3&&(b=0,m=_n())},e.onChange=function(B,Q,ee,L,ce){if(ns!==b&&y(),Q&&n&&_(A(L[2]===Q?k+(B.startX-B.x):_()+Q-L[1])),ee){h.offset&&D();var ue=ce[2]===ee,ke=ue?V+B.startY-B.y:h()+ee-ce[1],He=x(ke);ue&&ke!==He&&(V+=He-ke),h(He)}(ee||Q)&&Zi()},e.onEnable=function(){ql(c,n?!1:"x"),it.addEventListener("refresh",z),nn(rt,"resize",z),h.smooth&&(h.target.style.scrollBehavior="auto",h.smooth=_.smooth=!1),w.enable()},e.onDisable=function(){ql(c,!0),tn(rt,"resize",z),it.removeEventListener("refresh",z),w.kill()},e.lockAxis=e.lockAxis!==!1,o=new zt(e),o.iOS=pr,pr&&!h()&&h(1),pr&&Ce.ticker.add(Ti),H=o._dc,I=Ce.to(o,{ease:"power4",paused:!0,inherit:!1,scrollX:n?"+=0.1":"+=0",scrollY:"+=0.1",modifiers:{scrollY:Zp(h,h(),function(){return I.pause()})},onUpdate:Zi,onComplete:H.vars.onComplete}),o};it.sort=function(r){if(xn(r))return nt.sort(r);var e=rt.pageYOffset||0;return it.getAll().forEach(function(t){return t._sortY=t.trigger?e+t.trigger.getBoundingClientRect().top:t.start+rt.innerHeight}),nt.sort(r||function(t,n){return(t.vars.refreshPriority||0)*-1e6+(t.vars.containerAnimation?1e6:t._sortY)-((n.vars.containerAnimation?1e6:n._sortY)+(n.vars.refreshPriority||0)*-1e6)})};it.observe=function(r){return new zt(r)};it.normalizeScroll=function(r){if(typeof r>"u")return En;if(r===!0&&En)return En.enable();if(r===!1){En&&En.kill(),En=r;return}var e=r instanceof zt?r:Vg(r);return En&&En.target===e.target&&En.kill(),is(e.target)&&(En=e),e};it.core={_getVelocityProp:jc,_inputObserver:Jp,_scrollers:st,_proxies:Li,bridge:{ss:function(){ui||ss("scrollStart"),ui=_n()},ref:function(){return mn}}};zp()&&Ce.registerPlugin(it);var vh="1.3.18";function Qp(r,e,t){return Math.max(r,Math.min(e,t))}function Hg(r,e,t){return(1-t)*r+t*e}function Gg(r,e,t,n){return Hg(r,e,1-Math.exp(-t*n))}function Wg(r,e){return(r%e+e)%e}var Xg=class{isRunning=!1;value=0;from=0;to=0;currentTime=0;lerp;duration;easing;onUpdate;advance(r){if(!this.isRunning)return;let e=!1;if(this.duration&&this.easing){this.currentTime+=r;const t=Qp(0,this.currentTime/this.duration,1);e=t>=1;const n=e?1:this.easing(t);this.value=this.from+(this.to-this.from)*n}else this.lerp?(this.value=Gg(this.value,this.to,this.lerp*60,r),Math.round(this.value)===this.to&&(this.value=this.to,e=!0)):(this.value=this.to,e=!0);e&&this.stop(),this.onUpdate?.(this.value,e)}stop(){this.isRunning=!1}fromTo(r,e,{lerp:t,duration:n,easing:i,onStart:s,onUpdate:a}){this.from=this.value=r,this.to=e,this.lerp=t,this.duration=n,this.easing=i,this.currentTime=0,this.isRunning=!0,s?.(),this.onUpdate=a}};function jg(r,e){let t;return function(...n){clearTimeout(t),t=setTimeout(()=>{t=void 0,r.apply(this,n)},e)}}var Yg=class{constructor(r,e,{autoResize:t=!0,debounce:n=250}={}){this.wrapper=r,this.content=e,t&&(this.debouncedResize=jg(this.resize,n),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}width=0;height=0;scrollHeight=0;scrollWidth=0;debouncedResize;wrapperResizeObserver;contentResizeObserver;destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},em=class{events={};emit(r,...e){const t=this.events[r]||[];for(let n=0,i=t.length;n<i;n++)t[n]?.(...e)}on(r,e){return this.events[r]?this.events[r].push(e):this.events[r]=[e],()=>{this.events[r]=this.events[r]?.filter(t=>e!==t)}}off(r,e){this.events[r]=this.events[r]?.filter(t=>e!==t)}destroy(){this.events={}}},qg=100/6,or={passive:!1};function Sh(r,e){return r===1?qg:r===2?e:1}var $g=class{constructor(r,e={wheelMultiplier:1,touchMultiplier:1}){this.element=r,this.options=e,window.addEventListener("resize",this.onWindowResize),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,or),this.element.addEventListener("touchstart",this.onTouchStart,or),this.element.addEventListener("touchmove",this.onTouchMove,or),this.element.addEventListener("touchend",this.onTouchEnd,or)}touchStart={x:0,y:0};lastDelta={x:0,y:0};window={width:0,height:0};emitter=new em;on(r,e){return this.emitter.on(r,e)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize),this.element.removeEventListener("wheel",this.onWheel,or),this.element.removeEventListener("touchstart",this.onTouchStart,or),this.element.removeEventListener("touchmove",this.onTouchMove,or),this.element.removeEventListener("touchend",this.onTouchEnd,or)}onTouchStart=r=>{const{clientX:e,clientY:t}=r.targetTouches?r.targetTouches[0]:r;this.touchStart.x=e,this.touchStart.y=t,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:r})};onTouchMove=r=>{const{clientX:e,clientY:t}=r.targetTouches?r.targetTouches[0]:r,n=-(e-this.touchStart.x)*this.options.touchMultiplier,i=-(t-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=e,this.touchStart.y=t,this.lastDelta={x:n,y:i},this.emitter.emit("scroll",{deltaX:n,deltaY:i,event:r})};onTouchEnd=r=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:r})};onWheel=r=>{let{deltaX:e,deltaY:t,deltaMode:n}=r;const i=Sh(n,this.window.width),s=Sh(n,this.window.height);e*=i,t*=s,e*=this.options.wheelMultiplier,t*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:e,deltaY:t,event:r})};onWindowResize=()=>{this.window={width:window.innerWidth,height:window.innerHeight}}},Mh=r=>Math.min(1,1.001-2**(-10*r)),Kg=class{_isScrolling=!1;_isStopped=!1;_isLocked=!1;_preventNextNativeScrollEvent=!1;_resetVelocityTimeout=null;_rafId=null;isTouching;time=0;userData={};lastVelocity=0;velocity=0;direction=0;options;targetScroll;animatedScroll;animate=new Xg;emitter=new em;dimensions;virtualScroll;constructor({wrapper:r=window,content:e=document.documentElement,eventsTarget:t=r,smoothWheel:n=!0,syncTouch:i=!1,syncTouchLerp:s=.075,touchInertiaExponent:a=1.7,duration:o,easing:l,lerp:c=.1,infinite:u=!1,orientation:d="vertical",gestureOrientation:f=d==="horizontal"?"both":"vertical",touchMultiplier:h=1,wheelMultiplier:_=1,autoResize:g=!0,prevent:p,virtualScroll:m,overscroll:v=!0,autoRaf:b=!1,anchors:S=!1,autoToggle:w=!1,allowNestedScroll:E=!1,__experimental__naiveDimensions:A=!1,naiveDimensions:x=A,stopInertiaOnNavigate:y=!1}={}){window.lenisVersion=vh,window.lenis||(window.lenis={}),window.lenis.version=vh,d==="horizontal"&&(window.lenis.horizontal=!0),(!r||r===document.documentElement)&&(r=window),typeof o=="number"&&typeof l!="function"?l=Mh:typeof l=="function"&&typeof o!="number"&&(o=1),this.options={wrapper:r,content:e,eventsTarget:t,smoothWheel:n,syncTouch:i,syncTouchLerp:s,touchInertiaExponent:a,duration:o,easing:l,lerp:c,infinite:u,gestureOrientation:f,orientation:d,touchMultiplier:h,wheelMultiplier:_,autoResize:g,prevent:p,virtualScroll:m,overscroll:v,autoRaf:b,anchors:S,autoToggle:w,allowNestedScroll:E,naiveDimensions:x,stopInertiaOnNavigate:y},this.dimensions=new Yg(r,e,{autoResize:g}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown),this.virtualScroll=new $g(t,{touchMultiplier:h,wheelMultiplier:_}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(r,e){return this.emitter.on(r,e)}off(r,e){return this.emitter.off(r,e)}onScrollEnd=r=>{r instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&r.stopPropagation()};dispatchScrollendEvent=()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))};get overflow(){const r=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[r]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}onTransitionEnd=r=>{r.propertyName.includes("overflow")&&this.checkOverflow()};setScroll(r){this.isHorizontal?this.options.wrapper.scrollTo({left:r,behavior:"instant"}):this.options.wrapper.scrollTo({top:r,behavior:"instant"})}onClick=r=>{const t=r.composedPath().filter(n=>n instanceof HTMLAnchorElement&&n.getAttribute("href"));if(this.options.anchors){const n=t.find(i=>i.getAttribute("href")?.includes("#"));if(n){const i=n.getAttribute("href");if(i){const s=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,a=`#${i.split("#")[1]}`;this.scrollTo(a,s)}}}this.options.stopInertiaOnNavigate&&t.find(i=>i.host===window.location.host)&&this.reset()};onPointerDown=r=>{r.button===1&&this.reset()};onVirtualScroll=r=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(r)===!1)return;const{deltaX:e,deltaY:t,event:n}=r;if(this.emitter.emit("virtual-scroll",{deltaX:e,deltaY:t,event:n}),n.ctrlKey||n.lenisStopPropagation)return;const i=n.type.includes("touch"),s=n.type.includes("wheel");this.isTouching=n.type==="touchstart"||n.type==="touchmove";const a=e===0&&t===0;if(this.options.syncTouch&&i&&n.type==="touchstart"&&a&&!this.isStopped&&!this.isLocked){this.reset();return}const l=this.options.gestureOrientation==="vertical"&&t===0||this.options.gestureOrientation==="horizontal"&&e===0;if(a||l)return;let c=n.composedPath();c=c.slice(0,c.indexOf(this.rootElement));const u=this.options.prevent,d=Math.abs(e)>=Math.abs(t)?"horizontal":"vertical";if(c.find(m=>m instanceof HTMLElement&&(typeof u=="function"&&u?.(m)||m.hasAttribute?.("data-lenis-prevent")||d==="vertical"&&m.hasAttribute?.("data-lenis-prevent-vertical")||d==="horizontal"&&m.hasAttribute?.("data-lenis-prevent-horizontal")||i&&m.hasAttribute?.("data-lenis-prevent-touch")||s&&m.hasAttribute?.("data-lenis-prevent-wheel")||this.options.allowNestedScroll&&this.hasNestedScroll(m,{deltaX:e,deltaY:t}))))return;if(this.isStopped||this.isLocked){n.cancelable&&n.preventDefault();return}if(!(this.options.syncTouch&&i||this.options.smoothWheel&&s)){this.isScrolling="native",this.animate.stop(),n.lenisStopPropagation=!0;return}let h=t;this.options.gestureOrientation==="both"?h=Math.abs(t)>Math.abs(e)?t:e:this.options.gestureOrientation==="horizontal"&&(h=e),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&t>0||this.animatedScroll===this.limit&&t<0))&&(n.lenisStopPropagation=!0),n.cancelable&&n.preventDefault();const _=i&&this.options.syncTouch,p=i&&n.type==="touchend";p&&(h=Math.sign(this.velocity)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+h,{programmatic:!1,..._?{lerp:p?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})};resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}onNativeScroll=()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){const r=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-r,this.direction=Math.sign(this.animatedScroll-r),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}};reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}raf=r=>{const e=r-(this.time||r);this.time=r,this.animate.advance(e*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))};scrollTo(r,{offset:e=0,immediate:t=!1,lock:n=!1,programmatic:i=!0,lerp:s=i?this.options.lerp:void 0,duration:a=i?this.options.duration:void 0,easing:o=i?this.options.easing:void 0,onStart:l,onComplete:c,force:u=!1,userData:d}={}){if((this.isStopped||this.isLocked)&&!u)return;let f=r,h=e;if(typeof f=="string"&&["top","left","start","#"].includes(f))f=0;else if(typeof f=="string"&&["bottom","right","end"].includes(f))f=this.limit;else{let _=null;if(typeof f=="string"?(_=document.querySelector(f),_||(f==="#top"?f=0:console.warn("Lenis: Target not found",f))):f instanceof HTMLElement&&f?.nodeType&&(_=f),_){if(this.options.wrapper!==window){const p=this.rootElement.getBoundingClientRect();h-=this.isHorizontal?p.left:p.top}const g=_.getBoundingClientRect();f=(this.isHorizontal?g.left:g.top)+this.animatedScroll}}if(typeof f=="number"){if(f+=h,f=Math.round(f),this.options.infinite){if(i){this.targetScroll=this.animatedScroll=this.scroll;const _=f-this.animatedScroll;_>this.limit/2?f-=this.limit:_<-this.limit/2&&(f+=this.limit)}}else f=Qp(0,f,this.limit);if(f===this.targetScroll){l?.(this),c?.(this);return}if(this.userData=d??{},t){this.animatedScroll=this.targetScroll=f,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),c?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}i||(this.targetScroll=f),typeof a=="number"&&typeof o!="function"?o=Mh:typeof o=="function"&&typeof a!="number"&&(a=1),this.animate.fromTo(this.animatedScroll,f,{duration:a,easing:o,lerp:s,onStart:()=>{n&&(this.isLocked=!0),this.isScrolling="smooth",l?.(this)},onUpdate:(_,g)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=_-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=_,this.setScroll(this.scroll),i&&(this.targetScroll=_),g||this.emit(),g&&(this.reset(),this.emit(),c?.(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(r,{deltaX:e,deltaY:t}){const n=Date.now();r._lenis||(r._lenis={});const i=r._lenis;let s,a,o,l,c,u,d,f,h,_;if(n-(i.time??0)>2e3){i.time=Date.now();const A=window.getComputedStyle(r);if(i.computedStyle=A,s=["auto","overlay","scroll"].includes(A.overflowX),a=["auto","overlay","scroll"].includes(A.overflowY),c=["auto"].includes(A.overscrollBehaviorX),u=["auto"].includes(A.overscrollBehaviorY),i.hasOverflowX=s,i.hasOverflowY=a,!(s||a))return!1;d=r.scrollWidth,f=r.scrollHeight,h=r.clientWidth,_=r.clientHeight,o=d>h,l=f>_,i.isScrollableX=o,i.isScrollableY=l,i.scrollWidth=d,i.scrollHeight=f,i.clientWidth=h,i.clientHeight=_,i.hasOverscrollBehaviorX=c,i.hasOverscrollBehaviorY=u}else o=i.isScrollableX,l=i.isScrollableY,s=i.hasOverflowX,a=i.hasOverflowY,d=i.scrollWidth,f=i.scrollHeight,h=i.clientWidth,_=i.clientHeight,c=i.hasOverscrollBehaviorX,u=i.hasOverscrollBehaviorY;if(!(s&&o||a&&l))return!1;const g=Math.abs(e)>=Math.abs(t)?"horizontal":"vertical";let p,m,v,b,S,w;if(g==="horizontal")p=Math.round(r.scrollLeft),m=d-h,v=e,b=s,S=o,w=c;else if(g==="vertical")p=Math.round(r.scrollTop),m=f-_,v=t,b=a,S=l,w=u;else return!1;return!w&&(p>=m||p<=0)?!0:(v>0?p<m:p>0)&&b&&S}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){const r=this.options.wrapper;return this.isHorizontal?r.scrollX??r.scrollLeft:r.scrollY??r.scrollTop}get scroll(){return this.options.infinite?Wg(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(r){this._isScrolling!==r&&(this._isScrolling=r,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(r){this._isStopped!==r&&(this._isStopped=r,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(r){this._isLocked!==r&&(this._isLocked=r,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get className(){let r="lenis";return this.options.autoToggle&&(r+=" lenis-autoToggle"),this.isStopped&&(r+=" lenis-stopped"),this.isLocked&&(r+=" lenis-locked"),this.isScrolling&&(r+=" lenis-scrolling"),this.isScrolling==="smooth"&&(r+=" lenis-smooth"),r}updateClassName(){this.cleanUpClassName(),this.rootElement.className=`${this.rootElement.className} ${this.className}`.trim()}cleanUpClassName(){this.rootElement.className=this.rootElement.className.replace(/lenis(-\w+)?/g,"").trim()}};ni.registerPlugin(it);function Zg(){Rt.useEffect(()=>{const r=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=window.matchMedia("(hover: none)").matches,t=[];function n(u,d,f){u.addEventListener(d,f),t.push(()=>u.removeEventListener(d,f))}let i=null,s=null;r||(i=new Kg({duration:1.2,easing:u=>Math.min(1,1.001-Math.pow(2,-10*u)),smooth:!0,smoothTouch:!1}),i.on("scroll",it.update),s=u=>{i&&i.raf(u*1e3)},ni.ticker.add(s),ni.ticker.lagSmoothing(0));function a(){if(r){ni.set("#sectionHero .hero-brand-char, #sectionHero .hero-subtitle, #sectionHero .hero-ctas > *",{opacity:1,y:0,scale:1,filter:"blur(0px)"});return}const u=document.getElementById("heroContent");if(!u)return;const d=ni.timeline({delay:.2});d.from("#landingNav",{opacity:0,y:-20,duration:.6,ease:"power2.out"},0);const f=u.querySelectorAll(".hero-brand-char"),h="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";f.length&&f.forEach((p,m)=>{const v=p.textContent;p.textContent=h[Math.floor(Math.random()*h.length)],d.fromTo(p,{opacity:0,y:40},{opacity:1,y:0,duration:.5,ease:"back.out(1.7)",onStart:()=>{let b=0;const S=setInterval(()=>{p.textContent=h[Math.floor(Math.random()*h.length)],b++,b>5&&(clearInterval(S),p.textContent=v)},50)}},.4+m*.08)});const _=u.querySelector(".hero-subtitle");_&&d.from(_,{opacity:0,y:20,duration:.8,ease:"power2.out"},1);const g=u.querySelectorAll(".hero-ctas > *");g.length&&d.from(g,{opacity:0,y:40,duration:.6,stagger:.1,ease:"power2.out"},1.3)}function o(){r||e||ni.to("#heroContent",{y:-100,opacity:0,scrollTrigger:{trigger:"#sectionHero",start:"60% top",end:"bottom top",scrub:!0}})}function l(){window.matchMedia("(hover: none)").matches||r||document.querySelectorAll(".magnetic-btn").forEach(u=>{const d=ni.quickTo(u,"x",{duration:.5,ease:"power3.out"}),f=ni.quickTo(u,"y",{duration:.5,ease:"power3.out"});function h(g){const p=u.getBoundingClientRect(),m=p.left+p.width/2,v=p.top+p.height/2,b=g.clientX-m,S=g.clientY-v,w=Math.sqrt(b*b+S*S),E=150;if(w<E){const A=(1-w/E)*15,x=Math.atan2(S,b);d(Math.cos(x)*A),f(Math.sin(x)*A)}}function _(){d(0),f(0)}n(u,"mousemove",h),n(u,"mouseleave",_)})}const c=setTimeout(()=>{a(),o(),l()},50);return()=>{clearTimeout(c),t.forEach(u=>u()),s&&ni.ticker.remove(s),i&&i.destroy(),it.getAll().forEach(u=>u.kill())}},[])}function Jg({isLoggedIn:r}){const e=$a(),t=Yu(a=>a.logout),n=Gm(a=>a.resetSelection);function i(a){a.preventDefault(),document.getElementById("pricingSection")?.scrollIntoView({behavior:"smooth"})}async function s(){await Hm.auth.signOut(),t(),n(),sessionStorage.removeItem("simulationParams"),e("/")}return R.jsxs("nav",{className:"landing-nav-new",id:"landingNav","data-testid":"landing-nav",children:[R.jsx(Ad,{to:"/",className:"nav-logo",children:R.jsx("img",{src:"/images/logo/logo-md.png",alt:"ReViva",className:"logo-img logo-img--nav"})}),r?R.jsxs("div",{className:"nav-links",children:[R.jsx("a",{href:"#pricingSection",className:"nav-link",onClick:i,children:"Pricing"}),R.jsx("button",{className:"nav-link","data-testid":"nav-explore",onClick:()=>e("/scenarios",{state:{fresh:!0}}),children:"Explore"}),R.jsx("button",{className:"nav-link",onClick:()=>e("/profile"),children:"Profile"}),R.jsx("button",{className:"nav-link",onClick:s,children:"Log Out"})]}):R.jsxs("div",{className:"nav-links",children:[R.jsx("a",{href:"#pricingSection",className:"nav-link",onClick:i,children:"Pricing"}),R.jsx("button",{className:"nav-link","data-testid":"nav-explore",onClick:()=>e("/scenarios",{state:{fresh:!0}}),children:"Explore"}),R.jsx("button",{className:"nav-link","data-testid":"nav-login",onClick:()=>e("/login"),children:"Log In"}),R.jsx("button",{className:"nav-link btn-amber btn-amber--sm","data-testid":"nav-signup",onClick:()=>e("/login"),children:"Sign Up"})]})]})}function Qg(){const r=$a(),e=Yu(Cd);return R.jsx("section",{className:"section-hero section--light",id:"sectionHero","data-testid":"hero-section",children:R.jsxs("div",{className:"hero-content",id:"heroContent",children:[R.jsxs("div",{className:"hero-annotations hero-annotations--top-right","aria-hidden":"true",children:[R.jsx("span",{children:"( est. 2026 )"}),R.jsx("span",{children:"( 166 stations · UK )"})]}),R.jsx("img",{src:"/images/landing/hero-doctor.png",alt:"","aria-hidden":"true",loading:"eager",fetchPriority:"high",className:"hero-photo",onError:t=>{t.currentTarget.style.display="none"}}),R.jsx("h1",{className:"hero-brand","aria-label":"Reviva",children:"REVIVA".split("").map((t,n)=>R.jsx("span",{className:"hero-brand-char",children:t},n))}),R.jsxs("div",{className:"hero-stack",children:[R.jsx("p",{className:"landing-body hero-subtitle",children:"AI interview practice for surgical trainees."}),R.jsx("div",{className:"hero-ctas",children:R.jsxs("button",{className:"btn-amber btn-amber--lg magnetic-btn",onClick:()=>r("/scenarios",{state:{fresh:!0}}),children:[e?"Go to Dashboard":"Try a free station"," →"]})})]}),R.jsx("div",{className:"hero-annotations hero-annotations--bottom-left","aria-hidden":"true",children:R.jsx("span",{children:"( hand-crafted · ai-powered )"})})]})})}function tm(r,e){let t;const n=()=>{const{currentTime:i}=e,a=(i===null?0:i.value)/100;t!==a&&r(a),t=a};return pa.preUpdate(n,!0),()=>Rc(n)}const e0=50,yh=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0}),t0=()=>({time:0,x:yh(),y:yh()}),n0={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}};function bh(r,e,t,n){const i=t[e],{length:s,position:a}=n0[e],o=i.current,l=t.time;i.current=r[`scroll${a}`],i.scrollLength=r[`scroll${s}`]-r[`client${s}`],i.offset.length=0,i.offset[0]=0,i.offset[1]=i.scrollLength,i.progress=Wm(0,i.scrollLength,i.current);const c=n-l;i.velocity=c>e0?0:Xm(i.current-o,c)}function i0(r,e,t){bh(r,"x",e,t),bh(r,"y",e,t),e.time=t}function r0(r,e){const t={x:0,y:0};let n=r;for(;n&&n!==e;)if(jm(n))t.x+=n.offsetLeft,t.y+=n.offsetTop,n=n.offsetParent;else if(n.tagName==="svg"){const i=n.getBoundingClientRect();n=n.parentElement;const s=n.getBoundingClientRect();t.x+=i.left-s.left,t.y+=i.top-s.top}else if(n instanceof SVGGraphicsElement){const{x:i,y:s}=n.getBBox();t.x+=i,t.y+=s;let a=null,o=n.parentNode;for(;!a;)o.tagName==="svg"&&(a=o),o=n.parentNode;n=a}else break;return t}const eu={start:0,center:.5,end:1};function Eh(r,e,t=0){let n=0;if(r in eu&&(r=eu[r]),typeof r=="string"){const i=parseFloat(r);r.endsWith("px")?n=i:r.endsWith("%")?r=i/100:r.endsWith("vw")?n=i/100*document.documentElement.clientWidth:r.endsWith("vh")?n=i/100*document.documentElement.clientHeight:r=i}return typeof r=="number"&&(n=e*r),t+n}const s0=[0,0];function a0(r,e,t,n){let i=Array.isArray(r)?r:s0,s=0,a=0;return typeof r=="number"?i=[r,r]:typeof r=="string"&&(r=r.trim(),r.includes(" ")?i=r.split(" "):i=[r,eu[r]?r:"0"]),s=Eh(i[0],t,n),a=Eh(i[1],e),s-a}const o0={All:[[0,0],[1,1]]},l0={x:0,y:0};function c0(r){return"getBBox"in r&&r.tagName!=="svg"?r.getBBox():{width:r.clientWidth,height:r.clientHeight}}function u0(r,e,t){const{offset:n=o0.All}=t,{target:i=r,axis:s="y"}=t,a=s==="y"?"height":"width",o=i!==r?r0(i,r):l0,l=i===r?{width:r.scrollWidth,height:r.scrollHeight}:c0(i),c={width:r.clientWidth,height:r.clientHeight};e[s].offset.length=0;let u=!e[s].interpolate;const d=n.length;for(let f=0;f<d;f++){const h=a0(n[f],c[a],l[a],o[s]);!u&&h!==e[s].interpolatorOffsets[f]&&(u=!0),e[s].offset[f]=h}u&&(e[s].interpolate=Ym(e[s].offset,qm(n),{clamp:!1}),e[s].interpolatorOffsets=[...e[s].offset]),e[s].progress=$m(0,1,e[s].interpolate(e[s].current))}function f0(r,e=r,t){if(t.x.targetOffset=0,t.y.targetOffset=0,e!==r){let n=e;for(;n&&n!==r;)t.x.targetOffset+=n.offsetLeft,t.y.targetOffset+=n.offsetTop,n=n.offsetParent}t.x.targetLength=e===r?e.scrollWidth:e.clientWidth,t.y.targetLength=e===r?e.scrollHeight:e.clientHeight,t.x.containerLength=r.clientWidth,t.y.containerLength=r.clientHeight}function h0(r,e,t,n={}){return{measure:i=>{f0(r,n.target,t),i0(r,t,i),(n.offset||n.target)&&u0(r,t,n)},notify:()=>e(t)}}const ps=new WeakMap,Th=new WeakMap,$l=new WeakMap,wh=new WeakMap,mo=new WeakMap,Ah=r=>r===document.scrollingElement?window:r;function nm(r,{container:e=document.scrollingElement,trackContentSize:t=!1,...n}={}){if(!e)return Rd;let i=$l.get(e);i||(i=new Set,$l.set(e,i));const s=t0(),a=h0(e,r,s,n);if(i.add(a),!ps.has(e)){const l=()=>{for(const f of i)f.measure(Zm.timestamp);pa.preUpdate(c)},c=()=>{for(const f of i)f.notify()},u=()=>pa.read(l);ps.set(e,u);const d=Ah(e);window.addEventListener("resize",u),e!==document.documentElement&&Th.set(e,Km(e,u)),d.addEventListener("scroll",u),u()}if(t&&!mo.has(e)){const l=ps.get(e),c={width:e.scrollWidth,height:e.scrollHeight};wh.set(e,c);const u=()=>{const f=e.scrollWidth,h=e.scrollHeight;(c.width!==f||c.height!==h)&&(l(),c.width=f,c.height=h)},d=pa.read(u,!0);mo.set(e,d)}const o=ps.get(e);return pa.read(o,!1,!0),()=>{Rc(o);const l=$l.get(e);if(!l||(l.delete(a),l.size))return;const c=ps.get(e);ps.delete(e),c&&(Ah(e).removeEventListener("scroll",c),Th.get(e)?.(),window.removeEventListener("resize",c));const u=mo.get(e);u&&(Rc(u),mo.delete(e)),wh.delete(e)}}function im(r){return typeof window<"u"&&!r&&Jm()}const Ch=new Map;function d0(r){const e={value:0},t=nm(n=>{e.value=n[r.axis].progress*100},r);return{currentTime:e,cancel:t}}function rm({source:r,container:e,...t}){const{axis:n}=t;r&&(e=r);const i=Ch.get(e)??new Map;Ch.set(e,i);const s=t.target??"self",a=i.get(s)??{},o=n+(t.offset??[]).join(",");return a[o]||(a[o]=im(t.target)?new ScrollTimeline({source:e,axis:n}):d0({container:e,...t})),a[o]}function p0(r,e){const t=rm(e);return r.attachTimeline({timeline:e.target?void 0:t,observe:n=>(n.pause(),tm(i=>{n.time=n.iterationDuration*i},t))})}function m0(r){return r.length===2}function _0(r,e){return m0(r)?nm(t=>{r(t[e.axis].progress,t)},e):tm(r,rm(e))}function sm(r,{axis:e="y",container:t=document.scrollingElement,...n}={}){if(!t)return Rd;const i={axis:e,container:t,...n};return typeof r=="function"?_0(r,i):p0(r,i)}const g0=()=>({scrollX:eo(0),scrollY:eo(0),scrollXProgress:eo(0),scrollYProgress:eo(0)}),_o=r=>r?!r.current:!1;function Rh(r,e,t){return{factory:n=>sm(n,{...e,axis:r,container:t}),times:[0,1],keyframes:[0,1],ease:n=>n,duration:1}}function am({container:r,target:e,...t}={}){const n=Qm(g0);if(!e&&im()){const o=r?.current||void 0;n.scrollXProgress.accelerate=Rh("x",t,o),n.scrollYProgress.accelerate=Rh("y",t,o)}const i=Rt.useRef(null),s=Rt.useRef(!1),a=Rt.useCallback(()=>(i.current=sm((o,{x:l,y:c})=>{n.scrollX.set(l.current),n.scrollXProgress.set(l.progress),n.scrollY.set(c.current),n.scrollYProgress.set(c.progress)},{...t,container:r?.current||void 0,target:e?.current||void 0}),()=>{i.current?.()}),[r,e,JSON.stringify(t.offset)]);return e_(()=>{if(s.current=!1,_o(r)||_o(e)){s.current=!0;return}else return a()},[a]),Rt.useEffect(()=>{if(s.current)return Ff(!_o(r)),Ff(!_o(e)),a()},[a]),n}const x0=bl.div;function om({bg:r,blendDifference:e=!1,className:t,children:n,id:i,...s}){const a=Rt.useRef(null),o=qu(),{scrollYProgress:l}=am({target:a,offset:["start end","end start"]}),c=t_(l,[0,1],o?["0%","0%"]:["0%","15%"]);return R.jsxs("section",{ref:a,id:i,className:rn("narrative-scene relative overflow-hidden",t),...s,children:[r?R.jsx(x0,{"aria-hidden":"true",className:"pointer-events-none absolute inset-x-0 -top-[10%] h-[120%]",style:{y:c},children:r}):null,R.jsx("div",{className:rn("narrative-scene__content relative z-10",e&&"mix-blend-difference text-white"),children:n})]})}const v0=bl.div,S0=[{id:"consultants",numeral:"01",overline:"Reality 01",title:"Consultants are too busy.",body:"They have lists, on-calls, families. Begging an hour from them works once. Maybe twice.",desktopClass:"md:absolute md:top-[8%] md:left-[6%] md:max-w-[300px]"},{id:"friends",numeral:"02",overline:"Reality 02",title:"Friends get tired.",body:"They run out of questions. They start nodding through every answer. They’re not the examiner.",desktopClass:"md:absolute md:top-[28%] md:right-[6%] md:max-w-[320px]"},{id:"books",numeral:"03",overline:"Reality 03",title:"Books can’t push back.",body:"Reading the answer is not defending it under pressure. The interview is a conversation, not a recall test.",desktopClass:"md:absolute md:top-[52%] md:left-[18%] md:max-w-[340px]"}];function M0(){const r=qu();return R.jsxs(om,{id:"section-a",className:"section-a relative bg-organic-canopy text-organic-cream",children:[R.jsx("span",{className:"section-a__annotation",children:"( the daily reality )"}),R.jsxs("div",{className:"section-a__inner relative w-full max-w-[1500px] mx-auto px-6 sm:px-10 py-24 md:py-32 md:min-h-[150vh] flex flex-col gap-16 md:block",children:[R.jsx("img",{src:"/images/landing/a-isolation.png",alt:"","aria-hidden":"true",loading:"lazy",className:"section-a__photo",onError:e=>{e.currentTarget.style.display="none"}}),S0.map((e,t)=>R.jsxs(v0,{className:rn("section-a__accent relative z-10",e.desktopClass),initial:r?!1:{opacity:0,scale:0},whileInView:r?void 0:{opacity:1,scale:1},viewport:{once:!0,margin:"-15% 0px"},transition:{duration:.7,ease:[.22,1,.36,1],delay:t*.1},children:[R.jsx("span",{className:"section-a__accent-numeral","aria-hidden":"true",children:e.numeral}),R.jsx("span",{className:"section-a__accent-overline",children:e.overline}),R.jsx("h3",{className:"font-organic-display text-[1.5rem] md:text-[1.75rem] leading-[1.05] mt-2 mb-3 font-bold",children:e.title}),R.jsx("p",{className:"text-[0.95rem] leading-relaxed text-organic-cream/85",children:e.body})]},e.id)),R.jsxs("h2",{className:"section-a__headline",children:[R.jsx("span",{className:"section-a__headline-line section-a__headline-line--top",children:"Practice partners"}),R.jsx("span",{className:"section-a__headline-line section-a__headline-line--bottom",children:"don’t exist."})]})]})]})}const go=bl.div,xo={opacity:0,y:12},vo={opacity:1,y:0},So={opacity:0,y:-8},Mo={duration:.3,ease:[.22,1,.36,1]};function y0({currentStep:r=0,mode:e="practice"}){return R.jsxs("div",{className:"device-frame relative w-full max-w-[560px] mx-auto rounded-2xl bg-organic-canopy text-organic-cream shadow-[0_24px_60px_rgba(26,58,42,0.25)] overflow-hidden",children:[R.jsxs("div",{className:"device-frame__chrome flex items-center gap-2 px-4 py-3 bg-organic-bark/80 border-b border-organic-stone/10",children:[R.jsxs("div",{className:"flex items-center gap-1.5",children:[R.jsx("span",{className:"block h-[10px] w-[10px] rounded-full bg-[#ff5f57]"}),R.jsx("span",{className:"block h-[10px] w-[10px] rounded-full bg-[#febc2e]"}),R.jsx("span",{className:"block h-[10px] w-[10px] rounded-full bg-[#28c840]"})]}),R.jsx("div",{className:"flex-1 flex items-center justify-center",children:R.jsxs("span",{className:"text-[10px] font-medium uppercase tracking-[0.18em] text-organic-cream/70",children:[e==="mock"?"Mock Exam":"Practice Mode"," · Necrotising Fasciitis"]})})]}),R.jsx("div",{className:"device-frame__screen relative aspect-[4/3] flex items-center justify-center overflow-hidden",children:R.jsxs(n_,{mode:"wait",initial:!1,children:[r===0&&R.jsx(go,{className:"absolute inset-0",initial:xo,animate:vo,exit:So,transition:Mo,children:R.jsx(b0,{mode:e})},"idle"),r===1&&R.jsx(go,{className:"absolute inset-0",initial:xo,animate:vo,exit:So,transition:Mo,children:R.jsx(E0,{mode:e})},"listening"),r===2&&R.jsx(go,{className:"absolute inset-0",initial:xo,animate:vo,exit:So,transition:Mo,children:R.jsx(T0,{mode:e})},"pushback"),r===3&&R.jsx(go,{className:"absolute inset-0",initial:xo,animate:vo,exit:So,transition:Mo,children:R.jsx(w0,{mode:e})},"feedback")]})})]})}function b0({mode:r}){return R.jsxs("div",{className:"flex h-full flex-col items-center justify-center gap-4 px-6",children:[R.jsx(El,{state:"idle",size:84,statusText:r==="mock"?"Mock starting":"Ready"}),R.jsx("p",{className:"text-[12px] text-organic-cream/60 text-center max-w-[260px] leading-relaxed",children:r==="mock"?"Timer about to start. Two minutes per phase.":"Take your time. Speak when ready."})]})}function E0({mode:r}){return R.jsxs("div",{className:"flex h-full flex-col items-center justify-center gap-4 px-6",children:[R.jsx(El,{state:"listening",size:84,statusText:"Listening"}),R.jsx("div",{className:"w-full max-w-[300px] rounded-lg bg-organic-cream/5 border border-organic-cream/10 px-3 py-2.5",children:R.jsxs("p",{className:"text-[11px] text-organic-cream/85 leading-relaxed",children:[R.jsx("span",{className:"opacity-60",children:"Sounds like"})," “necrotising fasciitis… severe pain disproportionate to ",R.jsx(A0,{}),"”"]})}),r==="mock"&&R.jsx("span",{className:"text-[10px] uppercase tracking-[0.25em] text-organic-amber/80",children:"01:42 remaining"})]})}function T0({mode:r}){return R.jsxs("div",{className:"flex h-full flex-col items-center justify-center gap-4 px-6",children:[R.jsx(El,{state:"thinking",size:68,statusText:"Examiner"}),R.jsx("div",{className:"w-full max-w-[300px] rounded-lg bg-organic-amber/15 border border-organic-amber/30 px-3 py-2.5",children:R.jsx("p",{className:"text-[11px] text-organic-cream leading-relaxed font-medium",children:r==="mock"?"“Your LRINEC is 4. Walk me through your decision regardless.”":"“What would change your management if the LRINEC was lower?”"})})]})}function w0(){const r=[{label:"Clinical knowledge",score:4.2,width:"84%"},{label:"Communication",score:3.8,width:"76%"},{label:"Decision-making",score:4.5,width:"90%"},{label:"Professionalism",score:4,width:"80%"}];return R.jsxs("div",{className:"flex h-full flex-col justify-center gap-3 px-6",children:[R.jsxs("div",{className:"flex items-baseline justify-between",children:[R.jsx("span",{className:"text-[10px] uppercase tracking-[0.22em] text-organic-cream/65",children:"Feedback"}),R.jsx("span",{className:"text-[11px] text-organic-amber font-medium",children:"4.1 / 5"})]}),R.jsx("div",{className:"space-y-2",children:r.map(e=>R.jsxs("div",{className:"space-y-1",children:[R.jsxs("div",{className:"flex justify-between text-[10px] text-organic-cream/85",children:[R.jsx("span",{children:e.label}),R.jsx("span",{className:"opacity-60",children:e.score.toFixed(1)})]}),R.jsx("div",{className:"h-[3px] w-full rounded-full bg-organic-cream/10 overflow-hidden",children:R.jsx("div",{className:rn("h-full rounded-full bg-organic-amber"),style:{width:e.width}})})]},e.label))})]})}function A0(){return R.jsx("span",{className:"inline-block w-[6px] h-[0.9em] -mb-[0.1em] bg-organic-amber animate-pulse","aria-hidden":"true"})}function C0({targetRef:r,itemCount:e}){const[t,n]=Rt.useState(0),{scrollYProgress:i}=am({target:r,offset:["start start","end end"]});return Rt.useEffect(()=>{const s=a=>{const o=Math.max(0,Math.min(.9999,a)),l=Math.floor(o*e);n(c=>c===l?c:l)};return s(i.get()),i.on("change",s)},[e,i]),{currentStep:t}}const R0={practice:[{label:"Step 01",title:"Walk in. Speak naturally.",body:"No timer, no pressure. The examiner waits. Start when you’re ready, take the case at your own pace."},{label:"Step 02",title:"It listens like a real examiner.",body:"Real-time speech-to-text. Real-time understanding. Pauses when you pause. Picks up where you left off."},{label:"Step 03",title:"It pushes back when needed.",body:"Vague answers get probed. Wrong calls get challenged. Right calls get a follow-up that goes one level deeper."},{label:"Step 04",title:"Structured feedback, instantly.",body:"Clinical knowledge, communication, decision-making, professionalism. Section-by-section scores, with what to fix."}],mock:[{label:"Step 01",title:"Timed entry. The clock starts.",body:"Real interview pacing. Two minutes per phase. The examiner keeps you on the clock — like the real day."},{label:"Step 02",title:"Listens, but doesn’t wait forever.",body:"Pauses count against you, just like the real exam. The transcript ticks past in real time as you speak."},{label:"Step 03",title:"Probing, harder.",body:"Mock-mode pushback is closer to the upper end of what real examiners ask. Tests depth, not just breadth."},{label:"Step 04",title:"Marked to examiner standard.",body:"Same rubric. Same threshold. The score you’d get on the day, with the structured rationale that comes with it."}]};function P0(){const r=Rt.useRef(null),{currentStep:e}=C0({targetRef:r,itemCount:4}),[t,n]=Rt.useState("practice"),i=R0[t];return R.jsxs("section",{id:"section-b",className:"section-b relative bg-organic-cream text-organic-bark","data-testid":"section-b",children:[R.jsxs("div",{className:"section-b__intro max-w-7xl mx-auto px-6 sm:px-10 pt-24 md:pt-32 pb-6 md:pb-8 text-center",children:[R.jsx("p",{className:"font-display italic text-organic-forest text-[1.1rem] md:text-[1.25rem] mb-3",children:"( the interviewer )"}),R.jsxs("h2",{className:"font-organic-display uppercase leading-[0.92] text-[clamp(2.75rem,9vw,7.5rem)] tracking-[-0.025em] mb-6 font-bold",children:["The AI ",R.jsx("em",{className:"font-display italic font-normal text-organic-amber lowercase tracking-[-0.01em]",children:"Interviewer."})]}),R.jsx("p",{className:"max-w-xl mx-auto text-[1.05rem] leading-relaxed text-organic-bark/75 mb-10",children:"Simulates the real interview. 24/7. Adapts to you."}),R.jsx("div",{className:"inline-flex items-center gap-1 p-1 rounded-full bg-organic-canopy/8 border border-organic-canopy/15",children:["practice","mock"].map(s=>R.jsx("button",{type:"button",onClick:()=>n(s),className:rn("px-5 py-2 rounded-full text-[13px] font-medium tracking-wide uppercase transition-colors",t===s?"bg-organic-canopy text-organic-cream":"text-organic-bark/65 hover:text-organic-bark"),"aria-pressed":t===s,children:s==="practice"?"Practice Mode":"Mock Exam"},s))})]}),R.jsx("div",{ref:r,className:"section-b__walkthrough relative px-6 sm:px-10 pb-24 md:pb-32",children:R.jsxs("div",{className:"max-w-7xl mx-auto md:grid md:grid-cols-2 md:gap-12 lg:gap-20",children:[R.jsx("div",{className:"section-b__frame-side md:sticky md:top-[18vh] md:self-start md:flex md:justify-center",children:R.jsx(y0,{currentStep:e,mode:t})}),R.jsx("div",{className:"section-b__desc-side mt-12 md:mt-0",children:i.map((s,a)=>R.jsxs("div",{className:rn("section-b__desc relative min-h-[55vh] md:min-h-[65vh] flex flex-col justify-center py-8",e===a?"opacity-100":"opacity-45"),style:{transition:"opacity 0.4s ease"},children:[R.jsx("span",{"aria-hidden":"true",className:"pointer-events-none absolute -top-4 -left-4 md:-left-8 select-none font-organic-display font-normal leading-none text-organic-amber/8",style:{fontSize:"clamp(8rem, 14vw, 14rem)"},children:String(a+1).padStart(2,"0")}),R.jsxs("div",{className:"relative z-10",children:[R.jsxs("span",{className:"font-display italic text-organic-amber text-[1rem] tracking-wide block mb-3",children:["( ",s.label.toLowerCase()," )"]}),R.jsx("h3",{className:"font-organic-display text-[clamp(1.85rem,4.2vw,3rem)] leading-[1.05] tracking-[-0.015em] mb-4 font-bold",children:s.title}),R.jsx("p",{className:"text-[1.05rem] leading-relaxed text-organic-bark/75 max-w-[44ch]",children:s.body})]})]},a))})]})})]})}const D0=["Hallucinates clinical scenarios","Generic, not specialty-specific","Trained on whatever is on the internet","Doesn’t push back like a real examiner"],L0=["Hand-crafted by current trainees","Verified against the real interview","Updated every cycle, every year","Pushes back exactly like the real thing"];function N0(){return R.jsxs(om,{id:"section-c",className:"section-c relative bg-organic-canopy text-organic-cream",children:[R.jsx("span",{className:"section-c__annotation",children:"( the difference )"}),R.jsxs("div",{className:"section-c__inner relative max-w-[1500px] mx-auto px-6 sm:px-10 py-16 md:py-24",children:[R.jsx("span",{className:"section-c__watermark","aria-hidden":"true",children:"166"}),R.jsx("img",{src:"/images/landing/c-handcraft.png",alt:"","aria-hidden":"true",loading:"lazy",className:"section-c__photo",onError:r=>{r.currentTarget.style.display="none"}}),R.jsxs("h2",{className:"section-c__title",children:["Not just ",R.jsx("em",{children:"another"}),R.jsx("br",{}),"AI tool."]}),R.jsxs("div",{className:"section-c__spread relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-20 mt-10 md:mt-14",children:[R.jsxs("div",{className:"section-c__col section-c__col--other",children:[R.jsx("h3",{className:"section-c__col-label section-c__col-label--other",children:R.jsx("em",{children:"Other AI tools"})}),R.jsx("ul",{className:"space-y-4 mt-6",children:D0.map(r=>R.jsxs("li",{className:"flex items-start gap-3 text-[1.05rem] leading-snug font-light text-organic-cream/45",children:[R.jsx("span",{"aria-hidden":!0,className:"mt-[0.6em] inline-block h-[1.5px] w-4 flex-shrink-0 bg-organic-cream/30"}),R.jsx("span",{children:r})]},r))})]}),R.jsxs("div",{className:"section-c__col section-c__col--reviva",children:[R.jsx("h3",{className:"section-c__col-label section-c__col-label--reviva",children:R.jsx("em",{children:"Reviva"})}),R.jsx("ul",{className:"space-y-4 mt-6",children:L0.map(r=>R.jsxs("li",{className:"flex items-start gap-3 text-[1.05rem] leading-snug font-medium text-organic-cream",children:[R.jsx("span",{"aria-hidden":!0,className:"mt-[0.6em] inline-block h-[2px] w-5 flex-shrink-0 bg-organic-amber"}),R.jsx("span",{children:r})]},r))})]})]}),R.jsxs("blockquote",{className:"section-c__quote",children:["“Built by trainees who took the same exam",R.jsx("br",{}),R.jsx("em",{children:"— last cycle."}),"”"]}),R.jsxs("div",{className:"section-c__numbers relative z-10 mt-12 md:mt-18 grid grid-cols-2 gap-8 max-w-3xl mx-auto text-center",children:[R.jsxs("div",{children:[R.jsx("div",{className:"section-c__num",children:"166"}),R.jsx("div",{className:"section-c__num-caption",children:R.jsx("em",{children:"( hand-crafted stations )"})})]}),R.jsxs("div",{children:[R.jsx("div",{className:"section-c__num section-c__num--amber",children:"2026"}),R.jsx("div",{className:"section-c__num-caption",children:R.jsx("em",{children:"( verified · current cycle )"})})]})]})]})]})}const I0=bl.div,U0="Hello. Welcome to your ST3 interview. Are you ready to begin?",yo=U0.split(" "),Ph="/audio/landing-examiner-greeting.mp3";function F0(){const r=Rt.useRef(null),e=Rt.useRef(null),t=Rt.useRef(0),n=Rt.useRef([0,0,0,0,0]),i=Rt.useRef([]),s=qu(),[a,o]=Rt.useState(null),[l,c]=Rt.useState(!1),[u,d]=Rt.useState(0);Rt.useEffect(()=>{let w=!1;return fetch(Ph,{method:"HEAD"}).then(E=>{w||o(E.ok)}).catch(()=>{w||o(!1)}),()=>{w=!0}},[]),Rt.useEffect(()=>{const w=r.current;return()=>{i.current.forEach(E=>clearTimeout(E)),i.current=[],t.current&&cancelAnimationFrame(t.current),w&&w.pause()}},[]);function f(){if(e.current)return e.current;const w=r.current;if(!w)return null;let E=null,A=null;const x={ensureAnalyser(){if(!E)try{const y=window.AudioContext||window.webkitAudioContext;if(!y)return;const D=new y,P=D.createMediaElementSource(w);E=D.createAnalyser(),E.fftSize=256,P.connect(E),E.connect(D.destination),A=new Uint8Array(E.frequencyBinCount)}catch{E=null}},getFrequencyBands(y=5){if(E&&A){E.getByteFrequencyData(A);const D=Math.floor(A.length/y),P=[];for(let I=0;I<y;I++){let k=0;for(let V=0;V<D;V++)k+=A[I*D+V];P.push(k/D/255)}return P}return n.current}};return e.current=x,x}function h(){let w=0;const E=()=>{w+=.06,n.current=[.45+.35*Math.sin(w*1.1),.55+.4*Math.sin(w*1.4+.7),.5+.45*Math.sin(w*1+1.2),.4+.35*Math.sin(w*1.6+.4),.5+.4*Math.sin(w*1.2+1.8)].map(A=>Math.max(0,Math.min(1,A))),t.current=requestAnimationFrame(E)};t.current=requestAnimationFrame(E)}function _(){t.current&&cancelAnimationFrame(t.current),t.current=0,n.current=[0,0,0,0,0]}function g(w){if(i.current.forEach(A=>clearTimeout(A)),i.current=[],d(0),s){d(yo.length);return}const E=w/yo.length;for(let A=0;A<yo.length;A++){const x=setTimeout(()=>d(A+1),E*(A+1));i.current.push(x)}}function p(){c(!1),d(0),_(),i.current.forEach(w=>clearTimeout(w)),i.current=[]}async function m(){if(!l){if(c(!0),a&&r.current){const w=f();try{w?.ensureAnalyser()}catch{}const E=r.current;E.currentTime=0;try{await E.play();const A=isFinite(E.duration)&&E.duration>0?E.duration*1e3:3e3;g(A)}catch{h(),g(3e3),setTimeout(()=>p(),3200)}return}h(),g(3e3),setTimeout(()=>p(),3200)}}function v(){p()}const b=l?"speaking":"idle";return R.jsxs("div",{className:"signature-orb relative w-full max-w-3xl mx-auto aspect-[16/10] flex items-center justify-center",children:[R.jsx("div",{className:"absolute inset-0 pointer-events-none opacity-50",children:R.jsx(i_,{hideChip:!0,animateText:!1})}),R.jsxs("div",{className:"relative z-10 flex flex-col items-center gap-6 px-6",children:[R.jsx(El,{state:b,size:140,statusText:"Examiner"}),R.jsx(r_,{audioPlayer:e.current,isAISpeaking:l,className:"signature-orb__visualiser"}),R.jsx("div",{className:"signature-orb__words min-h-[3.5em] max-w-md text-center font-organic-display text-[clamp(1.05rem,2.4vw,1.45rem)] leading-snug text-organic-bark",children:yo.map((w,E)=>R.jsx(I0,{className:"inline-block mr-[0.3em]",initial:{opacity:0,y:6},animate:{opacity:E<u?1:0,y:E<u?0:6},transition:{duration:.25,ease:"easeOut"},children:w},E))}),R.jsxs("button",{type:"button",onClick:m,disabled:l,className:"signature-orb__cta inline-flex items-center gap-2 px-6 py-3 rounded-full bg-organic-canopy text-organic-cream text-[14px] font-medium tracking-wide uppercase transition-transform hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-default",children:[l?"Listening…":"Press to hear the examiner",!l&&R.jsx("span",{"aria-hidden":"true",children:"→"})]}),a===!1&&R.jsx("p",{className:"text-[11px] text-organic-bark/55 text-center max-w-xs leading-snug",children:"(Visual demo — recorded audio not yet generated.)"})]}),R.jsx("audio",{ref:r,src:Ph,preload:"metadata",onEnded:v,onError:()=>o(!1)})]})}function O0(){return R.jsx("section",{id:"section-d",className:"section-d relative bg-organic-cream text-organic-bark","data-testid":"section-d",children:R.jsxs("div",{className:"section-d__inner max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-36 text-center",children:[R.jsx("p",{className:"font-display italic text-organic-forest text-[1.1rem] md:text-[1.25rem] mb-3",children:"( press to begin )"}),R.jsxs("h2",{className:"font-organic-display uppercase leading-[0.92] text-[clamp(2.75rem,9vw,7.5rem)] tracking-[-0.025em] mb-6 font-bold",children:["Hear the ",R.jsx("em",{className:"font-display italic font-normal text-organic-amber lowercase tracking-[-0.01em]",children:"examiner."})]}),R.jsx("p",{className:"max-w-xl mx-auto text-[1.05rem] leading-relaxed text-organic-bark/75 mb-16 md:mb-20",children:"A real interview is a conversation. Press play to start one."}),R.jsx(F0,{}),R.jsx("p",{className:"font-display italic text-organic-bark/55 text-[0.95rem] mt-10",children:"( recorded · British examiner voice )"})]})})}function B0({items:r,renderListItem:e,renderVisual:t,renderMobileCard:n,defaultActiveId:i,className:s}){const a=i??r[0]?.id??null,[o,l]=Rt.useState(a),c=r.find(u=>u.id===o)||r[0];return R.jsxs(R.Fragment,{children:[R.jsxs("div",{className:rn("hover-pair hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-12 lg:gap-20",s),onMouseLeave:()=>l(a),children:[R.jsx("ul",{className:"hover-pair__list flex flex-col gap-3",children:r.map(u=>{const d=o===u.id,f=o!==null&&!d;return R.jsx("li",{onMouseEnter:()=>l(u.id),className:rn("hover-pair__item cursor-pointer transition-opacity duration-300",f?"opacity-50":"opacity-100"),children:e(u,{isActive:d,isDimmed:f})},u.id)})}),R.jsx("div",{className:"hover-pair__visual",children:t(c)})]}),R.jsx("div",{className:rn("hover-pair-mobile md:hidden flex flex-col gap-6",s),children:r.map(u=>R.jsx("div",{className:"hover-pair-mobile__card",children:n(u)},u.id))})]})}const k0=[{id:"practice",numeral:"01",name:"Practice",sublabel:"For focused drilling",tagline:"Take your time. Learn at your pace.",body:"Choose any scenario. No timer, no pressure. Build confidence one station at a time.",photo:"/images/landing/e-mode-practice.png"},{id:"mock-station",numeral:"02",name:"Mock by Station",sublabel:"Single timed station",tagline:"Examiner-style pressure, one station at a time.",body:"Pick a station, full pressure, full scoring. Calibrate before the day.",photo:"/images/landing/e-mode-mock-station.png"},{id:"full-mock",numeral:"03",name:"Full Mock Exam",sublabel:"End-to-end circuit",tagline:"The whole circuit. As it really runs.",body:"All four station types in a continuous run. Same pacing as the real day.",photo:"/images/landing/e-mode-full-mock.png"},{id:"progress",numeral:"04",name:"Progress Tracking",sublabel:"Watch yourself improve",tagline:"Session history, score trends, category insights.",body:"See where you started, where you are, and where you’re still weak.",photo:"/images/landing/e-mode-progress.png"},{id:"feedback",numeral:"05",name:"Tailored Feedback",sublabel:"Marking-criteria graded",tagline:"Section-by-section, line-by-line.",body:"Clinical knowledge, communication, decision-making, professionalism — scored, with what to fix.",photo:"/images/landing/e-mode-feedback.png"}];function z0(){const r=$a(),e=()=>r("/scenarios",{state:{fresh:!0}});return R.jsxs("section",{id:"section-e",className:"section-e relative bg-organic-cream text-organic-bark overflow-hidden","data-testid":"section-e",children:[R.jsx("span",{className:"section-e__annotation",children:"( what you can do )"}),R.jsxs("div",{className:"section-e__inner max-w-[1500px] mx-auto px-6 sm:px-10 py-24 md:py-36",children:[R.jsxs("div",{className:"text-center mb-20 md:mb-28",children:[R.jsx("p",{className:"font-display italic text-organic-forest text-[1.1rem] md:text-[1.25rem] mb-3",children:"( five modes · one product )"}),R.jsxs("h2",{className:"section-e__title",children:["Five modes.",R.jsx("br",{}),R.jsx("em",{children:"One product."})]})]}),R.jsx(B0,{items:k0,defaultActiveId:"practice",renderListItem:(t,{isActive:n})=>R.jsxs("div",{className:"flex items-center gap-5 py-4",children:[R.jsx("span",{"aria-hidden":"true",className:rn("inline-block h-[8px] rounded-[3px] flex-shrink-0 transition-all duration-300",n?"w-10 bg-organic-amber":"w-5 bg-organic-bark/25")}),R.jsxs("div",{className:"flex-1 min-w-0",children:[R.jsxs("div",{className:"flex items-baseline gap-2.5",children:[R.jsxs("span",{className:rn("font-display italic text-[0.95rem] flex-shrink-0 transition-colors duration-300",n?"text-organic-amber":"text-organic-bark/40"),children:["( ",t.numeral," )"]}),R.jsx("h3",{className:rn("font-organic-display leading-[1.02] transition-all duration-300 min-w-0",n?"text-organic-bark font-bold text-[clamp(1.65rem,3vw,2.5rem)]":"text-organic-bark/35 font-normal text-[clamp(1.4rem,2.4vw,2rem)]"),children:t.name})]}),R.jsx("p",{className:"mt-1.5 ml-0 text-[0.8125rem] font-medium uppercase tracking-[0.25em] text-organic-bark/45",children:t.sublabel})]})]}),renderVisual:t=>R.jsxs("div",{className:"section-e__visual relative rounded-2xl bg-organic-canopy text-organic-cream min-h-[560px] overflow-hidden shadow-[0_24px_60px_rgba(26,58,42,0.18)] flex flex-col",children:[R.jsxs("div",{className:"relative w-full aspect-[16/10] overflow-hidden",children:[R.jsx("img",{src:t.photo,alt:"","aria-hidden":"true",loading:"lazy",className:"w-full h-full object-cover",style:{filter:"grayscale(0.25) contrast(1.05)"}},t.photo),R.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-organic-canopy via-transparent to-transparent"}),R.jsxs("span",{className:"absolute top-4 right-5 font-display italic text-organic-amber/90 text-[1.05rem]",children:["( ",t.numeral," )"]})]}),R.jsxs("div",{className:"flex-1 p-8 md:p-10 flex flex-col justify-between gap-5",children:[R.jsxs("div",{children:[R.jsx("span",{className:"text-[11px] font-medium uppercase tracking-[0.28em] text-organic-amber",children:t.sublabel}),R.jsx("h3",{className:"mt-3 font-organic-display text-[clamp(1.65rem,2.8vw,2.25rem)] leading-[1.1] font-bold",children:t.tagline}),R.jsx("p",{className:"mt-4 text-[0.95rem] text-organic-cream/80 leading-relaxed max-w-md",children:t.body})]}),R.jsxs("button",{type:"button",onClick:e,className:"self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-organic-amber text-organic-bark text-[13px] font-medium tracking-wide uppercase hover:-translate-y-[1px] transition-transform",children:["Try it ",R.jsx("span",{"aria-hidden":"true",children:"→"})]})]})]}),renderMobileCard:t=>R.jsxs("div",{className:"rounded-2xl bg-organic-canopy text-organic-cream overflow-hidden shadow-[0_12px_40px_rgba(26,58,42,0.15)]",children:[R.jsxs("div",{className:"relative w-full aspect-[16/10] overflow-hidden",children:[R.jsx("img",{src:t.photo,alt:"","aria-hidden":"true",loading:"lazy",className:"w-full h-full object-cover",style:{filter:"grayscale(0.25) contrast(1.05)"}}),R.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-organic-canopy/80 via-transparent to-transparent"}),R.jsxs("span",{className:"absolute top-3 right-4 font-display italic text-organic-amber/90 text-[0.95rem]",children:["( ",t.numeral," )"]})]}),R.jsxs("div",{className:"p-6",children:[R.jsx("span",{className:"text-[10px] font-medium uppercase tracking-[0.25em] text-organic-amber",children:t.sublabel}),R.jsx("h3",{className:"mt-2 font-organic-display text-[1.45rem] leading-tight font-bold",children:t.name}),R.jsx("p",{className:"mt-3 text-[0.9rem] text-organic-cream/80 leading-relaxed",children:t.body})]})]})})]})]})}function V0(){const r=$a();return R.jsx("section",{id:"section-f",className:"section-f relative bg-organic-cream text-organic-bark","data-testid":"section-f",children:R.jsxs("div",{className:"max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-32",children:[R.jsxs("div",{className:"text-center mb-12 md:mb-16",children:[R.jsx("p",{className:"font-display italic text-organic-forest text-[1.1rem] md:text-[1.25rem] mb-3",children:"( how to get it )"}),R.jsxs("h2",{className:"font-organic-display uppercase leading-[0.92] text-[clamp(2.75rem,9vw,7.5rem)] tracking-[-0.025em] font-bold",children:["Ready to ",R.jsx("em",{className:"font-display italic font-normal text-organic-amber lowercase tracking-[-0.01em]",children:"start?"})]})]}),R.jsxs("div",{id:"pricingSection",className:"grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto","data-testid":"pricing-section",children:[R.jsx(Dh,{tone:"sand",overline:"Free",title:"4 Sample Scenarios",features:["Basic feedback","Free sign-up, no card"],price:"£0",ctaLabel:"Explore Free",onClick:()=>r("/scenarios",{state:{fresh:!0}})}),R.jsx(Dh,{tone:"canopy",overline:"Premium ★",title:"All 166 Scenarios",features:["Full feedback + scoring","Mock exams","Progress tracking"],price:"From £8.33/mo",priceCaption:"£99.99/year (save £80)",ctaLabel:"Subscribe",ctaPrimary:!0,onClick:()=>r("/login")})]})]})})}function Dh({tone:r,overline:e,title:t,features:n,price:i,priceCaption:s,ctaLabel:a,ctaPrimary:o,onClick:l}){const c=r==="canopy";return R.jsxs("div",{className:rn("rounded-2xl p-8 md:p-10 flex flex-col",c?"bg-organic-canopy text-organic-cream border border-organic-amber/40":"bg-organic-sand/60 text-organic-bark border border-organic-stone"),children:[R.jsx("span",{className:rn("text-[11px] font-medium uppercase tracking-[0.3em] mb-4",c?"text-organic-amber":"text-organic-forest"),children:e}),R.jsx("h3",{className:"font-organic-display text-[clamp(1.5rem,2.4vw,1.85rem)] leading-tight mb-6",children:t}),R.jsx("ul",{className:rn("space-y-2 mb-8 text-[0.95rem]",c?"text-organic-cream/85":"text-organic-bark/80"),children:n.map(u=>R.jsxs("li",{className:"flex items-start gap-2.5",children:[R.jsx("span",{"aria-hidden":"true",className:rn("mt-[0.55em] inline-block h-[2px] w-3 flex-shrink-0",c?"bg-organic-amber":"bg-organic-forest")}),R.jsx("span",{children:u})]},u))}),R.jsxs("div",{className:"mt-auto",children:[R.jsx("p",{className:"font-organic-display text-[1.85rem] leading-none mb-1",children:i}),s&&R.jsx("p",{className:rn("text-[0.85rem] mb-5",c?"text-organic-cream/65":"text-organic-bark/55"),children:s}),R.jsxs("button",{type:"button",onClick:l,className:rn("inline-flex items-center gap-2 px-5 py-3 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-transform hover:-translate-y-[1px]",o?"bg-organic-amber text-organic-bark":"bg-transparent border border-organic-forest text-organic-forest hover:bg-organic-forest hover:text-organic-cream"),children:[a," ",R.jsx("span",{"aria-hidden":"true",children:"→"})]})]})]})}function H0(){const r=$a();return R.jsxs("footer",{className:"section-footer",id:"sectionFooter",children:[R.jsx("svg",{className:"footer-wave",viewBox:"0 0 1440 80",preserveAspectRatio:"none","aria-hidden":"true",children:R.jsx("path",{d:"M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z",fill:"var(--organic-bark)"})}),R.jsxs("div",{className:"footer-grid",children:[R.jsxs("div",{className:"footer-brand",children:[R.jsx(Ad,{to:"/",children:R.jsx("img",{src:"/images/logo/logo-md.png",alt:"ReViva",className:"logo-img logo-img--footer",style:{height:"32px",marginBottom:"12px"}})}),R.jsx("p",{children:"AI-powered interview preparation for surgical trainees. Practice smarter, not harder."}),R.jsx("p",{className:"footer-tagline",children:R.jsx("em",{children:"( hand-crafted in the UK · est. 2026 )"})})]}),R.jsxs("div",{className:"footer-column",children:[R.jsx("h4",{children:"Product"}),R.jsx("a",{href:"#",onClick:e=>{e.preventDefault(),r("/scenarios",{state:{fresh:!0}})},children:"Practice Mode"}),R.jsx("a",{href:"#",onClick:e=>{e.preventDefault(),r("/scenarios",{state:{fresh:!0}})},children:"Mock Exams"}),R.jsx("a",{href:"#pricingSection",onClick:e=>{e.preventDefault(),document.getElementById("pricingSection")?.scrollIntoView({behavior:"smooth"})},children:"Pricing"})]}),R.jsxs("div",{className:"footer-column",children:[R.jsx("h4",{children:"Support"}),R.jsx("span",{className:"footer-pending",children:"Contact · coming soon"}),R.jsx("span",{className:"footer-pending",children:"Help · coming soon"}),R.jsx("span",{className:"footer-pending",children:"FAQ · coming soon"})]}),R.jsxs("div",{className:"footer-column",children:[R.jsx("h4",{children:"Legal"}),R.jsx("span",{className:"footer-pending",children:"Terms & Conditions · coming soon"}),R.jsx("span",{className:"footer-pending",children:"Privacy Policy · coming soon"})]})]}),R.jsx("div",{className:"footer-bottom",children:R.jsx("p",{children:"© 2026 ReViva. All rights reserved."})})]})}const yf="183",G0=0,Lh=1,W0=2,tl=1,X0=2,ya=3,Rr=0,Fn=1,qi=2,Ji=0,zs=1,Nh=2,Ih=3,Uh=4,j0=5,Wr=100,Y0=101,q0=102,$0=103,K0=104,Z0=200,J0=201,Q0=202,ex=203,tu=204,nu=205,tx=206,nx=207,ix=208,rx=209,sx=210,ax=211,ox=212,lx=213,cx=214,iu=0,ru=1,su=2,$s=3,au=4,ou=5,lu=6,cu=7,lm=0,ux=1,fx=2,Ni=0,cm=1,um=2,fm=3,hm=4,dm=5,pm=6,mm=7,_m=300,as=301,Ks=302,Kl=303,Zl=304,Rl=306,uu=1e3,Ki=1001,fu=1002,ln=1003,hx=1004,bo=1005,vn=1006,Jl=1007,qr=1008,oi=1009,gm=1010,xm=1011,ja=1012,bf=1013,Oi=1014,Pi=1015,nr=1016,Ef=1017,Tf=1018,Ya=1020,vm=35902,Sm=35899,Mm=1021,ym=1022,xi=1023,ir=1026,$r=1027,bm=1028,wf=1029,Zs=1030,Af=1031,Cf=1033,nl=33776,il=33777,rl=33778,sl=33779,hu=35840,du=35841,pu=35842,mu=35843,_u=36196,gu=37492,xu=37496,vu=37488,Su=37489,Mu=37490,yu=37491,bu=37808,Eu=37809,Tu=37810,wu=37811,Au=37812,Cu=37813,Ru=37814,Pu=37815,Du=37816,Lu=37817,Nu=37818,Iu=37819,Uu=37820,Fu=37821,Ou=36492,Bu=36494,ku=36495,zu=36283,Vu=36284,Hu=36285,Gu=36286,dx=3200,px=0,mx=1,mr="",ii="srgb",Js="srgb-linear",xl="linear",xt="srgb",ms=7680,Fh=519,_x=512,gx=513,xx=514,Rf=515,vx=516,Sx=517,Pf=518,Mx=519,Oh=35044,Bh="300 es",Di=2e3,vl=2001;function yx(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function Sl(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function bx(){const r=Sl("canvas");return r.style.display="block",r}const kh={};function zh(...r){const e="THREE."+r.shift();console.log(e,...r)}function Em(r){const e=r[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=r[1];t&&t.isStackTrace?r[0]+=" "+t.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function je(...r){r=Em(r);const e="THREE."+r.shift();{const t=r[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...r)}}function ht(...r){r=Em(r);const e="THREE."+r.shift();{const t=r[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...r)}}function Ml(...r){const e=r.join(" ");e in kh||(kh[e]=!0,je(...r))}function Ex(r,e,t){return new Promise(function(n,i){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:i();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}const Tx={[iu]:ru,[su]:lu,[au]:cu,[$s]:ou,[ru]:iu,[lu]:su,[cu]:au,[ou]:$s};class ea{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const s=i.indexOf(t);s!==-1&&i.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let s=0,a=i.length;s<a;s++)i[s].call(this,e);e.target=null}}}const dn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ql=Math.PI/180,Wu=180/Math.PI;function Za(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(dn[r&255]+dn[r>>8&255]+dn[r>>16&255]+dn[r>>24&255]+"-"+dn[e&255]+dn[e>>8&255]+"-"+dn[e>>16&15|64]+dn[e>>24&255]+"-"+dn[t&63|128]+dn[t>>8&255]+"-"+dn[t>>16&255]+dn[t>>24&255]+dn[n&255]+dn[n>>8&255]+dn[n>>16&255]+dn[n>>24&255]).toLowerCase()}function at(r,e,t){return Math.max(e,Math.min(t,r))}function wx(r,e){return(r%e+e)%e}function ec(r,e,t){return(1-t)*r+t*e}function aa(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function Pn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("Invalid component type.")}}class dt{constructor(e=0,t=0){dt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=at(this.x,e.x,t.x),this.y=at(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=at(this.x,e,t),this.y=at(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(at(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(at(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*i+e.x,this.y=s*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ta{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,s,a,o){let l=n[i+0],c=n[i+1],u=n[i+2],d=n[i+3],f=s[a+0],h=s[a+1],_=s[a+2],g=s[a+3];if(d!==g||l!==f||c!==h||u!==_){let p=l*f+c*h+u*_+d*g;p<0&&(f=-f,h=-h,_=-_,g=-g,p=-p);let m=1-o;if(p<.9995){const v=Math.acos(p),b=Math.sin(v);m=Math.sin(m*v)/b,o=Math.sin(o*v)/b,l=l*m+f*o,c=c*m+h*o,u=u*m+_*o,d=d*m+g*o}else{l=l*m+f*o,c=c*m+h*o,u=u*m+_*o,d=d*m+g*o;const v=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=v,c*=v,u*=v,d*=v}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,i,s,a){const o=n[i],l=n[i+1],c=n[i+2],u=n[i+3],d=s[a],f=s[a+1],h=s[a+2],_=s[a+3];return e[t]=o*_+u*d+l*h-c*f,e[t+1]=l*_+u*f+c*d-o*h,e[t+2]=c*_+u*h+o*f-l*d,e[t+3]=u*_-o*d-l*f-c*h,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(i/2),d=o(s/2),f=l(n/2),h=l(i/2),_=l(s/2);switch(a){case"XYZ":this._x=f*u*d+c*h*_,this._y=c*h*d-f*u*_,this._z=c*u*_+f*h*d,this._w=c*u*d-f*h*_;break;case"YXZ":this._x=f*u*d+c*h*_,this._y=c*h*d-f*u*_,this._z=c*u*_-f*h*d,this._w=c*u*d+f*h*_;break;case"ZXY":this._x=f*u*d-c*h*_,this._y=c*h*d+f*u*_,this._z=c*u*_+f*h*d,this._w=c*u*d-f*h*_;break;case"ZYX":this._x=f*u*d-c*h*_,this._y=c*h*d+f*u*_,this._z=c*u*_-f*h*d,this._w=c*u*d+f*h*_;break;case"YZX":this._x=f*u*d+c*h*_,this._y=c*h*d+f*u*_,this._z=c*u*_-f*h*d,this._w=c*u*d-f*h*_;break;case"XZY":this._x=f*u*d-c*h*_,this._y=c*h*d-f*u*_,this._z=c*u*_+f*h*d,this._w=c*u*d+f*h*_;break;default:je("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],s=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],d=t[10],f=n+o+d;if(f>0){const h=.5/Math.sqrt(f+1);this._w=.25/h,this._x=(u-l)*h,this._y=(s-c)*h,this._z=(a-i)*h}else if(n>o&&n>d){const h=2*Math.sqrt(1+n-o-d);this._w=(u-l)/h,this._x=.25*h,this._y=(i+a)/h,this._z=(s+c)/h}else if(o>d){const h=2*Math.sqrt(1+o-n-d);this._w=(s-c)/h,this._x=(i+a)/h,this._y=.25*h,this._z=(l+u)/h}else{const h=2*Math.sqrt(1+d-n-o);this._w=(a-i)/h,this._x=(s+c)/h,this._y=(l+u)/h,this._z=.25*h}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(at(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,s=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+i*c-s*l,this._y=i*u+a*l+s*o-n*c,this._z=s*u+a*c+n*l-i*o,this._w=a*u-n*o-i*l-s*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,i=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,i=-i,s=-s,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+s*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class j{constructor(e=0,t=0,n=0){j.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Vh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Vh.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*i,this.y=s[1]*t+s[4]*n+s[7]*i,this.z=s[2]*t+s[5]*n+s[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*i+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*i+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*i+s[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),u=2*(o*t-s*i),d=2*(s*n-a*t);return this.x=t+l*c+a*d-o*u,this.y=n+l*u+o*c-s*d,this.z=i+l*d+s*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*i,this.y=s[1]*t+s[5]*n+s[9]*i,this.z=s[2]*t+s[6]*n+s[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=at(this.x,e.x,t.x),this.y=at(this.y,e.y,t.y),this.z=at(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=at(this.x,e,t),this.y=at(this.y,e,t),this.z=at(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(at(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-s*o,this.y=s*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return tc.copy(this).projectOnVector(e),this.sub(tc)}reflect(e){return this.sub(tc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(at(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const tc=new j,Vh=new ta;class Je{constructor(e,t,n,i,s,a,o,l,c){Je.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c)}set(e,t,n,i,s,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=i,u[2]=o,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],d=n[7],f=n[2],h=n[5],_=n[8],g=i[0],p=i[3],m=i[6],v=i[1],b=i[4],S=i[7],w=i[2],E=i[5],A=i[8];return s[0]=a*g+o*v+l*w,s[3]=a*p+o*b+l*E,s[6]=a*m+o*S+l*A,s[1]=c*g+u*v+d*w,s[4]=c*p+u*b+d*E,s[7]=c*m+u*S+d*A,s[2]=f*g+h*v+_*w,s[5]=f*p+h*b+_*E,s[8]=f*m+h*S+_*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*s*u+n*o*l+i*s*c-i*a*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=u*a-o*c,f=o*l-u*s,h=c*s-a*l,_=t*d+n*f+i*h;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/_;return e[0]=d*g,e[1]=(i*c-u*n)*g,e[2]=(o*n-i*a)*g,e[3]=f*g,e[4]=(u*t-i*l)*g,e[5]=(i*s-o*t)*g,e[6]=h*g,e[7]=(n*l-c*t)*g,e[8]=(a*t-n*s)*g,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(nc.makeScale(e,t)),this}rotate(e){return this.premultiply(nc.makeRotation(-e)),this}translate(e,t){return this.premultiply(nc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const nc=new Je,Hh=new Je().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Gh=new Je().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ax(){const r={enabled:!0,workingColorSpace:Js,spaces:{},convert:function(i,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===xt&&(i.r=Qi(i.r),i.g=Qi(i.g),i.b=Qi(i.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[s].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===xt&&(i.r=Vs(i.r),i.g=Vs(i.g),i.b=Vs(i.b))),i},workingToColorSpace:function(i,s){return this.convert(i,this.workingColorSpace,s)},colorSpaceToWorking:function(i,s){return this.convert(i,s,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===mr?xl:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,s=this.workingColorSpace){return i.fromArray(this.spaces[s].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,s,a){return i.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,s){return Ml("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(i,s)},toWorkingColorSpace:function(i,s){return Ml("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(i,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return r.define({[Js]:{primaries:e,whitePoint:n,transfer:xl,toXYZ:Hh,fromXYZ:Gh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:ii},outputColorSpaceConfig:{drawingBufferColorSpace:ii}},[ii]:{primaries:e,whitePoint:n,transfer:xt,toXYZ:Hh,fromXYZ:Gh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:ii}}}),r}const ct=Ax();function Qi(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Vs(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let _s;class Cx{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{_s===void 0&&(_s=Sl("canvas")),_s.width=e.width,_s.height=e.height;const i=_s.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=_s}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Sl("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),s=i.data;for(let a=0;a<s.length;a++)s[a]=Qi(s[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Qi(t[n]/255)*255):t[n]=Qi(t[n]);return{data:t,width:e.width,height:e.height}}else return je("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Rx=0;class Df{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Rx++}),this.uuid=Za(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?s.push(ic(i[a].image)):s.push(ic(i[a]))}else s=ic(i);n.url=s}return t||(e.images[this.uuid]=n),n}}function ic(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?Cx.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(je("Texture: Unable to serialize Texture."),{})}let Px=0;const rc=new j;class Rn extends ea{constructor(e=Rn.DEFAULT_IMAGE,t=Rn.DEFAULT_MAPPING,n=Ki,i=Ki,s=vn,a=qr,o=xi,l=oi,c=Rn.DEFAULT_ANISOTROPY,u=mr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Px++}),this.uuid=Za(),this.name="",this.source=new Df(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new dt(0,0),this.repeat=new dt(1,1),this.center=new dt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Je,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(rc).x}get height(){return this.source.getSize(rc).y}get depth(){return this.source.getSize(rc).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){je(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){je(`Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==_m)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case uu:e.x=e.x-Math.floor(e.x);break;case Ki:e.x=e.x<0?0:1;break;case fu:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case uu:e.y=e.y-Math.floor(e.y);break;case Ki:e.y=e.y<0?0:1;break;case fu:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Rn.DEFAULT_IMAGE=null;Rn.DEFAULT_MAPPING=_m;Rn.DEFAULT_ANISOTROPY=1;class kt{constructor(e=0,t=0,n=0,i=1){kt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,s;const l=e.elements,c=l[0],u=l[4],d=l[8],f=l[1],h=l[5],_=l[9],g=l[2],p=l[6],m=l[10];if(Math.abs(u-f)<.01&&Math.abs(d-g)<.01&&Math.abs(_-p)<.01){if(Math.abs(u+f)<.1&&Math.abs(d+g)<.1&&Math.abs(_+p)<.1&&Math.abs(c+h+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(c+1)/2,S=(h+1)/2,w=(m+1)/2,E=(u+f)/4,A=(d+g)/4,x=(_+p)/4;return b>S&&b>w?b<.01?(n=0,i=.707106781,s=.707106781):(n=Math.sqrt(b),i=E/n,s=A/n):S>w?S<.01?(n=.707106781,i=0,s=.707106781):(i=Math.sqrt(S),n=E/i,s=x/i):w<.01?(n=.707106781,i=.707106781,s=0):(s=Math.sqrt(w),n=A/s,i=x/s),this.set(n,i,s,t),this}let v=Math.sqrt((p-_)*(p-_)+(d-g)*(d-g)+(f-u)*(f-u));return Math.abs(v)<.001&&(v=1),this.x=(p-_)/v,this.y=(d-g)/v,this.z=(f-u)/v,this.w=Math.acos((c+h+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=at(this.x,e.x,t.x),this.y=at(this.y,e.y,t.y),this.z=at(this.z,e.z,t.z),this.w=at(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=at(this.x,e,t),this.y=at(this.y,e,t),this.z=at(this.z,e,t),this.w=at(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(at(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Dx extends ea{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:vn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new kt(0,0,e,t),this.scissorTest=!1,this.viewport=new kt(0,0,e,t),this.textures=[];const i={width:e,height:t,depth:n.depth},s=new Rn(i),a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:vn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new Df(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ii extends Dx{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Tm extends Rn{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=ln,this.minFilter=ln,this.wrapR=Ki,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Lx extends Rn{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=ln,this.minFilter=ln,this.wrapR=Ki,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Wt{constructor(e,t,n,i,s,a,o,l,c,u,d,f,h,_,g,p){Wt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,s,a,o,l,c,u,d,f,h,_,g,p)}set(e,t,n,i,s,a,o,l,c,u,d,f,h,_,g,p){const m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=i,m[1]=s,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=u,m[10]=d,m[14]=f,m[3]=h,m[7]=_,m[11]=g,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Wt().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,n=e.elements,i=1/gs.setFromMatrixColumn(e,0).length(),s=1/gs.setFromMatrixColumn(e,1).length(),a=1/gs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),u=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){const f=a*u,h=a*d,_=o*u,g=o*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=h+_*c,t[5]=f-g*c,t[9]=-o*l,t[2]=g-f*c,t[6]=_+h*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*u,h=l*d,_=c*u,g=c*d;t[0]=f+g*o,t[4]=_*o-h,t[8]=a*c,t[1]=a*d,t[5]=a*u,t[9]=-o,t[2]=h*o-_,t[6]=g+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*u,h=l*d,_=c*u,g=c*d;t[0]=f-g*o,t[4]=-a*d,t[8]=_+h*o,t[1]=h+_*o,t[5]=a*u,t[9]=g-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*u,h=a*d,_=o*u,g=o*d;t[0]=l*u,t[4]=_*c-h,t[8]=f*c+g,t[1]=l*d,t[5]=g*c+f,t[9]=h*c-_,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,h=a*c,_=o*l,g=o*c;t[0]=l*u,t[4]=g-f*d,t[8]=_*d+h,t[1]=d,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=h*d+_,t[10]=f-g*d}else if(e.order==="XZY"){const f=a*l,h=a*c,_=o*l,g=o*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=f*d+g,t[5]=a*u,t[9]=h*d-_,t[2]=_*d-h,t[6]=o*u,t[10]=g*d+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Nx,e,Ix)}lookAt(e,t,n){const i=this.elements;return kn.subVectors(e,t),kn.lengthSq()===0&&(kn.z=1),kn.normalize(),lr.crossVectors(n,kn),lr.lengthSq()===0&&(Math.abs(n.z)===1?kn.x+=1e-4:kn.z+=1e-4,kn.normalize(),lr.crossVectors(n,kn)),lr.normalize(),Eo.crossVectors(kn,lr),i[0]=lr.x,i[4]=Eo.x,i[8]=kn.x,i[1]=lr.y,i[5]=Eo.y,i[9]=kn.y,i[2]=lr.z,i[6]=Eo.z,i[10]=kn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],d=n[5],f=n[9],h=n[13],_=n[2],g=n[6],p=n[10],m=n[14],v=n[3],b=n[7],S=n[11],w=n[15],E=i[0],A=i[4],x=i[8],y=i[12],D=i[1],P=i[5],I=i[9],k=i[13],V=i[2],H=i[6],z=i[10],B=i[14],Q=i[3],ee=i[7],L=i[11],ce=i[15];return s[0]=a*E+o*D+l*V+c*Q,s[4]=a*A+o*P+l*H+c*ee,s[8]=a*x+o*I+l*z+c*L,s[12]=a*y+o*k+l*B+c*ce,s[1]=u*E+d*D+f*V+h*Q,s[5]=u*A+d*P+f*H+h*ee,s[9]=u*x+d*I+f*z+h*L,s[13]=u*y+d*k+f*B+h*ce,s[2]=_*E+g*D+p*V+m*Q,s[6]=_*A+g*P+p*H+m*ee,s[10]=_*x+g*I+p*z+m*L,s[14]=_*y+g*k+p*B+m*ce,s[3]=v*E+b*D+S*V+w*Q,s[7]=v*A+b*P+S*H+w*ee,s[11]=v*x+b*I+S*z+w*L,s[15]=v*y+b*k+S*B+w*ce,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],d=e[6],f=e[10],h=e[14],_=e[3],g=e[7],p=e[11],m=e[15],v=l*h-c*f,b=o*h-c*d,S=o*f-l*d,w=a*h-c*u,E=a*f-l*u,A=a*d-o*u;return t*(g*v-p*b+m*S)-n*(_*v-p*w+m*E)+i*(_*b-g*w+m*A)-s*(_*S-g*E+p*A)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=e[9],f=e[10],h=e[11],_=e[12],g=e[13],p=e[14],m=e[15],v=t*o-n*a,b=t*l-i*a,S=t*c-s*a,w=n*l-i*o,E=n*c-s*o,A=i*c-s*l,x=u*g-d*_,y=u*p-f*_,D=u*m-h*_,P=d*p-f*g,I=d*m-h*g,k=f*m-h*p,V=v*k-b*I+S*P+w*D-E*y+A*x;if(V===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const H=1/V;return e[0]=(o*k-l*I+c*P)*H,e[1]=(i*I-n*k-s*P)*H,e[2]=(g*A-p*E+m*w)*H,e[3]=(f*E-d*A-h*w)*H,e[4]=(l*D-a*k-c*y)*H,e[5]=(t*k-i*D+s*y)*H,e[6]=(p*S-_*A-m*b)*H,e[7]=(u*A-f*S+h*b)*H,e[8]=(a*I-o*D+c*x)*H,e[9]=(n*D-t*I-s*x)*H,e[10]=(_*E-g*S+m*v)*H,e[11]=(d*S-u*E-h*v)*H,e[12]=(o*y-a*P-l*x)*H,e[13]=(t*P-n*y+i*x)*H,e[14]=(g*b-_*w-p*v)*H,e[15]=(u*w-d*b+f*v)*H,this}scale(e){const t=this.elements,n=e.x,i=e.y,s=e.z;return t[0]*=n,t[4]*=i,t[8]*=s,t[1]*=n,t[5]*=i,t[9]*=s,t[2]*=n,t[6]*=i,t[10]*=s,t[3]*=n,t[7]*=i,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,c=s*a,u=s*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,u*o+n,u*l-i*a,0,c*l-i*o,u*l+i*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,s,a){return this.set(1,n,s,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,c=s+s,u=a+a,d=o+o,f=s*c,h=s*u,_=s*d,g=a*u,p=a*d,m=o*d,v=l*c,b=l*u,S=l*d,w=n.x,E=n.y,A=n.z;return i[0]=(1-(g+m))*w,i[1]=(h+S)*w,i[2]=(_-b)*w,i[3]=0,i[4]=(h-S)*E,i[5]=(1-(f+m))*E,i[6]=(p+v)*E,i[7]=0,i[8]=(_+b)*A,i[9]=(p-v)*A,i[10]=(1-(f+g))*A,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;e.x=i[12],e.y=i[13],e.z=i[14];const s=this.determinant();if(s===0)return n.set(1,1,1),t.identity(),this;let a=gs.set(i[0],i[1],i[2]).length();const o=gs.set(i[4],i[5],i[6]).length(),l=gs.set(i[8],i[9],i[10]).length();s<0&&(a=-a),di.copy(this);const c=1/a,u=1/o,d=1/l;return di.elements[0]*=c,di.elements[1]*=c,di.elements[2]*=c,di.elements[4]*=u,di.elements[5]*=u,di.elements[6]*=u,di.elements[8]*=d,di.elements[9]*=d,di.elements[10]*=d,t.setFromRotationMatrix(di),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,i,s,a,o=Di,l=!1){const c=this.elements,u=2*s/(t-e),d=2*s/(n-i),f=(t+e)/(t-e),h=(n+i)/(n-i);let _,g;if(l)_=s/(a-s),g=a*s/(a-s);else if(o===Di)_=-(a+s)/(a-s),g=-2*a*s/(a-s);else if(o===vl)_=-a/(a-s),g=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=d,c[9]=h,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,s,a,o=Di,l=!1){const c=this.elements,u=2/(t-e),d=2/(n-i),f=-(t+e)/(t-e),h=-(n+i)/(n-i);let _,g;if(l)_=1/(a-s),g=a/(a-s);else if(o===Di)_=-2/(a-s),g=-(a+s)/(a-s);else if(o===vl)_=-1/(a-s),g=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=d,c[9]=0,c[13]=h,c[2]=0,c[6]=0,c[10]=_,c[14]=g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const gs=new j,di=new Wt,Nx=new j(0,0,0),Ix=new j(1,1,1),lr=new j,Eo=new j,kn=new j,Wh=new Wt,Xh=new ta;class rr{constructor(e=0,t=0,n=0,i=rr.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,s=i[0],a=i[4],o=i[8],l=i[1],c=i[5],u=i[9],d=i[2],f=i[6],h=i[10];switch(t){case"XYZ":this._y=Math.asin(at(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,h),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-at(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,h),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(at(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-d,h),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-at(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(f,h),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(at(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(o,h));break;case"XZY":this._z=Math.asin(-at(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,h),this._y=0);break;default:je("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Wh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Wh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Xh.setFromEuler(this),this.setFromQuaternion(Xh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}rr.DEFAULT_ORDER="XYZ";class wm{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Ux=0;const jh=new j,xs=new ta,zi=new Wt,To=new j,oa=new j,Fx=new j,Ox=new ta,Yh=new j(1,0,0),qh=new j(0,1,0),$h=new j(0,0,1),Kh={type:"added"},Bx={type:"removed"},vs={type:"childadded",child:null},sc={type:"childremoved",child:null};class Kn extends ea{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ux++}),this.uuid=Za(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Kn.DEFAULT_UP.clone();const e=new j,t=new rr,n=new ta,i=new j(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Wt},normalMatrix:{value:new Je}}),this.matrix=new Wt,this.matrixWorld=new Wt,this.matrixAutoUpdate=Kn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Kn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return xs.setFromAxisAngle(e,t),this.quaternion.multiply(xs),this}rotateOnWorldAxis(e,t){return xs.setFromAxisAngle(e,t),this.quaternion.premultiply(xs),this}rotateX(e){return this.rotateOnAxis(Yh,e)}rotateY(e){return this.rotateOnAxis(qh,e)}rotateZ(e){return this.rotateOnAxis($h,e)}translateOnAxis(e,t){return jh.copy(e).applyQuaternion(this.quaternion),this.position.add(jh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Yh,e)}translateY(e){return this.translateOnAxis(qh,e)}translateZ(e){return this.translateOnAxis($h,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(zi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?To.copy(e):To.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),oa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?zi.lookAt(oa,To,this.up):zi.lookAt(To,oa,this.up),this.quaternion.setFromRotationMatrix(zi),i&&(zi.extractRotation(i.matrixWorld),xs.setFromRotationMatrix(zi),this.quaternion.premultiply(xs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ht("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Kh),vs.child=e,this.dispatchEvent(vs),vs.child=null):ht("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Bx),sc.child=e,this.dispatchEvent(sc),sc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),zi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),zi.multiply(e.parent.matrixWorld)),e.applyMatrix4(zi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Kh),vs.child=e,this.dispatchEvent(vs),vs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(oa,e,Fx),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(oa,Ox,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,i=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*n-s[8]*i,s[13]+=n-s[1]*t-s[5]*n-s[9]*i,s[14]+=i-s[2]*t-s[6]*n-s[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let s=0,a=i.length;s<a;s++)i[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),this.static!==!1&&(i.static=this.static),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const d=l[c];s(e.shapes,d)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));i.material=o}else i.material=s(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(s(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),d=a(e.shapes),f=a(e.skeletons),h=a(e.animations),_=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),f.length>0&&(n.skeletons=f),h.length>0&&(n.animations=h),_.length>0&&(n.nodes=_)}return n.object=i,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),e.pivot!==null&&(this.pivot=e.pivot.clone()),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Kn.DEFAULT_UP=new j(0,1,0);Kn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Kn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class wo extends Kn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const kx={type:"move"};class ac{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new wo,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new wo,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new j,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new j),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new wo,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new j,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new j),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const g of e.hand.values()){const p=t.getJointPose(g,n),m=this._getHandJoint(c,g);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}const u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],f=u.position.distanceTo(d.position),h=.02,_=.005;c.inputState.pinching&&f>h+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=h-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&s!==null&&(i=s),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(kx)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new wo;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Am={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},cr={h:0,s:0,l:0},Ao={h:0,s:0,l:0};function oc(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class Mt{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ii){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=ct.workingColorSpace){return this.r=e,this.g=t,this.b=n,ct.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=ct.workingColorSpace){if(e=wx(e,1),t=at(t,0,1),n=at(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=oc(a,s,e+1/3),this.g=oc(a,s,e),this.b=oc(a,s,e-1/3)}return ct.colorSpaceToWorking(this,i),this}setStyle(e,t=ii){function n(s){s!==void 0&&parseFloat(s)<1&&je("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:je("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=i[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);je("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ii){const n=Am[e.toLowerCase()];return n!==void 0?this.setHex(n,t):je("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Qi(e.r),this.g=Qi(e.g),this.b=Qi(e.b),this}copyLinearToSRGB(e){return this.r=Vs(e.r),this.g=Vs(e.g),this.b=Vs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ii){return ct.workingToColorSpace(pn.copy(this),e),Math.round(at(pn.r*255,0,255))*65536+Math.round(at(pn.g*255,0,255))*256+Math.round(at(pn.b*255,0,255))}getHexString(e=ii){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.workingToColorSpace(pn.copy(this),t);const n=pn.r,i=pn.g,s=pn.b,a=Math.max(n,i,s),o=Math.min(n,i,s);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const d=a-o;switch(c=u<=.5?d/(a+o):d/(2-a-o),a){case n:l=(i-s)/d+(i<s?6:0);break;case i:l=(s-n)/d+2;break;case s:l=(n-i)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ct.workingColorSpace){return ct.workingToColorSpace(pn.copy(this),t),e.r=pn.r,e.g=pn.g,e.b=pn.b,e}getStyle(e=ii){ct.workingToColorSpace(pn.copy(this),e);const t=pn.r,n=pn.g,i=pn.b;return e!==ii?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(cr),this.setHSL(cr.h+e,cr.s+t,cr.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(cr),e.getHSL(Ao);const n=ec(cr.h,Ao.h,t),i=ec(cr.s,Ao.s,t),s=ec(cr.l,Ao.l,t);return this.setHSL(n,i,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*i,this.g=s[1]*t+s[4]*n+s[7]*i,this.b=s[2]*t+s[5]*n+s[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const pn=new Mt;Mt.NAMES=Am;class zx extends Kn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new rr,this.environmentIntensity=1,this.environmentRotation=new rr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const pi=new j,Vi=new j,lc=new j,Hi=new j,Ss=new j,Ms=new j,Zh=new j,cc=new j,uc=new j,fc=new j,hc=new kt,dc=new kt,pc=new kt;class gi{constructor(e=new j,t=new j,n=new j){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),pi.subVectors(e,t),i.cross(pi);const s=i.lengthSq();return s>0?i.multiplyScalar(1/Math.sqrt(s)):i.set(0,0,0)}static getBarycoord(e,t,n,i,s){pi.subVectors(i,t),Vi.subVectors(n,t),lc.subVectors(e,t);const a=pi.dot(pi),o=pi.dot(Vi),l=pi.dot(lc),c=Vi.dot(Vi),u=Vi.dot(lc),d=a*c-o*o;if(d===0)return s.set(0,0,0),null;const f=1/d,h=(c*l-o*u)*f,_=(a*u-o*l)*f;return s.set(1-h-_,_,h)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Hi)===null?!1:Hi.x>=0&&Hi.y>=0&&Hi.x+Hi.y<=1}static getInterpolation(e,t,n,i,s,a,o,l){return this.getBarycoord(e,t,n,i,Hi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Hi.x),l.addScaledVector(a,Hi.y),l.addScaledVector(o,Hi.z),l)}static getInterpolatedAttribute(e,t,n,i,s,a){return hc.setScalar(0),dc.setScalar(0),pc.setScalar(0),hc.fromBufferAttribute(e,t),dc.fromBufferAttribute(e,n),pc.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(hc,s.x),a.addScaledVector(dc,s.y),a.addScaledVector(pc,s.z),a}static isFrontFacing(e,t,n,i){return pi.subVectors(n,t),Vi.subVectors(e,t),pi.cross(Vi).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return pi.subVectors(this.c,this.b),Vi.subVectors(this.a,this.b),pi.cross(Vi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return gi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return gi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,s){return gi.getInterpolation(e,this.a,this.b,this.c,t,n,i,s)}containsPoint(e){return gi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return gi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,s=this.c;let a,o;Ss.subVectors(i,n),Ms.subVectors(s,n),cc.subVectors(e,n);const l=Ss.dot(cc),c=Ms.dot(cc);if(l<=0&&c<=0)return t.copy(n);uc.subVectors(e,i);const u=Ss.dot(uc),d=Ms.dot(uc);if(u>=0&&d<=u)return t.copy(i);const f=l*d-u*c;if(f<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(Ss,a);fc.subVectors(e,s);const h=Ss.dot(fc),_=Ms.dot(fc);if(_>=0&&h<=_)return t.copy(s);const g=h*c-l*_;if(g<=0&&c>=0&&_<=0)return o=c/(c-_),t.copy(n).addScaledVector(Ms,o);const p=u*_-h*d;if(p<=0&&d-u>=0&&h-_>=0)return Zh.subVectors(s,i),o=(d-u)/(d-u+(h-_)),t.copy(i).addScaledVector(Zh,o);const m=1/(p+g+f);return a=g*m,o=f*m,t.copy(n).addScaledVector(Ss,a).addScaledVector(Ms,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Ja{constructor(e=new j(1/0,1/0,1/0),t=new j(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(mi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(mi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=mi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,mi):mi.fromBufferAttribute(s,a),mi.applyMatrix4(e.matrixWorld),this.expandByPoint(mi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Co.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Co.copy(n.boundingBox)),Co.applyMatrix4(e.matrixWorld),this.union(Co)}const i=e.children;for(let s=0,a=i.length;s<a;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,mi),mi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(la),Ro.subVectors(this.max,la),ys.subVectors(e.a,la),bs.subVectors(e.b,la),Es.subVectors(e.c,la),ur.subVectors(bs,ys),fr.subVectors(Es,bs),Ir.subVectors(ys,Es);let t=[0,-ur.z,ur.y,0,-fr.z,fr.y,0,-Ir.z,Ir.y,ur.z,0,-ur.x,fr.z,0,-fr.x,Ir.z,0,-Ir.x,-ur.y,ur.x,0,-fr.y,fr.x,0,-Ir.y,Ir.x,0];return!mc(t,ys,bs,Es,Ro)||(t=[1,0,0,0,1,0,0,0,1],!mc(t,ys,bs,Es,Ro))?!1:(Po.crossVectors(ur,fr),t=[Po.x,Po.y,Po.z],mc(t,ys,bs,Es,Ro))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,mi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(mi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Gi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Gi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Gi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Gi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Gi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Gi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Gi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Gi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Gi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Gi=[new j,new j,new j,new j,new j,new j,new j,new j],mi=new j,Co=new Ja,ys=new j,bs=new j,Es=new j,ur=new j,fr=new j,Ir=new j,la=new j,Ro=new j,Po=new j,Ur=new j;function mc(r,e,t,n,i){for(let s=0,a=r.length-3;s<=a;s+=3){Ur.fromArray(r,s);const o=i.x*Math.abs(Ur.x)+i.y*Math.abs(Ur.y)+i.z*Math.abs(Ur.z),l=e.dot(Ur),c=t.dot(Ur),u=n.dot(Ur);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const Vt=new j,Do=new dt;let Vx=0;class Ui{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Vx++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Oh,this.updateRanges=[],this.gpuType=Pi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Do.fromBufferAttribute(this,t),Do.applyMatrix3(e),this.setXY(t,Do.x,Do.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Vt.fromBufferAttribute(this,t),Vt.applyMatrix3(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Vt.fromBufferAttribute(this,t),Vt.applyMatrix4(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Vt.fromBufferAttribute(this,t),Vt.applyNormalMatrix(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Vt.fromBufferAttribute(this,t),Vt.transformDirection(e),this.setXYZ(t,Vt.x,Vt.y,Vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=aa(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Pn(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=aa(t,this.array)),t}setX(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=aa(t,this.array)),t}setY(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=aa(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=aa(t,this.array)),t}setW(e,t){return this.normalized&&(t=Pn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Pn(t,this.array),n=Pn(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=Pn(t,this.array),n=Pn(n,this.array),i=Pn(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,s){return e*=this.itemSize,this.normalized&&(t=Pn(t,this.array),n=Pn(n,this.array),i=Pn(i,this.array),s=Pn(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Oh&&(e.usage=this.usage),e}}class Cm extends Ui{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Rm extends Ui{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class fi extends Ui{constructor(e,t,n){super(new Float32Array(e),t,n)}}const Hx=new Ja,ca=new j,_c=new j;class Lf{constructor(e=new j,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Hx.setFromPoints(e).getCenter(n);let i=0;for(let s=0,a=e.length;s<a;s++)i=Math.max(i,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ca.subVectors(e,this.center);const t=ca.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(ca,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(_c.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ca.copy(e.center).add(_c)),this.expandByPoint(ca.copy(e.center).sub(_c))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Gx=0;const ei=new Wt,gc=new Kn,Ts=new j,zn=new Ja,ua=new Ja,en=new j;class Bi extends ea{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Gx++}),this.uuid=Za(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(yx(e)?Rm:Cm)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Je().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ei.makeRotationFromQuaternion(e),this.applyMatrix4(ei),this}rotateX(e){return ei.makeRotationX(e),this.applyMatrix4(ei),this}rotateY(e){return ei.makeRotationY(e),this.applyMatrix4(ei),this}rotateZ(e){return ei.makeRotationZ(e),this.applyMatrix4(ei),this}translate(e,t,n){return ei.makeTranslation(e,t,n),this.applyMatrix4(ei),this}scale(e,t,n){return ei.makeScale(e,t,n),this.applyMatrix4(ei),this}lookAt(e){return gc.lookAt(e),gc.updateMatrix(),this.applyMatrix4(gc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ts).negate(),this.translate(Ts.x,Ts.y,Ts.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,s=e.length;i<s;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new fi(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const s=e[i];t.setXYZ(i,s.x,s.y,s.z||0)}e.length>t.count&&je("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ja);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ht("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new j(-1/0,-1/0,-1/0),new j(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const s=t[n];zn.setFromBufferAttribute(s),this.morphTargetsRelative?(en.addVectors(this.boundingBox.min,zn.min),this.boundingBox.expandByPoint(en),en.addVectors(this.boundingBox.max,zn.max),this.boundingBox.expandByPoint(en)):(this.boundingBox.expandByPoint(zn.min),this.boundingBox.expandByPoint(zn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ht('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Lf);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ht("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new j,1/0);return}if(e){const n=this.boundingSphere.center;if(zn.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];ua.setFromBufferAttribute(o),this.morphTargetsRelative?(en.addVectors(zn.min,ua.min),zn.expandByPoint(en),en.addVectors(zn.max,ua.max),zn.expandByPoint(en)):(zn.expandByPoint(ua.min),zn.expandByPoint(ua.max))}zn.getCenter(n);let i=0;for(let s=0,a=e.count;s<a;s++)en.fromBufferAttribute(e,s),i=Math.max(i,n.distanceToSquared(en));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)en.fromBufferAttribute(o,c),l&&(Ts.fromBufferAttribute(e,c),en.add(Ts)),i=Math.max(i,n.distanceToSquared(en))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&ht('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ht("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ui(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let x=0;x<n.count;x++)o[x]=new j,l[x]=new j;const c=new j,u=new j,d=new j,f=new dt,h=new dt,_=new dt,g=new j,p=new j;function m(x,y,D){c.fromBufferAttribute(n,x),u.fromBufferAttribute(n,y),d.fromBufferAttribute(n,D),f.fromBufferAttribute(s,x),h.fromBufferAttribute(s,y),_.fromBufferAttribute(s,D),u.sub(c),d.sub(c),h.sub(f),_.sub(f);const P=1/(h.x*_.y-_.x*h.y);isFinite(P)&&(g.copy(u).multiplyScalar(_.y).addScaledVector(d,-h.y).multiplyScalar(P),p.copy(d).multiplyScalar(h.x).addScaledVector(u,-_.x).multiplyScalar(P),o[x].add(g),o[y].add(g),o[D].add(g),l[x].add(p),l[y].add(p),l[D].add(p))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let x=0,y=v.length;x<y;++x){const D=v[x],P=D.start,I=D.count;for(let k=P,V=P+I;k<V;k+=3)m(e.getX(k+0),e.getX(k+1),e.getX(k+2))}const b=new j,S=new j,w=new j,E=new j;function A(x){w.fromBufferAttribute(i,x),E.copy(w);const y=o[x];b.copy(y),b.sub(w.multiplyScalar(w.dot(y))).normalize(),S.crossVectors(E,y);const P=S.dot(l[x])<0?-1:1;a.setXYZW(x,b.x,b.y,b.z,P)}for(let x=0,y=v.length;x<y;++x){const D=v[x],P=D.start,I=D.count;for(let k=P,V=P+I;k<V;k+=3)A(e.getX(k+0)),A(e.getX(k+1)),A(e.getX(k+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ui(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,h=n.count;f<h;f++)n.setXYZ(f,0,0,0);const i=new j,s=new j,a=new j,o=new j,l=new j,c=new j,u=new j,d=new j;if(e)for(let f=0,h=e.count;f<h;f+=3){const _=e.getX(f+0),g=e.getX(f+1),p=e.getX(f+2);i.fromBufferAttribute(t,_),s.fromBufferAttribute(t,g),a.fromBufferAttribute(t,p),u.subVectors(a,s),d.subVectors(i,s),u.cross(d),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,g),c.fromBufferAttribute(n,p),o.add(u),l.add(u),c.add(u),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(g,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let f=0,h=t.count;f<h;f+=3)i.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),u.subVectors(a,s),d.subVectors(i,s),u.cross(d),n.setXYZ(f+0,u.x,u.y,u.z),n.setXYZ(f+1,u.x,u.y,u.z),n.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)en.fromBufferAttribute(e,t),en.normalize(),e.setXYZ(t,en.x,en.y,en.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,d=o.normalized,f=new c.constructor(l.length*u);let h=0,_=0;for(let g=0,p=l.length;g<p;g++){o.isInterleavedBufferAttribute?h=l[g]*o.data.stride+o.offset:h=l[g]*u;for(let m=0;m<u;m++)f[_++]=c[h++]}return new Ui(f,u,d)}if(this.index===null)return je("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Bi,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=e(l,n);t.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let u=0,d=c.length;u<d;u++){const f=c[u],h=e(f,n);l.push(h)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let d=0,f=c.length;d<f;d++){const h=c[d];u.push(h.toJSON(e.data))}u.length>0&&(i[l]=u,s=!0)}s&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const c in i){const u=i[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],d=s[c];for(let f=0,h=d.length;f<h;f++)u.push(d[f].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}let Wx=0;class Pl extends ea{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Wx++}),this.uuid=Za(),this.name="",this.type="Material",this.blending=zs,this.side=Rr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=tu,this.blendDst=nu,this.blendEquation=Wr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Mt(0,0,0),this.blendAlpha=0,this.depthFunc=$s,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Fh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ms,this.stencilZFail=ms,this.stencilZPass=ms,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){je(`Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){je(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==zs&&(n.blending=this.blending),this.side!==Rr&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==tu&&(n.blendSrc=this.blendSrc),this.blendDst!==nu&&(n.blendDst=this.blendDst),this.blendEquation!==Wr&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==$s&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Fh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ms&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ms&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ms&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(t){const s=i(e.textures),a=i(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let s=0;s!==i;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const Wi=new j,xc=new j,Lo=new j,hr=new j,vc=new j,No=new j,Sc=new j;class Xx{constructor(e=new j,t=new j(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Wi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Wi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Wi.copy(this.origin).addScaledVector(this.direction,t),Wi.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){xc.copy(e).add(t).multiplyScalar(.5),Lo.copy(t).sub(e).normalize(),hr.copy(this.origin).sub(xc);const s=e.distanceTo(t)*.5,a=-this.direction.dot(Lo),o=hr.dot(this.direction),l=-hr.dot(Lo),c=hr.lengthSq(),u=Math.abs(1-a*a);let d,f,h,_;if(u>0)if(d=a*l-o,f=a*o-l,_=s*u,d>=0)if(f>=-_)if(f<=_){const g=1/u;d*=g,f*=g,h=d*(d+a*f+2*o)+f*(a*d+f+2*l)+c}else f=s,d=Math.max(0,-(a*f+o)),h=-d*d+f*(f+2*l)+c;else f=-s,d=Math.max(0,-(a*f+o)),h=-d*d+f*(f+2*l)+c;else f<=-_?(d=Math.max(0,-(-a*s+o)),f=d>0?-s:Math.min(Math.max(-s,-l),s),h=-d*d+f*(f+2*l)+c):f<=_?(d=0,f=Math.min(Math.max(-s,-l),s),h=f*(f+2*l)+c):(d=Math.max(0,-(a*s+o)),f=d>0?s:Math.min(Math.max(-s,-l),s),h=-d*d+f*(f+2*l)+c);else f=a>0?-s:s,d=Math.max(0,-(a*f+o)),h=-d*d+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),i&&i.copy(xc).addScaledVector(Lo,f),h}intersectSphere(e,t){Wi.subVectors(e.center,this.origin);const n=Wi.dot(this.direction),i=Wi.dot(Wi)-n*n,s=e.radius*e.radius;if(i>s)return null;const a=Math.sqrt(s-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,s,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,i=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,i=(e.min.x-f.x)*c),u>=0?(s=(e.min.y-f.y)*u,a=(e.max.y-f.y)*u):(s=(e.max.y-f.y)*u,a=(e.min.y-f.y)*u),n>a||s>i||((s>n||isNaN(n))&&(n=s),(a<i||isNaN(i))&&(i=a),d>=0?(o=(e.min.z-f.z)*d,l=(e.max.z-f.z)*d):(o=(e.max.z-f.z)*d,l=(e.min.z-f.z)*d),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Wi)!==null}intersectTriangle(e,t,n,i,s){vc.subVectors(t,e),No.subVectors(n,e),Sc.crossVectors(vc,No);let a=this.direction.dot(Sc),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;hr.subVectors(this.origin,e);const l=o*this.direction.dot(No.crossVectors(hr,No));if(l<0)return null;const c=o*this.direction.dot(vc.cross(hr));if(c<0||l+c>a)return null;const u=-o*hr.dot(Sc);return u<0?null:this.at(u/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Nf extends Pl{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Mt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rr,this.combine=lm,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Jh=new Wt,Fr=new Xx,Io=new Lf,Qh=new j,Uo=new j,Fo=new j,Oo=new j,Mc=new j,Bo=new j,ed=new j,ko=new j;class vi extends Kn{constructor(e=new Bi,t=new Nf){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=i.length;s<a;s++){const o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(s&&o){Bo.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=o[l],d=s[l];u!==0&&(Mc.fromBufferAttribute(d,e),a?Bo.addScaledVector(Mc,u):Bo.addScaledVector(Mc.sub(t),u))}t.add(Bo)}return t}raycast(e,t){const n=this.geometry,i=this.material,s=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Io.copy(n.boundingSphere),Io.applyMatrix4(s),Fr.copy(e.ray).recast(e.near),!(Io.containsPoint(Fr.origin)===!1&&(Fr.intersectSphere(Io,Qh)===null||Fr.origin.distanceToSquared(Qh)>(e.far-e.near)**2))&&(Jh.copy(s).invert(),Fr.copy(e.ray).applyMatrix4(Jh),!(n.boundingBox!==null&&Fr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Fr)))}_computeIntersections(e,t,n){let i;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,d=s.attributes.normal,f=s.groups,h=s.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,g=f.length;_<g;_++){const p=f[_],m=a[p.materialIndex],v=Math.max(p.start,h.start),b=Math.min(o.count,Math.min(p.start+p.count,h.start+h.count));for(let S=v,w=b;S<w;S+=3){const E=o.getX(S),A=o.getX(S+1),x=o.getX(S+2);i=zo(this,m,e,n,c,u,d,E,A,x),i&&(i.faceIndex=Math.floor(S/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{const _=Math.max(0,h.start),g=Math.min(o.count,h.start+h.count);for(let p=_,m=g;p<m;p+=3){const v=o.getX(p),b=o.getX(p+1),S=o.getX(p+2);i=zo(this,a,e,n,c,u,d,v,b,S),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,g=f.length;_<g;_++){const p=f[_],m=a[p.materialIndex],v=Math.max(p.start,h.start),b=Math.min(l.count,Math.min(p.start+p.count,h.start+h.count));for(let S=v,w=b;S<w;S+=3){const E=S,A=S+1,x=S+2;i=zo(this,m,e,n,c,u,d,E,A,x),i&&(i.faceIndex=Math.floor(S/3),i.face.materialIndex=p.materialIndex,t.push(i))}}else{const _=Math.max(0,h.start),g=Math.min(l.count,h.start+h.count);for(let p=_,m=g;p<m;p+=3){const v=p,b=p+1,S=p+2;i=zo(this,a,e,n,c,u,d,v,b,S),i&&(i.faceIndex=Math.floor(p/3),t.push(i))}}}}function jx(r,e,t,n,i,s,a,o){let l;if(e.side===Fn?l=n.intersectTriangle(a,s,i,!0,o):l=n.intersectTriangle(i,s,a,e.side===Rr,o),l===null)return null;ko.copy(o),ko.applyMatrix4(r.matrixWorld);const c=t.ray.origin.distanceTo(ko);return c<t.near||c>t.far?null:{distance:c,point:ko.clone(),object:r}}function zo(r,e,t,n,i,s,a,o,l,c){r.getVertexPosition(o,Uo),r.getVertexPosition(l,Fo),r.getVertexPosition(c,Oo);const u=jx(r,e,t,n,Uo,Fo,Oo,ed);if(u){const d=new j;gi.getBarycoord(ed,Uo,Fo,Oo,d),i&&(u.uv=gi.getInterpolatedAttribute(i,o,l,c,d,new dt)),s&&(u.uv1=gi.getInterpolatedAttribute(s,o,l,c,d,new dt)),a&&(u.normal=gi.getInterpolatedAttribute(a,o,l,c,d,new j),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new j,materialIndex:0};gi.getNormal(Uo,Fo,Oo,f.normal),u.face=f,u.barycoord=d}return u}class Yx extends Rn{constructor(e=null,t=1,n=1,i,s,a,o,l,c=ln,u=ln,d,f){super(null,a,o,l,c,u,i,s,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const yc=new j,qx=new j,$x=new Je;class Gr{constructor(e=new j(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=yc.subVectors(n,t).cross(qx.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(yc),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/i;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||$x.getNormalMatrix(e),i=this.coplanarPoint(yc).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Or=new Lf,Kx=new dt(.5,.5),Vo=new j;class Pm{constructor(e=new Gr,t=new Gr,n=new Gr,i=new Gr,s=new Gr,a=new Gr){this.planes=[e,t,n,i,s,a]}set(e,t,n,i,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Di,n=!1){const i=this.planes,s=e.elements,a=s[0],o=s[1],l=s[2],c=s[3],u=s[4],d=s[5],f=s[6],h=s[7],_=s[8],g=s[9],p=s[10],m=s[11],v=s[12],b=s[13],S=s[14],w=s[15];if(i[0].setComponents(c-a,h-u,m-_,w-v).normalize(),i[1].setComponents(c+a,h+u,m+_,w+v).normalize(),i[2].setComponents(c+o,h+d,m+g,w+b).normalize(),i[3].setComponents(c-o,h-d,m-g,w-b).normalize(),n)i[4].setComponents(l,f,p,S).normalize(),i[5].setComponents(c-l,h-f,m-p,w-S).normalize();else if(i[4].setComponents(c-l,h-f,m-p,w-S).normalize(),t===Di)i[5].setComponents(c+l,h+f,m+p,w+S).normalize();else if(t===vl)i[5].setComponents(l,f,p,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Or.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Or.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Or)}intersectsSprite(e){Or.center.set(0,0,0);const t=Kx.distanceTo(e.center);return Or.radius=.7071067811865476+t,Or.applyMatrix4(e.matrixWorld),this.intersectsSphere(Or)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(Vo.x=i.normal.x>0?e.max.x:e.min.x,Vo.y=i.normal.y>0?e.max.y:e.min.y,Vo.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(Vo)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Dm extends Rn{constructor(e=[],t=as,n,i,s,a,o,l,c,u){super(e,t,n,i,s,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class qa extends Rn{constructor(e,t,n=Oi,i,s,a,o=ln,l=ln,c,u=ir,d=1){if(u!==ir&&u!==$r)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:d};super(f,i,s,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Df(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Zx extends qa{constructor(e,t=Oi,n=as,i,s,a=ln,o=ln,l,c=ir){const u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,i,s,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Lm extends Rn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Qa extends Bi{constructor(e=1,t=1,n=1,i=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:s,depthSegments:a};const o=this;i=Math.floor(i),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],u=[],d=[];let f=0,h=0;_("z","y","x",-1,-1,n,t,e,a,s,0),_("z","y","x",1,-1,n,t,-e,a,s,1),_("x","z","y",1,1,e,n,t,i,a,2),_("x","z","y",1,-1,e,n,-t,i,a,3),_("x","y","z",1,-1,e,t,n,i,s,4),_("x","y","z",-1,-1,e,t,-n,i,s,5),this.setIndex(l),this.setAttribute("position",new fi(c,3)),this.setAttribute("normal",new fi(u,3)),this.setAttribute("uv",new fi(d,2));function _(g,p,m,v,b,S,w,E,A,x,y){const D=S/A,P=w/x,I=S/2,k=w/2,V=E/2,H=A+1,z=x+1;let B=0,Q=0;const ee=new j;for(let L=0;L<z;L++){const ce=L*P-k;for(let ue=0;ue<H;ue++){const ke=ue*D-I;ee[g]=ke*v,ee[p]=ce*b,ee[m]=V,c.push(ee.x,ee.y,ee.z),ee[g]=0,ee[p]=0,ee[m]=E>0?1:-1,u.push(ee.x,ee.y,ee.z),d.push(ue/A),d.push(1-L/x),B+=1}}for(let L=0;L<x;L++)for(let ce=0;ce<A;ce++){const ue=f+ce+H*L,ke=f+ce+H*(L+1),He=f+(ce+1)+H*(L+1),Ye=f+(ce+1)+H*L;l.push(ue,ke,Ye),l.push(ke,He,Ye),Q+=6}o.addGroup(h,Q,y),h+=Q,f+=B}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qa(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class If extends Bi{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const s=[],a=[];o(i),c(n),u(),this.setAttribute("position",new fi(s,3)),this.setAttribute("normal",new fi(s.slice(),3)),this.setAttribute("uv",new fi(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(v){const b=new j,S=new j,w=new j;for(let E=0;E<t.length;E+=3)h(t[E+0],b),h(t[E+1],S),h(t[E+2],w),l(b,S,w,v)}function l(v,b,S,w){const E=w+1,A=[];for(let x=0;x<=E;x++){A[x]=[];const y=v.clone().lerp(S,x/E),D=b.clone().lerp(S,x/E),P=E-x;for(let I=0;I<=P;I++)I===0&&x===E?A[x][I]=y:A[x][I]=y.clone().lerp(D,I/P)}for(let x=0;x<E;x++)for(let y=0;y<2*(E-x)-1;y++){const D=Math.floor(y/2);y%2===0?(f(A[x][D+1]),f(A[x+1][D]),f(A[x][D])):(f(A[x][D+1]),f(A[x+1][D+1]),f(A[x+1][D]))}}function c(v){const b=new j;for(let S=0;S<s.length;S+=3)b.x=s[S+0],b.y=s[S+1],b.z=s[S+2],b.normalize().multiplyScalar(v),s[S+0]=b.x,s[S+1]=b.y,s[S+2]=b.z}function u(){const v=new j;for(let b=0;b<s.length;b+=3){v.x=s[b+0],v.y=s[b+1],v.z=s[b+2];const S=p(v)/2/Math.PI+.5,w=m(v)/Math.PI+.5;a.push(S,1-w)}_(),d()}function d(){for(let v=0;v<a.length;v+=6){const b=a[v+0],S=a[v+2],w=a[v+4],E=Math.max(b,S,w),A=Math.min(b,S,w);E>.9&&A<.1&&(b<.2&&(a[v+0]+=1),S<.2&&(a[v+2]+=1),w<.2&&(a[v+4]+=1))}}function f(v){s.push(v.x,v.y,v.z)}function h(v,b){const S=v*3;b.x=e[S+0],b.y=e[S+1],b.z=e[S+2]}function _(){const v=new j,b=new j,S=new j,w=new j,E=new dt,A=new dt,x=new dt;for(let y=0,D=0;y<s.length;y+=9,D+=6){v.set(s[y+0],s[y+1],s[y+2]),b.set(s[y+3],s[y+4],s[y+5]),S.set(s[y+6],s[y+7],s[y+8]),E.set(a[D+0],a[D+1]),A.set(a[D+2],a[D+3]),x.set(a[D+4],a[D+5]),w.copy(v).add(b).add(S).divideScalar(3);const P=p(w);g(E,D+0,v,P),g(A,D+2,b,P),g(x,D+4,S,P)}}function g(v,b,S,w){w<0&&v.x===1&&(a[b]=v.x-1),S.x===0&&S.z===0&&(a[b]=w/2/Math.PI+.5)}function p(v){return Math.atan2(v.z,-v.x)}function m(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new If(e.vertices,e.indices,e.radius,e.detail)}}class yl extends If{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new yl(e.radius,e.detail)}}class Dl extends Bi{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,u=l+1,d=e/o,f=t/l,h=[],_=[],g=[],p=[];for(let m=0;m<u;m++){const v=m*f-a;for(let b=0;b<c;b++){const S=b*d-s;_.push(S,-v,0),g.push(0,0,1),p.push(b/o),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let v=0;v<o;v++){const b=v+c*m,S=v+c*(m+1),w=v+1+c*(m+1),E=v+1+c*m;h.push(b,S,E),h.push(S,w,E)}this.setIndex(h),this.setAttribute("position",new fi(_,3)),this.setAttribute("normal",new fi(g,3)),this.setAttribute("uv",new fi(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Dl(e.width,e.height,e.widthSegments,e.heightSegments)}}function Qs(r){const e={};for(const t in r){e[t]={};for(const n in r[t]){const i=r[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(je("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function bn(r){const e={};for(let t=0;t<r.length;t++){const n=Qs(r[t]);for(const i in n)e[i]=n[i]}return e}function Jx(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function Nm(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ct.workingColorSpace}const Qx={clone:Qs,merge:bn};var ev=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,tv=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Si extends Pl{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ev,this.fragmentShader=tv,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Qs(e.uniforms),this.uniformsGroups=Jx(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class nv extends Si{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class iv extends Pl{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=dx,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class rv extends Pl{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Ho=new j,Go=new ta,yi=new j;class Im extends Kn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Wt,this.projectionMatrix=new Wt,this.projectionMatrixInverse=new Wt,this.coordinateSystem=Di,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ho,Go,yi),yi.x===1&&yi.y===1&&yi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ho,Go,yi.set(1,1,1)).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorld.decompose(Ho,Go,yi),yi.x===1&&yi.y===1&&yi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ho,Go,yi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const dr=new j,td=new dt,nd=new dt;class ai extends Im{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Wu*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ql*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Wu*2*Math.atan(Math.tan(Ql*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){dr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(dr.x,dr.y).multiplyScalar(-e/dr.z),dr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(dr.x,dr.y).multiplyScalar(-e/dr.z)}getViewSize(e,t){return this.getViewBounds(e,td,nd),t.subVectors(nd,td)}setViewOffset(e,t,n,i,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ql*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,s=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Um extends Im{constructor(e=-1,t=1,n=1,i=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let s=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const ws=-90,As=1;class sv extends Kn{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new ai(ws,As,e,t);i.layers=this.layers,this.add(i);const s=new ai(ws,As,e,t);s.layers=this.layers,this.add(s);const a=new ai(ws,As,e,t);a.layers=this.layers,this.add(a);const o=new ai(ws,As,e,t);o.layers=this.layers,this.add(o);const l=new ai(ws,As,e,t);l.layers=this.layers,this.add(l);const c=new ai(ws,As,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,s,a,o,l]=t;for(const c of t)this.remove(c);if(e===Di)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===vl)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,u]=this.children,d=e.getRenderTarget(),f=e.getActiveCubeFace(),h=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(n,0,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,1,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=g,e.setRenderTarget(n,5,i),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,f,h),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}}class av extends ai{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function id(r,e,t,n){const i=ov(n);switch(t){case Mm:return r*e;case bm:return r*e/i.components*i.byteLength;case wf:return r*e/i.components*i.byteLength;case Zs:return r*e*2/i.components*i.byteLength;case Af:return r*e*2/i.components*i.byteLength;case ym:return r*e*3/i.components*i.byteLength;case xi:return r*e*4/i.components*i.byteLength;case Cf:return r*e*4/i.components*i.byteLength;case nl:case il:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case rl:case sl:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case du:case mu:return Math.max(r,16)*Math.max(e,8)/4;case hu:case pu:return Math.max(r,8)*Math.max(e,8)/2;case _u:case gu:case vu:case Su:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case xu:case Mu:case yu:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case bu:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Eu:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case Tu:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case wu:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case Au:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Cu:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Ru:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case Pu:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Du:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Lu:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case Nu:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case Iu:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case Uu:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case Fu:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Ou:case Bu:case ku:return Math.ceil(r/4)*Math.ceil(e/4)*16;case zu:case Vu:return Math.ceil(r/4)*Math.ceil(e/4)*8;case Hu:case Gu:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ov(r){switch(r){case oi:case gm:return{byteLength:1,components:1};case ja:case xm:case nr:return{byteLength:2,components:1};case Ef:case Tf:return{byteLength:2,components:4};case Oi:case bf:case Pi:return{byteLength:4,components:1};case vm:case Sm:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:yf}}));typeof window<"u"&&(window.__THREE__?je("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=yf);function Fm(){let r=null,e=!1,t=null,n=null;function i(s,a){t(s,a),n=r.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=r.requestAnimationFrame(i),e=!0)},stop:function(){r.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function lv(r){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,d=c.byteLength,f=r.createBuffer();r.bindBuffer(l,f),r.bufferData(l,c,u),o.onUploadCallback();let h;if(c instanceof Float32Array)h=r.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)h=r.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?h=r.HALF_FLOAT:h=r.UNSIGNED_SHORT;else if(c instanceof Int16Array)h=r.SHORT;else if(c instanceof Uint32Array)h=r.UNSIGNED_INT;else if(c instanceof Int32Array)h=r.INT;else if(c instanceof Int8Array)h=r.BYTE;else if(c instanceof Uint8Array)h=r.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)h=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:h,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){const u=l.array,d=l.updateRanges;if(r.bindBuffer(c,o),d.length===0)r.bufferSubData(c,0,u);else{d.sort((h,_)=>h.start-_.start);let f=0;for(let h=1;h<d.length;h++){const _=d[f],g=d[h];g.start<=_.start+_.count+1?_.count=Math.max(_.count,g.start+g.count-_.start):(++f,d[f]=g)}d.length=f+1;for(let h=0,_=d.length;h<_;h++){const g=d[h];r.bufferSubData(c,g.start*u.BYTES_PER_ELEMENT,u,g.start,g.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(r.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:s,update:a}}var cv=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,uv=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,fv=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,hv=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,dv=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,pv=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,mv=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,_v=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,gv=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,xv=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,vv=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Sv=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Mv=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,yv=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bv=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ev=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Tv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,wv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Av=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Cv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Rv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Pv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Dv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Lv=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Nv=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Iv=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Uv=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Fv=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ov=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Bv=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,kv="gl_FragColor = linearToOutputTexel( gl_FragColor );",zv=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Vv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Hv=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Gv=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Wv=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Xv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,jv=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Yv=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,qv=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,$v=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Kv=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Zv=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Jv=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Qv=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,eS=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,tS=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,nS=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,iS=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,rS=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,sS=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,aS=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,oS=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lS=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,cS=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,uS=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,fS=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,hS=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dS=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,pS=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,mS=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,_S=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,gS=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,xS=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vS=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,SS=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,MS=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,yS=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,bS=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ES=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,TS=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wS=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,AS=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,CS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,RS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,PS=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,DS=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,LS=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,NS=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,IS=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,US=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,FS=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,OS=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,BS=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,kS=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,zS=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,VS=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,HS=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,GS=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,WS=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,XS=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,jS=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,YS=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,qS=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,$S=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,KS=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ZS=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,JS=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,QS=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,eM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tM=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,nM=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,iM=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,rM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,sM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,aM=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,oM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const lM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,cM=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,uM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fM=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,dM=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,mM=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,_M=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,gM=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,xM=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,vM=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,SM=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,MM=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,yM=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,bM=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,EM=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,TM=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wM=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,AM=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,CM=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,RM=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,PM=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,DM=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,LM=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,NM=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,IM=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,UM=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,FM=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,OM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,BM=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,kM=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,zM=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,VM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Qe={alphahash_fragment:cv,alphahash_pars_fragment:uv,alphamap_fragment:fv,alphamap_pars_fragment:hv,alphatest_fragment:dv,alphatest_pars_fragment:pv,aomap_fragment:mv,aomap_pars_fragment:_v,batching_pars_vertex:gv,batching_vertex:xv,begin_vertex:vv,beginnormal_vertex:Sv,bsdfs:Mv,iridescence_fragment:yv,bumpmap_pars_fragment:bv,clipping_planes_fragment:Ev,clipping_planes_pars_fragment:Tv,clipping_planes_pars_vertex:wv,clipping_planes_vertex:Av,color_fragment:Cv,color_pars_fragment:Rv,color_pars_vertex:Pv,color_vertex:Dv,common:Lv,cube_uv_reflection_fragment:Nv,defaultnormal_vertex:Iv,displacementmap_pars_vertex:Uv,displacementmap_vertex:Fv,emissivemap_fragment:Ov,emissivemap_pars_fragment:Bv,colorspace_fragment:kv,colorspace_pars_fragment:zv,envmap_fragment:Vv,envmap_common_pars_fragment:Hv,envmap_pars_fragment:Gv,envmap_pars_vertex:Wv,envmap_physical_pars_fragment:tS,envmap_vertex:Xv,fog_vertex:jv,fog_pars_vertex:Yv,fog_fragment:qv,fog_pars_fragment:$v,gradientmap_pars_fragment:Kv,lightmap_pars_fragment:Zv,lights_lambert_fragment:Jv,lights_lambert_pars_fragment:Qv,lights_pars_begin:eS,lights_toon_fragment:nS,lights_toon_pars_fragment:iS,lights_phong_fragment:rS,lights_phong_pars_fragment:sS,lights_physical_fragment:aS,lights_physical_pars_fragment:oS,lights_fragment_begin:lS,lights_fragment_maps:cS,lights_fragment_end:uS,logdepthbuf_fragment:fS,logdepthbuf_pars_fragment:hS,logdepthbuf_pars_vertex:dS,logdepthbuf_vertex:pS,map_fragment:mS,map_pars_fragment:_S,map_particle_fragment:gS,map_particle_pars_fragment:xS,metalnessmap_fragment:vS,metalnessmap_pars_fragment:SS,morphinstance_vertex:MS,morphcolor_vertex:yS,morphnormal_vertex:bS,morphtarget_pars_vertex:ES,morphtarget_vertex:TS,normal_fragment_begin:wS,normal_fragment_maps:AS,normal_pars_fragment:CS,normal_pars_vertex:RS,normal_vertex:PS,normalmap_pars_fragment:DS,clearcoat_normal_fragment_begin:LS,clearcoat_normal_fragment_maps:NS,clearcoat_pars_fragment:IS,iridescence_pars_fragment:US,opaque_fragment:FS,packing:OS,premultiplied_alpha_fragment:BS,project_vertex:kS,dithering_fragment:zS,dithering_pars_fragment:VS,roughnessmap_fragment:HS,roughnessmap_pars_fragment:GS,shadowmap_pars_fragment:WS,shadowmap_pars_vertex:XS,shadowmap_vertex:jS,shadowmask_pars_fragment:YS,skinbase_vertex:qS,skinning_pars_vertex:$S,skinning_vertex:KS,skinnormal_vertex:ZS,specularmap_fragment:JS,specularmap_pars_fragment:QS,tonemapping_fragment:eM,tonemapping_pars_fragment:tM,transmission_fragment:nM,transmission_pars_fragment:iM,uv_pars_fragment:rM,uv_pars_vertex:sM,uv_vertex:aM,worldpos_vertex:oM,background_vert:lM,background_frag:cM,backgroundCube_vert:uM,backgroundCube_frag:fM,cube_vert:hM,cube_frag:dM,depth_vert:pM,depth_frag:mM,distance_vert:_M,distance_frag:gM,equirect_vert:xM,equirect_frag:vM,linedashed_vert:SM,linedashed_frag:MM,meshbasic_vert:yM,meshbasic_frag:bM,meshlambert_vert:EM,meshlambert_frag:TM,meshmatcap_vert:wM,meshmatcap_frag:AM,meshnormal_vert:CM,meshnormal_frag:RM,meshphong_vert:PM,meshphong_frag:DM,meshphysical_vert:LM,meshphysical_frag:NM,meshtoon_vert:IM,meshtoon_frag:UM,points_vert:FM,points_frag:OM,shadow_vert:BM,shadow_frag:kM,sprite_vert:zM,sprite_frag:VM},ge={common:{diffuse:{value:new Mt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Je},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Je}},envmap:{envMap:{value:null},envMapRotation:{value:new Je},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Je}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Je}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Je},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Je},normalScale:{value:new dt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Je},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Je}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Je}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Je}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Mt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Mt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0},uvTransform:{value:new Je}},sprite:{diffuse:{value:new Mt(16777215)},opacity:{value:1},center:{value:new dt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Je},alphaMap:{value:null},alphaMapTransform:{value:new Je},alphaTest:{value:0}}},wi={basic:{uniforms:bn([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.fog]),vertexShader:Qe.meshbasic_vert,fragmentShader:Qe.meshbasic_frag},lambert:{uniforms:bn([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Mt(0)},envMapIntensity:{value:1}}]),vertexShader:Qe.meshlambert_vert,fragmentShader:Qe.meshlambert_frag},phong:{uniforms:bn([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Mt(0)},specular:{value:new Mt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphong_vert,fragmentShader:Qe.meshphong_frag},standard:{uniforms:bn([ge.common,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.roughnessmap,ge.metalnessmap,ge.fog,ge.lights,{emissive:{value:new Mt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag},toon:{uniforms:bn([ge.common,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.gradientmap,ge.fog,ge.lights,{emissive:{value:new Mt(0)}}]),vertexShader:Qe.meshtoon_vert,fragmentShader:Qe.meshtoon_frag},matcap:{uniforms:bn([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,{matcap:{value:null}}]),vertexShader:Qe.meshmatcap_vert,fragmentShader:Qe.meshmatcap_frag},points:{uniforms:bn([ge.points,ge.fog]),vertexShader:Qe.points_vert,fragmentShader:Qe.points_frag},dashed:{uniforms:bn([ge.common,ge.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qe.linedashed_vert,fragmentShader:Qe.linedashed_frag},depth:{uniforms:bn([ge.common,ge.displacementmap]),vertexShader:Qe.depth_vert,fragmentShader:Qe.depth_frag},normal:{uniforms:bn([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,{opacity:{value:1}}]),vertexShader:Qe.meshnormal_vert,fragmentShader:Qe.meshnormal_frag},sprite:{uniforms:bn([ge.sprite,ge.fog]),vertexShader:Qe.sprite_vert,fragmentShader:Qe.sprite_frag},background:{uniforms:{uvTransform:{value:new Je},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qe.background_vert,fragmentShader:Qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Je}},vertexShader:Qe.backgroundCube_vert,fragmentShader:Qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qe.cube_vert,fragmentShader:Qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qe.equirect_vert,fragmentShader:Qe.equirect_frag},distance:{uniforms:bn([ge.common,ge.displacementmap,{referencePosition:{value:new j},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qe.distance_vert,fragmentShader:Qe.distance_frag},shadow:{uniforms:bn([ge.lights,ge.fog,{color:{value:new Mt(0)},opacity:{value:1}}]),vertexShader:Qe.shadow_vert,fragmentShader:Qe.shadow_frag}};wi.physical={uniforms:bn([wi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Je},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Je},clearcoatNormalScale:{value:new dt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Je},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Je},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Je},sheen:{value:0},sheenColor:{value:new Mt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Je},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Je},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Je},transmissionSamplerSize:{value:new dt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Je},attenuationDistance:{value:0},attenuationColor:{value:new Mt(0)},specularColor:{value:new Mt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Je},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Je},anisotropyVector:{value:new dt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Je}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag};const Wo={r:0,b:0,g:0},Br=new rr,HM=new Wt;function GM(r,e,t,n,i,s){const a=new Mt(0);let o=i===!0?0:1,l,c,u=null,d=0,f=null;function h(v){let b=v.isScene===!0?v.background:null;if(b&&b.isTexture){const S=v.backgroundBlurriness>0;b=e.get(b,S)}return b}function _(v){let b=!1;const S=h(v);S===null?p(a,o):S&&S.isColor&&(p(S,1),b=!0);const w=r.xr.getEnvironmentBlendMode();w==="additive"?t.buffers.color.setClear(0,0,0,1,s):w==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(r.autoClear||b)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function g(v,b){const S=h(b);S&&(S.isCubeTexture||S.mapping===Rl)?(c===void 0&&(c=new vi(new Qa(1,1,1),new Si({name:"BackgroundCubeMaterial",uniforms:Qs(wi.backgroundCube.uniforms),vertexShader:wi.backgroundCube.vertexShader,fragmentShader:wi.backgroundCube.fragmentShader,side:Fn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(w,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),Br.copy(b.backgroundRotation),Br.x*=-1,Br.y*=-1,Br.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(Br.y*=-1,Br.z*=-1),c.material.uniforms.envMap.value=S,c.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,c.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(HM.makeRotationFromEuler(Br)),c.material.toneMapped=ct.getTransfer(S.colorSpace)!==xt,(u!==S||d!==S.version||f!==r.toneMapping)&&(c.material.needsUpdate=!0,u=S,d=S.version,f=r.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new vi(new Dl(2,2),new Si({name:"BackgroundMaterial",uniforms:Qs(wi.background.uniforms),vertexShader:wi.background.vertexShader,fragmentShader:wi.background.fragmentShader,side:Rr,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=ct.getTransfer(S.colorSpace)!==xt,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||d!==S.version||f!==r.toneMapping)&&(l.material.needsUpdate=!0,u=S,d=S.version,f=r.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}function p(v,b){v.getRGB(Wo,Nm(r)),t.buffers.color.setClear(Wo.r,Wo.g,Wo.b,b,s)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(v,b=1){a.set(v),o=b,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(v){o=v,p(a,o)},render:_,addToRenderList:g,dispose:m}}function WM(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),n={},i=f(null);let s=i,a=!1;function o(P,I,k,V,H){let z=!1;const B=d(P,V,k,I);s!==B&&(s=B,c(s.object)),z=h(P,V,k,H),z&&_(P,V,k,H),H!==null&&e.update(H,r.ELEMENT_ARRAY_BUFFER),(z||a)&&(a=!1,S(P,I,k,V),H!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return r.createVertexArray()}function c(P){return r.bindVertexArray(P)}function u(P){return r.deleteVertexArray(P)}function d(P,I,k,V){const H=V.wireframe===!0;let z=n[I.id];z===void 0&&(z={},n[I.id]=z);const B=P.isInstancedMesh===!0?P.id:0;let Q=z[B];Q===void 0&&(Q={},z[B]=Q);let ee=Q[k.id];ee===void 0&&(ee={},Q[k.id]=ee);let L=ee[H];return L===void 0&&(L=f(l()),ee[H]=L),L}function f(P){const I=[],k=[],V=[];for(let H=0;H<t;H++)I[H]=0,k[H]=0,V[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:k,attributeDivisors:V,object:P,attributes:{},index:null}}function h(P,I,k,V){const H=s.attributes,z=I.attributes;let B=0;const Q=k.getAttributes();for(const ee in Q)if(Q[ee].location>=0){const ce=H[ee];let ue=z[ee];if(ue===void 0&&(ee==="instanceMatrix"&&P.instanceMatrix&&(ue=P.instanceMatrix),ee==="instanceColor"&&P.instanceColor&&(ue=P.instanceColor)),ce===void 0||ce.attribute!==ue||ue&&ce.data!==ue.data)return!0;B++}return s.attributesNum!==B||s.index!==V}function _(P,I,k,V){const H={},z=I.attributes;let B=0;const Q=k.getAttributes();for(const ee in Q)if(Q[ee].location>=0){let ce=z[ee];ce===void 0&&(ee==="instanceMatrix"&&P.instanceMatrix&&(ce=P.instanceMatrix),ee==="instanceColor"&&P.instanceColor&&(ce=P.instanceColor));const ue={};ue.attribute=ce,ce&&ce.data&&(ue.data=ce.data),H[ee]=ue,B++}s.attributes=H,s.attributesNum=B,s.index=V}function g(){const P=s.newAttributes;for(let I=0,k=P.length;I<k;I++)P[I]=0}function p(P){m(P,0)}function m(P,I){const k=s.newAttributes,V=s.enabledAttributes,H=s.attributeDivisors;k[P]=1,V[P]===0&&(r.enableVertexAttribArray(P),V[P]=1),H[P]!==I&&(r.vertexAttribDivisor(P,I),H[P]=I)}function v(){const P=s.newAttributes,I=s.enabledAttributes;for(let k=0,V=I.length;k<V;k++)I[k]!==P[k]&&(r.disableVertexAttribArray(k),I[k]=0)}function b(P,I,k,V,H,z,B){B===!0?r.vertexAttribIPointer(P,I,k,H,z):r.vertexAttribPointer(P,I,k,V,H,z)}function S(P,I,k,V){g();const H=V.attributes,z=k.getAttributes(),B=I.defaultAttributeValues;for(const Q in z){const ee=z[Q];if(ee.location>=0){let L=H[Q];if(L===void 0&&(Q==="instanceMatrix"&&P.instanceMatrix&&(L=P.instanceMatrix),Q==="instanceColor"&&P.instanceColor&&(L=P.instanceColor)),L!==void 0){const ce=L.normalized,ue=L.itemSize,ke=e.get(L);if(ke===void 0)continue;const He=ke.buffer,Ye=ke.type,K=ke.bytesPerElement,te=Ye===r.INT||Ye===r.UNSIGNED_INT||L.gpuType===bf;if(L.isInterleavedBufferAttribute){const se=L.data,Ne=se.stride,Ie=L.offset;if(se.isInstancedInterleavedBuffer){for(let Re=0;Re<ee.locationSize;Re++)m(ee.location+Re,se.meshPerAttribute);P.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let Re=0;Re<ee.locationSize;Re++)p(ee.location+Re);r.bindBuffer(r.ARRAY_BUFFER,He);for(let Re=0;Re<ee.locationSize;Re++)b(ee.location+Re,ue/ee.locationSize,Ye,ce,Ne*K,(Ie+ue/ee.locationSize*Re)*K,te)}else{if(L.isInstancedBufferAttribute){for(let se=0;se<ee.locationSize;se++)m(ee.location+se,L.meshPerAttribute);P.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=L.meshPerAttribute*L.count)}else for(let se=0;se<ee.locationSize;se++)p(ee.location+se);r.bindBuffer(r.ARRAY_BUFFER,He);for(let se=0;se<ee.locationSize;se++)b(ee.location+se,ue/ee.locationSize,Ye,ce,ue*K,ue/ee.locationSize*se*K,te)}}else if(B!==void 0){const ce=B[Q];if(ce!==void 0)switch(ce.length){case 2:r.vertexAttrib2fv(ee.location,ce);break;case 3:r.vertexAttrib3fv(ee.location,ce);break;case 4:r.vertexAttrib4fv(ee.location,ce);break;default:r.vertexAttrib1fv(ee.location,ce)}}}}v()}function w(){y();for(const P in n){const I=n[P];for(const k in I){const V=I[k];for(const H in V){const z=V[H];for(const B in z)u(z[B].object),delete z[B];delete V[H]}}delete n[P]}}function E(P){if(n[P.id]===void 0)return;const I=n[P.id];for(const k in I){const V=I[k];for(const H in V){const z=V[H];for(const B in z)u(z[B].object),delete z[B];delete V[H]}}delete n[P.id]}function A(P){for(const I in n){const k=n[I];for(const V in k){const H=k[V];if(H[P.id]===void 0)continue;const z=H[P.id];for(const B in z)u(z[B].object),delete z[B];delete H[P.id]}}}function x(P){for(const I in n){const k=n[I],V=P.isInstancedMesh===!0?P.id:0,H=k[V];if(H!==void 0){for(const z in H){const B=H[z];for(const Q in B)u(B[Q].object),delete B[Q];delete H[z]}delete k[V],Object.keys(k).length===0&&delete n[I]}}}function y(){D(),a=!0,s!==i&&(s=i,c(s.object))}function D(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:y,resetDefaultState:D,dispose:w,releaseStatesOfGeometry:E,releaseStatesOfObject:x,releaseStatesOfProgram:A,initAttributes:g,enableAttribute:p,disableUnusedAttributes:v}}function XM(r,e,t){let n;function i(c){n=c}function s(c,u){r.drawArrays(n,c,u),t.update(u,n,1)}function a(c,u,d){d!==0&&(r.drawArraysInstanced(n,c,u,d),t.update(u,n,d))}function o(c,u,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,d);let h=0;for(let _=0;_<d;_++)h+=u[_];t.update(h,n,1)}function l(c,u,d,f){if(d===0)return;const h=e.get("WEBGL_multi_draw");if(h===null)for(let _=0;_<c.length;_++)a(c[_],u[_],f[_]);else{h.multiDrawArraysInstancedWEBGL(n,c,0,u,0,f,0,d);let _=0;for(let g=0;g<d;g++)_+=u[g]*f[g];t.update(_,n,1)}}this.setMode=i,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function jM(r,e,t,n){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");i=r.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(A){return!(A!==xi&&n.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const x=A===nr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==oi&&n.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Pi&&!x)}function l(A){if(A==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(je("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const d=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),_=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_TEXTURE_SIZE),p=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),m=r.getParameter(r.MAX_VERTEX_ATTRIBS),v=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),b=r.getParameter(r.MAX_VARYING_VECTORS),S=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),w=r.getParameter(r.MAX_SAMPLES),E=r.getParameter(r.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:h,maxVertexTextures:_,maxTextureSize:g,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:v,maxVaryings:b,maxFragmentUniforms:S,maxSamples:w,samples:E}}function YM(r){const e=this;let t=null,n=0,i=!1,s=!1;const a=new Gr,o=new Je,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){const h=d.length!==0||f||n!==0||i;return i=f,n=d.length,h},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,f){t=u(d,f,0)},this.setState=function(d,f,h){const _=d.clippingPlanes,g=d.clipIntersection,p=d.clipShadows,m=r.get(d);if(!i||_===null||_.length===0||s&&!p)s?u(null):c();else{const v=s?0:n,b=v*4;let S=m.clippingState||null;l.value=S,S=u(_,f,b,h);for(let w=0;w!==b;++w)S[w]=t[w];m.clippingState=S,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,f,h,_){const g=d!==null?d.length:0;let p=null;if(g!==0){if(p=l.value,_!==!0||p===null){const m=h+g*4,v=f.matrixWorldInverse;o.getNormalMatrix(v),(p===null||p.length<m)&&(p=new Float32Array(m));for(let b=0,S=h;b!==g;++b,S+=4)a.copy(d[b]).applyMatrix4(v,o),a.normal.toArray(p,S),p[S+3]=a.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,p}}const Mr=4,rd=[.125,.215,.35,.446,.526,.582],Xr=20,qM=256,fa=new Um,sd=new Mt;let bc=null,Ec=0,Tc=0,wc=!1;const $M=new j;class ad{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,i=100,s={}){const{size:a=256,position:o=$M}=s;bc=this._renderer.getRenderTarget(),Ec=this._renderer.getActiveCubeFace(),Tc=this._renderer.getActiveMipmapLevel(),wc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,i,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=cd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ld(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(bc,Ec,Tc),this._renderer.xr.enabled=wc,e.scissorTest=!1,Cs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===as||e.mapping===Ks?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),bc=this._renderer.getRenderTarget(),Ec=this._renderer.getActiveCubeFace(),Tc=this._renderer.getActiveMipmapLevel(),wc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:vn,minFilter:vn,generateMipmaps:!1,type:nr,format:xi,colorSpace:Js,depthBuffer:!1},i=od(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=od(e,t,n);const{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=KM(s)),this._blurMaterial=JM(s,e,t),this._ggxMaterial=ZM(s,e,t)}return i}_compileMaterial(e){const t=new vi(new Bi,e);this._renderer.compile(t,fa)}_sceneToCubeUV(e,t,n,i,s){const l=new ai(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,f=d.autoClear,h=d.toneMapping;d.getClearColor(sd),d.toneMapping=Ni,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(i),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new vi(new Qa,new Nf({name:"PMREM.Background",side:Fn,depthWrite:!1,depthTest:!1})));const g=this._backgroundBox,p=g.material;let m=!1;const v=e.background;v?v.isColor&&(p.color.copy(v),e.background=null,m=!0):(p.color.copy(sd),m=!0);for(let b=0;b<6;b++){const S=b%3;S===0?(l.up.set(0,c[b],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+u[b],s.y,s.z)):S===1?(l.up.set(0,0,c[b]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+u[b],s.z)):(l.up.set(0,c[b],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+u[b]));const w=this._cubeSize;Cs(i,S*w,b>2?w:0,w,w),d.setRenderTarget(i),m&&d.render(g,l),d.render(e,l)}d.toneMapping=h,d.autoClear=f,e.background=v}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===as||e.mapping===Ks;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=cd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ld());const s=i?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=s;const o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;Cs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,fa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodMeshes.length;for(let s=1;s<i;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=n}_applyGGXFilter(e,t,n){const i=this._renderer,s=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;const l=a.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-u*u),f=0+c*1.25,h=d*f,{_lodMax:_}=this,g=this._sizeLods[n],p=3*g*(n>_-Mr?n-_+Mr:0),m=4*(this._cubeSize-g);l.envMap.value=e.texture,l.roughness.value=h,l.mipInt.value=_-t,Cs(s,p,m,3*g,2*g),i.setRenderTarget(s),i.render(o,fa),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=_-n,Cs(e,p,m,3*g,2*g),i.setRenderTarget(e),i.render(o,fa)}_blur(e,t,n,i,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",s),this._halfBlur(a,e,n,n,i,"longitudinal",s)}_halfBlur(e,t,n,i,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&ht("blur direction must be either latitudinal or longitudinal!");const u=3,d=this._lodMeshes[i];d.material=c;const f=c.uniforms,h=this._sizeLods[n]-1,_=isFinite(s)?Math.PI/(2*h):2*Math.PI/(2*Xr-1),g=s/_,p=isFinite(s)?1+Math.floor(u*g):Xr;p>Xr&&je(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Xr}`);const m=[];let v=0;for(let A=0;A<Xr;++A){const x=A/g,y=Math.exp(-x*x/2);m.push(y),A===0?v+=y:A<p&&(v+=2*y)}for(let A=0;A<m.length;A++)m[A]=m[A]/v;f.envMap.value=e.texture,f.samples.value=p,f.weights.value=m,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:b}=this;f.dTheta.value=_,f.mipInt.value=b-n;const S=this._sizeLods[i],w=3*S*(i>b-Mr?i-b+Mr:0),E=4*(this._cubeSize-S);Cs(t,w,E,3*S,2*S),l.setRenderTarget(t),l.render(d,fa)}}function KM(r){const e=[],t=[],n=[];let i=r;const s=r-Mr+1+rd.length;for(let a=0;a<s;a++){const o=Math.pow(2,i);e.push(o);let l=1/o;a>r-Mr?l=rd[a-r+Mr-1]:a===0&&(l=0),t.push(l);const c=1/(o-2),u=-c,d=1+c,f=[u,u,d,u,d,d,u,u,d,d,u,d],h=6,_=6,g=3,p=2,m=1,v=new Float32Array(g*_*h),b=new Float32Array(p*_*h),S=new Float32Array(m*_*h);for(let E=0;E<h;E++){const A=E%3*2/3-1,x=E>2?0:-1,y=[A,x,0,A+2/3,x,0,A+2/3,x+1,0,A,x,0,A+2/3,x+1,0,A,x+1,0];v.set(y,g*_*E),b.set(f,p*_*E);const D=[E,E,E,E,E,E];S.set(D,m*_*E)}const w=new Bi;w.setAttribute("position",new Ui(v,g)),w.setAttribute("uv",new Ui(b,p)),w.setAttribute("faceIndex",new Ui(S,m)),n.push(new vi(w,null)),i>Mr&&i--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function od(r,e,t){const n=new Ii(r,e,t);return n.texture.mapping=Rl,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Cs(r,e,t,n,i){r.viewport.set(e,t,n,i),r.scissor.set(e,t,n,i)}function ZM(r,e,t){return new Si({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:qM,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ll(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Ji,depthTest:!1,depthWrite:!1})}function JM(r,e,t){const n=new Float32Array(Xr),i=new j(0,1,0);return new Si({name:"SphericalGaussianBlur",defines:{n:Xr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Ll(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ji,depthTest:!1,depthWrite:!1})}function ld(){return new Si({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ll(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ji,depthTest:!1,depthWrite:!1})}function cd(){return new Si({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ll(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ji,depthTest:!1,depthWrite:!1})}function Ll(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class Om extends Ii{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Dm(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Qa(5,5,5),s=new Si({name:"CubemapFromEquirect",uniforms:Qs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Fn,blending:Ji});s.uniforms.tEquirect.value=t;const a=new vi(i,s),o=t.minFilter;return t.minFilter===qr&&(t.minFilter=vn),new sv(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(s)}}function QM(r){let e=new WeakMap,t=new WeakMap,n=null;function i(f,h=!1){return f==null?null:h?a(f):s(f)}function s(f){if(f&&f.isTexture){const h=f.mapping;if(h===Kl||h===Zl)if(e.has(f)){const _=e.get(f).texture;return o(_,f.mapping)}else{const _=f.image;if(_&&_.height>0){const g=new Om(_.height);return g.fromEquirectangularTexture(r,f),e.set(f,g),f.addEventListener("dispose",c),o(g.texture,f.mapping)}else return null}}return f}function a(f){if(f&&f.isTexture){const h=f.mapping,_=h===Kl||h===Zl,g=h===as||h===Ks;if(_||g){let p=t.get(f);const m=p!==void 0?p.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==m)return n===null&&(n=new ad(r)),p=_?n.fromEquirectangular(f,p):n.fromCubemap(f,p),p.texture.pmremVersion=f.pmremVersion,t.set(f,p),p.texture;if(p!==void 0)return p.texture;{const v=f.image;return _&&v&&v.height>0||g&&v&&l(v)?(n===null&&(n=new ad(r)),p=_?n.fromEquirectangular(f):n.fromCubemap(f),p.texture.pmremVersion=f.pmremVersion,t.set(f,p),f.addEventListener("dispose",u),p.texture):null}}}return f}function o(f,h){return h===Kl?f.mapping=as:h===Zl&&(f.mapping=Ks),f}function l(f){let h=0;const _=6;for(let g=0;g<_;g++)f[g]!==void 0&&h++;return h===_}function c(f){const h=f.target;h.removeEventListener("dispose",c);const _=e.get(h);_!==void 0&&(e.delete(h),_.dispose())}function u(f){const h=f.target;h.removeEventListener("dispose",u);const _=t.get(h);_!==void 0&&(t.delete(h),_.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:d}}function ey(r){const e={};function t(n){if(e[n]!==void 0)return e[n];const i=r.getExtension(n);return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&Ml("WebGLRenderer: "+n+" extension not supported."),i}}}function ty(r,e,t,n){const i={},s=new WeakMap;function a(d){const f=d.target;f.index!==null&&e.remove(f.index);for(const _ in f.attributes)e.remove(f.attributes[_]);f.removeEventListener("dispose",a),delete i[f.id];const h=s.get(f);h&&(e.remove(h),s.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(d,f){return i[f.id]===!0||(f.addEventListener("dispose",a),i[f.id]=!0,t.memory.geometries++),f}function l(d){const f=d.attributes;for(const h in f)e.update(f[h],r.ARRAY_BUFFER)}function c(d){const f=[],h=d.index,_=d.attributes.position;let g=0;if(_===void 0)return;if(h!==null){const v=h.array;g=h.version;for(let b=0,S=v.length;b<S;b+=3){const w=v[b+0],E=v[b+1],A=v[b+2];f.push(w,E,E,A,A,w)}}else{const v=_.array;g=_.version;for(let b=0,S=v.length/3-1;b<S;b+=3){const w=b+0,E=b+1,A=b+2;f.push(w,E,E,A,A,w)}}const p=new(_.count>=65535?Rm:Cm)(f,1);p.version=g;const m=s.get(d);m&&e.remove(m),s.set(d,p)}function u(d){const f=s.get(d);if(f){const h=d.index;h!==null&&f.version<h.version&&c(d)}else c(d);return s.get(d)}return{get:o,update:l,getWireframeAttribute:u}}function ny(r,e,t){let n;function i(f){n=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function l(f,h){r.drawElements(n,h,s,f*a),t.update(h,n,1)}function c(f,h,_){_!==0&&(r.drawElementsInstanced(n,h,s,f*a,_),t.update(h,n,_))}function u(f,h,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,s,f,0,_);let p=0;for(let m=0;m<_;m++)p+=h[m];t.update(p,n,1)}function d(f,h,_,g){if(_===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let m=0;m<f.length;m++)c(f[m]/a,h[m],g[m]);else{p.multiDrawElementsInstancedWEBGL(n,h,0,s,f,0,g,0,_);let m=0;for(let v=0;v<_;v++)m+=h[v]*g[v];t.update(m,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function iy(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case r.TRIANGLES:t.triangles+=o*(s/3);break;case r.LINES:t.lines+=o*(s/2);break;case r.LINE_STRIP:t.lines+=o*(s-1);break;case r.LINE_LOOP:t.lines+=o*s;break;case r.POINTS:t.points+=o*s;break;default:ht("WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function ry(r,e,t){const n=new WeakMap,i=new kt;function s(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0;let f=n.get(o);if(f===void 0||f.count!==d){let y=function(){A.dispose(),n.delete(o),o.removeEventListener("dispose",y)};f!==void 0&&f.texture.dispose();const h=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],v=o.morphAttributes.color||[];let b=0;h===!0&&(b=1),_===!0&&(b=2),g===!0&&(b=3);let S=o.attributes.position.count*b,w=1;S>e.maxTextureSize&&(w=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const E=new Float32Array(S*w*4*d),A=new Tm(E,S,w,d);A.type=Pi,A.needsUpdate=!0;const x=b*4;for(let D=0;D<d;D++){const P=p[D],I=m[D],k=v[D],V=S*w*4*D;for(let H=0;H<P.count;H++){const z=H*x;h===!0&&(i.fromBufferAttribute(P,H),E[V+z+0]=i.x,E[V+z+1]=i.y,E[V+z+2]=i.z,E[V+z+3]=0),_===!0&&(i.fromBufferAttribute(I,H),E[V+z+4]=i.x,E[V+z+5]=i.y,E[V+z+6]=i.z,E[V+z+7]=0),g===!0&&(i.fromBufferAttribute(k,H),E[V+z+8]=i.x,E[V+z+9]=i.y,E[V+z+10]=i.z,E[V+z+11]=k.itemSize===4?i.w:1)}}f={count:d,texture:A,size:new dt(S,w)},n.set(o,f),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(r,"morphTexture",a.morphTexture,t);else{let h=0;for(let g=0;g<c.length;g++)h+=c[g];const _=o.morphTargetsRelative?1:1-h;l.getUniforms().setValue(r,"morphTargetBaseInfluence",_),l.getUniforms().setValue(r,"morphTargetInfluences",c)}l.getUniforms().setValue(r,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(r,"morphTargetsTextureSize",f.size)}return{update:s}}function sy(r,e,t,n,i){let s=new WeakMap;function a(c){const u=i.render.frame,d=c.geometry,f=e.get(c,d);if(s.get(f)!==u&&(e.update(f),s.set(f,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==u&&(t.update(c.instanceMatrix,r.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,r.ARRAY_BUFFER),s.set(c,u))),c.isSkinnedMesh){const h=c.skeleton;s.get(h)!==u&&(h.update(),s.set(h,u))}return f}function o(){s=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const ay={[cm]:"LINEAR_TONE_MAPPING",[um]:"REINHARD_TONE_MAPPING",[fm]:"CINEON_TONE_MAPPING",[hm]:"ACES_FILMIC_TONE_MAPPING",[pm]:"AGX_TONE_MAPPING",[mm]:"NEUTRAL_TONE_MAPPING",[dm]:"CUSTOM_TONE_MAPPING"};function oy(r,e,t,n,i){const s=new Ii(e,t,{type:r,depthBuffer:n,stencilBuffer:i}),a=new Ii(e,t,{type:nr,depthBuffer:!1,stencilBuffer:!1}),o=new Bi;o.setAttribute("position",new fi([-1,3,0,-1,-1,0,3,-1,0],3)),o.setAttribute("uv",new fi([0,2,0,0,2,0],2));const l=new nv({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new vi(o,l),u=new Um(-1,1,1,-1,0,1);let d=null,f=null,h=!1,_,g=null,p=[],m=!1;this.setSize=function(v,b){s.setSize(v,b),a.setSize(v,b);for(let S=0;S<p.length;S++){const w=p[S];w.setSize&&w.setSize(v,b)}},this.setEffects=function(v){p=v,m=p.length>0&&p[0].isRenderPass===!0;const b=s.width,S=s.height;for(let w=0;w<p.length;w++){const E=p[w];E.setSize&&E.setSize(b,S)}},this.begin=function(v,b){if(h||v.toneMapping===Ni&&p.length===0)return!1;if(g=b,b!==null){const S=b.width,w=b.height;(s.width!==S||s.height!==w)&&this.setSize(S,w)}return m===!1&&v.setRenderTarget(s),_=v.toneMapping,v.toneMapping=Ni,!0},this.hasRenderPass=function(){return m},this.end=function(v,b){v.toneMapping=_,h=!0;let S=s,w=a;for(let E=0;E<p.length;E++){const A=p[E];if(A.enabled!==!1&&(A.render(v,w,S,b),A.needsSwap!==!1)){const x=S;S=w,w=x}}if(d!==v.outputColorSpace||f!==v.toneMapping){d=v.outputColorSpace,f=v.toneMapping,l.defines={},ct.getTransfer(d)===xt&&(l.defines.SRGB_TRANSFER="");const E=ay[f];E&&(l.defines[E]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=S.texture,v.setRenderTarget(g),v.render(c,u),g=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){s.dispose(),a.dispose(),o.dispose(),l.dispose()}}const Bm=new Rn,Xu=new qa(1,1),km=new Tm,zm=new Lx,Vm=new Dm,ud=[],fd=[],hd=new Float32Array(16),dd=new Float32Array(9),pd=new Float32Array(4);function na(r,e,t){const n=r[0];if(n<=0||n>0)return r;const i=e*t;let s=ud[i];if(s===void 0&&(s=new Float32Array(i),ud[i]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function Kt(r,e){if(r.length!==e.length)return!1;for(let t=0,n=r.length;t<n;t++)if(r[t]!==e[t])return!1;return!0}function Zt(r,e){for(let t=0,n=e.length;t<n;t++)r[t]=e[t]}function Nl(r,e){let t=fd[e];t===void 0&&(t=new Int32Array(e),fd[e]=t);for(let n=0;n!==e;++n)t[n]=r.allocateTextureUnit();return t}function ly(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function cy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Kt(t,e))return;r.uniform2fv(this.addr,e),Zt(t,e)}}function uy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Kt(t,e))return;r.uniform3fv(this.addr,e),Zt(t,e)}}function fy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Kt(t,e))return;r.uniform4fv(this.addr,e),Zt(t,e)}}function hy(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Kt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Zt(t,e)}else{if(Kt(t,n))return;pd.set(n),r.uniformMatrix2fv(this.addr,!1,pd),Zt(t,n)}}function dy(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Kt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Zt(t,e)}else{if(Kt(t,n))return;dd.set(n),r.uniformMatrix3fv(this.addr,!1,dd),Zt(t,n)}}function py(r,e){const t=this.cache,n=e.elements;if(n===void 0){if(Kt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Zt(t,e)}else{if(Kt(t,n))return;hd.set(n),r.uniformMatrix4fv(this.addr,!1,hd),Zt(t,n)}}function my(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function _y(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Kt(t,e))return;r.uniform2iv(this.addr,e),Zt(t,e)}}function gy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Kt(t,e))return;r.uniform3iv(this.addr,e),Zt(t,e)}}function xy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Kt(t,e))return;r.uniform4iv(this.addr,e),Zt(t,e)}}function vy(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function Sy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Kt(t,e))return;r.uniform2uiv(this.addr,e),Zt(t,e)}}function My(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Kt(t,e))return;r.uniform3uiv(this.addr,e),Zt(t,e)}}function yy(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Kt(t,e))return;r.uniform4uiv(this.addr,e),Zt(t,e)}}function by(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i);let s;this.type===r.SAMPLER_2D_SHADOW?(Xu.compareFunction=t.isReversedDepthBuffer()?Pf:Rf,s=Xu):s=Bm,t.setTexture2D(e||s,i)}function Ey(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||zm,i)}function Ty(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Vm,i)}function wy(r,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(r.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||km,i)}function Ay(r){switch(r){case 5126:return ly;case 35664:return cy;case 35665:return uy;case 35666:return fy;case 35674:return hy;case 35675:return dy;case 35676:return py;case 5124:case 35670:return my;case 35667:case 35671:return _y;case 35668:case 35672:return gy;case 35669:case 35673:return xy;case 5125:return vy;case 36294:return Sy;case 36295:return My;case 36296:return yy;case 35678:case 36198:case 36298:case 36306:case 35682:return by;case 35679:case 36299:case 36307:return Ey;case 35680:case 36300:case 36308:case 36293:return Ty;case 36289:case 36303:case 36311:case 36292:return wy}}function Cy(r,e){r.uniform1fv(this.addr,e)}function Ry(r,e){const t=na(e,this.size,2);r.uniform2fv(this.addr,t)}function Py(r,e){const t=na(e,this.size,3);r.uniform3fv(this.addr,t)}function Dy(r,e){const t=na(e,this.size,4);r.uniform4fv(this.addr,t)}function Ly(r,e){const t=na(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function Ny(r,e){const t=na(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function Iy(r,e){const t=na(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function Uy(r,e){r.uniform1iv(this.addr,e)}function Fy(r,e){r.uniform2iv(this.addr,e)}function Oy(r,e){r.uniform3iv(this.addr,e)}function By(r,e){r.uniform4iv(this.addr,e)}function ky(r,e){r.uniform1uiv(this.addr,e)}function zy(r,e){r.uniform2uiv(this.addr,e)}function Vy(r,e){r.uniform3uiv(this.addr,e)}function Hy(r,e){r.uniform4uiv(this.addr,e)}function Gy(r,e,t){const n=this.cache,i=e.length,s=Nl(t,i);Kt(n,s)||(r.uniform1iv(this.addr,s),Zt(n,s));let a;this.type===r.SAMPLER_2D_SHADOW?a=Xu:a=Bm;for(let o=0;o!==i;++o)t.setTexture2D(e[o]||a,s[o])}function Wy(r,e,t){const n=this.cache,i=e.length,s=Nl(t,i);Kt(n,s)||(r.uniform1iv(this.addr,s),Zt(n,s));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||zm,s[a])}function Xy(r,e,t){const n=this.cache,i=e.length,s=Nl(t,i);Kt(n,s)||(r.uniform1iv(this.addr,s),Zt(n,s));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||Vm,s[a])}function jy(r,e,t){const n=this.cache,i=e.length,s=Nl(t,i);Kt(n,s)||(r.uniform1iv(this.addr,s),Zt(n,s));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||km,s[a])}function Yy(r){switch(r){case 5126:return Cy;case 35664:return Ry;case 35665:return Py;case 35666:return Dy;case 35674:return Ly;case 35675:return Ny;case 35676:return Iy;case 5124:case 35670:return Uy;case 35667:case 35671:return Fy;case 35668:case 35672:return Oy;case 35669:case 35673:return By;case 5125:return ky;case 36294:return zy;case 36295:return Vy;case 36296:return Hy;case 35678:case 36198:case 36298:case 36306:case 35682:return Gy;case 35679:case 36299:case 36307:return Wy;case 35680:case 36300:case 36308:case 36293:return Xy;case 36289:case 36303:case 36311:case 36292:return jy}}class qy{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ay(t.type)}}class $y{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Yy(t.type)}}class Ky{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let s=0,a=i.length;s!==a;++s){const o=i[s];o.setValue(e,t[o.id],n)}}}const Ac=/(\w+)(\])?(\[|\.)?/g;function md(r,e){r.seq.push(e),r.map[e.id]=e}function Zy(r,e,t){const n=r.name,i=n.length;for(Ac.lastIndex=0;;){const s=Ac.exec(n),a=Ac.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){md(t,c===void 0?new qy(o,r,e):new $y(o,r,e));break}else{let d=t.map[o];d===void 0&&(d=new Ky(o),md(t,d)),t=d}}}class al{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Zy(o,l,this)}const i=[],s=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(a):s.push(a);i.length>0&&(this.seq=i.concat(s))}setValue(e,t,n,i){const s=this.map[t];s!==void 0&&s.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let s=0,a=t.length;s!==a;++s){const o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,s=e.length;i!==s;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function _d(r,e,t){const n=r.createShader(e);return r.shaderSource(n,t),r.compileShader(n),n}const Jy=37297;let Qy=0;function eb(r,e){const t=r.split(`
`),n=[],i=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=i;a<s;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const gd=new Je;function tb(r){ct._getMatrix(gd,ct.workingColorSpace,r);const e=`mat3( ${gd.elements.map(t=>t.toFixed(4))} )`;switch(ct.getTransfer(r)){case xl:return[e,"LinearTransferOETF"];case xt:return[e,"sRGBTransferOETF"];default:return je("WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function xd(r,e,t){const n=r.getShaderParameter(e,r.COMPILE_STATUS),s=(r.getShaderInfoLog(e)||"").trim();if(n&&s==="")return"";const a=/ERROR: 0:(\d+)/.exec(s);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+eb(r.getShaderSource(e),o)}else return s}function nb(r,e){const t=tb(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const ib={[cm]:"Linear",[um]:"Reinhard",[fm]:"Cineon",[hm]:"ACESFilmic",[pm]:"AgX",[mm]:"Neutral",[dm]:"Custom"};function rb(r,e){const t=ib[e];return t===void 0?(je("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Xo=new j;function sb(){ct.getLuminanceCoefficients(Xo);const r=Xo.x.toFixed(4),e=Xo.y.toFixed(4),t=Xo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ab(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ba).join(`
`)}function ob(r){const e=[];for(const t in r){const n=r[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function lb(r,e){const t={},n=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const s=r.getActiveAttrib(e,i),a=s.name;let o=1;s.type===r.FLOAT_MAT2&&(o=2),s.type===r.FLOAT_MAT3&&(o=3),s.type===r.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:o}}return t}function ba(r){return r!==""}function vd(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Sd(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const cb=/^[ \t]*#include +<([\w\d./]+)>/gm;function ju(r){return r.replace(cb,fb)}const ub=new Map;function fb(r,e){let t=Qe[e];if(t===void 0){const n=ub.get(e);if(n!==void 0)t=Qe[n],je('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return ju(t)}const hb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Md(r){return r.replace(hb,db)}function db(r,e,t,n){let i="";for(let s=parseInt(e);s<parseInt(t);s++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return i}function yd(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const pb={[tl]:"SHADOWMAP_TYPE_PCF",[ya]:"SHADOWMAP_TYPE_VSM"};function mb(r){return pb[r.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const _b={[as]:"ENVMAP_TYPE_CUBE",[Ks]:"ENVMAP_TYPE_CUBE",[Rl]:"ENVMAP_TYPE_CUBE_UV"};function gb(r){return r.envMap===!1?"ENVMAP_TYPE_CUBE":_b[r.envMapMode]||"ENVMAP_TYPE_CUBE"}const xb={[Ks]:"ENVMAP_MODE_REFRACTION"};function vb(r){return r.envMap===!1?"ENVMAP_MODE_REFLECTION":xb[r.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Sb={[lm]:"ENVMAP_BLENDING_MULTIPLY",[ux]:"ENVMAP_BLENDING_MIX",[fx]:"ENVMAP_BLENDING_ADD"};function Mb(r){return r.envMap===!1?"ENVMAP_BLENDING_NONE":Sb[r.combine]||"ENVMAP_BLENDING_NONE"}function yb(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function bb(r,e,t,n){const i=r.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=mb(t),c=gb(t),u=vb(t),d=Mb(t),f=yb(t),h=ab(t),_=ob(s),g=i.createProgram();let p,m,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(ba).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(ba).join(`
`),m.length>0&&(m+=`
`)):(p=[yd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ba).join(`
`),m=[yd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ni?"#define TONE_MAPPING":"",t.toneMapping!==Ni?Qe.tonemapping_pars_fragment:"",t.toneMapping!==Ni?rb("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Qe.colorspace_pars_fragment,nb("linearToOutputTexel",t.outputColorSpace),sb(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ba).join(`
`)),a=ju(a),a=vd(a,t),a=Sd(a,t),o=ju(o),o=vd(o,t),o=Sd(o,t),a=Md(a),o=Md(o),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,p=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",t.glslVersion===Bh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Bh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const b=v+p+a,S=v+m+o,w=_d(i,i.VERTEX_SHADER,b),E=_d(i,i.FRAGMENT_SHADER,S);i.attachShader(g,w),i.attachShader(g,E),t.index0AttributeName!==void 0?i.bindAttribLocation(g,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(g,0,"position"),i.linkProgram(g);function A(P){if(r.debug.checkShaderErrors){const I=i.getProgramInfoLog(g)||"",k=i.getShaderInfoLog(w)||"",V=i.getShaderInfoLog(E)||"",H=I.trim(),z=k.trim(),B=V.trim();let Q=!0,ee=!0;if(i.getProgramParameter(g,i.LINK_STATUS)===!1)if(Q=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(i,g,w,E);else{const L=xd(i,w,"vertex"),ce=xd(i,E,"fragment");ht("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(g,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+H+`
`+L+`
`+ce)}else H!==""?je("WebGLProgram: Program Info Log:",H):(z===""||B==="")&&(ee=!1);ee&&(P.diagnostics={runnable:Q,programLog:H,vertexShader:{log:z,prefix:p},fragmentShader:{log:B,prefix:m}})}i.deleteShader(w),i.deleteShader(E),x=new al(i,g),y=lb(i,g)}let x;this.getUniforms=function(){return x===void 0&&A(this),x};let y;this.getAttributes=function(){return y===void 0&&A(this),y};let D=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return D===!1&&(D=i.getProgramParameter(g,Jy)),D},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Qy++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=w,this.fragmentShader=E,this}let Eb=0;class Tb{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new wb(e),t.set(e,n)),n}}class wb{constructor(e){this.id=Eb++,this.code=e,this.usedTimes=0}}function Ab(r,e,t,n,i,s){const a=new wm,o=new Tb,l=new Set,c=[],u=new Map,d=n.logarithmicDepthBuffer;let f=n.precision;const h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(x){return l.add(x),x===0?"uv":`uv${x}`}function g(x,y,D,P,I){const k=P.fog,V=I.geometry,H=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?P.environment:null,z=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,B=e.get(x.envMap||H,z),Q=B&&B.mapping===Rl?B.image.height:null,ee=h[x.type];x.precision!==null&&(f=n.getMaxPrecision(x.precision),f!==x.precision&&je("WebGLProgram.getParameters:",x.precision,"not supported, using",f,"instead."));const L=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,ce=L!==void 0?L.length:0;let ue=0;V.morphAttributes.position!==void 0&&(ue=1),V.morphAttributes.normal!==void 0&&(ue=2),V.morphAttributes.color!==void 0&&(ue=3);let ke,He,Ye,K;if(ee){const ve=wi[ee];ke=ve.vertexShader,He=ve.fragmentShader}else ke=x.vertexShader,He=x.fragmentShader,o.update(x),Ye=o.getVertexShaderID(x),K=o.getFragmentShaderID(x);const te=r.getRenderTarget(),se=r.state.buffers.depth.getReversed(),Ne=I.isInstancedMesh===!0,Ie=I.isBatchedMesh===!0,Re=!!x.map,lt=!!x.matcap,Ee=!!B,ze=!!x.aoMap,$e=!!x.lightMap,Be=!!x.bumpMap,X=!!x.normalMap,U=!!x.displacementMap,pt=!!x.emissiveMap,et=!!x.metalnessMap,Ve=!!x.roughnessMap,Se=x.anisotropy>0,C=x.clearcoat>0,M=x.dispersion>0,F=x.iridescence>0,Z=x.sheen>0,J=x.transmission>0,q=Se&&!!x.anisotropyMap,xe=C&&!!x.clearcoatMap,oe=C&&!!x.clearcoatNormalMap,Pe=C&&!!x.clearcoatRoughnessMap,Me=F&&!!x.iridescenceMap,ie=F&&!!x.iridescenceThicknessMap,ae=Z&&!!x.sheenColorMap,ye=Z&&!!x.sheenRoughnessMap,Te=!!x.specularMap,de=!!x.specularColorMap,Ge=!!x.specularIntensityMap,N=J&&!!x.transmissionMap,le=J&&!!x.thicknessMap,re=!!x.gradientMap,pe=!!x.alphaMap,ne=x.alphaTest>0,$=!!x.alphaHash,be=!!x.extensions;let Fe=Ni;x.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(Fe=r.toneMapping);const ut={shaderID:ee,shaderType:x.type,shaderName:x.name,vertexShader:ke,fragmentShader:He,defines:x.defines,customVertexShaderID:Ye,customFragmentShaderID:K,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:f,batching:Ie,batchingColor:Ie&&I._colorsTexture!==null,instancing:Ne,instancingColor:Ne&&I.instanceColor!==null,instancingMorph:Ne&&I.morphTexture!==null,outputColorSpace:te===null?r.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Js,alphaToCoverage:!!x.alphaToCoverage,map:Re,matcap:lt,envMap:Ee,envMapMode:Ee&&B.mapping,envMapCubeUVHeight:Q,aoMap:ze,lightMap:$e,bumpMap:Be,normalMap:X,displacementMap:U,emissiveMap:pt,normalMapObjectSpace:X&&x.normalMapType===mx,normalMapTangentSpace:X&&x.normalMapType===px,metalnessMap:et,roughnessMap:Ve,anisotropy:Se,anisotropyMap:q,clearcoat:C,clearcoatMap:xe,clearcoatNormalMap:oe,clearcoatRoughnessMap:Pe,dispersion:M,iridescence:F,iridescenceMap:Me,iridescenceThicknessMap:ie,sheen:Z,sheenColorMap:ae,sheenRoughnessMap:ye,specularMap:Te,specularColorMap:de,specularIntensityMap:Ge,transmission:J,transmissionMap:N,thicknessMap:le,gradientMap:re,opaque:x.transparent===!1&&x.blending===zs&&x.alphaToCoverage===!1,alphaMap:pe,alphaTest:ne,alphaHash:$,combine:x.combine,mapUv:Re&&_(x.map.channel),aoMapUv:ze&&_(x.aoMap.channel),lightMapUv:$e&&_(x.lightMap.channel),bumpMapUv:Be&&_(x.bumpMap.channel),normalMapUv:X&&_(x.normalMap.channel),displacementMapUv:U&&_(x.displacementMap.channel),emissiveMapUv:pt&&_(x.emissiveMap.channel),metalnessMapUv:et&&_(x.metalnessMap.channel),roughnessMapUv:Ve&&_(x.roughnessMap.channel),anisotropyMapUv:q&&_(x.anisotropyMap.channel),clearcoatMapUv:xe&&_(x.clearcoatMap.channel),clearcoatNormalMapUv:oe&&_(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Pe&&_(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Me&&_(x.iridescenceMap.channel),iridescenceThicknessMapUv:ie&&_(x.iridescenceThicknessMap.channel),sheenColorMapUv:ae&&_(x.sheenColorMap.channel),sheenRoughnessMapUv:ye&&_(x.sheenRoughnessMap.channel),specularMapUv:Te&&_(x.specularMap.channel),specularColorMapUv:de&&_(x.specularColorMap.channel),specularIntensityMapUv:Ge&&_(x.specularIntensityMap.channel),transmissionMapUv:N&&_(x.transmissionMap.channel),thicknessMapUv:le&&_(x.thicknessMap.channel),alphaMapUv:pe&&_(x.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(X||Se),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!V.attributes.uv&&(Re||pe),fog:!!k,useFog:x.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||V.attributes.normal===void 0&&X===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:se,skinning:I.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:ce,morphTextureStride:ue,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:x.dithering,shadowMapEnabled:r.shadowMap.enabled&&D.length>0,shadowMapType:r.shadowMap.type,toneMapping:Fe,decodeVideoTexture:Re&&x.map.isVideoTexture===!0&&ct.getTransfer(x.map.colorSpace)===xt,decodeVideoTextureEmissive:pt&&x.emissiveMap.isVideoTexture===!0&&ct.getTransfer(x.emissiveMap.colorSpace)===xt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===qi,flipSided:x.side===Fn,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:be&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(be&&x.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return ut.vertexUv1s=l.has(1),ut.vertexUv2s=l.has(2),ut.vertexUv3s=l.has(3),l.clear(),ut}function p(x){const y=[];if(x.shaderID?y.push(x.shaderID):(y.push(x.customVertexShaderID),y.push(x.customFragmentShaderID)),x.defines!==void 0)for(const D in x.defines)y.push(D),y.push(x.defines[D]);return x.isRawShaderMaterial===!1&&(m(y,x),v(y,x),y.push(r.outputColorSpace)),y.push(x.customProgramCacheKey),y.join()}function m(x,y){x.push(y.precision),x.push(y.outputColorSpace),x.push(y.envMapMode),x.push(y.envMapCubeUVHeight),x.push(y.mapUv),x.push(y.alphaMapUv),x.push(y.lightMapUv),x.push(y.aoMapUv),x.push(y.bumpMapUv),x.push(y.normalMapUv),x.push(y.displacementMapUv),x.push(y.emissiveMapUv),x.push(y.metalnessMapUv),x.push(y.roughnessMapUv),x.push(y.anisotropyMapUv),x.push(y.clearcoatMapUv),x.push(y.clearcoatNormalMapUv),x.push(y.clearcoatRoughnessMapUv),x.push(y.iridescenceMapUv),x.push(y.iridescenceThicknessMapUv),x.push(y.sheenColorMapUv),x.push(y.sheenRoughnessMapUv),x.push(y.specularMapUv),x.push(y.specularColorMapUv),x.push(y.specularIntensityMapUv),x.push(y.transmissionMapUv),x.push(y.thicknessMapUv),x.push(y.combine),x.push(y.fogExp2),x.push(y.sizeAttenuation),x.push(y.morphTargetsCount),x.push(y.morphAttributeCount),x.push(y.numDirLights),x.push(y.numPointLights),x.push(y.numSpotLights),x.push(y.numSpotLightMaps),x.push(y.numHemiLights),x.push(y.numRectAreaLights),x.push(y.numDirLightShadows),x.push(y.numPointLightShadows),x.push(y.numSpotLightShadows),x.push(y.numSpotLightShadowsWithMaps),x.push(y.numLightProbes),x.push(y.shadowMapType),x.push(y.toneMapping),x.push(y.numClippingPlanes),x.push(y.numClipIntersection),x.push(y.depthPacking)}function v(x,y){a.disableAll(),y.instancing&&a.enable(0),y.instancingColor&&a.enable(1),y.instancingMorph&&a.enable(2),y.matcap&&a.enable(3),y.envMap&&a.enable(4),y.normalMapObjectSpace&&a.enable(5),y.normalMapTangentSpace&&a.enable(6),y.clearcoat&&a.enable(7),y.iridescence&&a.enable(8),y.alphaTest&&a.enable(9),y.vertexColors&&a.enable(10),y.vertexAlphas&&a.enable(11),y.vertexUv1s&&a.enable(12),y.vertexUv2s&&a.enable(13),y.vertexUv3s&&a.enable(14),y.vertexTangents&&a.enable(15),y.anisotropy&&a.enable(16),y.alphaHash&&a.enable(17),y.batching&&a.enable(18),y.dispersion&&a.enable(19),y.batchingColor&&a.enable(20),y.gradientMap&&a.enable(21),x.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reversedDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),x.push(a.mask)}function b(x){const y=h[x.type];let D;if(y){const P=wi[y];D=Qx.clone(P.uniforms)}else D=x.uniforms;return D}function S(x,y){let D=u.get(y);return D!==void 0?++D.usedTimes:(D=new bb(r,y,x,i),c.push(D),u.set(y,D)),D}function w(x){if(--x.usedTimes===0){const y=c.indexOf(x);c[y]=c[c.length-1],c.pop(),u.delete(x.cacheKey),x.destroy()}}function E(x){o.remove(x)}function A(){o.dispose()}return{getParameters:g,getProgramCacheKey:p,getUniforms:b,acquireProgram:S,releaseProgram:w,releaseShaderCache:E,programs:c,dispose:A}}function Cb(){let r=new WeakMap;function e(a){return r.has(a)}function t(a){let o=r.get(a);return o===void 0&&(o={},r.set(a,o)),o}function n(a){r.delete(a)}function i(a,o,l){r.get(a)[o]=l}function s(){r=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:s}}function Rb(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.materialVariant!==e.materialVariant?r.materialVariant-e.materialVariant:r.z!==e.z?r.z-e.z:r.id-e.id}function bd(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function Ed(){const r=[];let e=0;const t=[],n=[],i=[];function s(){e=0,t.length=0,n.length=0,i.length=0}function a(f){let h=0;return f.isInstancedMesh&&(h+=2),f.isSkinnedMesh&&(h+=1),h}function o(f,h,_,g,p,m){let v=r[e];return v===void 0?(v={id:f.id,object:f,geometry:h,material:_,materialVariant:a(f),groupOrder:g,renderOrder:f.renderOrder,z:p,group:m},r[e]=v):(v.id=f.id,v.object=f,v.geometry=h,v.material=_,v.materialVariant=a(f),v.groupOrder=g,v.renderOrder=f.renderOrder,v.z=p,v.group=m),e++,v}function l(f,h,_,g,p,m){const v=o(f,h,_,g,p,m);_.transmission>0?n.push(v):_.transparent===!0?i.push(v):t.push(v)}function c(f,h,_,g,p,m){const v=o(f,h,_,g,p,m);_.transmission>0?n.unshift(v):_.transparent===!0?i.unshift(v):t.unshift(v)}function u(f,h){t.length>1&&t.sort(f||Rb),n.length>1&&n.sort(h||bd),i.length>1&&i.sort(h||bd)}function d(){for(let f=e,h=r.length;f<h;f++){const _=r[f];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:n,transparent:i,init:s,push:l,unshift:c,finish:d,sort:u}}function Pb(){let r=new WeakMap;function e(n,i){const s=r.get(n);let a;return s===void 0?(a=new Ed,r.set(n,[a])):i>=s.length?(a=new Ed,s.push(a)):a=s[i],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function Db(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new j,color:new Mt};break;case"SpotLight":t={position:new j,direction:new j,color:new Mt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new j,color:new Mt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new j,skyColor:new Mt,groundColor:new Mt};break;case"RectAreaLight":t={color:new Mt,position:new j,halfWidth:new j,halfHeight:new j};break}return r[e.id]=t,t}}}function Lb(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let Nb=0;function Ib(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function Ub(r){const e=new Db,t=Lb(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new j);const i=new j,s=new Wt,a=new Wt;function o(c){let u=0,d=0,f=0;for(let y=0;y<9;y++)n.probe[y].set(0,0,0);let h=0,_=0,g=0,p=0,m=0,v=0,b=0,S=0,w=0,E=0,A=0;c.sort(Ib);for(let y=0,D=c.length;y<D;y++){const P=c[y],I=P.color,k=P.intensity,V=P.distance;let H=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===Zs?H=P.shadow.map.texture:H=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)u+=I.r*k,d+=I.g*k,f+=I.b*k;else if(P.isLightProbe){for(let z=0;z<9;z++)n.probe[z].addScaledVector(P.sh.coefficients[z],k);A++}else if(P.isDirectionalLight){const z=e.get(P);if(z.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const B=P.shadow,Q=t.get(P);Q.shadowIntensity=B.intensity,Q.shadowBias=B.bias,Q.shadowNormalBias=B.normalBias,Q.shadowRadius=B.radius,Q.shadowMapSize=B.mapSize,n.directionalShadow[h]=Q,n.directionalShadowMap[h]=H,n.directionalShadowMatrix[h]=P.shadow.matrix,v++}n.directional[h]=z,h++}else if(P.isSpotLight){const z=e.get(P);z.position.setFromMatrixPosition(P.matrixWorld),z.color.copy(I).multiplyScalar(k),z.distance=V,z.coneCos=Math.cos(P.angle),z.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),z.decay=P.decay,n.spot[g]=z;const B=P.shadow;if(P.map&&(n.spotLightMap[w]=P.map,w++,B.updateMatrices(P),P.castShadow&&E++),n.spotLightMatrix[g]=B.matrix,P.castShadow){const Q=t.get(P);Q.shadowIntensity=B.intensity,Q.shadowBias=B.bias,Q.shadowNormalBias=B.normalBias,Q.shadowRadius=B.radius,Q.shadowMapSize=B.mapSize,n.spotShadow[g]=Q,n.spotShadowMap[g]=H,S++}g++}else if(P.isRectAreaLight){const z=e.get(P);z.color.copy(I).multiplyScalar(k),z.halfWidth.set(P.width*.5,0,0),z.halfHeight.set(0,P.height*.5,0),n.rectArea[p]=z,p++}else if(P.isPointLight){const z=e.get(P);if(z.color.copy(P.color).multiplyScalar(P.intensity),z.distance=P.distance,z.decay=P.decay,P.castShadow){const B=P.shadow,Q=t.get(P);Q.shadowIntensity=B.intensity,Q.shadowBias=B.bias,Q.shadowNormalBias=B.normalBias,Q.shadowRadius=B.radius,Q.shadowMapSize=B.mapSize,Q.shadowCameraNear=B.camera.near,Q.shadowCameraFar=B.camera.far,n.pointShadow[_]=Q,n.pointShadowMap[_]=H,n.pointShadowMatrix[_]=P.shadow.matrix,b++}n.point[_]=z,_++}else if(P.isHemisphereLight){const z=e.get(P);z.skyColor.copy(P.color).multiplyScalar(k),z.groundColor.copy(P.groundColor).multiplyScalar(k),n.hemi[m]=z,m++}}p>0&&(r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ge.LTC_FLOAT_1,n.rectAreaLTC2=ge.LTC_FLOAT_2):(n.rectAreaLTC1=ge.LTC_HALF_1,n.rectAreaLTC2=ge.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=f;const x=n.hash;(x.directionalLength!==h||x.pointLength!==_||x.spotLength!==g||x.rectAreaLength!==p||x.hemiLength!==m||x.numDirectionalShadows!==v||x.numPointShadows!==b||x.numSpotShadows!==S||x.numSpotMaps!==w||x.numLightProbes!==A)&&(n.directional.length=h,n.spot.length=g,n.rectArea.length=p,n.point.length=_,n.hemi.length=m,n.directionalShadow.length=v,n.directionalShadowMap.length=v,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=S,n.spotShadowMap.length=S,n.directionalShadowMatrix.length=v,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=S+w-E,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=A,x.directionalLength=h,x.pointLength=_,x.spotLength=g,x.rectAreaLength=p,x.hemiLength=m,x.numDirectionalShadows=v,x.numPointShadows=b,x.numSpotShadows=S,x.numSpotMaps=w,x.numLightProbes=A,n.version=Nb++)}function l(c,u){let d=0,f=0,h=0,_=0,g=0;const p=u.matrixWorldInverse;for(let m=0,v=c.length;m<v;m++){const b=c[m];if(b.isDirectionalLight){const S=n.directional[d];S.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(i),S.direction.transformDirection(p),d++}else if(b.isSpotLight){const S=n.spot[h];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(p),S.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),S.direction.sub(i),S.direction.transformDirection(p),h++}else if(b.isRectAreaLight){const S=n.rectArea[_];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(p),a.identity(),s.copy(b.matrixWorld),s.premultiply(p),a.extractRotation(s),S.halfWidth.set(b.width*.5,0,0),S.halfHeight.set(0,b.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),_++}else if(b.isPointLight){const S=n.point[f];S.position.setFromMatrixPosition(b.matrixWorld),S.position.applyMatrix4(p),f++}else if(b.isHemisphereLight){const S=n.hemi[g];S.direction.setFromMatrixPosition(b.matrixWorld),S.direction.transformDirection(p),g++}}}return{setup:o,setupView:l,state:n}}function Td(r){const e=new Ub(r),t=[],n=[];function i(u){c.camera=u,t.length=0,n.length=0}function s(u){t.push(u)}function a(u){n.push(u)}function o(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function Fb(r){let e=new WeakMap;function t(i,s=0){const a=e.get(i);let o;return a===void 0?(o=new Td(r),e.set(i,[o])):s>=a.length?(o=new Td(r),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const Ob=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Bb=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,kb=[new j(1,0,0),new j(-1,0,0),new j(0,1,0),new j(0,-1,0),new j(0,0,1),new j(0,0,-1)],zb=[new j(0,-1,0),new j(0,-1,0),new j(0,0,1),new j(0,0,-1),new j(0,-1,0),new j(0,-1,0)],wd=new Wt,ha=new j,Cc=new j;function Vb(r,e,t){let n=new Pm;const i=new dt,s=new dt,a=new kt,o=new iv,l=new rv,c={},u=t.maxTextureSize,d={[Rr]:Fn,[Fn]:Rr,[qi]:qi},f=new Si({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new dt},radius:{value:4}},vertexShader:Ob,fragmentShader:Bb}),h=f.clone();h.defines.HORIZONTAL_PASS=1;const _=new Bi;_.setAttribute("position",new Ui(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new vi(_,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=tl;let m=this.type;this.render=function(E,A,x){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||E.length===0)return;this.type===X0&&(je("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=tl);const y=r.getRenderTarget(),D=r.getActiveCubeFace(),P=r.getActiveMipmapLevel(),I=r.state;I.setBlending(Ji),I.buffers.depth.getReversed()===!0?I.buffers.color.setClear(0,0,0,0):I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);const k=m!==this.type;k&&A.traverse(function(V){V.material&&(Array.isArray(V.material)?V.material.forEach(H=>H.needsUpdate=!0):V.material.needsUpdate=!0)});for(let V=0,H=E.length;V<H;V++){const z=E[V],B=z.shadow;if(B===void 0){je("WebGLShadowMap:",z,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;i.copy(B.mapSize);const Q=B.getFrameExtents();i.multiply(Q),s.copy(B.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(s.x=Math.floor(u/Q.x),i.x=s.x*Q.x,B.mapSize.x=s.x),i.y>u&&(s.y=Math.floor(u/Q.y),i.y=s.y*Q.y,B.mapSize.y=s.y));const ee=r.state.buffers.depth.getReversed();if(B.camera._reversedDepth=ee,B.map===null||k===!0){if(B.map!==null&&(B.map.depthTexture!==null&&(B.map.depthTexture.dispose(),B.map.depthTexture=null),B.map.dispose()),this.type===ya){if(z.isPointLight){je("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}B.map=new Ii(i.x,i.y,{format:Zs,type:nr,minFilter:vn,magFilter:vn,generateMipmaps:!1}),B.map.texture.name=z.name+".shadowMap",B.map.depthTexture=new qa(i.x,i.y,Pi),B.map.depthTexture.name=z.name+".shadowMapDepth",B.map.depthTexture.format=ir,B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=ln,B.map.depthTexture.magFilter=ln}else z.isPointLight?(B.map=new Om(i.x),B.map.depthTexture=new Zx(i.x,Oi)):(B.map=new Ii(i.x,i.y),B.map.depthTexture=new qa(i.x,i.y,Oi)),B.map.depthTexture.name=z.name+".shadowMap",B.map.depthTexture.format=ir,this.type===tl?(B.map.depthTexture.compareFunction=ee?Pf:Rf,B.map.depthTexture.minFilter=vn,B.map.depthTexture.magFilter=vn):(B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=ln,B.map.depthTexture.magFilter=ln);B.camera.updateProjectionMatrix()}const L=B.map.isWebGLCubeRenderTarget?6:1;for(let ce=0;ce<L;ce++){if(B.map.isWebGLCubeRenderTarget)r.setRenderTarget(B.map,ce),r.clear();else{ce===0&&(r.setRenderTarget(B.map),r.clear());const ue=B.getViewport(ce);a.set(s.x*ue.x,s.y*ue.y,s.x*ue.z,s.y*ue.w),I.viewport(a)}if(z.isPointLight){const ue=B.camera,ke=B.matrix,He=z.distance||ue.far;He!==ue.far&&(ue.far=He,ue.updateProjectionMatrix()),ha.setFromMatrixPosition(z.matrixWorld),ue.position.copy(ha),Cc.copy(ue.position),Cc.add(kb[ce]),ue.up.copy(zb[ce]),ue.lookAt(Cc),ue.updateMatrixWorld(),ke.makeTranslation(-ha.x,-ha.y,-ha.z),wd.multiplyMatrices(ue.projectionMatrix,ue.matrixWorldInverse),B._frustum.setFromProjectionMatrix(wd,ue.coordinateSystem,ue.reversedDepth)}else B.updateMatrices(z);n=B.getFrustum(),S(A,x,B.camera,z,this.type)}B.isPointLightShadow!==!0&&this.type===ya&&v(B,x),B.needsUpdate=!1}m=this.type,p.needsUpdate=!1,r.setRenderTarget(y,D,P)};function v(E,A){const x=e.update(g);f.defines.VSM_SAMPLES!==E.blurSamples&&(f.defines.VSM_SAMPLES=E.blurSamples,h.defines.VSM_SAMPLES=E.blurSamples,f.needsUpdate=!0,h.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new Ii(i.x,i.y,{format:Zs,type:nr})),f.uniforms.shadow_pass.value=E.map.depthTexture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,r.setRenderTarget(E.mapPass),r.clear(),r.renderBufferDirect(A,null,x,f,g,null),h.uniforms.shadow_pass.value=E.mapPass.texture,h.uniforms.resolution.value=E.mapSize,h.uniforms.radius.value=E.radius,r.setRenderTarget(E.map),r.clear(),r.renderBufferDirect(A,null,x,h,g,null)}function b(E,A,x,y){let D=null;const P=x.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(P!==void 0)D=P;else if(D=x.isPointLight===!0?l:o,r.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const I=D.uuid,k=A.uuid;let V=c[I];V===void 0&&(V={},c[I]=V);let H=V[k];H===void 0&&(H=D.clone(),V[k]=H,A.addEventListener("dispose",w)),D=H}if(D.visible=A.visible,D.wireframe=A.wireframe,y===ya?D.side=A.shadowSide!==null?A.shadowSide:A.side:D.side=A.shadowSide!==null?A.shadowSide:d[A.side],D.alphaMap=A.alphaMap,D.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,D.map=A.map,D.clipShadows=A.clipShadows,D.clippingPlanes=A.clippingPlanes,D.clipIntersection=A.clipIntersection,D.displacementMap=A.displacementMap,D.displacementScale=A.displacementScale,D.displacementBias=A.displacementBias,D.wireframeLinewidth=A.wireframeLinewidth,D.linewidth=A.linewidth,x.isPointLight===!0&&D.isMeshDistanceMaterial===!0){const I=r.properties.get(D);I.light=x}return D}function S(E,A,x,y,D){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&D===ya)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,E.matrixWorld);const k=e.update(E),V=E.material;if(Array.isArray(V)){const H=k.groups;for(let z=0,B=H.length;z<B;z++){const Q=H[z],ee=V[Q.materialIndex];if(ee&&ee.visible){const L=b(E,ee,y,D);E.onBeforeShadow(r,E,A,x,k,L,Q),r.renderBufferDirect(x,null,k,L,E,Q),E.onAfterShadow(r,E,A,x,k,L,Q)}}}else if(V.visible){const H=b(E,V,y,D);E.onBeforeShadow(r,E,A,x,k,H,null),r.renderBufferDirect(x,null,k,H,E,null),E.onAfterShadow(r,E,A,x,k,H,null)}}const I=E.children;for(let k=0,V=I.length;k<V;k++)S(I[k],A,x,y,D)}function w(E){E.target.removeEventListener("dispose",w);for(const x in c){const y=c[x],D=E.target.uuid;D in y&&(y[D].dispose(),delete y[D])}}}function Hb(r,e){function t(){let N=!1;const le=new kt;let re=null;const pe=new kt(0,0,0,0);return{setMask:function(ne){re!==ne&&!N&&(r.colorMask(ne,ne,ne,ne),re=ne)},setLocked:function(ne){N=ne},setClear:function(ne,$,be,Fe,ut){ut===!0&&(ne*=Fe,$*=Fe,be*=Fe),le.set(ne,$,be,Fe),pe.equals(le)===!1&&(r.clearColor(ne,$,be,Fe),pe.copy(le))},reset:function(){N=!1,re=null,pe.set(-1,0,0,0)}}}function n(){let N=!1,le=!1,re=null,pe=null,ne=null;return{setReversed:function($){if(le!==$){const be=e.get("EXT_clip_control");$?be.clipControlEXT(be.LOWER_LEFT_EXT,be.ZERO_TO_ONE_EXT):be.clipControlEXT(be.LOWER_LEFT_EXT,be.NEGATIVE_ONE_TO_ONE_EXT),le=$;const Fe=ne;ne=null,this.setClear(Fe)}},getReversed:function(){return le},setTest:function($){$?te(r.DEPTH_TEST):se(r.DEPTH_TEST)},setMask:function($){re!==$&&!N&&(r.depthMask($),re=$)},setFunc:function($){if(le&&($=Tx[$]),pe!==$){switch($){case iu:r.depthFunc(r.NEVER);break;case ru:r.depthFunc(r.ALWAYS);break;case su:r.depthFunc(r.LESS);break;case $s:r.depthFunc(r.LEQUAL);break;case au:r.depthFunc(r.EQUAL);break;case ou:r.depthFunc(r.GEQUAL);break;case lu:r.depthFunc(r.GREATER);break;case cu:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}pe=$}},setLocked:function($){N=$},setClear:function($){ne!==$&&(ne=$,le&&($=1-$),r.clearDepth($))},reset:function(){N=!1,re=null,pe=null,ne=null,le=!1}}}function i(){let N=!1,le=null,re=null,pe=null,ne=null,$=null,be=null,Fe=null,ut=null;return{setTest:function(ve){N||(ve?te(r.STENCIL_TEST):se(r.STENCIL_TEST))},setMask:function(ve){le!==ve&&!N&&(r.stencilMask(ve),le=ve)},setFunc:function(ve,De,Ze){(re!==ve||pe!==De||ne!==Ze)&&(r.stencilFunc(ve,De,Ze),re=ve,pe=De,ne=Ze)},setOp:function(ve,De,Ze){($!==ve||be!==De||Fe!==Ze)&&(r.stencilOp(ve,De,Ze),$=ve,be=De,Fe=Ze)},setLocked:function(ve){N=ve},setClear:function(ve){ut!==ve&&(r.clearStencil(ve),ut=ve)},reset:function(){N=!1,le=null,re=null,pe=null,ne=null,$=null,be=null,Fe=null,ut=null}}}const s=new t,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let u={},d={},f=new WeakMap,h=[],_=null,g=!1,p=null,m=null,v=null,b=null,S=null,w=null,E=null,A=new Mt(0,0,0),x=0,y=!1,D=null,P=null,I=null,k=null,V=null;const H=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,B=0;const Q=r.getParameter(r.VERSION);Q.indexOf("WebGL")!==-1?(B=parseFloat(/^WebGL (\d)/.exec(Q)[1]),z=B>=1):Q.indexOf("OpenGL ES")!==-1&&(B=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),z=B>=2);let ee=null,L={};const ce=r.getParameter(r.SCISSOR_BOX),ue=r.getParameter(r.VIEWPORT),ke=new kt().fromArray(ce),He=new kt().fromArray(ue);function Ye(N,le,re,pe){const ne=new Uint8Array(4),$=r.createTexture();r.bindTexture(N,$),r.texParameteri(N,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(N,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let be=0;be<re;be++)N===r.TEXTURE_3D||N===r.TEXTURE_2D_ARRAY?r.texImage3D(le,0,r.RGBA,1,1,pe,0,r.RGBA,r.UNSIGNED_BYTE,ne):r.texImage2D(le+be,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,ne);return $}const K={};K[r.TEXTURE_2D]=Ye(r.TEXTURE_2D,r.TEXTURE_2D,1),K[r.TEXTURE_CUBE_MAP]=Ye(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[r.TEXTURE_2D_ARRAY]=Ye(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),K[r.TEXTURE_3D]=Ye(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),te(r.DEPTH_TEST),a.setFunc($s),Be(!1),X(Lh),te(r.CULL_FACE),ze(Ji);function te(N){u[N]!==!0&&(r.enable(N),u[N]=!0)}function se(N){u[N]!==!1&&(r.disable(N),u[N]=!1)}function Ne(N,le){return d[N]!==le?(r.bindFramebuffer(N,le),d[N]=le,N===r.DRAW_FRAMEBUFFER&&(d[r.FRAMEBUFFER]=le),N===r.FRAMEBUFFER&&(d[r.DRAW_FRAMEBUFFER]=le),!0):!1}function Ie(N,le){let re=h,pe=!1;if(N){re=f.get(le),re===void 0&&(re=[],f.set(le,re));const ne=N.textures;if(re.length!==ne.length||re[0]!==r.COLOR_ATTACHMENT0){for(let $=0,be=ne.length;$<be;$++)re[$]=r.COLOR_ATTACHMENT0+$;re.length=ne.length,pe=!0}}else re[0]!==r.BACK&&(re[0]=r.BACK,pe=!0);pe&&r.drawBuffers(re)}function Re(N){return _!==N?(r.useProgram(N),_=N,!0):!1}const lt={[Wr]:r.FUNC_ADD,[Y0]:r.FUNC_SUBTRACT,[q0]:r.FUNC_REVERSE_SUBTRACT};lt[$0]=r.MIN,lt[K0]=r.MAX;const Ee={[Z0]:r.ZERO,[J0]:r.ONE,[Q0]:r.SRC_COLOR,[tu]:r.SRC_ALPHA,[sx]:r.SRC_ALPHA_SATURATE,[ix]:r.DST_COLOR,[tx]:r.DST_ALPHA,[ex]:r.ONE_MINUS_SRC_COLOR,[nu]:r.ONE_MINUS_SRC_ALPHA,[rx]:r.ONE_MINUS_DST_COLOR,[nx]:r.ONE_MINUS_DST_ALPHA,[ax]:r.CONSTANT_COLOR,[ox]:r.ONE_MINUS_CONSTANT_COLOR,[lx]:r.CONSTANT_ALPHA,[cx]:r.ONE_MINUS_CONSTANT_ALPHA};function ze(N,le,re,pe,ne,$,be,Fe,ut,ve){if(N===Ji){g===!0&&(se(r.BLEND),g=!1);return}if(g===!1&&(te(r.BLEND),g=!0),N!==j0){if(N!==p||ve!==y){if((m!==Wr||S!==Wr)&&(r.blendEquation(r.FUNC_ADD),m=Wr,S=Wr),ve)switch(N){case zs:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Nh:r.blendFunc(r.ONE,r.ONE);break;case Ih:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Uh:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:ht("WebGLState: Invalid blending: ",N);break}else switch(N){case zs:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Nh:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case Ih:ht("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Uh:ht("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ht("WebGLState: Invalid blending: ",N);break}v=null,b=null,w=null,E=null,A.set(0,0,0),x=0,p=N,y=ve}return}ne=ne||le,$=$||re,be=be||pe,(le!==m||ne!==S)&&(r.blendEquationSeparate(lt[le],lt[ne]),m=le,S=ne),(re!==v||pe!==b||$!==w||be!==E)&&(r.blendFuncSeparate(Ee[re],Ee[pe],Ee[$],Ee[be]),v=re,b=pe,w=$,E=be),(Fe.equals(A)===!1||ut!==x)&&(r.blendColor(Fe.r,Fe.g,Fe.b,ut),A.copy(Fe),x=ut),p=N,y=!1}function $e(N,le){N.side===qi?se(r.CULL_FACE):te(r.CULL_FACE);let re=N.side===Fn;le&&(re=!re),Be(re),N.blending===zs&&N.transparent===!1?ze(Ji):ze(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),s.setMask(N.colorWrite);const pe=N.stencilWrite;o.setTest(pe),pe&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),pt(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?te(r.SAMPLE_ALPHA_TO_COVERAGE):se(r.SAMPLE_ALPHA_TO_COVERAGE)}function Be(N){D!==N&&(N?r.frontFace(r.CW):r.frontFace(r.CCW),D=N)}function X(N){N!==G0?(te(r.CULL_FACE),N!==P&&(N===Lh?r.cullFace(r.BACK):N===W0?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):se(r.CULL_FACE),P=N}function U(N){N!==I&&(z&&r.lineWidth(N),I=N)}function pt(N,le,re){N?(te(r.POLYGON_OFFSET_FILL),(k!==le||V!==re)&&(k=le,V=re,a.getReversed()&&(le=-le),r.polygonOffset(le,re))):se(r.POLYGON_OFFSET_FILL)}function et(N){N?te(r.SCISSOR_TEST):se(r.SCISSOR_TEST)}function Ve(N){N===void 0&&(N=r.TEXTURE0+H-1),ee!==N&&(r.activeTexture(N),ee=N)}function Se(N,le,re){re===void 0&&(ee===null?re=r.TEXTURE0+H-1:re=ee);let pe=L[re];pe===void 0&&(pe={type:void 0,texture:void 0},L[re]=pe),(pe.type!==N||pe.texture!==le)&&(ee!==re&&(r.activeTexture(re),ee=re),r.bindTexture(N,le||K[N]),pe.type=N,pe.texture=le)}function C(){const N=L[ee];N!==void 0&&N.type!==void 0&&(r.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function M(){try{r.compressedTexImage2D(...arguments)}catch(N){ht("WebGLState:",N)}}function F(){try{r.compressedTexImage3D(...arguments)}catch(N){ht("WebGLState:",N)}}function Z(){try{r.texSubImage2D(...arguments)}catch(N){ht("WebGLState:",N)}}function J(){try{r.texSubImage3D(...arguments)}catch(N){ht("WebGLState:",N)}}function q(){try{r.compressedTexSubImage2D(...arguments)}catch(N){ht("WebGLState:",N)}}function xe(){try{r.compressedTexSubImage3D(...arguments)}catch(N){ht("WebGLState:",N)}}function oe(){try{r.texStorage2D(...arguments)}catch(N){ht("WebGLState:",N)}}function Pe(){try{r.texStorage3D(...arguments)}catch(N){ht("WebGLState:",N)}}function Me(){try{r.texImage2D(...arguments)}catch(N){ht("WebGLState:",N)}}function ie(){try{r.texImage3D(...arguments)}catch(N){ht("WebGLState:",N)}}function ae(N){ke.equals(N)===!1&&(r.scissor(N.x,N.y,N.z,N.w),ke.copy(N))}function ye(N){He.equals(N)===!1&&(r.viewport(N.x,N.y,N.z,N.w),He.copy(N))}function Te(N,le){let re=c.get(le);re===void 0&&(re=new WeakMap,c.set(le,re));let pe=re.get(N);pe===void 0&&(pe=r.getUniformBlockIndex(le,N.name),re.set(N,pe))}function de(N,le){const pe=c.get(le).get(N);l.get(le)!==pe&&(r.uniformBlockBinding(le,pe,N.__bindingPointIndex),l.set(le,pe))}function Ge(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),a.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),u={},ee=null,L={},d={},f=new WeakMap,h=[],_=null,g=!1,p=null,m=null,v=null,b=null,S=null,w=null,E=null,A=new Mt(0,0,0),x=0,y=!1,D=null,P=null,I=null,k=null,V=null,ke.set(0,0,r.canvas.width,r.canvas.height),He.set(0,0,r.canvas.width,r.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:te,disable:se,bindFramebuffer:Ne,drawBuffers:Ie,useProgram:Re,setBlending:ze,setMaterial:$e,setFlipSided:Be,setCullFace:X,setLineWidth:U,setPolygonOffset:pt,setScissorTest:et,activeTexture:Ve,bindTexture:Se,unbindTexture:C,compressedTexImage2D:M,compressedTexImage3D:F,texImage2D:Me,texImage3D:ie,updateUBOMapping:Te,uniformBlockBinding:de,texStorage2D:oe,texStorage3D:Pe,texSubImage2D:Z,texSubImage3D:J,compressedTexSubImage2D:q,compressedTexSubImage3D:xe,scissor:ae,viewport:ye,reset:Ge}}function Gb(r,e,t,n,i,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new dt,u=new WeakMap;let d;const f=new WeakMap;let h=!1;try{h=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(C,M){return h?new OffscreenCanvas(C,M):Sl("canvas")}function g(C,M,F){let Z=1;const J=Se(C);if((J.width>F||J.height>F)&&(Z=F/Math.max(J.width,J.height)),Z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const q=Math.floor(Z*J.width),xe=Math.floor(Z*J.height);d===void 0&&(d=_(q,xe));const oe=M?_(q,xe):d;return oe.width=q,oe.height=xe,oe.getContext("2d").drawImage(C,0,0,q,xe),je("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+q+"x"+xe+")."),oe}else return"data"in C&&je("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function p(C){return C.generateMipmaps}function m(C){r.generateMipmap(C)}function v(C){return C.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?r.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function b(C,M,F,Z,J=!1){if(C!==null){if(r[C]!==void 0)return r[C];je("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let q=M;if(M===r.RED&&(F===r.FLOAT&&(q=r.R32F),F===r.HALF_FLOAT&&(q=r.R16F),F===r.UNSIGNED_BYTE&&(q=r.R8)),M===r.RED_INTEGER&&(F===r.UNSIGNED_BYTE&&(q=r.R8UI),F===r.UNSIGNED_SHORT&&(q=r.R16UI),F===r.UNSIGNED_INT&&(q=r.R32UI),F===r.BYTE&&(q=r.R8I),F===r.SHORT&&(q=r.R16I),F===r.INT&&(q=r.R32I)),M===r.RG&&(F===r.FLOAT&&(q=r.RG32F),F===r.HALF_FLOAT&&(q=r.RG16F),F===r.UNSIGNED_BYTE&&(q=r.RG8)),M===r.RG_INTEGER&&(F===r.UNSIGNED_BYTE&&(q=r.RG8UI),F===r.UNSIGNED_SHORT&&(q=r.RG16UI),F===r.UNSIGNED_INT&&(q=r.RG32UI),F===r.BYTE&&(q=r.RG8I),F===r.SHORT&&(q=r.RG16I),F===r.INT&&(q=r.RG32I)),M===r.RGB_INTEGER&&(F===r.UNSIGNED_BYTE&&(q=r.RGB8UI),F===r.UNSIGNED_SHORT&&(q=r.RGB16UI),F===r.UNSIGNED_INT&&(q=r.RGB32UI),F===r.BYTE&&(q=r.RGB8I),F===r.SHORT&&(q=r.RGB16I),F===r.INT&&(q=r.RGB32I)),M===r.RGBA_INTEGER&&(F===r.UNSIGNED_BYTE&&(q=r.RGBA8UI),F===r.UNSIGNED_SHORT&&(q=r.RGBA16UI),F===r.UNSIGNED_INT&&(q=r.RGBA32UI),F===r.BYTE&&(q=r.RGBA8I),F===r.SHORT&&(q=r.RGBA16I),F===r.INT&&(q=r.RGBA32I)),M===r.RGB&&(F===r.UNSIGNED_INT_5_9_9_9_REV&&(q=r.RGB9_E5),F===r.UNSIGNED_INT_10F_11F_11F_REV&&(q=r.R11F_G11F_B10F)),M===r.RGBA){const xe=J?xl:ct.getTransfer(Z);F===r.FLOAT&&(q=r.RGBA32F),F===r.HALF_FLOAT&&(q=r.RGBA16F),F===r.UNSIGNED_BYTE&&(q=xe===xt?r.SRGB8_ALPHA8:r.RGBA8),F===r.UNSIGNED_SHORT_4_4_4_4&&(q=r.RGBA4),F===r.UNSIGNED_SHORT_5_5_5_1&&(q=r.RGB5_A1)}return(q===r.R16F||q===r.R32F||q===r.RG16F||q===r.RG32F||q===r.RGBA16F||q===r.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function S(C,M){let F;return C?M===null||M===Oi||M===Ya?F=r.DEPTH24_STENCIL8:M===Pi?F=r.DEPTH32F_STENCIL8:M===ja&&(F=r.DEPTH24_STENCIL8,je("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Oi||M===Ya?F=r.DEPTH_COMPONENT24:M===Pi?F=r.DEPTH_COMPONENT32F:M===ja&&(F=r.DEPTH_COMPONENT16),F}function w(C,M){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==ln&&C.minFilter!==vn?Math.log2(Math.max(M.width,M.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?M.mipmaps.length:1}function E(C){const M=C.target;M.removeEventListener("dispose",E),x(M),M.isVideoTexture&&u.delete(M)}function A(C){const M=C.target;M.removeEventListener("dispose",A),D(M)}function x(C){const M=n.get(C);if(M.__webglInit===void 0)return;const F=C.source,Z=f.get(F);if(Z){const J=Z[M.__cacheKey];J.usedTimes--,J.usedTimes===0&&y(C),Object.keys(Z).length===0&&f.delete(F)}n.remove(C)}function y(C){const M=n.get(C);r.deleteTexture(M.__webglTexture);const F=C.source,Z=f.get(F);delete Z[M.__cacheKey],a.memory.textures--}function D(C){const M=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(M.__webglFramebuffer[Z]))for(let J=0;J<M.__webglFramebuffer[Z].length;J++)r.deleteFramebuffer(M.__webglFramebuffer[Z][J]);else r.deleteFramebuffer(M.__webglFramebuffer[Z]);M.__webglDepthbuffer&&r.deleteRenderbuffer(M.__webglDepthbuffer[Z])}else{if(Array.isArray(M.__webglFramebuffer))for(let Z=0;Z<M.__webglFramebuffer.length;Z++)r.deleteFramebuffer(M.__webglFramebuffer[Z]);else r.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&r.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&r.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let Z=0;Z<M.__webglColorRenderbuffer.length;Z++)M.__webglColorRenderbuffer[Z]&&r.deleteRenderbuffer(M.__webglColorRenderbuffer[Z]);M.__webglDepthRenderbuffer&&r.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const F=C.textures;for(let Z=0,J=F.length;Z<J;Z++){const q=n.get(F[Z]);q.__webglTexture&&(r.deleteTexture(q.__webglTexture),a.memory.textures--),n.remove(F[Z])}n.remove(C)}let P=0;function I(){P=0}function k(){const C=P;return C>=i.maxTextures&&je("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+i.maxTextures),P+=1,C}function V(C){const M=[];return M.push(C.wrapS),M.push(C.wrapT),M.push(C.wrapR||0),M.push(C.magFilter),M.push(C.minFilter),M.push(C.anisotropy),M.push(C.internalFormat),M.push(C.format),M.push(C.type),M.push(C.generateMipmaps),M.push(C.premultiplyAlpha),M.push(C.flipY),M.push(C.unpackAlignment),M.push(C.colorSpace),M.join()}function H(C,M){const F=n.get(C);if(C.isVideoTexture&&et(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&F.__version!==C.version){const Z=C.image;if(Z===null)je("WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)je("WebGLRenderer: Texture marked for update but image is incomplete");else{K(F,C,M);return}}else C.isExternalTexture&&(F.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(r.TEXTURE_2D,F.__webglTexture,r.TEXTURE0+M)}function z(C,M){const F=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&F.__version!==C.version){K(F,C,M);return}else C.isExternalTexture&&(F.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(r.TEXTURE_2D_ARRAY,F.__webglTexture,r.TEXTURE0+M)}function B(C,M){const F=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&F.__version!==C.version){K(F,C,M);return}t.bindTexture(r.TEXTURE_3D,F.__webglTexture,r.TEXTURE0+M)}function Q(C,M){const F=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&F.__version!==C.version){te(F,C,M);return}t.bindTexture(r.TEXTURE_CUBE_MAP,F.__webglTexture,r.TEXTURE0+M)}const ee={[uu]:r.REPEAT,[Ki]:r.CLAMP_TO_EDGE,[fu]:r.MIRRORED_REPEAT},L={[ln]:r.NEAREST,[hx]:r.NEAREST_MIPMAP_NEAREST,[bo]:r.NEAREST_MIPMAP_LINEAR,[vn]:r.LINEAR,[Jl]:r.LINEAR_MIPMAP_NEAREST,[qr]:r.LINEAR_MIPMAP_LINEAR},ce={[_x]:r.NEVER,[Mx]:r.ALWAYS,[gx]:r.LESS,[Rf]:r.LEQUAL,[xx]:r.EQUAL,[Pf]:r.GEQUAL,[vx]:r.GREATER,[Sx]:r.NOTEQUAL};function ue(C,M){if(M.type===Pi&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===vn||M.magFilter===Jl||M.magFilter===bo||M.magFilter===qr||M.minFilter===vn||M.minFilter===Jl||M.minFilter===bo||M.minFilter===qr)&&je("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(C,r.TEXTURE_WRAP_S,ee[M.wrapS]),r.texParameteri(C,r.TEXTURE_WRAP_T,ee[M.wrapT]),(C===r.TEXTURE_3D||C===r.TEXTURE_2D_ARRAY)&&r.texParameteri(C,r.TEXTURE_WRAP_R,ee[M.wrapR]),r.texParameteri(C,r.TEXTURE_MAG_FILTER,L[M.magFilter]),r.texParameteri(C,r.TEXTURE_MIN_FILTER,L[M.minFilter]),M.compareFunction&&(r.texParameteri(C,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(C,r.TEXTURE_COMPARE_FUNC,ce[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===ln||M.minFilter!==bo&&M.minFilter!==qr||M.type===Pi&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const F=e.get("EXT_texture_filter_anisotropic");r.texParameterf(C,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,i.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function ke(C,M){let F=!1;C.__webglInit===void 0&&(C.__webglInit=!0,M.addEventListener("dispose",E));const Z=M.source;let J=f.get(Z);J===void 0&&(J={},f.set(Z,J));const q=V(M);if(q!==C.__cacheKey){J[q]===void 0&&(J[q]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,F=!0),J[q].usedTimes++;const xe=J[C.__cacheKey];xe!==void 0&&(J[C.__cacheKey].usedTimes--,xe.usedTimes===0&&y(M)),C.__cacheKey=q,C.__webglTexture=J[q].texture}return F}function He(C,M,F){return Math.floor(Math.floor(C/F)/M)}function Ye(C,M,F,Z){const q=C.updateRanges;if(q.length===0)t.texSubImage2D(r.TEXTURE_2D,0,0,0,M.width,M.height,F,Z,M.data);else{q.sort((ie,ae)=>ie.start-ae.start);let xe=0;for(let ie=1;ie<q.length;ie++){const ae=q[xe],ye=q[ie],Te=ae.start+ae.count,de=He(ye.start,M.width,4),Ge=He(ae.start,M.width,4);ye.start<=Te+1&&de===Ge&&He(ye.start+ye.count-1,M.width,4)===de?ae.count=Math.max(ae.count,ye.start+ye.count-ae.start):(++xe,q[xe]=ye)}q.length=xe+1;const oe=r.getParameter(r.UNPACK_ROW_LENGTH),Pe=r.getParameter(r.UNPACK_SKIP_PIXELS),Me=r.getParameter(r.UNPACK_SKIP_ROWS);r.pixelStorei(r.UNPACK_ROW_LENGTH,M.width);for(let ie=0,ae=q.length;ie<ae;ie++){const ye=q[ie],Te=Math.floor(ye.start/4),de=Math.ceil(ye.count/4),Ge=Te%M.width,N=Math.floor(Te/M.width),le=de,re=1;r.pixelStorei(r.UNPACK_SKIP_PIXELS,Ge),r.pixelStorei(r.UNPACK_SKIP_ROWS,N),t.texSubImage2D(r.TEXTURE_2D,0,Ge,N,le,re,F,Z,M.data)}C.clearUpdateRanges(),r.pixelStorei(r.UNPACK_ROW_LENGTH,oe),r.pixelStorei(r.UNPACK_SKIP_PIXELS,Pe),r.pixelStorei(r.UNPACK_SKIP_ROWS,Me)}}function K(C,M,F){let Z=r.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(Z=r.TEXTURE_2D_ARRAY),M.isData3DTexture&&(Z=r.TEXTURE_3D);const J=ke(C,M),q=M.source;t.bindTexture(Z,C.__webglTexture,r.TEXTURE0+F);const xe=n.get(q);if(q.version!==xe.__version||J===!0){t.activeTexture(r.TEXTURE0+F);const oe=ct.getPrimaries(ct.workingColorSpace),Pe=M.colorSpace===mr?null:ct.getPrimaries(M.colorSpace),Me=M.colorSpace===mr||oe===Pe?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,M.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,M.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me);let ie=g(M.image,!1,i.maxTextureSize);ie=Ve(M,ie);const ae=s.convert(M.format,M.colorSpace),ye=s.convert(M.type);let Te=b(M.internalFormat,ae,ye,M.colorSpace,M.isVideoTexture);ue(Z,M);let de;const Ge=M.mipmaps,N=M.isVideoTexture!==!0,le=xe.__version===void 0||J===!0,re=q.dataReady,pe=w(M,ie);if(M.isDepthTexture)Te=S(M.format===$r,M.type),le&&(N?t.texStorage2D(r.TEXTURE_2D,1,Te,ie.width,ie.height):t.texImage2D(r.TEXTURE_2D,0,Te,ie.width,ie.height,0,ae,ye,null));else if(M.isDataTexture)if(Ge.length>0){N&&le&&t.texStorage2D(r.TEXTURE_2D,pe,Te,Ge[0].width,Ge[0].height);for(let ne=0,$=Ge.length;ne<$;ne++)de=Ge[ne],N?re&&t.texSubImage2D(r.TEXTURE_2D,ne,0,0,de.width,de.height,ae,ye,de.data):t.texImage2D(r.TEXTURE_2D,ne,Te,de.width,de.height,0,ae,ye,de.data);M.generateMipmaps=!1}else N?(le&&t.texStorage2D(r.TEXTURE_2D,pe,Te,ie.width,ie.height),re&&Ye(M,ie,ae,ye)):t.texImage2D(r.TEXTURE_2D,0,Te,ie.width,ie.height,0,ae,ye,ie.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){N&&le&&t.texStorage3D(r.TEXTURE_2D_ARRAY,pe,Te,Ge[0].width,Ge[0].height,ie.depth);for(let ne=0,$=Ge.length;ne<$;ne++)if(de=Ge[ne],M.format!==xi)if(ae!==null)if(N){if(re)if(M.layerUpdates.size>0){const be=id(de.width,de.height,M.format,M.type);for(const Fe of M.layerUpdates){const ut=de.data.subarray(Fe*be/de.data.BYTES_PER_ELEMENT,(Fe+1)*be/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ne,0,0,Fe,de.width,de.height,1,ae,ut)}M.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,ne,0,0,0,de.width,de.height,ie.depth,ae,de.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,ne,Te,de.width,de.height,ie.depth,0,de.data,0,0);else je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else N?re&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,ne,0,0,0,de.width,de.height,ie.depth,ae,ye,de.data):t.texImage3D(r.TEXTURE_2D_ARRAY,ne,Te,de.width,de.height,ie.depth,0,ae,ye,de.data)}else{N&&le&&t.texStorage2D(r.TEXTURE_2D,pe,Te,Ge[0].width,Ge[0].height);for(let ne=0,$=Ge.length;ne<$;ne++)de=Ge[ne],M.format!==xi?ae!==null?N?re&&t.compressedTexSubImage2D(r.TEXTURE_2D,ne,0,0,de.width,de.height,ae,de.data):t.compressedTexImage2D(r.TEXTURE_2D,ne,Te,de.width,de.height,0,de.data):je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):N?re&&t.texSubImage2D(r.TEXTURE_2D,ne,0,0,de.width,de.height,ae,ye,de.data):t.texImage2D(r.TEXTURE_2D,ne,Te,de.width,de.height,0,ae,ye,de.data)}else if(M.isDataArrayTexture)if(N){if(le&&t.texStorage3D(r.TEXTURE_2D_ARRAY,pe,Te,ie.width,ie.height,ie.depth),re)if(M.layerUpdates.size>0){const ne=id(ie.width,ie.height,M.format,M.type);for(const $ of M.layerUpdates){const be=ie.data.subarray($*ne/ie.data.BYTES_PER_ELEMENT,($+1)*ne/ie.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,$,ie.width,ie.height,1,ae,ye,be)}M.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,ae,ye,ie.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,Te,ie.width,ie.height,ie.depth,0,ae,ye,ie.data);else if(M.isData3DTexture)N?(le&&t.texStorage3D(r.TEXTURE_3D,pe,Te,ie.width,ie.height,ie.depth),re&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,ae,ye,ie.data)):t.texImage3D(r.TEXTURE_3D,0,Te,ie.width,ie.height,ie.depth,0,ae,ye,ie.data);else if(M.isFramebufferTexture){if(le)if(N)t.texStorage2D(r.TEXTURE_2D,pe,Te,ie.width,ie.height);else{let ne=ie.width,$=ie.height;for(let be=0;be<pe;be++)t.texImage2D(r.TEXTURE_2D,be,Te,ne,$,0,ae,ye,null),ne>>=1,$>>=1}}else if(Ge.length>0){if(N&&le){const ne=Se(Ge[0]);t.texStorage2D(r.TEXTURE_2D,pe,Te,ne.width,ne.height)}for(let ne=0,$=Ge.length;ne<$;ne++)de=Ge[ne],N?re&&t.texSubImage2D(r.TEXTURE_2D,ne,0,0,ae,ye,de):t.texImage2D(r.TEXTURE_2D,ne,Te,ae,ye,de);M.generateMipmaps=!1}else if(N){if(le){const ne=Se(ie);t.texStorage2D(r.TEXTURE_2D,pe,Te,ne.width,ne.height)}re&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,ae,ye,ie)}else t.texImage2D(r.TEXTURE_2D,0,Te,ae,ye,ie);p(M)&&m(Z),xe.__version=q.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function te(C,M,F){if(M.image.length!==6)return;const Z=ke(C,M),J=M.source;t.bindTexture(r.TEXTURE_CUBE_MAP,C.__webglTexture,r.TEXTURE0+F);const q=n.get(J);if(J.version!==q.__version||Z===!0){t.activeTexture(r.TEXTURE0+F);const xe=ct.getPrimaries(ct.workingColorSpace),oe=M.colorSpace===mr?null:ct.getPrimaries(M.colorSpace),Pe=M.colorSpace===mr||xe===oe?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,M.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,M.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe);const Me=M.isCompressedTexture||M.image[0].isCompressedTexture,ie=M.image[0]&&M.image[0].isDataTexture,ae=[];for(let $=0;$<6;$++)!Me&&!ie?ae[$]=g(M.image[$],!0,i.maxCubemapSize):ae[$]=ie?M.image[$].image:M.image[$],ae[$]=Ve(M,ae[$]);const ye=ae[0],Te=s.convert(M.format,M.colorSpace),de=s.convert(M.type),Ge=b(M.internalFormat,Te,de,M.colorSpace),N=M.isVideoTexture!==!0,le=q.__version===void 0||Z===!0,re=J.dataReady;let pe=w(M,ye);ue(r.TEXTURE_CUBE_MAP,M);let ne;if(Me){N&&le&&t.texStorage2D(r.TEXTURE_CUBE_MAP,pe,Ge,ye.width,ye.height);for(let $=0;$<6;$++){ne=ae[$].mipmaps;for(let be=0;be<ne.length;be++){const Fe=ne[be];M.format!==xi?Te!==null?N?re&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,be,0,0,Fe.width,Fe.height,Te,Fe.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,be,Ge,Fe.width,Fe.height,0,Fe.data):je("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?re&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,be,0,0,Fe.width,Fe.height,Te,de,Fe.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,be,Ge,Fe.width,Fe.height,0,Te,de,Fe.data)}}}else{if(ne=M.mipmaps,N&&le){ne.length>0&&pe++;const $=Se(ae[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,pe,Ge,$.width,$.height)}for(let $=0;$<6;$++)if(ie){N?re&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,ae[$].width,ae[$].height,Te,de,ae[$].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Ge,ae[$].width,ae[$].height,0,Te,de,ae[$].data);for(let be=0;be<ne.length;be++){const ut=ne[be].image[$].image;N?re&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,be+1,0,0,ut.width,ut.height,Te,de,ut.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,be+1,Ge,ut.width,ut.height,0,Te,de,ut.data)}}else{N?re&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Te,de,ae[$]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Ge,Te,de,ae[$]);for(let be=0;be<ne.length;be++){const Fe=ne[be];N?re&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,be+1,0,0,Te,de,Fe.image[$]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+$,be+1,Ge,Te,de,Fe.image[$])}}}p(M)&&m(r.TEXTURE_CUBE_MAP),q.__version=J.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function se(C,M,F,Z,J,q){const xe=s.convert(F.format,F.colorSpace),oe=s.convert(F.type),Pe=b(F.internalFormat,xe,oe,F.colorSpace),Me=n.get(M),ie=n.get(F);if(ie.__renderTarget=M,!Me.__hasExternalTextures){const ae=Math.max(1,M.width>>q),ye=Math.max(1,M.height>>q);J===r.TEXTURE_3D||J===r.TEXTURE_2D_ARRAY?t.texImage3D(J,q,Pe,ae,ye,M.depth,0,xe,oe,null):t.texImage2D(J,q,Pe,ae,ye,0,xe,oe,null)}t.bindFramebuffer(r.FRAMEBUFFER,C),pt(M)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Z,J,ie.__webglTexture,0,U(M)):(J===r.TEXTURE_2D||J>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,Z,J,ie.__webglTexture,q),t.bindFramebuffer(r.FRAMEBUFFER,null)}function Ne(C,M,F){if(r.bindRenderbuffer(r.RENDERBUFFER,C),M.depthBuffer){const Z=M.depthTexture,J=Z&&Z.isDepthTexture?Z.type:null,q=S(M.stencilBuffer,J),xe=M.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;pt(M)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,U(M),q,M.width,M.height):F?r.renderbufferStorageMultisample(r.RENDERBUFFER,U(M),q,M.width,M.height):r.renderbufferStorage(r.RENDERBUFFER,q,M.width,M.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,xe,r.RENDERBUFFER,C)}else{const Z=M.textures;for(let J=0;J<Z.length;J++){const q=Z[J],xe=s.convert(q.format,q.colorSpace),oe=s.convert(q.type),Pe=b(q.internalFormat,xe,oe,q.colorSpace);pt(M)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,U(M),Pe,M.width,M.height):F?r.renderbufferStorageMultisample(r.RENDERBUFFER,U(M),Pe,M.width,M.height):r.renderbufferStorage(r.RENDERBUFFER,Pe,M.width,M.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Ie(C,M,F){const Z=M.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(r.FRAMEBUFFER,C),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const J=n.get(M.depthTexture);if(J.__renderTarget=M,(!J.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),Z){if(J.__webglInit===void 0&&(J.__webglInit=!0,M.depthTexture.addEventListener("dispose",E)),J.__webglTexture===void 0){J.__webglTexture=r.createTexture(),t.bindTexture(r.TEXTURE_CUBE_MAP,J.__webglTexture),ue(r.TEXTURE_CUBE_MAP,M.depthTexture);const Me=s.convert(M.depthTexture.format),ie=s.convert(M.depthTexture.type);let ae;M.depthTexture.format===ir?ae=r.DEPTH_COMPONENT24:M.depthTexture.format===$r&&(ae=r.DEPTH24_STENCIL8);for(let ye=0;ye<6;ye++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,ae,M.width,M.height,0,Me,ie,null)}}else H(M.depthTexture,0);const q=J.__webglTexture,xe=U(M),oe=Z?r.TEXTURE_CUBE_MAP_POSITIVE_X+F:r.TEXTURE_2D,Pe=M.depthTexture.format===$r?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(M.depthTexture.format===ir)pt(M)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Pe,oe,q,0,xe):r.framebufferTexture2D(r.FRAMEBUFFER,Pe,oe,q,0);else if(M.depthTexture.format===$r)pt(M)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Pe,oe,q,0,xe):r.framebufferTexture2D(r.FRAMEBUFFER,Pe,oe,q,0);else throw new Error("Unknown depthTexture format")}function Re(C){const M=n.get(C),F=C.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==C.depthTexture){const Z=C.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),Z){const J=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,Z.removeEventListener("dispose",J)};Z.addEventListener("dispose",J),M.__depthDisposeCallback=J}M.__boundDepthTexture=Z}if(C.depthTexture&&!M.__autoAllocateDepthBuffer)if(F)for(let Z=0;Z<6;Z++)Ie(M.__webglFramebuffer[Z],C,Z);else{const Z=C.texture.mipmaps;Z&&Z.length>0?Ie(M.__webglFramebuffer[0],C,0):Ie(M.__webglFramebuffer,C,0)}else if(F){M.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(r.FRAMEBUFFER,M.__webglFramebuffer[Z]),M.__webglDepthbuffer[Z]===void 0)M.__webglDepthbuffer[Z]=r.createRenderbuffer(),Ne(M.__webglDepthbuffer[Z],C,!1);else{const J=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,q=M.__webglDepthbuffer[Z];r.bindRenderbuffer(r.RENDERBUFFER,q),r.framebufferRenderbuffer(r.FRAMEBUFFER,J,r.RENDERBUFFER,q)}}else{const Z=C.texture.mipmaps;if(Z&&Z.length>0?t.bindFramebuffer(r.FRAMEBUFFER,M.__webglFramebuffer[0]):t.bindFramebuffer(r.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=r.createRenderbuffer(),Ne(M.__webglDepthbuffer,C,!1);else{const J=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,q=M.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,q),r.framebufferRenderbuffer(r.FRAMEBUFFER,J,r.RENDERBUFFER,q)}}t.bindFramebuffer(r.FRAMEBUFFER,null)}function lt(C,M,F){const Z=n.get(C);M!==void 0&&se(Z.__webglFramebuffer,C,C.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),F!==void 0&&Re(C)}function Ee(C){const M=C.texture,F=n.get(C),Z=n.get(M);C.addEventListener("dispose",A);const J=C.textures,q=C.isWebGLCubeRenderTarget===!0,xe=J.length>1;if(xe||(Z.__webglTexture===void 0&&(Z.__webglTexture=r.createTexture()),Z.__version=M.version,a.memory.textures++),q){F.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(M.mipmaps&&M.mipmaps.length>0){F.__webglFramebuffer[oe]=[];for(let Pe=0;Pe<M.mipmaps.length;Pe++)F.__webglFramebuffer[oe][Pe]=r.createFramebuffer()}else F.__webglFramebuffer[oe]=r.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){F.__webglFramebuffer=[];for(let oe=0;oe<M.mipmaps.length;oe++)F.__webglFramebuffer[oe]=r.createFramebuffer()}else F.__webglFramebuffer=r.createFramebuffer();if(xe)for(let oe=0,Pe=J.length;oe<Pe;oe++){const Me=n.get(J[oe]);Me.__webglTexture===void 0&&(Me.__webglTexture=r.createTexture(),a.memory.textures++)}if(C.samples>0&&pt(C)===!1){F.__webglMultisampledFramebuffer=r.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let oe=0;oe<J.length;oe++){const Pe=J[oe];F.__webglColorRenderbuffer[oe]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,F.__webglColorRenderbuffer[oe]);const Me=s.convert(Pe.format,Pe.colorSpace),ie=s.convert(Pe.type),ae=b(Pe.internalFormat,Me,ie,Pe.colorSpace,C.isXRRenderTarget===!0),ye=U(C);r.renderbufferStorageMultisample(r.RENDERBUFFER,ye,ae,C.width,C.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+oe,r.RENDERBUFFER,F.__webglColorRenderbuffer[oe])}r.bindRenderbuffer(r.RENDERBUFFER,null),C.depthBuffer&&(F.__webglDepthRenderbuffer=r.createRenderbuffer(),Ne(F.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(q){t.bindTexture(r.TEXTURE_CUBE_MAP,Z.__webglTexture),ue(r.TEXTURE_CUBE_MAP,M);for(let oe=0;oe<6;oe++)if(M.mipmaps&&M.mipmaps.length>0)for(let Pe=0;Pe<M.mipmaps.length;Pe++)se(F.__webglFramebuffer[oe][Pe],C,M,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Pe);else se(F.__webglFramebuffer[oe],C,M,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);p(M)&&m(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(xe){for(let oe=0,Pe=J.length;oe<Pe;oe++){const Me=J[oe],ie=n.get(Me);let ae=r.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ae=C.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(ae,ie.__webglTexture),ue(ae,Me),se(F.__webglFramebuffer,C,Me,r.COLOR_ATTACHMENT0+oe,ae,0),p(Me)&&m(ae)}t.unbindTexture()}else{let oe=r.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(oe=C.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(oe,Z.__webglTexture),ue(oe,M),M.mipmaps&&M.mipmaps.length>0)for(let Pe=0;Pe<M.mipmaps.length;Pe++)se(F.__webglFramebuffer[Pe],C,M,r.COLOR_ATTACHMENT0,oe,Pe);else se(F.__webglFramebuffer,C,M,r.COLOR_ATTACHMENT0,oe,0);p(M)&&m(oe),t.unbindTexture()}C.depthBuffer&&Re(C)}function ze(C){const M=C.textures;for(let F=0,Z=M.length;F<Z;F++){const J=M[F];if(p(J)){const q=v(C),xe=n.get(J).__webglTexture;t.bindTexture(q,xe),m(q),t.unbindTexture()}}}const $e=[],Be=[];function X(C){if(C.samples>0){if(pt(C)===!1){const M=C.textures,F=C.width,Z=C.height;let J=r.COLOR_BUFFER_BIT;const q=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,xe=n.get(C),oe=M.length>1;if(oe)for(let Me=0;Me<M.length;Me++)t.bindFramebuffer(r.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Me,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,xe.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Me,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,xe.__webglMultisampledFramebuffer);const Pe=C.texture.mipmaps;Pe&&Pe.length>0?t.bindFramebuffer(r.DRAW_FRAMEBUFFER,xe.__webglFramebuffer[0]):t.bindFramebuffer(r.DRAW_FRAMEBUFFER,xe.__webglFramebuffer);for(let Me=0;Me<M.length;Me++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=r.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=r.STENCIL_BUFFER_BIT)),oe){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,xe.__webglColorRenderbuffer[Me]);const ie=n.get(M[Me]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,ie,0)}r.blitFramebuffer(0,0,F,Z,0,0,F,Z,J,r.NEAREST),l===!0&&($e.length=0,Be.length=0,$e.push(r.COLOR_ATTACHMENT0+Me),C.depthBuffer&&C.resolveDepthBuffer===!1&&($e.push(q),Be.push(q),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,Be)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,$e))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),oe)for(let Me=0;Me<M.length;Me++){t.bindFramebuffer(r.FRAMEBUFFER,xe.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Me,r.RENDERBUFFER,xe.__webglColorRenderbuffer[Me]);const ie=n.get(M[Me]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,xe.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Me,r.TEXTURE_2D,ie,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,xe.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const M=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[M])}}}function U(C){return Math.min(i.maxSamples,C.samples)}function pt(C){const M=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function et(C){const M=a.render.frame;u.get(C)!==M&&(u.set(C,M),C.update())}function Ve(C,M){const F=C.colorSpace,Z=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||F!==Js&&F!==mr&&(ct.getTransfer(F)===xt?(Z!==xi||J!==oi)&&je("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ht("WebGLTextures: Unsupported texture color space:",F)),M}function Se(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=I,this.setTexture2D=H,this.setTexture2DArray=z,this.setTexture3D=B,this.setTextureCube=Q,this.rebindTextures=lt,this.setupRenderTarget=Ee,this.updateRenderTargetMipmap=ze,this.updateMultisampleRenderTarget=X,this.setupDepthRenderbuffer=Re,this.setupFrameBufferTexture=se,this.useMultisampledRTT=pt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Wb(r,e){function t(n,i=mr){let s;const a=ct.getTransfer(i);if(n===oi)return r.UNSIGNED_BYTE;if(n===Ef)return r.UNSIGNED_SHORT_4_4_4_4;if(n===Tf)return r.UNSIGNED_SHORT_5_5_5_1;if(n===vm)return r.UNSIGNED_INT_5_9_9_9_REV;if(n===Sm)return r.UNSIGNED_INT_10F_11F_11F_REV;if(n===gm)return r.BYTE;if(n===xm)return r.SHORT;if(n===ja)return r.UNSIGNED_SHORT;if(n===bf)return r.INT;if(n===Oi)return r.UNSIGNED_INT;if(n===Pi)return r.FLOAT;if(n===nr)return r.HALF_FLOAT;if(n===Mm)return r.ALPHA;if(n===ym)return r.RGB;if(n===xi)return r.RGBA;if(n===ir)return r.DEPTH_COMPONENT;if(n===$r)return r.DEPTH_STENCIL;if(n===bm)return r.RED;if(n===wf)return r.RED_INTEGER;if(n===Zs)return r.RG;if(n===Af)return r.RG_INTEGER;if(n===Cf)return r.RGBA_INTEGER;if(n===nl||n===il||n===rl||n===sl)if(a===xt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===nl)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===il)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===rl)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===sl)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===nl)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===il)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===rl)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===sl)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===hu||n===du||n===pu||n===mu)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===hu)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===du)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===pu)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===mu)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===_u||n===gu||n===xu||n===vu||n===Su||n===Mu||n===yu)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===_u||n===gu)return a===xt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===xu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(n===vu)return s.COMPRESSED_R11_EAC;if(n===Su)return s.COMPRESSED_SIGNED_R11_EAC;if(n===Mu)return s.COMPRESSED_RG11_EAC;if(n===yu)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===bu||n===Eu||n===Tu||n===wu||n===Au||n===Cu||n===Ru||n===Pu||n===Du||n===Lu||n===Nu||n===Iu||n===Uu||n===Fu)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===bu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Eu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Tu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===wu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Au)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Cu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ru)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Pu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Du)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Lu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Nu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Iu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Uu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Fu)return a===xt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ou||n===Bu||n===ku)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Ou)return a===xt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Bu)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ku)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===zu||n===Vu||n===Hu||n===Gu)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===zu)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Vu)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Hu)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Gu)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ya?r.UNSIGNED_INT_24_8:r[n]!==void 0?r[n]:null}return{convert:t}}const Xb=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,jb=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Yb{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Lm(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Si({vertexShader:Xb,fragmentShader:jb,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new vi(new Dl(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class qb extends ea{constructor(e,t){super();const n=this;let i=null,s=1,a=null,o="local-floor",l=1,c=null,u=null,d=null,f=null,h=null,_=null;const g=typeof XRWebGLBinding<"u",p=new Yb,m={},v=t.getContextAttributes();let b=null,S=null;const w=[],E=[],A=new dt;let x=null;const y=new ai;y.viewport=new kt;const D=new ai;D.viewport=new kt;const P=[y,D],I=new av;let k=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let te=w[K];return te===void 0&&(te=new ac,w[K]=te),te.getTargetRaySpace()},this.getControllerGrip=function(K){let te=w[K];return te===void 0&&(te=new ac,w[K]=te),te.getGripSpace()},this.getHand=function(K){let te=w[K];return te===void 0&&(te=new ac,w[K]=te),te.getHandSpace()};function H(K){const te=E.indexOf(K.inputSource);if(te===-1)return;const se=w[te];se!==void 0&&(se.update(K.inputSource,K.frame,c||a),se.dispatchEvent({type:K.type,data:K.inputSource}))}function z(){i.removeEventListener("select",H),i.removeEventListener("selectstart",H),i.removeEventListener("selectend",H),i.removeEventListener("squeeze",H),i.removeEventListener("squeezestart",H),i.removeEventListener("squeezeend",H),i.removeEventListener("end",z),i.removeEventListener("inputsourceschange",B);for(let K=0;K<w.length;K++){const te=E[K];te!==null&&(E[K]=null,w[K].disconnect(te))}k=null,V=null,p.reset();for(const K in m)delete m[K];e.setRenderTarget(b),h=null,f=null,d=null,i=null,S=null,Ye.stop(),n.isPresenting=!1,e.setPixelRatio(x),e.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){s=K,n.isPresenting===!0&&je("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,n.isPresenting===!0&&je("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return f!==null?f:h},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(i,t)),d},this.getFrame=function(){return _},this.getSession=function(){return i},this.setSession=async function(K){if(i=K,i!==null){if(b=e.getRenderTarget(),i.addEventListener("select",H),i.addEventListener("selectstart",H),i.addEventListener("selectend",H),i.addEventListener("squeeze",H),i.addEventListener("squeezestart",H),i.addEventListener("squeezeend",H),i.addEventListener("end",z),i.addEventListener("inputsourceschange",B),v.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(A),g&&"createProjectionLayer"in XRWebGLBinding.prototype){let se=null,Ne=null,Ie=null;v.depth&&(Ie=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,se=v.stencil?$r:ir,Ne=v.stencil?Ya:Oi);const Re={colorFormat:t.RGBA8,depthFormat:Ie,scaleFactor:s};d=this.getBinding(),f=d.createProjectionLayer(Re),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Ii(f.textureWidth,f.textureHeight,{format:xi,type:oi,depthTexture:new qa(f.textureWidth,f.textureHeight,Ne,void 0,void 0,void 0,void 0,void 0,void 0,se),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const se={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:s};h=new XRWebGLLayer(i,t,se),i.updateRenderState({baseLayer:h}),e.setPixelRatio(1),e.setSize(h.framebufferWidth,h.framebufferHeight,!1),S=new Ii(h.framebufferWidth,h.framebufferHeight,{format:xi,type:oi,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),Ye.setContext(i),Ye.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function B(K){for(let te=0;te<K.removed.length;te++){const se=K.removed[te],Ne=E.indexOf(se);Ne>=0&&(E[Ne]=null,w[Ne].disconnect(se))}for(let te=0;te<K.added.length;te++){const se=K.added[te];let Ne=E.indexOf(se);if(Ne===-1){for(let Re=0;Re<w.length;Re++)if(Re>=E.length){E.push(se),Ne=Re;break}else if(E[Re]===null){E[Re]=se,Ne=Re;break}if(Ne===-1)break}const Ie=w[Ne];Ie&&Ie.connect(se)}}const Q=new j,ee=new j;function L(K,te,se){Q.setFromMatrixPosition(te.matrixWorld),ee.setFromMatrixPosition(se.matrixWorld);const Ne=Q.distanceTo(ee),Ie=te.projectionMatrix.elements,Re=se.projectionMatrix.elements,lt=Ie[14]/(Ie[10]-1),Ee=Ie[14]/(Ie[10]+1),ze=(Ie[9]+1)/Ie[5],$e=(Ie[9]-1)/Ie[5],Be=(Ie[8]-1)/Ie[0],X=(Re[8]+1)/Re[0],U=lt*Be,pt=lt*X,et=Ne/(-Be+X),Ve=et*-Be;if(te.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(Ve),K.translateZ(et),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Ie[10]===-1)K.projectionMatrix.copy(te.projectionMatrix),K.projectionMatrixInverse.copy(te.projectionMatrixInverse);else{const Se=lt+et,C=Ee+et,M=U-Ve,F=pt+(Ne-Ve),Z=ze*Ee/C*Se,J=$e*Ee/C*Se;K.projectionMatrix.makePerspective(M,F,Z,J,Se,C),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function ce(K,te){te===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(te.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(i===null)return;let te=K.near,se=K.far;p.texture!==null&&(p.depthNear>0&&(te=p.depthNear),p.depthFar>0&&(se=p.depthFar)),I.near=D.near=y.near=te,I.far=D.far=y.far=se,(k!==I.near||V!==I.far)&&(i.updateRenderState({depthNear:I.near,depthFar:I.far}),k=I.near,V=I.far),I.layers.mask=K.layers.mask|6,y.layers.mask=I.layers.mask&-5,D.layers.mask=I.layers.mask&-3;const Ne=K.parent,Ie=I.cameras;ce(I,Ne);for(let Re=0;Re<Ie.length;Re++)ce(Ie[Re],Ne);Ie.length===2?L(I,y,D):I.projectionMatrix.copy(y.projectionMatrix),ue(K,I,Ne)};function ue(K,te,se){se===null?K.matrix.copy(te.matrixWorld):(K.matrix.copy(se.matrixWorld),K.matrix.invert(),K.matrix.multiply(te.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(te.projectionMatrix),K.projectionMatrixInverse.copy(te.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=Wu*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return I},this.getFoveation=function(){if(!(f===null&&h===null))return l},this.setFoveation=function(K){l=K,f!==null&&(f.fixedFoveation=K),h!==null&&h.fixedFoveation!==void 0&&(h.fixedFoveation=K)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(I)},this.getCameraTexture=function(K){return m[K]};let ke=null;function He(K,te){if(u=te.getViewerPose(c||a),_=te,u!==null){const se=u.views;h!==null&&(e.setRenderTargetFramebuffer(S,h.framebuffer),e.setRenderTarget(S));let Ne=!1;se.length!==I.cameras.length&&(I.cameras.length=0,Ne=!0);for(let Ee=0;Ee<se.length;Ee++){const ze=se[Ee];let $e=null;if(h!==null)$e=h.getViewport(ze);else{const X=d.getViewSubImage(f,ze);$e=X.viewport,Ee===0&&(e.setRenderTargetTextures(S,X.colorTexture,X.depthStencilTexture),e.setRenderTarget(S))}let Be=P[Ee];Be===void 0&&(Be=new ai,Be.layers.enable(Ee),Be.viewport=new kt,P[Ee]=Be),Be.matrix.fromArray(ze.transform.matrix),Be.matrix.decompose(Be.position,Be.quaternion,Be.scale),Be.projectionMatrix.fromArray(ze.projectionMatrix),Be.projectionMatrixInverse.copy(Be.projectionMatrix).invert(),Be.viewport.set($e.x,$e.y,$e.width,$e.height),Ee===0&&(I.matrix.copy(Be.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale)),Ne===!0&&I.cameras.push(Be)}const Ie=i.enabledFeatures;if(Ie&&Ie.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&g){d=n.getBinding();const Ee=d.getDepthInformation(se[0]);Ee&&Ee.isValid&&Ee.texture&&p.init(Ee,i.renderState)}if(Ie&&Ie.includes("camera-access")&&g){e.state.unbindTexture(),d=n.getBinding();for(let Ee=0;Ee<se.length;Ee++){const ze=se[Ee].camera;if(ze){let $e=m[ze];$e||($e=new Lm,m[ze]=$e);const Be=d.getCameraImage(ze);$e.sourceTexture=Be}}}}for(let se=0;se<w.length;se++){const Ne=E[se],Ie=w[se];Ne!==null&&Ie!==void 0&&Ie.update(Ne,te,c||a)}ke&&ke(K,te),te.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:te}),_=null}const Ye=new Fm;Ye.setAnimationLoop(He),this.setAnimationLoop=function(K){ke=K},this.dispose=function(){}}}const kr=new rr,$b=new Wt;function Kb(r,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,Nm(r)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,v,b,S){m.isMeshBasicMaterial?s(p,m):m.isMeshLambertMaterial?(s(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(s(p,m),d(p,m)):m.isMeshPhongMaterial?(s(p,m),u(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(s(p,m),f(p,m),m.isMeshPhysicalMaterial&&h(p,m,S)):m.isMeshMatcapMaterial?(s(p,m),_(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),g(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(a(p,m),m.isLineDashedMaterial&&o(p,m)):m.isPointsMaterial?l(p,m,v,b):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Fn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Fn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);const v=e.get(m),b=v.envMap,S=v.envMapRotation;b&&(p.envMap.value=b,kr.copy(S),kr.x*=-1,kr.y*=-1,kr.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(kr.y*=-1,kr.z*=-1),p.envMapRotation.value.setFromMatrix4($b.makeRotationFromEuler(kr)),p.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function a(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function o(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,v,b){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*v,p.scale.value=b*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function d(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function f(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function h(p,m,v){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Fn&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=v.texture,p.transmissionSamplerSize.value.set(v.width,v.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function _(p,m){m.matcap&&(p.matcap.value=m.matcap)}function g(p,m){const v=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(v.matrixWorld),p.nearDistance.value=v.shadow.camera.near,p.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Zb(r,e,t,n){let i={},s={},a=[];const o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,b){const S=b.program;n.uniformBlockBinding(v,S)}function c(v,b){let S=i[v.id];S===void 0&&(_(v),S=u(v),i[v.id]=S,v.addEventListener("dispose",p));const w=b.program;n.updateUBOMapping(v,w);const E=e.render.frame;s[v.id]!==E&&(f(v),s[v.id]=E)}function u(v){const b=d();v.__bindingPointIndex=b;const S=r.createBuffer(),w=v.__size,E=v.usage;return r.bindBuffer(r.UNIFORM_BUFFER,S),r.bufferData(r.UNIFORM_BUFFER,w,E),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,b,S),S}function d(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return ht("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(v){const b=i[v.id],S=v.uniforms,w=v.__cache;r.bindBuffer(r.UNIFORM_BUFFER,b);for(let E=0,A=S.length;E<A;E++){const x=Array.isArray(S[E])?S[E]:[S[E]];for(let y=0,D=x.length;y<D;y++){const P=x[y];if(h(P,E,y,w)===!0){const I=P.__offset,k=Array.isArray(P.value)?P.value:[P.value];let V=0;for(let H=0;H<k.length;H++){const z=k[H],B=g(z);typeof z=="number"||typeof z=="boolean"?(P.__data[0]=z,r.bufferSubData(r.UNIFORM_BUFFER,I+V,P.__data)):z.isMatrix3?(P.__data[0]=z.elements[0],P.__data[1]=z.elements[1],P.__data[2]=z.elements[2],P.__data[3]=0,P.__data[4]=z.elements[3],P.__data[5]=z.elements[4],P.__data[6]=z.elements[5],P.__data[7]=0,P.__data[8]=z.elements[6],P.__data[9]=z.elements[7],P.__data[10]=z.elements[8],P.__data[11]=0):(z.toArray(P.__data,V),V+=B.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,I,P.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)}function h(v,b,S,w){const E=v.value,A=b+"_"+S;if(w[A]===void 0)return typeof E=="number"||typeof E=="boolean"?w[A]=E:w[A]=E.clone(),!0;{const x=w[A];if(typeof E=="number"||typeof E=="boolean"){if(x!==E)return w[A]=E,!0}else if(x.equals(E)===!1)return x.copy(E),!0}return!1}function _(v){const b=v.uniforms;let S=0;const w=16;for(let A=0,x=b.length;A<x;A++){const y=Array.isArray(b[A])?b[A]:[b[A]];for(let D=0,P=y.length;D<P;D++){const I=y[D],k=Array.isArray(I.value)?I.value:[I.value];for(let V=0,H=k.length;V<H;V++){const z=k[V],B=g(z),Q=S%w,ee=Q%B.boundary,L=Q+ee;S+=ee,L!==0&&w-L<B.storage&&(S+=w-L),I.__data=new Float32Array(B.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=S,S+=B.storage}}}const E=S%w;return E>0&&(S+=w-E),v.__size=S,v.__cache={},this}function g(v){const b={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(b.boundary=4,b.storage=4):v.isVector2?(b.boundary=8,b.storage=8):v.isVector3||v.isColor?(b.boundary=16,b.storage=12):v.isVector4?(b.boundary=16,b.storage=16):v.isMatrix3?(b.boundary=48,b.storage=48):v.isMatrix4?(b.boundary=64,b.storage=64):v.isTexture?je("WebGLRenderer: Texture samplers can not be part of an uniforms group."):je("WebGLRenderer: Unsupported uniform value type.",v),b}function p(v){const b=v.target;b.removeEventListener("dispose",p);const S=a.indexOf(b.__bindingPointIndex);a.splice(S,1),r.deleteBuffer(i[b.id]),delete i[b.id],delete s[b.id]}function m(){for(const v in i)r.deleteBuffer(i[v]);a=[],i={},s={}}return{bind:l,update:c,dispose:m}}const Jb=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let bi=null;function Qb(){return bi===null&&(bi=new Yx(Jb,16,16,Zs,nr),bi.name="DFG_LUT",bi.minFilter=vn,bi.magFilter=vn,bi.wrapS=Ki,bi.wrapT=Ki,bi.generateMipmaps=!1,bi.needsUpdate=!0),bi}class eE{constructor(e={}){const{canvas:t=bx(),context:n=null,depth:i=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:f=!1,outputBufferType:h=oi}=e;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=a;const g=h,p=new Set([Cf,Af,wf]),m=new Set([oi,Oi,ja,Ya,Ef,Tf]),v=new Uint32Array(4),b=new Int32Array(4);let S=null,w=null;const E=[],A=[];let x=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ni,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const y=this;let D=!1;this._outputColorSpace=ii;let P=0,I=0,k=null,V=-1,H=null;const z=new kt,B=new kt;let Q=null;const ee=new Mt(0);let L=0,ce=t.width,ue=t.height,ke=1,He=null,Ye=null;const K=new kt(0,0,ce,ue),te=new kt(0,0,ce,ue);let se=!1;const Ne=new Pm;let Ie=!1,Re=!1;const lt=new Wt,Ee=new j,ze=new kt,$e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Be=!1;function X(){return k===null?ke:1}let U=n;function pt(T,O){return t.getContext(T,O)}try{const T={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${yf}`),t.addEventListener("webglcontextlost",be,!1),t.addEventListener("webglcontextrestored",Fe,!1),t.addEventListener("webglcontextcreationerror",ut,!1),U===null){const O="webgl2";if(U=pt(O,T),U===null)throw pt(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw ht("WebGLRenderer: "+T.message),T}let et,Ve,Se,C,M,F,Z,J,q,xe,oe,Pe,Me,ie,ae,ye,Te,de,Ge,N,le,re,pe;function ne(){et=new ey(U),et.init(),le=new Wb(U,et),Ve=new jM(U,et,e,le),Se=new Hb(U,et),Ve.reversedDepthBuffer&&f&&Se.buffers.depth.setReversed(!0),C=new iy(U),M=new Cb,F=new Gb(U,et,Se,M,Ve,le,C),Z=new QM(y),J=new lv(U),re=new WM(U,J),q=new ty(U,J,C,re),xe=new sy(U,q,J,re,C),de=new ry(U,Ve,F),ae=new YM(M),oe=new Ab(y,Z,et,Ve,re,ae),Pe=new Kb(y,M),Me=new Pb,ie=new Fb(et),Te=new GM(y,Z,Se,xe,_,l),ye=new Vb(y,xe,Ve),pe=new Zb(U,C,Ve,Se),Ge=new XM(U,et,C),N=new ny(U,et,C),C.programs=oe.programs,y.capabilities=Ve,y.extensions=et,y.properties=M,y.renderLists=Me,y.shadowMap=ye,y.state=Se,y.info=C}ne(),g!==oi&&(x=new oy(g,t.width,t.height,i,s));const $=new qb(y,U);this.xr=$,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const T=et.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){const T=et.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return ke},this.setPixelRatio=function(T){T!==void 0&&(ke=T,this.setSize(ce,ue,!1))},this.getSize=function(T){return T.set(ce,ue)},this.setSize=function(T,O,Y=!0){if($.isPresenting){je("WebGLRenderer: Can't change size while VR device is presenting.");return}ce=T,ue=O,t.width=Math.floor(T*ke),t.height=Math.floor(O*ke),Y===!0&&(t.style.width=T+"px",t.style.height=O+"px"),x!==null&&x.setSize(t.width,t.height),this.setViewport(0,0,T,O)},this.getDrawingBufferSize=function(T){return T.set(ce*ke,ue*ke).floor()},this.setDrawingBufferSize=function(T,O,Y){ce=T,ue=O,ke=Y,t.width=Math.floor(T*Y),t.height=Math.floor(O*Y),this.setViewport(0,0,T,O)},this.setEffects=function(T){if(g===oi){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let O=0;O<T.length;O++)if(T[O].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}x.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(z)},this.getViewport=function(T){return T.copy(K)},this.setViewport=function(T,O,Y,W){T.isVector4?K.set(T.x,T.y,T.z,T.w):K.set(T,O,Y,W),Se.viewport(z.copy(K).multiplyScalar(ke).round())},this.getScissor=function(T){return T.copy(te)},this.setScissor=function(T,O,Y,W){T.isVector4?te.set(T.x,T.y,T.z,T.w):te.set(T,O,Y,W),Se.scissor(B.copy(te).multiplyScalar(ke).round())},this.getScissorTest=function(){return se},this.setScissorTest=function(T){Se.setScissorTest(se=T)},this.setOpaqueSort=function(T){He=T},this.setTransparentSort=function(T){Ye=T},this.getClearColor=function(T){return T.copy(Te.getClearColor())},this.setClearColor=function(){Te.setClearColor(...arguments)},this.getClearAlpha=function(){return Te.getClearAlpha()},this.setClearAlpha=function(){Te.setClearAlpha(...arguments)},this.clear=function(T=!0,O=!0,Y=!0){let W=0;if(T){let G=!1;if(k!==null){const fe=k.texture.format;G=p.has(fe)}if(G){const fe=k.texture.type,me=m.has(fe),he=Te.getClearColor(),Ae=Te.getClearAlpha(),we=he.r,Ke=he.g,tt=he.b;me?(v[0]=we,v[1]=Ke,v[2]=tt,v[3]=Ae,U.clearBufferuiv(U.COLOR,0,v)):(b[0]=we,b[1]=Ke,b[2]=tt,b[3]=Ae,U.clearBufferiv(U.COLOR,0,b))}else W|=U.COLOR_BUFFER_BIT}O&&(W|=U.DEPTH_BUFFER_BIT),Y&&(W|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&U.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",be,!1),t.removeEventListener("webglcontextrestored",Fe,!1),t.removeEventListener("webglcontextcreationerror",ut,!1),Te.dispose(),Me.dispose(),ie.dispose(),M.dispose(),Z.dispose(),xe.dispose(),re.dispose(),pe.dispose(),oe.dispose(),$.dispose(),$.removeEventListener("sessionstart",Xe),$.removeEventListener("sessionend",Ft),qe.stop()};function be(T){T.preventDefault(),zh("WebGLRenderer: Context Lost."),D=!0}function Fe(){zh("WebGLRenderer: Context Restored."),D=!1;const T=C.autoReset,O=ye.enabled,Y=ye.autoUpdate,W=ye.needsUpdate,G=ye.type;ne(),C.autoReset=T,ye.enabled=O,ye.autoUpdate=Y,ye.needsUpdate=W,ye.type=G}function ut(T){ht("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function ve(T){const O=T.target;O.removeEventListener("dispose",ve),De(O)}function De(T){Ze(T),M.remove(T)}function Ze(T){const O=M.get(T).programs;O!==void 0&&(O.forEach(function(Y){oe.releaseProgram(Y)}),T.isShaderMaterial&&oe.releaseShaderCache(T))}this.renderBufferDirect=function(T,O,Y,W,G,fe){O===null&&(O=$e);const me=G.isMesh&&G.matrixWorld.determinant()<0,he=Qn(T,O,Y,W,G);Se.setMaterial(W,me);let Ae=Y.index,we=1;if(W.wireframe===!0){if(Ae=q.getWireframeAttribute(Y),Ae===void 0)return;we=2}const Ke=Y.drawRange,tt=Y.attributes.position;let Ue=Ke.start*we,vt=(Ke.start+Ke.count)*we;fe!==null&&(Ue=Math.max(Ue,fe.start*we),vt=Math.min(vt,(fe.start+fe.count)*we)),Ae!==null?(Ue=Math.max(Ue,0),vt=Math.min(vt,Ae.count)):tt!=null&&(Ue=Math.max(Ue,0),vt=Math.min(vt,tt.count));const Ot=vt-Ue;if(Ot<0||Ot===1/0)return;re.setup(G,W,he,Y,Ae);let It,St=Ge;if(Ae!==null&&(It=J.get(Ae),St=N,St.setIndex(It)),G.isMesh)W.wireframe===!0?(Se.setLineWidth(W.wireframeLinewidth*X()),St.setMode(U.LINES)):St.setMode(U.TRIANGLES);else if(G.isLine){let hn=W.linewidth;hn===void 0&&(hn=1),Se.setLineWidth(hn*X()),G.isLineSegments?St.setMode(U.LINES):G.isLineLoop?St.setMode(U.LINE_LOOP):St.setMode(U.LINE_STRIP)}else G.isPoints?St.setMode(U.POINTS):G.isSprite&&St.setMode(U.TRIANGLES);if(G.isBatchedMesh)if(G._multiDrawInstances!==null)Ml("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),St.renderMultiDrawInstances(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount,G._multiDrawInstances);else if(et.get("WEBGL_multi_draw"))St.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{const hn=G._multiDrawStarts,Le=G._multiDrawCounts,Bn=G._multiDrawCount,ft=Ae?J.get(Ae).bytesPerElement:1,hi=M.get(W).currentProgram.getUniforms();for(let Mi=0;Mi<Bn;Mi++)hi.setValue(U,"_gl_DrawID",Mi),St.render(hn[Mi]/ft,Le[Mi])}else if(G.isInstancedMesh)St.renderInstances(Ue,Ot,G.count);else if(Y.isInstancedBufferGeometry){const hn=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Le=Math.min(Y.instanceCount,hn);St.renderInstances(Ue,Ot,Le)}else St.render(Ue,Ot)};function _e(T,O,Y){T.transparent===!0&&T.side===qi&&T.forceSinglePass===!1?(T.side=Fn,T.needsUpdate=!0,un(T,O,Y),T.side=Rr,T.needsUpdate=!0,un(T,O,Y),T.side=qi):un(T,O,Y)}this.compile=function(T,O,Y=null){Y===null&&(Y=T),w=ie.get(Y),w.init(O),A.push(w),Y.traverseVisible(function(G){G.isLight&&G.layers.test(O.layers)&&(w.pushLight(G),G.castShadow&&w.pushShadow(G))}),T!==Y&&T.traverseVisible(function(G){G.isLight&&G.layers.test(O.layers)&&(w.pushLight(G),G.castShadow&&w.pushShadow(G))}),w.setupLights();const W=new Set;return T.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;const fe=G.material;if(fe)if(Array.isArray(fe))for(let me=0;me<fe.length;me++){const he=fe[me];_e(he,Y,G),W.add(he)}else _e(fe,Y,G),W.add(fe)}),w=A.pop(),W},this.compileAsync=function(T,O,Y=null){const W=this.compile(T,O,Y);return new Promise(G=>{function fe(){if(W.forEach(function(me){M.get(me).currentProgram.isReady()&&W.delete(me)}),W.size===0){G(T);return}setTimeout(fe,10)}et.get("KHR_parallel_shader_compile")!==null?fe():setTimeout(fe,10)})};let We=null;function Oe(T){We&&We(T)}function Xe(){qe.stop()}function Ft(){qe.start()}const qe=new Fm;qe.setAnimationLoop(Oe),typeof self<"u"&&qe.setContext(self),this.setAnimationLoop=function(T){We=T,$.setAnimationLoop(T),T===null?qe.stop():qe.start()},$.addEventListener("sessionstart",Xe),$.addEventListener("sessionend",Ft),this.render=function(T,O){if(O!==void 0&&O.isCamera!==!0){ht("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;const Y=$.enabled===!0&&$.isPresenting===!0,W=x!==null&&(k===null||Y)&&x.begin(y,k);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),$.enabled===!0&&$.isPresenting===!0&&(x===null||x.isCompositing()===!1)&&($.cameraAutoUpdate===!0&&$.updateCamera(O),O=$.getCamera()),T.isScene===!0&&T.onBeforeRender(y,T,O,k),w=ie.get(T,A.length),w.init(O),A.push(w),lt.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),Ne.setFromProjectionMatrix(lt,Di,O.reversedDepth),Re=this.localClippingEnabled,Ie=ae.init(this.clippingPlanes,Re),S=Me.get(T,E.length),S.init(),E.push(S),$.enabled===!0&&$.isPresenting===!0){const me=y.xr.getDepthSensingMesh();me!==null&&At(me,O,-1/0,y.sortObjects)}At(T,O,0,y.sortObjects),S.finish(),y.sortObjects===!0&&S.sort(He,Ye),Be=$.enabled===!1||$.isPresenting===!1||$.hasDepthSensing()===!1,Be&&Te.addToRenderList(S,T),this.info.render.frame++,Ie===!0&&ae.beginShadows();const G=w.state.shadowsArray;if(ye.render(G,T,O),Ie===!0&&ae.endShadows(),this.info.autoReset===!0&&this.info.reset(),(W&&x.hasRenderPass())===!1){const me=S.opaque,he=S.transmissive;if(w.setupLights(),O.isArrayCamera){const Ae=O.cameras;if(he.length>0)for(let we=0,Ke=Ae.length;we<Ke;we++){const tt=Ae[we];Ct(me,he,T,tt)}Be&&Te.render(T);for(let we=0,Ke=Ae.length;we<Ke;we++){const tt=Ae[we];Xt(S,T,tt,tt.viewport)}}else he.length>0&&Ct(me,he,T,O),Be&&Te.render(T),Xt(S,T,O)}k!==null&&I===0&&(F.updateMultisampleRenderTarget(k),F.updateRenderTargetMipmap(k)),W&&x.end(y),T.isScene===!0&&T.onAfterRender(y,T,O),re.resetDefaultState(),V=-1,H=null,A.pop(),A.length>0?(w=A[A.length-1],Ie===!0&&ae.setGlobalState(y.clippingPlanes,w.state.camera)):w=null,E.pop(),E.length>0?S=E[E.length-1]:S=null};function At(T,O,Y,W){if(T.visible===!1)return;if(T.layers.test(O.layers)){if(T.isGroup)Y=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(O);else if(T.isLight)w.pushLight(T),T.castShadow&&w.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||Ne.intersectsSprite(T)){W&&ze.setFromMatrixPosition(T.matrixWorld).applyMatrix4(lt);const me=xe.update(T),he=T.material;he.visible&&S.push(T,me,he,Y,ze.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||Ne.intersectsObject(T))){const me=xe.update(T),he=T.material;if(W&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),ze.copy(T.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),ze.copy(me.boundingSphere.center)),ze.applyMatrix4(T.matrixWorld).applyMatrix4(lt)),Array.isArray(he)){const Ae=me.groups;for(let we=0,Ke=Ae.length;we<Ke;we++){const tt=Ae[we],Ue=he[tt.materialIndex];Ue&&Ue.visible&&S.push(T,me,Ue,Y,ze.z,tt)}}else he.visible&&S.push(T,me,he,Y,ze.z,null)}}const fe=T.children;for(let me=0,he=fe.length;me<he;me++)At(fe[me],O,Y,W)}function Xt(T,O,Y,W){const{opaque:G,transmissive:fe,transparent:me}=T;w.setupLightsView(Y),Ie===!0&&ae.setGlobalState(y.clippingPlanes,Y),W&&Se.viewport(z.copy(W)),G.length>0&&gt(G,O,Y),fe.length>0&&gt(fe,O,Y),me.length>0&&gt(me,O,Y),Se.buffers.depth.setTest(!0),Se.buffers.depth.setMask(!0),Se.buffers.color.setMask(!0),Se.setPolygonOffset(!1)}function Ct(T,O,Y,W){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[W.id]===void 0){const Ue=et.has("EXT_color_buffer_half_float")||et.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[W.id]=new Ii(1,1,{generateMipmaps:!0,type:Ue?nr:oi,minFilter:qr,samples:Math.max(4,Ve.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ct.workingColorSpace})}const fe=w.state.transmissionRenderTarget[W.id],me=W.viewport||z;fe.setSize(me.z*y.transmissionResolutionScale,me.w*y.transmissionResolutionScale);const he=y.getRenderTarget(),Ae=y.getActiveCubeFace(),we=y.getActiveMipmapLevel();y.setRenderTarget(fe),y.getClearColor(ee),L=y.getClearAlpha(),L<1&&y.setClearColor(16777215,.5),y.clear(),Be&&Te.render(Y);const Ke=y.toneMapping;y.toneMapping=Ni;const tt=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),w.setupLightsView(W),Ie===!0&&ae.setGlobalState(y.clippingPlanes,W),gt(T,Y,W),F.updateMultisampleRenderTarget(fe),F.updateRenderTargetMipmap(fe),et.has("WEBGL_multisampled_render_to_texture")===!1){let Ue=!1;for(let vt=0,Ot=O.length;vt<Ot;vt++){const It=O[vt],{object:St,geometry:hn,material:Le,group:Bn}=It;if(Le.side===qi&&St.layers.test(W.layers)){const ft=Le.side;Le.side=Fn,Le.needsUpdate=!0,mt(St,Y,W,hn,Le,Bn),Le.side=ft,Le.needsUpdate=!0,Ue=!0}}Ue===!0&&(F.updateMultisampleRenderTarget(fe),F.updateRenderTargetMipmap(fe))}y.setRenderTarget(he,Ae,we),y.setClearColor(ee,L),tt!==void 0&&(W.viewport=tt),y.toneMapping=Ke}function gt(T,O,Y){const W=O.isScene===!0?O.overrideMaterial:null;for(let G=0,fe=T.length;G<fe;G++){const me=T[G],{object:he,geometry:Ae,group:we}=me;let Ke=me.material;Ke.allowOverride===!0&&W!==null&&(Ke=W),he.layers.test(Y.layers)&&mt(he,O,Y,Ae,Ke,we)}}function mt(T,O,Y,W,G,fe){T.onBeforeRender(y,O,Y,W,G,fe),T.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),G.onBeforeRender(y,O,Y,W,T,fe),G.transparent===!0&&G.side===qi&&G.forceSinglePass===!1?(G.side=Fn,G.needsUpdate=!0,y.renderBufferDirect(Y,O,W,G,T,fe),G.side=Rr,G.needsUpdate=!0,y.renderBufferDirect(Y,O,W,G,T,fe),G.side=qi):y.renderBufferDirect(Y,O,W,G,T,fe),T.onAfterRender(y,O,Y,W,G,fe)}function un(T,O,Y){O.isScene!==!0&&(O=$e);const W=M.get(T),G=w.state.lights,fe=w.state.shadowsArray,me=G.state.version,he=oe.getParameters(T,G.state,fe,O,Y),Ae=oe.getProgramCacheKey(he);let we=W.programs;W.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?O.environment:null,W.fog=O.fog;const Ke=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;W.envMap=Z.get(T.envMap||W.environment,Ke),W.envMapRotation=W.environment!==null&&T.envMap===null?O.environmentRotation:T.envMapRotation,we===void 0&&(T.addEventListener("dispose",ve),we=new Map,W.programs=we);let tt=we.get(Ae);if(tt!==void 0){if(W.currentProgram===tt&&W.lightsStateVersion===me)return fn(T,he),tt}else he.uniforms=oe.getUniforms(T),T.onBeforeCompile(he,y),tt=oe.acquireProgram(he,Ae),we.set(Ae,tt),W.uniforms=he.uniforms;const Ue=W.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Ue.clippingPlanes=ae.uniform),fn(T,he),W.needsLights=Yt(T),W.lightsStateVersion=me,W.needsLights&&(Ue.ambientLightColor.value=G.state.ambient,Ue.lightProbe.value=G.state.probe,Ue.directionalLights.value=G.state.directional,Ue.directionalLightShadows.value=G.state.directionalShadow,Ue.spotLights.value=G.state.spot,Ue.spotLightShadows.value=G.state.spotShadow,Ue.rectAreaLights.value=G.state.rectArea,Ue.ltc_1.value=G.state.rectAreaLTC1,Ue.ltc_2.value=G.state.rectAreaLTC2,Ue.pointLights.value=G.state.point,Ue.pointLightShadows.value=G.state.pointShadow,Ue.hemisphereLights.value=G.state.hemi,Ue.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Ue.spotLightMatrix.value=G.state.spotLightMatrix,Ue.spotLightMap.value=G.state.spotLightMap,Ue.pointShadowMatrix.value=G.state.pointShadowMatrix),W.currentProgram=tt,W.uniformsList=null,tt}function Tt(T){if(T.uniformsList===null){const O=T.currentProgram.getUniforms();T.uniformsList=al.seqWithValue(O.seq,T.uniforms)}return T.uniformsList}function fn(T,O){const Y=M.get(T);Y.outputColorSpace=O.outputColorSpace,Y.batching=O.batching,Y.batchingColor=O.batchingColor,Y.instancing=O.instancing,Y.instancingColor=O.instancingColor,Y.instancingMorph=O.instancingMorph,Y.skinning=O.skinning,Y.morphTargets=O.morphTargets,Y.morphNormals=O.morphNormals,Y.morphColors=O.morphColors,Y.morphTargetsCount=O.morphTargetsCount,Y.numClippingPlanes=O.numClippingPlanes,Y.numIntersection=O.numClipIntersection,Y.vertexAlphas=O.vertexAlphas,Y.vertexTangents=O.vertexTangents,Y.toneMapping=O.toneMapping}function Qn(T,O,Y,W,G){O.isScene!==!0&&(O=$e),F.resetTextureUnits();const fe=O.fog,me=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?O.environment:null,he=k===null?y.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:Js,Ae=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,we=Z.get(W.envMap||me,Ae),Ke=W.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,tt=!!Y.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Ue=!!Y.morphAttributes.position,vt=!!Y.morphAttributes.normal,Ot=!!Y.morphAttributes.color;let It=Ni;W.toneMapped&&(k===null||k.isXRRenderTarget===!0)&&(It=y.toneMapping);const St=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,hn=St!==void 0?St.length:0,Le=M.get(W),Bn=w.state.lights;if(Ie===!0&&(Re===!0||T!==H)){const Qt=T===H&&W.id===V;ae.setState(W,T,Qt)}let ft=!1;W.version===Le.__version?(Le.needsLights&&Le.lightsStateVersion!==Bn.state.version||Le.outputColorSpace!==he||G.isBatchedMesh&&Le.batching===!1||!G.isBatchedMesh&&Le.batching===!0||G.isBatchedMesh&&Le.batchingColor===!0&&G.colorTexture===null||G.isBatchedMesh&&Le.batchingColor===!1&&G.colorTexture!==null||G.isInstancedMesh&&Le.instancing===!1||!G.isInstancedMesh&&Le.instancing===!0||G.isSkinnedMesh&&Le.skinning===!1||!G.isSkinnedMesh&&Le.skinning===!0||G.isInstancedMesh&&Le.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Le.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Le.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Le.instancingMorph===!1&&G.morphTexture!==null||Le.envMap!==we||W.fog===!0&&Le.fog!==fe||Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==ae.numPlanes||Le.numIntersection!==ae.numIntersection)||Le.vertexAlphas!==Ke||Le.vertexTangents!==tt||Le.morphTargets!==Ue||Le.morphNormals!==vt||Le.morphColors!==Ot||Le.toneMapping!==It||Le.morphTargetsCount!==hn)&&(ft=!0):(ft=!0,Le.__version=W.version);let hi=Le.currentProgram;ft===!0&&(hi=un(W,O,G));let Mi=!1,Dr=!1,cs=!1;const yt=hi.getUniforms(),an=Le.uniforms;if(Se.useProgram(hi.program)&&(Mi=!0,Dr=!0,cs=!0),W.id!==V&&(V=W.id,Dr=!0),Mi||H!==T){Se.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),yt.setValue(U,"projectionMatrix",T.projectionMatrix),yt.setValue(U,"viewMatrix",T.matrixWorldInverse);const ar=yt.map.cameraPosition;ar!==void 0&&ar.setValue(U,Ee.setFromMatrixPosition(T.matrixWorld)),Ve.logarithmicDepthBuffer&&yt.setValue(U,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&yt.setValue(U,"isOrthographic",T.isOrthographicCamera===!0),H!==T&&(H=T,Dr=!0,cs=!0)}if(Le.needsLights&&(Bn.state.directionalShadowMap.length>0&&yt.setValue(U,"directionalShadowMap",Bn.state.directionalShadowMap,F),Bn.state.spotShadowMap.length>0&&yt.setValue(U,"spotShadowMap",Bn.state.spotShadowMap,F),Bn.state.pointShadowMap.length>0&&yt.setValue(U,"pointShadowMap",Bn.state.pointShadowMap,F)),G.isSkinnedMesh){yt.setOptional(U,G,"bindMatrix"),yt.setOptional(U,G,"bindMatrixInverse");const Qt=G.skeleton;Qt&&(Qt.boneTexture===null&&Qt.computeBoneTexture(),yt.setValue(U,"boneTexture",Qt.boneTexture,F))}G.isBatchedMesh&&(yt.setOptional(U,G,"batchingTexture"),yt.setValue(U,"batchingTexture",G._matricesTexture,F),yt.setOptional(U,G,"batchingIdTexture"),yt.setValue(U,"batchingIdTexture",G._indirectTexture,F),yt.setOptional(U,G,"batchingColorTexture"),G._colorsTexture!==null&&yt.setValue(U,"batchingColorTexture",G._colorsTexture,F));const sr=Y.morphAttributes;if((sr.position!==void 0||sr.normal!==void 0||sr.color!==void 0)&&de.update(G,Y,hi),(Dr||Le.receiveShadow!==G.receiveShadow)&&(Le.receiveShadow=G.receiveShadow,yt.setValue(U,"receiveShadow",G.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&O.environment!==null&&(an.envMapIntensity.value=O.environmentIntensity),an.dfgLUT!==void 0&&(an.dfgLUT.value=Qb()),Dr&&(yt.setValue(U,"toneMappingExposure",y.toneMappingExposure),Le.needsLights&&jt(an,cs),fe&&W.fog===!0&&Pe.refreshFogUniforms(an,fe),Pe.refreshMaterialUniforms(an,W,ke,ue,w.state.transmissionRenderTarget[T.id]),al.upload(U,Tt(Le),an,F)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(al.upload(U,Tt(Le),an,F),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&yt.setValue(U,"center",G.center),yt.setValue(U,"modelViewMatrix",G.modelViewMatrix),yt.setValue(U,"normalMatrix",G.normalMatrix),yt.setValue(U,"modelMatrix",G.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){const Qt=W.uniformsGroups;for(let ar=0,us=Qt.length;ar<us;ar++){const Uf=Qt[ar];pe.update(Uf,hi),pe.bind(Uf,hi)}}return hi}function jt(T,O){T.ambientLightColor.needsUpdate=O,T.lightProbe.needsUpdate=O,T.directionalLights.needsUpdate=O,T.directionalLightShadows.needsUpdate=O,T.pointLights.needsUpdate=O,T.pointLightShadows.needsUpdate=O,T.spotLights.needsUpdate=O,T.spotLightShadows.needsUpdate=O,T.rectAreaLights.needsUpdate=O,T.hemisphereLights.needsUpdate=O}function Yt(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return k},this.setRenderTargetTextures=function(T,O,Y){const W=M.get(T);W.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),M.get(T.texture).__webglTexture=O,M.get(T.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:Y,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,O){const Y=M.get(T);Y.__webglFramebuffer=O,Y.__useDefaultFramebuffer=O===void 0};const Jt=U.createFramebuffer();this.setRenderTarget=function(T,O=0,Y=0){k=T,P=O,I=Y;let W=null,G=!1,fe=!1;if(T){const he=M.get(T);if(he.__useDefaultFramebuffer!==void 0){Se.bindFramebuffer(U.FRAMEBUFFER,he.__webglFramebuffer),z.copy(T.viewport),B.copy(T.scissor),Q=T.scissorTest,Se.viewport(z),Se.scissor(B),Se.setScissorTest(Q),V=-1;return}else if(he.__webglFramebuffer===void 0)F.setupRenderTarget(T);else if(he.__hasExternalTextures)F.rebindTextures(T,M.get(T.texture).__webglTexture,M.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){const Ke=T.depthTexture;if(he.__boundDepthTexture!==Ke){if(Ke!==null&&M.has(Ke)&&(T.width!==Ke.image.width||T.height!==Ke.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");F.setupDepthRenderbuffer(T)}}const Ae=T.texture;(Ae.isData3DTexture||Ae.isDataArrayTexture||Ae.isCompressedArrayTexture)&&(fe=!0);const we=M.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(we[O])?W=we[O][Y]:W=we[O],G=!0):T.samples>0&&F.useMultisampledRTT(T)===!1?W=M.get(T).__webglMultisampledFramebuffer:Array.isArray(we)?W=we[Y]:W=we,z.copy(T.viewport),B.copy(T.scissor),Q=T.scissorTest}else z.copy(K).multiplyScalar(ke).floor(),B.copy(te).multiplyScalar(ke).floor(),Q=se;if(Y!==0&&(W=Jt),Se.bindFramebuffer(U.FRAMEBUFFER,W)&&Se.drawBuffers(T,W),Se.viewport(z),Se.scissor(B),Se.setScissorTest(Q),G){const he=M.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+O,he.__webglTexture,Y)}else if(fe){const he=O;for(let Ae=0;Ae<T.textures.length;Ae++){const we=M.get(T.textures[Ae]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Ae,we.__webglTexture,Y,he)}}else if(T!==null&&Y!==0){const he=M.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,he.__webglTexture,Y)}V=-1},this.readRenderTargetPixels=function(T,O,Y,W,G,fe,me,he=0){if(!(T&&T.isWebGLRenderTarget)){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ae=M.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&me!==void 0&&(Ae=Ae[me]),Ae){Se.bindFramebuffer(U.FRAMEBUFFER,Ae);try{const we=T.textures[he],Ke=we.format,tt=we.type;if(T.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+he),!Ve.textureFormatReadable(Ke)){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ve.textureTypeReadable(tt)){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=T.width-W&&Y>=0&&Y<=T.height-G&&U.readPixels(O,Y,W,G,le.convert(Ke),le.convert(tt),fe)}finally{const we=k!==null?M.get(k).__webglFramebuffer:null;Se.bindFramebuffer(U.FRAMEBUFFER,we)}}},this.readRenderTargetPixelsAsync=async function(T,O,Y,W,G,fe,me,he=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ae=M.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&me!==void 0&&(Ae=Ae[me]),Ae)if(O>=0&&O<=T.width-W&&Y>=0&&Y<=T.height-G){Se.bindFramebuffer(U.FRAMEBUFFER,Ae);const we=T.textures[he],Ke=we.format,tt=we.type;if(T.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+he),!Ve.textureFormatReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ve.textureTypeReadable(tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ue=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Ue),U.bufferData(U.PIXEL_PACK_BUFFER,fe.byteLength,U.STREAM_READ),U.readPixels(O,Y,W,G,le.convert(Ke),le.convert(tt),0);const vt=k!==null?M.get(k).__webglFramebuffer:null;Se.bindFramebuffer(U.FRAMEBUFFER,vt);const Ot=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Ex(U,Ot,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Ue),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,fe),U.deleteBuffer(Ue),U.deleteSync(Ot),fe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,O=null,Y=0){const W=Math.pow(2,-Y),G=Math.floor(T.image.width*W),fe=Math.floor(T.image.height*W),me=O!==null?O.x:0,he=O!==null?O.y:0;F.setTexture2D(T,0),U.copyTexSubImage2D(U.TEXTURE_2D,Y,0,0,me,he,G,fe),Se.unbindTexture()};const ki=U.createFramebuffer(),ls=U.createFramebuffer();this.copyTextureToTexture=function(T,O,Y=null,W=null,G=0,fe=0){let me,he,Ae,we,Ke,tt,Ue,vt,Ot;const It=T.isCompressedTexture?T.mipmaps[fe]:T.image;if(Y!==null)me=Y.max.x-Y.min.x,he=Y.max.y-Y.min.y,Ae=Y.isBox3?Y.max.z-Y.min.z:1,we=Y.min.x,Ke=Y.min.y,tt=Y.isBox3?Y.min.z:0;else{const an=Math.pow(2,-G);me=Math.floor(It.width*an),he=Math.floor(It.height*an),T.isDataArrayTexture?Ae=It.depth:T.isData3DTexture?Ae=Math.floor(It.depth*an):Ae=1,we=0,Ke=0,tt=0}W!==null?(Ue=W.x,vt=W.y,Ot=W.z):(Ue=0,vt=0,Ot=0);const St=le.convert(O.format),hn=le.convert(O.type);let Le;O.isData3DTexture?(F.setTexture3D(O,0),Le=U.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(F.setTexture2DArray(O,0),Le=U.TEXTURE_2D_ARRAY):(F.setTexture2D(O,0),Le=U.TEXTURE_2D),U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,O.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,O.unpackAlignment);const Bn=U.getParameter(U.UNPACK_ROW_LENGTH),ft=U.getParameter(U.UNPACK_IMAGE_HEIGHT),hi=U.getParameter(U.UNPACK_SKIP_PIXELS),Mi=U.getParameter(U.UNPACK_SKIP_ROWS),Dr=U.getParameter(U.UNPACK_SKIP_IMAGES);U.pixelStorei(U.UNPACK_ROW_LENGTH,It.width),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,It.height),U.pixelStorei(U.UNPACK_SKIP_PIXELS,we),U.pixelStorei(U.UNPACK_SKIP_ROWS,Ke),U.pixelStorei(U.UNPACK_SKIP_IMAGES,tt);const cs=T.isDataArrayTexture||T.isData3DTexture,yt=O.isDataArrayTexture||O.isData3DTexture;if(T.isDepthTexture){const an=M.get(T),sr=M.get(O),Qt=M.get(an.__renderTarget),ar=M.get(sr.__renderTarget);Se.bindFramebuffer(U.READ_FRAMEBUFFER,Qt.__webglFramebuffer),Se.bindFramebuffer(U.DRAW_FRAMEBUFFER,ar.__webglFramebuffer);for(let us=0;us<Ae;us++)cs&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,M.get(T).__webglTexture,G,tt+us),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,M.get(O).__webglTexture,fe,Ot+us)),U.blitFramebuffer(we,Ke,me,he,Ue,vt,me,he,U.DEPTH_BUFFER_BIT,U.NEAREST);Se.bindFramebuffer(U.READ_FRAMEBUFFER,null),Se.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(G!==0||T.isRenderTargetTexture||M.has(T)){const an=M.get(T),sr=M.get(O);Se.bindFramebuffer(U.READ_FRAMEBUFFER,ki),Se.bindFramebuffer(U.DRAW_FRAMEBUFFER,ls);for(let Qt=0;Qt<Ae;Qt++)cs?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,an.__webglTexture,G,tt+Qt):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,an.__webglTexture,G),yt?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,sr.__webglTexture,fe,Ot+Qt):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,sr.__webglTexture,fe),G!==0?U.blitFramebuffer(we,Ke,me,he,Ue,vt,me,he,U.COLOR_BUFFER_BIT,U.NEAREST):yt?U.copyTexSubImage3D(Le,fe,Ue,vt,Ot+Qt,we,Ke,me,he):U.copyTexSubImage2D(Le,fe,Ue,vt,we,Ke,me,he);Se.bindFramebuffer(U.READ_FRAMEBUFFER,null),Se.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else yt?T.isDataTexture||T.isData3DTexture?U.texSubImage3D(Le,fe,Ue,vt,Ot,me,he,Ae,St,hn,It.data):O.isCompressedArrayTexture?U.compressedTexSubImage3D(Le,fe,Ue,vt,Ot,me,he,Ae,St,It.data):U.texSubImage3D(Le,fe,Ue,vt,Ot,me,he,Ae,St,hn,It):T.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,fe,Ue,vt,me,he,St,hn,It.data):T.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,fe,Ue,vt,It.width,It.height,St,It.data):U.texSubImage2D(U.TEXTURE_2D,fe,Ue,vt,me,he,St,hn,It);U.pixelStorei(U.UNPACK_ROW_LENGTH,Bn),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ft),U.pixelStorei(U.UNPACK_SKIP_PIXELS,hi),U.pixelStorei(U.UNPACK_SKIP_ROWS,Mi),U.pixelStorei(U.UNPACK_SKIP_IMAGES,Dr),fe===0&&O.generateMipmaps&&U.generateMipmap(Le),Se.unbindTexture()},this.initRenderTarget=function(T){M.get(T).__webglFramebuffer===void 0&&F.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?F.setTextureCube(T,0):T.isData3DTexture?F.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?F.setTexture2DArray(T,0):F.setTexture2D(T,0),Se.unbindTexture()},this.resetState=function(){P=0,I=0,k=null,Se.reset(),re.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Di}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ct._getDrawingBufferColorSpace(e),t.unpackColorSpace=ct._getUnpackColorSpace()}}const tE=`
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`,nE=`
uniform float uTime;
uniform float uDisplacement;
varying vec3 vNormal;
varying vec3 vPosition;
${tE}
void main() {
  vNormal = normal;
  vPosition = position;
  vec3 pos = position;
  float noise = snoise(pos * 1.5 + uTime * 0.3);
  pos += normal * noise * uDisplacement;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`,iE=`
uniform float uScroll;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vec3 forestGreen = vec3(0.176, 0.353, 0.239);
  vec3 canopyDark = vec3(0.102, 0.227, 0.165);
  vec3 baseColor = mix(forestGreen, canopyDark, uScroll);
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
  vec3 glowColor = vec3(0.29, 0.87, 0.5);
  vec3 finalColor = baseColor + glowColor * fresnel * 0.15;
  gl_FragColor = vec4(finalColor, 0.85);
}
`;let da=null;function rE(){return da&&da.isConnected||(da=document.getElementById("section-d")),da}function sE(r){let e;r<.15?e=.5:r>.78?e=.15:e=.5-(r-.15)/.63*.35;const t=rE();if(t){const n=t.getBoundingClientRect(),i=window.innerHeight;if(n.top<i*.85&&n.bottom>i*.15)return 0}return e}function aE(){const r=Rt.useRef(null);return Rt.useEffect(()=>{if(window.innerWidth<768||window.matchMedia("(prefers-reduced-motion: reduce)").matches||window.matchMedia("(hover: none)").matches)return;const e=r.current;if(!e)return;const t=new zx,n=new ai(50,window.innerWidth/window.innerHeight,.1,100);n.position.z=5;let i;try{i=new eE({canvas:e,antialias:!0,alpha:!0})}catch{e.style.display="none";return}i.setPixelRatio(Math.min(window.devicePixelRatio,2)),i.setSize(window.innerWidth,window.innerHeight),i.setClearColor(0,0);const s=new yl(2,64),a=new Si({vertexShader:nE,fragmentShader:iE,uniforms:{uTime:{value:0},uScroll:{value:0},uDisplacement:{value:.15}},transparent:!0}),o=new vi(s,a);t.add(o);const l=new yl(2,16),c=new Nf({color:15789543,wireframe:!0,transparent:!0,opacity:.06}),u=new vi(l,c);t.add(u);let d=0,f=.3;function h(){const v=document.documentElement.scrollHeight-window.innerHeight;d=v>0?window.scrollY/v:0}window.addEventListener("scroll",h,{passive:!0}),h();let _;function g(){_=requestAnimationFrame(g),a.uniforms.uTime.value+=.008,a.uniforms.uScroll.value=d,a.uniforms.uDisplacement.value=.15+d*.4,o.rotation.y=d*Math.PI*.5,o.rotation.x=Math.sin(d*Math.PI)*.2,u.rotation.copy(o.rotation);const v=1.2+Math.sin(d*Math.PI)*.25;o.scale.setScalar(v),u.scale.setScalar(v);const b=sE(d);f+=(b-f)*.05,e.style.opacity=f,i.render(t,n)}g();let p;function m(){clearTimeout(p),p=setTimeout(()=>{n.aspect=window.innerWidth/window.innerHeight,n.updateProjectionMatrix(),i.setSize(window.innerWidth,window.innerHeight)},250)}return window.addEventListener("resize",m),()=>{_&&cancelAnimationFrame(_),window.removeEventListener("scroll",h),window.removeEventListener("resize",m),clearTimeout(p),i.dispose(),s.dispose(),a.dispose(),l.dispose(),c.dispose()}},[]),R.jsx("canvas",{ref:r,className:"landing-canvas","aria-hidden":"true",role:"presentation"})}function oE(){return R.jsxs("svg",{className:"grain-overlay","aria-hidden":"true",xmlns:"http://www.w3.org/2000/svg",children:[R.jsx("filter",{id:"grain",children:R.jsx("feTurbulence",{type:"fractalNoise",baseFrequency:"0.85",numOctaves:"4",stitchTiles:"stitch"})}),R.jsx("rect",{width:"100%",height:"100%",filter:"url(#grain)"})]})}function lE(){const r=Rt.useRef(null);return Rt.useEffect(()=>{if(window.matchMedia("(hover: none)").matches||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const e=r.current;if(!e)return;const t=ni.quickTo(e,"left",{duration:.4,ease:"power3.out"}),n=ni.quickTo(e,"top",{duration:.4,ease:"power3.out"}),i=e.closest(".landing-page");if(!i)return;function s(u){t(u.clientX),n(u.clientY),e.classList.contains("active")||e.classList.add("active")}function a(){e.classList.remove("active"),e.classList.remove("hovering")}i.addEventListener("mousemove",s),i.addEventListener("mouseleave",a);const o=i.querySelectorAll("button, a, .service-card, .trust-card, .pricing-card-new"),l=[],c=[];return o.forEach(u=>{const d=()=>e.classList.add("hovering"),f=()=>e.classList.remove("hovering");u.addEventListener("mouseenter",d),u.addEventListener("mouseleave",f),l.push({el:u,fn:d}),c.push({el:u,fn:f})}),()=>{i.removeEventListener("mousemove",s),i.removeEventListener("mouseleave",a),l.forEach(({el:u,fn:d})=>u.removeEventListener("mouseenter",d)),c.forEach(({el:u,fn:d})=>u.removeEventListener("mouseleave",d))}},[]),R.jsx("div",{ref:r,className:"cursor-follower",id:"cursorFollower","aria-hidden":"true"})}function hE(){const r=Yu(Cd);return Zg(),R.jsxs("div",{className:"landing-page",children:[R.jsx(lE,{}),R.jsx(oE,{}),R.jsx(aE,{}),R.jsx(Jg,{isLoggedIn:r}),R.jsx(Qg,{}),R.jsx(M0,{}),R.jsx(P0,{}),R.jsx(N0,{}),R.jsx(O0,{}),R.jsx(z0,{}),R.jsx(V0,{}),R.jsx(H0,{})]})}export{hE as default};
