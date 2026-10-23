# MOVIE SHELF — 映画管理アプリ

Vite + React + TypeScript + Tailwind CSS + MUI。既存の依存バージョン、vite.config.ts の base `/mui-practice/`、GitHub Actions Pages workflow は維持しています。

## 起動

Node.js 24 を使用してください。既存プロジェクトのフォルダーで実行します。

```powershell
npm ci
npm run dev
```

表示されたURLの `/mui-practice/` を開きます。既に別サーバーが動いている場合は表示されたポート番号を使ってください。

## 機能

- 映画の登録・一覧・編集・削除（削除前に確認）
- タイトル・監督・メモの検索（全角英数字・大文字小文字を正規化）
- 観たい／視聴中／鑑賞済み、ジャンル、お気に入りの複合絞り込み
- 登録順・タイトル順・評価順・公開年順
- 0.5刻みの5段階評価、メモ、お気に入り
- 件数・鑑賞率・評価済み作品の平均評価、6件ごとのページ切り替え
- 初回サンプル6作品、登録時の入力検証、レスポンシブ表示
- localStorage 保存。空の一覧も維持。保存失敗時は警告を表示
- 保存データが不正な場合は自動上書きを停止。「保存を再試行」で現在の一覧を保存します

保存キーは `movie-shelf:v1`。保存はブラウザー・接続先ごとです。localhost、127.0.0.1、異なるポート、GitHub Pages のデータは共有されません。ブラウザーデータの削除で記録も消えます。

## 検証

```powershell
npm test
npm run lint
npm run build
npm run preview
```

自動テスト7件（保存内容の復元・空データ・破損データ保護・検索・複合絞り込み・並べ替え・入力値検証）、TypeScript＋本番ビルド、lint が成功。
ブラウザーでは登録→評価・お気に入り→検索→再読み込み→編集→削除→件数復元を確認済み。レイアウトの目視確認済み。スマートフォン幅の実ブラウザー操作は未確認。
ビルド時に約603KBのJavaScriptチャンクサイズ警告がありますがビルドは成功しています。

手動確認：7本目を追加してページ切り替え、ジャンル＋視聴状況の絞り込み、空タイトル・範囲外公開年の保存拒否、390px幅でフォームとカードの操作を確認してください。

## GitHub Pages 公開

1. GitHubリポジトリの Settings → Pages → Build and deployment → Source を **GitHub Actions** に設定。
2. 変更を確認し、コミットして main ブランチへpush。
3. Actions の **Deploy Vite to GitHub Pages** が成功するのを確認。
4. deployジョブの公開URLを開く（通常 `https://<GitHubユーザー名>.github.io/mui-practice/`）。

既存workflowはmainへのpush、またはActions画面のRun workflowで実行できます。既存workflowとbase設定は変更していません。こちらではpush・公開は行っていません。

公式手順：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 使用MUIコンポーネント（20種類以上）

AppBar、Toolbar、Avatar、Typography、Chip、Container、Box、Stack、Button、Paper、LinearProgress、Tabs、Tab、Divider、TextField、InputAdornment、FormControl、InputLabel、Select、MenuItem、FormControlLabel、Switch、Card、CardContent、CardActions、Tooltip、IconButton、Rating、Pagination、Dialog、DialogTitle、DialogContent、DialogContentText、DialogActions、Autocomplete、Snackbar、Alert、ThemeProvider、CssBaseline。

## ファイル

- src/App.tsx：画面・登録編集フォーム・削除確認・保存
- src/movies.ts：型・サンプル・保存データ検証・検索と並べ替え
- src/App.css / src/index.css：レイアウト・Tailwind
- tests/movies.test.ts：データ処理テスト
- index.html：日本語とタイトル

元プロジェクトにあった未コミット変更も含め、反映前の変更対象ファイルを同梱の original-backup に保存しています。
