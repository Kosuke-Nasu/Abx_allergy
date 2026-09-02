# 抗菌薬アレルギー ベッドサイド・ツール

ESCMID 2026 ガイドライン（Joean O, et al. *Clin Microbiol Infect* 2026;32:767-787）を臨床現場で参照するための、1ファイル完結の静的サイトです。ビルド工程はありません。日本語／英語の切り替えに対応しています。

## 機能

| タブ | 内容 |
| --- | --- |
| 交差反応 | 被疑薬を選ぶと 24 薬剤をリスク別に色分け表示。投与したい薬を選ぶとペア判定と該当する推奨番号が出る（Table 3） |
| リスク評価 | Fig. 1 / Fig. 2 のフローを対話式に。超低・低・高リスクの判定と対応。PEN-FAST スコア計算 |
| 負荷試験 | 禁忌チェックリスト、単回／段階的投与プロトコル、観察タイマー（Table 4） |
| 重症度 | severe / nonsevere の判定基準（Table 2） |
| 推奨一覧 | 24 推奨の要約、強さとエビデンスの質、キーワード検索 |
| 記載例 | 問診・delabel 記載・負荷試験指示・患者説明のテンプレート |
| 資料 | 元ガイドラインと主要研究へのリンク |

## ファイル構成

```
index.html                     アプリ本体（HTML / CSS / JS を内包）
manifest.json                  ホーム画面に追加したときの名前・アイコン設定
sw.js                          Service Worker。オフラインで開けるようにする
icons/
  apple-touch-icon.png         180px, iOS 用
  icon-192.png                 Android / デスクトップ用
  icon-512.png                 Android / ストア表示用
  icon-maskable-512.png        丸や角丸に切り抜かれても欠けない余白付き
  favicon-32.png               ブラウザのタブ用
  icon.svg                     アイコンの元データ（色や線の太さを直すとき用）
```

## 公開のしかた（Cloudflare Pages）

1. このリポジトリを GitHub に push する
2. Cloudflare Pages で **Create a project → Connect to Git** から、このリポジトリを選ぶ
3. ビルド設定は次のとおり
   - Framework preset: **None**
   - Build command: **空欄のまま**
   - Build output directory: **`/`**（リポジトリ直下に index.html があるため）
4. **Save and Deploy** を押す

以降は GitHub に push するたびに自動で再デプロイされます。

## ホーム画面への追加

**iPhone** — Safari でサイトを開く → 画面下の共有ボタン → 「ホーム画面に追加」。Chrome からは追加できないので Safari を使ってください。

**Android** — Chrome でサイトを開く → 右上のメニュー → 「ホーム画面に追加」。

一度開けば、以降は電波がない場所でも起動します（Service Worker が https 配信のときだけ有効になるため、ローカルのファイルを直接開いた場合は働きません）。

## 更新したとき

キャッシュが効いているため、`index.html` を更新しても古い画面が出ることがあります。`sw.js` の 1 行目

```js
const CACHE = "abx-allergy-v3";
```

の数字を `v4`、`v5` と変えてから push すると、次回アクセス時に確実に入れ替わります。

## 出典と注意

交差反応表は ESCMID 2026 の Table 3（原典は SWAB 2023 ガイドライン）に基づきます。元ガイドラインは CC BY 4.0 で公開されています。

推奨は要約であり原文そのものではありません。判断の根拠として使う際は必ず原著を確認してください。国内の薬剤事情・添付文書とは一致しない部分があります。個々の患者の診療判断の責任は使用者にあります。

- ESCMID 2026: https://doi.org/10.1016/j.cmi.2026.02.011
- SWAB 2023: https://doi.org/10.1016/j.cmi.2023.04.008
- BSACI 2022: https://doi.org/10.1111/cea.14217
