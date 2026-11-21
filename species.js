(() => {
  'use strict';
  const species = [
    {
      id:'sunflower', name:'ヒマワリ', latin:'Helianthus annuus', habitat:'学校の花だん', group:'school', family:'キク科',
      fact:'ヒマワリの大きな花をよく見ると、まんなかに小さな花がぎっしり。一つの花に見えるところに、たくさんの花が集まっています。',
      question:'ヒマワリのまんなかに、ぎっしり集まっているのは？', answers:['小さな葉','小さな花','細かい根'], correct:1,
      look:'花のまんなかを、外がわから内がわへ見てみよう。小さな花の形にちがいはあるかな？',
      stages:['たね','芽ばえ','葉がひろがる','花が咲く'], source:'https://www2.u-gakugei.ac.jp/~planttgu/dokodemo/pc/066.htm', sourceName:'東京学芸大学'
    },
    {
      id:'morning', name:'アサガオ', latin:'Ipomoea nil', habitat:'学校の花だん', group:'school', family:'ヒルガオ科',
      fact:'アサガオの細長いくきは「つる」とよびます。つるが支柱などに巻きつくと、葉を高いところまで広げられます。',
      question:'アサガオが上へのびるとき、支柱に巻きつく部分は？', answers:['つる','花びら','根'], correct:0,
      look:'つるの先の位置を、朝と夕方にくらべてみよう。支柱のどこまでのびたかな？',
      stages:['たね','芽ばえ','つるがのびる','花が咲く'], source:'https://staff.fukuoka-edu.ac.jp/fukuhara/keitai/asagao.html', sourceName:'福岡教育大学'
    },
    {
      id:'bean', name:'インゲンマメ', latin:'Phaseolus vulgaris', habitat:'学校の畑', group:'school', family:'マメ科',
      fact:'インゲンマメの種が芽を出すには、水・空気・ちょうどよい温度が必要です。芽を出すときは、子葉にたくわえた養分を使います。',
      question:'インゲンマメが芽を出すときに使う養分は、どこにある？', answers:['まわりの石','花びら','種の中の子葉'], correct:2,
      look:'芽を出したあとの子葉と、あとから出た葉を見くらべよう。形や厚さはどうちがうかな？',
      stages:['たね','芽ばえ','葉がひろがる','さやが育つ'], source:'https://www.mext.go.jp/component/a_menu/education/micro_detail/__icsFiles/afieldfile/2012/01/12/1304649_20_1.pdf', sourceName:'文部科学省'
    },
    {
      id:'balsam', name:'ホウセンカ', latin:'Impatiens balsamina', habitat:'学校の花だん', group:'school', family:'ツリフネソウ科',
      fact:'ホウセンカの実は、じゅくすとはじけて種を飛ばします。じっと立ったままでも、親からはなれた場所に種を運べます。',
      question:'じゅくしたホウセンカの実は、どうやって種を広げる？', answers:['水にうかぶ','はじけて飛ばす','羽で飛ぶ'], correct:1,
      look:'くきのどのあたりに花がついているかな？ 横からのぞいてみよう。',
      stages:['たね','芽ばえ','葉がひろがる','花が咲く'], source:'https://staff.fukuoka-edu.ac.jp/fukuhara/keitai/8-2.html', sourceName:'福岡教育大学'
    },
    {
      id:'baobab', name:'バオバブ', latin:'Adansonia digitata', habitat:'アフリカのサバンナ', group:'wild', family:'アオイ科',
      fact:'アフリカのサバンナに育つバオバブは、太い幹に水をたくわえます。雨の少ない季節を生きぬくためのしくみです。',
      question:'バオバブがたくさんの水をたくわえるところは？', answers:['太い幹','花びら','実の皮'], correct:0,
      look:'幹の太さと、枝の細さをくらべてみよう。学校の木と、どこがちがうかな？',
      stages:['たね','芽ばえ','若木','幹が太る'], source:'https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A558628-1/general-information', sourceName:'英国王立植物園キュー'
    },
    {
      id:'welwitschia', name:'ウェルウィッチア', latin:'Welwitschia mirabilis', habitat:'ナミブ砂漠', group:'wild', family:'ウェルウィッチア科',
      fact:'ナミブ砂漠のウェルウィッチアは、一生のあいだ、2枚の本葉を根もとからのばしつづけます。先がさけると、何枚もあるように見えます。',
      question:'ウェルウィッチアがのばしつづける本葉は何枚？', answers:['2枚','10枚','100枚'], correct:0,
      look:'帯のような葉の先から根もとへ、目でたどってみよう。何枚の葉につながっているかな？',
      stages:['たね','芽ばえ','本葉がのびる','長い帯の葉'], source:'https://www.kew.org/plants/welwitschia-mirabilis', sourceName:'英国王立植物園キュー'
    }
  ];
  window.GardenData = {species, get:id => species.find(item => item.id === id)};
})();
