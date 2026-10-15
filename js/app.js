import {concepts,groups} from './data/concepts.js';
import {cycleGroups,ready} from './data/cycles.js';
const app=document.getElementById('app');let cleanup=null;
const tex=(s,d)=>katex.renderToString(s,{throwOnError:false,displayMode:!!d});
const rich=s=>s.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\[\[([\w-]+)\|([^\]]+)\]\]/g,'<a href="#/conceptos/$1">$2</a>').replace(/\$([^$]+)\$/g,(_,t)=>tex(t));
const cyName=id=>{for(const[,l]of cycleGroups)for(const c of l)if(c[0]==id)return c[1];return id};
const cyReady=id=>!!ready[id];

const views={
 home(){return `<h1>Ciclos térmicos</h1><p class="mu">Aprende los ciclos con animaciones, fórmulas derivadas paso a paso y una calculadora que resuelve el problema por ti. Funciona sin internet.</p>
 <input type="search" id="q" placeholder="Buscar concepto o ciclo" aria-label="Buscar"><div id="hits"></div>
 <a class="big" href="#/ciclos"><b>Ciclos</b><span>Otto, Diésel, Brayton, Rankine, refrigeración y más</span></a>
 <a class="big" href="#/conceptos"><b>Conceptos</b><span>Propiedades, leyes, procesos y métricas</span></a>`},
 conceptos(){return `<h1>Conceptos</h1>`+groups.map(g=>`<div class="grp">${g}</div>`+concepts.filter(c=>c.g==g).map(c=>`<a class="row" href="#/conceptos/${c.id}">${c.t}</a>`).join('')).join('')},
 concepto(id){const c=concepts.find(x=>x.id==id);if(!c)return views.notfound();
  return `<a href="#/conceptos">← Conceptos</a><h1>${c.t}</h1><p>${rich(c.b)}</p>`+c.f.map(f=>`<div class="eq">${tex(f,1)}</div>`).join('')+`<h2>Se usa en</h2>`+c.u.map(u=>cyReady(u)?`<a class="row" href="#/ciclos/${u}">${cyName(u)}</a>`:`<span class="row off">${cyName(u)} <small>Próximamente</small></span>`).join('')},
 ciclos(){return `<h1>Ciclos</h1>`+cycleGroups.map(([g,l])=>`<div class="grp">${g}</div>`+l.map(([id,n,s])=>cyReady(id)?`<a class="row" href="#/ciclos/${id}">${n}<small>${s||''}</small></a>`:`<span class="row off">${n}<small>Próximamente</small></span>`).join('')).join('')},
 notfound(){return `<h1>No encontrado</h1><a href="#/">Volver al inicio</a>`}
};

async function cycle(id,problem){
 if(!cyReady(id))return views.notfound();const m=await ready[id]();
 if(problem){
  app.innerHTML=`<a href="#/ciclos/${id}">← ${m.info.name}</a><h1>Resolver problema</h1><p class="mu">${m.info.name} con aire frío estándar (k = 1.4, cv = 0.718 kJ/kg·K).</p><div id="f">${m.inputs.map(([k,l,v])=>`<label for="i_${k}">${l}</label><input type="number" inputmode="decimal" id="i_${k}" value="${v}">`).join('')}</div><p><button class="btn" id="go">Resolver</button></p><div id="out"></div>`;
  document.getElementById('go').onclick=()=>{const d={};m.inputs.forEach(([k])=>d[k]=parseFloat(document.getElementById('i_'+k).value));const r=m.solve(d),o=document.getElementById('out');
   if(r.error){o.innerHTML=`<p>${r.error}</p>`;return}
   o.innerHTML=`<h2>Resultados</h2><div class="res">${r.results.map(([a,b])=>`<div><small>${a}</small>${b}</div>`).join('')}</div>${m.pvSvg(r.path,'spv')}<h2>Estados</h2><table><tr><th>Estado</th><th>T (K)</th><th>P (kPa)</th><th>v (m³/kg)</th></tr>${r.states.map(s=>`<tr><td>${s[0]}</td><td>${s[1].toFixed(1)}</td><td>${s[2].toFixed(1)}</td><td>${s[3].toFixed(4)}</td></tr>`).join('')}</table><h2>Procedimiento</h2>${r.steps.map((s,i)=>`<div class="step"><b>${i+1}. ${s[0]}</b><div class="eq">${tex(s[1],1)}</div></div>`).join('')}`;
   o.scrollIntoView({behavior:'smooth'})};
  return null;
 }
 const i=m.info;
 app.innerHTML=`<a href="#/ciclos">← Ciclos</a><h1>${i.name}</h1><div id="bn"></div><p>${rich(i.summary)}</p><p class="mu">${i.note}</p>
 <h2>Procesos</h2><table><tr><th></th><th>Qué ocurre</th><th>En el motor</th></tr>${i.procesos.map(p=>`<tr><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td></tr>`).join('')}</table>
 <h2>Formulario y derivación</h2>${i.deriv.map((s,j)=>`<div class="step"><b>${j+1}. ${rich(s[0])}</b><div class="eq">${tex(s[1],1)}</div></div>`).join('')}
 <h2>Conceptos relacionados</h2>${i.rel.map(c=>{const x=concepts.find(y=>y.id==c);return x?`<a class="row" href="#/conceptos/${c}">${x.t}</a>`:''}).join('')}
 <p style="margin-top:22px"><a class="btn" href="#/ciclos/${id}/problema">Resolver problema</a></p>`;
 cleanup=m.mountBanner(document.getElementById('bn'));return null;
}

function search(){const q=document.getElementById('q');if(!q)return;const h=document.getElementById('hits');
 q.oninput=()=>{const t=q.value.trim().toLowerCase();if(!t){h.innerHTML='';return}
  const a=concepts.filter(c=>c.t.toLowerCase().includes(t)).map(c=>`<a class="row" href="#/conceptos/${c.id}">${c.t}<small>Concepto</small></a>`),
  b=cycleGroups.flatMap(([,l])=>l).filter(c=>cyReady(c[0])&&c[1].toLowerCase().includes(t)).map(c=>`<a class="row" href="#/ciclos/${c[0]}">${c[1]}<small>Ciclo</small></a>`);
  h.innerHTML=a.concat(b).join('')||'<p class="mu">Sin resultados.</p>'}}

async function route(){
 if(cleanup){cleanup();cleanup=null}
 const p=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);let html=null;
 if(!p.length)html=views.home();else if(p[0]=='conceptos')html=p[1]?views.concepto(p[1]):views.conceptos();
 else if(p[0]=='ciclos')html=p[1]?await cycle(p[1],p[2]=='problema'):views.ciclos();else html=views.notfound();
 if(html!==null)app.innerHTML=html;
 document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.r==(p[0]||'')));
 if(!p[2])scrollTo(0,0);search();
}
addEventListener('hashchange',route);route();
