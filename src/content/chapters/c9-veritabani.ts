import type { Chapter } from '../../engine/types'
import type { Database } from '../../engine/sql'

const kutuphane: Database = {
  kitaplar: {
    name: 'kitaplar',
    columns: [
      { name: 'id', type: 'INT', pk: true, autoInc: true },
      { name: 'ad', type: 'VARCHAR(60)', notNull: true },
      { name: 'yazar', type: 'VARCHAR(40)' },
      { name: 'tur', type: 'VARCHAR(20)' },
      { name: 'sayfa', type: 'INT' },
      { name: 'stok', type: 'INT' },
    ],
    rows: [
      { id: 1, ad: 'Nutuk', yazar: 'Mustafa Kemal Atatürk', tur: 'Tarih', sayfa: 600, stok: 4 },
      { id: 2, ad: 'Çalıkuşu', yazar: 'Reşat Nuri Güntekin', tur: 'Roman', sayfa: 544, stok: 2 },
      { id: 3, ad: 'Simyacı', yazar: 'Paulo Coelho', tur: 'Roman', sayfa: 188, stok: 0 },
      { id: 4, ad: 'Küçük Prens', yazar: 'Antoine de Saint-Exupéry', tur: 'Çocuk', sayfa: 112, stok: 6 },
      { id: 5, ad: 'Kuyucaklı Yusuf', yazar: 'Sabahattin Ali', tur: 'Roman', sayfa: 232, stok: 3 },
      { id: 6, ad: 'Bilim Tarihi', yazar: 'Cemal Yıldırım', tur: 'Bilim', sayfa: 384, stok: 1 },
    ],
  },
  uyeler: {
    name: 'uyeler',
    columns: [
      { name: 'id', type: 'INT', pk: true, autoInc: true },
      { name: 'ad', type: 'VARCHAR(30)' },
      { name: 'soyad', type: 'VARCHAR(30)' },
      { name: 'sinif', type: 'VARCHAR(5)' },
    ],
    rows: [
      { id: 1, ad: 'Elif', soyad: 'Kaya', sinif: '11A' },
      { id: 2, ad: 'Mert', soyad: 'Demir', sinif: '11B' },
      { id: 3, ad: 'Zeynep', soyad: 'Aydın', sinif: '11A' },
    ],
  },
  odunc: {
    name: 'odunc',
    columns: [
      { name: 'id', type: 'INT', pk: true, autoInc: true },
      { name: 'kitap_id', type: 'INT' },
      { name: 'uye_id', type: 'INT' },
      { name: 'tarih', type: 'DATE' },
    ],
    rows: [
      { id: 1, kitap_id: 2, uye_id: 1, tarih: '2026-09-15' },
      { id: 2, kitap_id: 4, uye_id: 3, tarih: '2026-09-18' },
      { id: 3, kitap_id: 1, uye_id: 2, tarih: '2026-09-20' },
      { id: 4, kitap_id: 5, uye_id: 1, tarih: '2026-09-25' },
    ],
  },
}

const sirket: Database = {
  personel: {
    name: 'personel',
    columns: [
      { name: 'id', type: 'INT', pk: true, autoInc: true },
      { name: 'ad', type: 'VARCHAR(30)' },
      { name: 'soyad', type: 'VARCHAR(30)' },
      { name: 'departman', type: 'VARCHAR(20)' },
      { name: 'maas', type: 'DECIMAL(10,2)' },
      { name: 'ise_baslama', type: 'DATE' },
    ],
    rows: [
      { id: 1, ad: 'Ahmet', soyad: 'Yılmaz', departman: 'Yazılım', maas: 18000, ise_baslama: '2019-03-01' },
      { id: 2, ad: 'Ayşe', soyad: 'Kara', departman: 'Muhasebe', maas: 9500, ise_baslama: '2021-06-15' },
      { id: 3, ad: 'Burak', soyad: 'Şahin', departman: 'Yazılım', maas: 14000, ise_baslama: '2022-01-10' },
      { id: 4, ad: 'Deniz', soyad: 'Öztürk', departman: 'Satış', maas: 8800, ise_baslama: '2023-09-04' },
      { id: 5, ad: 'Ece', soyad: 'Arslan', departman: 'Satış', maas: 11200, ise_baslama: '2018-11-20' },
    ],
  },
}

