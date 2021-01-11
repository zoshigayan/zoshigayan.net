---
title: "vim-plugを導入する"
slug: "install-vim-plug"
date: 2021-01-11T22:37:00+09:00
description: "ミニマリスト的プラグイン管理から始める、丁寧な暮らし"
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "NeoVim"]
---

これは [ターミナル環境大掃除2021](/renew-terminal-env-2021) の6発目です。

前回は [ghqディレクトリを移動するキーバインドを設定する](/move-ghq-directories-keybind) です。

ついに shell 編から Vim 編に突入！

## 動機

「Deinをやめる理由」と「vim-plugを入れる理由」がある。あくまで僕は乗り換えますというだけで、誰かにそうすることを推奨する気はない。

* プラグインの toml 管理があんまり合わなかった
  * プラグインの導入と関連する設定をまとめて書ける点はめっちゃよかった
  * 複数ファイルの行き来が意外と面倒だったので多少煩雑になってでも1ファイルにまとめたくなった
  * (toml 管理せずに Dein を使うこともできるので、これは別に Dein への不満というわけではないが)
* 今更 vim-plug の圧倒的な人気を目の当たりにした
  * 本稿執筆時点で star 数を比べると Dein は 2.9k、vim-plug は 21.9k
  * 正直あまりこだわりのない部分なので、長いものに巻かれておきたい

要するに Dein をやめるのは「高機能すぎるから」で、vim-plug を使うのは「なんか皆使ってるから」である。

## 作業

