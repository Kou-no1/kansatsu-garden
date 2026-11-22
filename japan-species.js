(() => {
  'use strict';

  window.GardenData.species.push(
    {
      id:'mizubasho', name:'ミズバショウ', latin:'Lysichiton camtschatcensis', family:'サトイモ科', group:'wild', habitat:'雪どけ水が流れる湿地',
      starterLabel:'種', stages:['たね','芽ばえ','若い葉','白いほうがひらく'],
      fact:'雪どけのころ、湿地に白い帆のようなものが立ちます。白い部分は葉が変化した「ほう」です。その内側の棒のような部分に、小さな花がたくさんついています。',
      look:'横から中をのぞける写真をさがそう。白い部分と、小さな花が集まった部分の形をそれぞれ描いてみよう。',
      question:'ミズバショウの小さな花が集まっているのはどこ？',
      answers:['大きな緑の葉の裏','白いほうの内側に立つ棒のような部分','水の中の根の先'], correct:1,
      source:'https://www.pref.hokkaido.lg.jp/kn/tkn/hana/flower/hs018.html', sourceName:'北海道'
    },
    {
      id:'ezomatsu', name:'エゾマツ', latin:'Picea jezoensis', family:'マツ科', group:'wild', habitat:'北海道の冷涼な森',
      starterLabel:'種', stages:['たね','芽ばえ','若木','枝が広がる大木'],
      fact:'北海道の森で、冬にも針のような葉をつけている木です。育った木には下にたれる枝があり、黒みのある茶色の樹皮は、うろこのようにうすくはがれます。',
      look:'林の写真から、手前の木の枝を1本選ぼう。幹から枝先までを線でなぞると、どんな向きにのびているかな？',
      question:'木の幹で、エゾマツらしい手がかりになるのは？',
      answers:['竹のようなふし','真っ白でつるつるの皮','黒っぽく、うろこのようにはがれる皮'], correct:2,
      source:'https://www.pref.hokkaido.lg.jp/sr/sky/Yezo_spruce.html', sourceName:'北海道'
    },
    {
      id:'haskap', name:'ハスカップ', latin:'Lonicera caerulea var. emphyllocalyx', family:'スイカズラ科', group:'wild', habitat:'北海道の原野や果樹園',
      starterLabel:'種', stages:['たね','芽ばえ','若木','青黒い実が熟す'],
      fact:'クロミノウグイスカグラともよばれる低い木です。北海道の勇払原野では、春に黄色い花が咲き、初夏には青黒く色づいた実が見られます。',
      look:'同じ木で春に花を、初夏に実をさがそう。花と実の色を、それぞれ色えんぴつで残してみよう。',
      question:'ハスカップでは、花から熟した実へどんな色の変化が見える？',
      answers:['黄色の花から青黒い実へ','青い花から白い実へ','赤い花から黄色い実へ'], correct:0,
      source:'https://www.city.tomakomai.hokkaido.jp/files/00002600/00002693/20230830113735.pdf', sourceName:'北海道苫小牧市'
    },
    {
      id:'komakusa', name:'コマクサ', latin:'Dicentra peregrina', family:'ケシ科', group:'wild', habitat:'高い山の砂や小石の斜面',
      starterLabel:'種', stages:['たね','子葉が1枚出る','細かく分かれた葉','花が咲く'],
      fact:'コマクサが育つのは、高い山の、砂や小石が動きやすい斜面です。地上の株は小さくても、地面の下では長い根をのばしています。葉は細かく分かれています。',
      look:'花といっしょに地面も見てみよう。コマクサのすぐそばには、ほかの草や木がどのくらいあるかな？',
      question:'動きやすい小石の斜面で、コマクサの株をささえるのは？',
      answers:['石に巻きつく枝','水に浮く葉','地面の下にのびる長い根'], correct:2,
      source:'https://www.ffpri.go.jp/snap/2019/8-komakusa.html', sourceName:'森林総合研究所'
    },
    {
      id:'katakuri', name:'カタクリ', latin:'Erythronium japonicum', family:'ユリ科', group:'wild', habitat:'春に日が差す雑木林の林床',
      starterLabel:'種', stages:['たね','細い芽','1枚の葉','2枚の葉と花'],
      fact:'春の林で地上に顔を出し、初夏には地上のすがたが消えます。種から花をつけるまでには、ふつう7〜8年。育つとちゅうは葉が1枚で、花をつけるころには2枚になります。',
      look:'写真で花のくきを下へたどり、その株の葉を数えよう。花のない小さな株には何枚あるかな？',
      question:'花をつけたカタクリの株には、ふつう何枚の葉がある？',
      answers:['1枚','2枚','8枚'], correct:1,
      source:'https://www.rinya.maff.go.jp/tohoku/syo/huzisato/zukan/katakuri.html', sourceName:'林野庁 東北森林管理局'
    },
    {
      id:'beech', name:'ブナ', latin:'Fagus crenata', family:'ブナ科', group:'wild', habitat:'白神山地などの山の森',
      starterLabel:'種', stages:['たね','芽ばえ','若木','実が育つ'],
      fact:'ブナの森では、秋、木の下で角のある小さな実が見つかります。実を包んでいた皮が開くと、中から三角ばった実が出てきます。',
      look:'落ちた実の写真を横と上から見くらべよう。どちらから見ると三角ばった形がわかりやすいかな？',
      question:'ブナの実はどんな形？',
      answers:['三角ばって角がある','平たいうちわの形','長く巻いたひもの形'], correct:0,
      source:'https://www.rinya.maff.go.jp/hokkaido/komagatake_fc/guide/pdf/56_buna.pdf', sourceName:'林野庁 北海道森林管理局'
    },
    {
      id:'ginkgo', name:'イチョウ', latin:'Ginkgo biloba', family:'イチョウ科', group:'school', habitat:'校庭や公園、道ぞいの並木',
      starterLabel:'種', stages:['たね','芽ばえ','若木','秋の黄葉'],
      fact:'イチョウの葉には長い柄があり、その先が開いたおうぎのように広がります。夏に緑色だった葉は、秋になると黄色くなり、やがて枝から落ちます。',
      look:'落ち葉を1枚選んで輪かくを描こう。となりのイチョウの葉と、先の切れこみの深さをくらべてみよう。',
      question:'イチョウを見分けやすい葉の形は？',
      answers:['細長い針','丸いお皿','開いたおうぎ'], correct:2,
      source:'https://www.ffpri.go.jp/kys/business/jumokuen/jumoku/zukan/ityou.html', sourceName:'森林総合研究所 九州支所'
    },
    {
      id:'morning-lotus', name:'ハス', latin:'Nelumbo nucifera', family:'ハス科', group:'wild', habitat:'池や湖、レンコンを育てる田',
      starterLabel:'種', stages:['たね','水中で芽ばえ','丸い葉が広がる','花が咲く'],
      fact:'ハスの花のまんなかには、平らな面にたくさんの穴が並んだ「花たく」があります。花びらが落ちたあとも残り、ハチの巣に似た形がよく見えます。',
      look:'咲いている花の中心と、花びらが落ちたあとの写真をならべよう。同じ部分を見つけられるかな？',
      question:'花びらが落ちたハスで、ハチの巣のように見えるのは？',
      answers:['葉のふち','花のまんなかにあった花たく','水の中の根の先'], correct:1,
      source:'https://www.knsk-osaka.jp/zukan/zukan_database/mizukusa/3150b31d6b9931d/4750b870858b01f.html', sourceName:'大阪府立環境農林水産総合研究所'
    },
    {
      id:'yamabuki', name:'ヤマブキ', latin:'Kerria japonica', family:'バラ科', group:'wild', habitat:'里山の谷ぞいや林のふち',
      starterLabel:'種', stages:['たね','芽ばえ','若い枝','黄色い花が咲く'],
      fact:'春、しなる細い枝に、山吹色とよばれるあざやかな黄色の花が咲きます。ひとえの花には花びらが5枚。花が終わったあとも、緑色の枝やふちがぎざぎざの葉を観察できます。',
      look:'花を1つ選び、花びらを指でさしながら数えよう。次に、花をつけている枝の色も見てみよう。',
      question:'ひとえのヤマブキの花は、どんな花びらをつける？',
      answers:['黄色の花びらを5枚','黄色の花びらを2枚','紫色の花びらを5枚'], correct:0,
      source:'https://www.kahaku.go.jp/research/db/botany/wild_p100/spring/17_yamabuki.html', sourceName:'国立科学博物館'
    },
    {
      id:'wasabi', name:'ワサビ', latin:'Eutrema japonicum', family:'アブラナ科', group:'wild', habitat:'山あいの冷たい流れやわさび田',
      starterLabel:'種', stages:['たね','芽ばえ','丸みのある葉','白い花が咲く'],
      fact:'山あいの涼しい流れに育つ草です。長い柄の先には、ハートに似た丸い葉が開きます。春にはくきの先に小さな白い花がいくつも咲き、花びらは1つの花に4枚あります。',
      look:'葉は、柄とつながるところがどんな形をしているかな？ 花の写真も大きくして、1つの花の花びらを数えよう。',
      question:'ワサビの白い花の花びらは何枚？',
      answers:['3枚','4枚','8枚'], correct:1,
      source:'https://www1.ous.ac.jp/garden/hada/plantsdic/angiospermae/dicotyledoneae/choripetalae/cruciferae/wasabi/wasabi1.htm', sourceName:'岡山理科大学'
    },
    {
      id:'fujibakama', name:'フジバカマ', latin:'Eupatorium japonicum', family:'キク科', group:'wild', habitat:'川岸や河原のしめった草地',
      starterLabel:'種', stages:['たね','芽ばえ','葉が向かい合う','花が集まって咲く'],
      fact:'秋の七草の一つで、しめった川岸などに生える草です。くきをよく見ると、同じ高さから2枚の葉が向かい合って出ています。葉の先が深く3つに分かれたものも見つかります。',
      look:'くきの上のほうと下のほうで、葉の切れこみをくらべよう。どの葉にも同じ深さの切れこみがあるかな？',
      question:'フジバカマのくきには、葉がどんなふうにつく？',
      answers:['くきの先に1枚だけつく','5枚が輪になってつく','2枚ずつ向かい合ってつく'], correct:2,
      source:'https://www1.ous.ac.jp/garden/hada/plantsdic/angiospermae/dicotyledoneae/sympetalae/compositae/fujibakama/fujibakama.htm', sourceName:'岡山理科大学'
    },
    {
      id:'kakitsubata', name:'カキツバタ', latin:'Iris laevigata', family:'アヤメ科', group:'wild', habitat:'池の岸や浅い水辺の湿地',
      starterLabel:'種', stages:['たね','細い芽','剣のような葉','花が咲く'],
      fact:'浅い水辺に生える、アヤメのなかまです。花の外側へたれた部分を見てみると、つけ根に白いすじが入っています。似た仲間を見分ける手がかりです。',
      look:'花を正面から見た写真で、白いすじがどこからどこまでのびているか、指でたどってみよう。',
      question:'カキツバタの花の外側へたれた部分には、どんな目じるしがある？',
      answers:['つけ根の細長い白いすじ','花の先の黒い点々','一面に広がる赤い輪'], correct:0,
      source:'https://ins.kahaku.go.jp/news-migoro/nid00005204.html', sourceName:'国立科学博物館 附属自然教育園'
    },
    {
      id:'wisteria', name:'フジ', latin:'Wisteria floribunda', family:'マメ科', group:'school', habitat:'山の林や、公園・校庭の藤だな',
      starterLabel:'種', stages:['たね','芽ばえ','つるがのびる','花のふさが下がる'],
      fact:'フジはつるをのばす木です。春に下がる長い花のふさは、小さな花の集まり。花は、ふさが枝につながるほうから先端に向かって順に開きます。',
      look:'咲きはじめのふさで、開いた花とまだ小さいつぼみをさがそう。上と下のどちらに、つぼみが多いかな？',
      question:'フジの1本の花のふさでは、どちらから花が開いていく？',
      answers:['ふさの先から枝に向かって','枝につながるほうからふさの先へ','まんなかだけが一度に開く'], correct:1,
      source:'https://www.rinya.maff.go.jp/tohoku/sidou/jumoku/shubetu/huji.html', sourceName:'林野庁 東北森林管理局'
    },
    {
      id:'ume', name:'ウメ', latin:'Prunus mume', family:'バラ科', group:'school', habitat:'梅林や庭、学校の植えこみ',
      starterLabel:'種', stages:['たね','芽ばえ','若木','春先に花が咲く'],
      fact:'枝にまだ新しい葉が見えない寒い季節から、花を開く木です。白い花も、うすいピンクや赤っぽい花もあります。品種によって、咲きはじめる時期も少しずつちがいます。',
      look:'つぼみのついた枝を1本決めて、同じ場所から何度か見よう。最初の花が開いた日、葉はもう出ていたかな？',
      question:'ウメの枝で、春にふつう先に見られるのは？',
      answers:['新しい葉が落ちるところ','新しい実が熟すところ','新しい葉が開く前に花が咲くところ'], correct:2,
      source:'https://www.u-shizuoka-ken.ac.jp/guide/outline/oike02/february-2023/', sourceName:'静岡県立大学'
    },
    {
      id:'tea', name:'チャノキ', latin:'Camellia sinensis', family:'ツバキ科', group:'wild', habitat:'日本各地の茶畑',
      starterLabel:'種', stages:['たね','芽ばえ','つやのある葉','白い花が咲く'],
      fact:'お茶になる葉は、冬も緑のチャノキについています。秋から初冬には、葉のつけ根のあたりに、白い花が下を向いて開きます。',
      look:'花の写真で、枝は花の上と下のどちらにあるかな？ 茶畑を歩くつもりで、どの高さから探すと見つけやすいか考えよう。',
      question:'チャノキの花をさがすときの手がかりは？',
      answers:['秋ごろに下向きに咲く白い花','春に水面に浮かぶ青い花','夏に幹から飛び出す赤い花'], correct:0,
      source:'https://www.ffpri.go.jp/kys/business/jumokuen/jumoku/zukan/tyanoki.html', sourceName:'森林総合研究所 九州支所'
    },
    {
      id:'sugi', name:'スギ', latin:'Cryptomeria japonica', family:'ヒノキ科', group:'wild', habitat:'雨の多い山の森や、木を植えた林',
      starterLabel:'種', stages:['たね','芽ばえ','若木','球果が育つ'],
      fact:'短くとがった葉が、細い枝を取り巻くらせんのように並びます。丸いまつぼっくりのような「球果」は、はじめは緑色で、開くころには茶色に変わります。',
      look:'枝の写真を拡大し、葉のつけ根を、手前から向こうまで目で追ってみよう。葉は枝のどの面についているかな？',
      question:'スギのとがった葉は、枝にどう並ぶ？',
      answers:['枝の先に1本だけつく','枝を取り巻くらせんのように並ぶ','枝の片側だけに並ぶ'], correct:1,
      source:'https://www.ffpri.go.jp/kys/business/jumokuen/jumoku/zukan/sugi.html', sourceName:'森林総合研究所 九州支所'
    },
    {
      id:'sudachi', name:'スダチ', latin:'Citrus × sudachi', family:'ミカン科', group:'wild', habitat:'徳島県などの果樹園',
      starterLabel:'種', stages:['たね','芽ばえ','若木','緑の実が育つ'],
      fact:'徳島で古くから育てられている、ミカンのなかまです。皮が濃い緑色の時期に実を収穫します。小さな実には、さわやかな香りとすっぱさがあります。',
      look:'スダチの収穫の写真と、ふだん見かける温州ミカンの写真をくらべよう。皮の色や実の大きさはどうちがうかな？',
      question:'徳島のスダチの実は、ふつうどんなときに収穫する？',
      answers:['まだ花が咲いているとき','実の皮が黒くなったとき','実の皮が濃い緑色のとき'], correct:2,
      source:'https://www.maff.go.jp/j/shokusan/gi_act/register/0129/index.html', sourceName:'農林水産省'
    },
    {
      id:'camellia', name:'ツバキ', latin:'Camellia japonica', family:'ツバキ科', group:'school', habitat:'暖かい地方の林や庭の生け垣',
      starterLabel:'種', stages:['たね','芽ばえ','若木','花が咲く'],
      fact:'ここで育てるのは、ヤブツバキとよばれるツバキです。冬の林でも葉は緑色。厚い葉の表にはつやがあり、ふちには小さなぎざぎざがあります。',
      look:'明るいところと木かげにある葉を見くらべよう。光をはね返すところと、葉のふちの細かい形が見えるかな？',
      question:'花が咲いていないツバキをさがすとき、どの葉が手がかりになる？',
      answers:['表につやがあり、ふちが細かくぎざぎざの葉','2本ずつたばになる針の葉','水に浮かぶ丸い葉'], correct:0,
      source:'https://www.kkr.mlit.go.jp/rokko/rokko/vegetation/sp/135/index.html', sourceName:'国土交通省 六甲砂防事務所'
    },
    {
      id:'deigo', name:'デイゴ', latin:'Erythrina variegata', family:'マメ科', group:'wild', habitat:'沖縄の公園や道ぞい',
      starterLabel:'種', stages:['たね','芽ばえ','若木','深紅の花が咲く'],
      fact:'沖縄の公園や道ぞいで見られる大きな木で、沖縄県の県花に選ばれています。春には枝に深い赤色の花がつき、離れたところからでもよく目立ちます。',
      look:'木全体が写った写真で、赤い花がいくつも集まる場所を指でさがそう。葉の緑色はどこで見えるかな？',
      question:'沖縄の県花デイゴで、遠くからでも目印になる花の色は？',
      answers:['こい青','深い赤','うすい黄緑'], correct:1,
      source:'https://www.pref.okinawa.jp/shigoto/kenkyu/1010919/1021637/1003010/1003096.html', sourceName:'沖縄県'
    },
    {
      id:'mangrove', name:'オヒルギ', latin:'Bruguiera gymnorhiza', family:'ヒルギ科', group:'wild', habitat:'南西諸島の海と川が出会う水辺',
      starterLabel:'苗', stages:['芽を出した苗','泥に根を下ろす','若木','枝に細長い苗が育つ'],
      fact:'川の水と海の水がまじるところに生える、マングローブの木の一つです。種は、まだ親の木についているうちに芽を出します。枝からぶら下がる細長い苗が、その手がかりです。',
      look:'枝から下がる苗の写真で、親の木とつながっているほうと、地面に向いているほうを見分けてみよう。',
      question:'オヒルギの種が芽を出しはじめる場所は？',
      answers:['風で運ばれた山の上','海の底の砂の中','まだ親の木についているところ'], correct:2,
      source:'https://www1.ous.ac.jp/garden/hada/plantsdic/angiospermae/dicotyledoneae/choripetalae/rhizophoraceae/ohirugi/ohirugi.htm', sourceName:'岡山理科大学'
    }
  );
})();
