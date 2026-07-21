// Cloudflare Pages Function — 관리자 편집기 "저장" 엔드포인트
// POST /admin/api/save  { path, content, message? }
// → GitHub Contents API로 해당 파일을 커밋 → GitHub Actions가 자동배포
// 보안: /admin/* 은 Cloudflare Access로 보호되어 관리자만 도달. PAT는 환경변수(GH_TOKEN)로만.

const ALLOW = /^ko\/[A-Za-z0-9._\/-]+\.html$/; // ko/ 아래 .html 만 허용

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json().catch(() => null);
    if (!data || typeof data.path !== 'string' || typeof data.content !== 'string') {
      return json({ error: 'path·content가 필요합니다.' }, 400);
    }
    // 경로 정규화 + 화이트리스트
    const clean = data.path.replace(/^\/+/, '').replace(/\.\.+/g, '');
    if (!ALLOW.test(clean)) {
      return json({ error: '허용되지 않은 경로입니다: ' + clean }, 403);
    }
    const repo = env.GH_REPO, branch = env.GH_BRANCH || 'main', token = env.GH_TOKEN;
    if (!repo || !token) {
      return json({ error: '서버 설정 누락(GH_REPO/GH_TOKEN 환경변수).' }, 500);
    }
    const api = `https://api.github.com/repos/${repo}/contents/${clean}`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'yehowanissi-admin',
      'Content-Type': 'application/json',
    };
    // 기존 파일 sha 조회(있으면 업데이트, 없으면 신규)
    let sha;
    const cur = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers });
    if (cur.status === 200) { sha = (await cur.json()).sha; }
    // UTF-8 → base64
    const body = {
      message: (data.message || `admin: update ${clean}`),
      content: base64Utf8(data.content),
      branch,
    };
    if (sha) body.sha = sha;
    const put = await fetch(api, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!put.ok) {
      const t = await put.text();
      return json({ error: `GitHub 커밋 실패 (${put.status})`, detail: t.slice(0, 300) }, 502);
    }
    const pj = await put.json();
    return json({ ok: true, path: clean, commit: pj.commit && pj.commit.sha });
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function base64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
