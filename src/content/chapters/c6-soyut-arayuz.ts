import type { Chapter } from '../../engine/types'

export const soyutArayuz: Chapter = {
  id: 'soyut-arayuz',
  title: 'Soyut Sınıflar ve Arayüzler',
  subtitle: 'abstract, interface ve çok biçimlilik',
  unit: 3,
  icon: '🧩',
  color: '#e879f9',
  levels: [
    {
      id: 'soyut-1',
      title: 'Soyut Sınıf',
      ref: '3.6',
      cards: [
        {
          icon: '☁️',
          title: 'abstract',
          body: '**Soyut sınıf**, kendisinden **nesne üretilemeyen**, yalnızca başka sınıflara **temel** olmak için yazılan sınıftır. "Şekil" gibi düşün: dünyada "sadece şekil" diye bir nesne yoktur ama kare, daire, üçgen vardır.\nSoyut sınıf, gövdesi olmayan **soyut metotlar** içerebilir. Bu metotları alt sınıflar **override** ile yazmak **zorundadır**.',
          code: 'abstract class Sekil\n{\n    public abstract double AlanHesapla();\n}\n\nclass Kare : Sekil\n{\n    public double Kenar { get; set; }\n    public override double AlanHesapla() { return Kenar * Kenar; }\n}',
        },
      ],
      task: {
        kind: 'quiz',
        question: '`abstract class Sekil` tanımlıyken aşağıdaki satırlardan hangisi **derleme hatası** verir?',
        options: [
          'Sekil s = new Kare();',
          'Sekil s = new Sekil();',
          'Kare k = new Kare();',
          'Sekil[] sekiller = new Sekil[3];',
          'List<Sekil> liste = new List<Sekil>();',
        ],
        answer: 1,
        explain: 'Soyut sınıflardan new ile nesne oluşturulamaz (CS0144). Ancak soyut sınıf türünde değişken, dizi veya liste tanımlanabilir ve bunlar alt sınıf nesnelerini tutabilir.',
      },
    },
    {
      id: 'soyut-2',
      title: 'Soyut Televizyon',
      ref: '3.6',
      cards: [
        {
          icon: '📺',
          title: 'Zorunlu sözleşme',
          body: 'Soyut metot, alt sınıflara "bu metodu **sen yazmak zorundasın**" der. Alt sınıf soyut bir metodu yazmazsa **CS0534** hatası oluşur. Soyut sınıf aynı zamanda gövdeli normal metotlar da içerebilir.',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Kitaptaki örnekteki gibi Televizyon sınıfını **abstract** yap ve içine `public abstract void GucAc();` ile `public abstract void GucKapat();` metotlarını ekle. Televizyon\'dan türeyen **AkilliTelevizyon** sınıfında bu iki metodu override et.',
        starter: 'class Televizyon\n{\n    public string Marka { get; set; }\n\n}\n\nclass AkilliTelevizyon : Televizyon\n{\n    public string IsletimSistemi { get; set; }\n\n}\n',
        solution: 'abstract class Televizyon\n{\n    public string Marka { get; set; }\n\n    public abstract void GucAc();\n    public abstract void GucKapat();\n}\n\nclass AkilliTelevizyon : Televizyon\n{\n    public string IsletimSistemi { get; set; }\n\n    public override void GucAc()\n    {\n        Console.WriteLine(IsletimSistemi + " başlatılıyor...");\n    }\n\n    public override void GucKapat()\n    {\n        Console.WriteLine("Kapatılıyor...");\n    }\n}\n',
        rules: [
          { t: 'class', goal: 'Televizyon soyut (abstract) olsun', name: 'Televizyon', abstract: true },
          { t: 'method', goal: 'public abstract void GucAc();', cls: 'Televizyon', name: 'GucAc', abstract: true, returns: 'void', noBody: true },
          { t: 'method', goal: 'public abstract void GucKapat();', cls: 'Televizyon', name: 'GucKapat', abstract: true, returns: 'void', noBody: true },
          { t: 'method', goal: 'AkilliTelevizyon GucAc() metodunu override etsin', cls: 'AkilliTelevizyon', name: 'GucAc', override: true },
          { t: 'method', goal: 'AkilliTelevizyon GucKapat() metodunu override etsin', cls: 'AkilliTelevizyon', name: 'GucKapat', override: true },
        ],
        explain: 'Soyut metotların gövdesi yoktur ve ; ile biter. Alt sınıf, override ile gövdeyi yazar. Soyut metot içeren her sınıf da abstract olmak zorundadır (CS0513).',
      },
      hints: ['abstract class Televizyon { public abstract void GucAc(); ... }', 'public override void GucAc() { ... }'],
    },
    {
      id: 'soyut-3',
      title: 'Arayüz (Interface)',
      ref: '3.6',
      cards: [
        {
          icon: '🔌',
          title: 'Bir yetenek sözleşmesi',
          body: '**Arayüz**, bir sınıfın **neler yapabileceğini** tanımlayan bir sözleşmedir. Arayüzde yalnızca metot ve özellik **imzaları** bulunur. Arayüz adları geleneksel olarak **I** harfiyle başlar (`IGuc`, `IYazdirilabilir`).\nBir sınıf **birden fazla arayüzü** uygulayabilir; bu sayede C# sınıflarda olmayan **çoklu kalıtım** ihtiyacını karşılar.',
          code: 'interface IGuc\n{\n    void GucAc();\n    void GucKapat();\n}\n\nclass Televizyon : IGuc\n{\n    public void GucAc() { ... }\n    public void GucKapat() { ... }\n}',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Kitaptaki **IGuc** arayüzünü yaz (`void GucAc();` ve `void GucKapat();`). Bu arayüzü hem **Televizyon** hem de **Bilgisayar** sınıflarına uygula.',
        starter: 'interface IGuc\n{\n\n}\n\nclass Televizyon\n{\n\n}\n\nclass Bilgisayar\n{\n\n}\n',
        solution: 'interface IGuc\n{\n    void GucAc();\n    void GucKapat();\n}\n\nclass Televizyon : IGuc\n{\n    public void GucAc()\n    {\n        Console.WriteLine("TV açıldı");\n    }\n\n    public void GucKapat()\n    {\n        Console.WriteLine("TV kapandı");\n    }\n}\n\nclass Bilgisayar : IGuc\n{\n    public void GucAc()\n    {\n        Console.WriteLine("Bilgisayar açıldı");\n    }\n\n    public void GucKapat()\n    {\n        Console.WriteLine("Bilgisayar kapandı");\n    }\n}\n',
        rules: [
          { t: 'class', goal: 'IGuc bir arayüz olsun', name: 'IGuc', kind: 'interface' },
          { t: 'method', goal: 'IGuc içinde void GucAc(); imzası', cls: 'IGuc', name: 'GucAc', returns: 'void', params: 0, noBody: true },
          { t: 'method', goal: 'IGuc içinde void GucKapat(); imzası', cls: 'IGuc', name: 'GucKapat', returns: 'void', params: 0, noBody: true },
          { t: 'class', goal: 'Televizyon, IGuc arayüzünü uygulasın', name: 'Televizyon', implements: ['IGuc'] },
          { t: 'class', goal: 'Bilgisayar, IGuc arayüzünü uygulasın', name: 'Bilgisayar', implements: ['IGuc'] },
          { t: 'method', goal: 'Bilgisayar sınıfında public void GucAc()', cls: 'Bilgisayar', name: 'GucAc', access: 'public' },
        ],
        explain: 'Arayüz üyeleri sınıfta public olarak yazılmalıdır. Arayüzdeki bir metodu yazmayı unutursan CS0535 hatası alırsın. Arayüz metotlarını uygularken override yazılmaz.',
      },
      hints: ['interface IGuc { void GucAc(); void GucKapat(); }', 'class Televizyon : IGuc { public void GucAc() { } ... }'],
    },
    {
      id: 'soyut-4',
      title: 'Arayüz mü, Soyut Sınıf mı?',
      ref: '3.6',
      cards: [
        {
          icon: '⚖️',
          title: 'Karşılaştırma',
          body: '**Arayüz:** Bir sınıf birden fazla arayüzden türetilebilir • yalnızca gövdesiz üyeler • tüm ögeler public kabul edilir • yapıcı metot ve alan içeremez.\n**Soyut sınıf:** Bir sınıf yalnızca tek bir soyut sınıftan türetilebilir • hem normal hem soyut metotlar • ögeler public olmak zorunda değildir • yapıcı metot ve alan içerebilir.',
        },
      ],
      task: {
        kind: 'match',
        prompt: 'Her ifadeyi doğru kavramla eşleştir.',
        pairs: [
          { left: 'Bir sınıf bunlardan birden fazlasını uygulayabilir', right: 'Arayüz (interface)' },
          { left: 'Yapıcı metot ve alan içerebilir', right: 'Soyut sınıf (abstract class)' },
          { left: 'Başka sınıf türetilemez', right: 'Mühürlü sınıf (sealed class)' },
          { left: 'Nesne oluşturmadan sınıf adıyla kullanılır', right: 'Statik sınıf (static class)' },
        ],
        explain: 'Arayüzler çoklu kalıtım sağlar; soyut sınıflar ortak kod ve alan barındırabilir. sealed türetmeyi engeller, static sınıflardan ise hiç nesne oluşturulamaz.',
      },
    },
    {
      id: 'soyut-5',
      title: 'Şekiller Geçidi',
      ref: '3.6',
      cards: [
        {
          icon: '🔷',
          title: 'Tek döngü, farklı davranışlar',
          body: 'Çok biçimliliğin en güçlü kullanımı: farklı alt sınıf nesnelerini **temel sınıf türünde** bir dizide toplayıp tek bir döngüyle işlemek. Her nesne, kendi override edilmiş metodunu çalıştırır.',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Program ekrana ne yazar? (Her değer ayrı satırda)',
        code: 'abstract class Sekil\n{\n    public abstract int AlanHesapla();\n}\nclass Kare : Sekil\n{\n    public int Kenar;\n    public override int AlanHesapla() { return Kenar * Kenar; }\n}\nclass Dikdortgen : Sekil\n{\n    public int En, Boy;\n    public override int AlanHesapla() { return En * Boy; }\n}\n\n// Main içinde:\nSekil[] sekiller = new Sekil[3];\nsekiller[0] = new Kare { Kenar = 3 };\nsekiller[1] = new Dikdortgen { En = 2, Boy = 5 };\nsekiller[2] = new Kare { Kenar = 4 };\n\nint toplam = 0;\nforeach (Sekil s in sekiller)\n{\n    Console.WriteLine(s.AlanHesapla());\n    toplam += s.AlanHesapla();\n}\nConsole.WriteLine(toplam);',
        answers: ['9\n10\n16\n35'],
        explain: 'Her eleman Sekil türünde tutulsa da AlanHesapla() nesnenin gerçek türüne göre çalışır: 3×3=9, 2×5=10, 4×4=16. Toplam 35.',
      },
    },
    {
      id: 'soyut-6',
      title: 'Bölüm Sonu: Çoklu Yetenek',
      boss: true,
      xp: 30,
      ref: '3.6',
      cards: [
        {
          icon: '🦸',
          title: 'Hepsi bir arada',
          body: 'Bir sınıf **bir temel sınıftan** türeyip aynı anda **birden fazla arayüzü** uygulayabilir. Yazım sırası: önce temel sınıf, sonra arayüzler.',
          code: 'class AkilliTelefon : Cihaz, IArama, IKamera { ... }',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Verilen soyut **Cihaz** sınıfı ve iki arayüzü kullanarak **AkilliTelefon** sınıfını yaz: Cihaz\'dan türesin, **IArama** ve **IKamera** arayüzlerini uygulasın ve gerekli tüm metotları yazsın. Main içinde bir AkilliTelefon oluşturup üç metodu da çağır.',
        starter: 'abstract class Cihaz\n{\n    public string Model { get; set; }\n    public abstract void BilgiVer();\n}\n\ninterface IArama\n{\n    void AramaYap(string numara);\n}\n\ninterface IKamera\n{\n    void FotografCek();\n}\n\n// AkilliTelefon sınıfını yaz\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n\n    }\n}\n',
        solution: 'abstract class Cihaz\n{\n    public string Model { get; set; }\n    public abstract void BilgiVer();\n}\n\ninterface IArama\n{\n    void AramaYap(string numara);\n}\n\ninterface IKamera\n{\n    void FotografCek();\n}\n\nclass AkilliTelefon : Cihaz, IArama, IKamera\n{\n    public override void BilgiVer()\n    {\n        Console.WriteLine("Model: " + Model);\n    }\n\n    public void AramaYap(string numara)\n    {\n        Console.WriteLine(numara + " aranıyor...");\n    }\n\n    public void FotografCek()\n    {\n        Console.WriteLine("Çek!");\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        AkilliTelefon tel = new AkilliTelefon();\n        tel.Model = "X10";\n        tel.BilgiVer();\n        tel.AramaYap("5551234567");\n        tel.FotografCek();\n    }\n}\n',
        rules: [
          { t: 'class', goal: 'AkilliTelefon, Cihaz sınıfından türesin', name: 'AkilliTelefon', base: 'Cihaz' },
          { t: 'class', goal: 'AkilliTelefon, IArama ve IKamera arayüzlerini uygulasın', name: 'AkilliTelefon', implements: ['IArama', 'IKamera'] },
          { t: 'method', goal: 'BilgiVer() override edilsin', cls: 'AkilliTelefon', name: 'BilgiVer', override: true },
          { t: 'method', goal: 'public void AramaYap(string numara)', cls: 'AkilliTelefon', name: 'AramaYap', params: ['string'], access: 'public' },
          { t: 'method', goal: 'public void FotografCek()', cls: 'AkilliTelefon', name: 'FotografCek', params: 0, access: 'public' },
          { t: 'new', goal: 'Bir AkilliTelefon nesnesi oluştur', type: 'AkilliTelefon' },
          { t: 'call', goal: 'AramaYap metodunu çağır', member: 'AramaYap', args: 1 },
          { t: 'call', goal: 'FotografCek metodunu çağır', member: 'FotografCek' },
        ],
        explain: 'AkilliTelefon artık hem bir Cihaz, hem bir IArama, hem de bir IKamera\'dır. IKamera türünde bir değişken de bu telefonu tutabilir: IKamera k = tel;',
        output: 'Model: X10\n5551234567 aranıyor...\nÇek!',
      },
      hints: ['class AkilliTelefon : Cihaz, IArama, IKamera', 'public override void BilgiVer() { ... }'],
    },
  ],
}
