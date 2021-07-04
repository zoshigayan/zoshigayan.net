---
title: "fugitive.vimでソースコードのGitHubリンクを取得する"
slug: "github-link-with-fugitive"
date: 2021-07-04T16:51:44+09:00
description: "Vimからソースコードのリンクをシュッと取得してメンバーにパッと共有して好感度がグッと"
draft: false
tags: ["NeoVim", "作業メモ"]
---

## 動機

業務の中でソースコードの中の特定部分をGitHubリンクで共有する機会は多い。[こういうやつ](https://github.com/zoshigayan/zoshigayan.net/blob/master/content/posts/20210704-source-code-link-with-fugitive/index.md) のことである。

今まではVim上でコードベースをあれこれ眺めて目当てのコードを探し当てたあと、改めてGitHubを開いてぽちぽち移動して該当ファイルまで辿り着き、行数を頼りにスクロールしたりブラウザのページ内検索を駆使したりしてリンクを取得していた。一人で作業しながらSlackにコード片を貼るような場面なら全然それでよかったのだけど、MTG中に「あのメソッドの実装どうなってましたっけ」みたいな話になった時にシュッとリンクを出せなくてアタフタしちゃうのがつらい。

RubyMineを使っている同僚がエディタ上から即座にGitHubの該当箇所をブラウザで開いているのを見てカッコいい～と感じつつ、Vimでもできそうな気がしたので、やっていく。[^1]

## 導入

まずは [fugitive.vim](https://github.com/tpope/vim-fugitive) を導入する。特に依存関係や初期設定はいらないので、何かしらの方法で入ればそれでよい。ちなみに僕は昔「テキストエディタ上でGit操作をする」ということに馴染めなくてVisual Studio Code使ってた時期もGit操作はCLI派だったのだけど、数年前にfugitiveを入れてみたらスッと馴染んで今はもうVim上でなんでもかんでもやるようになってしまった。好き。

さて、今回の目的に沿うAPIはないかとDocを眺めていると `:GBrowse` というコマンドが見つかった。[実際の記述](https://github.com/tpope/vim-fugitive/blob/8e0a8abf08318f91f63da510087b3110f20e58bf/doc/fugitive.txt#L212-L235) は引数の説明とか色々あるのでもうちょっと長いけど、一旦コマンド自体の説明はこんな感じである。

```
:GBrowse                Open the current file, blob, tree, commit, or tag
                        in your browser at the upstream hosting provider.
                        If a range is given, it is appropriately appended to
                        the URL as an anchor.

                        Upstream providers can be added by installing an
                        appropriate Vim plugin.  For example, GitHub can be
                        supported by installing rhubarb.vim, available at
                        <https://github.com/tpope/vim-rhubarb>.
```

3行ぐらいで雑に翻訳すると以下のようになる:

* いま開いているファイル、blob、コミット等をブラウザからホスティングサービス上で開くわ
* 行範囲が指定されたら、ちゃんとURLにアンカーとして付与しておくわ
* ホスティングサービスごとの対応はプラグインとして追加できるのよ

これじゃん。ということで叩いてみるとエラーが出て使えない。拾い読みすると「Upstream providers **can** be added」となっているので追加は任意かと思っていたが、後に続く記述に「GitHub can be supported by installing...」とある通り何かを導入しないと動かないようである。ということで、fugitive作者のtpope氏が提供しているGitHub用handlerの [rhubarb.vim](https://github.com/tpope/vim-rhubarb) を導入していく。

まずはプラグインを追加する。僕はvim-plugを使っているので以下のような感じになる。

```vim
...
Plug 'tpope/vim-fugitive'
Plug 'tpope/vim-rhubarb'    " ← 追加
...
```

次にGitHub APIの個人アクセストークンを取得する。GitHubの[New personal access token](https://github.com/settings/tokens/new)ページで「repo」だけにチェックを付ける。tokenはあんまり用途をまたいで利用したくないので、名前 (note) は「fugitive」にしておいた。「Generate token」を押すと完了画面に飛ぶが、このページを離れると二度とtokenは閲覧できなくなるので即座にメモしておく。

上記でメモった内容を使って以下のように `~/.netrc` に設定を追記する。rhuharbが内部的にcURLを実行している都合なんだろうけど、平文のアクセストークンを `.vimrc` に書かなくていい設計は助かる～

```shell
echo 'machine api.github.com login <GitHubのユーザー名> <GitHubのログインパスワード> <さっき取得したtoken>' >> ~/.netrc
```

これで設定は終わりである。

さっそく任意のGitプロジェクトで適当なファイルを開き、 `:GBrowse!` コマンドを実行するとGitHub上のURLがクリップボードにコピーされる。Visualモードで実行すれば選択行をハイライトした状態のリンクも取得できる。[^2]

## やったか…！？

まだだ、まだ終わってない！！

社内のプロジェクトをはじめ、割と僕の環境はオリジナルのリポジトリ (upstream) とforkしたもの (origin) を両方参照していることが多く、共有するときにはupstreamのリンクを使いたい。つまり参照するリモートリポジトリを指定できなければ困る。毎回 `https://github.com/zoshigayan/...` というリンクを張り付けてから `zoshigayan` だけポチポチ打ち換えるのは嫌すぎるッ。

ということで色々試した結果、引数として `@<remote参照名>` が使えるということがわかった。なので、originではなくupstreamのリンクを引きたい場合には以下のようにコマンドを実行すればよい。

```
:GBrowse! @upstream
```

これでやりたいことはできるようになった。割と多用しそうということを考えると毎回コマンド打つのは面倒なので、キーバインドを設定してターンエンドである。ちなみに　`git link (origin/upstream)` の意。

```vim
nnoremap <silent> <Leader>glo :GBrowse!<CR>
vnoremap <silent> <Leader>glo :GBrowse!<CR>
nnoremap <silent> <Leader>glu :GBrowse! @upstream<CR>
vnoremap <silent> <Leader>glu :GBrowse! @upstream<CR>
```

ほわぁ～

## おわり

fugitive、鮮やかな便利さはないけど引数マジックみたいなのが結構あって、思ってるより機能が多い。まだまだ掘り下げられそうな気配を感じる。

ちなみに読み方が分からなくてググったところfugitiveは「フュージティヴ」、rhubarbは「ルバーブ」と読むらしい。僕ずっと「フューギッティブ」っていってたわ…。

[^1]: じゃあRubyMine使えよと思う人もいるかもしれないが、世の中はそう簡単ではない。
[^2]: ちなみに `!` 無しの `:GBrowse` コマンドだとブラウザが開くはずなんだけど、僕のWSL2環境では動かなかった。まあ大体はSlackに貼りたいとかで結局クリップボードにコピーするだろうしこれでよかろう。
