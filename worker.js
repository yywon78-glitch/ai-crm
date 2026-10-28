/* ══════════════════════════════════════════════
   CRM Worker — Cloudflare Workers
   ① Google OAuth (Refresh Token 영구 보관)
   ② Anthropic API 프록시
══════════════════════════════════════════════ */

const APP_URL    = 'https://yywon78-glitch.github.io/ai-crm/';
const APP_ORIGIN = 'https://yywon78-glitch.github.io';

const CORS = {
  'Access-Control-Allow-Origin':  APP_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, anthropic-workspace-id',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    const url  = new URL(request.url);
    const path = url.pathname;

    /* ── CORS 프리플라이트 ── */
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    /* ══════════════════════════════════════════
       ① Google OAuth 라우트
    ══════════════════════════════════════════ */

    /* 로그인 시작 — Google OAuth 페이지로 리다이렉트 */
    if (path === '/auth/start') {
      const state = crypto.randomUUID();
      await env.CRM_TOKENS.put('oauth_state', state, { expirationTtl: 300 });

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id',     env.GOOGLE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri',  `${url.origin}/auth/callback`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope',         'https://www.googleapis.com/auth/drive email');
      authUrl.searchParams.set('access_type',   'offline');
      authUrl.searchParams.set('prompt',        'consent'); /* refresh_token 반드시 받기 */
      authUrl.searchParams.set('state',         state);

      return Response.redirect(authUrl.toString(), 302);
    }

    /* 콜백 — code → refresh_token 교환 후 앱으로 리다이렉트 */
    if (path === '/auth/callback') {
      const code  = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const saved = await env.CRM_TOKENS.get('oauth_state');

      if (!code || !state || state !== saved) {
        return Response.redirect(`${APP_URL}?drive_auth=error`, 302);
      }

      /* code → access_token + refresh_token */
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({
          code,
          client_id:     env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri:  `${url.origin}/auth/callback`,
          grant_type:    'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();

      if (tokens.error || !tokens.refresh_token) {
        const reason = encodeURIComponent(tokens.error || 'no_refresh_token');
        return Response.redirect(`${APP_URL}?drive_auth=error&reason=${reason}`, 302);
      }

      /* KV 저장 */
      await env.CRM_TOKENS.put('refresh_token', tokens.refresh_token);

      /* 사용자 이메일 저장 */
      try {
        const uRes  = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const uData = await uRes.json();
        if (uData.email) await env.CRM_TOKENS.put('user_email', uData.email);
      } catch (_) {}

      /* 액세스 토큰 캐시 (만료까지 유효) */
      const email = (await env.CRM_TOKENS.get('user_email')) || '';
      await env.CRM_TOKENS.put('access_token', JSON.stringify({
        token:  tokens.access_token,
        expiry: Date.now() + tokens.expires_in * 1000,
        email,
      }), { expirationTtl: 3700 });

      return Response.redirect(`${APP_URL}?drive_auth=success`, 302);
    }

    /* 토큰 반환 — 캐시 우선, 만료 시 refresh_token으로 갱신 */
    if (path === '/auth/token') {
      /* 캐시 확인 */
      const cached = await env.CRM_TOKENS.get('access_token');
      if (cached) {
        const t = JSON.parse(cached);
        if (t.expiry > Date.now() + 60_000) {
          return json(t);
        }
      }

      /* refresh_token으로 갱신 */
      const rt = await env.CRM_TOKENS.get('refresh_token');
      if (!rt) return json({ error: 'not_logged_in' }, 401);

      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({
          refresh_token: rt,
          client_id:     env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          grant_type:    'refresh_token',
        }),
      });
      const data = await refreshRes.json();

      if (data.error) {
        /* refresh_token 만료 → KV 정리 후 재로그인 유도 */
        await env.CRM_TOKENS.delete('refresh_token');
        await env.CRM_TOKENS.delete('access_token');
        return json({ error: 'token_expired', message: '재로그인 필요' }, 401);
      }

      const email = (await env.CRM_TOKENS.get('user_email')) || '';
      const result = {
        token:  data.access_token,
        expiry: Date.now() + data.expires_in * 1000,
        email,
      };
      await env.CRM_TOKENS.put('access_token', JSON.stringify(result), { expirationTtl: 3700 });

      return json(result);
    }

    /* 로그인 상태 확인 */
    if (path === '/auth/status') {
      const rt    = await env.CRM_TOKENS.get('refresh_token');
      const email = (await env.CRM_TOKENS.get('user_email')) || '';
      return json({ logged_in: !!rt, email });
    }

    /* 로그아웃 — KV 전체 삭제 */
    if (path === '/auth/logout' && request.method === 'POST') {
      await Promise.all([
        env.CRM_TOKENS.delete('refresh_token'),
        env.CRM_TOKENS.delete('access_token'),
        env.CRM_TOKENS.delete('user_email'),
        env.CRM_TOKENS.delete('oauth_state'),
      ]);
      return json({ ok: true });
    }

    /* ══════════════════════════════════════════
       ② Anthropic API 프록시 (기존 유지)
    ══════════════════════════════════════════ */
    if (request.method === 'POST') {
      const body   = await request.text();
      const apiKey = request.headers.get('x-api-key');

      if (!apiKey) {
        return json({ error: { message: 'API 키 없음' } }, 400);
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:  'POST',
        headers: {
          'Content-Type':       'application/json',
          'x-api-key':          apiKey,
          'anthropic-version':  '2023-06-01',
          'anthropic-workspace-id': 'wrkspc_01Pdf2hnBKy4HbTJCfTcdq9W',
        },
        body,
      });

      const text = await res.text();
      return new Response(text, {
        status:  res.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404, headers: CORS });
  },
};
