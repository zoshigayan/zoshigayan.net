---
title: "pecoからfzfに乗り換える"
slug: "peco-to-fzf"
date: 2020-12-26T15:18:57+09:00
description: ""
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "shell"]
---

これは [ターミナル環境大掃除2021](/renew-terminal-env-2021) の3発目です。

## 動機

## 作業

やっていくぞ。

[fzf](https://github.com/junegunn/fzf) のリポジトリを見ると、GitHub Releases で実行ファイルが配布されている。つまり zplug チャンスである。

.zshrc に以下を追記する。

```
# fzf
zplug "junegunn/fzf", \
  from:gh-r, \
  as:command, \
  rename-to:fzf
```

シェルを再起動する。

```
( '_') < which fzf
/home/zoshigayan/.zplug/bin/fzf
```

入った。zplug すごい。

ということで、早速 ghq 管理下のディレクトリに移動するエイリアスを置き換えてみる。

```diff
- alias g='cd $(ghq root)/$(ghq list | peco)'
+ alias g='cd $(ghq root)/$(ghq list | fzf --reverse)'
```

動いた。fzf すごい。

vim や ripgrep との連携は後でやることになっているので、とりあえず history 検索を実装してみた。

```shell
incremental_search_history() {
  selected=`history -E 1 | fzf | cut -b 26-`
  BUFFER=`[ ${#selected} -gt 0 ] && echo $selected || echo $BUFFER`
  CURSOR=${#BUFFER}
  zle redisplay
}
zle -N incremental_search_history
bindkey "^R" incremental_search_history
```

これで `ctrl` + `r` で history に対して fzf によるファジー検索をして、選択した履歴をバッファに呼び出す…というのができるようになった。便利！

peco をアンインストールしてターンエンドである。

* ~~zplug を導入する~~
* ~~anyenv から asdf に乗り換える~~
* ~~peco から fzf に乗り換える~~
* ripgrep を導入する
* `g` エイリアスに登録されている移動コマンドをキーバインド化する
* Dein から vim-plug に乗り換える
* Defx から fern に乗り換える
* ソースコード全文検索を ripgrep でできるようにする
* ファイル名指定移動を Denite から fzf に移行する
* Denite を消す
* nvim-typescript 突然死の真相を探る
* Rails 開発を便利にする何かを眺める
* Tmux の設定を見直す
* Zsh 初期設定を理解する
* GitHub CLI を導入する
* 補完について思いを馳せる
