import type { Chapter } from '../../engine/types'

export const kapsulleme: Chapter = {
  id: 'kapsulleme',
  title: 'Kapsülleme',
  subtitle: 'Erişim belirleyiciler ve özellikler (get / set)',
  unit: 3,
  icon: '💊',
  color: '#a78bfa',
  levels: [
    {
      id: 'kapsul-1',
      title: 'Erişim Belirleyiciler',
      ref: '3.2',
      cards: [
        {
          icon: '🔐',
          title: 'Kim neye erişebilir?',
          body: '**public**: Sınıf ögelerine her yerden erişilebilir.\n**private**: Ögelere yalnızca sınıfın kendi içinden erişilebilir. Sınıf üyelerinde erişim belirleyici yazılmazsa varsayılan **private**tır.\n**protected**: Sınıfın kendisi ve ondan türetilen alt sınıflar erişebilir.',
        },
        {
          icon: '💊',
          title: 'Kapsülleme (Encapsulation)',
          body: 'Bir ilaç kapsülü içindekini dış etkilerden korur. Kapsülleme de nesnenin verilerini **private** yaparak dış dünyadan gizler ve verilere yalnızca kontrollü yollarla (özellikler, metotlar) ulaşılmasını sağlar. Böylece kimse ses seviyesini -50 yapamaz!',
        },
      ],
      task: {
        kind: 'quiz',
        question: 'Sınıf içindeki bir değişkeni dış dünyaya kapatıp **yalnızca sınıf içinde ve bu sınıftan türetilen alt sınıflarda** kullanılabilir kılmak için hangi erişim belirleyici kullanılmalıdır?',
        options: ['public', 'private', 'protected', 'static', 'sealed'],
        answer: 2,
        explain: 'protected üyeler sınıfın kendisi ve alt sınıfları tarafından kullanılabilir; dışarıdan erişilemez. private yalnızca sınıfın kendisine, public ise herkese açıktır.',
      },
    },
    {
      id: 'kapsul-2',
      title: 'Hata Avcısı: Gizli Alan',
      ref: '3.2',
      cards: [
        {
          icon: '🚫',
          title: 'Koruma düzeyi hatası',
          body: 'private bir üyeye sınıf dışından erişmeye çalışırsan derleyici şu hatayı verir: **CS0122: \'Televizyon.sesSeviyesi\' koruma düzeyi nedeniyle erişilemez.**',
        },
      ],
      task: {
        kind: 'bug',
        prompt: 'Bu kodda derleme hatasına neden olan satırları bul.',
        code: 'class Televizyon\n{\n    private int sesSeviyesi;\n    int kanalNo;\n    public string marka;\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Televizyon tv = new Televizyon();\n        tv.marka = "Arçelik";\n        tv.sesSeviyesi = 20;\n        tv.kanalNo = 5;\n    }\n}',
        bugLines: [14, 15],
        fix: {
          question: 'Bu alanlara güvenli bir şekilde dışarıdan erişim sağlamanın **en doğru** yolu hangisidir?',
          options: [
            'Alanları public yapmak',
            'Alanlar private kalsın; dışarıya get/set içeren public özellikler (property) açmak',
            'Alanları static yapmak',
            'Main metodunu Televizyon sınıfının içine taşımak',
          ],
          answer: 1,
        },
        explain: 'sesSeviyesi açıkça private, kanalNo ise erişim belirleyici yazılmadığı için varsayılan olarak private\'tır. Kapsüllemenin doğru yolu alanları private bırakıp public özellikler üzerinden kontrollü erişim sağlamaktır.',
      },
    },
    {
      id: 'kapsul-3',
      title: 'get ve set',
      ref: '3.2',
      cards: [
        {
          icon: '🚪',
          title: 'Özellik (Property)',
          body: 'Özellikler, private alanlara açılan kontrollü kapılardır. **get** bloğu değeri okurken, **set** bloğu değer atanırken çalışır. set bloğunda atanmak istenen değer **value** anahtar sözcüğüyle alınır.',
          code: 'private int sesSeviyesi;\n\npublic int SesSeviyesi\n{\n    get { return sesSeviyesi; }\n    set { sesSeviyesi = value; }\n}',
        },
        {
          icon: '🔤',
          title: 'İsimlendirme geleneği',
          body: 'Alan adı küçük harfle (`sesSeviyesi`), ona ait özellik büyük harfle (`SesSeviyesi`) başlar. Kullanım: `tv.SesSeviyesi = 30;` → set çalışır, `Console.WriteLine(tv.SesSeviyesi);` → get çalışır.',
        },
      ],
      task: {
        kind: 'fill',
        prompt: 'Televizyon sınıfının EkranBoyutu özelliğini tamamla.',
        code: 'class Televizyon\n{\n    [[0]] double ekranBoyutu;\n\n    public double EkranBoyutu\n    {\n        [[1]] { return ekranBoyutu; }\n        set { ekranBoyutu = [[2]]; }\n    }\n}',
        blanks: [
          { accept: ['private'], width: 7 },
          { accept: ['get'], width: 3 },
          { accept: ['value'], width: 5 },
        ],
        explain: 'Alan private ile gizlenir. get bloğu return ile alanın değerini döndürür; set bloğunda atanan değer value sözcüğüyle alana aktarılır.',
      },
    },
    {
      id: 'kapsul-4',
      title: 'Akıllı set Bloğu',
      ref: '3.2',
      cards: [
        {
          icon: '🛡️',
          title: 'Geçersiz değerlere karşı koruma',
          body: 'set bloğu içinde **kontrol** yapabilirsin. Böylece nesne hiçbir zaman geçersiz bir duruma düşmez. Kapsüllemenin asıl gücü budur.',
          code: 'set\n{\n    if (value >= 0)\n        fiyat = value;\n}',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Televizyon sınıfına private `int sesSeviyesi` alanı ve public `SesSeviyesi` özelliğini ekle. set bloğu yalnızca **0 ile 100 arasındaki** (0 ve 100 dâhil) değerleri kabul etsin.',
        starter: 'class Televizyon\n{\n    \n}\n',
        solution: 'class Televizyon\n{\n    private int sesSeviyesi;\n\n    public int SesSeviyesi\n    {\n        get { return sesSeviyesi; }\n        set\n        {\n            if (value >= 0 && value <= 100)\n                sesSeviyesi = value;\n        }\n    }\n}\n',
        rules: [
          { t: 'field', goal: 'private int sesSeviyesi alanı', cls: 'Televizyon', name: 'sesSeviyesi', type: 'int', access: 'private' },
          { t: 'property', goal: 'public int SesSeviyesi özelliği (get ve set)', cls: 'Televizyon', name: 'SesSeviyesi', type: 'int', access: 'public', get: true, set: true, auto: false },
          { t: 'property', goal: 'get bloğu alanın değerini döndürsün', cls: 'Televizyon', name: 'SesSeviyesi', bodyHas: ['return sesSeviyesi;'] },
          { t: 'source', goal: 'set bloğunda 0–100 aralık kontrolü yap', regex: '(value\\s*>=\\s*0|value\\s*>\\s*-1|0\\s*<=\\s*value|value\\s*<\\s*0)[\\s\\S]*(value\\s*<=\\s*100|value\\s*<\\s*101|100\\s*>=\\s*value|value\\s*>\\s*100)|(value\\s*<=\\s*100|value\\s*>\\s*100|100\\s*>=\\s*value)[\\s\\S]*(value\\s*>=\\s*0|value\\s*<\\s*0|0\\s*<=\\s*value)' },
          { t: 'property', goal: 'set içinde value ile alana atama yap', cls: 'Televizyon', name: 'SesSeviyesi', bodyHas: ['sesSeviyesi = value;'] },
        ],
        explain: 'Artık tv.SesSeviyesi = 150; yazıldığında değer kabul edilmez ve nesne geçerli durumda kalır. Dışarıdaki kod, sesSeviyesi alanına doğrudan dokunamaz.',
      },
      hints: ['set { if (value >= 0 && value <= 100) sesSeviyesi = value; }'],
    },
    {
      id: 'kapsul-5',
      title: 'Korunan Değer',
      ref: '3.2',
      cards: [
        {
          icon: '🧪',
          title: 'Test zamanı',
          body: 'Bir önceki görevde yazdığın sınıfı test edelim. set bloğundaki kontrol, geçersiz değerleri sessizce reddeder.',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'SesSeviyesi özelliği yalnızca 0–100 arasını kabul ediyor. Program ekrana ne yazar?',
        code: 'Televizyon tv = new Televizyon();\ntv.SesSeviyesi = 40;\ntv.SesSeviyesi = 150;\nConsole.WriteLine(tv.SesSeviyesi);\ntv.SesSeviyesi = -5;\ntv.SesSeviyesi = tv.SesSeviyesi + 20;\nConsole.WriteLine(tv.SesSeviyesi);',
        answers: ['40\n60'],
        explain: '150 ve -5 aralık dışında olduğu için reddedilir; değer 40 olarak kalır. Sonra 40 + 20 = 60 atanır ve kabul edilir.',
      },
    },
    {
      id: 'kapsul-6',
      title: 'Otomatik Özellikler',
      ref: '3.2',
      cards: [
        {
          icon: '⚡',
          title: 'Kısa yazım',
          body: 'get ve set bloklarında ek bir kontrol yapmayacaksan **otomatik özellik** kullanabilirsin. Derleyici arka planda gizli bir alan oluşturur.',
          code: 'public string Marka { get; set; }',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Kitaptaki **Bilgisayar** sınıfını otomatik özelliklerle yaz: `double RAMKapasitesi`, `string CPU` ve `double HdKapasitesi`. Hepsi public olsun ve get/set içersin.',
        starter: 'class Bilgisayar\n{\n\n}\n',
        solution: 'class Bilgisayar\n{\n    public double RAMKapasitesi { get; set; }\n    public string CPU { get; set; }\n    public double HdKapasitesi { get; set; }\n}\n',
        rules: [
          { t: 'property', goal: 'public double RAMKapasitesi { get; set; }', cls: 'Bilgisayar', name: 'RAMKapasitesi', type: 'double', access: 'public', get: true, set: true, auto: true },
          { t: 'property', goal: 'public string CPU { get; set; }', cls: 'Bilgisayar', name: 'CPU', type: 'string', access: 'public', get: true, set: true, auto: true },
          { t: 'property', goal: 'public double HdKapasitesi { get; set; }', cls: 'Bilgisayar', name: 'HdKapasitesi', type: 'double', access: 'public', get: true, set: true, auto: true },
        ],
        explain: 'Otomatik özellikler kodu kısaltır. İleride doğrulama eklemen gerekirse, özelliği get/set gövdeli hâle çevirebilirsin; sınıfı kullanan kodlar değişmez.',
      },
    },
    {
      id: 'kapsul-7',
      title: 'Bölüm Sonu: Salt Okunur Kanal',
      boss: true,
      xp: 20,
      ref: '3.2',
      cards: [
        {
          icon: '👁️',
          title: 'Yalnızca get',
          body: 'Bir özelliğin yalnızca **get** bloğu varsa o özellik **salt okunurdur**: dışarıdan okunabilir ama değiştirilemez. Değer yalnızca sınıfın kendi metotlarıyla değişir.',
          code: 'public int KanalNo\n{\n    get { return kanalNo; }\n}',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Televizyon sınıfında private `int kanalNo = 1` alanı, **yalnızca get** içeren public `KanalNo` özelliği ve kanalı bir artıran public `void KanalNoArtir()` metodu olsun. Main içinde bir televizyon oluştur, kanalı iki kez artır ve KanalNo değerini yazdır.',
        starter: 'class Televizyon\n{\n\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n\n    }\n}\n',
        solution: 'class Televizyon\n{\n    private int kanalNo = 1;\n\n    public int KanalNo\n    {\n        get { return kanalNo; }\n    }\n\n    public void KanalNoArtir()\n    {\n        kanalNo++;\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Televizyon tv = new Televizyon();\n        tv.KanalNoArtir();\n        tv.KanalNoArtir();\n        Console.WriteLine(tv.KanalNo);\n    }\n}\n',
        rules: [
          { t: 'field', goal: 'private int kanalNo alanı', cls: 'Televizyon', name: 'kanalNo', type: 'int', access: 'private' },
          { t: 'property', goal: 'KanalNo özelliği yalnızca get içersin', cls: 'Televizyon', name: 'KanalNo', type: 'int', access: 'public', get: true, set: false },
          { t: 'method', goal: 'public void KanalNoArtir() metodu', cls: 'Televizyon', name: 'KanalNoArtir', returns: 'void', params: 0, access: 'public' },
          { t: 'source', goal: 'KanalNoArtir kanalNo değerini 1 artırsın', regex: 'kanalNo\\s*(\\+\\+|\\+=\\s*1|=\\s*kanalNo\\s*\\+\\s*1)|\\+\\+\\s*kanalNo' },
          { t: 'call', goal: 'KanalNoArtir() metodunu iki kez çağır', member: 'KanalNoArtir', min: 2 },
          { t: 'call', goal: 'Sonucu Console.WriteLine ile yazdır', member: 'WriteLine' },
        ],
        explain: 'Main içinde tv.KanalNo = 5; yazmayı dene: derleyici CS0200 hatası verir çünkü özellik salt okunurdur. Kanal yalnızca sınıfın sunduğu metotla değiştirilebilir.',
        output: '3',
      },
      hints: ['public int KanalNo { get { return kanalNo; } }', 'public void KanalNoArtir() { kanalNo++; }'],
    },
  ],
}
