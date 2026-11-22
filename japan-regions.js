(() => {
  'use strict';

  // Share the four Japanese field sites already documented on the world map.
  function worldSite(id, setting) {
    const site = window.GardenRegions.forSpecies(id).plant;
    return {...site, setting, place: site.place.replace(/^日本・/, '')};
  }

  const regions = [
    {
      id:'hokkaido', name:'北海道', lat:43.3, lon:142.6, climate:'北の平地と火山のふもとの森',
      description:'勇払（ゆうふつ）原野には低い木が育ち、阿寒の山のふもとには針葉樹と広葉樹が混じる森が広がります。',
      plants:[
        {
          id:'haskap', place:'北海道・苫小牧市の勇払原野', lat:42.67, lon:141.75, setting:'自生地',
          note:'ウトナイ湖の近くにはハスカップが自生しています。草の間にまじって育つ低い木と、まわりの高い木のすがたを見くらべてみよう。',
          source:'https://www.city.tomakomai.hokkaido.jp/shizen/shizenhogo/sizenkankyo/kakuhozenchiku.html', sourceName:'苫小牧市'
        },
        {
          id:'ezomatsu', place:'北海道・阿寒の森', lat:43.43, lon:144.13, setting:'自生地',
          note:'雄阿寒岳や雌阿寒岳のふもとでは、エゾマツやトドマツと、幅の広い葉をつける木がいっしょに育っています。',
          source:'https://www.env.go.jp/nature/nationalparks/list/akan-mashu/feature/', sourceName:'環境省・阿寒摩周国立公園'
        }
      ]
    },
    {
      id:'tohoku', name:'東北', lat:39.6, lon:140.8, climate:'雪の多い森と高山の石原',
      description:'雪の多い山のブナ林、岩手山の石まじりの斜面、クリを育てる林。同じ東北でも場所によってちがう植物に出会えます。',
      plants:[
        {
          id:'beech', place:'青森県・秋田県の白神山地', lat:40.45, lon:140.14, setting:'自生地',
          note:'冬に雪がたくさん積もる白神山地には、広いブナの天然林があります。ブナが育つ森には、鳥やほかの植物もくらしています。',
          source:'https://tohoku.env.go.jp/nature/shirakami-sanchi/introduction/mandala.html', sourceName:'環境省・東北地方環境事務所'
        },
        {
          id:'komakusa', place:'岩手県・岩手山', lat:39.85, lon:141.0, setting:'自生地',
          note:'岩手山では、土よりも小石や砂が目立つ高い場所にコマクサが育ちます。岩手県では、数が少なくなったコマクサを守る研究もしています。',
          source:'https://www.pref.iwate.jp/_res/projects/default_project/_page_/001/015/818/kanpoken_kouhou_no7.pdf', sourceName:'岩手県環境保健研究センター'
        },
        {
          id:'katakuri', place:'秋田県・仙北市西木町のクリ林', lat:39.68, lon:140.57, setting:'自生地',
          note:'西明寺栗（さいみょうじぐり）を育てる林では、春に野生のカタクリがまとまって咲きます。人がクリの枝を切って手入れすると、地面にも日が届きます。',
          source:'https://www.city.semboku.akita.jp/sightseeing/spot/06_katakuri.html', sourceName:'仙北市'
        },
        worldSite('cherry','植栽地')
      ]
    },
    {
      id:'kanto', name:'関東', lat:36.16, lon:139.64, climate:'山の湿原と平地の池・庭園',
      description:'雪どけの尾瀬と、平野にある池では、水辺に育つ植物がちがいます。町には、人が大切に育ててきた花もあります。',
      plants:[
        {
          id:'morning-lotus', place:'埼玉県・行田市の古代蓮の里', lat:36.14, lon:139.5, setting:'植栽地',
          note:'園内の池では、この土地ゆかりの行田蓮（ぎょうだはす）が咲きます。ほかの品種も集めた池では、白い花や、花びらが何重にも重なる花と見くらべられます。',
          source:'https://ikiiki-zaidan.or.jp/kodaihasu/facility/ennai.html', sourceName:'古代蓮の里'
        },
        {
          id:'mizubasho', place:'群馬県・片品村の尾瀬ヶ原', lat:36.89, lon:139.18, setting:'自生地',
          note:'尾瀬ヶ原では、雪がとけるころ、湿原にミズバショウが顔を出します。木道を歩くと、白いすがたがいくつも並ぶ様子を見られます。',
          source:'https://oze-fnd.or.jp/archives/198028/', sourceName:'尾瀬保護財団・山の鼻ビジターセンター'
        },
        {
          id:'ume', place:'茨城県・水戸市の偕楽園', lat:36.37, lon:140.45, setting:'植栽地',
          note:'偕楽園（かいらくえん）には、多くの品種のウメが植えられています。同じウメでも、花びらの色や形にどんなちがいがあるかな。',
          source:'https://ibaraki-kairakuen.jp/zukan/', sourceName:'偕楽園'
        },
        worldSite('morning','栽培地')
      ]
    },
    {
      id:'chubu', name:'中部', lat:36.07, lon:137.57, climate:'山のわき水と平野の水田',
      description:'伊豆の山のわき水、新潟平野の田んぼ、愛知の庭園の池。水のある場所をたどって植物を見つけよう。',
      plants:[
        {
          id:'wasabi', place:'静岡県・伊豆市のわさび田', lat:34.9, lon:138.98, setting:'栽培地',
          note:'天城山のふもとでは、地面からわき出る冷たい水をわさび田に流します。ワサビの株の間を水が通るようにして育てています。',
          source:'https://www.pref.shizuoka.jp/sangyoshigoto/norinjimusho/tobunorin/1004172/1033935.html', sourceName:'静岡県'
        },
        {
          id:'kakitsubata', place:'愛知県・知立市の八橋かきつばた園', lat:35.0, lon:137.08, setting:'植栽地',
          note:'八橋（やつはし）では、お寺の庭にいくつもの池をつくり、カキツバタを育てています。水辺に並ぶ葉と、その上に開いた花を見てみよう。',
          source:'https://www.city.chiryu.aichi.jp/soshiki/siminkyodo/chiiki-suishin/gyomu/2/1/1445358955860.html', sourceName:'知立市'
        },
        worldSite('rice','栽培地')
      ]
    },
    {
      id:'kinki', name:'近畿', lat:34.96, lon:135.57, climate:'茶畑・川ぞいの土手と街路',
      description:'宇治の茶畑、井手町の川、大阪の大通り。それぞれの場所で、植物と人のくらしがどのようにつながっているかな。',
      plants:[
        {
          id:'tea', place:'京都府・宇治市の茶畑', lat:34.89, lon:135.8, setting:'栽培地',
          note:'玉露や抹茶のもとになる葉を育てる茶畑では、新芽がのびる時期に畑へおおいをかけます。葉に届く日光を加減するためです。',
          source:'https://www.city.uji.kyoto.jp/site/uji-cha/16203.html', sourceName:'宇治市'
        },
        {
          id:'yamabuki', place:'京都府・井手町の玉川', lat:34.8, lon:135.81, setting:'植栽地',
          note:'井手（いで）の玉川は、古くからヤマブキで知られてきました。川ぞいの土手では、春に黄色い花を見ることができます。',
          source:'https://www.town.ide.kyoto.jp/soshiki/kikakuzaiseika/gaiyou/1394443401093.html', sourceName:'井手町'
        },
        {
          id:'ginkgo', place:'大阪府・大阪市の御堂筋', lat:34.68, lon:135.5, setting:'植栽地',
          note:'大通りの御堂筋（みどうすじ）には、人が植えたイチョウが並びます。市では一本ずつ木の状態を調べ、記録をもとに手入れをしています。',
          source:'https://www.city.osaka.lg.jp/kensetsu/page/0000242811.html', sourceName:'大阪市'
        }
      ]
    },
    {
      id:'chugoku', name:'中国', lat:34.84, lon:132.89, climate:'日本海に面した林と内陸の庭園',
      description:'海に面した山口の森では野生のツバキが育ち、岡山の庭園には各地から集めたフジが植えられています。',
      plants:[
        {
          id:'camellia', place:'山口県・萩市の笠山', lat:34.46, lon:131.39, setting:'自生地',
          note:'日本海に突き出た笠山（かさやま）の先には、野生のヤブツバキが集まって育つ林があります。木の下から見上げて、花がどの枝についているかをさがしてみよう。',
          source:'https://www.hagishi.com/tsubaki_about/', sourceName:'萩市観光協会'
        },
        {
          id:'wisteria', place:'岡山県・和気町の藤公園', lat:34.82, lon:134.17, setting:'植栽地',
          note:'各地のフジを集めて育てた公園です。たなから垂れ下がる花の房には、長いものや短いもの、紫や白など色のちがうものがあります。',
          source:'https://www.town.wake.lg.jp/kanko_bunka_sports/event/1237.html', sourceName:'和気町'
        }
      ]
    },
    {
      id:'shikoku', name:'四国', lat:33.83, lon:133.57, climate:'山あいの果樹園と植物園',
      description:'徳島の果樹園ではスダチ、高知の植物園ではフジバカマに会えます。植物を育てる目的にもいろいろあります。',
      plants:[
        {
          id:'sudachi', place:'徳島県・神山町の果樹園', lat:33.97, lon:134.35, setting:'栽培地',
          note:'神山町（かみやまちょう）ではスダチを長く育ててきました。徳島県には、水はけのよい斜面を生かした果樹の栽培地があります。',
          source:'https://www.maff.go.jp/chushi/sesaku/kihon/touroku.html', sourceName:'農林水産省・中国四国農政局'
        },
        {
          id:'fujibakama', place:'高知県・高知市の牧野植物園', lat:33.55, lon:133.58, setting:'植栽地',
          note:'牧野植物園では、日本に昔からあるフジバカマを植えて育てています。秋に花が開くと、アサギマダラというチョウがみつを吸いに訪れることがあります。',
          source:'https://makinomigoro.jp/flower/flower-4930/', sourceName:'高知県立牧野植物園'
        }
      ]
    },
    {
      id:'kyushu', name:'九州・沖縄', lat:32.45, lon:130.93, climate:'雨の多い島の山と亜熱帯の河口',
      description:'屋久島の山ではスギの大木、沖縄の川と海が出会うところではヒルギの林が見られます。',
      plants:[
        {
          id:'mangrove', place:'沖縄県・東村の慶佐次湾', lat:26.61, lon:128.14, setting:'自生地',
          note:'慶佐次（げさし）川の河口では、川の水と海の水がまざります。そこにはオヒルギやメヒルギなど、何種類もの木がいっしょに育つマングローブ林があります。',
          source:'https://www.vill.higashi.okinawa.jp/kanko_bunka_sports/kankouspot/1087.html', sourceName:'東村'
        },
        {
          id:'sugi', place:'鹿児島県・屋久島の山地', lat:30.34, lon:130.52, setting:'自生地',
          note:'雨の多い屋久島では、山の中に野生のスギの森が広がっています。長い年月をかけて育った、樹齢千年をこえるヤクスギもあります。',
          source:'https://www.env.go.jp/nature/hozen/feature.html', sourceName:'環境省'
        },
        {
          id:'deigo', place:'沖縄県・沖縄本島の街路や公園', lat:26.23, lon:127.7, setting:'植栽地',
          note:'沖縄の県の花はデイゴです。街路や公園に植えられていて、春には深い赤色の花が目を引きます。',
          source:'https://www.pref.okinawa.jp/shigoto/kenkyu/1010919/1021637/1003010/1003096.html', sourceName:'沖縄県'
        },
        worldSite('loofah','栽培地')
      ]
    }
  ];

  const sites = new Map();
  for (const region of regions) {
    for (const plant of region.plants) sites.set(plant.id, {region, plant});
  }
  window.GardenJapan = {regions, forSpecies: id => sites.get(id) || null};
})();
