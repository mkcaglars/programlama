import type { Chapter } from '../../engine/types'

export const temeller: Chapter = {
  id: 'temeller',
  title: 'C# Temelleri',
  subtitle: 'Değişkenler, veri türleri, karar ve döngü yapıları',
  unit: 1,
  icon: '🧰',
  color: '#38bdf8',
  levels: [
    {
      id: 'temeller-1',
      title: 'Değişkenler ve Veri Türleri',
      ref: '1. Öğrenme Birimi',
      cards: [
        {
          icon: '📦',
          title: 'Değişken nedir?',
          body: 'Değişken, program çalışırken verileri bellekte saklamak için kullanılan **isimlendirilmiş kutulardır**. C# dilinde her değişkenin bir **veri türü** vardır ve tür, kutuya ne konulabileceğini belirler.',
          code: 'int yas = 16;\ndouble boy = 1.72;\nstring ad = "Elif";\nchar harf = \'A\';\nbool ogrenciMi = true;',
        },
        {
          icon: '🏷️',
          title: 'İsimlendirme kuralları',
          body: 'Değişken isimleri **rakamla başlayamaz**, **boşluk içeremez** ve C#\'ın anahtar sözcükleri (int, class, if…) isim olarak kullanılamaz. C# **büyük/küçük harfe duyarlıdır**: `sayi` ile `Sayi` farklı değişkenlerdir.',
        },
      ],
      task: {
        kind: 'quiz',
        question: 'Aşağıdaki değişken tanımlamalarından hangisi **doğrudur**?',
        options: ['int 2sayi = 5;', 'double ogrenci notu = 85.5;', 'char harf = "A";', 'string sehirAdi = "Ankara";', 'int fiyat = 12.5;'],
        answer: 3,
        explain: 'Değişken isimleri rakamla başlayamaz ve boşluk içeremez. char türüne tek tırnak içinde tek bir karakter atanır (\'A\'). Ondalıklı sayılar int türünde saklanamaz. Doğru olan: `string sehirAdi = "Ankara";`',
      },
    },
    {
      id: 'temeller-2',
      title: 'Hatalı Tanımlamalar',
      ref: '1. Öğrenme Birimi',
      cards: [
        {
          icon: '🔍',
          title: 'Derleyici seni uyarır',
          body: 'Kod yazarken yapılan hatalar **derleme hatası** olarak gösterilir ve program çalışmaz. Hata Listesi panelindeki mesajları okumak, hatayı bulmanın en hızlı yoludur.',
        },
      ],
      task: {
        kind: 'bug',
        prompt: 'Aşağıdaki kodda **hatalı** olan bütün satırları bul ve tıkla.',
        code: 'string ad soyad = "Ali Can";\nint 1sinif = 11;\nint yas = 17;\ndouble ortalama = 78.5;\nint kilo = 65.5;\nchar cinsiyet = "E";\nbool durum = true;',
        bugLines: [1, 2, 5, 6],
        explain: 'Satır 1: değişken isminde boşluk olamaz. Satır 2: isim rakamla başlayamaz. Satır 5: ondalıklı sayı int türünde tanımlanamaz. Satır 6: char türüne tek tırnak içinde tek karakter atanır (\'E\').',
      },
    },
    {
      id: 'temeller-3',
      title: 'Tür Dönüşümleri',
      ref: '1. Öğrenme Birimi',
      cards: [
        {
          icon: '🔄',
          title: 'Metni sayıya çevirmek',
          body: 'Kullanıcının klavyeden girdiği veriler (Console.ReadLine() veya textBox1.Text) her zaman **string** türündedir. Hesaplama yapmak için önce sayıya dönüştürmek gerekir: `Convert.ToInt32(...)`, `Convert.ToDouble(...)`.',
          code: 'int sayi = Convert.ToInt32(Console.ReadLine());\ndouble sonuc = sayi * 0.18;',
        },
        {
          icon: '💬',
          title: 'Sayıyı metne çevirmek',
          body: 'Bir sayıyı metin olarak göstermek için `.ToString()` metodu kullanılır. Örneğin `MessageBox.Show(sonuc.ToString());`',
        },
      ],
      task: {
        kind: 'fill',
        prompt: 'Kullanıcının girdiği fiyatın KDV tutarını (%18) hesaplayan kodu tamamla.',
        code: 'int fiyat = Convert.[[0]](Console.ReadLine());\n[[1]] kdv = fiyat * 0.18;\nConsole.WriteLine("KDV: " + kdv.[[2]]());',
        blanks: [
          { accept: ['ToInt32'], width: 8 },
          { accept: ['double', 'decimal', 'var'], width: 7 },
          { accept: ['ToString'], width: 8 },
        ],
        explain: 'Console.ReadLine() string döndürür; Convert.ToInt32 ile tam sayıya çevrilir. 0.18 ile çarpım ondalıklı olduğu için sonuç double türünde saklanır. ToString() sayıyı metne çevirir.',
      },
    },
    {
      id: 'temeller-4',
      title: 'Karar Yapıları',
      ref: '2. Öğrenme Birimi',
      cards: [
        {
          icon: '🔀',
          title: 'if – else if – else',
          body: 'Program, koşulun **true** ya da **false** olmasına göre farklı yollar izler. Koşullar yukarıdan aşağı sırayla denetlenir ve **ilk doğru** olan bloğu çalışır; diğerleri atlanır.',
          code: 'if (not >= 85)\n    Console.WriteLine("Pekiyi");\nelse if (not >= 70)\n    Console.WriteLine("İyi");\nelse\n    Console.WriteLine("Geliştirilmeli");',
        },
        {
          icon: '🧮',
          title: 'Mantıksal operatörler',
          body: '`&&` (ve): iki koşul da doğruysa doğru. `||` (veya): koşullardan biri doğruysa doğru. `!` (değil): koşulu tersine çevirir.',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Bu kod çalıştığında ekranda ne yazar?',
        code: 'int a = 12, b = 7, c = 12;\n\nif (a > b && a > c)\n    Console.WriteLine("a en büyük");\nelse if (a == c || b > c)\n    Console.WriteLine("eşitlik var");\nelse\n    Console.WriteLine("hiçbiri");',
        answers: ['eşitlik var'],
        explain: 'a > c koşulu yanlıştır (12 > 12 değil), bu yüzden && ile bağlanan ilk koşul false olur. İkinci koşulda a == c doğrudur; || için tek doğru yeterlidir → "eşitlik var".',
      },
    },
    {
      id: 'temeller-5',
      title: 'Döngüler',
      ref: '2. Öğrenme Birimi',
      cards: [
        {
          icon: '🔁',
          title: 'for döngüsü',
          body: 'for döngüsü üç bölümden oluşur: **başlangıç**; **koşul**; **artış**. Koşul doğru olduğu sürece blok tekrar tekrar çalışır.',
          code: 'for (int i = 1; i <= 5; i++)\n{\n    Console.WriteLine(i);\n}',
        },
      ],
      task: {
        kind: 'predict',
        prompt: 'Faktöriyel hesaplayan bu döngünün çıktısını yaz (her değer ayrı satırda).',
        code: 'int sonuc = 1;\nfor (int tur = 1; tur <= 5; tur++)\n{\n    sonuc = sonuc * tur;\n    Console.WriteLine(sonuc);\n}',
        answers: ['1\n2\n6\n24\n120'],
        explain: 'Her turda sonuç tur sayısıyla çarpılır: 1, 1×2=2, 2×3=6, 6×4=24, 24×5=120.',
      },
    },
    {
      id: 'temeller-6',
      title: 'Bölüm Sonu: Not Hesaplayıcı',
      boss: true,
      xp: 20,
      ref: '2. Öğrenme Birimi',
      cards: [
        {
          icon: '🏁',
          title: 'Bölüm sonu görevi',
          body: 'Değişkenleri, karar yapılarını ve döngüleri bir arada kullanma zamanı! Bu görevde gerçek bir C# programı yazacaksın. Kodun **kurallı derleyicimiz** tarafından denetlenecek.',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Üç sınav notunun ortalamasını hesaplayan ve 50 ve üzeri ise "Geçti", değilse "Kaldı" yazan programı tamamla.',
        starter: 'class Program\n{\n    static void Main(string[] args)\n    {\n        int not1 = 70;\n        int not2 = 45;\n        int not3 = 60;\n\n        // ortalama değişkenini tanımla ve hesapla\n\n        // if-else ile Geçti / Kaldı yazdır\n    }\n}\n',
        solution: 'class Program\n{\n    static void Main(string[] args)\n    {\n        int not1 = 70;\n        int not2 = 45;\n        int not3 = 60;\n\n        double ortalama = (not1 + not2 + not3) / 3.0;\n        Console.WriteLine("Ortalama: " + ortalama);\n\n        if (ortalama >= 50)\n            Console.WriteLine("Geçti");\n        else\n            Console.WriteLine("Kaldı");\n    }\n}\n',
        rules: [
          { t: 'source', goal: 'ortalama adında bir değişken tanımla', regex: '(double|float|decimal|int|var)\\s+ortalama\\s*=' },
          { t: 'source', goal: 'Üç notu toplayıp 3\'e böl', regex: 'not1\\s*\\+\\s*not2\\s*\\+\\s*not3' },
          { t: 'source', goal: 'if-else yapısı kullan', regex: 'if\\s*\\([^)]*ortalama[^)]*\\)[\\s\\S]*else' },
          { t: 'source', goal: '"Geçti" ve "Kaldı" mesajlarını yazdır', has: ['"Geçti"', '"Kaldı"'] },
        ],
        explain: 'Tam sayıları 3 yerine 3.0\'a bölmek, sonucun ondalıklı hesaplanmasını sağlar. (not1 + not2 + not3) / 3 yazılsaydı tam sayı bölmesi yapılır ve küsurat kaybolurdu.',
        output: 'Ortalama: 58,3333333333333\nGeçti',
      },
      hints: ['double ortalama = (not1 + not2 + not3) / 3.0;', 'if (ortalama >= 50) { ... } else { ... }'],
    },
  ],
}
