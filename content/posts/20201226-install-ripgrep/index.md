---
title: "ripgrepを導入する"
slug: "install-ripgrep"
date: 2020-12-26T15:19:00+09:00
description: "はじめてみる爆速検索"
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "shell"]
---

## 動機

* 速い
  * [README](https://github.com/BurntSushi/ripgrep/blob/a6d05475fb353c756e88f605fd5366a67943e591/README.md#quick-examples-comparing-tools) にも書いてあるけど、ベンチマーク見る限りエグいぐらい速い
  * 正直 grep にそこまで不満があるわけでもないが、そこまで言われると体感してみたい

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

{{< video src="fzgrep.mp4" >}}

爆速である。一切インデックスを使わずファイルを全文検索してこの速度がでるのか。すげー。

さっそく Vim と連携していく。init.vim に以下を追記した。

```
" :grep で ripgrep つかうやつ
if executable("rg")
    let &grepprg = 'rg --vimgrep --hidden > /dev/null'
    set grepformat=%f:%l:%c:%m
endif
```

これで Vim 内部から `:grep [pattern]` で ripgrep を利用したファイル検索を行うことができるようになる。

{{< video src="ripgrep-vim.mp4" >}}

爆速である。はやすぎワロタである。これで記憶力に頼ることなく気軽に全文検索をかけまくって作業ができるようになった。ヨシ！

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

## 続く

次回、 [ghqディレクトリを移動するキーバインドを設定する](/move-ghq-directories-keybind)！
