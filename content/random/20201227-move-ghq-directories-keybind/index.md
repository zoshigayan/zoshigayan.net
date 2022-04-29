---
title: "ghqディレクトリを移動するキーバインドを設定する"
slug: "move-ghq-directories-keybind"
date: 2020-12-27T15:19:00+09:00
description: "けっこう皆が使ってる感じのアレ"
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "shell"]
---

これは [ターミナル環境大掃除2021](/renew-terminal-env-2021) の5発目です。

前回は [ripgrepを導入する](/install-ripgrep) です。

## 動機

* ghq で管理しているディレクトリに移動するコマンド、ちゃんとしたい
  * 一番使うのに `g` 一文字でエイリアスを張るという絶妙な手抜き技だった
  * キャンセルしたときの挙動とかも含めて、ちゃんと…！

## 作業

```shell
move_ghq_directories() {
  selected=`ghq list | fzf`
  if [ ${#selected} -gt 0 ]
  then
    target_dir="`ghq root`/$selected"
    echo "cd $target_dir"
    cd $target_dir
    zle accept-line
  fi
}
zle -N move_ghq_directories
bindkey "^]" move_ghq_directories
```

{{< video src="move-ghq.mp4" >}}
(非常にわかりづらいが、一度 Ctrl + C で interrupt をかけている)

reverse した方が見やすそうとか、全画面乗っ取る必要ないんじゃないかとか、そもそも shell が下手すぎるとかは色々ありつつ、やりたいことは達成できた。元々のエイリアスを消してターンエンドである。

* ~~zplug を導入する~~
* ~~anyenv から asdf に乗り換える~~
* ~~peco から fzf に乗り換える~~
* ~~ripgrep を導入する~~
* ~~`g` エイリアスに登録されている移動コマンドをキーバインド化する~~
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

次回、[Dein から vim-plug に乗り換える](/install-vim-plug)！
