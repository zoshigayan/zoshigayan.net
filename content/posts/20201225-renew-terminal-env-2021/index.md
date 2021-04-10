---
title: "ターミナル環境大掃除2021"
slug: "renew-terminal-env-2021"
date: 2020-12-25T23:53:27+09:00
description: "模様替えの計画だけを組み上げて熟睡する、そんな日があってもいい"
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "shell", "vim"]
---

## そんなinit.vimで大丈夫か？

仕事納めを終えた。冬休みである。ワーイ

Zsh も NeoVim も Tmux も、1年ほぼ放ったらかしで使っていたら不満があったり叶えたい夢が生まれたりしたので、このタイミングでガッと一気に改善したい。

とはいえ、この手の作業は闇雲に始めると詰んだときに戻れなくなりそうなので、作業メモを残しておくことにする。なので、この文章を誰かが読んでいるならこの儀式は成功している…というか、少なくとも取り返しのつかない事態に陥ったり、途中で投げ出したりはしていないと思う。

(追記: もともとは冬休みにやりきろうと思っていたが、年が明け仕事が始まった後も延々と続いてしまっている)


## 現状

具体的な課題・改善の前に、今どういう使い方をしてるのか、改めてまとめてみる。

* 設定を GitHub で管理したい
    * 当たり前だけども
* 仕事は Mac、個人開発は Ubuntu on WSL2
    * マルチプラットフォーム対応をする必要がある
* Tmux で複数タブを切り替えながら開発する
    * Vim 専用タブと、それ以外 (Docker や 開発用サーバなど) 用の2つが主
    * 何かが起きて Vim を再起動する場面が多いので Vim のターミナルは使ってない
    * 新たな Pane が必要になったら「それ以外」のタブを分割して使う
* Zsh ほぼ初期設定
    * 不満がないので…

現時点の dotfiles は [こんな感じ](https://github.com/zoshigayan/dotfiles/tree/2d3298073c2038df22cf712dba4a6f4f92b08fad) である。個人開発だと「ぬ」だけで commit してしまうタイプの人間…。


## 課題・改善点

やりたいことを思いつくままに書き出してみる。

### Zsh

* いい加減にプラグイン管理をしたい
    * zsh-git-prompt しか使ってないけど
    * dotfiles を GitHub で管理する都合上、落としてきたプラグインがそのまま commit されるのはつらい
    * 何もわからんので有名どころの zplug あたりを入れたい
* ghq の移動コマンドをキーバインド化したい
    * 今は `g` で発火するようにしてるけど、いくら何でも作りが雑 ( `esc` でキャンセルすると突然 `~/.ghq` に放り出される)
    * どう考えても一番使うので、適当なキーバインドで発火するようにしたい
    * かっこいいし
* 今やってる設定を理解したい
    * 確か公式からそのままコピペしてきたやつなので、きちんと理解したい

### Vim

* プラグイン管理を Dein から vim-plug に乗り換えたい
    * toml 管理がめっちゃ便利という声は聞くけど、自分にはあんまり合わなかった
    * 設定はひとつのファイルにドカーンと集めたい
* ファイラを defx から Fern に乗り換えたい
    * サイドバー出したいだけにしては正直オーバースペック感がある
    * コアモジュールとプラガブルな拡張機能に分かれているという設計思想がすこ
* Denite を脱したい
    * CtrlP 相当のファイル名指定移動を実現するためだけに入れてるけど、正直使いこなせてない感がすごい
    * fzf でなんとかなりそうな気がするし、CtrlP でもいい
* ripgrep 連携したい
    * いつまで vimgrep そのまま使ってんだよという気持ちになってきた
* nvim-typescript が突然死する現象を食い止めたい
    * TypeScript ファイルを開いた状態で quickfix すると大量のエラーを吐いて落ちることがある
    * 前に調べた時それっぽい Issue は見当たらなかったので、なんとか原因を特定して直したい
* 補完ってやつをやってみたい
    * 慣れたから無くても全然いいんだけど、こう…今っぽくて格好いいので…
    * deoplete 導入してるもののうまく動かせてないので、もしかしたら CoC とか YouCompleteMe とかに乗り換えるかも
    * 正直あんまりビジョンがない
* Rails 開発に最適化したい
    * 触るようになったのがここ半年ぐらいなので、まだ rubocop 連携ぐらいしかやってない
    * コミュニティ規模を考えると確実に便利なツールで溢れているはずなので、取り入れていきたい

### Tmux

* なんか「その設定、非推奨やで」みたいなのが毎回出てる気がするのを直したい
    * 使えてるからいいやとは思ってるけど、いい加減ちゃんと使わなきゃという気もしている
    * 警告消したいし、ついでに便利そうな設定あったら取り入れたい

### そのほか

* anyenv から asdf に乗り換えたい
    * global version も静的ファイルに吐き出せて dotfiles との相性がよさそう
* peco から fzf に乗り換えたい
    * なんか Vim 拡張とか色々あって便利そう
    * 漠然とかっこいいし
* GitHub CLI を使ってみたい
    * 便利そうだし

## 作業計画

上記のやりたいことを整理してみる。

いくつかの作業の間には依存関係があるので、順番をあれこれ並び替えて TODO 化してみると以下のようになった。

* zplug を導入する
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

こう並べると案外いけるのではという気持ちもしてくる。が、こう書くことが既に死亡フラグのようでもある。

やってこ～

## とりあえず寝る

この手の作業を深夜 (現在時刻 3:38) にやってはいけない。寝るのだ。

## 続く

次回、 [zplugを導入する](/install-zplug)！