(() => {
  'use strict';

  // The coordinates represent the area described, not the location of an individual plant.
  const regions = [
    {
      id:'asia', name:'アジア', lat:38, lon:99, climate:'水田と花だん、熱帯の島',
      description:'日本の田んぼや花だんから、インド洋にうかぶスリランカまで。人が育ててきた植物と、野生で育つ植物をたずねよう。',
      plants:[
        {
          id:'rice', place:'日本・新潟平野の水田', lat:37.8, lon:139,
          note:'信濃川と阿賀野川が運んだ水や土が、広い平野をつくりました。ここでは田んぼにイネを植え、コシヒカリなどのお米を育てています。',
          source:'https://www.city.niigata.lg.jp/business/shoku_hana/shokutohana/niigatanosyokutohana/syuruibetsu/komemochi/kome.html', sourceName:'新潟市'
        },
        {
          id:'cherry', place:'日本・青森県の弘前公園', lat:40.6, lon:140.5,
          note:'弘前公園には、昔の人が植えたソメイヨシノが今も育っています。この町では、リンゴの木を育てる技術がサクラの手入れにも生かされています。',
          source:'https://www.city.hirosaki.aomori.jp/gaiyou/bunkazai/ken/ken59.html', sourceName:'弘前市'
        },
        {
          id:'morning', place:'日本・東京の入谷（いりや）', lat:35.7, lon:139.8,
          note:'明治時代、入谷の植木屋さんたちは、大きな花やめずらしい花を咲かせるアサガオを育てました。今もこの町で朝顔市が開かれます。',
          source:'https://t-navi.city.taito.lg.jp/event/1437', sourceName:'台東区'
        },
        {
          id:'loofah', place:'日本・沖縄県の南風原町', lat:26.2, lon:127.7,
          note:'沖縄本島の南風原町（はえばるちょう）はヘチマの産地です。沖縄では、まだやわらかい実を夏野菜として食べています。',
          source:'https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/47_16_okinawa.html', sourceName:'農林水産省'
        },
        {
          id:'balsam', place:'スリランカ', lat:7.5, lon:80.7,
          note:'学校の花だんでおなじみのホウセンカ。インドの南にある島国スリランカは、ホウセンカが野生で育ってきた場所の一つです。',
          source:'https://powo.science.kew.org/taxon/373978-1', sourceName:'英国王立植物園キュー'
        }
      ]
    },
    {
      id:'africa', name:'アフリカ', lat:4, lon:21, climate:'海岸砂漠とサバンナ、湖の湿地',
      description:'砂漠にきりがかかる海岸、太い木が育つ草原、草がしげる湖の岸。水との付き合い方を見くらべよう。',
      plants:[
        {
          id:'baobab', place:'南アフリカ・リンポポ州', lat:-22.8, lon:30,
          note:'アフリカ南部の暑く乾いた土地に自生する木です。リンポポ州には、幹がとても太く育った古いバオバブがいくつもあります。',
          source:'https://pza.sanbi.org/adansonia-digitata', sourceName:'南アフリカ国立生物多様性研究所'
        },
        {
          id:'welwitschia', place:'ナミビア・ナミブ砂漠', lat:-22, lon:15,
          note:'大西洋にそったナミブ砂漠には、海からきりが入る細長い帯のような地域があります。ウェルウィッチアが自生する場所は、このきりの帯に重なります。',
          source:'https://pza.sanbi.org/welwitschia-mirabilis', sourceName:'南アフリカ国立生物多様性研究所'
        },
        {
          id:'papyrus', place:'ウガンダ・ビクトリア湖のマバンバ湾', lat:0.1, lon:32.4,
          note:'ビクトリア湖の北がわに、細長い湾と湿地が広がっています。岸にはパピルスがしげり、水鳥がくらす場所にもなっています。',
          source:'https://rsis.ramsar.org/sites/default/files/rsiswp_search/exports/Ramsar-Sites-annotated-summary-Uganda.pdf', sourceName:'ラムサール条約湿地情報サービス'
        }
      ]
    },
    {
      id:'europe', name:'ヨーロッパ', lat:49, lon:13, climate:'高山の岩場と山すその畑',
      description:'アルプスの高い岩場には野生の花が咲き、ピレネー山脈のふもとでは畑の作物が育ちます。',
      plants:[
        {
          id:'edelweiss', place:'スイス・アルプス山脈', lat:46.5, lon:9,
          note:'高い山にある、石まじりの草地や岩場がエーデルワイスのすみかです。平地から山を登ると、出会える草花も変わります。',
          source:'https://www.infoflora.ch/de/flora/leontopodium-alpinum.html', sourceName:'スイス植物情報センター InfoFlora'
        },
        {
          id:'bean', place:'フランス・タルブ平野の畑', lat:43.3, lon:0.1,
          note:'ここでは白いインゲンマメが何世代にもわたって栽培されてきました。昔からトウモロコシのくきを支柱にして、マメのつるをのぼらせます。',
          source:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026XC00193', sourceName:'欧州連合官報'
        }
      ]
    },
    {
      id:'north-america', name:'北アメリカ', lat:39, lon:-103, climate:'平原・砂漠・山地の森',
      description:'同じアメリカ合衆国でも、中央部の平原と南西部の砂漠、西の山の森では、野生の植物のすがたが大きく変わります。',
      plants:[
        {
          id:'saguaro', place:'アメリカ・アリゾナ州のソノラ砂漠', lat:32.2, lon:-111,
          note:'ツーソンの町をはさむサワロ国立公園では、大きなサワロサボテンが野生で育ちます。同じ砂漠には、形のちがうサボテンもたくさん生えています。',
          source:'https://www.nps.gov/sagu/learn/nature/cacti-and-desert-succulents.htm', sourceName:'米国国立公園局'
        },
        {
          id:'sunflower', place:'アメリカ・カンザス州の平原', lat:38.6, lon:-100,
          note:'カンザス州の西部では、道ばたにも野生のヒマワリが咲きます。野生のものは、くきが何本にも枝分かれして花をつけることがあります。',
          source:'https://ag.missouristate.edu/PBTrewatha/annual-sunflower.htm', sourceName:'ミズーリ州立大学'
        },
        {
          id:'sequoia', place:'アメリカ・シエラネバダ山脈', lat:36.6, lon:-118.8,
          note:'カリフォルニア州のシエラネバダ山脈では、西向きのしゃ面にジャイアントセコイアの林があります。ほかの針葉樹といっしょに育つ森です。',
          source:'https://www.nps.gov/seki/planyourvisit/sequoiagroves.htm', sourceName:'米国国立公園局'
        }
      ]
    },
    {
      id:'south-america', name:'南アメリカ', lat:-14, lon:-58, climate:'熱帯の森・川とアンデスの高地',
      description:'アマゾン川流域では森と水辺に、アンデス山脈でははるかに高い土地に、それぞれの場所に合った植物が育ちます。',
      plants:[
        {
          id:'giant-lily', place:'ブラジル・アマゾン川流域', lat:-3.2, lon:-60,
          note:'アマゾン川流域の流れがおだやかな水辺に自生します。陸の木々が葉を空に広げる一方で、オオオニバスは丸い葉を水面に広げます。',
          source:'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:605776-1/general-information', sourceName:'英国王立植物園キュー'
        },
        {
          id:'cacao', place:'コロンビア・アマゾン川流域', lat:-2, lon:-71,
          note:'アマゾン川が集める水は、いくつもの国から流れてきます。コロンビア南部のアマソナス県も、野生のカカオの分布域にふくまれます。',
          source:'https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:320783-2/general-information', sourceName:'英国王立植物園キュー'
        },
        {
          id:'puya', place:'ペルー・アンデス山脈のアンカシュ県', lat:-9.5, lon:-77.5,
          note:'アンデスの高地には、プヤ・ライモンディが集まって育つところがあります。ペルーのワスカラン国立公園もその一つです。',
          source:'https://puyaraimondii.inaigem.gob.pe/', sourceName:'ペルー国立氷河・山岳生態系研究所'
        }
      ]
    },
    {
      id:'oceania', name:'オセアニア', lat:-25, lon:135, climate:'島の森と大陸の深い谷',
      description:'海をへだてたニュージーランドとオーストラリア。島に育つ大きなシダと、深い谷に残った木をたずねよう。',
      plants:[
        {
          id:'silver-fern', place:'ニュージーランド・北島の森', lat:-38, lon:176,
          note:'北島などの森や低い木のしげみで育つ、ニュージーランド固有のシダです。大きくなった葉の裏の銀色は、暗い森でも目を引きます。',
          source:'https://www.nzpcn.org.nz/flora/species/alsophila-dealbata/', sourceName:'ニュージーランド植物保全ネットワーク'
        },
        {
          id:'wollemi', place:'オーストラリア・ニューサウスウェールズ州', lat:-32, lon:147,
          note:'この州の深い谷に、野生のウォレミマツが残っています。かずの少ない木を守るため、自生地のくわしい場所はひみつです。地図は州のおおよその位置を示しています。',
          source:'https://www.nationalparks.nsw.gov.au/plants-and-animals/wollemi-pine', sourceName:'ニューサウスウェールズ州国立公園局'
        }
      ]
    }
  ];

  const sites = new Map();
  for (const region of regions) {
    for (const plant of region.plants) sites.set(plant.id, {region, plant});
  }
  window.GardenRegions = {regions, forSpecies: id => sites.get(id) || null};
})();
