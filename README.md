# Nesne Atölyesi 🏭

C# ile **Nesne Tabanlı Programlama** öğreten eğitsel, oyunlaştırılmış bir web uygulaması.
İçerik, MEB 11. sınıf *Nesne Tabanlı Programlama* ders kitabının öğrenme birimlerine göre hazırlanmıştır.

Öğrenci bir fabrikada mühendistir. Her görevde sınıf planları çizer, nesneler üretir, kalıtım ağaçları kurar ve veri tabanına bağlanır.
Yazdığı C# kodu, tarayıcıda çalışan **kurallı denetleyici** tarafından Visual Studio'ya benzer **Türkçe hata mesajlarıyla** anında kontrol edilir.

## Bölümler

| # | Bölüm | Kitap birimi | Seviye |
|---|-------|--------------|--------|
| 1 | C# Temelleri: değişkenler, tür dönüşümü, karar ve döngü | 1–2 | 6 |
| 2 | Sınıf ve Nesne | 3.1 | 6 |
| 3 | Kapsülleme: erişim belirleyiciler, get/set | 3.2 | 7 |
| 4 | Metotlar: dönüş değeri, aşırı yükleme, `this` | 3.3 | 8 |
| 5 | Yapıcı/yıkıcı metotlar ve `static` | 3.4 | 8 |
| 6 | Kalıtım: `protected`, `base`, `virtual`/`override`, `sealed` | 3.5 | 8 |
| 7 | Soyut sınıflar, arayüzler, çok biçimlilik | 3.6 | 6 |
| 8 | Diziler ve `List<T>` | 4 | 6 |
| 9 | Form uygulamaları: kontroller, menüler, iletişim kutuları, doğrulama, veri bağlama | 5 | 15 |
| 10 | Veri tabanı: SQL, JOIN, ADO.NET, Entity Framework | 6 | 15 |

Her bölüm bir **bölüm sonu görevi** ile biter.

## Görev türleri

- **Soru**: çoktan seçmeli
- **Çıktıyı Tahmin Et**: kodun konsol çıktısını yaz
- **Boşluk Doldur**: kod içindeki boşlukları tamamla
- **Kod Yaz**: CodeMirror editörü, kurallı denetleyici, canlı UML sınıf diyagramı
- **Hata Avcısı**: hatalı satırları bul, ardından doğru düzeltmeyi seç
- **Kod Sırala**: sürükle-bırak (Parsons problemi)
- **Kalıtım Ağacı**: her sınıfın temel sınıfını seç
- **Sınıf İnşa Et**: geçerli üye bloklarını sınıfa yerleştir
- **Eşleştir**: kavram ve açıklama eşleştirme
- **SQL Sorgusu**: tarayıcıda çalışan bellek içi MySQL benzeri motor

Oyunlaştırma öğeleri: yıldızlar (hata ve ipucu sayısına göre), XP, unvanlar (Çırak → Baş Mühendis), rozetler ve sıralı açılan seviyeler.
Öğretmen modunda tüm seviyelerin kilidi açılır. İlerleme tarayıcıda saklanır; JSON olarak dışa aktarılabilir veya içe aktarılabilir.

## Geliştirme

```bash
npm install
npm run dev        # geliştirme sunucusu
npm test           # motor ve içerik testleri (vitest)
npm run typecheck  # TypeScript denetimi
npm run build      # dist/ klasörüne statik derleme
```

`dist/` klasörü göreli yollarla derlenir. Bu yüzden GitHub Pages, okul sunucusu veya herhangi bir statik barındırıcıda doğrudan çalışır.
Sunucu tarafı yoktur.

### GitHub Pages ile yayın

`.github/workflows/pages.yml`, `main` veya `claude/brave-ritchie-uqw4rp` dalına her push'ta testleri çalıştırır, siteyi derler ve GitHub Pages'e yükler.
Testlerden biri başarısız olursa yayın yapılmaz.

Bir kerelik ayar: depoda **Settings → Pages → Build and deployment → Source** alanını **GitHub Actions** yapın.
Ardından **Actions → GitHub Pages → Run workflow** ile ilk yayını başlatın.
Site `https://<kullanıcı-adı>.github.io/programlama/` adresinde yayınlanır.

## Mimari

```
src/
  engine/
    csharp/lexer.ts     C# token ayırıcı
    csharp/parser.ts    sınıf/üye düzeyi ayrıştırıcı + sözdizimi hataları (CS1002, CS1513…)
    csharp/body.ts      metot gövdesi analizi (eksik ;, değişkenler, üye erişimleri)
    csharp/semantic.ts  anlamsal denetimler (CS0122 erişim, CS0144 soyut sınıf, CS0535 arayüz,
                        CS0506 override, CS7036 base(), CS0120 static, CS0029 tür uyumsuzluğu…)
    csharp/rules.ts     görev kuralları (bu sınıfta şu alan/özellik/metot var mı?)
    sql.ts              bellek içi SQL motoru
    progress.ts         ilerleme, XP, unvanlar (localStorage)
  content/
    chapters/*.ts       bölüm ve seviye içerikleri
    glossary.ts         NTP sözlüğü
    badges.ts           rozetler
  components/           ortak bileşenler ve görev bileşenleri
  screens/              Ana sayfa, Harita, Seviye, Rozetler, Sözlük, Ayarlar
```

### Yeni seviye eklemek

`src/content/chapters/` altındaki bir bölüme `Level` nesnesi ekleyin. Kod görevleri için `solution` ve `rules` yazın.
`npm test`, her kod görevinin çözümünün denetleyiciden geçtiğini, başlangıç kodunun ise geçmediğini doğrular.
Hata Avcısı görevlerinde işaretlenen satırların derleyicinin bulduğu hatalarla eşleştiğini de kontrol eder.

> Not: Denetleyici gerçek bir C# derleyicisi değildir ve programları çalıştırmaz. Ders kitabı düzeyindeki yaygın hataları
> öğretici mesajlarla yakalamak için tasarlanmıştır.
