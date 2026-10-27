/* ── 샘플 데이터 ── */
const _CARDS = [
  {id:'c1',nm:'김철수',co:'삼성전자(주)',tl:'B2B영업팀 부장',mob:'010-1234-5678',ph:'02-2255-1100',em:'cskim@samsung.com',addr:'서울 서초구 서초동 1321',tag:'VIP', cl:'#2563eb',fav:true, isDummy:true},
  {id:'c2',nm:'이민아',co:'삼성전자(주)',tl:'구매전략팀 차장',mob:'010-2341-8800',ph:'02-2255-2200',em:'malee@samsung.com',addr:'서울 서초구 서초동 1321',tag:'고객',cl:'#2563eb',fav:false,isDummy:true},
  {id:'c3',nm:'박상현',co:'삼성전자(주)',tl:'파트너십 대리',mob:'010-9988-1234',ph:'02-2255-3300',em:'shpark@samsung.com',addr:'서울 서초구 서초동 1321',tag:'고객',cl:'#2563eb',fav:false,isDummy:true},
  {id:'c4',nm:'이영희',co:'LG화학(주)',  tl:'구매팀 대리',  mob:'010-9876-5432',ph:'02-3777-1000',em:'ylee@lgchem.com',    addr:'서울 영등포구 여의도동', tag:'VIP', cl:'#16a34a',fav:true, isDummy:true},
  {id:'c5',nm:'최진석',co:'LG화학(주)',  tl:'기술영업 과장',mob:'010-3344-7788',ph:'02-3777-2000',em:'jschoi@lgchem.com',  addr:'서울 영등포구 여의도동', tag:'고객',cl:'#16a34a',fav:false,isDummy:true},
  {id:'c6',nm:'박민준',co:'현대모비스(주)',tl:'개발팀 과장', mob:'010-5555-1234',ph:'031-596-0000',em:'mjpark@mobis.co.kr', addr:'경기 성남시 분당구',     tag:'잠재',cl:'#d97706',fav:false,isDummy:true},
  {id:'c7',nm:'김도영',co:'SK텔레콤(주)',tl:'기업영업 팀장',mob:'010-7777-8888',ph:'02-6100-0000',em:'dykim@skt.com',      addr:'서울 중구 을지로',      tag:'고객',cl:'#7c3aed',fav:true, isDummy:true},
  {id:'c8',nm:'최지연',co:'SK텔레콤(주)',tl:'B2B솔루션 대리',mob:'010-8765-4321',ph:'02-6100-1000',em:'jychoi@skt.com',   addr:'서울 중구 을지로',      tag:'고객',cl:'#7c3aed',fav:false,isDummy:true},
  {id:'c9',nm:'정현우',co:'KT(주)',      tl:'B2B사업부 차장',mob:'010-2222-3333',ph:'02-981-0000',em:'hwjung@kt.com',     addr:'서울 종로구 광화문',    tag:'잠재',cl:'#dc2626',fav:false,isDummy:true},
  {id:'c10',nm:'송미래',co:'네이버(주)', tl:'파트너십 PM',  mob:'010-4444-5555',ph:'031-888-0000',em:'mrsong@naver.com',  addr:'경기 성남시 분당구',    tag:'고객',cl:'#16a34a',fav:true, isDummy:true},
];

const _COS = [
  {id:'co1',nm:'삼성전자(주)',addr:'서울 서초구 서초동 1321',ind:'전자/IT',   st:'active',  cnt:3,last:'2026-10-20',isDummy:true},
  {id:'co2',nm:'LG화학(주)',  addr:'서울 영등포구 여의도동', ind:'화학/소재',st:'active',  cnt:2,last:'2026-10-15',isDummy:true},
  {id:'co3',nm:'현대모비스(주)',addr:'경기 성남시 분당구',   ind:'자동차부품',st:'potential',cnt:1,last:'2026-09-28',isDummy:true},
  {id:'co4',nm:'SK텔레콤(주)',addr:'서울 중구 을지로',       ind:'통신',      st:'active',  cnt:2,last:'2026-10-18',isDummy:true},
  {id:'co5',nm:'KT(주)',       addr:'서울 종로구 광화문',    ind:'통신',      st:'potential',cnt:1,last:'2026-09-10',isDummy:true},
  {id:'co6',nm:'네이버(주)',   addr:'경기 성남시 분당구',    ind:'IT/플랫폼', st:'active',  cnt:1,last:'2026-10-05',isDummy:true},
];

