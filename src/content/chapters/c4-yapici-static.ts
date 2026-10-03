import type { Chapter } from '../../engine/types'

export const yapiciStatic: Chapter = {
  id: 'yapici-static',
  title: 'Yapıcılar ve static',
  subtitle: 'Constructor, destructor ve sınıf düzeyindeki üyeler',
  unit: 3,
  icon: '🏗️',
  color: '#fb7185',
  levels: [
    {
      id: 'yapici-1',
      title: 'Yapıcı Metot Nedir?',
      ref: '3.4',
      cards: [
        {
          icon: '🏗️',
          title: 'Constructor',
          body: '**Yapıcı metot**, nesne `new` ile oluşturulurken **otomatik olarak çalışan** metottur. Nesnenin ilk değerlerini vermek için kullanılır.\n• Adı **sınıf adıyla aynıdır**.\n• **Dönüş türü yoktur** (void bile yazılmaz).\n• Aşırı yüklenebilir.\n• Hiç yazılmazsa C# parametresiz bir varsayılan yapıcı oluşturur.',
          code: 'class Ogrenci\n{\n    public string ad;\n\n    public Ogrenci(string ad)\n    {\n        this.ad = ad;\n    }\n}\n\nOgrenci o = new Ogrenci("Ali");',
        },
      ],
      task: {
        kind: 'quiz',
        question: 'Yapıcı metotlar (constructor) için aşağıdakilerden hangisi **yanlıştır**?',
        options: [
          'Sınıf adı ile aynı ada sahip olmalıdır.',
          'Nesne oluşturulurken otomatik çalışır.',
          'Aşırı yüklenebilir.',
          'Dönüş türü olarak void yazılmalıdır.',
          'Bir sınıfta yalnızca bir tane statik yapıcı metot olabilir.',
        ],
        answer: 3,
        explain: 'Yapıcı metotların dönüş türü yoktur; void dâhil hiçbir tür yazılmaz. void yazılırsa derleyici onu yapıcı değil sıradan bir metot sanar ve "üye adı, içinde bulunduğu türün adıyla aynı olamaz" hatası verir.',
      },
    },
    {
      id: 'yapici-2',
      title: 'Yapıcı Yaz',
      ref: '3.4',
      cards: [
        {
          icon: '🎁',
          title: 'Nesneyi hazır üretmek',
          body: 'Yapıcı metot sayesinde nesne oluşturulduğu anda gerekli bilgiler verilir; böylece eksik bilgili (adı olmayan bir öğrenci gibi) nesneler oluşmaz.',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Ogrenci sınıfına `string ad` ve `int numara` parametreleri alan public bir yapıcı metot ekle. Yapıcı, gelen değerleri alanlara aktarsın. Main içinde `new Ogrenci("Elif", 101)` ile bir nesne oluştur.',
        starter: 'class Ogrenci\n{\n    private string ad;\n    private int numara;\n\n    public string Ad { get { return ad; } }\n\n    // yapıcı metodu yaz\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n\n    }\n}\n',
        solution: 'class Ogrenci\n{\n    private string ad;\n    private int numara;\n\n    public string Ad { get { return ad; } }\n\n    public Ogrenci(string ad, int numara)\n    {\n        this.ad = ad;\n        this.numara = numara;\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Ogrenci ogr = new Ogrenci("Elif", 101);\n        Console.WriteLine(ogr.Ad);\n    }\n}\n',
        rules: [
          { t: 'ctor', goal: 'public Ogrenci(string ad, int numara) yapıcısı', cls: 'Ogrenci', params: ['string', 'int'] },
          { t: 'ctor', goal: 'Yapıcı, parametreleri alanlara aktarsın (this.ad = ad;)', cls: 'Ogrenci', params: ['string', 'int'], bodyHas: ['this.ad = ad;', 'this.numara = numara;'] },
          { t: 'new', goal: 'new Ogrenci("Elif", 101) ile nesne oluştur', type: 'Ogrenci', args: 2 },
        ],
        explain: 'Sınıfta parametreli bir yapıcı yazdığında C# artık varsayılan parametresiz yapıcıyı oluşturmaz. new Ogrenci() yazmayı dene: CS1729 hatası alırsın!',
        output: 'Elif',
      },
      hints: ['public Ogrenci(string ad, int numara) { this.ad = ad; this.numara = numara; }'],
    },
    {
      id: 'yapici-3',
      title: 'Hata Avcısı: Yapıcı Tuzakları',
      ref: '3.4',
      cards: [
        {
          icon: '🪤',
          title: 'Sık yapılan hatalar',
          body: 'Yapıcıya dönüş türü yazmak, parametreli yapıcı varken parametresiz nesne oluşturmaya çalışmak ve yıkıcı metoda erişim belirleyici yazmak sık yapılan hatalardır.',
        },
      ],
      task: {
        kind: 'bug',
        prompt: 'Bu kodda derleme hatasına neden olan **üç** satırı bul.',
        code: 'class Araba\n{\n    private string marka;\n\n    public Araba(string marka)\n    {\n        this.marka = marka;\n    }\n\n    public void Araba()\n    {\n        marka = "Bilinmiyor";\n    }\n\n    public ~Araba()\n    {\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Araba a1 = new Araba("Togg");\n        Araba a2 = new Araba();\n    }\n}',
        bugLines: [10, 15, 25],
        explain: 'Satır 10: Yapıcının dönüş türü olmaz; void yazınca sınıf adıyla aynı isimde bir metot olur (CS0542). Satır 15: Yıkıcı metotta erişim belirleyici kullanılamaz (CS0106). Satır 25: Sınıfta parametresiz yapıcı olmadığı için new Araba() yazılamaz (CS1729).',
      },
    },
    {
      id: 'yapici-4',
      title: 'Yapıcı Zinciri',
      ref: '3.4',
      cards: [
        {
          icon: '⛓️',
          title: 'this(...) ile yapıcı çağırmak',
          body: 'Bir yapıcı, aynı sınıftaki başka bir yapıcıyı `: this(...)` ile çağırabilir. Bu durumda **önce çağrılan yapıcı** çalışır, ardından kendi gövdesi çalışır. Kod tekrarını azaltır.',
          code: 'public Kutu() : this(10)\n{\n    ...\n}',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Program ekrana ne yazar?',
        code: 'class Kutu\n{\n    public Kutu() : this(5)\n    {\n        Console.WriteLine("A");\n    }\n\n    public Kutu(int boyut)\n    {\n        Console.WriteLine("B" + boyut);\n    }\n}\n\n// Main içinde:\nKutu k1 = new Kutu();\nKutu k2 = new Kutu(8);',
        answers: ['B5\nA\nB8'],
        explain: 'new Kutu() parametresiz yapıcıyı seçer; o da önce this(5) ile diğer yapıcıyı çalıştırır ("B5"), sonra kendi gövdesini ("A"). new Kutu(8) doğrudan parametreli yapıcıyı çalıştırır ("B8").',
      },
    },
    {
      id: 'yapici-5',
      title: 'Yıkıcı Metot',
      ref: '3.4',
      cards: [
        {
          icon: '🧹',
          title: 'Destructor',
          body: '**Yıkıcı metot**, nesne bellekten silinirken otomatik çalışır. Adı sınıf adının başına **~ (tilde)** eklenerek yazılır. C# dilinde bellek temizliğini **Çöp Toplayıcı (Garbage Collector)** yapar; yıkıcının tam olarak ne zaman çalışacağı önceden bilinemez.',
          code: '~Ogrenci()\n{\n    Console.WriteLine("Nesne silindi");\n}',
        },
      ],
      task: {
        kind: 'match',
        prompt: 'Her özelliği ait olduğu metot türüyle eşleştir.',
        pairs: [
          { left: 'Adı ~ (tilde) karakteri ile başlar', right: 'Yıkıcı metot' },
          { left: 'Parametre alabilir ve aşırı yüklenebilir', right: 'Yapıcı metot' },
          { left: 'Sınıfa ilk erişildiğinde bir kez çalışır', right: 'Statik yapıcı metot' },
          { left: 'Değer döndürür, adı serbestçe seçilir', right: 'Sıradan metot' },
        ],
        explain: 'Yapıcı ve yıkıcı metotların ikisinin de dönüş türü yoktur ve adları sınıf adıyla aynıdır. Yıkıcı ~ ile başlar, parametre almaz ve bir sınıfta yalnızca bir tane olabilir.',
      },
    },
    {
      id: 'yapici-6',
      title: 'static: Sınıfın Ortak Malı',
      ref: '3.4',
      cards: [
        {
          icon: '🌐',
          title: 'Statik üyeler',
          body: 'Normal (örnek) alanlar **her nesnede ayrı ayrı** bulunur. **static** alanlar ise **sınıfa aittir**, tek bir kopyası vardır ve tüm nesneler onu paylaşır. Statik üyelere nesne oluşturmadan, doğrudan **sınıf adı ile** erişilir.',
          code: 'class Ogrenci\n{\n    public static int sayac = 0;\n    public Ogrenci() { sayac++; }\n}\n\nConsole.WriteLine(Ogrenci.sayac);',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Program ekrana ne yazar? (Her değer ayrı satırda)',
        code: 'class Sayac\n{\n    public static int toplam = 0;\n    public int benim = 0;\n\n    public void Artir()\n    {\n        toplam++;\n        benim++;\n    }\n}\n\n// Main içinde:\nSayac a = new Sayac();\nSayac b = new Sayac();\na.Artir();\na.Artir();\nb.Artir();\nConsole.WriteLine(a.benim);\nConsole.WriteLine(b.benim);\nConsole.WriteLine(Sayac.toplam);',
        answers: ['2\n1\n3'],
        explain: 'benim alanı her nesnede ayrıdır: a için 2, b için 1. toplam ise static olduğu için tek bir ortak değişkendir ve üç Artir() çağrısının hepsinde artar: 3.',
      },
    },
    {
      id: 'yapici-7',
      title: 'Nesne Sayacı',
      ref: '3.4',
      cards: [
        {
          icon: '🔢',
          title: 'Kaç nesne üretildi?',
          body: 'Static bir alanı yapıcı metot içinde artırarak sınıftan kaç nesne üretildiğini sayabilirsin. Statik bir metottan yalnızca statik üyelere doğrudan erişilebilir.',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Televizyon sınıfına `private static int uretilenSayisi` alanı ekle. Parametresiz public yapıcı her çalıştığında bu alanı 1 artırsın. Değeri döndüren `public static int UretilenSayisi()` metodunu yaz. Main içinde 3 televizyon üretip `Televizyon.UretilenSayisi()` sonucunu yazdır.',
        starter: 'class Televizyon\n{\n\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n\n    }\n}\n',
        solution: 'class Televizyon\n{\n    private static int uretilenSayisi = 0;\n\n    public Televizyon()\n    {\n        uretilenSayisi++;\n    }\n\n    public static int UretilenSayisi()\n    {\n        return uretilenSayisi;\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Televizyon t1 = new Televizyon();\n        Televizyon t2 = new Televizyon();\n        Televizyon t3 = new Televizyon();\n        Console.WriteLine(Televizyon.UretilenSayisi());\n    }\n}\n',
        rules: [
          { t: 'field', goal: 'private static int uretilenSayisi alanı', cls: 'Televizyon', name: 'uretilenSayisi', type: 'int', access: 'private', static: true },
          { t: 'ctor', goal: 'Parametresiz yapıcı sayacı artırsın', cls: 'Televizyon', params: 0, static: false },
          { t: 'source', goal: 'Yapıcıda uretilenSayisi bir artırılsın', regex: 'uretilenSayisi\\s*(\\+\\+|\\+=\\s*1|=\\s*uretilenSayisi\\s*\\+\\s*1)|\\+\\+\\s*uretilenSayisi' },
          { t: 'method', goal: 'public static int UretilenSayisi() metodu', cls: 'Televizyon', name: 'UretilenSayisi', returns: 'int', static: true, access: 'public', bodyHas: ['return uretilenSayisi;'] },
          { t: 'new', goal: '3 televizyon nesnesi üret', type: 'Televizyon', min: 3 },
          { t: 'source', goal: 'Televizyon.UretilenSayisi() ile sonucu yazdır', has: ['Televizyon.UretilenSayisi()'] },
        ],
        explain: 'Statik metot sınıf adıyla çağrılır: Televizyon.UretilenSayisi(). Bu metodun içinden statik olmayan bir alana erişmeye çalışsaydın CS0120 hatası alırdın.',
        output: '3',
      },
      hints: ['public Televizyon() { uretilenSayisi++; }', 'public static int UretilenSayisi() { return uretilenSayisi; }'],
    },
    {
      id: 'yapici-8',
      title: 'Bölüm Sonu: static mi, değil mi?',
      boss: true,
      xp: 20,
      ref: '3.4',
      cards: [
        {
          icon: '🧠',
          title: 'Statik kuralları',
          body: '• Statik üyelere sınıf adı ile erişilir (`Math.PI`, `Console.WriteLine`).\n• Statik metot içinde **this** kullanılamaz.\n• Statik metot, aynı sınıfın statik olmayan üyelerine doğrudan erişemez.\n• **Statik yapıcı** sınıfa ilk erişildiğinde bir kez çalışır; parametre ve erişim belirleyici almaz.',
        },
      ],
      task: {
        kind: 'bug',
        prompt: 'Derleme hatası veren **üç** satırı bul.',
        code: 'class Okul\n{\n    public static string okulAdi = "Atatürk MTAL";\n    public string ogrenciAdi;\n\n    public static void Yazdir()\n    {\n        Console.WriteLine(okulAdi);\n        Console.WriteLine(ogrenciAdi);\n        Console.WriteLine(this.ogrenciAdi);\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Okul.Yazdir();\n        Okul o = new Okul();\n        o.ogrenciAdi = "Zeynep";\n        Console.WriteLine(o.okulAdi);\n    }\n}',
        bugLines: [9, 10, 21],
        explain: 'Satır 9: Statik metot, statik olmayan ogrenciAdi alanına erişemez (CS0120). Satır 10: Statik bağlamda this kullanılamaz (CS0026). Satır 21: Statik alana nesne üzerinden değil sınıf adıyla erişilir: Okul.okulAdi (CS0176).',
      },
    },
  ],
}