普通に [README](https://github.com/junegunn/vim-plug/blob/8b45742540f92ba902c97ad1d3d8862ba3305438/README.md) を読みながら導入していく。ちなみに Dein をやめる件についてはただ設定とディレクトリを消すだけなので特に解説しない。ただ vim-plug を入れる。

基本的な導入手順は以下の通りである。

1. プラグイン本体を autoload ディレクトリに入れる
1. init.vim (.vimrc) に設定を書く

が、ここで 1 の本体ダウンロード・配置を手作業でやってしまうとマシンを変えるたびに curl を叩かなければいけなくてつらいので、「vim-plug が導入されていないようならダウンロードして配置する」感じにしたい。これはドキュメント中 [Automatic Installation](https://github.com/junegunn/vim-plug/wiki/tips#automatic-installation) の項で解説されている。

```vim
" vim-plug なかったら落としてくる
if empty(glob('$HOME/.local/share/nvim/site/autoload/plug.vim'))
  silent !curl -fLo $HOME/.local/share/nvim/site/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
  autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

" 足りないプラグインがあれば :PlugInstall を実行
autocmd VimEnter * if len(filter(values(g:plugs), '!isdirectory(v:val.dir)'))
  \| PlugInstall --sync | source $MYVIMRC
\| endif
```

Vim であれば autoload ディレクトリとして `$HOME/.vim/autoload` を利用するが、自分は NeoVim なので `$HOME/.local/share/nvim/site/autoload` を用いている。[^1]

そして起動時にプラグインの一覧に対してディレクトリの存在チェックを実施し、存在しないもの (=導入されていないもの) を見つけて自動インストールする、というスクリプトも追加している。これで設定の可搬性は担保できた。

プラグインを入れていく。と言っても、基本的には今まで `dein.toml` と `dein_lazy.toml` に入れていたものを移し替えていくだけである。

```vim
call plug#begin('$HOME/.local/share/nvim/plugged')
Plug 'NLKNguyen/papercolor-theme'
Plug 'lambdalisue/fern.vim'
Plug 'tpope/vim-surround'
Plug 'dense-analysis/ale'
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'
Plug 'airblade/vim-gitgutter'
Plug 'tpope/vim-fugitive'
Plug 'easymotion/vim-easymotion'
Plug 'cespare/vim-toml', { 'for': 'toml' }
Plug 'peitalin/vim-jsx-typescript', { 'for': ['typescript', 'typescriptreact'] }
Plug 'HerringtonDarkholme/yats.vim', { 'for': ['typescript', 'typescriptreact'] }
Plug 'mhartington/nvim-typescript', { 'for': ['typescript', 'typescriptreact'] }
Plug 'pangloss/vim-javascript', { 'for': 'javascript' }
call plug#end()
```

なんか、もういいかなと思って Deoplete と Denite は抜いてしまったし、勢いで Defx も Fern に入れ替えてしまった。使っているプラグインは決して多くないけど、どれも非常に気に入っているのでいつか紹介できたらいいなと思う。[^2]

プラグインに関連する設定を書く位置は `call plug#end()` より後ならどこでもいい。ひとまず末尾に追加しておく。一例として ale はこんな感じの設定をしている。

```vim
" ale
let g:ale_fix_on_save = 1
let g:ale_sign_column_always = 1
let g:ale_linters = {
\  'typescript': ['eslint', 'tsserver', 'typecheck'],
\  'typescriptreact': ['eslint', 'tsserver', 'typecheck'],
\  'javascript': ['eslint', 'tsserver', 'typecheck'],
\  'python': ['pycodestyle'],
\  'ruby': ['rubocop'],
\ }
let g:ale_fixers = {
\   '*': ['remove_trailing_lines', 'trim_whitespace'],
\   'typescript': ['eslint'],
\   'typescriptreact': ['eslint'],
\   'javascript': ['eslint'],
\   'python': ['autopep8'],
\   'go': ['gofmt'],
\   'ruby': [],
\   }

nnoremap <silent> <Leader>ad :ALEDetail<CR>
nnoremap <silent> <Leader>ai :ALEInfo<CR>
```

そして NeoVim を再起動すると、勝手に何かが起きてすべてが完了する。

{{< video src="vim-plug.mp4" >}}

インストール中の画面があまりにも動かないので分かりづらいが、最初は真っ白で表示されていた tsx ファイルに対してプラグインのダウンロード・読み込みの完了と同時にシンタックスハイライトが有効化されていたり、下部のステータスバーが airline に置き換わったりしているのがわかる。Fern によるファイルツリー表示も利用できている。やったね。

## おまけ

ちなみに Fern はサイドバーをトグルさせるキーバインドを設定すべく以下の一行を追加するだけで完全に満足してしまい、個別に記事化するまでもなさそうなのでここに書いておく。

```vim
nnoremap <silent> <Leader>e :Fern . -drawer -width=40 -toggle<CR>
```

これで `Space E` を押すとサイドバーが出たり引っ込んだりする。[^3] バッファはデフォルトで再利用されるようで、フォルダの開閉状態は全て維持される。よい。

サイドバー内の操作は何もわからないが、とりあえず `?` を押すとヘルプが出るので大体理解できる。動作も軽快だし、ファイラーってこれでいいんだよな感がすごい。やっぱり「なんとなくサイドバー出したい」的な意識低い勢にとって Defx は too much だったということだろう。

これで一気に2つのタスクが完了した。満足満足。

* ~~zplug を導入する~~
* ~~anyenv から asdf に乗り換える~~
* ~~peco から fzf に乗り換える~~
* ~~ripgrep を導入する~~
* ~~`g` エイリアスに登録されている移動コマンドをキーバインド化する~~
* ~~Dein から vim-plug に乗り換える~~
* ~~Defx から fern に乗り換える~~
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

気が向いたら続く


[^1]: 厳密に言うと NeoVim は [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/) に則って各種パスを判別しており、参照されているのは `$XDG_DATA_DIRECTORY/nvim/site/autoload` なのだが、この `$XDG_DATA_DIRECTORY` の初期値 (未設定時のフォールバック値) が `$HOME/.local/share` なのである
[^2]: 「有名どころばっかりだし今さら紹介したって目新しいもん何もないだろ」と思われるかもしれないが、このあたりは正直「推してるアイドルについて語りたい」ぐらいの気持ちだし、そもそも僕は別に誰かの役に立つためだけにブログを書いているわけではない
[^3]: もともと [NERDTree](https://github.com/preservim/nerdtree) を `Ctrl E` で使っていて、Leader キーちゃんと使っていこう運動で `Space E` に変え、そこから Defx を経て Fern に至るまで同じキーバインドを使い続けている
