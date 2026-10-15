const R=0.287,k=1.4,cv=0.718,n=(x,d=2)=>x.toFixed(d);

export const info={
 name:'Ciclo Otto',
 summary:'Ciclo ideal de los motores de gasolina. Una chispa enciende la mezcla cuando el pistón está arriba, por eso el calor entra a **volumen constante**. Se usa en automóviles y motocicletas.',
 procesos:[['1→2','Compresión adiabática reversible','Carrera de compresión'],['2→3','Adición de calor a volumen constante','Chispa y combustión'],['3→4','Expansión adiabática reversible','Carrera de potencia'],['4→1','Rechazo de calor a volumen constante','Apertura de la válvula de escape']],
 deriv:[['Calor que entra y sale','Q_{ent}=c_v(T_3-T_2),\\quad Q_{sal}=c_v(T_4-T_1)'],['Eficiencia','\\eta=1-\\frac{Q_{sal}}{Q_{ent}}=1-\\frac{T_4-T_1}{T_3-T_2}'],['Relaciones adiabáticas (ver [[adiabatico|proceso adiabático]])','\\frac{T_2}{T_1}=r^{k-1},\\qquad \\frac{T_3}{T_4}=r^{k-1}'],['Despejo T₄ y T₁','T_4=\\frac{T_3}{r^{k-1}},\\quad T_1=\\frac{T_2}{r^{k-1}}\\ \\Rightarrow\\ T_4-T_1=\\frac{T_3-T_2}{r^{k-1}}'],['Sustituyo y simplifico','\\eta=1-\\frac{1}{r^{k-1}}']],
 rel:['gas-ideal','cp-cv-k','adiabatico','isocorico','primera-ley','eficiencia','rel-compresion','pme','diagrama-pv'],
 note:'Más relación de compresión da más eficiencia, pero en un motor real la detonación la limita (≈ 8 a 11).'
};

export const inputs=[['T1','Temperatura inicial T₁ (K)',300],['P1','Presión inicial P₁ (kPa)',100],['r','Relación de compresión r',8],['T3','Temperatura máxima T₃ (K)',1800]];

export function solve(d){
 const {T1,P1,r,T3}=d; if([T1,P1,r,T3].some(x=>!(x>0))||r<=1||T3<=T1*Math.pow(r,k-1)) return {error:'Revisa los datos: r debe ser mayor que 1 y T₃ mayor que T₂ (la temperatura tras comprimir).'};
 const v1=R*T1/P1,v2=v1/r,T2=T1*Math.pow(r,k-1),P2=P1*Math.pow(r,k),P3=P2*T3/T2,T4=T3/Math.pow(r,k-1),P4=P3/Math.pow(r,k);
 const qin=cv*(T3-T2),qout=cv*(T4-T1),w=qin-qout,eta=w/qin,pme=w/(v1-v2);
 return{
  states:[[1,T1,P1,v1],[2,T2,P2,v2],[3,T3,P3,v2],[4,T4,P4,v1]],
  steps:[
   ['Volumen específico inicial',`v_1=\\frac{RT_1}{P_1}=\\frac{0.287\\cdot${n(T1,0)}}{${n(P1,0)}}=${n(v1,4)}\\ \\text{m}^3/\\text{kg}`],
   ['Estado 2: compresión adiabática',`T_2=T_1r^{k-1}=${n(T1,0)}\\cdot${r}^{0.4}=${n(T2)}\\ \\text{K}\\qquad P_2=P_1r^k=${n(P2)}\\ \\text{kPa}`],
   ['Estado 3: calor a volumen constante',`v_3=v_2=\\frac{v_1}{r}=${n(v2,4)}\\qquad P_3=P_2\\frac{T_3}{T_2}=${n(P3)}\\ \\text{kPa}`],
   ['Estado 4: expansión adiabática',`T_4=\\frac{T_3}{r^{k-1}}=${n(T4)}\\ \\text{K}\\qquad P_4=\\frac{P_3}{r^k}=${n(P4)}\\ \\text{kPa}`],
   ['Calor que entra y sale',`Q_{ent}=c_v(T_3-T_2)=${n(qin)}\\ \\text{kJ/kg}\\qquad Q_{sal}=c_v(T_4-T_1)=${n(qout)}\\ \\text{kJ/kg}`],
   ['Trabajo neto y eficiencia',`W=Q_{ent}-Q_{sal}=${n(w)}\\ \\text{kJ/kg}\\qquad \\eta=\\frac{W}{Q_{ent}}=${n(eta*100)}\\%`],
   ['Presión media efectiva',`PME=\\frac{W}{v_1-v_2}=${n(pme)}\\ \\text{kPa}`]],
  results:[['Eficiencia η',n(eta*100)+' %'],['Trabajo neto',n(w)+' kJ/kg'],['PME',n(pme,0)+' kPa']],
  path:pvPath(v1,P1,r,P3)};
}

// Trayectoria P-V: [compresión, calor entra, expansión, calor sale]
export function pvPath(v1,P1,r,P3){
 const v2=v1/r,P2=P1*Math.pow(r,k),ad=(va,pa,vb)=>Array.from({length:41},(_,i)=>{const v=va+(vb-va)*i/40;return[v,pa*Math.pow(va/v,k)]}),ln=(a,b)=>[a,b];
 const c=ad(v1,P1,v2),e=ad(v2,P3,v1);return[c,ln([v2,P2],[v2,P3]),e,ln([v1,e[40][1]],[v1,P1])];
}

