import type { Chapter } from '../../engine/types'

export const koleksiyonlar: Chapter = {
  id: 'koleksiyonlar',
  title: 'Diziler ve Koleksiyonlar',
  subtitle: 'Nesneleri toplu hâlde saklamak: dizi ve List<T>',
  unit: 4,
  icon: '🗃️',
  color: '#fbbf24',
  levels: [
    {
      id: 'dizi-1',
      title: 'Dizi Tanımlama',
      ref: '4. Öğrenme Birimi',
      cards: [
        {
          icon: '🗄️',
          title: 'Dizi (Array)',
          body: 'Dizi, **aynı türden** birden çok veriyi tek bir isim altında saklar. Elemanlara **indis (index)** ile erişilir ve indis **0\'dan başlar**. Dizinin boyutu oluşturulurken belirlenir ve sonradan değişmez.',
          code: 'int[] notlar = new int[5];      // 5 elemanlı\nnotlar[0] = 85;                 // ilk eleman\nstring[] gunler = { "Pzt", "Sal", "Çar" };\nConsole.WriteLine(gunler.Length); // 3',
        },
      ],
      task: {
        kind: 'fill',
        prompt: 'Türkiye\'nin 81 ilinin adını tutacak bir dizi tanımla ve ilk ile son elemana değer ata.',
        code: '[[0]] sehirler = new string[[[1]]];\nsehirler[[[2]]] = "Adana";\nsehirler[[[3]]] = "Düzce";',
        blanks: [
          { accept: ['string[]'], width: 8 },
          { accept: ['81'], width: 2 },
          { accept: ['0'], width: 2 },
          { accept: ['80', 'sehirler.Length - 1', 'sehirler.Length-1'], width: 4 },
        ],
        explain: '81 elemanlı dizide indisler 0\'dan 80\'e kadardır. sehirler[81] yazmak çalışma anında IndexOutOfRangeException hatasına neden olur.',
      },
    },
    {
      id: 'dizi-2',
      title: 'Dizide Gezinme',
      ref: '4. Öğrenme Birimi',
      cards: [
        {
          icon: '🚶',
          title: 'for ve foreach',
          body: '**for** döngüsü indis ile, **foreach** döngüsü ise doğrudan elemanlar üzerinde gezinir. foreach ile elemanlar okunabilir ama döngü değişkenine yeni değer atanamaz.',
          code: 'foreach (int n in notlar)\n{\n    Console.WriteLine(n);\n}',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Program ekrana ne yazar? (Her değer ayrı satırda)',
        code: 'int[] sayilar = { 4, 9, 2, 7, 5 };\nint enBuyuk = sayilar[0];\nint toplam = 0;\n\nfor (int i = 0; i < sayilar.Length; i++)\n{\n    toplam += sayilar[i];\n    if (sayilar[i] > enBuyuk)\n        enBuyuk = sayilar[i];\n}\n\nConsole.WriteLine(toplam);\nConsole.WriteLine(enBuyuk);\nConsole.WriteLine(sayilar[sayilar.Length - 2]);',
        answers: ['27\n9\n7'],
        explain: 'Toplam 4+9+2+7+5 = 27, en büyük eleman 9. sayilar.Length - 2 = 3 olduğundan sayilar[3] = 7.',
      },
    },
    {
      id: 'dizi-3',
      title: 'Nesne Dizisi',
      ref: '4. Öğrenme Birimi',
      cards: [
        {
          icon: '👥',
          title: 'Dizide nesne saklamak',
          body: 'Diziler yalnızca sayıları değil **nesneleri** de tutabilir. Dikkat: `new Ogrenci[3]` yalnızca 3 boş (null) yer açar; her eleman için ayrıca `new Ogrenci(...)` yazılmalıdır.',
          code: 'Ogrenci[] sinif = new Ogrenci[3];\nsinif[0] = new Ogrenci("Ali", 85);',
        },
      ],
      task: {
        kind: 'code',
        prompt: '3 elemanlı bir `Ogrenci[]` dizisi oluştur, her elemana `new Ogrenci(...)` ile bir öğrenci yerleştir. Ardından **foreach** ile dizide gezinip her öğrencinin `Ad` ve `Puan` bilgisini yazdır.',
        starter: 'class Ogrenci\n{\n    public string Ad { get; set; }\n    public int Puan { get; set; }\n\n    public Ogrenci(string ad, int puan)\n    {\n        Ad = ad;\n        Puan = puan;\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n\n    }\n}\n',
        solution: 'class Ogrenci\n{\n    public string Ad { get; set; }\n    public int Puan { get; set; }\n\n    public Ogrenci(string ad, int puan)\n    {\n        Ad = ad;\n        Puan = puan;\n    }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Ogrenci[] sinif = new Ogrenci[3];\n        sinif[0] = new Ogrenci("Ali", 85);\n        sinif[1] = new Ogrenci("Ayşe", 92);\n        sinif[2] = new Ogrenci("Can", 78);\n\n        foreach (Ogrenci o in sinif)\n        {\n            Console.WriteLine(o.Ad + ": " + o.Puan);\n        }\n    }\n}\n',
        rules: [
          { t: 'source', goal: '3 elemanlı bir Ogrenci dizisi tanımla', regex: 'Ogrenci\\s*\\[\\s*\\]\\s+\\w+\\s*=\\s*(new\\s+Ogrenci\\s*\\[\\s*3\\s*\\]|\\{)' },
          { t: 'new', goal: '3 öğrenci nesnesi oluştur', type: 'Ogrenci', args: 2, min: 3 },
          { t: 'source', goal: 'foreach ile dizide gezin', regex: 'foreach\\s*\\(\\s*(Ogrenci|var)\\s+\\w+\\s+in\\s+\\w+\\s*\\)' },
          { t: 'source', goal: 'Döngüde Ad ve Puan bilgisini yazdır', regex: 'WriteLine\\([^;]*\\.Ad[^;]*\\.Puan|WriteLine\\([^;]*\\.Puan[^;]*\\.Ad' },
        ],
        explain: 'Dizinin her elemanı bir Ogrenci nesnesine referanstır. foreach döngüsü her turda sıradaki öğrenciyi o değişkenine verir.',
        output: 'Ali: 85\nAyşe: 92\nCan: 78',
      },
      hints: ['Ogrenci[] sinif = new Ogrenci[3];', 'sinif[0] = new Ogrenci("Ali", 85);', 'foreach (Ogrenci o in sinif) { Console.WriteLine(o.Ad + ": " + o.Puan); }'],
    },
    {
      id: 'dizi-4',
      title: 'List<T> Koleksiyonu',
      ref: '4. Öğrenme Birimi',
      cards: [
        {
          icon: '📋',
          title: 'Esnek boyutlu liste',
          body: 'Dizilerin boyutu sabittir. **List<T>** ise eleman eklendikçe büyüyen, çıkarıldıkça küçülen bir koleksiyondur. `T` yerine listede tutulacak tür yazılır: `List<string>`, `List<Ogrenci>`…\n• **Add(x)**: sona ekler • **Remove(x)**: siler • **Insert(i, x)**: araya ekler • **Count**: eleman sayısı • **Clear()**: listeyi boşaltır',
          code: 'List<string> sehirler = new List<string>();\nsehirler.Add("İzmir");\nConsole.WriteLine(sehirler.Count);',
        },
      ],
      task: {
        kind: 'fill',
        prompt: 'Bir alışveriş listesini yöneten kodu tamamla.',
        code: '[[0]]<string> liste = new List<string>();\nliste.[[1]]("Ekmek");\nliste.Add("Süt");\nliste.Add("Peynir");\nliste.[[2]]("Süt");\nConsole.WriteLine("Ürün sayısı: " + liste.[[3]]);',
        blanks: [
          { accept: ['List'], width: 4 },
          { accept: ['Add'], width: 3 },
          { accept: ['Remove'], width: 6 },
          { accept: ['Count'], width: 5 },
        ],
        explain: 'List<string> metin tutan bir listedir. Add ekler, Remove siler; Count bir özelliktir (metot değil), bu yüzden parantez almaz. Sonuç: Ürün sayısı: 2',
      },
    },
    {
      id: 'dizi-5',
      title: 'Liste İşlemleri',
      ref: '4. Öğrenme Birimi',
      cards: [
        {
          icon: '🔀',
          title: 'Insert ve indisler',
          body: '`Insert(indis, eleman)` elemanı verilen konuma yerleştirir ve sonraki elemanları bir kaydırır. `RemoveAt(indis)` verilen konumdaki elemanı siler.',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Program ekrana ne yazar? (Her değer ayrı satırda)',
        code: 'List<int> l = new List<int>();\nl.Add(10);\nl.Add(20);\nl.Add(30);\nl.Insert(1, 15);\nl.Remove(30);\nl.Add(40);\nl.RemoveAt(0);\n\nConsole.WriteLine(l.Count);\nConsole.WriteLine(l[0]);\nforeach (int x in l)\n    Console.WriteLine(x);',
        answers: ['3\n15\n15\n20\n40'],
        explain: '[10,20,30] → Insert(1,15) → [10,15,20,30] → Remove(30) → [10,15,20] → Add(40) → [10,15,20,40] → RemoveAt(0) → [15,20,40]. Count 3, l[0] 15.',
      },
    },
    {
      id: 'dizi-6',
      title: 'Bölüm Sonu: Kütüphane Rafı',
      boss: true,
      xp: 25,
      ref: '4. Öğrenme Birimi',
      cards: [
        {
          icon: '📚',
          title: 'Nesne listesi',
          body: 'Gerçek projelerde nesneler çoğunlukla **List<T>** içinde tutulur. Ders kitabındaki form uygulamalarında da öğrenciler bir `List<Ogrenciler>` koleksiyonunda saklanır ve DataGridView\'e bağlanır.',
        },
      ],
      task: {
        kind: 'code',
        prompt: '`Kitap` sınıfını yaz: public `string Ad { get; set; }` ve `int SayfaSayisi { get; set; }` özellikleri olsun. Main içinde bir `List<Kitap>` oluştur, **Add** ile en az 3 kitap ekle, foreach ile dolaşıp **toplam sayfa sayısını** hesapla ve yazdır.',
        starter: 'class Kitap\n{\n\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n\n    }\n}\n',
        solution: 'class Kitap\n{\n    public string Ad { get; set; }\n    public int SayfaSayisi { get; set; }\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        List<Kitap> raf = new List<Kitap>();\n        raf.Add(new Kitap { Ad = "Nutuk", SayfaSayisi = 600 });\n        raf.Add(new Kitap { Ad = "Simyacı", SayfaSayisi = 188 });\n        raf.Add(new Kitap { Ad = "Küçük Prens", SayfaSayisi = 112 });\n\n        int toplam = 0;\n        foreach (Kitap k in raf)\n        {\n            toplam += k.SayfaSayisi;\n        }\n        Console.WriteLine("Toplam sayfa: " + toplam);\n    }\n}\n',
        rules: [
          { t: 'property', goal: 'public string Ad { get; set; }', cls: 'Kitap', name: 'Ad', type: 'string', get: true, set: true },
          { t: 'property', goal: 'public int SayfaSayisi { get; set; }', cls: 'Kitap', name: 'SayfaSayisi', type: 'int', get: true, set: true },
          { t: 'source', goal: 'List<Kitap> türünde bir liste oluştur', regex: 'new\\s+List\\s*<\\s*Kitap\\s*>\\s*\\(' },
          { t: 'call', goal: 'Add ile en az 3 kitap ekle', member: 'Add', min: 3 },
          { t: 'new', goal: '3 Kitap nesnesi oluştur', type: 'Kitap', min: 3 },
          { t: 'source', goal: 'foreach ile toplam sayfa sayısını hesapla', regex: 'foreach\\s*\\([\\s\\S]*\\+=\\s*\\w+\\.SayfaSayisi|foreach\\s*\\([\\s\\S]*=\\s*\\w+\\s*\\+\\s*\\w+\\.SayfaSayisi' },
        ],
        explain: 'new Kitap { Ad = "...", SayfaSayisi = ... } yazımına nesne başlatıcı (object initializer) denir; nesneyi oluşturup özelliklerine tek satırda değer verir.',
        output: 'Toplam sayfa: 900',
      },
      hints: ['List<Kitap> raf = new List<Kitap>();', 'raf.Add(new Kitap { Ad = "Nutuk", SayfaSayisi = 600 });', 'foreach (Kitap k in raf) toplam += k.SayfaSayisi;'],
    },
  ],
}
