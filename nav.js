/* ── 탭바 ── */
function _navTo(url){
  if(typeof closeAllOverlays==='function') closeAllOverlays();
  /* 오버레이용 pushState 항목 제거 후 이동 */
  location.href = url;
}
function renderTabBar(active) {
  const el = document.getElementById('tabbar');
  if(!el) return;
  el.innerHTML = `
    <div class="tbi${active==='home'?' on':''}"   onclick="_navTo('index.html')"><span class="ic">🏠</span><span class="lb">홈</span></div>
    <div class="tbi${active==='cards'?' on':''}"  onclick="_navTo('cards.html')"><span class="ic">🪪</span><span class="lb">명함목록</span></div>
    <div class="tb-scan"><label style="display:flex;flex-direction:column;align-items:center;cursor:pointer;width:100%;"><input type="file" accept="image/*" capture="environment" style="position:fixed;top:-200px;left:-200px;width:1px;height:1px;opacity:0;" onchange="_tbScanHandler(event)"><div class="scan-fab">📷</div><span class="lb">스캔</span></label></div>
    <div class="tbi${active==='cos'?' on':''}"     onclick="_navTo('cos.html')"><span class="ic">🏢</span><span class="lb">거래처목록</span></div>
    <div class="tbi${active==='visits'?' on':''}" onclick="_navTo('visits.html')"><span class="ic">📋</span><span class="lb">방문기록</span></div>
  `;
}

/* ── 하단 스캔 탭 핸들러 ── */
function _tbScanHandler(e) {
  const f = e.target.files[0];
  e.target.value = '';
  if(!f) return;
  const pg = location.pathname.split('/').pop() + location.search;
  const back = (!pg || pg === 'index.html') ? 'cards.html' : pg;
  const r = new FileReader();
  r.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const maxW=1600, scale=Math.min(1,maxW/Math.max(img.width,img.height));
      const c=document.createElement('canvas');
      c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      sessionStorage.setItem('scan_data', c.toDataURL('image/jpeg',0.9));
      sessionStorage.setItem('scan_back', back);
      location.href = 'scan.html';
    };
    img.src = ev.target.result;
  };
  r.readAsDataURL(f);
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

/* ── 전 페이지 Drive 자동 동기화 (세션 자동복구 포함) ── */
window.addEventListener('load', async function(){
  if(typeof GoogleAuth==='undefined') return;
  const pg = location.pathname.split('/').pop();
  if(pg===''||pg==='index.html') return; /* index.html은 자체 처리 */

  const _doSync = async () => {
    const ok = await DriveDB.syncDown();
    if(ok){
      if(typeof render==='function') render();
      if(typeof load==='function') load();
    }
  };

  if(GoogleAuth.isLoggedIn()){
    /* 토큰 유효 → 바로 sync */
    await _doSync();
  }
  /* 토큰 만료 시 tryRestore 호출 안 함 — GIS iframe 번쩍임 제거 */
});

/* ══════════════════════════════════════════
   명함 편집 / 삭제 (동적 모달)
══════════════════════════════════════════ */
const TAGS = ['고객','VIP','잠재','휴면'];
const TAG_COLORS = ['#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2','#db2777'];

