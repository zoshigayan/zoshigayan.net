---
title: "ripgrepを導入する"
slug: "install-ripgrep"
date: 2020-12-26T15:19:00+09:00
description: ""
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "shell"]
---

これは [ターミナル環境大掃除2021](/renew-terminal-env-2021) の4発目です。

## 動機

## 作業

この勢いに乗って、そのまま zplug で導入していく。

```
# ripgrep
zplug "BurntSushi/ripgrep", \
  from:gh-r, \
  as:command, \
  rename-to:rg
```

導入自体はこれで終わりなんだけど、ついでに fzf + ripgrep で爆速検索できるようにしてみる。これは [fzf の README](https://github.com/junegunn/fzf#3-interactive-ripgrep-integration) に載っているので、素直にやっていく。

```shell
# interactive ripgrep
fzgrep() {
  INITIAL_QUERY=""
  RG_PREFIX="rg --column --line-number --no-heading --color=always --smart-case "
  FZF_DEFAULT_COMMAND="$RG_PREFIX '$INITIAL_QUERY'" \
    fzf --bind "change:reload:$RG_PREFIX {q} || true" \
        --ansi --phony --query "$INITIAL_QUERY" \
        --preview 'cat `echo {} | cut -f 1 --delim ":"`'
}
```

基本的にコピペだけど、 `bat` はとりあえずいいやと思ったので `cat` で代用している。シンタックスハイライトが欲しくなったら考えよう。

Vim と連携していく。

```
" :grep で ripgrep つかうやつ
if executable("rg")
    let &grepprg = 'rg --vimgrep --hidden > /dev/null'
    set grepformat=%f:%l:%c:%m
endif
```

これで Vim 内部から `:grep [pattern]` で ripgrep を利用したファイル検索を行うことができるようになった。爆速である。ヤッピー

* ~~zplug を導入する~~
* ~~anyenv から asdf に乗り換える~~
* ~~peco から fzf に乗り換える~~
* ~~ripgrep を導入する~~
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
