(() => {
  'use strict';

  const missions = new Map([
    ['hokkaido', {
      target:'haskap', choices:['sudachi','haskap','camellia'],
      clue:'北海道の勇払原野。背の低い木に、青黒くて細長い実がいくつもついています。どの植物だろう？',
      hint:'青い実の色と、少し細長い形をよく見てね。',
      answer:'この木はハスカップ。北海道の原野に自生し、青黒い実をつけます。'
    }],
    ['tohoku', {
      target:'beech', choices:['beech','ezomatsu','ginkgo'],
      clue:'白神山地の森に入りました。すべすべした灰色がかった幹を見上げると、ふちが波のようになった、だ円形の葉が広がっています。',
      hint:'針のような葉や、扇の形の葉と見くらべてみよう。',
      answer:'白神山地に広がるのはブナの天然林。ブナの葉のふちには、ゆるやかな波の形が見られます。'
    }],
    ['kanto', {
      target:'morning-lotus', choices:['kakitsubata','mizubasho','morning-lotus'],
      clue:'埼玉県行田市の池で、水面より高く、大きな丸い葉が広がっています。夏になると、その葉の間からピンク色の花が顔を出します。',
      hint:'水の中から長い柄がのび、丸い葉を持ち上げています。',
      answer:'行田蓮はハスのなかま。水面の上にのびる丸い葉と、夏に開く花が手がかりです。'
    }],
    ['chubu', {
      target:'wasabi', choices:['wasabi','katakuri','tea'],
      clue:'中部地方の冷たい水が流れる栽培地です。丸みのある葉の下に太いくきがあり、小さな白い花には花びらが4枚あります。',
      hint:'くきの形と、ハートのような葉に注目してね。',
      answer:'ワサビです。すりおろして料理に使うのは、太くなったくきです。'
    }],
    ['kinki', {
      target:'tea', choices:['yamabuki','tea','wisteria'],
      clue:'京都府の畑に低い木が列をつくっています。つやのある葉の先には明るい緑の新芽。人々はその芽や葉を摘んで飲み物を作ります。',
      hint:'ふだん飲むお茶の葉は、どの木からとれるかな？',
      answer:'茶畑に並ぶのはチャノキ。お茶に使う葉を育てる木で、白い花も咲きます。'
    }],
    ['chugoku', {
      target:'camellia', choices:['ume','deigo','camellia'],
      clue:'山口県萩市の笠山で、つやのある厚い葉に囲まれた赤い花を見つけました。花の中央には、黄色いおしべがたくさん集まっています。',
      hint:'枝に葉がある様子と、まとまって開く花びらを見てみよう。',
      answer:'笠山の林で見られるのはヤブツバキ。ツバキは、冬にも緑の葉をつけています。'
    }],
    ['shikoku', {
      target:'sudachi', choices:['haskap','sudachi','beech'],
      clue:'徳島県の果樹園で、ミカンに似た小さな緑色の実が育っています。切るとさわやかな香りがして、しぼった汁は料理に使われます。',
      hint:'香りのよい、小さくて丸いかんきつの実だよ。',
      answer:'徳島県で多く栽培されるスダチ。緑のうちに収穫する実も、木で熟すと黄色くなります。'
    }],
    ['kyushu', {
      target:'mangrove', choices:['mangrove','sugi','morning-lotus'],
      clue:'沖縄の海水と川の水がまじる場所です。木の枝から細長い棒のようなものが下がり、親の木についているうちに芽が育っています。',
      hint:'枝から下がった細長い苗と、水辺のどろに注目しよう。',
      answer:'このマングローブの木はオヒルギ。親の木の上で発芽して育ったものが落ち、どろに根づくことがあります。'
    }]
  ]);

  window.GardenJapanJourney = window.createGardenJourney({
    missions, regions:window.GardenJapan.regions, prefix:'kansatsu-garden.japan.v1.', mapId:'japan', unit:'地方'
  });
})();
