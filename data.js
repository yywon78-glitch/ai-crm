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
    count: () => _open().then(db => new Promise((res,rej)=>{
      const req = db.transaction('imgs','readonly').objectStore('imgs').count();
      req.onsuccess = e => res(e.target.result); req.onerror = rej;
    })),
    clear: () => _open().then(db => new Promise((res,rej)=>{
      const tx = db.transaction('imgs','readwrite');
      tx.objectStore('imgs').clear(); tx.oncomplete = res; tx.onerror = rej;
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
  setKey:       k => { localStorage.setItem('crm_key', k); _scheduleSyncUp(); },
  getWorkspace: ()=> localStorage.getItem('crm_workspace')||'',
  setWorkspace: k => { localStorage.setItem('crm_workspace', k); _scheduleSyncUp(); },
  getKakaoKey:  ()=> localStorage.getItem('crm_kakao_key')||'',
  setKakaoKey:  k => { localStorage.setItem('crm_kakao_key', k); _scheduleSyncUp(); },

  getCards:  ()=> JSON.parse(localStorage.getItem('crm_cards')||'null') || [..._CARDS],
  setCards:  d => { localStorage.setItem('crm_cards', JSON.stringify(d)); localStorage.setItem('crm_needs_sync','1'); _scheduleSyncUp(); },

  getCos:    ()=> JSON.parse(localStorage.getItem('crm_cos')||'null') || [..._COS],
  setCos:    d => localStorage.setItem('crm_cos', JSON.stringify(d)), /* cos는 Drive 동기화 안 함 — 카드에서 파생 */

  getVisits: ()=> JSON.parse(localStorage.getItem('crm_visits')||'null') || [..._VISITS],
  setVisits: d => { localStorage.setItem('crm_visits', JSON.stringify(d)); localStorage.setItem('crm_needs_sync','1'); _scheduleSyncUp(); },

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
   Google Identity Services — 로그인 시에만 로드
   페이지 로드 시 자동 실행하지 않음 → 번쩍임 없음
══════════════════════════════════════════ */
function _loadGIS(){
  return new Promise(resolve => {
    if(typeof google !== 'undefined' && google.accounts) return resolve();
    if(document.getElementById('_gsi_script')){
      /* 이미 로딩 중 — 완료 대기 */
      const t = setInterval(()=>{
        if(typeof google !== 'undefined' && google.accounts){ clearInterval(t); resolve(); }
      }, 100);
      return;
    }
    const s = document.createElement('script');
    s.id  = '_gsi_script';
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

/* ══════════════════════════════════════════
   GoogleAuth — OAuth 토큰 관리
══════════════════════════════════════════ */
const GoogleAuth = (function(){
  const SCOPE = 'https://www.googleapis.com/auth/drive';
  let _token = null, _expiry = 0, _client = null, _refreshTimer = null;

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

  return {
    isLoggedIn()  { return !!_token && _expiry > Date.now(); },
    getToken()    { return _token; },
    getUserEmail(){ return localStorage.getItem('crm_gemail')||''; },

    async login(onDone){
      const cid = DB.getGoogleClientId();
      if(!cid){ alert('설정 → Google Client ID를 먼저 입력해주세요.'); return; }
      /* 로그인할 때만 GIS 로드 — 평소엔 스크립트 자체를 안 불러서 번쩍임 없음 */
      await _loadGIS();
      _client = google.accounts.oauth2.initTokenClient({
        client_id: cid, scope: SCOPE,
        callback: async resp => {
          if(resp.error){ console.error('OAuth:', resp); return; }
          _saveToken(resp);
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
    },

    logout(){
      if(_token && typeof google !== 'undefined') google.accounts.oauth2?.revoke(_token, ()=>{});
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
      /* 로컬 미업로드 변경분 있으면 먼저 올림 */
      if(localStorage.getItem('crm_needs_sync') === '1'){
        await DriveDB.syncUp();
        return true;
      }
      try{
        const [cards, visits, settings] = await Promise.all([
          _load('crm_cards.json'), _load('crm_visits.json'), _load('crm_settings.json')
        ]);
        /* 네트워크 대기 중 로컬 변경이 생겼을 수 있어 재확인 */
        if(localStorage.getItem('crm_needs_sync') === '1'){
          await DriveDB.syncUp();
          return true;
        }
        if(cards)    localStorage.setItem('crm_cards',   JSON.stringify(cards));
        if(visits)   localStorage.setItem('crm_visits',  JSON.stringify(visits));
        if(settings){
          if(settings.key)       localStorage.setItem('crm_key',              settings.key);
          if(settings.workspace) localStorage.setItem('crm_workspace',        settings.workspace);
          if(settings.kakaoKey)  localStorage.setItem('crm_kakao_key',        settings.kakaoKey);
          if(settings.clientId)  localStorage.setItem('crm_google_client_id', settings.clientId);
        }
        localStorage.setItem('crm_gdrive_lastsync', new Date().toISOString());
        return true;
      } catch(e){ console.error('syncDown', e); return false; }
    },

    /* localStorage → Drive */
    async syncUp(){
      if(!GoogleAuth.isLoggedIn() || _busy) return false;
      _busy = true;
      try{
        const settings = {
          key:       DB.getKey(),
          workspace: DB.getWorkspace(),
          kakaoKey:  DB.getKakaoKey(),
          clientId:  DB.getGoogleClientId(),
        };
        await Promise.all([
          _save('crm_cards.json',    DB.getCards()),
          _save('crm_visits.json',   DB.getVisits()),
          _save('crm_settings.json', settings),
        ]);
        localStorage.setItem('crm_gdrive_lastsync', new Date().toISOString());
        localStorage.removeItem('crm_needs_sync');
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
    getFolderUrl(){ return _fid ? `https://drive.google.com/drive/folders/${_fid}` : null; },

    /* Drive 파일 건수만 조회 — localStorage 덮어쓰기 없음 */
    async peek(){
      if(!GoogleAuth.isLoggedIn()) return null;
      try{
        const [cards, visits] = await Promise.all([
          _load('crm_cards.json'), _load('crm_visits.json')
        ]);
        return {
          cards:  Array.isArray(cards)  ? cards.length  : 0,
          visits: Array.isArray(visits) ? visits.length : 0
        };
      } catch(e){ return null; }
    },

    /* Drive 개인 파일을 빈 배열로 초기화 */
    async clearPersonalData(){
      if(!GoogleAuth.isLoggedIn()) return false;
      try{
        await Promise.all([
          _save('crm_cards.json',  []),
          _save('crm_visits.json', [])
        ]);
        localStorage.removeItem('crm_needs_sync');
        return true;
      } catch(e){ console.error('clearPersonalData', e); return false; }
    }
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

  async function _sharedUpload(name, newItems, parentId){
    /* 단순 upsert: 기존 로드 → ID 기준 추가/업데이트 → 저장 */
    const eid = await _fileId(name);
    let map = {};
    if(eid){
      try{
        const r = await _api(`https://www.googleapis.com/drive/v3/files/${eid}?alt=media`);
        const d = await r.json();
        if(Array.isArray(d)) d.forEach(c => { map[c.id] = c; });
      } catch(e){}
    }
    newItems.forEach(c => { map[c.id] = c; }); /* 추가 or 업데이트 */
    const body = JSON.stringify(Object.values(map));
    const bnd  = 'CRM_MRG_BNDRY';
    const meta = JSON.stringify(eid ? {} : {name, parents:[parentId]});
    const mp   = `--${bnd}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n--${bnd}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${bnd}--`;
    const url  = eid
      ? `https://www.googleapis.com/upload/drive/v3/files/${eid}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    await _api(url, {method:eid?'PATCH':'POST',
      headers:{'Content-Type':`multipart/related; boundary=${bnd}`}, body:mp});
  }

  return {
    async sync(){
      if(!GoogleAuth.isLoggedIn()) return false;
      try{
        const shared = DB.getCards().filter(c=>c.shared);
        /* 이미지도 함께 첨부 (_img 필드) */
        const withImgs = await Promise.all(shared.map(async c=>{
          try{ const img = await ImgDB.get(c.id); return img ? {...c, _img:img} : {...c}; }
          catch(e){ return {...c}; }
        }));
        await _sharedUpload(FILE_NAME, withImgs, FOLDER_ID);
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
        /* _img 필드가 있으면 ImgDB에 저장 후 제거 */
        for(const c of arr){
          if(c._img){ try{ await ImgDB.set(c.id, c._img); }catch(e){} delete c._img; }
        }
        DB.setDriveShared(arr);
        /* 공용 폴더에 없는 내 공유 카드 → shared 플래그 자동 해제 */
        SharedDriveDB.cleanMySharedFlags(arr);
        return arr;
      } catch(e){ console.error('SharedDriveDB.load', e); return []; }
    },

    /* 공용 폴더에 없는 내 공유 카드의 shared 플래그 자동 제거 */
    cleanMySharedFlags(folderCards){
      const myEmail  = GoogleAuth.getUserEmail();
      if(!myEmail) return;
      const folderIds = new Set(folderCards.map(c=>c.id));
      const cards  = DB.getCards();
      let changed  = false;
      cards.forEach(c=>{
        if(c.shared && c.sharedBy === myEmail && !folderIds.has(c.id)){
          delete c.shared; delete c.sharedBy; changed = true;
        }
      });
      if(changed){
        DB.setCards(cards); /* 변경 있으면 저장 + Drive syncUp 예약 */
      }
    },
    /* 공유 방문기록 업로드 */
    async syncVisits(){
      if(!GoogleAuth.isLoggedIn()) return false;
      try{
        const shared = DB.getVisits().filter(v=>v.shared);
        await _sharedUpload('crm_shared_visits.json', shared, FOLDER_ID);
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
    getFolderUrl(){ return `https://drive.google.com/drive/folders/${FOLDER_ID}`; },

    /* 특정 카드 ID들을 공용 폴더에서 제거 */
    async removeCards(ids){
      if(!GoogleAuth.isLoggedIn() || !ids?.length) return false;
      try{
        const idSet = new Set(ids);
        const eid = await _fileId(FILE_NAME);
        if(!eid) return true;
        const r = await _api(`https://www.googleapis.com/drive/v3/files/${eid}?alt=media`);
        const data = await r.json();
        const remaining = Array.isArray(data) ? data.filter(c=>!idSet.has(c.id)) : [];
        const body = JSON.stringify(remaining);
        const bnd  = 'CRM_DEL_BNDRY';
        const mp   = `--${bnd}\r\nContent-Type: application/json\r\n\r\n{}\r\n--${bnd}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${bnd}--`;
        await _api(`https://www.googleapis.com/upload/drive/v3/files/${eid}?uploadType=multipart`,
          {method:'PATCH', headers:{'Content-Type':`multipart/related; boundary=${bnd}`}, body:mp});
        return true;
      } catch(e){ console.error('SharedDriveDB.removeCards', e); return false; }
    },

    /* 현재 사용자가 공용 폴더 소유자(관리자)인지 확인 */
    async isAdmin(){
      if(!GoogleAuth.isLoggedIn()) return false;
      try{
        const r = await _api(`https://www.googleapis.com/drive/v3/files/${FOLDER_ID}?fields=owners`);
        const d = await r.json();
        const me = GoogleAuth.getUserEmail().toLowerCase();
        return Array.isArray(d.owners) && d.owners.some(o=>o.emailAddress?.toLowerCase()===me);
      } catch(e){ return false; }
    },

    /* 공용 폴더 전체 초기화 (관리자용) */
    async clearShared(){
      if(!GoogleAuth.isLoggedIn()) return false;
      try{
        const upload = async (name) => {
          const eid = await _fileId(name);
          if(!eid) return;
          const bnd = 'CRM_CLR_BNDRY';
          const mp  = `--${bnd}\r\nContent-Type: application/json\r\n\r\n{}\r\n--${bnd}\r\nContent-Type: application/json\r\n\r\n[]\r\n--${bnd}--`;
          await _api(`https://www.googleapis.com/upload/drive/v3/files/${eid}?uploadType=multipart`,
            {method:'PATCH', headers:{'Content-Type':`multipart/related; boundary=${bnd}`}, body:mp});
        };
        await Promise.all([upload(FILE_NAME), upload('crm_shared_visits.json')]);
        localStorage.removeItem('crm_drive_shared');
        localStorage.removeItem('crm_drive_shared_visits');
        return true;
      } catch(e){ console.error('SharedDriveDB.clearShared', e); return false; }
    }
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

/* Drive에 설정 파일이 없으면 즉시 업로드 (기기 최초 연결 시) */
async function _ensureSettingsUploaded(){
  if(!GoogleAuth.isLoggedIn()) return;
  if(!DB.getKey()) return; /* API 키가 로컬에도 없으면 스킵 */
  try{
    await DriveDB.syncUp();
  } catch(e){}
}
