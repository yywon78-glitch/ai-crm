/* ── 샘플 데이터 ── */
const _CARDS = [
  {id:'c1',nm:'김철수',co:'삼성전자(주)',tl:'B2B영업팀 부장',mob:'010-1234-5678',ph:'02-2255-1100',em:'cskim@samsung.com',addr:'서울 서초구 서초동 1321',tag:'VIP', cl:'#2563eb',fav:true},
  {id:'c2',nm:'이민아',co:'삼성전자(주)',tl:'구매전략팀 차장',mob:'010-2341-8800',ph:'02-2255-2200',em:'malee@samsung.com',addr:'서울 서초구 서초동 1321',tag:'고객',cl:'#2563eb',fav:false},
  {id:'c3',nm:'박상현',co:'삼성전자(주)',tl:'파트너십 대리',mob:'010-9988-1234',ph:'02-2255-3300',em:'shpark@samsung.com',addr:'서울 서초구 서초동 1321',tag:'고객',cl:'#2563eb',fav:false},
  {id:'c4',nm:'이영희',co:'LG화학(주)',  tl:'구매팀 대리',  mob:'010-9876-5432',ph:'02-3777-1000',em:'ylee@lgchem.com',    addr:'서울 영등포구 여의도동', tag:'VIP', cl:'#16a34a',fav:true},
  {id:'c5',nm:'최진석',co:'LG화학(주)',  tl:'기술영업 과장',mob:'010-3344-7788',ph:'02-3777-2000',em:'jschoi@lgchem.com',  addr:'서울 영등포구 여의도동', tag:'고객',cl:'#16a34a',fav:false},
  {id:'c6',nm:'박민준',co:'현대모비스(주)',tl:'개발팀 과장', mob:'010-5555-1234',ph:'031-596-0000',em:'mjpark@mobis.co.kr', addr:'경기 성남시 분당구',     tag:'잠재',cl:'#d97706',fav:false},
  {id:'c7',nm:'김도영',co:'SK텔레콤(주)',tl:'기업영업 팀장',mob:'010-7777-8888',ph:'02-6100-0000',em:'dykim@skt.com',      addr:'서울 중구 을지로',      tag:'고객',cl:'#7c3aed',fav:true},
  {id:'c8',nm:'최지연',co:'SK텔레콤(주)',tl:'B2B솔루션 대리',mob:'010-8765-4321',ph:'02-6100-1000',em:'jychoi@skt.com',   addr:'서울 중구 을지로',      tag:'고객',cl:'#7c3aed',fav:false},
  {id:'c9',nm:'정현우',co:'KT(주)',      tl:'B2B사업부 차장',mob:'010-2222-3333',ph:'02-981-0000',em:'hwjung@kt.com',     addr:'서울 종로구 광화문',    tag:'잠재',cl:'#dc2626',fav:false},
  {id:'c10',nm:'송미래',co:'네이버(주)', tl:'파트너십 PM',  mob:'010-4444-5555',ph:'031-888-0000',em:'mrsong@naver.com',  addr:'경기 성남시 분당구',    tag:'고객',cl:'#16a34a',fav:true},
];

const _COS = [
  {id:'co1',nm:'삼성전자(주)',addr:'서울 서초구 서초동 1321',ind:'전자/IT',   st:'active',  cnt:3,last:'2026-10-20'},
  {id:'co2',nm:'LG화학(주)',  addr:'서울 영등포구 여의도동', ind:'화학/소재',st:'active',  cnt:2,last:'2026-10-15'},
  {id:'co3',nm:'현대모비스(주)',addr:'경기 성남시 분당구',   ind:'자동차부품',st:'potential',cnt:1,last:'2026-09-28'},
  {id:'co4',nm:'SK텔레콤(주)',addr:'서울 중구 을지로',       ind:'통신',      st:'active',  cnt:2,last:'2026-10-18'},
  {id:'co5',nm:'KT(주)',       addr:'서울 종로구 광화문',    ind:'통신',      st:'potential',cnt:1,last:'2026-09-10'},
  {id:'co6',nm:'네이버(주)',   addr:'경기 성남시 분당구',    ind:'IT/플랫폼', st:'active',  cnt:1,last:'2026-10-05'},
];

const _VISITS = [
  {id:'v1',co:'삼성전자(주)',coId:'co1',tp:'💬 상담',dt:'2026-10-20',memo:'Q4 물량 협의. 단가 조율 필요. 다음달 재미팅 예정.',next:'2026-11-15'},
  {id:'v2',co:'SK텔레콤(주)',coId:'co4',tp:'🤝 인사',dt:'2026-10-18',memo:'신규 담당자 첫 방문. 명함 수령.',next:null},
  {id:'v3',co:'LG화학(주)',  coId:'co2',tp:'📄 견적',dt:'2026-10-15',memo:'2027년 공급 계획서 전달. 2주내 검토 후 회신.',next:'2026-11-01'},
  {id:'v4',co:'네이버(주)',  coId:'co6',tp:'💬 상담',dt:'2026-10-05',memo:'파트너십 제안 검토 미팅. 긍정적 반응.',next:null},
  {id:'v5',co:'현대모비스(주)',coId:'co3',tp:'🔧 AS',dt:'2026-09-28',memo:'설치 장비 점검 및 교체 완료.',next:null},
];

/* ── DB 레이어 ── */
const DB = {
  getKey:       ()=> localStorage.getItem('crm_key')||'',
  setKey:       k => localStorage.setItem('crm_key', k),
  getWorkspace: ()=> localStorage.getItem('crm_workspace')||'',
  setWorkspace: k => localStorage.setItem('crm_workspace', k),

  getCards:  ()=> JSON.parse(localStorage.getItem('crm_cards')||'null') || [..._CARDS],
  setCards:  d => localStorage.setItem('crm_cards', JSON.stringify(d)),

  getCos:    ()=> JSON.parse(localStorage.getItem('crm_cos')||'null') || [..._COS],
  setCos:    d => localStorage.setItem('crm_cos', JSON.stringify(d)),

  getVisits: ()=> JSON.parse(localStorage.getItem('crm_visits')||'null') || [..._VISITS],
  setVisits: d => localStorage.setItem('crm_visits', JSON.stringify(d)),
};
