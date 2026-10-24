/* ── 탭바 ── */
function renderTabBar(active) {
  const el = document.getElementById('tabbar');
  if(!el) return;
  el.innerHTML = `
    <div class="tbi${active==='cards'?' on':''}" onclick="location.href='index.html'"><span class="ic">🪪</span><span class="lb">명함</span></div>
    <div class="tbi${active==='cos'?' on':''}"   onclick="location.href='cos.html'"><span class="ic">🏢</span><span class="lb">거래처</span></div>
    <div class="tb-scan" onclick="location.href='scan.html'"><div class="scan-fab">📷</div><span class="lb">스캔</span></div>
    <div class="tbi${active==='map'?' on':''}"    onclick="location.href='map.html'"><span class="ic">🗺️</span><span class="lb">지도</span></div>
    <div class="tbi${active==='visits'?' on':''}" onclick="location.href='visits.html'"><span class="ic">📝</span><span class="lb">방문</span></div>
  `;
}

/* ── 토스트 ── */
function toast(msg, dur=2200) {
  let el = document.getElementById('_toast');
  if(!el){ el=document.createElement('div'); el.id='_toast'; el.className='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(()=> el.classList.remove('show'), dur);
}

/* ── URL 파라미터 ── */
function qp(name) {
  return new URLSearchParams(location.search).get(name)||'';
}

/* ── 거래처 상세 오버레이 (공통) ── */
const VISIT_TYPES = ['🤝 인사','💬 상담','📄 견적','🔧 AS','🍽 식사','📞 전화'];
let _visitCtx = {coId:'', coNm:''};

function openCoOverlay(coId) {
  const cos = DB.getCos();
  const co = cos.find(c=>c.id===coId);
  if(!co) return;
  const stLbl={active:'활성',potential:'잠재',dormant:'휴면'};
  const stCls ={active:'b-gn',potential:'b-am',dormant:'b-rd'};
  const tagCls={고객:'b-bl',VIP:'b-gn',잠재:'b-am',휴면:'b-rd'};
  const cards  = DB.getCards().filter(c=>c.co===co.nm);
  const visits = DB.getVisits().filter(v=>v.coId===coId);

  const el = document.getElementById('overlay-co');
  el.innerHTML = `
    <header class="hdr">
      <div class="hdr-back" onclick="closeCoOverlay()">←</div>
      <span class="hdr-t">${co.nm}</span>
    </header>
    <div class="overlay-body">
      <div class="det-hero">
        <div class="det-av" style="background:var(--blue-lt);color:var(--blue);font-size:26px;">🏢</div>
        <div>
          <div class="det-nm">${co.nm}</div>
          <div class="det-tl">${co.addr||''}</div>
          <div style="margin-top:6px;"><span class="bx ${stCls[co.st]||'b-bl'}">${stLbl[co.st]||co.st}</span></div>
        </div>
      </div>
      <div class="sec-hdr"><h3>소속 명함 (${cards.length})</h3></div>
      <div class="bp" style="padding:0 14px;">
        ${cards.length ? cards.map(c=>`
          <div class="li" onclick="${typeof openCardOverlay==='function'?`openCardOverlay('${c.id}')`:`location.href='card.html?id=${c.id}'`}">
            <div class="av" style="background:${c.cl}18;color:${c.cl}">${c.nm[0]}</div>
            <div class="li-info"><div class="li-name">${c.nm}</div><div class="li-sub">${c.tl||''}</div></div>
            <div class="li-r"><span class="bx ${tagCls[c.tag]||'b-bl'}">${c.tag}</span><span class="chev">›</span></div>
          </div>`).join('') : '<div style="padding:16px;font-size:13px;color:var(--t3);text-align:center;">소속 명함이 없습니다</div>'}
      </div>
      <div class="sec-hdr"><h3>방문 이력 (${visits.length})</h3><a onclick="openVisitModal('${coId}','${co.nm}')">+ 기록</a></div>
      <div class="tl" id="co-visit-tl">
        ${visits.length ? visits.map(v=>`
          <div class="tl-item">
            <div class="tl-dot">${v.tp.split(' ')[0]}</div>
            <div class="tl-body">
              <div style="display:flex;justify-content:space-between;"><div class="tl-tp">${v.tp}</div><div class="tl-dt">${v.dt}</div></div>
              <div class="tl-memo">${v.memo||''}</div>
              ${v.next?`<div class="tl-next">📅 다음 일정: ${v.next}</div>`:''}
            </div>
          </div>`).join('') : '<div style="padding:16px;font-size:13px;color:var(--t3);text-align:center;">방문 기록이 없습니다</div>'}
      </div>
      <button class="action-btn" onclick="openVisitModal('${coId}','${co.nm}')">📝 방문 기록 추가</button>
      <div style="height:20px;"></div>
    </div>`;
  el.classList.add('show');
}

function closeCoOverlay() {
  document.getElementById('overlay-co').classList.remove('show');
}

function refreshCoVisits(coId) {
  const visits = DB.getVisits().filter(v=>v.coId===coId);
  const tl = document.getElementById('co-visit-tl');
  if(!tl) return;
  tl.innerHTML = visits.length ? visits.map(v=>`
    <div class="tl-item">
      <div class="tl-dot">${v.tp.split(' ')[0]}</div>
      <div class="tl-body">
        <div style="display:flex;justify-content:space-between;"><div class="tl-tp">${v.tp}</div><div class="tl-dt">${v.dt}</div></div>
        <div class="tl-memo">${v.memo||''}</div>
        ${v.next?`<div class="tl-next">📅 다음 일정: ${v.next}</div>`:''}
      </div>
    </div>`).join('') : '<div style="padding:16px;font-size:13px;color:var(--t3);text-align:center;">방문 기록이 없습니다</div>';
}

/* ── 방문기록 추가 모달 (공통) ── */
function openVisitModal(coId, coNm) {
  _visitCtx = {coId, coNm};
  document.getElementById('v-dt').value = new Date().toISOString().split('T')[0];
  document.getElementById('v-memo').value = '';
  document.getElementById('v-next').value = '';
  const g = document.getElementById('type-grid');
  g.innerHTML = VISIT_TYPES.map(t=>`<div class="bx b-bl" style="cursor:pointer;padding:7px 14px;">${t}</div>`).join('');
  _selectType(g.children[0]);
  if(coNm) { const lbl=document.getElementById('v-co-lbl'); if(lbl) lbl.textContent=coNm; }
  document.getElementById('modal-visit').classList.add('show');
}

function closeVisitModal() {
  document.getElementById('modal-visit').classList.remove('show');
}

function _selectType(el) {
  document.querySelectorAll('#type-grid .bx').forEach(b=>{ b.style.background=''; b.style.border=''; b.style.color=''; delete b.dataset.on; });
  el.style.background='var(--blue-lt)'; el.style.border='1.5px solid var(--blue)'; el.style.color='var(--blue)'; el.dataset.on='1';
}

function saveVisit() {
  const selEl = [...document.querySelectorAll('#type-grid .bx')].find(b=>b.dataset.on);
  const tp = selEl ? selEl.textContent : VISIT_TYPES[0];
  const dt = document.getElementById('v-dt').value;
  if(!dt){ toast('날짜를 입력해주세요'); return; }
  const visits = DB.getVisits();
  visits.unshift({id:'v'+Date.now(), co:_visitCtx.coNm, coId:_visitCtx.coId, tp, dt, memo:document.getElementById('v-memo').value.trim(), next:document.getElementById('v-next').value||null});
  DB.setVisits(visits);
  closeVisitModal();
  refreshCoVisits(_visitCtx.coId);
  toast('방문 기록이 저장됐습니다 ✓');
}
