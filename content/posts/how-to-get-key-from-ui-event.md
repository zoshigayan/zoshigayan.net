---
title: "結局 JavaScriptで「押されたキー」はどう取得するのがよいのか"
date: 2020-08-27T04:00:09+09:00
description: "e.keyCodeをなんとなく使ってきた人生だった"
draft: false
keywords: []
tags: ["javascript", "frontend"]
---

## 背景

[@types/react](https://www.npmjs.com/package/@types/react) のコードを眺めていると、 `KeyboardEvent` の中身が一部 `deprecated` になっていることがわかる ([GitHub](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/23a1fd68ce20cb34d944903c44c58b3897fcfd19/types/react/index.d.ts#L1201-L1223))。

```typescript
interface KeyboardEvent<T = Element> extends SyntheticEvent<T, NativeKeyboardEvent> {
    altKey: boolean;
    /** @deprecated */
    charCode: number;
    ctrlKey: boolean;
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean;
    /**
     * See the [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#named-key-attribute-values). for possible values
     */
    key: string;
    /** @deprecated */
    keyCode: number;
    locale: string;
    location: number;
    metaKey: boolean;
    repeat: boolean;
    shiftKey: boolean;
    /** @deprecated */
    which: number;
}
```

このコードを見る限りだと、キーボードイベントに対して `e.charCode` とか `e.keyCode` という形でキーを取得する方法は非推奨ということになるが、僕は正直このへんの実装に対してあまり思い入れがない。 `keyCode` は使ったことある気がするけど、何で使っていたのかと言われるとよくわからない。社内でも「好みが色々あるよね～」みたいなフワッとした感じになっている気がする。

しかし deprecated となれば問題である。うっかり手を出せば「えーあの人フロントエンド詳しそうに見えたけど deprecated API 使っちゃうんだーププッ」みたいなことを private channel で言われるリスクがある。そうなれば生きていけない。JavaScript は人の命を奪うこともある。

果たして2020年現在、石を投げられたり笑われたりしない方法は何なのだろうか。それを探るため、取材班はネットサーフィンをした。

## deprecated の理由

まずは @types/react が `charCode` と `keyCode` を非推奨とした理由についてである。

W3C の Working Draft に UI Events をまとめた頁があり、そこで奴らは **Legacy Key & Mouse Event Attributes** に分類されている。[^1] なんということか。 好みどころではない。そもそも仕様レベルでレガシーな存在だったのだ。

詳しい話は原文を読んでもらうとして、ざっくりと要約すると、以下のような感じである。

* これらの属性は正式に仕様化されていないため、ブラウザによって実装が大きく異なる
* 後方互換性のために **ブラウザーによっては実装されていることがある**
* `charCode` および `keyCode` 属性の代わりに **`key` 属性を使え**

もはや「存在するのが奇跡」ぐらいの勢いで書かれている。近年まれに見る圧倒的非推奨である。これはまずい。絶対に使わない方がいい。間違いない。

## key がいいらしい

前項で 「 `key` 属性を使え」と言われていたので、今度はそっちを調べてみる。

同じく Working Draft の中に記述がある。[^2]

> A conforming implementation of the KeyboardEvent interface MUST support this set of values for use in the key attributes, although not all values MAY be available on all platforms or devices.

ざっくりいうと「ブラウザベンダーは全部の値を実装しなくてもいいから `key` 属性は実装しとけよ」みたいなことが書かれている。まあ書き方的にも明らかに `keyCode` より頼りになる感じがする。信頼度でいうとバンドマンと銀行員ぐらいの差がある。

ということなので、キーボードイベントは大人しく `e.key` で取得するのがよいだろう。

## IME と Enter 問題

アクセシビリティへの配慮を考えたとき、コンポーネントはキーボードで操作できることが望ましい。その対応をしようと思ったときに立ちはだかるのが、「一部ブラウザで `keydown` イベントにおける IME 確定キーが `Enter` としてハンドリングされてしまう」という問題である。もっと噛み砕いて言うと「日本語入力確定時に押す `Enter` と、それ以外のフォーム送信とかを発火するために押す `Enter` を見分けられないことがある」という感じ。

言葉で説明すると難しいので無料のデモを用意した。[^3] Windows なら問題ないが、 macOS 上の Chrome や Safari だと変換を確定したタイミングでも「おしたね」と言われてしまうはずだ。

<iframe height="400" style="width: 100%;" scrolling="no" title="keyを取得したい人生だった" src="https://codepen.io/zoshigayan/embed/preview/MWymgxo?height=265&theme-id=dark&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/zoshigayan/pen/MWymgxo'>keyを取得したい人生だった</a> by 雑司ヶ谷
  (<a href='https://codepen.io/zoshigayan'>@zoshigayan</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

このような挙動をされると、例えば ComboBox などの「文字入力と並行しつつ `Enter` をハンドリングする」ような実装をするとき非常に困る。

ちなみにこれは日本語 (というか CJK Language) ユーザーが冷遇されているという問題かというとそうではなく、むしろ逆で、この間まで IME 確定前の状態だと `keydown` イベントは全く発火しないのが普通だったのである。それはまずいでしょということでブラウザベンダーの皆さんが尽力した結果が今なのであり、これはこれで進歩の功績なのだ…と思うと多少許せる。

これについては至るところでワークアラウンドが考案されているが、基本的にどれも `keypress` イベントや `keyCode` 属性といった圧倒的非推奨 API の利用が前提となる。それはまずい。private channel が開いてしまう。なんとしても non-deprecated な方法を見つけたい。

現状 IME 対応が一番進んでいる (気がする) Firefox で日本語 IME を利用して「絵」を変換・入力するときには以下のような順番でイベントが発生する。[^4]



1. `keydown { isComposing: false, key: "Process", keyCode: 229 }`
1. `compositionstart { data: "" }`
1. `compositionupdate { data: "え" }`
1. `input { isComposing: true }`
1. `keyup { isComposing: true, key: "e", keyCode: 69 }`
1. `keydown { isComposing: true, key: "Process", keyCode: 229 }`
1. `compositionupdate { data: "絵" }`
1. `input { isComposing: true }`
1. `keyup { isComposing: true, key: " ", keyCode: 32 }`
1. `keydown { isComposing: true, key: "Process", keyCode: 229 }`
1. `compositionend { data: "絵" }`
1. `input { isComposing: false }`
1. `keyup { isComposing: false, key: "Enter", keyCode: 13 }`

注目すべきは IME 確定の `Enter` 押下時に発生しているイベントの 10 と 13 である。

10 の `keydown` イベントにおいては `isComposing` フラグから IME 確定前の入力であることが分かるものの、Firefox は IME 確定前に発生するすべての `keydown` イベントで `key` 属性に `Process` を入れるようになっているので、肝心のキーが何なのか分からない。

一方、13 の `keyup` イベントは `key` 属性に `Enter` が入るが、このイベント自体が「 `Enter` を離した瞬間 = IME 確定後」のものと見做されるために `isComposing` フラグが `false` になってしまう。これだと IME が絡まない通常時のッターンと見分けることができない。

`keypress` イベントを使う手もよぎったが、それだと `input` 要素に focus した状態での矢印キーの取得ができない。そっちはそっちで使いたいので、一旦この手は考えないこととする。

そうなると…完全に詰んでいる。

誰もが諦めかけたその瞬間、取材班は MDN に記された衝撃のワークアラウンドを発見した。[^5]

```javascript
eventTarget.addEventListener("keydown", event => {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  // 何かをする
});
```

<p style="margin-top:10rem;">
いや <code>keyCode</code> 使うのかよ　ズコー
</P>

## 結論

* `keyCode` は圧倒的非推奨なので基本的に `key` を使う
* でも IME と組み合わせて `Enter` キーの入力を判別したいときは `keyCode` 使うのがよい
* もっと良い方法知ってる人いたら教えてほしい

[^1]: https://www.w3.org/TR/uievents/#legacy-key-attributes
[^2]: https://www.w3.org/TR/uievents-key/#named-key-attribute-values
[^3]: 技術系の記事は無料で読めるものが大半なのだが、改めて「無料」と声に出すことでインターネットのありがたみを感じ (させ) ることができるライフハック
[^4]: https://www.fxsitecompat.dev/en-CA/docs/2018/keydown-and-keyup-events-are-now-fired-during-ime-composition/
[^5]: https://developer.mozilla.org/ja/docs/Web/API/Document/keydown_event
