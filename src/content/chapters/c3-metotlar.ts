import type { Chapter } from '../../engine/types'

export const metotlar: Chapter = {
  id: 'metotlar',
  title: 'Metotlar',
  subtitle: 'Parametreler, dönüş değeri, aşırı yükleme ve this',
  unit: 3,
  icon: '⚙️',
  color: '#34d399',
  levels: [
    {
      id: 'metot-1',
      title: 'Metodun Anatomisi',
      ref: '3.3',
      cards: [
        {
          icon: '🔬',
          title: 'Metot tanımı',
          body: 'Bir metot şu parçalardan oluşur: **erişim belirleyici**, **dönüş türü**, **ad**, parantez içinde **parametreler** ve süslü parantez içinde **gövde**. Değer döndürmeyen metotların dönüş türü **void**tir.',
          code: 'public   int     Topla  (int a, int b)\n{\n    return a + b;\n}\n// erişim  dönüş  ad     parametreler',
        },
        {
          icon: '↩️',
          title: 'return',
          body: 'Dönüş türü void olmayan bir metot, **return** ile mutlaka o türde bir değer döndürmelidir. return çalıştığında metot sona erer.',
        },
      ],
      task: {
        kind: 'quiz',
        question: '`public double OrtalamaHesapla(int a, int b, int c)` metodu için hangisi **yanlıştır**?',
        options: [
          'Metot üç tane int parametre alır.',
          'Metodun dönüş türü double\'dır.',
          'Metot gövdesinde return ile bir değer döndürülmelidir.',
          'Metot void olduğu için değer döndürmez.',
          'Metot sınıf dışından çağrılabilir.',
        ],
        answer: 3,
        explain: 'Metodun dönüş türü double\'dır, void değildir. Bu yüzden return ile double türünde bir değer döndürmek zorundadır.',
      },
    },
    {
      id: 'metot-2',
      title: 'Değer Döndüren Metot',
      ref: '3.3',
      cards: [
        {
          icon: '📤',
          title: 'Sonucu kullanmak',
          body: 'Değer döndüren bir metodun sonucu bir değişkene atanabilir ya da doğrudan bir ifadede kullanılabilir: `int toplam = h.Topla(3, 4);`',
        },
      ],
      task: {
        kind: 'fill',
        prompt: 'Dairenin alanını hesaplayıp döndüren metodu tamamla.',
        code: 'class Daire\n{\n    public double yaricap;\n\n    public [[0]] AlanHesapla()\n    {\n        double alan = 3.14 * yaricap * yaricap;\n        [[1]] alan;\n    }\n}',
        blanks: [
          { accept: ['double'], width: 6 },
          { accept: ['return'], width: 6 },
        ],
        explain: 'Hesaplanan alan ondalıklı bir sayı olduğu için dönüş türü double olmalıdır. return alan; satırı sonucu çağıran koda geri gönderir.',
      },
    },
    {
      id: 'metot-3',
      title: 'Gücü Aç, Gücü Kapat',
      ref: '3.3',
      cards: [
        {
          icon: '🔌',
          title: 'Durum değiştiren metotlar',
          body: 'Metotlar nesnenin alanlarını değiştirerek **durumunu** güncelleyebilir. Televizyonun açık/kapalı olması bool türünde bir alanla tutulabilir.',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Televizyon sınıfına `bool gucAcik = false;` alanını, bu alanı true yapan public `void GucAc()` ve false yapan public `void GucKapat()` metotlarını ekle. Ayrıca açık mı kapalı mı olduğunu döndüren public `bool AcikMi()` metodunu yaz.',
        starter: 'class Televizyon\n{\n    bool gucAcik = false;\n\n}\n',
        solution: 'class Televizyon\n{\n    bool gucAcik = false;\n\n    public void GucAc()\n    {\n        gucAcik = true;\n    }\n\n    public void GucKapat()\n    {\n        gucAcik = false;\n    }\n\n    public bool AcikMi()\n    {\n        return gucAcik;\n    }\n}\n',
        rules: [
          { t: 'field', goal: 'bool gucAcik alanı', cls: 'Televizyon', name: 'gucAcik', type: 'bool' },
          { t: 'method', goal: 'public void GucAc() → gucAcik = true', cls: 'Televizyon', name: 'GucAc', returns: 'void', params: 0, access: 'public', bodyHas: ['gucAcik = true;'] },
          { t: 'method', goal: 'public void GucKapat() → gucAcik = false', cls: 'Televizyon', name: 'GucKapat', returns: 'void', params: 0, access: 'public', bodyHas: ['gucAcik = false;'] },
          { t: 'method', goal: 'public bool AcikMi() → gucAcik değerini döndürsün', cls: 'Televizyon', name: 'AcikMi', returns: 'bool', params: 0, access: 'public', bodyHas: ['return gucAcik;'] },
        ],
        explain: 'gucAcik alanı private kalır ve yalnızca bu metotlar aracılığıyla değişir. AcikMi() metodu ise durumu güvenle dışarıya bildirir.',
      },
    },
    {
      id: 'metot-4',
      title: 'Aşırı Yükleme (Overloading)',
      ref: '3.3',
      cards: [
        {
          icon: '🎛️',
          title: 'Aynı ad, farklı imza',
          body: 'Bir sınıfta **aynı isimde birden fazla metot** tanımlanabilir; yeter ki **parametre sayıları veya türleri** farklı olsun. Buna **metot aşırı yükleme** denir. C# hangi sürümün çalışacağına, çağrıdaki argümanlara bakarak karar verir.',
          code: 'public void KanalNoArtir()\n{\n    kanalNo++;\n}\n\npublic void KanalNoArtir(int artis)\n{\n    kanalNo += artis;\n}',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'kanalNo başlangıçta 1. Program ekrana ne yazar? (Her değer ayrı satırda)',
        code: 'Televizyon tv = new Televizyon();\ntv.KanalDegistir(10);\nConsole.WriteLine(tv.KanalNo);\ntv.KanalNoArtir();\nConsole.WriteLine(tv.KanalNo);\ntv.KanalNoArtir(5);\nConsole.WriteLine(tv.KanalNo);\ntv.KanalNoAzalt();\nConsole.WriteLine(tv.KanalNo);\ntv.KanalNoAzalt(3);\nConsole.WriteLine(tv.KanalNo);',
        answers: ['10\n11\n16\n15\n12'],
        explain: 'KanalDegistir(10) → 10. Parametresiz KanalNoArtir() 1 artırır → 11. KanalNoArtir(5) 5 artırır → 16. KanalNoAzalt() → 15. KanalNoAzalt(3) → 12.',
      },
    },
    {
      id: 'metot-5',
      title: 'Kendi Aşırı Yüklemeni Yaz',
      ref: '3.3',
      cards: [
        {
          icon: '🛠️',
          title: 'Aynı işi farklı yollarla yapmak',
          body: 'Aşırı yükleme, aynı işin farklı biçimlerine tek bir anlamlı isim vermeni sağlar. Örneğin `Console.WriteLine` metodunun int, string, double… alan onlarca sürümü vardır.',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Televizyon sınıfına iki **KanalNoAzalt** metodu ekle: parametresiz olan kanalı 1 azaltsın, `int azalis` parametreli olan kanalı verilen değer kadar azaltsın.',
        starter: 'class Televizyon\n{\n    private int kanalNo = 1;\n\n    public int KanalNo\n    {\n        get { return kanalNo; }\n    }\n\n    // KanalNoAzalt metotlarını buraya yaz\n}\n',
        solution: 'class Televizyon\n{\n    private int kanalNo = 1;\n\n    public int KanalNo\n    {\n        get { return kanalNo; }\n    }\n\n    public void KanalNoAzalt()\n    {\n        kanalNo--;\n    }\n\n    public void KanalNoAzalt(int azalis)\n    {\n        kanalNo -= azalis;\n    }\n}\n',
        rules: [
          { t: 'method', goal: 'KanalNoAzalt metodunun iki sürümü olsun', cls: 'Televizyon', name: 'KanalNoAzalt', overloads: 2 },
          { t: 'method', goal: 'public void KanalNoAzalt() → 1 azaltır', cls: 'Televizyon', name: 'KanalNoAzalt', params: 0, returns: 'void', access: 'public' },
          { t: 'method', goal: 'public void KanalNoAzalt(int azalis)', cls: 'Televizyon', name: 'KanalNoAzalt', params: ['int'], returns: 'void', access: 'public' },
          { t: 'source', goal: 'Parametreli sürüm kanalNo değerinden azalis kadar çıkarsın', regex: 'kanalNo\\s*(-=\\s*azalis|=\\s*kanalNo\\s*-\\s*azalis)' },
        ],
        explain: 'İki metodun adı aynı ama imzaları (parametre listeleri) farklı olduğu için C# ikisini ayırt edebilir.',
      },
    },
    {
      id: 'metot-6',
      title: 'Hata Avcısı: Sahte Aşırı Yükleme',
      ref: '3.3',
      cards: [
        {
          icon: '⚠️',
          title: 'Dönüş türü yetmez',
          body: 'Metotları ayırt etmek için yalnızca **parametre listesine** bakılır. Sadece dönüş türü farklı olan iki metot aşırı yükleme sayılmaz ve **CS0111** hatası verir.',
        },
      ],
      task: {
        kind: 'bug',
        prompt: 'Hesap sınıfında derleme hatasına neden olan satırı bul.',
        code: 'class Hesap\n{\n    public int Topla(int a, int b)\n    {\n        return a + b;\n    }\n\n    public int Topla(int a, int b, int c)\n    {\n        return a + b + c;\n    }\n\n    public double Topla(double a, double b)\n    {\n        return a + b;\n    }\n\n    public double Topla(int x, int y)\n    {\n        return x + y;\n    }\n}',
        bugLines: [18],
        fix: {
          question: 'Bu metot neden hata verir?',
          options: [
            'Parametre adları farklı olduğu için',
            'Parametre türleri ve sayısı ilk metotla aynı; yalnızca dönüş türü farklı',
            'double türü toplanamadığı için',
            'Bir sınıfta en fazla üç aşırı yükleme olabileceği için',
          ],
          answer: 1,
        },
        explain: 'Topla(int, int) imzası zaten var. Parametre adlarını (x, y) veya dönüş türünü değiştirmek yeni bir imza oluşturmaz.',
      },
    },
    {
      id: 'metot-7',
      title: 'this Anahtar Sözcüğü',
      ref: '3.3',
      cards: [
        {
          icon: '👆',
          title: 'Bu nesnenin…',
          body: 'Parametre adı alan adıyla aynı olduğunda, metot içinde `kanalNo` yazınca **parametre** anlaşılır. Nesnenin alanını belirtmek için **this** kullanılır: `this.kanalNo` = "bu nesnenin kanalNo alanı".',
          code: 'public void KanalDegistir(int kanalNo)\n{\n    this.kanalNo = kanalNo;\n}',
        },
      ],
      task: {
        kind: 'fill',
        prompt: 'Parametre adları alan adlarıyla aynı. Değerlerin alanlara aktarılması için boşlukları doldur.',
        code: 'class Ogrenci\n{\n    private string ad;\n    private int numara;\n\n    public void BilgiGuncelle(string ad, int numara)\n    {\n        [[0]].ad = ad;\n        [[1]] = numara;\n    }\n}',
        blanks: [
          { accept: ['this'], width: 4 },
          { accept: ['this.numara'], width: 11 },
        ],
        explain: 'this yazılmasaydı ad = ad; ifadesi parametreyi kendisine atardı ve alan hiç değişmezdi. this.ad nesnenin alanını, ad ise parametreyi ifade eder.',
      },
    },
    {
      id: 'metot-8',
      title: 'Bölüm Sonu: Hesap Makinesi',
      boss: true,
      xp: 25,
      ref: '3.3',
      cards: [
        {
          icon: '🧮',
          title: 'Hepsi bir arada',
          body: 'Dönüş değeri, parametreler ve aşırı yükleme… Bu görevde hepsini bir arada kullanacaksın.',
        },
      ],
      task: {
        kind: 'code',
        prompt: '`HesapMakinesi` sınıfına üç **Carp** metodu yaz: `int Carp(int a, int b)`, `int Carp(int a, int b, int c)` ve `double Carp(double a, double b)`. Hepsi public olsun ve sonucu return ile döndürsün. Main içinde bir nesne oluşturup üç sürümü de çağır.',
        starter: 'class HesapMakinesi\n{\n\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n\n    }\n}\n',
        solution: 'class HesapMakinesi\n{\n    public int Carp(int a, int b)\n    {\n        return a * b;\n    }\n\n    public int Carp(int a, int b, int c)\n    {\n        return a * b * c;\n    }\n\n    public double Carp(double a, double b)\n    {\n        return a * b;\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        HesapMakinesi h = new HesapMakinesi();\n        Console.WriteLine(h.Carp(3, 4));\n        Console.WriteLine(h.Carp(2, 3, 4));\n        Console.WriteLine(h.Carp(2.5, 4.0));\n    }\n}\n',
        rules: [
          { t: 'method', goal: 'public int Carp(int a, int b)', cls: 'HesapMakinesi', name: 'Carp', params: ['int', 'int'], returns: 'int', access: 'public', bodyHas: ['return'] },
          { t: 'method', goal: 'public int Carp(int a, int b, int c)', cls: 'HesapMakinesi', name: 'Carp', params: ['int', 'int', 'int'], returns: 'int', access: 'public', bodyHas: ['return'] },
          { t: 'method', goal: 'public double Carp(double a, double b)', cls: 'HesapMakinesi', name: 'Carp', params: ['double', 'double'], returns: 'double', access: 'public', bodyHas: ['return'] },
          { t: 'new', goal: 'Bir HesapMakinesi nesnesi oluştur', type: 'HesapMakinesi' },
          { t: 'call', goal: 'İki argümanlı Carp çağrısı', member: 'Carp', args: 2 },
          { t: 'call', goal: 'Üç argümanlı Carp çağrısı', member: 'Carp', args: 3 },
        ],
        explain: 'h.Carp(3, 4) çağrısında iki int argüman olduğu için ilk sürüm, h.Carp(2.5, 4.0) çağrısında ise double sürümü çalışır.',
        output: '12\n24\n10',
      },
      hints: ['public int Carp(int a, int b) { return a * b; }'],
    },
  ],
}
