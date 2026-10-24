/* ── 탭바 렌더 ── */
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
