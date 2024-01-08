# Highlight Selection

HTMLタグを超えて、選択範囲をキーワードとしてハイライトするブックマークレット及び拡張機能です。

## 機能

- 選択範囲をキーワードとして複数の出現箇所をハイライトします。その際、HTMLタグを超えて選択範囲を選択できます。
- ハイライトのマウスホバーで現れる×アイコンをクリックすることでハイライトを削除できます。
- 30種類以上のハイライトを使用できます。
- ハイライトしたキーワードの出現数や前後の数（↑前の数↓後の数）をキーワードのポップアップで表示します。

## ブックマークレット版と拡張機能版の違い

ブックマークレット版は、拡張機能が動作しないChromeウェブストア上でも動作します。

拡張機能版は、選択範囲がフレーム内であっても動作します。

## インストール方法
### Google Chrome
ブックマークレット版は、ブックマークのURL欄に[JavaScript](https://raw.githubusercontent.com/querykuma/HighlightSelection/main/highlight_selection_bookmark_min.js)の中身を貼り付けてください。

拡張機能版は、「その他のツール」から「拡張機能」(chrome://extensions/)を開き、デベロッパーモードにして、「パッケージ化されていない拡張機能を読み込む」を押して、フォルダーを選択してください。

### Firefox
ブックマークレット版は、ブックマークのURL欄に[JavaScript](https://raw.githubusercontent.com/querykuma/HighlightSelection/main/highlight_selection_bookmark_min.js)の中身を貼り付けてください。Firefoxではサイズ制限に引っかかるので、webpackなどでサイズ縮小する必要がありました。

拡張機能版は、次のようにしてください。

1. manifest.jsonの中身をmanifest_firefox.jsonで置き換える。
1. アドオンマネージャー(about:addons)で「アドオンをデバッグ」を選ぶ。
1. 「一時的なアドオンを読み込む」でmanifest.jsonを選ぶ。


## 使い方

ブックマークレット版は、選択範囲を選択してからブックマークレットを開くことで起動します。

拡張機能版は、選択範囲を右クリックしてから「選択範囲のキーワードをハイライト」（ショートカットキーのH）を選ぶことで起動します。

## 動作環境

- Google Chrome
- Firefox


