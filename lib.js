// 共用：LIFF 初始化、呼叫後端（只送 ID token，角色與範圍一律由後端判斷）
const C = window.APP_CONFIG;
const $ = (id) => document.getElementById(id);
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
function say(text, type) { const m = $('msg'); m.hidden = false; m.innerHTML = text; m.className = 'msg' + (type ? ' ' + type : ''); }
function planned(item, phase) { return 'planned.html?item=' + encodeURIComponent(item) + '&phase=' + (phase || 1); }
async function api(action, data) {
  try {
    const res = await fetch(C.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action: action, idToken: liff.getIDToken() }, data || {})) });
    return await res.json();
  } catch (e) { return { ok: false, error: 'NETWORK' }; }
}
function startLiff(onReady) {
  liff.init({ liffId: C.LIFF_ID }).then(() => {
    if (!liff.isLoggedIn()) { liff.login({ redirectUri: location.href }); return; }
    const d = liff.getDecodedIDToken();
    if (!liff.isInClient() && (!d || d.exp * 1000 < Date.now() + 60000)) { liff.logout(); liff.login({ redirectUri: location.href }); return; }
    onReady();
  }).catch((e) => say('LIFF 初始化失敗：' + esc(e.message), 'err'));
}
const ERRTXT = { FORBIDDEN: '後端拒絕：您沒有這項權限。', AUTH_FAILED: '身分驗證逾時，請關閉頁面後從 LINE 重新開啟。', NETWORK: '連線失敗，請稍後再試。', SERVER_ERROR: '系統錯誤，請稍後再試。', CODE_INVALID: '展示碼無效。' };
const bindLink = () => '<a class="btn red" href="https://liff.line.me/' + esc(C.LIFF_ID) + '">前往會員綁定</a>';
