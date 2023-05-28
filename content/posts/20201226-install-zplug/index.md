---
title: "zplugを導入する"
slug: "install-zplug"
date: 2020-12-26T15:11:00+09:00
description: "「今更」って思ったら負けなんだなって"
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "shell"]
---

\[追記\]: しばらく使ってみた結果、WSL2環境だとプロンプト表示が異常に遅くなることが分かったので使うのをやめました。

これは [ターミナル環境大掃除2021](/renew-terminal-env-2021) の1発目です。

## 動機

* zsh の設定を Git 管理したい
  * 当たり前ですわな
  * ということで、プラグイン情報をコード管理できる必要がある
* インストールしたコマンド類も同様に管理したい
  * 後からインストールしたツールに依存した設定をしてしまうとマシン移行で詰むので
  * まあ設定は極力コードに残したいですねという話である

## 作業

やっていくぞ。

まず [zplug](https://github.com/zplug/zplug) を入れていく。

現時点での Requirements は以下のようになっているので、手元の環境を確認してみよう。

* zsh: version 4.3.9 or higher
* git: version 1.7 or higher
* awk: An AWK variant that's not mawk


```
( '_') < zsh --version
zsh 5.4.2 (x86_64-ubuntu-linux-gnu)

( '_') < git --version
git version 2.17.1

 ~
( '_') < awk --version
GNU Awk 4.1.4, API: 1.1 (GNU MPFR 4.0.1, GNU MP 6.1.2)
Copyright (C) 1989, 1991-2016 Free Software Foundation.

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see http://www.gnu.org/licenses/.
```

クリアしていそうな感じがある。awk ってデフォルトで入ってるんだね。

ということで、 **the best way** とされているインストールスクリプト実行による導入を敢行する。

```
( '_') < curl -sL --proto-redir -all,https https://raw.githubusercontent.com/zplug/installer/master/installer.zsh | zsh
 ✔  Checking if your zsh version is newer than 4.1.9 [SUCCEEDED]
 ✔  Installing zplug to /home/zoshigayan/.zplug [SUCCEEDED]
 All processes are successfully completed 🎉
 For more information, see http://zplug.sh 🌺
 Enjoy zplug!
```

いけたっぽい。上記のスクリプト実行によって `~/.zplug` ディレクトリ以下に zplug がインストールされたので、こやつを .zshrc から `source` で参照したのちにプラグインの情報を書いていく。最終的に以下のような感じでうまく動いた。

```diff
+ # plugins
+ source $HOME/.zplug/init.zsh

+ # RPROMPT (Git)
+ zplug "olivierverdier/zsh-git-prompt", use:zshrc.sh

+ # Install plugins if there are plugins that have not been installed
+ if ! zplug check --verbose; then
+     printf "Install? [y/N]: "
+     if read -q; then
+         echo; zplug install
+     fi
+ fi

+ # Then, source plugins and add commands to $PATH
+ zplug load --verbose

  # PROMPT
  NEWLINE=$'\n'
  PROMPT="${NEWLINE}%K{13} %F{0}%~%f %k${NEWLINE}%F{4}( '_') < %f"
- source $HOME/dotfiles/zsh/zsh-git-prompt/zshrc.sh
  RPROMPT='$(git_super_status)'
```

最初 `zplug "<user>/<repo>"` だけ指定しても動かなかったので焦ったけど、zplug はデフォルトで `*.zsh` という glob で source するファイルを検索するらしいので、zsh-git-prompt のように利用するファイル名が異なるものは `use` タグを使用して指定する必要があるとのこと。そして [zplug 自身も zplug で管理できる](https://github.com/zplug/zplug#let-zplug-manage-zplug) らしく、社用 PC への移植が楽になりそうな気がしたので設定しておいた。

zsh の plugin 管理ツールだと思ってたけど README 曰く GitHub Releases から各種コマンドの bin を取ってくることもできるらしく、何もかもをここで管理したい欲求に駆られるも一旦ステイする。ひとまずプラグインがそのまま commit されてる情弱 repo を脱却できたので、これでよしとしようではないか。

## 余談

「全部を zplug で管理すると重すぎて使い物にならなくなる」という話は聞いたことあるし、既になんとなくその片鱗は見え始めている。が、困ったときまで困りたくないので、困ったら困ることにして今は先に進む。[YAGNI](https://ja.wikipedia.org/wiki/YAGNI) の精神である。

* ~~zplug を導入する~~
* anyenv から asdf に乗り換える
* peco から fzf に乗り換える
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

## 続く

次回、[anyenvからasdfに乗り換える](/anyenv-to-asdf)！
