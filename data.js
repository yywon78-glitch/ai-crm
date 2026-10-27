/* ── 샘플 데이터 없음 — 앱 최초 실행 시 빈 상태로 시작 ── */
const _CARDS = [];
const _COS   = [];
const _VISITS = [];

/* ── 샘플 데이터 버전 자동 갱신 ── */
(function(){
  const raw = localStorage.getItem('crm_visits');
  if(raw){
    const v = JSON.parse(raw);
    // ourTargets 필드 없는 구 버전이면 리셋
    if(v.length && v[0].ourTargets === undefined){
      localStorage.removeItem('crm_visits');
    }
  }
})();

/* ── 이미지 저장 — IndexedDB (localStorage 용량 제한 우회) ── */
const ImgDB = (function(){
  let _db = null;
  function _open(){
    return new Promise((res,rej)=>{
      if(_db) return res(_db);
      const req = indexedDB.open('crm_imgs', 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('imgs');
      req.onsuccess = e => { _db = e.target.result; res(_db); };
      req.onerror   = rej;
    });
  }
  return {
    set: (id, data) => _open().then(db => new Promise((res,rej)=>{
      const tx = db.transaction('imgs','readwrite');
      tx.objectStore('imgs').put(data, id);
      tx.oncomplete = res; tx.onerror = rej;
    })),
    get: (id) => _open().then(db => new Promise((res,rej)=>{
      const req = db.transaction('imgs','readonly').objectStore('imgs').get(id);
      req.onsuccess = e => res(e.target.result || null); req.onerror = rej;
    })),
    del: (id) => _open().then(db => new Promise(res=>{
      const tx = db.transaction('imgs','readwrite');
      tx.objectStore('imgs').delete(id); tx.oncomplete = res;
    })),
    /* 기존 localStorage img 마이그레이션 */
    migrate: async (cards) => {
      let changed = false;
      for(const c of cards){
        if(c.img){
          try{ await ImgDB.set(c.id, c.img); }catch(e){}
          c.img = null; changed = true;
        }
      }
      return changed;
    }
  };
})();

/* ── DB 레이어 ── */
const DB = {
  getKey:       ()=> localStorage.getItem('crm_key')||'',
  setKey:       k => localStorage.setItem('crm_key', k),
  getWorkspace: ()=> localStorage.getItem('crm_workspace')||'',
  setWorkspace: k => localStorage.setItem('crm_workspace', k),
  getKakaoKey:  ()=> localStorage.getItem('crm_kakao_key')||'',
  setKakaoKey:  k => localStorage.setItem('crm_kakao_key', k),

  getCards:  ()=> JSON.parse(localStorage.getItem('crm_cards')||'null') || [..._CARDS],
  setCards:  d => { localStorage.setItem('crm_cards', JSON.stringify(d)); _scheduleSyncUp(); },

  getCos:    ()=> JSON.parse(localStorage.getItem('crm_cos')||'null') || [..._COS],
  setCos:    d => localStorage.setItem('crm_cos', JSON.stringify(d)), /* cos는 Drive 동기화 안 함 — 카드에서 파생 */

  getVisits: ()=> JSON.parse(localStorage.getItem('crm_visits')||'null') || [..._VISITS],
  setVisits: d => { localStorage.setItem('crm_visits', JSON.stringify(d)); _scheduleSyncUp(); },

  getGoogleClientId: ()=> localStorage.getItem('crm_google_client_id')||'649878765858-vs311q5tkgos3v1tp61eaflu0bgiap44.apps.googleusercontent.com',
  setGoogleClientId: id=> localStorage.setItem('crm_google_client_id', id),

  /* 공유 명함 캐시 */
  getDriveShared:       ()=> JSON.parse(localStorage.getItem('crm_drive_shared')||'[]'),
  setDriveShared:       d => localStorage.setItem('crm_drive_shared', JSON.stringify(d)),
  /* 공유 방문기록 캐시 */
  getDriveSharedVisits: ()=> JSON.parse(localStorage.getItem('crm_drive_shared_visits')||'[]'),
  setDriveSharedVisits: d => localStorage.setItem('crm_drive_shared_visits', JSON.stringify(d)),
};

/* ══════════════════════════════════════════
   Google Identity Services 스크립트 동적 로드
══════════════════════════════════════════ */
(function(){
  if(document.getElementById('_gsi_script')) return;
  const s = document.createElement('script');
  s.id  = '_gsi_script';
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true; s.defer = true;
  document.head.appendChild(s);
})();

/* ══════════════════════════════════════════
   GoogleAuth — OAuth 토큰 관리
══════════════════════════════════════════ */
const GoogleAuth = (function(){
  const SCOPE = 'https://www.googleapis.com/auth/drive';
  let _token = null, _expiry = 0, _client = null, _refreshTimer = null;

  /* 저장된 토큰 복원 */
  (function(){
    try {
      const t = JSON.parse(localStorage.getItem('crm_gtoken')||'null');
      if(t && t.expiry > Date.now() + 60000){ _token = t.token; _expiry = t.expiry; }
    } catch(e){}
  })();

  function _saveToken(resp){
    _token  = resp.access_token;
    _expiry = Date.now() + resp.expires_in * 1000;
    localStorage.setItem('crm_gtoken', JSON.stringify({token:_token, expiry:_expiry}));
  }

  /* 50분마다 자동 갱신 타이머 시작 */
  function _startRefreshTimer(){
    if(_refreshTimer) clearInterval(_refreshTimer);
    _refreshTimer = setInterval(()=> GoogleAuth.silentRefresh(), 50 * 60 * 1000);
  }

  return {
    isLoggedIn()  { return !!_token && _expiry > Date.now(); },
    getToken()    { return _token; },
    getUserEmail(){ return localStorage.getItem('crm_gemail')||''; },

    /* 조용한 자동 갱신 — 사용자 개입 없음 */
    silentRefresh(){
      const cid = DB.getGoogleClientId();
      if(!cid || typeof google==='undefined') return;
      try{
        google.accounts.oauth2.initTokenClient({
          client_id: cid, scope: SCOPE,
          prompt: '',           /* 빈 문자열 = 팝업 없이 갱신 */
          callback: resp => {
            if(resp.error){ console.warn('silentRefresh 실패:', resp.error); return; }
            _saveToken(resp);
          }
        }).requestAccessToken({prompt:''});
      } catch(e){ console.warn('silentRefresh 오류:', e); }
    },

    /* 앱 시작 시 조용한 세션 복구 — 팝업 없음 */
    tryRestore(onSuccess){
      /* 이전 로그인 흔적이 없으면 스킵 */
      if(!localStorage.getItem('crm_gemail') && !localStorage.getItem('crm_gtoken')) return;
      const cid = DB.getGoogleClientId();
      if(!cid) return;
      const _go = () => {
        try{
          google.accounts.oauth2.initTokenClient({
            client_id: cid, scope: SCOPE,
            prompt: '',   /* 빈 문자열 = UI 없이 시도 */
            callback: resp => {
              if(resp.error){ console.log('세션 복구 실패(정상):', resp.error); return; }
              _saveToken(resp);
              _startRefreshTimer();
              if(typeof onSuccess==='function') onSuccess();
            }
          }).requestAccessToken({prompt:''});
        } catch(e){ console.warn('tryRestore 오류:', e); }
      };
      if(typeof google!=='undefined') _go();
      else setTimeout(_go, 2000);
    },

    login(onDone){
      const cid = DB.getGoogleClientId();
      if(!cid){ alert('설정 → Google Drive에서 Client ID를 먼저 입력해주세요.'); return; }
      const _go = () => {
        _client = google.accounts.oauth2.initTokenClient({
          client_id: cid,
          scope: SCOPE,
          callback: async resp => {
            if(resp.error){ console.error('OAuth:', resp); return; }
            _saveToken(resp);
            _startRefreshTimer();   /* 로그인 후 자동갱신 시작 */
            /* 이메일 가져오기 */
            try{
              const r = await fetch('https://www.googleapis.com/drive/v3/about?fields=user',
                {headers:{Authorization:'Bearer '+_token}});
              const d = await r.json();
              localStorage.setItem('crm_gemail', d.user?.emailAddress||'');
            } catch(e){}
            if(typeof onDone==='function') onDone();
          }
        });
        _client.requestAccessToken({prompt:'consent'});
      };
      if(typeof google !== 'undefined') _go();
      else { setTimeout(_go, 1500); }
    },

    logout(){
      if(_token) google.accounts.oauth2?.revoke(_token, ()=>{});
      _token = null; _expiry = 0;
      localStorage.removeItem('crm_gtoken');
      localStorage.removeItem('crm_gemail');
      localStorage.removeItem('crm_gdrive_folder');
      localStorage.removeItem('crm_gdrive_lastsync');
    }
  };
})();

/* ══════════════════════════════════════════
   DriveDB — Google Drive 파일 읽기/쓰기
══════════════════════════════════════════ */
const DriveDB = (function(){
  const FOLDER = 'CRM_개인';
  let _fid = localStorage.getItem('crm_gdrive_folder')||null;
  let _busy = false;

  async function _api(url, opts={}){
    const res = await fetch(url, {
      ...opts,
      headers:{'Authorization':'Bearer '+GoogleAuth.getToken(), ...(opts.headers||{})}
    });
    if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error(e.error?.message||'DriveAPI '+res.status); }
    return res;
  }

  async function _folder(){
    if(_fid) return _fid;
    const r = await _api(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name='${FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`)}&fields=files(id)`);
    const d = await r.json();
    if(d.files?.length){ _fid = d.files[0].id; }
    else {
      const c = await _api('https://www.googleapis.com/drive/v3/files',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({name:FOLDER, mimeType:'application/vnd.google-apps.folder'})
      });
      _fid = (await c.json()).id;
    }
    localStorage.setItem('crm_gdrive_folder', _fid);
    return _fid;
  }

  async function _fileId(name){
    const fid = await _folder();
    const r = await _api(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name='${name}' and '${fid}' in parents and trashed=false`)}&fields=files(id)`);
    const d = await r.json();
    return d.files?.[0]?.id || null;
  }

  async function _save(name, data){
    const fid  = await _folder();
    const body = JSON.stringify(data);
    const eid  = await _fileId(name); /* _fileId now takes name param */
    const bnd  = 'CRM_BOUNDARY_7x';
    const meta = JSON.stringify(eid ? {} : {name, parents:[fid]});
    const mp   = `--${bnd}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n--${bnd}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${bnd}--`;
    const url  = eid
      ? `https://www.googleapis.com/upload/drive/v3/files/${eid}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    await _api(url, {method: eid?'PATCH':'POST',
      headers:{'Content-Type':`multipart/related; boundary=${bnd}`}, body:mp});
  }

  async function _load(name){
    const eid = await _fileId(name);
    if(!eid) return null;
    const r = await _api(`https://www.googleapis.com/drive/v3/files/${eid}?alt=media`);
    return await r.json();
  }

  return {
    /* Drive → localStorage */
    async syncDown(){
      if(!GoogleAuth.isLoggedIn()) return false;
      try{
        const [cards, visits] = await Promise.all([
          _load('crm_cards.json'), _load('crm_visits.json')
        ]);
        if(cards)  localStorage.setItem('crm_cards',  JSON.stringify(cards));
        if(visits) localStorage.setItem('crm_visits', JSON.stringify(visits));
        localStorage.setItem('crm_gdrive_lastsync', new Date().toISOString());
        return true;
      } catch(e){ console.error('syncDown', e); return false; }
    },

    /* localStorage → Drive */
    async syncUp(){
      if(!GoogleAuth.isLoggedIn() || _busy) return false;
      _busy = true;
      try{
        await Promise.all([
          _save('crm_cards.json',  DB.getCards()),
          _save('crm_visits.json', DB.getVisits())
        ]);
        localStorage.setItem('crm_gdrive_lastsync', new Date().toISOString());
        _busy = false; return true;
      } catch(e){ console.error('syncUp', e); _busy = false; return false; }
    },

    async getStorageInfo(){
      try{
        const r = await _api('https://www.googleapis.com/drive/v3/about?fields=storageQuota,user');
        return await r.json();
      } catch(e){ return null; }
    },

    getLastSync(){ return localStorage.getItem('crm_gdrive_lastsync')||null; },
    getFolderUrl(){ return _fid ? `https://drive.google.com/drive/folders/${_fid}` : null; }
  };
})();

