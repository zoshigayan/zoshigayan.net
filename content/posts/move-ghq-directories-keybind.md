---
title: "ghqディレクトリを移動するキーバインドを設定する"
date: 2021-01-10T15:19:00+09:00
description: ""
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "shell"]
---

これは [ターミナル環境大掃除2021]({{< ref "posts/terminals-renew-2021" >}}) の5発目です。

## 動機

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

他にも色々やりようはありそうだけど、やりたいことは達成できた。エイリアスを消してターンエンドである。
