(() => {
  'use strict';

  window.GardenData.species.push(
    {
      id:'rice', name:'イネ', latin:'Oryza sativa', habitat:'日本の水田', group:'school', family:'イネ科',
      starterLabel:'種', stages:['種もみ','芽ばえ','くきがふえる','穂が実る'],
      fact:'田んぼのイネは、くきの先に「穂（ほ）」をつけます。1本の穂に実るお米は、およそ50〜70つぶ。穂の大きさや品種によっても数が変わります。',
      look:'1本の穂を目でたどってみよう。いくつもの細い枝に、もみがどんなふうについているかな？',
      question:'イネのどの部分に、お米がまとまって実るかな？',
      answers:['根の先の毛','くきの先の穂','葉の先のとがり'], correct:1,
      source:'https://www.maff.go.jp/j/heya/kodomo_sodan/0105/05.html', sourceName:'農林水産省'
    },
    {
      id:'loofah', name:'ヘチマ', latin:'Luffa aegyptiaca', habitat:'日本の学校の畑や花だん', group:'school', family:'ウリ科',
      starterLabel:'種', stages:['たね','芽ばえ','巻きひげがのびる','長い実が育つ'],
      fact:'ヘチマの「巻きひげ」は、ネットや細い枝にくるりと巻きつき、長いつるをささえます。育った実の中には、たわしに使える糸のようなすじがあります。',
      look:'ネットをつかんだ巻きひげと、まだ何もつかんでいない巻きひげの形を見くらべてみよう。',
      question:'ヘチマがネットをつかむために使うのは？',
      answers:['実の皮','葉のふち','巻きひげ'], correct:2,
      source:'https://www.pharm.kumamoto-u.ac.jp/yakusodb/detail/005767.php', sourceName:'熊本大学薬学部薬用植物園'
    },
    {
      id:'cherry', name:'ソメイヨシノ', latin:"Cerasus × yedoensis 'Somei-yoshino'", habitat:'日本の学校や公園', group:'school', family:'バラ科',
      starterLabel:'苗', stages:['苗木','枝がのびる','つぼみがふくらむ','花が咲く'],
      fact:'校庭や公園で見られるサクラの一つです。春、新しい葉が開く前に、うすいピンク色の花がまとまって咲きます。花びらはふつう5枚です。',
      look:'春に同じ枝を何回か見てみよう。花が開いた日と、緑の葉が目立ちはじめた日は、どちらが先かな？',
      question:'ソメイヨシノでは、春の枝にどんな変化が見られる？',
      answers:['花が先に開き、そのあと新しい葉が目立つ','新しい葉が落ちてから実が出る','つぼみが開いて葉に変わる'], correct:0,
      source:'https://www.ffpri.go.jp/kys/business/jumokuen/jumoku/zukan/someiyosino.html', sourceName:'森林総合研究所 九州支所'
    },
    {
      id:'cacao', name:'カカオ', latin:'Theobroma cacao', habitat:'南アメリカの熱帯の森', group:'wild', family:'アオイ科',
      starterLabel:'種', stages:['たね','芽ばえ','若木','幹に実がつく'],
      fact:'熱帯の森で育つカカオは、幹から小さな花をじかに咲かせます。やがて大きく育った実を割ると、中にはチョコレートのもとになる種がつまっています。',
      look:'カカオの木の写真で、実のつけ根をさがしてみよう。リンゴの実がつく場所と同じかな？',
      question:'チョコレートを作るときに使う、カカオの部分は？',
      answers:['根','花びら','実の中の種'], correct:2,
      source:'https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A320783-2/general-information', sourceName:'英国王立植物園キュー'
    },
    {
      id:'giant-lily', name:'オオオニバス', latin:'Victoria amazonica', habitat:'アマゾン川流域の静かな水辺', group:'wild', family:'スイレン科',
      starterLabel:'種', stages:['たね','水中で芽ばえ','浮き葉がひらく','大きな丸い葉'],
      fact:'アマゾン川の流域で、大きなお皿のような葉を水面に浮かべます。葉の裏には太いすじが中心から外へのび、横のすじとつながって、あみ目を作っています。',
      look:'図鑑の写真で、葉の裏側のすじを指でたどってみよう。中心から出たすじの間は、どんな形に区切られているかな？',
      question:'オオオニバスの大きな葉の裏には、どんなつくりがある？',
      answers:['あみ目のようにつながったすじ','丸い実がならんだ列','太い根がつくった輪'], correct:0,
      source:'https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A605776-1/general-information', sourceName:'英国王立植物園キュー'
    },
    {
      id:'saguaro', name:'サワロサボテン', latin:'Carnegiea gigantea', habitat:'北アメリカのソノラ砂漠', group:'wild', family:'サボテン科',
      starterLabel:'種', stages:['たね','芽ばえ','柱のようにのびる','大きなサボテン'],
      fact:'雨が少ないソノラ砂漠で育つサワロサボテン。くきの表面には、たてに深いひだがあります。雨のあとに水を吸うと、ひだが開いてくきがふくらみます。',
      look:'くきの表面を写真で見てみよう。たてにのびる山と谷は、じゃばらをたたんだ形に似ているかな？',
      question:'サワロサボテンが雨水をたくわえると、くきのひだはどうなる？',
      answers:['ひだが花に変わる','ひだが開いてくきがふくらむ','ひだが消えてくきが短くなる'], correct:1,
      source:'https://www.nps.gov/sagu/learn/nature/cacti-and-desert-succulents.htm', sourceName:'米国国立公園局 サワロ国立公園'
    },
    {
      id:'sequoia', name:'ジャイアントセコイア', latin:'Sequoiadendron giganteum', habitat:'北アメリカのシエラネバダ山脈', group:'wild', family:'ヒノキ科',
      starterLabel:'種', stages:['たね','芽ばえ','若木','太い幹の大木'],
      fact:'アメリカのシエラネバダ山脈には、太い幹をもつジャイアントセコイアの森があります。あれほど大きな木も、まつぼっくりの中にできる小さな種から育ちます。',
      look:'資料の写真で、人と幹の太さをくらべてみよう。次に、種が人の手にのっている写真をさがしてみよう。',
      question:'ジャイアントセコイアの種は、どこにできる？',
      answers:['葉の裏のふくろ','幹の皮のすき間','まつぼっくりの中'], correct:2,
      source:'https://www.nps.gov/jomu/learn/nature/john-muir-s-sequoia.htm', sourceName:'米国国立公園局'
    },
    {
      id:'edelweiss', name:'エーデルワイス', latin:'Leontopodium nivale subsp. alpinum', habitat:'ヨーロッパのアルプスの山地', group:'wild', family:'キク科',
      starterLabel:'種', stages:['たね','芽ばえ','葉がひろがる','星形のすがた'],
      fact:'アルプスの山地で見られるエーデルワイス。白い星のように見える部分は、細かい毛におおわれた葉のなかまです。星のまんなかには、小さな花が集まっています。',
      look:'写真を近くで見て、白い毛のある部分と、その内側のつぶつぶした部分をさがしてみよう。',
      question:'エーデルワイスの白い星を形づくるのは？',
      answers:['白い毛におおわれた葉のなかま','星形の種','細い根の集まり'], correct:0,
      source:'https://www.rhs.org.uk/plants/353775/leontopodium-nivale-subsp-alpinum/details/', sourceName:'英国王立園芸協会'
    },
    {
      id:'papyrus', name:'パピルス', latin:'Cyperus papyrus', habitat:'アフリカの川や湖の水辺', group:'wild', family:'カヤツリグサ科',
      starterLabel:'種', stages:['たね','芽ばえ','くきがのびる','かさのような穂'],
      fact:'パピルスはアフリカの水辺に生えます。長いくきの断面は三角形。くきの先では細い枝がかさのように広がります。古代エジプトでは、この植物から文字を書くための材料を作りました。',
      look:'パピルスのくきを輪切りにした写真を見つけて、断面の角を数えてみよう。',
      question:'パピルスのくきを輪切りにすると、断面はどんな形？',
      answers:['六角形','三角形','星形'], correct:1,
      source:'https://plants.ces.ncsu.edu/plants/cyperus-papyrus/common-name/egyptian-paper-reed/', sourceName:'ノースカロライナ州立大学'
    },
    {
      id:'silver-fern', name:'シルバーファーン', latin:'Alsophila dealbata', habitat:'ニュージーランドの森', group:'wild', family:'ヘゴ科',
      starterLabel:'胞子', stages:['胞子（ほうし）','小さな前葉体','若いシダ','銀色の葉の裏'],
      fact:'ニュージーランドの森で木のように大きく育つシダです。成長した葉を下から見上げると、裏が銀白色に見えます。葉の裏の小さなふくろには、仲間をふやす胞子（ほうし）ができます。',
      look:'葉を上から見た写真と、下から見上げた写真をならべてみよう。同じ葉の表と裏で、色はどうちがうかな？',
      question:'育ったシルバーファーンの葉は、どちらから見ると銀白色？',
      answers:['表から','葉の切り口から','裏から'], correct:2,
      source:'https://www.doc.govt.nz/Documents/getting-involved/students-and-teachers/native-tree-factsheets/silver-fern-info-sheet.pdf', sourceName:'ニュージーランド自然保護省'
    },
    {
      id:'wollemi', name:'ウォレミマツ', latin:'Wollemia nobilis', habitat:'オーストラリア南東部の深い谷', group:'wild', family:'ナンヨウスギ科',
      starterLabel:'種', stages:['たね','芽ばえ','若木','球果がつく'],
      fact:'オーストラリアの深い谷で見つかった木です。大きく育つと、幹の皮に丸いこぶがたくさん並びます。種にはうすい翼が1枚ついていて、風に運ばれます。',
      look:'ウォレミマツの幹の写真で、こぶの大きさやならび方を見てみよう。校庭の木の皮とはどうちがうかな？',
      question:'ウォレミマツの種が風で運ばれるのを助けるものは？',
      answers:['種についたうすい翼','くきの長いとげ','根の細かい毛'], correct:0,
      source:'https://www.nationalparks.nsw.gov.au/plants-and-animals/wollemi-pine', sourceName:'オーストラリア・ニューサウスウェールズ州国立公園局'
    },
    {
      id:'puya', name:'プヤ・ライモンディ', latin:'Puya raimondii', habitat:'南アメリカのアンデスの高地', group:'wild', family:'パイナップル科',
      starterLabel:'種', stages:['たね','芽ばえ','葉が輪にひろがる','花の塔がのびる'],
      fact:'アンデスの高地に育つパイナップルのなかまです。長い年月をかけて葉を広げ、花を咲かせるときには、塔のような長いくきを立ち上げます。そのくきには何千もの花がつきます。',
      look:'花がついた株の写真で、葉の集まりの高さと、花をつけたくきの高さを見くらべてみよう。',
      question:'プヤ・ライモンディの「花の塔」はどんなつくり？',
      answers:['花1つが大きくのびている','長いくきにたくさんの花がついている','何本もの木がからみ合っている'], correct:1,
      source:'https://news.berkeley.edu/2014/05/13/at-botanical-garden-bromeliad-fans-anticipate-a-rare-bloom/', sourceName:'カリフォルニア大学バークレー校'
    }
  );
})();
