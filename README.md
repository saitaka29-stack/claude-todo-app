# claude-todo-app

HTML / CSS / JavaScript だけで動くシンプルな ToDo アプリです。ビルドやインストールは不要です。

## 機能

- タスクの追加（入力して Enter）
- 完了・未完了の切り替え（チェックボックス）
- タスクの編集（テキストをダブルクリック、Enter で確定・Esc で取り消し）
- タスクの削除（✕ ボタン）
- 「すべて / 未完了 / 完了」の表示切り替え
- 完了済みタスクの一括削除
- ブラウザの localStorage に保存（再読み込みしても残ります）
- ダークモード対応

## 使い方

`index.html` をブラウザで開くだけで使えます。

GitHub Pages で公開する場合は、リポジトリの **Settings → Pages** で
Branch を `main`、フォルダを `/ (root)` に設定してください。

## ファイル構成

```
index.html   画面の構造
style.css    見た目
app.js       動作（追加・完了・編集・削除・保存）
```
