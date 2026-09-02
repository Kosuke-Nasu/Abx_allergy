/* バージョンを変えると、次回アクセス時に中身が入れ替わります */
const CACHE = "abx-allergy-v3";

/* ナビゲーション（アプリを開く操作）で返す本体 */
const SHELL = "./";

const FILES = [
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

/* キャッシュ内で本体を指す鍵。ナビゲーション要求の URL とは無関係に固定する */
const SHELL_KEY = "./__shell__";

/* 取得済みレスポンスを素通しせず、本文だけを取り出して新品の Response を作る。
   合成した Response は URL リストが空で redirected も false になるため、
   iOS が「リダイレクトを含む」と判断して起動を拒否することがなくなる。
   ヘッダも Content-Type だけに絞る。元の content-encoding / content-length は
   圧縮後のバイト列を指しており、本文が展開済みの状態では食い違うため。 */
function shellResponse(html){
  return new Response(html, {
    status: 200,
    statusText: "OK",
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

const OFFLINE =
  "<!doctype html><meta charset=utf-8><p>オフラインです。電波の届くところで一度開き直してください。";

/* 本体を取ってきて、合成レスポンスとしてキャッシュに入れ、それを返す */
function fetchShell(){
  return fetch(SHELL, { cache: "no-cache", redirect: "follow" })
    .then(res => {
      if(!res.ok) throw new Error("bad status " + res.status);
      return res.text();
    })
    .then(html => {
      caches.open(CACHE).then(c => c.put(SHELL_KEY, shellResponse(html)));
      return shellResponse(html);
    });
}

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      /* 1 つでも取れないファイルがあると addAll は全体が失敗するので、個別に入れる */
      .then(c => Promise.all(FILES.map(f =>
        fetch(f, { cache: "reload" })
          .then(res => (res.ok && !res.redirected ? c.put(f, res) : null))
          .catch(() => null)
      )))
      .then(() => fetchShell())
      .catch(() => null)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;

  /* アプリを開くとき。キャッシュがあれば即返して裏で更新、なければネットワークを待つ。
     どの経路でも返すのは合成レスポンスだけで、取得したものは素通ししない。 */
  if(req.mode === "navigate"){
    /* イベントがまだ有効なうちに同期で開始しておく */
    const fresh = fetchShell().catch(() => null);
    e.waitUntil(fresh);
    e.respondWith(
      caches.match(SHELL_KEY, { cacheName: CACHE }).then(hit =>
        hit ? hit.text().then(shellResponse)
            : fresh.then(res => res || shellResponse(OFFLINE))
      )
    );
    return;
  }

  /* それ以外（画像など）。まずキャッシュを返して即表示し、裏で新しいものを取りに行く */
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if(res && res.ok && res.type === "basic" && !res.redirected){
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