export function pvSvg(path,id,unit){
 const all=path.flat(),mv=Math.max(...all.map(p=>p[0]))*1.06,mp=Math.max(...all.map(p=>p[1]))*1.08,X=v=>34+v/mv*256,Y=p=>200-p/mp*185,col=['var(--work)','var(--heat)','var(--work)','var(--ac)'];
 const pl=path.map((s,i)=>`<polyline fill="none" stroke="${col[i]}" stroke-width="3" points="${s.map(p=>X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join(' ')}"/>`).join('');
 const lb=[path[0][0],path[1][0],path[2][0],path[3][0]].map((p,i)=>`<text x="${X(p[0])+(i==0||i==3?-12:6)}" y="${Y(p[1])+(i<2?-6:14)}" font-size="13" fill="currentColor">${i+1}</text>`).join('');
 return `<svg class="pv" id="${id}" viewBox="0 0 300 225" style="color:var(--ink)"><path d="M34 8V200H294" stroke="currentColor" fill="none"/><text x="276" y="218" font-size="12" fill="currentColor">v</text><text x="8" y="16" font-size="12" fill="currentColor">P</text>${pl}${lb}<circle class="dot" r="7" fill="#fff" stroke="var(--heat)" stroke-width="3"/></svg>`;
}

export function mountBanner(el){
 const path=pvPath(1,1,8,48),Rr=30,L=130,cols=['#5aa9e6','#e9c46a','#e4572e','#8b98a3'],names=['Admisión: entra mezcla aire-combustible','Compresión: el pistón sube y la mezcla se calienta','Combustión y potencia: la chispa enciende y el gas empuja','Escape: salen los gases quemados'];
 el.innerHTML=`<div class="banner"><svg viewBox="0 0 300 260"><path d="M100 30V150M200 30V150M100 30H200" stroke="#cfd8dd" stroke-width="4" fill="none"/><rect id="gas" x="104" width="92" y="40" fill="#5aa9e6" opacity=".55"/><rect id="vi" x="118" y="30" width="22" height="7" fill="#5fd0c8"/><rect id="ve" x="160" y="30" width="22" height="7" fill="#ff7a57"/><circle id="sp" cx="150" cy="46" r="9" fill="#fff6a8" opacity="0"/><line id="rod" stroke="#cfd8dd" stroke-width="6"/><rect id="pis" x="102" width="96" height="16" rx="3" fill="#aab6bd"/><circle cx="150" cy="235" r="30" fill="none" stroke="#5c6d79" stroke-width="3"/><circle id="pin" r="6" fill="#cfd8dd"/></svg>${pvSvg(path,'bpv')}</div><div class="bar"><span class="stage"></span><button class="btn ghost" type="button">Pausar</button></div>`;
 const q=s=>el.querySelector(s),X=v=>34+v/(1.06)*256,mp=Math.max(...path.flat().map(p=>p[1]))*1.08,Y=p=>200-p/mp*185;
 const at=t=>{const f=(a,b)=>Math.min(1,Math.max(0,(t-a)/(b-a))),pick=(s,x)=>s[Math.round(x*(s.length-1))];
  if(t>=180&&t<360)return pick(path[0],f(180,360));if(t>=360&&t<375)return pick(path[1],f(360,375));if(t>=375&&t<540)return pick(path[2],f(375,540));if(t>=540&&t<555)return pick(path[3],f(540,555));return path[0][0]};
 function draw(t){
  const a=(t%360)*Math.PI/180,py=235-(Rr*Math.cos(a)+Math.sqrt(L*L-Math.pow(Rr*Math.sin(a),2))),top=py-16,pinx=150+Rr*Math.sin(a),piny=235-Rr*Math.cos(a),s=Math.floor(t/180)%4;
  q('#pis').setAttribute('y',top);q('#gas').setAttribute('height',Math.max(0,top-40));q('#gas').setAttribute('fill',cols[s]);
  const rod=q('#rod');rod.setAttribute('x1',150);rod.setAttribute('y1',py);rod.setAttribute('x2',pinx);rod.setAttribute('y2',piny);
  q('#pin').setAttribute('cx',pinx);q('#pin').setAttribute('cy',piny);q('#sp').setAttribute('opacity',t>355&&t<385?1:0);
  q('#vi').setAttribute('y',s==0?38:30);q('#ve').setAttribute('y',s==3?38:30);q('.stage').textContent=names[s];
  const p=at(t),d=q('#bpv .dot');d.setAttribute('cx',X(p[0]));d.setAttribute('cy',Y(p[1]));d.setAttribute('opacity',s==0||s==3?.35:1);
 }
 const o={t:0},an=anime({targets:o,t:720,duration:10000,easing:'linear',loop:true,update:()=>draw(o.t)}),b=q('button');
 b.onclick=()=>{if(an.paused){an.play();b.textContent='Pausar'}else{an.pause();b.textContent='Reanudar'}};
 draw(0);return()=>an.pause();
}