export const veritabani: Chapter = {
  id: 'veritabani',
  title: 'Veri Tabanı İşlemleri',
  subtitle: 'SQL, ilişkisel tablolar, ADO.NET ve Entity Framework',
  unit: 6,
  icon: '🗄️',
  color: '#4ade80',
  levels: [
    {
      id: 'vt-1',
      title: 'Veri Tabanı Kavramları',
      ref: '6.1 – 6.2',
      cards: [
        {
          icon: '🗄️',
          title: 'Neden veri tabanı?',
          body: 'Program kapandığında değişkenlerdeki ve nesnelerdeki veriler **kaybolur**. Verilerin kalıcı olarak saklanması için **veri tabanı** kullanılır. Veri tabanı bir veya birden fazla **tablo**dan oluşur. e-Okul, e-Devlet, sosyal medya… hepsinin arkasında veri tabanı vardır.',
        },
        {
          icon: '🧭',
          title: 'VTYS ve SQL',
          body: 'Veri tabanları **VTYS** (Veri Tabanı Yönetim Sistemi) adı verilen yazılımlarla yönetilir: MySQL, SQL Server, Oracle, SQLite, PostgreSQL… Ders kitabında açık kaynak kodlu ve ücretsiz olan **MySQL** kullanılır. Veri tabanıyla konuşmak için **SQL** (Yapılandırılmış Sorgu Dili) kullanılır.',
        },
      ],
      task: {
        kind: 'match',
        prompt: 'Veri tabanı terimlerini açıklamalarıyla eşleştir.',
        pairs: [
          { left: 'Tablo', right: 'Satır ve sütunlardan oluşan veri yapısı' },
          { left: 'Kayıt (satır)', right: 'Tek bir varlığa ait verilerin tamamı' },
          { left: 'Alan (sütun)', right: 'Tüm kayıtlarda aynı türde tutulan bilgi' },
          { left: 'Birincil anahtar', right: 'Her kaydı benzersiz olarak tanımlayan alan' },
          { left: 'VTYS', right: 'Veri tabanını yöneten yazılım (MySQL gibi)' },
          { left: 'SQL', right: 'Veri tabanı ile iletişim kurmak için kullanılan sorgu dili' },
        ],
        explain: 'Bir tabloda her satır bir kayıttır, her sütun bir alandır. Birincil anahtar (Primary Key) genellikle otomatik artan bir id alanıdır.',
      },
    },
    {
      id: 'vt-2',
      title: 'Sınıftan Tabloya',
      ref: '6.7',
      cards: [
        {
          icon: '🔁',
          title: 'Nesne ↔ Satır',
          body: 'NTP ile veri tabanı arasında doğal bir eşleşme vardır: bir **sınıf** bir **tabloya**, sınıfın **özellikleri** tablonun **sütunlarına**, her **nesne** ise tablodaki bir **satıra** karşılık gelir. Bu eşleştirmeyi otomatik yapan araçlara **ORM** (Object Relational Mapping) denir.',
          code: 'class Kitap           ⇄  kitaplar tablosu\n{\n    int Id            ⇄  id sütunu\n    string Ad         ⇄  ad sütunu\n}\nnew Kitap {...}      ⇄  bir satır (kayıt)',
        },
      ],
      task: {
        kind: 'match',
        prompt: 'Nesne tabanlı programlama kavramlarını veri tabanındaki karşılıklarıyla eşleştir.',
        pairs: [
          { left: 'Sınıf (class Kitap)', right: 'Tablo (kitaplar)' },
          { left: 'Özellik (public string Ad)', right: 'Sütun (ad)' },
          { left: 'Nesne (new Kitap)', right: 'Satır / kayıt' },
          { left: 'Özelliğin veri türü (int, string)', right: 'Sütunun veri türü (INT, VARCHAR)' },
          { left: 'List<Kitap>', right: 'Sorgu sonucunda dönen kayıtlar' },
        ],
        explain: 'Entity Framework gibi ORM araçları bu eşleştirmeyi kullanarak SQL yazmadan nesnelerle veri tabanı işlemleri yapmayı sağlar.',
      },
    },
    {
      id: 'vt-3',
      title: 'SELECT: Verileri Listele',
      ref: '6.4',
      cards: [
        {
          icon: '🔎',
          title: 'SELECT ... FROM ...',
          body: 'SELECT sorgusu tablodaki verileri listeler. `*` tüm sütunları ifade eder; istenirse sütun adları virgülle yazılır.',
          code: 'SELECT * FROM kitaplar;\nSELECT ad, yazar FROM kitaplar;',
        },
      ],
      task: {
        kind: 'sql',
        prompt: 'kitaplar tablosundan yalnızca **ad** ve **yazar** sütunlarını listele.',
        db: kutuphane,
        starter: 'SELECT ',
        solution: 'SELECT ad, yazar FROM kitaplar;',
        check: 'select',
        explain: 'Yalnızca ihtiyaç duyulan sütunları seçmek, özellikle büyük tablolarda sorguyu hızlandırır.',
      },
    },
    {
      id: 'vt-4',
      title: 'WHERE: Filtrele',
      ref: '6.4',
      cards: [
        {
          icon: '🧲',
          title: 'Koşullu sorgu',
          body: 'WHERE ile yalnızca koşulu sağlayan kayıtlar getirilir. Karşılaştırma: `= <> < > <= >=`. Birleştirme: `AND`, `OR`. Metin değerleri **tek tırnak** içinde yazılır. `LIKE \'A%\'` A ile başlayanları, `BETWEEN 100 AND 300` aralığı bulur.',
          code: "SELECT * FROM kitaplar WHERE tur = 'Roman' AND sayfa > 200;",
        },
      ],
      task: {
        kind: 'sql',
        prompt: "Türü **'Roman'** olan ve **stokta bulunan** (stok > 0) kitapların tüm bilgilerini listele.",
        db: kutuphane,
        starter: 'SELECT * FROM kitaplar WHERE ',
        solution: "SELECT * FROM kitaplar WHERE tur = 'Roman' AND stok > 0;",
        check: 'select',
        explain: "Simyacı da bir roman ama stoğu 0 olduğu için listelenmez. İki koşulun birlikte sağlanması gerektiği için AND kullanılır.",
      },
    },
    {
      id: 'vt-5',
      title: 'ORDER BY: Sırala',
      ref: '6.4',
      cards: [
        {
          icon: '📶',
          title: 'Sıralama',
          body: 'ORDER BY ile sonuçlar sıralanır. **ASC** küçükten büyüğe (varsayılan), **DESC** büyükten küçüğe sıralar.',
          code: 'SELECT * FROM personel ORDER BY ise_baslama ASC;',
        },
      ],
      task: {
        kind: 'sql',
        prompt: 'Personelleri **maaşlarına göre büyükten küçüğe** doğru sıralayan SQL sorgusunu yaz (ad, soyad ve maas sütunları gelsin).',
        db: sirket,
        solution: 'SELECT ad, soyad, maas FROM personel ORDER BY maas DESC;',
        check: 'select',
        ordered: true,
        explain: 'DESC (descending) azalan sıralama yapar. Ders kitabındaki alıştırma: "Personelleri maaşlarına göre büyükten küçüğe doğru sıralayan SQL sorgusunu yazınız."',
      },
    },
    {
      id: 'vt-6',
      title: 'INSERT: Kayıt Ekle',
      ref: '6.4',
      cards: [
        {
          icon: '➕',
          title: 'INSERT INTO',
          body: 'Tabloya yeni kayıt eklemek için INSERT kullanılır. AUTO_INCREMENT olan id sütunu yazılmaz; veri tabanı otomatik verir.',
          code: "INSERT INTO uyeler (ad, soyad, sinif)\nVALUES ('Ali', 'Çelik', '11C');",
        },
      ],
      task: {
        kind: 'sql',
        prompt: "kitaplar tablosuna şu kitabı ekle: ad **'Sefiller'**, yazar **'Victor Hugo'**, tur **'Roman'**, sayfa **1488**, stok **2**.",
        db: kutuphane,
        starter: 'INSERT INTO kitaplar ',
        solution: "INSERT INTO kitaplar (ad, yazar, tur, sayfa, stok) VALUES ('Sefiller', 'Victor Hugo', 'Roman', 1488, 2);",
        check: 'change',
        explain: 'Sütun listesi ile değer listesi aynı sırada ve aynı sayıda olmalıdır. id sütunu otomatik olarak 7 değerini alır.',
      },
    },
    {
      id: 'vt-7',
      title: 'UPDATE: Zam Zamanı',
      ref: '6.4',
      cards: [
        {
          icon: '✏️',
          title: 'UPDATE ... SET ... WHERE',
          body: 'Mevcut kayıtları değiştirmek için UPDATE kullanılır. **Dikkat:** WHERE yazmazsan tablodaki **tüm** kayıtlar güncellenir!',
          code: "UPDATE kitaplar SET stok = stok + 5 WHERE id = 3;",
        },
      ],
      task: {
        kind: 'sql',
        prompt: 'Maaşı **10.000 liranın altında** olan personelin maaşına **%5 zam** yapan SQL sorgusunu yaz.',
        db: sirket,
        starter: 'UPDATE personel ',
        solution: 'UPDATE personel SET maas = maas * 1.05 WHERE maas < 10000;',
        check: 'change',
        explain: 'maas * 1.05, maaşı %5 artırır (maas + maas * 0.05 de aynı sonucu verir). WHERE koşulu sayesinde yalnızca Ayşe ve Deniz\'in maaşları değişir.',
      },
    },
    {
      id: 'vt-8',
      title: 'DELETE: Kayıt Sil',
      ref: '6.4',
      cards: [
        {
          icon: '🗑️',
          title: 'DELETE FROM ... WHERE',
          body: 'Kayıt silmek için DELETE kullanılır. UPDATE gibi DELETE de **WHERE olmadan tüm tabloyu boşaltır**. Gerçek sistemlerde silmeden önce mutlaka yedek alınır.',
        },
      ],
      task: {
        kind: 'sql',
        prompt: 'Stoğu **0** olan kitapları kitaplar tablosundan sil.',
        db: kutuphane,
        starter: 'DELETE FROM kitaplar ',
        solution: 'DELETE FROM kitaplar WHERE stok = 0;',
        check: 'change',
        explain: 'Yalnızca Simyacı silinir. WHERE stok = 0 yazmasaydın tüm kitaplar silinirdi!',
      },
    },
    {
      id: 'vt-9',
      title: 'CREATE TABLE',
      ref: '6.3',
      cards: [
        {
          icon: '🧱',
          title: 'Tablo oluşturma',
          body: 'Her sütun için bir **ad** ve **veri türü** belirtilir: `INT` tam sayı, `VARCHAR(n)` en fazla n karakterlik metin, `DATE` tarih, `DECIMAL(10,2)` ondalıklı sayı. `PRIMARY KEY` birincil anahtar, `AUTO_INCREMENT` otomatik artan, `NOT NULL` boş bırakılamaz demektir.',
          code: 'CREATE TABLE yazarlar (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    ad VARCHAR(50) NOT NULL\n);',
        },
      ],
      task: {
        kind: 'sql',
        prompt: '**kategoriler** adında bir tablo oluştur: `id` (INT, birincil anahtar, otomatik artan), `ad` (VARCHAR(30), boş olamaz) ve `aciklama` (VARCHAR(100)).',
        db: kutuphane,
        starter: 'CREATE TABLE kategoriler (\n    \n);',
        solution: 'CREATE TABLE kategoriler (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    ad VARCHAR(30) NOT NULL,\n    aciklama VARCHAR(100)\n);',
        check: 'change',
        explain: 'Bir tabloda yalnızca bir birincil anahtar olabilir. Birincil anahtarın her kayıtta farklı olması, kayıtları birbirinden ayırt etmeyi sağlar.',
      },
    },
    {
      id: 'vt-10',
      title: 'İlişkisel Veri Tabanı: JOIN',
      ref: '6.5',
      cards: [
        {
          icon: '🔗',
          title: 'Tabloları ilişkilendirme',
          body: 'İlişkisel veri tabanlarında veriler tekrar etmemesi için ayrı tablolara bölünür (**normalizasyon**). odunc tablosu kitabın adını değil yalnızca **kitap_id**\'sini tutar. Tabloları birleştirip anlamlı sonuç almak için **JOIN** kullanılır.',
          code: 'SELECT u.ad, k.ad\nFROM odunc o\nINNER JOIN uyeler u ON o.uye_id = u.id\nINNER JOIN kitaplar k ON o.kitap_id = k.id;',
        },
      ],
      task: {
        kind: 'sql',
        prompt: 'odunc tablosunu kitaplar tablosuyla birleştirerek ödünç verilen her kitabın **adını** ve ödünç **tarihini** listele.',
        db: kutuphane,
        starter: 'SELECT k.ad, o.tarih\nFROM odunc o\n',
        solution: 'SELECT k.ad, o.tarih FROM odunc o INNER JOIN kitaplar k ON o.kitap_id = k.id;',
        check: 'select',
        explain: 'ON koşulu, odunc tablosundaki kitap_id ile kitaplar tablosundaki id değerini eşleştirir. Bu ilişkiye yabancı anahtar (foreign key) ilişkisi denir.',
      },
    },
    {
      id: 'vt-11',
      title: 'Normalizasyon',
      ref: '6.5',
      cards: [
        {
          icon: '✂️',
          title: 'Tekrarlardan kurtulmak',
          body: 'Her ödünç kaydında üyenin adını, soyadını, sınıfını tekrar tekrar yazmak hem yer kaplar hem de hatalara yol açar (bir yerde güncellenip diğerinde unutulabilir). Çözüm: tabloyu **daha küçük ve ilişkili** tablolara ayırmak.',
        },
      ],
      task: {
        kind: 'quiz',
        question: 'Veri tabanlarında çok fazla sütun ve satırdan oluşan bir tabloyu **tekrarlardan arındırmak** için daha az satır ve sütun içeren alt kümelere ayrıştırma işlemine ne ad verilir?',
        options: ['İyileştirme', 'İlişkisel veri tabanı', 'Normalizasyon', 'Veri tabanı tasarımı', 'Tablo oluşturma'],
        answer: 2,
        explain: 'Normalizasyon; veri tekrarını azaltır, tutarlılığı artırır. Ayrılan tablolar birincil ve yabancı anahtarlarla ilişkilendirilir.',
      },
    },
    {
      id: 'vt-12',
      title: 'C# ile Veri Tabanına Bağlan',
      ref: '6.7',
      cards: [
        {
          icon: '🔌',
          title: 'MySQL sınıfları',
          body: '**MySqlConnection**: Veri tabanı ile bağlantının kurulması için kullanılır; parametre olarak bağlantı cümlesini alır.\n**MySqlCommand**: Sorgunun çalıştırılması için kullanılır. Çalıştırılacak sorgu **CommandText** ile belirtilir.\n**MySqlDataReader**: ExecuteReader metodu ile çalıştırılan sorgunun sonuçlarını satır satır okur.\n**ExecuteNonQuery()**: INSERT, UPDATE, DELETE gibi kayıt döndürmeyen sorguları çalıştırır.',
        },
      ],
      task: {
        kind: 'order',
        prompt: 'Kitap adlarını veri tabanından okuyup listBox1\'e ekleyen kodun satırlarını doğru sıraya diz.',
        lines: [
          'MySqlConnection baglanti = new MySqlConnection(baglantiCumlesi);',
          'baglanti.Open();',
          'MySqlCommand komut = new MySqlCommand("SELECT ad FROM kitaplar", baglanti);',
          'MySqlDataReader okuyucu = komut.ExecuteReader();',
          'while (okuyucu.Read())',
          '{',
          '    listBox1.Items.Add(okuyucu["ad"].ToString());',
          '}',
          'baglanti.Close();',
        ],
        explain: 'Önce bağlantı nesnesi oluşturulur ve açılır; komut bu bağlantı üzerinden çalıştırılır. Read() her çağrıldığında sonraki satıra geçer ve satır kalmayınca false döndürür. İş bitince bağlantı kapatılır.',
      },
    },
    {
      id: 'vt-13',
      title: 'ADO.NET Bilgi Yarışması',
      ref: '6.7',
      cards: [
        {
          icon: '❓',
          title: 'Hangisi ne işe yarar?',
          body: 'Veri tabanından gelen sonuçlar bir **DataTable** içine doldurulup **DataGridView** kontrolünün **DataSource** özelliğine atanarak tablo şeklinde gösterilebilir.',
        },
      ],
      task: {
        kind: 'match',
        prompt: 'ADO.NET üyelerini görevleriyle eşleştir.',
        pairs: [
          { left: 'CommandText', right: 'MySqlCommand nesnesinde çalıştırılacak sorgunun belirtildiği özellik' },
          { left: 'ExecuteNonQuery()', right: 'INSERT, UPDATE, DELETE sorgularını çalıştırır' },
          { left: 'ExecuteReader()', right: 'SELECT sonucunu okumak için bir DataReader döndürür' },
          { left: 'DataSource', right: 'DataGridView nesnesinin veri kaynağının belirtildiği özellik' },
          { left: 'ConnectionString', right: 'Sunucu, veri tabanı adı, kullanıcı ve şifre bilgisini tutar' },
        ],
        explain: 'ExecuteNonQuery etkilenen satır sayısını (int) döndürür. SELECT sorguları ise ExecuteReader veya MySqlDataAdapter ile çalıştırılır.',
      },
    },
    {
      id: 'vt-14',
      title: 'Entity Framework: Code First',
      ref: '6.9',
      cards: [
        {
          icon: '🧙',
          title: 'SQL yazmadan veri tabanı',
          body: '**Entity Framework**, .NET için bir ORM aracıdır. Üç yaklaşımı vardır:\n• **Database First**: Önce veri tabanı tasarlanır, sınıflar ondan üretilir.\n• **Model First**: Önce görsel model çizilir.\n• **Code First**: Önce **kodlarla sınıflar yazılır**, veri tabanındaki tablolar bu sınıflara göre oluşturulur.',
          code: 'class KutuphaneContext : DbContext\n{\n    public DbSet<Kitap> Kitaplar { get; set; }\n}',
        },
      ],
      task: {
        kind: 'quiz',
        question: 'Entity Framework\'te **ilk olarak kodlarla sınıfların yazılıp** daha sonra bu sınıflara göre veri tabanında tabloların oluşmasını sağlayan yaklaşım hangisidir?',
        options: ['Database First', 'Code First', 'ADO.NET', 'Model First', 'MySQL'],
        answer: 1,
        explain: 'Code First yaklaşımında entity sınıfları ve DbContext yazılır; tablolar bu sınıflardan otomatik oluşturulur. Nesne tabanlı tasarım doğrudan veri tabanına dönüşür!',
      },
    },
    {
      id: 'vt-15',
      title: 'Bölüm Sonu: Entity Sınıfları',
      boss: true,
      xp: 30,
      ref: '6.9',
      cards: [
        {
          icon: '🏆',
          title: 'Büyük final',
          body: 'Bu görevde öğrendiğin her şeyi birleştireceksin: sınıflar, özellikler, kalıtım ve koleksiyonlar. Code First yaklaşımıyla kütüphane veri tabanının modelini oluştur. Entity Framework, `Id` adlı özelliği otomatik olarak **birincil anahtar** kabul eder.',
          code: 'using (var db = new KutuphaneContext())\n{\n    db.Kitaplar.Add(new Kitap { Ad = "Nutuk" });\n    db.SaveChanges();   // INSERT sorgusu otomatik!\n}',
        },
      ],
      task: {
        kind: 'code',
        prompt: '**Kitap** entity sınıfını yaz: public `int Id`, `string Ad`, `string Yazar`, `int SayfaSayisi` otomatik özellikleri olsun. **Uye** sınıfı: `int Id`, `string Ad`, `string Soyad`. Ardından **DbContext**\'ten türeyen **KutuphaneContext** sınıfında `DbSet<Kitap> Kitaplar` ve `DbSet<Uye> Uyeler` özelliklerini tanımla.',
        starter: 'using System.Data.Entity;\n\nclass Kitap\n{\n\n}\n\nclass Uye\n{\n\n}\n\nclass KutuphaneContext\n{\n\n}\n',
        solution: 'using System.Data.Entity;\n\nclass Kitap\n{\n    public int Id { get; set; }\n    public string Ad { get; set; }\n    public string Yazar { get; set; }\n    public int SayfaSayisi { get; set; }\n}\n\nclass Uye\n{\n    public int Id { get; set; }\n    public string Ad { get; set; }\n    public string Soyad { get; set; }\n}\n\nclass KutuphaneContext : DbContext\n{\n    public DbSet<Kitap> Kitaplar { get; set; }\n    public DbSet<Uye> Uyeler { get; set; }\n}\n',
        rules: [
          { t: 'property', goal: 'Kitap: public int Id { get; set; }', cls: 'Kitap', name: 'Id', type: 'int', access: 'public', auto: true },
          { t: 'property', goal: 'Kitap: string Ad, Yazar özellikleri', cls: 'Kitap', name: 'Yazar', type: 'string', access: 'public', auto: true },
          { t: 'property', goal: 'Kitap: int SayfaSayisi', cls: 'Kitap', name: 'SayfaSayisi', type: 'int', access: 'public', auto: true },
          { t: 'property', goal: 'Uye: public int Id { get; set; }', cls: 'Uye', name: 'Id', type: 'int', access: 'public', auto: true },
          { t: 'property', goal: 'Uye: string Soyad', cls: 'Uye', name: 'Soyad', type: 'string', access: 'public', auto: true },
          { t: 'class', goal: 'KutuphaneContext, DbContext sınıfından türesin', name: 'KutuphaneContext', base: 'DbContext' },
          { t: 'property', goal: 'public DbSet<Kitap> Kitaplar { get; set; }', cls: 'KutuphaneContext', name: 'Kitaplar', type: 'DbSet<Kitap>', access: 'public' },
          { t: 'property', goal: 'public DbSet<Uye> Uyeler { get; set; }', cls: 'KutuphaneContext', name: 'Uyeler', type: 'DbSet<Uye>', access: 'public' },
        ],
        explain: 'Tebrikler! Entity Framework bu sınıflardan Kitaplar ve Uyeler tablolarını, özelliklerden de sütunları oluşturur. Artık db.Kitaplar.Add(...) ve db.SaveChanges() ile SQL yazmadan kayıt ekleyebilirsin.',
      },
      hints: ['public int Id { get; set; }', 'class KutuphaneContext : DbContext', 'public DbSet<Kitap> Kitaplar { get; set; }'],
    },
  ],
}