/* ══════════════════════════════════════════
   SharedDriveDB — CRM_공용 폴더 공유 명함 관리
══════════════════════════════════════════ */
const SharedDriveDB = (function(){
  const FOLDER_ID = '1vsNVDH17zJZWUYZSNeUAVPrP1WApAFDg';
  const FILE_NAME = 'crm_shared_cards.json';

  async function _api(url, opts={}){
    const res = await fetch(url, {
      ...opts,
      headers:{'Authorization':'Bearer '+GoogleAuth.getToken(), ...(opts.headers||{})}
    });
    if(!res.ok){ const e=await res.json().catch(()=>({})); throw new Error(e.error?.message||'SharedDriveAPI '+res.status); }
    return res;
  }

  async function _fileId(name){
    const r = await _api(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name='${name}' and '${FOLDER_ID}' in parents and trashed=false`)}&fields=files(id)`);
    const d = await r.json();
    return d.files?.[0]?.id || null;
  }

  return {
    async sync(){
      if(!GoogleAuth.isLoggedIn()) return false;
      try{
        const shared = DB.getCards().filter(c=>c.shared);
        const body   = JSON.stringify(shared);
        const eid    = await _fileId();
        const bnd    = 'CRM_SHARED_BNDRY';
        const meta   = JSON.stringify(eid ? {} : {name:FILE_NAME, parents:[FOLDER_ID]});
        const mp     = `--${bnd}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n--${bnd}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${bnd}--`;
        const url    = eid
          ? `https://www.googleapis.com/upload/drive/v3/files/${eid}?uploadType=multipart`
          : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        await _api(url, {method:eid?'PATCH':'POST',
          headers:{'Content-Type':`multipart/related; boundary=${bnd}`}, body:mp});
        return true;
      } catch(e){ console.error('SharedDriveDB.sync', e); return false; }
    },
    /* CRM_공용 → 공유 명함 불러오기 */
    async load(){
      if(!GoogleAuth.isLoggedIn()) return [];
      try{
        const eid = await _fileId(FILE_NAME);
        if(!eid) return [];
        const r = await _api(`https://www.googleapis.com/drive/v3/files/${eid}?alt=media`);
        const data = await r.json();
        const arr = Array.isArray(data) ? data : [];
        DB.setDriveShared(arr);
        return arr;
      } catch(e){ console.error('SharedDriveDB.load', e); return []; }
    },
    /* 공유 방문기록 업로드 */
    async syncVisits(){
      if(!GoogleAuth.isLoggedIn()) return false;
      try{
        const shared = DB.getVisits().filter(v=>v.shared);
        const body   = JSON.stringify(shared);
        const eid    = await _fileId('crm_shared_visits.json');
        const bnd    = 'CRM_SHARED_V_BNDRY';
        const meta   = JSON.stringify(eid ? {} : {name:'crm_shared_visits.json', parents:[FOLDER_ID]});
        const mp     = `--${bnd}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n--${bnd}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${bnd}--`;
        const url    = eid
          ? `https://www.googleapis.com/upload/drive/v3/files/${eid}?uploadType=multipart`
          : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        await _api(url, {method:eid?'PATCH':'POST',
          headers:{'Content-Type':`multipart/related; boundary=${bnd}`}, body:mp});
        return true;
      } catch(e){ console.error('SharedDriveDB.syncVisits', e); return false; }
    },
    /* CRM_공용 → 공유 방문기록 불러오기 */
    async loadVisits(){
      if(!GoogleAuth.isLoggedIn()) return [];
      try{
        const eid = await _fileId('crm_shared_visits.json');
        if(!eid) return [];
        const r = await _api(`https://www.googleapis.com/drive/v3/files/${eid}?alt=media`);
        const data = await r.json();
        const arr = Array.isArray(data) ? data : [];
        DB.setDriveSharedVisits(arr);
        return arr;
      } catch(e){ console.error('SharedDriveDB.loadVisits', e); return []; }
    },
    getFolderUrl(){ return `https://drive.google.com/drive/folders/${FOLDER_ID}`; }
  };
})();

/* ══════════════════════════════════════════
   자동 sync 스케줄러 — 저장 3초 후 Drive 업로드
══════════════════════════════════════════ */
let _syncTimer = null;
function _scheduleSyncUp(){
  if(!GoogleAuth.isLoggedIn()) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(()=> DriveDB.syncUp(), 3000);
}
