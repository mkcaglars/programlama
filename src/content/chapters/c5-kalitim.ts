import type { Chapter } from '../../engine/types'

export const kalitim: Chapter = {
  id: 'kalitim',
  title: 'Kalıtım',
  subtitle: 'Türetme, protected, base, virtual / override ve sealed',
  unit: 3,
  icon: '🧬',
  color: '#22d3ee',
  levels: [
    {
      id: 'kalitim-1',
      title: 'Aile Ağacı',
      ref: '3.5',
      cards: [
        {
          icon: '🧬',
          title: 'Kalıtım (Inheritance)',
          body: 'Kalıtım, bir sınıfın başka bir sınıfın üyelerini **devralmasıdır**. Devralan sınıfa **alt sınıf (türetilmiş sınıf)**, devredilen sınıfa **temel sınıf (üst sınıf)** denir. Alt sınıf, temel sınıfın tüm özelliklerine sahiptir ve **yeni özellikler ekleyebilir**.',
          code: 'class Televizyon { ... }\n\nclass AkilliTelevizyon : Televizyon\n{\n    public string IsletimSistemi { get; set; }\n}',
        },
        {
          icon: '🗣️',
          title: '"... bir ...dır" testi',
          body: 'Kalıtım ilişkisini kurmak için şu soruyu sor: "Akıllı televizyon **bir** televizyon**dur**." Cümle anlamlıysa kalıtım uygundur. "Kumanda bir televizyondur" anlamsızdır; bu yüzden Kumanda, Televizyon\'dan türetilmez.',
        },
      ],
      task: {
        kind: 'tree',
        prompt: 'Her sınıf için doğru **temel sınıfı** seçerek kalıtım ağacını kur.',
        root: 'Cihaz',
        classes: [
          { name: 'Televizyon', parent: 'Cihaz' },
          { name: 'Bilgisayar', parent: 'Cihaz' },
          { name: 'AkilliTelevizyon', parent: 'Televizyon', hint: 'Akıllı televizyon bir televizyondur.' },
          { name: 'DizustuBilgisayar', parent: 'Bilgisayar' },
          { name: 'OyunBilgisayari', parent: 'Bilgisayar' },
          { name: 'OledTelevizyon', parent: 'Televizyon' },
        ],
        explain: 'Her alt sınıf, en yakın "bir ...dır" ilişkisini kurduğu sınıftan türetilir. DizustuBilgisayar hem bir Bilgisayar hem de (dolaylı olarak) bir Cihazdır.',
      },
    },
    {
      id: 'kalitim-2',
      title: 'Türetme Sözdizimi',
      ref: '3.5',
      cards: [
        {
          icon: '➡️',
          title: 'İki nokta (:)',
          body: 'C# dilinde türetme, sınıf adından sonra **iki nokta (:)** ve temel sınıfın adı yazılarak yapılır. Alt sınıftan oluşturulan nesne, temel sınıfın public üyelerini kendi üyesiymiş gibi kullanır.',
        },
      ],
      task: {
        kind: 'fill',
        prompt: 'AkilliTelevizyon sınıfını Televizyon sınıfından türet ve nesnenin devraldığı metodu çağır.',
        code: 'class Televizyon\n{\n    public void GucAc() { Console.WriteLine("TV açıldı"); }\n}\n\nclass AkilliTelevizyon [[0]] [[1]]\n{\n    public void UygulamaAc(string ad) { Console.WriteLine(ad + " açıldı"); }\n}\n\nAkilliTelevizyon tv = new AkilliTelevizyon();\ntv.[[2]]();          // devralınan metot\ntv.UygulamaAc("YouTube");',
        blanks: [
          { accept: [':'], width: 1 },
          { accept: ['Televizyon'], width: 10 },
          { accept: ['GucAc'], width: 5 },
        ],
        explain: 'class AkilliTelevizyon : Televizyon yazıldığında AkilliTelevizyon, GucAc() metodunu yeniden yazmadan kullanabilir.',
      },
    },
    {
      id: 'kalitim-3',
      title: 'Hata Avcısı: private Miras Kalmaz',
      ref: '3.5',
      cards: [
        {
          icon: '🔏',
          title: 'protected',
          body: 'Temel sınıftaki **private** üyelere alt sınıf **erişemez**. Alt sınıfın erişmesini ama dış dünyanın erişmemesini istiyorsan **protected** kullanmalısın.',
        },
      ],
      task: {
        kind: 'bug',
        prompt: 'Derleme hatası veren satırları bul.',
        code: 'class Televizyon\n{\n    private int sesSeviyesi = 10;\n    protected int kanalNo = 1;\n}\n\nclass AkilliTelevizyon : Televizyon\n{\n    public void Sifirla()\n    {\n        kanalNo = 1;\n        sesSeviyesi = 0;\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        AkilliTelevizyon tv = new AkilliTelevizyon();\n        tv.Sifirla();\n        tv.kanalNo = 5;\n    }\n}',
        bugLines: [12, 22],
        fix: {
          question: 'Satır 12\'deki hatayı, alanı dış dünyaya açmadan düzeltmek için ne yapılmalı?',
          options: [
            'sesSeviyesi alanı public yapılmalı',
            'sesSeviyesi alanı protected yapılmalı',
            'AkilliTelevizyon sınıfı sealed yapılmalı',
            'Sifirla metodu static yapılmalı',
          ],
          answer: 1,
        },
        explain: 'Satır 12: private alan alt sınıfta görünmez. Satır 22: protected alanlara alt sınıfın içinden erişilebilir ama sınıf dışından (Main) erişilemez.',
      },
    },
    {
      id: 'kalitim-4',
      title: 'Önce Temel, Sonra Alt',
      ref: '3.5',
      cards: [
        {
          icon: '🏛️',
          title: 'Yapıcıların çalışma sırası',
          body: 'Bir alt sınıf nesnesi oluşturulurken **önce temel sınıfın yapıcısı**, ardından alt sınıfın yapıcısı çalışır. Ev inşa ederken önce temelin atılması gibi!',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Program ekrana ne yazar?',
        code: 'class Cihaz\n{\n    public Cihaz() { Console.WriteLine("Cihaz hazır"); }\n}\n\nclass Televizyon : Cihaz\n{\n    public Televizyon() { Console.WriteLine("TV hazır"); }\n}\n\nclass AkilliTelevizyon : Televizyon\n{\n    public AkilliTelevizyon() { Console.WriteLine("Akıllı TV hazır"); }\n}\n\n// Main içinde:\nAkilliTelevizyon tv = new AkilliTelevizyon();',
        answers: ['Cihaz hazır\nTV hazır\nAkıllı TV hazır'],
        explain: 'Yapıcılar en üstteki temel sınıftan başlayarak aşağı doğru çalışır: Cihaz → Televizyon → AkilliTelevizyon.',
      },
    },
    {
      id: 'kalitim-5',
      title: 'base ile Yapıcı Çağırmak',
      ref: '3.5',
      cards: [
        {
          icon: '📞',
          title: ': base(...)',
          body: 'Temel sınıfın yapıcısı parametre istiyorsa, alt sınıfın yapıcısı bu değerleri **: base(...)** ile göndermek zorundadır. Aksi halde derleyici, temel sınıfın parametresiz yapıcısını arar ve bulamazsa **CS7036** hatası verir.',
          code: 'public AkilliTelevizyon(string marka, string os) : base(marka)\n{\n    IsletimSistemi = os;\n}',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'AkilliTelevizyon sınıfını Televizyon\'dan türet. `string IsletimSistemi { get; set; }` özelliği ekle. `(string marka, string isletimSistemi)` parametreli bir yapıcı yaz: markayı **base(marka)** ile temel sınıfa göndersin, işletim sistemini özelliğe atasın.',
        starter: 'class Televizyon\n{\n    public string Marka { get; set; }\n\n    public Televizyon(string marka)\n    {\n        Marka = marka;\n    }\n}\n\nclass AkilliTelevizyon\n{\n\n}\n',
        solution: 'class Televizyon\n{\n    public string Marka { get; set; }\n\n    public Televizyon(string marka)\n    {\n        Marka = marka;\n    }\n}\n\nclass AkilliTelevizyon : Televizyon\n{\n    public string IsletimSistemi { get; set; }\n\n    public AkilliTelevizyon(string marka, string isletimSistemi) : base(marka)\n    {\n        IsletimSistemi = isletimSistemi;\n    }\n}\n',
        rules: [
          { t: 'class', goal: 'AkilliTelevizyon, Televizyon sınıfından türesin', name: 'AkilliTelevizyon', base: 'Televizyon' },
          { t: 'property', goal: 'public string IsletimSistemi { get; set; }', cls: 'AkilliTelevizyon', name: 'IsletimSistemi', type: 'string', access: 'public', get: true, set: true },
          { t: 'ctor', goal: '(string, string) parametreli yapıcı', cls: 'AkilliTelevizyon', params: ['string', 'string'] },
          { t: 'ctor', goal: 'Yapıcı : base(marka) ile temel sınıfı çağırsın', cls: 'AkilliTelevizyon', params: ['string', 'string'], base: true },
          { t: 'source', goal: 'İşletim sistemi özelliğe atansın', regex: 'IsletimSistemi\\s*=\\s*isletimSistemi' },
        ],
        explain: 'Televizyon sınıfının parametresiz yapıcısı olmadığı için : base(marka) yazmak zorunludur. Silip dene: derleyici CS7036 hatası verecek.',
      },
      hints: ['class AkilliTelevizyon : Televizyon', 'public AkilliTelevizyon(string marka, string isletimSistemi) : base(marka) { ... }'],
    },
    {
      id: 'kalitim-6',
      title: 'virtual ve override',
      ref: '3.5',
      cards: [
        {
          icon: '🎭',
          title: 'Davranışı yeniden tanımlamak',
          body: 'Temel sınıfta **virtual** olarak işaretlenen bir metot, alt sınıfta **override** ile **geçersiz kılınabilir** (yeniden yazılabilir). Böylece her alt sınıf aynı metoda kendi davranışını verir.',
          code: 'class Hayvan\n{\n    public virtual void SesCikar() { Console.WriteLine("..."); }\n}\n\nclass Kedi : Hayvan\n{\n    public override void SesCikar() { Console.WriteLine("Miyav"); }\n}',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Hayvan sınıfında public **virtual** `void SesCikar()` metodu olsun. Hayvan\'dan türeyen **Kedi** ("Miyav" yazsın) ve **Kopek** ("Hav hav" yazsın) sınıflarında bu metodu **override** et.',
        starter: 'class Hayvan\n{\n    public void SesCikar()\n    {\n        Console.WriteLine("...");\n    }\n}\n\n',
        solution: 'class Hayvan\n{\n    public virtual void SesCikar()\n    {\n        Console.WriteLine("...");\n    }\n}\n\nclass Kedi : Hayvan\n{\n    public override void SesCikar()\n    {\n        Console.WriteLine("Miyav");\n    }\n}\n\nclass Kopek : Hayvan\n{\n    public override void SesCikar()\n    {\n        Console.WriteLine("Hav hav");\n    }\n}\n',
        rules: [
          { t: 'method', goal: 'Hayvan.SesCikar() virtual olsun', cls: 'Hayvan', name: 'SesCikar', virtual: true, access: 'public' },
          { t: 'class', goal: 'Kedi, Hayvan sınıfından türesin', name: 'Kedi', base: 'Hayvan' },
          { t: 'method', goal: 'Kedi.SesCikar() override edilsin ve "Miyav" yazsın', cls: 'Kedi', name: 'SesCikar', override: true, bodyHas: ['"Miyav"'] },
          { t: 'class', goal: 'Kopek, Hayvan sınıfından türesin', name: 'Kopek', base: 'Hayvan' },
          { t: 'method', goal: 'Kopek.SesCikar() override edilsin ve "Hav hav" yazsın', cls: 'Kopek', name: 'SesCikar', override: true, bodyHas: ['"Hav hav"'] },
        ],
        explain: 'virtual yazmadan override etmeye çalışırsan CS0506 hatası alırsın. override yazmayı unutursan ise derleyici CS0114 uyarısı verir: metot geçersiz kılınmaz, yalnızca gizlenir.',
      },
      hints: ['public virtual void SesCikar()', 'class Kedi : Hayvan { public override void SesCikar() { ... } }'],
    },
    {
      id: 'kalitim-7',
      title: 'Çok Biçimlilik',
      ref: '3.5',
      cards: [
        {
          icon: '🦎',
          title: 'Polymorphism',
          body: 'Temel sınıf türündeki bir değişken, alt sınıf nesnelerini de tutabilir: `Hayvan h = new Kedi();` Bu durumda **override edilmiş** bir metot çağrılırsa, değişkenin türüne değil **nesnenin gerçek türüne** ait sürüm çalışır. Buna **çok biçimlilik** denir.',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Kedi override kullanıyor, Kus ise kullanmıyor (metodu yalnızca gizliyor). Program ekrana ne yazar?',
        code: 'class Hayvan\n{\n    public virtual void SesCikar() { Console.WriteLine("..."); }\n}\nclass Kedi : Hayvan\n{\n    public override void SesCikar() { Console.WriteLine("Miyav"); }\n}\nclass Kus : Hayvan\n{\n    public new void SesCikar() { Console.WriteLine("Cik cik"); }\n}\n\n// Main içinde:\nHayvan h1 = new Kedi();\nHayvan h2 = new Kus();\nKus k = new Kus();\nh1.SesCikar();\nh2.SesCikar();\nk.SesCikar();',
        answers: ['Miyav\n...\nCik cik'],
        explain: 'h1 bir Kedi nesnesini gösterir ve metot override edildiği için "Miyav" yazar. Kus metodu override etmediği (new ile gizlediği) için Hayvan türündeki h2 üzerinden temel sürüm çalışır: "...". k ise Kus türünde olduğu için "Cik cik" yazar.',
      },
    },
    {
      id: 'kalitim-8',
      title: 'Bölüm Sonu: Mühürlü Sınıf',
      boss: true,
      xp: 20,
      ref: '3.5',
      cards: [
        {
          icon: '🔒',
          title: 'sealed',
          body: '**sealed** (mühürlü) olarak tanımlanan bir sınıftan **başka sınıf türetilemez**. Ayrıca C# dilinde bir sınıf **yalnızca bir** temel sınıftan türetilebilir; sınıflarda çoklu kalıtım yoktur.',
          code: 'sealed class Televizyon { ... }',
        },
      ],
      task: {
        kind: 'bug',
        prompt: 'Kalıtım kurallarını ihlal eden **üç** satırı bul.',
        code: 'class Cihaz\n{\n    public void Calistir() { }\n    public virtual void Bilgi() { }\n}\n\nsealed class Televizyon : Cihaz\n{\n}\n\nclass Radyo\n{\n}\n\nclass AkilliTelevizyon : Televizyon\n{\n}\n\nclass RadyoluSaat : Cihaz, Radyo\n{\n}\n\nclass Bilgisayar : Cihaz\n{\n    public override void Calistir() { }\n    public override void Bilgi() { }\n}',
        bugLines: [15, 19, 25],
        explain: 'Satır 15: sealed olan Televizyon\'dan türetilemez (CS0509). Satır 19: Bir sınıf iki temel sınıftan türetilemez (CS1721). Satır 25: Calistir() virtual olmadığı için override edilemez (CS0506). Bilgi() ise virtual olduğu için sorunsuzdur.',
      },
    },
  ],
}
