import type { Chapter } from '../../engine/types'

export const sinifNesne: Chapter = {
  id: 'sinif-nesne',
  title: 'Sınıf ve Nesne',
  subtitle: 'Nesne tabanlı programlamanın temel taşları',
  unit: 3,
  icon: '🏭',
  color: '#f59e0b',
  levels: [
    {
      id: 'sinif-1',
      title: 'Nesne Nedir?',
      ref: '3.1',
      cards: [
        {
          icon: '📺',
          title: 'Gerçek dünyadan yazılıma',
          body: 'Çevremizdeki her şey birer **nesnedir**: televizyon, öğrenci, araba… Her nesnenin **özellikleri** (marka, kanal, ses seviyesi) ve **davranışları** (aç, kapat, kanal değiştir) vardır. Nesne tabanlı programlama (NTP), yazılımı bu bakış açısıyla tasarlar.',
        },
        {
          icon: '📐',
          title: 'Sınıf = Plan, Nesne = Ürün',
          body: '**Sınıf (class)**, nesnelerin nasıl olacağını tarif eden bir kalıp ya da plandır. Fabrikadaki bir televizyon çizimi gibi düşün. **Nesne (object)** ise bu plandan üretilen gerçek bir örnektir. Tek bir plandan istediğin kadar nesne üretebilirsin.',
          code: 'class Televizyon      // plan\n{\n    public string marka;     // özellik (alan)\n    public int kanalNo;\n\n    public void KanalDegistir(int yeni)   // davranış (metot)\n    {\n        kanalNo = yeni;\n    }\n}',
        },
      ],
      task: {
        kind: 'match',
        prompt: 'Kavramları doğru açıklamalarıyla eşleştir.',
        pairs: [
          { left: 'Sınıf (class)', right: 'Nesnelerin üretildiği kalıp / plan' },
          { left: 'Nesne (object)', right: 'Sınıftan üretilmiş somut örnek' },
          { left: 'Alan (field)', right: 'Nesnenin verisini tutan değişken' },
          { left: 'Metot (method)', right: 'Nesnenin davranışı / yapabildiği iş' },
          { left: 'new', right: 'Bellekte yeni bir nesne oluşturur' },
        ],
        explain: 'Sınıf bir plandır; new anahtar sözcüğü bu plandan bellekte gerçek bir nesne oluşturur. Nesnenin verileri alanlarda, davranışları metotlarda tanımlanır.',
      },
    },
    {
      id: 'sinif-2',
      title: 'Sınıf İnşa Et: Televizyon',
      ref: '3.1',
      cards: [
        {
          icon: '🧱',
          title: 'Sınıfın gövdesinde neler olur?',
          body: 'Bir sınıfın süslü parantezleri `{ }` arasına yalnızca **üye tanımları** yazılır: alanlar, özellikler, metotlar, yapıcı metotlar. `Console.WriteLine(...)` gibi komutlar ya da `kanalNo = 5;` gibi atamalar doğrudan sınıf gövdesine yazılamaz; bunlar bir **metodun içinde** olmalıdır.',
        },
      ],
      task: {
        kind: 'build',
        prompt: 'Televizyon sınıfına yalnızca **geçerli üye tanımlarını** ekle. Hatalı blokları dışarıda bırak.',
        header: 'class Televizyon',
        blocks: [
          { code: 'public string marka;', correct: true, why: 'Geçerli bir alan tanımı.' },
          { code: 'public int kanalNo;', correct: true, why: 'Geçerli bir alan tanımı.' },
          { code: 'Console.WriteLine("TV açıldı");', correct: false, why: 'Komutlar sınıf gövdesine değil, metotların içine yazılır.' },
          { code: 'public void KanalDegistir(int yeni)\n{\n    kanalNo = yeni;\n}', correct: true, why: 'Geçerli bir metot tanımı.' },
          { code: 'public int 2kanal;', correct: false, why: 'Değişken adları rakamla başlayamaz.' },
          { code: 'kanalNo = 5;', correct: false, why: 'Atama işlemi bir deyimdir; sınıf gövdesinde değil metot içinde yapılmalıdır. (Alanın ilk değeri için: public int kanalNo = 5;)' },
          { code: 'public int sesSeviyesi = 10;', correct: true, why: 'İlk değer verilerek tanımlanmış geçerli bir alan.' },
        ],
        explain: 'Sınıf gövdesi yalnızca üye tanımlarını içerir. Çalıştırılacak komutlar her zaman bir metodun gövdesinde bulunur.',
      },
    },
    {
      id: 'sinif-3',
      title: 'İlk Nesneni Üret',
      ref: '3.1',
      cards: [
        {
          icon: '✨',
          title: 'new ile nesne oluşturma',
          body: 'Bir sınıftan nesne üretmek için önce sınıf türünde bir değişken tanımlanır, sonra **new** ile nesne oluşturulur. Nesnenin üyelerine **nokta (.) operatörü** ile erişilir.',
          code: 'Televizyon tv = new Televizyon();\ntv.marka = "Vestel";\ntv.KanalDegistir(7);',
        },
      ],
      task: {
        kind: 'code',
        prompt: '`Ogrenci` sınıfını yaz: **public** `string ad` ve **public** `int numara` alanları olsun. Main içinde bir Ogrenci nesnesi oluşturup ad ve numara alanlarına değer ata, sonra adı ekrana yazdır.',
        starter: 'class Ogrenci\n{\n    // alanları buraya yaz\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        // nesneyi oluştur ve değer ata\n    }\n}\n',
        solution: 'class Ogrenci\n{\n    public string ad;\n    public int numara;\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Ogrenci ogr = new Ogrenci();\n        ogr.ad = "Elif";\n        ogr.numara = 101;\n        Console.WriteLine(ogr.ad);\n    }\n}\n',
        rules: [
          { t: 'field', goal: 'Ogrenci sınıfında public string ad alanı', cls: 'Ogrenci', name: 'ad', type: 'string', access: 'public' },
          { t: 'field', goal: 'Ogrenci sınıfında public int numara alanı', cls: 'Ogrenci', name: 'numara', type: 'int', access: 'public' },
          { t: 'new', goal: 'new Ogrenci() ile bir nesne oluştur', type: 'Ogrenci' },
          { t: 'source', goal: 'ad ve numara alanlarına nesne üzerinden değer ata', regex: '\\w+\\.ad\\s*=[\\s\\S]*\\w+\\.numara\\s*=|\\w+\\.numara\\s*=[\\s\\S]*\\w+\\.ad\\s*=' },
          { t: 'call', goal: 'Console.WriteLine ile adı yazdır', member: 'WriteLine' },
        ],
        explain: 'Alanların başına public yazmazsan varsayılan erişim private olur ve Main içinden erişemezsin. Bunu bir sonraki bölümde (Kapsülleme) detaylı göreceğiz!',
        output: 'Elif',
      },
      hints: ['Alan tanımı: public string ad;', 'Nesne: Ogrenci ogr = new Ogrenci();', 'Değer atama: ogr.ad = "Elif";'],
    },
    {
      id: 'sinif-4',
      title: 'Referansın Gücü',
      ref: '3.1',
      cards: [
        {
          icon: '🔗',
          title: 'Değişken nesneyi değil adresini tutar',
          body: 'Sınıflar **referans türüdür**. `Televizyon tv2 = tv1;` yazıldığında yeni bir televizyon üretilmez; iki değişken de **aynı nesneyi** gösterir. Birinden yapılan değişiklik diğerinden de görülür.',
          code: 'Televizyon tv1 = new Televizyon();\nTelevizyon tv2 = tv1;   // aynı nesne!\nTelevizyon tv3 = new Televizyon(); // yeni nesne',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Program ekrana ne yazar? (Her değer ayrı satırda)',
        code: 'Televizyon tv1 = new Televizyon();\ntv1.kanalNo = 3;\n\nTelevizyon tv2 = tv1;\ntv2.kanalNo = 7;\n\nTelevizyon tv3 = new Televizyon();\ntv3.kanalNo = 9;\n\nConsole.WriteLine(tv1.kanalNo);\nConsole.WriteLine(tv2.kanalNo);\nConsole.WriteLine(tv3.kanalNo);',
        answers: ['7\n7\n9'],
        explain: 'tv2 = tv1 ataması nesneyi kopyalamaz, yalnızca adresini kopyalar. tv2 üzerinden kanal 7 yapılınca tv1 de 7 gösterir. tv3 ise new ile ayrı bir nesnedir.',
      },
    },
    {
      id: 'sinif-5',
      title: 'Kaç Nesne Var?',
      ref: '3.1',
      cards: [
        {
          icon: '🧮',
          title: 'Nesne sayısını new belirler',
          body: 'Bellekte kaç nesne olduğunu bulmak için **new** sözcüklerini say. Değişken tanımlamak tek başına nesne oluşturmaz: `Ogrenci o;` yalnızca boş (null) bir referans tanımlar.',
        },
      ],
      task: {
        kind: 'quiz',
        question: 'Bu kod çalıştıktan sonra bellekte **kaç tane Ogrenci nesnesi** oluşmuştur?',
        code: 'Ogrenci a = new Ogrenci();\nOgrenci b = new Ogrenci();\nOgrenci c = a;\nOgrenci d;\nOgrenci e = new Ogrenci();\nb = e;',
        options: ['2', '3', '4', '5', '6'],
        answer: 1,
        explain: 'Üç kez new kullanılmış, yani 3 nesne oluşmuştur. c = a ve b = e atamaları yeni nesne üretmez; d ise hiçbir nesneyi göstermez (null).',
      },
    },
    {
      id: 'sinif-6',
      title: 'Bölüm Sonu: Kitap Sınıfı',
      boss: true,
      xp: 20,
      ref: '3.1',
      cards: [
        {
          icon: '📚',
          title: 'Kütüphane projesine başlıyoruz',
          body: 'Ders kitabındaki **Kütüphane Otomasyonu** projesinin ilk adımı: kitapları temsil eden bir sınıf. Sınıfı tasarla, iki farklı kitap nesnesi oluştur ve bilgilerini yazdıran bir metot ekle.',
        },
      ],
      task: {
        kind: 'code',
        prompt: '`Kitap` sınıfına public `string ad`, `string yazar` ve `int sayfaSayisi` alanlarını ve bu bilgileri ekrana yazan `public void BilgiYaz()` metodunu ekle. Main içinde **iki** Kitap nesnesi oluştur ve her ikisi için BilgiYaz() metodunu çağır.',
        starter: 'class Kitap\n{\n\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n\n    }\n}\n',
        solution: 'class Kitap\n{\n    public string ad;\n    public string yazar;\n    public int sayfaSayisi;\n\n    public void BilgiYaz()\n    {\n        Console.WriteLine(ad + " - " + yazar + " (" + sayfaSayisi + " sayfa)");\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Kitap k1 = new Kitap();\n        k1.ad = "Çalıkuşu";\n        k1.yazar = "Reşat Nuri Güntekin";\n        k1.sayfaSayisi = 544;\n\n        Kitap k2 = new Kitap();\n        k2.ad = "Sefiller";\n        k2.yazar = "Victor Hugo";\n        k2.sayfaSayisi = 1488;\n\n        k1.BilgiYaz();\n        k2.BilgiYaz();\n    }\n}\n',
        rules: [
          { t: 'field', goal: 'public string ad', cls: 'Kitap', name: 'ad', type: 'string', access: 'public' },
          { t: 'field', goal: 'public string yazar', cls: 'Kitap', name: 'yazar', type: 'string', access: 'public' },
          { t: 'field', goal: 'public int sayfaSayisi', cls: 'Kitap', name: 'sayfaSayisi', type: 'int', access: 'public' },
          { t: 'method', goal: 'public void BilgiYaz() metodu', cls: 'Kitap', name: 'BilgiYaz', returns: 'void', params: 0, access: 'public', bodyHas: ['Console.WriteLine'] },
          { t: 'new', goal: 'İki Kitap nesnesi oluştur', type: 'Kitap', min: 2 },
          { t: 'call', goal: 'BilgiYaz() metodunu iki kez çağır', member: 'BilgiYaz', min: 2 },
        ],
        explain: 'Aynı sınıftan üretilen iki nesne aynı metotlara sahiptir ama her birinin alanlarında farklı veriler bulunur. BilgiYaz() çağrıldığı nesnenin verilerini kullanır.',
        output: 'Çalıkuşu - Reşat Nuri Güntekin (544 sayfa)\nSefiller - Victor Hugo (1488 sayfa)',
      },
      hints: ['Metot: public void BilgiYaz() { Console.WriteLine(ad + " - " + yazar); }', 'k1.BilgiYaz(); k2.BilgiYaz();'],
    },
  ],
}