const _VISITS = [
  /* ── 삼성전자(주) ── */
  {id:'v101',co:'삼성전자(주)',coId:'co1',tp:'🤝 인사',dt:'2026-05-08',time:'09:30',targets:['김철수'],targetExtra:'',ourTargets:'세종대왕 부장',content:'신규 거래처 첫 미팅. 회사 소개 및 제품 라인업 설명. 긍정적 반응으로 2차 미팅 약속.',memo:'첫 미팅.',next:'2026-05-22'},
  {id:'v102',co:'삼성전자(주)',coId:'co1',tp:'💬 상담',dt:'2026-05-22',time:'14:00',targets:['김철수','이민아'],targetExtra:'',ourTargets:'세종대왕 부장, 이순신 과장',content:'2차 미팅. 구체적인 요구사항 수집. 납기·단가·물량 조건 논의. 제안서 제출 요청.',memo:'요구사항 수집.',next:'2026-06-05'},
  {id:'v103',co:'삼성전자(주)',coId:'co1',tp:'📄 견적',dt:'2026-06-05',time:'10:00',targets:['이민아'],targetExtra:'',ourTargets:'이순신 과장',content:'초도 물량 견적서 제출. 단가 조건 협의. 납기 6주 요청에 4주로 협의 완료.',memo:'견적 제출.',next:'2026-06-20'},
  {id:'v104',co:'삼성전자(주)',coId:'co1',tp:'💬 상담',dt:'2026-06-20',time:'15:30',targets:['이민아','김철수'],targetExtra:'',ourTargets:'이순신 과장, 강감찬 대리',content:'견적 검토 결과 미팅. 단가 5% 추가 인하 요청. 물량 확대 조건으로 수용 협의.',memo:'견적 재협의.',next:'2026-07-10'},
  {id:'v105',co:'삼성전자(주)',coId:'co1',tp:'📄 견적',dt:'2026-07-10',time:'10:00',targets:['이민아'],targetExtra:'',ourTargets:'강감찬 대리',content:'수정 견적서 제출. 단가 3% 인하 및 물량 15% 증량 조건 반영. 계약 초안 검토 요청.',memo:'수정 견적.',next:'2026-07-25'},
  {id:'v106',co:'삼성전자(주)',coId:'co1',tp:'🤝 인사',dt:'2026-07-25',time:'12:00',targets:['김철수','박상현'],targetExtra:'',ourTargets:'세종대왕 부장',content:'계약 체결 기념 오찬. 장기 협력 파트너십 방향 논의. 분기별 정기 미팅 일정 수립.',memo:'계약 기념 오찬.',next:null},
  {id:'v107',co:'삼성전자(주)',coId:'co1',tp:'🔧 AS',dt:'2026-08-15',time:'10:00',targets:['박상현'],targetExtra:'',ourTargets:'유관순 팀장',content:'납품 장비 초기 설치 지원 및 운영 교육. 현장 담당자 교육 완료. 운영 매뉴얼 전달.',memo:'설치 지원.',next:null},
  {id:'v108',co:'삼성전자(주)',coId:'co1',tp:'💬 상담',dt:'2026-09-05',time:'14:00',targets:['김철수'],targetExtra:'',ourTargets:'이순신 과장',content:'Q3 납품 현황 점검 미팅. 납기 준수율 98% 확인. Q4 추가 물량 논의 시작.',memo:'Q3 현황 점검.',next:'2026-09-20'},
  {id:'v109',co:'삼성전자(주)',coId:'co1',tp:'📄 견적',dt:'2026-09-20',time:'10:00',targets:['이민아','김철수'],targetExtra:'',ourTargets:'유관순 팀장',content:'2027년 연간 계약 견적 제출. 총 물량 20% 증량 요청. 단가 동결 조건 협의.',memo:'연간 계약 견적.',next:'2026-10-20'},
  {id:'v110',co:'삼성전자(주)',coId:'co1',tp:'💬 상담',dt:'2026-10-20',time:'14:00',targets:['김철수','이민아'],targetExtra:'',ourTargets:'이순신 과장, 홍길동 차장',content:'Q4 공급 물량 최종 협의. 단가 10% 인하 요청 수령. 내부 검토 후 다음달 재미팅 확정.',memo:'Q4 물량 협의.',next:'2026-11-15'},

  /* ── LG화학(주) ── */
  {id:'v201',co:'LG화학(주)',coId:'co2',tp:'🤝 인사',dt:'2026-05-10',time:'10:00',targets:['이영희'],targetExtra:'',ourTargets:'홍길동 차장',content:'첫 방문 인사. 소재 공급 가능 제품군 소개. 기존 협력사와 차별화 포인트 어필.',memo:'첫 방문.',next:'2026-05-28'},
  {id:'v202',co:'LG화학(주)',coId:'co2',tp:'💬 상담',dt:'2026-05-28',time:'14:30',targets:['이영희','최진석'],targetExtra:'',ourTargets:'홍길동 차장, 강감찬 대리',content:'소재 샘플 평가 결과 검토. 물성 테스트 합격. 소량 시범 공급 계약 협의 시작.',memo:'샘플 평가 검토.',next:'2026-06-15'},
  {id:'v203',co:'LG화학(주)',coId:'co2',tp:'📄 견적',dt:'2026-06-15',time:'09:30',targets:['최진석'],targetExtra:'',ourTargets:'강감찬 대리',content:'시범 공급 견적서 제출. 100kg 소량 배치 가격 제안. 품질 보증서 첨부.',memo:'시범 공급 견적.',next:'2026-06-30'},
  {id:'v204',co:'LG화학(주)',coId:'co2',tp:'🔧 AS',dt:'2026-07-10',time:'13:00',targets:['이영희'],targetExtra:'',ourTargets:'유관순 팀장',content:'시범 납품 후 품질 이슈 현장 확인. 습도 관리 개선 방안 제시. 재납품 일정 협의.',memo:'품질 이슈 현장 확인.',next:'2026-07-25'},
  {id:'v205',co:'LG화학(주)',coId:'co2',tp:'💬 상담',dt:'2026-07-25',time:'15:00',targets:['이영희','최진석'],targetExtra:'',ourTargets:'세종대왕 부장, 홍길동 차장',content:'품질 개선 확인 미팅. 재납품 물성 합격. 본계약 진행 합의. 계약 규모 협의.',memo:'품질 개선 확인.',next:'2026-08-10'},
  {id:'v206',co:'LG화학(주)',coId:'co2',tp:'🤝 인사',dt:'2026-09-05',time:'09:30',targets:['최진석'],targetExtra:'',ourTargets:'강감찬 대리',content:'신규 담당자 변경 후 첫 방문. 기존 거래 현황 공유. 향후 협력 방향 재논의.',memo:'담당자 변경 인수인계 방문.',next:null},
  {id:'v207',co:'LG화학(주)',coId:'co2',tp:'📄 견적',dt:'2026-09-18',time:'10:30',targets:['이영희'],targetExtra:'',ourTargets:'이순신 과장',content:'Q4 물량 증량 견적 제출. 500kg→800kg 증량 제안. 단가 볼륨 디스카운트 적용.',memo:'Q4 증량 견적.',next:'2026-10-01'},
  {id:'v208',co:'LG화학(주)',coId:'co2',tp:'📞 전화',dt:'2026-10-05',time:'10:00',targets:['최진석'],targetExtra:'',ourTargets:'강감찬 대리',content:'추석 연휴 후 납기 일정 재확인. 10월 15일 입고 확정. 검수 기준 재확인.',memo:'납기 재확인 통화.',next:null},
  {id:'v209',co:'LG화학(주)',coId:'co2',tp:'📄 견적',dt:'2026-10-15',time:'10:30',targets:['이영희','최진석'],targetExtra:'',ourTargets:'강감찬 대리',content:'2027년 연간 공급 계획서 제출. 소재 단가 및 납기 조건 협의. 2주 내 검토 회신 요청.',memo:'2027 공급 계획서.',next:'2026-11-01'},
  {id:'v210',co:'LG화학(주)',coId:'co2',tp:'📞 전화',dt:'2026-10-22',time:'11:00',targets:['이영희'],targetExtra:'',ourTargets:'이순신 과장',content:'납기 일정 최종 확인. 11월 2일 입고 확정. 검수 담당자 배정 완료.',memo:'납기 확인 통화.',next:null},

  /* ── 현대모비스(주) ── */
  {id:'v301',co:'현대모비스(주)',coId:'co3',tp:'🤝 인사',dt:'2026-05-15',time:'10:00',targets:['박민준'],targetExtra:'권구매 과장',ourTargets:'세종대왕 부장',content:'자동차 부품 공급 첫 미팅. 부품 카탈로그 전달. 인증 요건 및 납기 기준 파악.',memo:'첫 미팅.',next:'2026-06-01'},
  {id:'v302',co:'현대모비스(주)',coId:'co3',tp:'💬 상담',dt:'2026-06-01',time:'14:00',targets:['박민준'],targetExtra:'',ourTargets:'이순신 과장, 유관순 팀장',content:'부품 인증 요건 상세 협의. IATF 16949 인증 보유 확인. 샘플 제출 일정 수립.',memo:'인증 요건 협의.',next:'2026-06-20'},
  {id:'v303',co:'현대모비스(주)',coId:'co3',tp:'📄 견적',dt:'2026-06-20',time:'10:00',targets:['박민준'],targetExtra:'권구매 과장',ourTargets:'강감찬 대리',content:'시제품 샘플 견적 제출. 금형 제작비 포함 초도 비용 산출. 양산 단가 별도 협의.',memo:'시제품 견적.',next:'2026-07-10'},
  {id:'v304',co:'현대모비스(주)',coId:'co3',tp:'🔧 AS',dt:'2026-07-20',time:'13:00',targets:['박민준'],targetExtra:'',ourTargets:'유관순 팀장',content:'샘플 평가 후 치수 편차 문제 현장 확인. 금형 수정 필요. 2주 내 재제출 합의.',memo:'샘플 품질 이슈.',next:'2026-08-05'},
  {id:'v305',co:'현대모비스(주)',coId:'co3',tp:'💬 상담',dt:'2026-08-05',time:'14:30',targets:['박민준'],targetExtra:'권구매 과장',ourTargets:'이순신 과장',content:'금형 수정 샘플 재평가 통과. 양산 견적 협의 시작. 월 5,000개 기준 단가 제안.',memo:'양산 견적 협의.',next:'2026-08-25'},
  {id:'v306',co:'현대모비스(주)',coId:'co3',tp:'📄 견적',dt:'2026-08-25',time:'10:00',targets:['박민준'],targetExtra:'',ourTargets:'강감찬 대리',content:'양산 견적서 제출. 물량 증가 시 단가 구간별 적용 제안. 6개월 단위 계약 협의.',memo:'양산 견적 제출.',next:'2026-09-10'},
  {id:'v307',co:'현대모비스(주)',coId:'co3',tp:'🤝 인사',dt:'2026-09-10',time:'11:00',targets:['박민준'],targetExtra:'',ourTargets:'세종대왕 부장',content:'계약 체결 전 경영진 상견례. 장기 거래 의지 재확인. 파트너십 강화 방향 논의.',memo:'경영진 상견례.',next:null},
  {id:'v308',co:'현대모비스(주)',coId:'co3',tp:'🔧 AS',dt:'2026-09-28',time:'13:00',targets:['박민준'],targetExtra:'',ourTargets:'강감찬 대리, 유관순 팀장',content:'설치 장비 정기 점검 및 노후 부품 교체. 정상 작동 확인. 다음 점검 6개월 후 예정.',memo:'장비 점검.',next:null},
  {id:'v309',co:'현대모비스(주)',coId:'co3',tp:'📄 견적',dt:'2026-10-08',time:'14:00',targets:['박민준'],targetExtra:'권구매 과장',ourTargets:'강감찬 대리, 홍길동 차장',content:'신규 전장 부품 공급 견적 제출. 단가 및 납기 조건 협의. 3개월 시범 공급 제안.',memo:'신규 부품 견적.',next:'2026-10-28'},
  {id:'v310',co:'현대모비스(주)',coId:'co3',tp:'💬 상담',dt:'2026-10-25',time:'10:00',targets:['박민준'],targetExtra:'',ourTargets:'이순신 과장',content:'시범 공급 결과 검토. 품질 합격. 본격 양산 일정 및 발주 절차 확정 논의.',memo:'시범 결과 검토.',next:'2026-11-10'},

  /* ── SK텔레콤(주) ── */
  {id:'v401',co:'SK텔레콤(주)',coId:'co4',tp:'🤝 인사',dt:'2026-05-12',time:'10:30',targets:['김도영'],targetExtra:'',ourTargets:'홍길동 차장',content:'ICT 솔루션 공급 첫 방문. 당사 솔루션 포트폴리오 소개. 기업 내부 IT 현황 파악.',memo:'첫 방문.',next:'2026-06-01'},
  {id:'v402',co:'SK텔레콤(주)',coId:'co4',tp:'💬 상담',dt:'2026-06-01',time:'14:00',targets:['김도영','최지연'],targetExtra:'',ourTargets:'세종대왕 부장, 이순신 과장',content:'기업 IT 솔루션 니즈 상세 파악. 클라우드 전환 계획 확인. PoC 범위 및 일정 논의.',memo:'니즈 파악.',next:'2026-06-20'},
  {id:'v403',co:'SK텔레콤(주)',coId:'co4',tp:'📄 견적',dt:'2026-06-20',time:'10:00',targets:['최지연'],targetExtra:'IT기획팀장',ourTargets:'강감찬 대리',content:'클라우드 마이그레이션 PoC 견적 제출. 3개월 파일럿 범위 및 비용 제안.',memo:'PoC 견적.',next:'2026-07-05'},
  {id:'v404',co:'SK텔레콤(주)',coId:'co4',tp:'🔧 AS',dt:'2026-07-15',time:'09:00',targets:['최지연'],targetExtra:'',ourTargets:'유관순 팀장',content:'PoC 환경 구축 현장 지원. 서버 설정 및 네트워크 구성 완료. 테스트 시나리오 검토.',memo:'PoC 환경 구축.',next:null},
  {id:'v405',co:'SK텔레콤(주)',coId:'co4',tp:'💬 상담',dt:'2026-07-30',time:'15:00',targets:['김도영','최지연'],targetExtra:'',ourTargets:'이순신 과장, 강감찬 대리',content:'PoC 중간 결과 검토. 성능 목표치 115% 달성. 본도입 규모 및 계약 조건 협의 시작.',memo:'PoC 중간 검토.',next:'2026-08-20'},
  {id:'v406',co:'SK텔레콤(주)',coId:'co4',tp:'📄 견적',dt:'2026-08-20',time:'10:30',targets:['최지연'],targetExtra:'',ourTargets:'홍길동 차장',content:'본도입 견적 제출. 3년 라이선스 기준 가격 제안. 유지보수 포함 패키지 옵션 제시.',memo:'본도입 견적.',next:'2026-09-10'},
  {id:'v407',co:'SK텔레콤(주)',coId:'co4',tp:'🍽 식사',dt:'2026-09-10',time:'12:00',targets:['김도영'],targetExtra:'',ourTargets:'세종대왕 부장',content:'계약 체결 전 주요 의사결정자 오찬. 계약 조건 최종 조율. 10월 계약 목표 합의.',memo:'의사결정자 오찬.',next:'2026-10-01'},
  {id:'v408',co:'SK텔레콤(주)',coId:'co4',tp:'🤝 인사',dt:'2026-10-01',time:'09:00',targets:['김도영'],targetExtra:'',ourTargets:'홍길동 차장',content:'계약 체결 후 킥오프 미팅. 프로젝트 일정 및 역할 분담 확정. 착수 준비 완료.',memo:'킥오프 미팅.',next:null},
  {id:'v409',co:'SK텔레콤(주)',coId:'co4',tp:'🤝 인사',dt:'2026-10-18',time:'09:00',targets:['김도영'],targetExtra:'',ourTargets:'홍길동 차장',content:'신규 B2B 담당자 인사. 향후 추가 솔루션 협력 방향 논의. 월 정기 미팅 일정 수립.',memo:'신규 담당자 인사.',next:null},
  {id:'v410',co:'SK텔레콤(주)',coId:'co4',tp:'💬 상담',dt:'2026-10-25',time:'16:00',targets:['김도영','최지연'],targetExtra:'',ourTargets:'이순신 과장',content:'IoT 플랫폼 연동 기술 협의. API 규격 검토 완료. 파일럿 테스트 일정 조율 중.',memo:'IoT 플랫폼 협의.',next:'2026-11-10'},

  /* ── KT(주) ── */
  {id:'v501',co:'KT(주)',coId:'co5',tp:'🤝 인사',dt:'2026-05-20',time:'10:00',targets:['정현우'],targetExtra:'',ourTargets:'세종대왕 부장',content:'통신 인프라 솔루션 첫 미팅. 당사 네트워크 솔루션 소개. KT 내부 구매 프로세스 파악.',memo:'첫 미팅.',next:'2026-06-10'},
  {id:'v502',co:'KT(주)',coId:'co5',tp:'💬 상담',dt:'2026-06-10',time:'14:00',targets:['정현우'],targetExtra:'권기술 차장',ourTargets:'홍길동 차장, 강감찬 대리',content:'네트워크 최적화 솔루션 상세 데모. 기존 시스템 연동 가능성 검토. 기술 검토 2주 요청.',memo:'솔루션 데모.',next:'2026-06-25'},
  {id:'v503',co:'KT(주)',coId:'co5',tp:'📄 견적',dt:'2026-06-25',time:'10:00',targets:['정현우'],targetExtra:'',ourTargets:'강감찬 대리',content:'네트워크 솔루션 도입 견적 제출. 기본/확장 2가지 옵션 제안. ROI 분석 자료 첨부.',memo:'솔루션 견적.',next:'2026-07-15'},
  {id:'v504',co:'KT(주)',coId:'co5',tp:'💬 상담',dt:'2026-07-15',time:'15:00',targets:['정현우'],targetExtra:'권기술 차장',ourTargets:'이순신 과장',content:'견적 검토 결과. 기능 추가 요청 사항 수렴. 커스터마이징 가능 범위 및 추가 비용 협의.',memo:'견적 검토 결과.',next:'2026-08-01'},
  {id:'v505',co:'KT(주)',coId:'co5',tp:'📄 견적',dt:'2026-08-01',time:'10:00',targets:['정현우'],targetExtra:'',ourTargets:'강감찬 대리',content:'수정 견적서 제출. 커스터마이징 비용 포함. 유지보수 SLA 조건 강화.',memo:'수정 견적.',next:'2026-08-20'},
  {id:'v506',co:'KT(주)',coId:'co5',tp:'💬 상담',dt:'2026-09-15',time:'14:30',targets:['정현우'],targetExtra:'최기술 팀장',ourTargets:'홍길동 차장, 강감찬 대리',content:'B2B 클라우드 솔루션 도입 검토 미팅. 요구사항 수집 완료. 제안서 10일 내 제출 예정.',memo:'B2B 솔루션 소개.',next:'2026-10-30'},
  {id:'v507',co:'KT(주)',coId:'co5',tp:'🍽 식사',dt:'2026-10-12',time:'12:30',targets:['정현우'],targetExtra:'',ourTargets:'세종대왕 부장, 홍길동 차장',content:'전략 파트너십 오찬. 연말 계약 체결 목표 합의. 실무 담당자 레벨 미팅 추진 예정.',memo:'전략 파트너십 오찬.',next:'2026-11-05'},
  {id:'v508',co:'KT(주)',coId:'co5',tp:'📄 견적',dt:'2026-10-18',time:'10:00',targets:['정현우'],targetExtra:'',ourTargets:'이순신 과장',content:'연간 유지보수 계약 견적 제출. 온사이트 지원 포함 프리미엄 플랜 제안.',memo:'유지보수 견적.',next:'2026-11-01'},
  {id:'v509',co:'KT(주)',coId:'co5',tp:'💬 상담',dt:'2026-10-25',time:'14:00',targets:['정현우'],targetExtra:'권기술 차장',ourTargets:'홍길동 차장',content:'차년도 사업 방향 논의. 5G 기반 신규 서비스 개발 협력 가능성 검토. 공동 TF 구성 제안.',memo:'차년도 사업 논의.',next:'2026-11-15'},
  {id:'v510',co:'KT(주)',coId:'co5',tp:'🤝 인사',dt:'2026-10-30',time:'10:00',targets:['정현우'],targetExtra:'',ourTargets:'세종대왕 부장',content:'연말 감사 인사 방문. 올해 협력 성과 공유. 내년 사업 계획 논의. 지속 파트너십 재확인.',memo:'연말 인사.',next:null},

  /* ── 네이버(주) ── */
  {id:'v601',co:'네이버(주)',coId:'co6',tp:'🤝 인사',dt:'2026-05-18',time:'10:00',targets:['송미래'],targetExtra:'',ourTargets:'세종대왕 부장',content:'클라우드 & AI 솔루션 첫 미팅. 네이버 클라우드 플랫폼 활용 현황 파악. 협업 가능성 탐색.',memo:'첫 미팅.',next:'2026-06-05'},
  {id:'v602',co:'네이버(주)',coId:'co6',tp:'💬 상담',dt:'2026-06-05',time:'14:00',targets:['송미래'],targetExtra:'홍두표 PM',ourTargets:'세종대왕 부장, 이순신 과장',content:'AI 솔루션 기술 데모. 자사 AI 모델과 네이버 클라우드 연동 가능성 검토. 공동 개발 제안.',memo:'AI 솔루션 데모.',next:'2026-06-20'},
  {id:'v603',co:'네이버(주)',coId:'co6',tp:'📄 견적',dt:'2026-06-20',time:'10:00',targets:['송미래'],targetExtra:'',ourTargets:'강감찬 대리',content:'공동 개발 PoC 견적 제출. 3개월 파일럿 범위 및 리소스 분담안 제안.',memo:'PoC 견적.',next:'2026-07-05'},
  {id:'v604',co:'네이버(주)',coId:'co6',tp:'💬 상담',dt:'2026-07-05',time:'15:30',targets:['송미래'],targetExtra:'홍두표 PM',ourTargets:'이순신 과장, 강감찬 대리',content:'PoC 조건 협의. 데이터 접근 권한 및 보안 요건 확인. 계약 초안 검토 시작.',memo:'PoC 조건 협의.',next:'2026-07-20'},
  {id:'v605',co:'네이버(주)',coId:'co6',tp:'🔧 AS',dt:'2026-08-10',time:'09:00',targets:['송미래'],targetExtra:'',ourTargets:'유관순 팀장',content:'PoC 환경 구축 지원. API 연동 테스트 완료. 일부 오류 수정 및 재검증.',memo:'PoC 구축 지원.',next:null},
  {id:'v606',co:'네이버(주)',coId:'co6',tp:'💬 상담',dt:'2026-08-28',time:'14:00',targets:['송미래'],targetExtra:'홍두표 PM',ourTargets:'세종대왕 부장, 이순신 과장',content:'PoC 최종 결과 발표. 목표 성능 120% 달성. 본계약 규모 및 기간 협의 시작.',memo:'PoC 최종 결과.',next:'2026-09-15'},
  {id:'v607',co:'네이버(주)',coId:'co6',tp:'🍽 식사',dt:'2026-09-15',time:'12:00',targets:['송미래'],targetExtra:'',ourTargets:'세종대왕 부장',content:'계약 체결 기념 오찬. 장기 기술 파트너십 방향 논의. 공동 마케팅 가능성 검토.',memo:'계약 기념 오찬.',next:null},
  {id:'v608',co:'네이버(주)',coId:'co6',tp:'💬 상담',dt:'2026-10-05',time:'15:00',targets:['송미래'],targetExtra:'홍두표 PM',ourTargets:'세종대왕 부장, 이순신 과장',content:'AI 솔루션 파트너십 확대 미팅. 신규 기능 공동 개발 로드맵 논의. 내년 계획 수립.',memo:'파트너십 확대 논의.',next:null},
  {id:'v609',co:'네이버(주)',coId:'co6',tp:'📄 견적',dt:'2026-10-18',time:'10:30',targets:['송미래'],targetExtra:'',ourTargets:'강감찬 대리',content:'2027년 공동 개발 2단계 견적 제출. 기능 확장 및 유지보수 포함 패키지 제안.',memo:'2단계 견적.',next:'2026-11-01'},
  {id:'v610',co:'네이버(주)',coId:'co6',tp:'🤝 인사',dt:'2026-10-28',time:'11:00',targets:['송미래'],targetExtra:'홍두표 PM',ourTargets:'세종대왕 부장',content:'연말 파트너십 성과 공유 미팅. 올해 공동 성과 리뷰. 내년 로드맵 방향 합의.',memo:'연말 성과 공유.',next:null},
];

/* ── _VISITS 전체에 isDummy 플래그 일괄 적용 ── */
_VISITS.forEach(v => { v.isDummy = true; });

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

  /* 공유 명함 캐시 — 모든 페이지에서 접근 */
  getDriveShared: ()=> JSON.parse(localStorage.getItem('crm_drive_shared')||'[]'),
  setDriveShared: d => localStorage.setItem('crm_drive_shared', JSON.stringify(d)),
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
    const eid  = await _fileId(name);
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

  async function _fileId(){
    const r = await _api(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name='${FILE_NAME}' and '${FOLDER_ID}' in parents and trashed=false`)}&fields=files(id)`);
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
    /* CRM_공용 → 앱으로 불러오기 */
    async load(){
      if(!GoogleAuth.isLoggedIn()) return [];
      try{
        const eid = await _fileId();
        if(!eid) return [];
        const r = await _api(`https://www.googleapis.com/drive/v3/files/${eid}?alt=media`);
        const data = await r.json();
        const arr = Array.isArray(data) ? data : [];
        DB.setDriveShared(arr); /* 모든 페이지에서 접근 가능하도록 캐시 */
        return arr;
      } catch(e){ console.error('SharedDriveDB.load', e); return []; }
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
