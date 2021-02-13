---
title: "fzfとripgrepをvim連携させて優勝する"
slug: "ripgrep-and-fzf-with-vim"
date: 2021-02-13T15:32:41+09:00
description: "VimでVSCodeのアレがしたい人生だった。"
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "NeoVim"]
---

これは [ターミナル環境大掃除2021](/renew-terminal-env-2021) の7発目です。

前回は [vim-plugを導入する](/install-vim-plug) です。

## 動機

まず何を実現したいかと言うと、以下の2つである。率直に言うと「VSCodeのアレ」をやりたいのだ。[^1]

1. [CtrlP](https://github.com/kien/ctrlp.vim)的な、大雑把なファイル名検索
2. インクリメンタルなソースコード全文検索

1 は要するにfuzzy finderで、言うなれば「今開いているディレクトリ (プロジェクト？) の中からfuzzy matchでいい感じに目的のファイルを呼び出す」機能である。最初はどばーっと全てのファイルが表示されており、一文字ずつ検索クエリを入力することによってリアルタイムに候補が絞り込まれていく。候補をひとつに絞れなくても、ファイル名で「これだ」と分かれば直接そのファイルを指定してバッファに呼び出せる。今までは[Denite](https://github.com/Shougo/denite.nvim)を利用して実現していたのだが、このためだけに入れているのが心苦しくなったので再実装を試みる次第である。

2 はもう文字通りとしか言いようがないが、つまりそういうことで、「検索→検索中です→候補表示」というモードに入ることなく検索クエリの入力と該当する候補の表示を往復したいのだ。しばらく使ってないので記憶が曖昧だけど、VSCodeのソースコード検索って確かそういう感じだった気がする。これは以前[ripgrepを導入する](/install-ripgrep)でコマンドとして実装しているので、それをvim内部から利用できるようにすればよい。

そして、何故これらの機能を実装するのに[fzf](https://github.com/junegunn/fzf)を使うかというと、「使えるから」である。

fzf自体は[pecoからfzfに乗り換える](/peco-to-fzf)で導入を終えているが、実はこれ、単一リポジトリの中にコマンドとしての実行ファイルと、その機能を[vimから呼び出すためのvim plugin](https://github.com/junegunn/fzf/blob/32c493e994288f63c2ceec1dbeaadc5de7399552/plugin/fzf.vim)が含まれているのだ。つまり、今コマンドとして利用している機能はだいたいvimから使えるし、なんならvim連携しないと損をしているとさえ言える。[^2]

ということで、現状シェル上で直接動かしているripgrepとfzfを使ったあれこれをvim上で実現していく回である。

## 作業

僕はコマンド類のインストールをzplug経由で行っている。fzfも例外ではないわけだが、この方法を少し変える必要がある。

GitHub Release経由でインストールしているとvim pluginがダウンロードされないので、リポジトリごと落として個別にパスを通す方式にしなければならない。 `.zshrc` を以下のように変更する。

```diff
 # fzf
 zplug "junegunn/fzf", \
-  from:gh-r, \
+  from:github, \
   as:command, \
-  rename-to:fzf
+  rename-to:fzf, \
+  use:bin/fzf, \
+  hook-build:". $ZPLUG_HOME/repos/junegunn/fzf/install --bin"
```

これでシェルを再起動し、今まで通りfzfが使えることを確認する。挙動は変わらないが、今までは `$ZPLUG_HOME/bin` に実行ファイルだけが格納されていたのに対し `$ZPLUG_HOME/repos/` 以下にリポジトリがクローンされている。

次に、fzfをvim pluginとしてvimに読み込ませる。 `init.vim` に以下を追加する。

```vim
Plug '~/.zplug/repos/junegunn/fzf'
Plug 'junegunn/fzf.vim'
```

1行目ではzplugによってインストールされたfzfを読み込ませている。普通に `'junegunn/fzf'` でGitHubリポジトリを指定することもできるが、なんとなく同じリポジトリが違うところに2つクローンされるのが気持ち悪い (バージョン差異とか出そう) のでこういう指定をしている。

2行目には[fzf.vim](https://github.com/junegunn/fzf.vim)という別途用意されているvim pluginを追加している。「いやいや『vim pluginはfzfの実行ファイルと同一リポジトリで提供されている』って言ってたじゃん、嘘つきじゃん」という話になりそうだが、これはfzf自体の動作に必須なものではなくて、コマンドの呼び出しをラップすることで設定を簡易化してくれるユーティリティスクリプトである。本プラグインの導入によって `:Files` といったコマンドを用いたfzfの利用がzero configで行えるのだ。便利！

ripgrepをfzfと連携させてソースコード全文にインクリメンタルサーチをかけるのが気持ち良すぎたので、[fzf.vimのREADME](https://github.com/junegunn/fzf.vim/blob/36de5db9f0af1fb2e788f890d7f28f1f8239bd4b/README.md#example-advanced-ripgrep-integration) を参考にして実装する。

```vim
set runtimepath+=~/.zplug/bin/fzf

function! FZGrep(query, fullscreen)
  let command_fmt = 'rg --column --line-number --no-heading --color=always --smart-case -- %s || true'
  let initial_command = printf(command_fmt, shellescape(a:query))
  let reload_command = printf(command_fmt, '{q}')
  let spec = {'options': ['--phony', '--query', a:query, '--bind', 'change:reload:'.reload_command]}
  call fzf#vim#grep(initial_command, 1, fzf#vim#with_preview(spec), a:fullscreen)
endfunction

command! -nargs=* -bang RG call FZGrep(<q-args>, <bang>0)
```

この設定によって `:RG` コマンドで爆速全文検索ができるようになった。が、いちいちコマンド打つのもアレなのでキーバインドを設定する。

```vim
nnoremap <silent> <Leader>,p :GFiles<CR>
nnoremap <silent> <Leader>,P :Files<CR>
nnoremap <silent> <Leader>,s :RG<CR>
nnoremap <silent> <Leader>,c :Commits<CR>
```

(余談だけどキーバインドの設定については割と[spacemacs](https://www.spacemacs.org/)の影響を受けていて、このあたりはもうちょっと整理できたら書きたいと思う)

これで全ての設定が完了した。

`Space , p` でfuzzy finderが使える。zero configである。

{{< video src="fuzzy-match.mp4" >}}

このコマンドが呼び出す `:GFiles` はGit管理されているファイルのみを対象とする (= `.gitignore` を参照する) が、百年に一度ぐらい `node_modules` の中身を含めて全部検索したいというタイミングがあるので、それに備えて `:Files` にもキーバインドを設定している。

次に、 `Space , s` で全文検索が呼び出せる。やってみる。

{{< video src="whole-text-search.mp4" >}}

やったぜーーー。

実は色々あって [^3] 導入してからそれなりに日が経った状態でこれを書いているのだけど、検索まわりのパフォーマンスは業務の効率に直結していることが実感できた。心なしか働くことが楽しくなった気がする。ありがとうfzf。ありがとうripgrep。

ちなみに右側のプレビューウィンドウにシンタックスハイライトが効いているが、これはいつぞや見送った [bat](https://github.com/sharkdp/bat) をどさくさに紛れて導入したことによる。便利。

やっぱりエディタをカイゼンするのは楽しい。引き続きやっていきたい。

* ~~zplug を導入する~~
* ~~anyenv から asdf に乗り換える~~
* ~~peco から fzf に乗り換える~~
* ~~ripgrep を導入する~~
* ~~`g` エイリアスに登録されている移動コマンドをキーバインド化する~~
* ~~Dein から vim-plug に乗り換える~~
* ~~Defx から fern に乗り換える~~
* ~~ソースコード全文検索を ripgrep でできるようにする~~
* ~~ファイル名指定移動を Denite から fzf に移行する~~
* ~~Denite を消す~~
* nvim-typescript 突然死の真相を探る
* Rails 開発を便利にする何かを眺める
* Tmux の設定を見直す
* Zsh 初期設定を理解する
* GitHub CLI を導入する
* 補完について思いを馳せる

## 続く

気が向いたら続く

[^1]: 「大人しくVSCode使えよ」という話のようではあるが、世の中はそう簡単ではない。
[^2]: 「せっかくドリンクバー頼んだのに1杯しか飲まないのはもったいない」みたいな話なので、別にそう感じない人もいるよな、とは思う。
[^3]: 遅ればせながらデッドデッドデーモンズデデデデデストラクション第10巻を買い、記憶を取り戻すべく初めから読み返して精神が死んでいた。
