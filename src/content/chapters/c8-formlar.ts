import type { Chapter } from '../../engine/types'

export const formlar: Chapter = {
  id: 'formlar',
  title: 'Form Uygulamaları',
  subtitle: 'Windows Forms: olaylar, kontroller ve veri bağlama',
  unit: 5,
  icon: '🪟',
  color: '#60a5fa',
  levels: [
    {
      id: 'form-1',
      title: 'Form da Bir Sınıftır',
      ref: '5. Öğrenme Birimi',
      cards: [
        {
          icon: '🪟',
          title: 'Görsel arayüzler',
          body: 'Form uygulamaları ile bilgisayar ortamında çalışan **kullanıcı etkileşimli arayüzler** geliştirilir. Windows form sınıfı **System.Windows.Forms** isim uzayı içinde bulunur.',
          code: 'public partial class Form1 : Form\n{\n    public Form1()\n    {\n        InitializeComponent();\n    }\n}',
        },
        {
          icon: '🧬',
          title: 'Kalıtım her yerde',
          body: 'Yukarıdaki koda dikkat et: `Form1 : Form`. Yazdığın her form, hazır **Form** sınıfından **türetilmiş** bir sınıftır! Text, BackColor, Show() gibi yüzlerce üyeyi kalıtım yoluyla devralır.',
        },
      ],
      task: {
        kind: 'quiz',
        question: 'Bir Windows Forms projesinde uygulamanın **hangi formdan başlayacağı** Program.cs dosyasındaki Main içinde hangi metotla belirlenir?',
        options: ['Form.Show()', 'Application.Run()', 'InitializeComponent()', 'Console.ReadLine()', 'Application.Exit()'],
        answer: 1,
        explain: 'Program.cs içindeki Application.Run(new Form1()); satırı uygulamayı Form1 ile başlatır. Başlangıç formunu değiştirmek için bu satırdaki form adı değiştirilir.',
      },
    },
    {
      id: 'form-2',
      title: 'Özellikler, Metotlar, Olaylar',
      ref: '5. Öğrenme Birimi',
      cards: [
        {
          icon: '⚡',
          title: 'Olay (Event)',
          body: 'Kontrollerin **özellikleri** (Text, Size), **metotları** (Show, Hide) ve **olayları** (Click, Load) vardır. Olay; kullanıcı bir butona tıkladığında, form açıldığında veya kapandığında tetiklenir ve ona bağlı metot çalışır.',
        },
      ],
      task: {
        kind: 'match',
        prompt: 'Form sınıfının üyelerini işlevleriyle eşleştir.',
        pairs: [
          { left: 'CenterToScreen()', right: 'Formun ekranın ortasında açılmasını sağlar' },
          { left: 'FormClosed', right: 'Form kapandığında çalışan olaydır' },
          { left: 'ControlBox', right: 'Büyültme, küçültme ve kapatma butonlarını gösterir/gizler' },
          { left: 'Load', right: 'Form açılırken çalışan olaydır' },
          { left: 'AcceptButton', right: 'Enter tuşuna basıldığında belirlenen butonun tıklanmasını sağlar' },
          { left: 'Show()', right: 'Formu göstermek için kullanılan metottur' },
        ],
        explain: 'CenterToScreen ve Show metot, ControlBox ve AcceptButton özellik, Load ve FormClosed ise olaydır.',
      },
    },
    {
      id: 'form-3',
      title: 'Buton Click Olayı',
      ref: '5. Öğrenme Birimi',
      cards: [
        {
          icon: '🖱️',
          title: 'Olay metodu',
          body: 'Tasarım ekranında bir butona çift tıklandığında Visual Studio otomatik olarak bir olay metodu oluşturur. TextBox\'tan gelen veri **string** olduğundan hesaplamadan önce dönüştürülmelidir.',
          code: 'private void button1_Click(object sender, EventArgs e)\n{\n    // butona tıklanınca çalışacak kodlar\n}',
        },
      ],
      task: {
        kind: 'fill',
        prompt: 'TextBox\'a girilen tutarın KDV\'sini (%18) hesaplayıp MessageBox ile gösteren olay metodunu tamamla.',
        code: 'private void button1_Click(object sender, EventArgs e)\n{\n    int sayi;\n    double sonuc;\n    sayi = Convert.[[0]](textBox1.[[1]]);\n    sonuc = sayi * 0.18;\n    MessageBox.[[2]](sonuc.ToString());\n}',
        blanks: [
          { accept: ['ToInt32'], width: 7 },
          { accept: ['Text'], width: 4 },
          { accept: ['Show'], width: 4 },
        ],
        explain: 'textBox1.Text kutudaki yazıyı string olarak verir, Convert.ToInt32 sayıya çevirir. MessageBox.Show metni bir mesaj kutusunda gösterir.',
      },
    },
    {
      id: 'form-4',
      title: 'Hata Avcısı: Metin Kutusu',
      ref: '5. Öğrenme Birimi',
      cards: [
        {
          icon: '🧯',
          title: 'Derleme hatası vs. çalışma hatası',
          body: '**Derleme hatası** varsa program hiç başlamaz (Hata Listesi panelinde görünür). **Çalışma zamanı hatası** ise program çalışırken oluşur; örneğin TextBox\'a "abc" yazılıp Convert.ToInt32 ile çevrilmeye çalışılırsa.',
        },
      ],
      task: {
        kind: 'bug',
        prompt: 'Bu olay metodunda derleme hatası veren satırları bul.',
        code: 'private void btnHesapla_Click(object sender, EventArgs e)\n{\n    int yariCap = textBox1.Text;\n    double piSayisi = 3.14;\n    double alan = piSayisi * yariCap * yariCap;\n    int cevre = 2 * piSayisi * yariCap;\n    MessageBox.Show("Alan: " + alan.ToString());\n}',
        bugLines: [3, 6],
        fix: {
          question: 'Satır 3 için doğru düzeltme hangisidir?',
          options: [
            'int yariCap = textBox1;',
            'int yariCap = Convert.ToInt32(textBox1.Text);',
            'string yariCap = Convert.ToInt32(textBox1.Text);',
            'int yariCap = textBox1.Text.ToString();',
          ],
          answer: 1,
        },
        explain: 'Satır 3: "string türü örtülü olarak int türüne dönüştürülemez." Satır 6: double ile yapılan çarpımın sonucu double\'dır; int değişkene açık dönüşüm olmadan atanamaz (cevre double olmalı).',
      },
    },
    {
      id: 'form-5',
      title: 'Dairenin Alanı',
      ref: '5. Öğrenme Birimi',
      cards: [
        {
          icon: '⭕',
          title: 'Adım adım',
          body: 'Bir olay metodunda işlemler mantıklı bir sırayla yapılmalıdır: önce **değişkenler tanımlanır**, sonra **girdiler okunur ve dönüştürülür**, ardından **hesaplama** yapılır ve en son **sonuç gösterilir**.',
        },
      ],
      task: {
        kind: 'order',
        prompt: 'Dairenin alanını ve çevresini hesaplayan buton olayının satırlarını doğru sıraya diz.',
        lines: [
          'private void button1_Click(object sender, EventArgs e)',
          '{',
          '    int yariCap;',
          '    double alan, cevre, piSayisi;',
          '    piSayisi = 3.14;',
          '    yariCap = Convert.ToInt32(textBox1.Text);',
          '    alan = piSayisi * yariCap * yariCap;',
          '    cevre = 2 * piSayisi * yariCap;',
          '    MessageBox.Show("Dairenin alanı=" + alan.ToString());',
          '    MessageBox.Show("Dairenin çevresi=" + cevre.ToString());',
          '}',
        ],
        alternatives: [
          [
            'private void button1_Click(object sender, EventArgs e)',
            '{',
            '    double alan, cevre, piSayisi;',
            '    int yariCap;',
            '    piSayisi = 3.14;',
            '    yariCap = Convert.ToInt32(textBox1.Text);',
            '    alan = piSayisi * yariCap * yariCap;',
            '    cevre = 2 * piSayisi * yariCap;',
            '    MessageBox.Show("Dairenin alanı=" + alan.ToString());',
            '    MessageBox.Show("Dairenin çevresi=" + cevre.ToString());',
            '}',
          ],
        ],
        explain: 'Değişken kullanılmadan önce tanımlanmalı, hesaplamada kullanılmadan önce de değer almalıdır. Sonuçlar hesaplandıktan sonra gösterilir.',
      },
    },
    {
      id: 'form-6',
      title: 'Liste ile Veri Bağlama',
      ref: '5. Öğrenme Birimi · 24. Uygulama',
      cards: [
        {
          icon: '🔗',
          title: 'DataGridView + List<T>',
          body: 'Ders kitabındaki 24. uygulamada öğrenci bilgileri `Ogrenciler` sınıfından üretilen nesnelerle bir **List<Ogrenciler>** koleksiyonuna eklenir. Liste, DataGridView kontrolünün **DataSource** özelliğine atanarak tabloda gösterilir (**kompleks veri bağlama**).',
          code: 'List<Ogrenciler> liste = new List<Ogrenciler>();\n\nprivate void Bagla()\n{\n    gridListe.DataSource = null;\n    gridListe.DataSource = liste;\n}',
        },
      ],
      task: {
        kind: 'code',
        prompt: 'Kitaptaki uygulamayı tamamla: `btnEkle_Click` olayında yeni bir **Ogrenciler** nesnesi oluştur, TextBox\'lardan gelen değerleri **Numara**, **AdSoyad** ve **DersNotu** özelliklerine aktar, nesneyi listeye **Add** ile ekle ve **Bagla()** metodunu çağır.',
        starter: 'class Ogrenciler\n{\n    public int Numara { get; set; }\n    public string AdSoyad { get; set; }\n    public int DersNotu { get; set; }\n}\n\npublic partial class Form1 : Form\n{\n    List<Ogrenciler> liste = new List<Ogrenciler>();\n\n    private void btnEkle_Click(object sender, EventArgs e)\n    {\n\n    }\n\n    private void Bagla()\n    {\n        gridListe.DataSource = null;\n        gridListe.DataSource = liste;\n    }\n}\n',
        solution: 'class Ogrenciler\n{\n    public int Numara { get; set; }\n    public string AdSoyad { get; set; }\n    public int DersNotu { get; set; }\n}\n\npublic partial class Form1 : Form\n{\n    List<Ogrenciler> liste = new List<Ogrenciler>();\n\n    private void btnEkle_Click(object sender, EventArgs e)\n    {\n        Ogrenciler ogrenci = new Ogrenciler();\n        ogrenci.Numara = int.Parse(txtNumara.Text);\n        ogrenci.AdSoyad = txtAdSoyad.Text;\n        ogrenci.DersNotu = int.Parse(txtDersNotu.Text);\n        liste.Add(ogrenci);\n        Bagla();\n    }\n\n    private void Bagla()\n    {\n        gridListe.DataSource = null;\n        gridListe.DataSource = liste;\n    }\n}\n',
        rules: [
          { t: 'new', goal: 'Yeni bir Ogrenciler nesnesi oluştur', type: 'Ogrenciler' },
          { t: 'source', goal: 'Numara özelliğine txtNumara değerini sayıya çevirerek aktar', regex: '\\.Numara\\s*=\\s*(int\\.Parse|Convert\\.ToInt32)\\s*\\(\\s*txtNumara\\.Text\\s*\\)' },
          { t: 'source', goal: 'AdSoyad özelliğine txtAdSoyad.Text değerini aktar', regex: '\\.AdSoyad\\s*=\\s*txtAdSoyad\\.Text' },
          { t: 'source', goal: 'DersNotu özelliğine txtDersNotu değerini sayıya çevirerek aktar', regex: '\\.DersNotu\\s*=\\s*(int\\.Parse|Convert\\.ToInt32)\\s*\\(\\s*txtDersNotu\\.Text\\s*\\)' },
          { t: 'method', goal: 'Nesneyi listeye ekle ve Bagla() metodunu çağır', cls: 'Form1', name: 'btnEkle_Click', bodyHas: ['liste.Add(', 'Bagla();'] },
        ],
        explain: 'DataSource önce null yapılıp sonra tekrar listeye atanır; böylece DataGridView listedeki yeni elemanları gösterecek şekilde yenilenir. int.Parse da Convert.ToInt32 gibi metni sayıya çevirir.',
      },
      hints: ['Ogrenciler ogrenci = new Ogrenciler();', 'ogrenci.Numara = int.Parse(txtNumara.Text);', 'liste.Add(ogrenci); Bagla();'],
    },
    {
      id: 'form-7',
      title: 'Bölüm Sonu: Mesaj Kutusu ve Veri Bağlama',
      boss: true,
      xp: 20,
      ref: '5. Öğrenme Birimi',
      cards: [
        {
          icon: '💬',
          title: 'MessageBox.Show parametreleri',
          body: 'MessageBox.Show metodunun parametre sırası: **mesaj**, **başlık**, **butonlar** (MessageBoxButtons.YesNo, OKCancel, YesNoCancel…) ve **simge** (MessageBoxIcon.Error, Warning, Information…).',
          code: 'MessageBox.Show("Kayıt silinsin mi?", "Onay",\n    MessageBoxButtons.YesNo, MessageBoxIcon.Warning);',
        },
        {
          icon: '🔗',
          title: 'Veri bağlama türleri',
          body: '**Basit veri bağlama**: Tek bir veri bir kontrole bağlanır (Binding sınıfı). **Kompleks veri bağlama**: Birden çok veri; DataGridView, ComboBox, ListBox gibi kontrollerin **DataSource** özelliği ile bağlanır.',
        },
      ],
      task: {
        kind: 'quiz',
        question: 'Başlığı "Uyarı", mesajı "Dosya kaydedilsin mi?" olan; **Evet / Hayır / İptal** butonları ve **uyarı** simgesi içeren mesaj kutusu hangisiyle oluşturulur?',
        options: [
          'MessageBox.Show("Uyarı", "Dosya kaydedilsin mi?", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Warning);',
          'MessageBox.Show("Dosya kaydedilsin mi?", "Uyarı", MessageBoxButtons.YesNo, MessageBoxIcon.Error);',
          'MessageBox.Show("Dosya kaydedilsin mi?", "Uyarı", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Warning);',
          'MessageBox.Show("Dosya kaydedilsin mi?", "Uyarı", MessageBoxButtons.OKCancel, MessageBoxIcon.Warning);',
          'MessageBox.Show("Uyarı", MessageBoxButtons.YesNoCancel, "Dosya kaydedilsin mi?");',
        ],
        answer: 2,
        explain: 'İlk parametre mesaj, ikincisi başlıktır. Evet/Hayır/İptal için YesNoCancel, uyarı simgesi için MessageBoxIcon.Warning kullanılır.',
      },
    },
  ],
}
