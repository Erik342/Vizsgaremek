
(function(){
const $=s=>document.querySelector(s);
const state={entries:JSON.parse(localStorage.getItem('ft.entries')||'[]'),currency:localStorage.getItem('ft.currency')||'HUF'};
const monthEl=$('#month'),currencyEl=$('#currency'),form=$('#entryForm'),dateEl=$('#date'),typeEl=$('#type'),descEl=$('#desc'),catEl=$('#category'),amountEl=$('#amount'),rowsEl=$('#rows'),emptyEl=$('#empty'),searchEl=$('#search');
const sumIncomeEl=$('#sumIncome'),sumExpenseEl=$('#sumExpense'),sumSubscriptionEl=$('#sumSubscription'),sumBalanceEl=$('#sumBalance'),summaryMonthEl=$('#summaryMonth');
const btnExportCsv=$('#btnExportCsv'),btnExportJson=$('#btnExportJson'),btnClear=$('#btnClear');

const today=new Date(); monthEl.value=toYM(today); dateEl.valueAsDate=today; currencyEl.value=state.currency;

render(); refreshCategories();

monthEl.addEventListener('change',render);
currencyEl.addEventListener('change',()=>{state.currency=currencyEl.value; localStorage.setItem('ft.currency',state.currency); render();});

form.addEventListener('submit',e=>{
  e.preventDefault();
  let amount=parseFloat((amountEl.value||'').replace(/\s/g,'').replace(',','.'));
  if(isNaN(amount)){alert('Az összeg nem értelmezhető szám.'); return;}
  state.entries.push({id:genId(),date:dateEl.value,type:typeEl.value,desc:descEl.value.trim(),category:catEl.value.trim(),amount:Math.round(amount*100)/100,createdAt:new Date().toISOString()});
  save(); form.reset(); dateEl.valueAsDate=new Date(); render(); refreshCategories();
});

searchEl.addEventListener('input',render);
btnExportCsv.addEventListener('click',()=>downloadCSV(filteredEntries()));
btnExportJson.addEventListener('click',()=>downloadJSON(state.entries));
btnClear.addEventListener('click',()=>{if(confirm('Biztos törlöd az összes adatot?')){state.entries=[]; save(); render(); refreshCategories();}});

function render(){
  const data=filteredEntries(); rowsEl.innerHTML='';
  if(!data.length){emptyEl.style.display='block';}else{emptyEl.style.display='none';}
  let income=0, expense=0, subscription=0;
  data.forEach(e=>{if(e.type==='income')income+=e.amount; else if(e.type==='expense')expense+=e.amount; else subscription+=e.amount; rowsEl.appendChild(renderRow(e));});
  const balance=income-expense-subscription;
  sumIncomeEl.textContent=fmtMoney(income);
  sumExpenseEl.textContent=fmtMoney(expense);
  sumSubscriptionEl.textContent=fmtMoney(subscription);
  sumBalanceEl.textContent=fmtMoney(balance);
  const [y,m]=monthEl.value.split('-'); summaryMonthEl.textContent=`${y}. ${m}.`;
}

function renderRow(e){
  const tr=document.createElement('tr'); 
  tr.innerHTML=`<td>${fmtDate(e.date)}</td><td>${escapeHtml(e.desc)}</td><td>${escapeHtml(e.category||'—')}</td>
  <td><span class="pill ${e.type}">${e.type==='income'?'Bevétel':e.type==='expense'?'Kiadás':'Előfizetés'}</span></td>
  <td>${fmtMoney(e.amount)}</td>
  <td><div class="actions">
  <button class="btn ghost" onclick="edit('${e.id}')">✏️</button>
  <button class="btn ghost" onclick="dup('${e.id}')">📄</button>
  <button class="btn ghost" onclick="del('${e.id}')">🗑️</button>
  </div></td>`;
  return tr;
}

function filteredEntries(){const [y,m]=monthEl.value.split('-'); const q=(searchEl.value||'').toLowerCase(); return state.entries.filter(e=>{const d=new Date(e.date); const okMonth=d.getFullYear()==y&&(d.getMonth()+1)==m; const okSearch=!q||(`${e.desc} ${e.category}`).toLowerCase().includes(q); return okMonth && okSearch;});}

window.edit=id=>{const e=state.entries.find(x=>x.id===id); if(!e) return; const d=prompt('Leírás',e.desc); if(d!==null) e.desc=d; const c=prompt('Kategória',e.category||''); if(c!==null) e.category=c; const date=prompt('Dátum (YYYY-MM-DD)',e.date); if(date!==null) e.date=date; const t=prompt('Típus (income/expense/subscription)',e.type); if(t!==null) e.type=t; const a=prompt('Összeg',e.amount); if(a!==null){const n=parseFloat(a.replace(',','.')); if(!isNaN(n)) e.amount=Math.round(n*100)/100;} save(); render(); refreshCategories();}
window.dup=id=>{const e=state.entries.find(x=>x.id===id); if(!e) return; state.entries.push({...e,id:genId(),createdAt:new Date().toISOString()}); save(); render();}
window.del=id=>{if(confirm('Törlöd a tételt?')){state.entries=state.entries.filter(x=>x.id!==id); save(); render(); refreshCategories();}}

function refreshCategories(){const cats=[...new Set(state.entries.map(e=>e.category).filter(Boolean))].sort(); $('#categoryList').innerHTML=cats.map(c=>`<option value="${escapeHtml(c)}">`).join('');}
function save(){localStorage.setItem('ft.entries',JSON.stringify(state.entries));}
function fmtMoney(n){try{return new Intl.NumberFormat('hu-HU',{style:'currency',currency:state.currency}).format(n);}catch{return `${n.toFixed(2)} ${state.currency}`;}}
function fmtDate(s){const d=new Date(s); if(isNaN(d.getTime())) return s; return d.toLocaleDateString('hu-HU',{year:'numeric',month:'2-digit',day:'2-digit'});}
function toYM(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function genId(){return Math.random().toString(36).slice(2)+Date.now().toString(36);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));}
function downloadCSV(data){const h=['date','type','desc','category','amount','createdAt']; const rows=[h.join(';')]; data.forEach(r=>rows.push(h.map(k=>String(r[k]||'').replace(/;/g,',')).join(';'))); download(rows.join('\n'),`tracker-${monthEl.value}.csv`,'text/csv');}
function downloadJSON(data){download(JSON.stringify(data,null,2),'tracker.json','application/json');}
function download(content,name,mime){const blob=new Blob([content],{type:mime}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);}
})();
