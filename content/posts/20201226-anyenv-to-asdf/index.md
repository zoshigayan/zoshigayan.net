---
title: "anyenv から asdf に乗り換える"
slug: "anyenv-to-asdf"
date: 2020-12-26T15:18:55+09:00
description: ""
draft: false
series: "ターミナル環境大掃除2021"
tags: ["作業ログ", "shell"]
---

これは [ターミナル環境大掃除2021](/renew-terminal-env-2021) の2発目です。

## 動機

## 作業

Global のバージョンが静的に吐き出せるというのは割と魅力である。会社の強い人も乗り換えたって言ってた。やっていこう。

[asdf のリポジトリ](https://github.com/asdf-vm/asdf) を見てみると、なんと GitHub Releases を使って実行ファイルを配布している。つまり、zplug チャンスである。

ということで、試しに zplug 経由でインストールを試みてみる。

```
# asdf
zplug "asdf-vm/asdf", \
  from:github, \
  as:command, \
  rename-to:asdf, \
  use:asdf.sh, \
  hook-load:". $ZPLUG_HOME/repos/asdf-vm/asdf/asdf.sh"
```

…なんか GitHub Relases だと `asdf-vm/asdf: there are no available releases` になってしまう (圧縮されてるとダメっぽい？) ので普通に clone する形式にした。ひとまずこれで動作することを確認できた。

設定をしていく。

asdf は 各言語・ツールのバージョン管理操作がプラグインとして提供されている。「asdf と plugin」が丁度そのまま「anyenv と *env」に当てはまりそうである。なので、ひとまずバージョン管理したい言語のプラグインを一通り揃えてみる。

```
( '_') < asdf plugin add ruby

( '_') < asdf plugin add nodejs

( '_') < asdf plugin add python

( '_') < asdf plugin list
nodejs
python
ruby
```

いけたっぽい。しかしまだ何のバージョンも入れていないので使えない。

試しに Node.js の 14系 (LTS) 最新版を入れてみる。

```
( '_') < asdf list all nodejs
0.10.0
0.10.1
0.10.2
(略)
14.15.1
14.15.2
14.15.3
15.0.0
(略)

( '_') < asdf install nodejs 14.15.3
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  3490    0  3490    0     0   2218      0 --:--:--  0:00:01 --:--:--  2217
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 31.9M  100 31.9M    0     0  6981k      0  0:00:04  0:00:04 --:--:-- 7427k
node-v14.15.3-linux-x64.tar.gz: OK

( '_') < asdf list nodejs
  14.15.3

( '_') < which -a node
/home/zoshigayan/.anyenv/envs/nodenv/shims/node
/home/zoshigayan/.asdf/shims/node
/home/zoshigayan/.anyenv/envs/nodenv/shims/node
/usr/bin/node
```

いけた！省略したけど何もしないで install しようとしたらチェックサムの照合で弾かれたので、事前に [asdf-nodejs の README](https://github.com/asdf-vm/asdf-nodejs) 通りに keyring の設定をする必要がある。Ruby と Python はそのままで大丈夫だった。

よーし PATH を通していくぞ…と思ったら、なんと shim を登録するところまでは asdf のインストールスクリプトが既にやってくれていた ([GitHub](https://github.com/asdf-vm/asdf/blob/master/asdf.sh#L29))。なので、anyenv を消し去れば完了である。

```
( '_') < rm -rf ~/.anyenv
```

`.zshrc` からも anyenv の初期化と PATH 追加用の設定を削除してシェルを再起動した後、各言語の PATH を検証する。

```
( '_') < which python
/home/zoshigayan/.asdf/shims/python

( '_') < which ruby
/home/zoshigayan/.asdf/shims/ruby

( '_') < which node
/home/zoshigayan/.asdf/shims/node
```

ワーイ！やったね！完成！！

と言いたいが…これだとまだ anyenv を置き換えただけなので、グローバルバージョンの静的管理という当初の目的は果たされていないのだ。

引き続き、バージョンの指定をしていく。

```
( '_') < asdf list
nodejs
  14.15.3
python
  3.9.1
ruby
  2.7.2

( '_') < asdf global nodejs 14.15.3

( '_') < asdf global python 3.9.1

( '_') < asdf global ruby 2.7.2

( '_') < asdf current
nodejs          14.15.3         /home/zoshigayan/.tool-versions
python          3.9.1           /home/zoshigayan/.tool-versions
ruby            2.7.2           /home/zoshigayan/.tool-versions

( '_') < cat ~/.tool-versions
nodejs 14.15.3
python 3.9.1
ruby 2.7.2
```

ありがたいことに、global にバージョンを指定するだけで `~/.tool-versions` というファイルに情報が吐き出されているのがわかる。これをシンボリックリンクに置き換えて、本体を Git 管理している `dotfiles` ディレクトリにしまっておく。

```
( '_') < mv ~/.tool-versions ~/dotfiles/asdf/

( '_') < ln -s ~/dotfiles/asdf/.tool-versions ~
```

asdf はデフォルトだと多くのプロジェクトで使われている (そして恐らくこれからも使われ続ける) `.ruby-version` とか `.node-version` を無視するので、これらのファイルを検知できる設定をする。dotfiles ディレクトリ以下に `.asdfrc` を作成し、以下のオプションを記述しておく。

```
legacy_version_file = yes
```

そして .zshrc に設定ファイルのパスを環境変数として指定する ( `.asdfrc` はパス指定できるのに `.tool-versions` はホームディレクトリ固定らしい)。

```
export ASDF_CONFIG_FILE=~/dotfiles/asdf/.asdfrc
```

これで…完了…！

* ~~zplug を導入する~~
* ~~anyenv から asdf に乗り換える~~
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