function openCardEdit(id) {
  const card = DB.getCards().find(c=>c.id===id);
  if(!card) return;
  _removeModal('_cedit');
  const m = document.createElement('div');
  m.id = '_cedit';
  m.className = 'moverlay show';
  m.style.zIndex = '300';
  m.onclick = e => { if(e.target===m) _removeModal('_cedit'); };
  m.innerHTML = `
    <div class="msheet" style="max-height:90vh;">
      <div class="m-handle"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div class="m-title" style="margin-bottom:0;">명함 편집</div>
        <button onclick="deleteCard('${id}')" style="background:var(--red-lt);color:var(--red);border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">삭제</button>
      </div>
      <div class="m-body">
        <div><div class="flb">이름 *</div><input class="finp" id="ce-nm" value="${_esc(card.nm)}"></div>
        <div><div class="flb">회사</div><input class="finp" id="ce-co" value="${_esc(card.co||'')}"></div>
        <div><div class="flb">직책</div><input class="finp" id="ce-tl" value="${_esc(card.tl||'')}"></div>
        <div><div class="flb">휴대전화</div><input class="finp" id="ce-mob" type="tel" value="${_esc(card.mob||'')}"></div>
        <div><div class="flb">유선전화</div><input class="finp" id="ce-ph" type="tel" value="${_esc(card.ph||'')}"></div>
        <div><div class="flb">이메일</div><input class="finp" id="ce-em" type="email" value="${_esc(card.em||'')}"></div>
        <div><div class="flb">주소</div><input class="finp" id="ce-addr" value="${_esc(card.addr||'')}"></div>
        <div>
          <div class="flb">태그</div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;" id="ce-tags">
            ${TAGS.map(t=>`<div class="bx${card.tag===t?' b-gn':' b-bl'}" style="cursor:pointer;padding:7px 14px;${card.tag===t?'background:var(--grn-lt);border:1.5px solid var(--grn);color:var(--grn)':''}" onclick="_ceTag(this,'${t}')">${t}</div>`).join('')}
          </div>
        </div>
        <div>
          <div class="flb">색상</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;" id="ce-colors">
            ${TAG_COLORS.map(c=>`<div onclick="_ceColor(this,'${c}')" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${c===card.cl?'#000':'transparent'};"></div>`).join('')}
          </div>
        </div>
        <button class="m-btn" onclick="saveCardEdit('${id}')">저장</button>
      </div>
    </div>`;
  document.body.appendChild(m);
}

function _ceTag(el, tag) {
  document.querySelectorAll('#ce-tags .bx').forEach(b=>{ b.style.background=''; b.style.border=''; b.style.color=''; });
  el.style.background='var(--grn-lt)'; el.style.border='1.5px solid var(--grn)'; el.style.color='var(--grn)';
  el.dataset.val = tag;
}

function _ceColor(el, color) {
  document.querySelectorAll('#ce-colors div').forEach(d=>d.style.border='3px solid transparent');
  el.style.border='3px solid #000';
  el.dataset.sel='1';
  el._color = color;
}

function saveCardEdit(id) {
  const nm = document.getElementById('ce-nm').value.trim();
  if(!nm){ toast('이름을 입력해주세요'); return; }
  const cards = DB.getCards();
  const c = cards.find(x=>x.id===id);
  if(!c) return;
  c.nm   = nm;
  c.co   = document.getElementById('ce-co').value.trim();
  c.tl   = document.getElementById('ce-tl').value.trim();
  c.mob  = document.getElementById('ce-mob').value.trim();
  c.ph   = document.getElementById('ce-ph').value.trim();
  c.em   = document.getElementById('ce-em').value.trim();
  c.addr = document.getElementById('ce-addr').value.trim();
  const tagEl = [...document.querySelectorAll('#ce-tags .bx')].find(b=>b.dataset.val);
  if(tagEl) c.tag = tagEl.dataset.val;
  const colorEl = [...document.querySelectorAll('#ce-colors div')].find(d=>d.dataset.sel);
  if(colorEl) c.cl = colorEl._color;
  DB.setCards(cards);
  _removeModal('_cedit');
  toast('저장됐습니다 ✓');
  if(typeof openCardOverlay==='function') openCardOverlay(id);
  else if(typeof load==='function') load();
  else if(typeof render==='function') render();
}

function deleteCard(id) {
  if(!confirm('이 명함을 삭제하시겠습니까?')) return;
  const cards = DB.getCards().filter(c=>c.id!==id);
  DB.setCards(cards);
  ImgDB.del(id).catch(()=>{});
  _removeModal('_cedit');
  closeAllOverlays();
  toast('명함이 삭제됐습니다');
  if(typeof render==='function') render();
  else location.href='cards.html';
}

/* ══════════════════════════════════════════
   거래처 편집 (동적 모달)
══════════════════════════════════════════ */
const CO_STATES = [{v:'active',l:'활성'},{v:'potential',l:'잠재'},{v:'dormant',l:'휴면'}];

function openCoEdit(coId) {
  const co = DB.getCos().find(c=>c.id===coId);
  if(!co) return;
  _removeModal('_coedit');
  const m = document.createElement('div');
  m.id = '_coedit';
  m.className = 'moverlay show';
  m.style.zIndex = '300';
  m.onclick = e => { if(e.target===m) _removeModal('_coedit'); };
  m.innerHTML = `
    <div class="msheet">
      <div class="m-handle"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div class="m-title" style="margin-bottom:0;">거래처 편집</div>
        <button onclick="deleteCo('${coId}')" style="background:var(--red-lt);color:var(--red);border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">삭제</button>
      </div>
      <div class="m-body">
        <div><div class="flb">회사명 *</div><input class="finp" id="coe-nm" value="${_esc(co.nm)}"></div>
        <div><div class="flb">주소</div><input class="finp" id="coe-addr" value="${_esc(co.addr||'')}"></div>
        <div><div class="flb">업종</div><input class="finp" id="coe-ind" value="${_esc(co.ind||'')}"></div>
        <div>
          <div class="flb">상태</div>
          <div style="display:flex;gap:7px;">
            ${CO_STATES.map(s=>`<div class="bx b-bl" style="cursor:pointer;padding:7px 14px;${co.st===s.v?'background:var(--blue-lt);border:1.5px solid var(--blue);color:var(--blue)':''}" onclick="_coeState(this,'${s.v}')">${s.l}</div>`).join('')}
          </div>
        </div>
        <button class="m-btn" onclick="saveCoEdit('${coId}')">저장</button>
      </div>
    </div>`;
  document.body.appendChild(m);
}

function _coeState(el, st) {
  document.querySelectorAll('#_coedit .bx').forEach(b=>{ b.style.background=''; b.style.border=''; b.style.color=''; });
  el.style.background='var(--blue-lt)'; el.style.border='1.5px solid var(--blue)'; el.style.color='var(--blue)';
  el.dataset.val = st;
}

function saveCoEdit(coId) {
  const nm = document.getElementById('coe-nm').value.trim();
  if(!nm){ toast('회사명을 입력해주세요'); return; }
  const cos = DB.getCos();
  const co = cos.find(c=>c.id===coId);
  if(!co) return;
  co.nm   = nm;
  co.addr = document.getElementById('coe-addr').value.trim();
  co.ind  = document.getElementById('coe-ind').value.trim();
  const stEl = [...document.querySelectorAll('#_coedit .bx')].find(b=>b.dataset.val);
  if(stEl) co.st = stEl.dataset.val;
  DB.setCos(cos);
  _removeModal('_coedit');
  toast('저장됐습니다 ✓');
  openCoOverlay(coId);
}

function deleteCo(coId) {
  if(!confirm('이 거래처를 삭제하시겠습니까?')) return;
  DB.setCos(DB.getCos().filter(c=>c.id!==coId));
  _removeModal('_coedit');
  closeAllOverlays();
  toast('거래처가 삭제됐습니다');
  if(typeof render==='function') render();
}

/* ── 방문이력 아이템 렌더 (공통) ── */
function _visitHtml(v){
  const tgt=[...(v.targets||[]),v.targetExtra||''].filter(Boolean).join(', ');
  const our=v.ourTargets||'';
  const content=v.content||v.memo||'';
  const timeStr=v.time?' '+v.time:'';
  return `<div class="tl-item">
    <div class="tl-dot">${v.tp.split(' ')[0]}</div>
    <div class="tl-body">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
        <div class="tl-tp">${v.tp}</div>
        <div class="tl-dt" style="flex-shrink:0;">${v.dt}${timeStr}</div>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;margin:4px 0;">
        ${our?`<span style="font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:#dbeafe;color:#1d4ed8;">우리: ${our}</span>`:''}
        ${tgt?`<span style="font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600;background:#dcfce7;color:#15803d;">상대: ${tgt}</span>`:''}
      </div>
      ${content?`<div style="font-size:13px;line-height:1.65;color:var(--t1);margin-top:2px;">${content}</div>`:''}
      ${v.next?`<div class="tl-next">📅 다음 예정: ${v.next}</div>`:''}
    </div>
  </div>`;
}

/* ── 공통 헬퍼 ── */
function _removeModal(id) {
  const el = document.getElementById(id);
  if(el) el.remove();
}

function _esc(s) {
  return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ══════════════════════════════════════════
   거래처 상세 오버레이 (공통)
══════════════════════════════════════════ */
const VISIT_TYPES = ['🤝 인사','💬 상담','📄 견적','🔧 AS','🍽 식사','📞 전화'];
let _visitCtx = {coId:'', coNm:''};

let _noCoState = false; /* pushState 억제 플래그 */

function openCoOverlay(coId) {
  const cos = DB.getCos();
  let co = cos.find(c=>c.id===coId);
  /* 파생 거래처(_sc_)면 개인 DB에 자동 등록 후 정식 ID로 교체 */
  if(!co && coId.startsWith('_sc_')){
    const nm = coId.slice(4); /* '_sc_' 이후가 회사명 */
    const allCards = [
      ...DB.getCards().filter(c=>c.co===nm),
      ...DB.getDriveShared().filter(c=>c.co===nm)
    ];
    if(allCards.length){
      co = {id:'co'+Date.now(), nm, addr:allCards[0].addr||'', ind:'', st:'active', cnt:0, last:'-'};
      const updated = DB.getCos();
      updated.unshift(co);
      DB.setCos(updated);
      coId = co.id;
    }
  }
  if(!co) return;
  const stLbl={active:'활성',potential:'잠재',dormant:'휴면'};
  const stCls ={active:'b-gn',potential:'b-am',dormant:'b-rd'};
  const tagCls={고객:'b-bl',VIP:'b-gn',잠재:'b-am',휴면:'b-rd'};
  /* 개인 명함 + 공유 명함 (중복 제거) */
  const personalCards = DB.getCards().filter(c=>c.co===co.nm);
  const personalIds   = new Set(personalCards.map(c=>c.id));
  const sharedCards   = DB.getDriveShared().filter(c=>c.co===co.nm && !personalIds.has(c.id));
  const cards  = [...personalCards, ...sharedCards];
  const visits = DB.getVisits().filter(v=>v.coId===coId);

  const el = document.getElementById('overlay-co');
  if(!_noCoState) history.pushState({overlay:'co', coId}, '');
  el.innerHTML = `
    <header class="hdr">
      <div class="hdr-back" onclick="history.back()">←</div>
      <span class="hdr-t">${co.nm}</span>
      <div class="hdr-icon" onclick="openCoEdit('${coId}')">✏️</div>
    </header>
    <div class="overlay-body">
      <div class="det-hero">
        <div class="det-av" style="background:var(--blue-lt);color:var(--blue);font-size:26px;">🏢</div>
        <div>
          <div class="det-nm">${co.nm}</div>
          <div class="det-tl">${co.addr||''}</div>
          <div style="margin-top:6px;"><span class="bx ${stCls[co.st]||'b-bl'}">${stLbl[co.st]||co.st}</span>${co.ind?` <span style="font-size:12px;color:var(--t2);">${co.ind}</span>`:''}  </div>
        </div>
      </div>
      <div class="sec-hdr"><h3>소속 명함 (${cards.length})</h3></div>
      <div class="bp" style="padding:0 14px;">
        ${cards.length ? cards.map(c=>`
          <div class="li" onclick="location.href='card.html?id=${c.id}'">
            <div class="av" style="background:${c.cl}18;color:${c.cl}">${c.nm[0]}</div>
            <div class="li-info"><div class="li-name">${c.nm}</div><div class="li-sub">${c.tl||''}</div></div>
            <div class="li-r"><span class="bx ${tagCls[c.tag]||'b-bl'}">${c.tag}</span><span class="chev">›</span></div>
          </div>`).join('') : '<div style="padding:16px;font-size:13px;color:var(--t3);text-align:center;">소속 명함이 없습니다</div>'}
      </div>
      <div class="sec-hdr"><h3>방문 이력 (${visits.length})</h3><a onclick="openVisitModal('${coId}','${co.nm}')">+ 기록</a></div>
      <div class="tl" id="co-visit-tl">
        ${visits.length ? visits.map(v=>_visitHtml(v)).join('') : '<div style="padding:16px;font-size:13px;color:var(--t3);text-align:center;">방문 기록이 없습니다</div>'}
      </div>
      ${co.addr?`<a href="map.html?addr=${encodeURIComponent(co.addr)}&nm=${encodeURIComponent(co.nm)}" class="action-btn" style="display:block;text-align:center;text-decoration:none;color:#fff;background:#10b981;">📍 지도에서 보기</a>`:''}
      <button class="action-btn" onclick="openVisitModal('${coId}','${co.nm}')">📝 방문 기록 추가</button>
      <div style="height:20px;"></div>
    </div>`;
  el.classList.add('show');
}

function closeAllOverlays() {
  /* 슬라이드 오버레이 + 모달시트 모두 닫기 */
  document.querySelectorAll('.overlay, .moverlay').forEach(el=>el.classList.remove('show'));
  /* 동적 생성 모달 제거 */
  ['_cedit','_coedit'].forEach(id=>{ const el=document.getElementById(id); if(el) el.remove(); });
}

function closeCoOverlay() {
  const el = document.getElementById('overlay-co');
  if(el) el.classList.remove('show');
}

function refreshCoVisits(coId) {
  const visits = DB.getVisits().filter(v=>v.coId===coId);
  const tl = document.getElementById('co-visit-tl');
  if(!tl) return;
  tl.innerHTML = visits.length ? visits.map(v=>_visitHtml(v)).join('') : '<div style="padding:16px;font-size:13px;color:var(--t3);text-align:center;">방문 기록이 없습니다</div>';
}

/* ══════════════════════════════════════════
   방문기록 추가 모달 (공통)
══════════════════════════════════════════ */
function openVisitModal(coId, coNm) {
  _visitCtx = {coId, coNm};
  document.getElementById('v-dt').value = new Date().toISOString().split('T')[0];
  document.getElementById('v-memo').value = '';
  document.getElementById('v-next').value = '';
  const g = document.getElementById('type-grid');
  g.innerHTML = VISIT_TYPES.map(t=>`<div class="bx b-bl" style="cursor:pointer;padding:7px 14px;" onclick="_selectType(this)">${t}</div>`).join('');
  _selectType(g.children[0]);
  const lbl = document.getElementById('v-co-lbl');
  if(lbl) lbl.textContent = coNm;
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

/* ── 오버레이 히스토리 복원 (popstate) ── */
window.addEventListener('popstate', function(e) {
  const s = e.state;
  if(s?.overlay === 'co') {
    _noCoState = true;
    openCoOverlay(s.coId);
    _noCoState = false;
  } else {
    /* co 오버레이만 닫기 (card 오버레이는 cards.html popstate에서 처리) */
    const coEl = document.getElementById('overlay-co');
    if(coEl) coEl.classList.remove('show');
  }
});
