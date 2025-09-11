// Center-slider v2: show more data on cards (holder name, expiry, balance, last4 digits).
(function(){
  const cards = [
    { id:'basic', name:'Sima (Basic)', color1:'#334155', color2:'#1f2937', price:'Ingyenes', holder:'Kiss Péter', expiry:'08/26', balance: 120.50, features:['Alap bankkártyás fizetés','PIN és zárolás'] },
    { id:'silver', name:'Silver', color1:'#94a3b8', color2:'#475569', price:'1,99€ / hó', holder:'Nagy Anna', expiry:'11/27', balance: 540.00, features:['Kedvezményes ATM díjak külföldön','Alacsonyabb devizadíj'] },
    { id:'gold', name:'Gold', color1:'#f59e0b', color2:'#b45309', price:'6,99€ / hó', holder:'Horváth Gábor', expiry:'02/29', balance: 2300.00, features:['Ingyenes ATM egy bizonyos összeghatárig','Utazási biztosítás'] },
    { id:'obsidian', name:'Obsidian', color1:'#0f1724', color2:'#020617', price:'12,99€ / hó', holder:'Szabó Eszter', expiry:'05/28', balance: 11999.90, features:['Magasabb ATM limit','Prémium ügyfélszolgálat 24/7'] }
  ];

  let index = 0;
  const leftSlot = document.getElementById('leftSlot');
  const centerSlot = document.getElementById('centerSlot');
  const rightSlot = document.getElementById('rightSlot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const cardName = document.getElementById('cardName');
  const cardPrice = document.getElementById('cardPrice');
  const cardFeatures = document.getElementById('cardFeatures');
  const cardMeta = document.getElementById('cardMeta');
  const chooseBtn = document.getElementById('chooseBtn');

  function fmtMoney(n){ return Number(n).toLocaleString('hu-HU',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' €'; }
  function mod(n,m){ return ((n % m) + m) % m; }

  function renderSlot(slotEl, card, small=false){
    slotEl.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    inner.style.background = `linear-gradient(135deg, ${card.color1}, ${card.color2})`;
    const last4key = 'last4_'+card.id;
    let last4 = localStorage.getItem(last4key);
    if(!last4){ last4 = String(Math.floor(1000+Math.random()*9000)); localStorage.setItem(last4key, last4); }
    inner.innerHTML = `
      <div class="card-row">
        <div>
          <div class="card-holder">${card.holder}</div>
          <div class="card-expiry">Exp: ${card.expiry}</div>
        </div>
        <div class="card-balance">${fmtMoney(card.balance)}</div>
      </div>
      <div style="width:100%;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end">
        <div class="card-digits">•••• ${last4}</div>
      </div>
    `;
    slotEl.appendChild(inner);
  }

  function render(){
    const leftCard = cards[mod(index-1,cards.length)];
    const centerCard = cards[mod(index,cards.length)];
    const rightCard = cards[mod(index+1,cards.length)];
    renderSlot(leftSlot,leftCard,true);
    renderSlot(centerSlot,centerCard,false);
    renderSlot(rightSlot,rightCard,true);

    // info panel
    cardName.textContent = centerCard.name;
    cardPrice.textContent = fmtMoney(centerCard.balance) + ' • ' + centerCard.price;
    cardFeatures.innerHTML = centerCard.features.map(f=>'<li>'+f+'</li>').join('');
    cardMeta.innerHTML = `<strong>Tulajdonos:</strong> ${centerCard.holder} &nbsp; • &nbsp; <strong>Lejárat:</strong> ${centerCard.expiry}`;
    localStorage.setItem('selected_card', centerCard.id);
  }

  function prev(){ index = mod(index-1,cards.length); animate('left'); render(); }
  function next(){ index = mod(index+1,cards.length); animate('right'); render(); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  window.addEventListener('keydown', (e)=>{ if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });

  let startX = null;
  centerSlot.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; });
  centerSlot.addEventListener('touchend', (e)=>{
    if(startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if(Math.abs(dx) > 40){ if(dx < 0) next(); else prev(); }
    startX = null;
  });

  function animate(dir){
    centerSlot.style.transition = 'transform .28s ease';
    if(dir === 'left'){
      centerSlot.style.transform = 'translateX(-30px) scale(.96)';
      setTimeout(()=> centerSlot.style.transform = '', 280);
    } else {
      centerSlot.style.transform = 'translateX(30px) scale(.96)';
      setTimeout(()=> centerSlot.style.transform = '', 280);
    }
  }

  chooseBtn.addEventListener('click', ()=>{
    const selected = localStorage.getItem('selected_card');
    alert('Kiválasztott kártya: ' + selected + ' (szimuláció)');
  });

  render();
})();