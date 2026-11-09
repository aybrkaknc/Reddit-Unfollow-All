# Değişiklik günlüğü

<p><a href="CHANGELOG.md">English</a> | Türkçe</p>

Projedeki tüm önemli değişiklikler burada, en yeniden en eskiye doğru listelenir.
Biçim [Keep a Changelog](https://keepachangelog.com/tr/1.1.0/) ilkelerini izler.

## [1.2.2] - 2026-11-09

### Kaldırıldı

- `src/content.js`: Eklentinin artık yüklemediği, içerik betiğinin eski tek dosyalık kopyası. Paketi büyütüyordu ve Firefox eklenti denetimlerinde ek uyarılara yol açıyordu.

## [1.2.1] - 2026-11-09

### Değiştirildi

- Firefox 142 veya üzeri artık gerekli. Eski sürümler, Mozilla'nın istediği veri toplama ayarını desteklemiyor.

## [1.2.0] - 2026-11-09

### Eklendi

- Firefox desteği (Firefox 128 veya üzeri). Aynı zip hem Chrome'da hem Firefox'ta yüklenir.
- Panelin içinde yeni dişli düğmeyle açılan bir ayarlar sayfası. Panel başlığı bir geri okuyla birlikte Settings olur; dişli ve yenile düğmeleri gizlenir. Geri dönmek için geri okuna ya da Esc tuşuna basın.
- Ayarlarda panel boyutu: panel, pencereleri ve Unfollow All düğmesi %100 ile %200 arasında büyütülebilir. Boyut ekran boyutundan başlar; örneğin 2560x1440 bir ekran %125 ile açılır ve seçiminiz cihazınızda hatırlanır.

### Değiştirildi

- Panel, Toplulukları Yönet sayfasında kendiliğinden açılır; artık görmek için Unfollow All düğmesine basmanız gerekmez.
- Toplulukları Yönet başlığının yanındaki Unfollow All düğmesi artık işlemi başlatır. Önce onay ister; paneldeki Start düğmesiyle aynıdır.
- Dil seçimi, hız ve Report düğmesi ayarlar sayfasına taşındı. Tüm seçenekler yan yana gösterilir; her basışta değişmezler.
- Bir çalıştırma sırasında ayarlar açılamaz; bu yüzden hız, işlem ortasında değişemez. Daha yavaş gitmek için iptal edip yeniden başlatın.
- Panel yazı tipi olarak Reddit'in kendi yazı tiplerini kullanır: tüm metinlerde Reddit Sans, günlükte Reddit Mono. Bunlar SIL Open Font License altında eklentiyle birlikte gelir. Önceden Inter, Space Grotesk ve JetBrains Mono kullanılıyordu.

### Düzeltildi

- Eklenti, Reddit'in menülerinden Toplulukları Yönet sayfasına gelindiğinde artık hemen çalışır. Önceden sayfayı bir kez yenilemek gerekiyordu.
- Panel, sürükleyip yukarı çektiğinizde ya da günlüğü, beyaz listeyi veya ayarları açtığınızda ekranın üstünden taşmaz. Pencereyi küçülttüğünüzde de ekranın içinde kalır.
- Panel küçüldüğünde (küçültme, günlük ya da beyaz listeyi kapatma) başlık artık her zaman alt kenara doğru kayar. Paneli sürükledikten sonra beyaz listeyi kapatmak, alt kenarı başlığa doğru çekiyordu.
- Kısa bir pencerede büyük panel artık ekrandan uzun olmaz. İçeriği kaydırılabilir.

## [1.1.0] - 2026-11-06

### Eklendi

- Reddit'in Toplulukları Yönet başlığının yanında bir **Unfollow All** düğmesi paneli açar. Başlık bulunamazsa düğme sağ alt köşede yüzer.
- Araç çubuğu simgesi ve `Alt+Shift+U` paneli açar ya da kapatır. Diğer sayfalardayken aboneliklerinizi panel açık olarak yeni sekmede açarlar.
- Panelde kapatma (×) düğmesi. 1.0.1'de kaldırılmıştı. Bir çalıştırma sırasında gizlenir; panel her zaman yeniden açılabilir.

### Değiştirildi

- Panel, sayfa yüklendiğinde kendiliğinden açılmaz.
- Küçük metinler Inter, günlük JetBrains Mono kullanır; ikisi de SIL Open Font License altında eklentiyle birlikte gelir. Başlıklar ve sayılar Space Grotesk ile kalır.
- Eklenti simgesi tüm tuvalini doldurur; araç çubuğunda daha büyük görünür.
- Panel ve pencereleri Reddit logosu yerine eklentinin kendi logosunu gösterir. Dil seçimi, yenile düğmesinin solunda bir dünya düğmesidir.
- Sorun bildirme, panel başlığından dil düğmesinin yanındaki bir GitHub düğmesine taşındı.

### Düzeltildi

- Araç çubuğunda yapboz parçası görünüyordu, çünkü simge dosyaları JPEG idi. Artık 16, 32, 48 ve 128 px boyutlarında gerçek PNG dosyaları.

## [1.0.1] - 2026-11-06

### Eklendi

- Beyaz listeniz ve dil seçiminiz ziyaretler arasında hatırlanır (yeni `storage` izni; veriler cihazınızda kalır).
- Siz bir dil seçene kadar arayüz Reddit görüntüleme dilinizi izler; varsayılan İngilizce.
- Sayfa açıldıktan sonra yüklenen subredditler otomatik algılanır.
- Start onay ister ve kaç subredditin kalacağını ve çıkacağını gösterir.
- Reddit istekleri sınırlıyorsa, üst üste 5 onaylanmamış subredditten sonra çalıştırma durur.
- Her çalıştırma, çıkılan, tutulan ve onaylanmayan subredditlerin özetiyle biter.
- Geri alma: ↶ düğmesi, çıktığınız subredditlere sayfayı yenileyene ya da ayrılana kadar yeniden katılır.
- Start'tan sonra paneli küçültmek, onu en son günlük mesajını ve genişletme düğmesini gösteren tek satıra indirir.
- Her şey beyaz listedeyse, bir subreddit artık sayfada değilse ya da ayarlar kaydedilemiyorsa yeni mesajlar.
- Bir çalıştırma sırasında sayfadan ayrılmadan önce tarayıcı uyarır.
- Reddit'in sayfası değişmiş gibi görünürse bir uyarı çıkar; önceden doldurulmuş bir GitHub sorunu açan bir Report düğmesi vardır. Siz göndermedikçe hiçbir şey gönderilmez.
- Panel başlığının üzerine gelip Report'a basarak diğer hataları da aynı şekilde bildirebilirsiniz.
- Mesajlar ve sorular, tarayıcının varsayılan pop-up'ları yerine eklentinin kendi penceresinde açılır.
- Günlük, köşesinde kopyalama simgesi olan daha uzun, terminal görünümlü bir alandır. Başlangıçta kapalıdır, Start'a basınca açılır; başlık çubuğunun tamamı açıp kapatır.
- Proje dosyaları: LICENSE, SECURITY, CONTRIBUTING, sorun ve çekme isteği formları, sürüm iş akışı.

### Değiştirildi

- Bir subreddit, ancak Reddit değişikliği gösterdikten sonra çıkılmış sayılır. Aksi halde günlük onaylanmadı olarak bildirir.
- Duraklat ve devam et kaldırıldı; yerine İptal geldi. İptal çalışan bir işlemi durdurur ve çalışırken Start'ın yerini alır.
- Panel daha kompakt: hız, Start'ın yanında 1x ile 4x arasında her basışta ilerleyen küçük bir rozet; Kept sayacı beyaz listeyi açar.
- Panel başlığındaki Reddit logosu artık dili değiştirir. Üzerine gelindiğinde bir dünya simgesine döner.
- Panelde yumuşak geçişler: küçültme, beyaz liste, uyarılar, pencereler, sayaçlar ve günlük. İlerleme çubuğu Start'a basınca belirir. Sisteminiz hareketi azaltmaya ayarlıysa animasyonlar kapalıdır.
- Arayüz, SIL Open Font License altında eklentiyle birlikte gelen Space Grotesk yazı tipini kullanır.

### Kaldırıldı

- Kapatma (X) düğmesi; panel, sayfa yenilenmeden yeniden açılamıyordu. Bunun yerine küçültmeyi kullanın.
- Taşıma simgesi. Paneli başlığından sürükleyin.

### Düzeltildi

- Panel, başka bir Reddit sayfasına geçtiğinizde gizlenir, geri döndüğünüzde yeniden gelir. Bir çalıştırma sırasında sayfadan ayrılırsanız çalıştırma iptal edilir.
- Panel, sondaki eğik çizgisiz `reddit.com/subreddits` adresinde ve `old.reddit.com` üzerinde artık açılır.
- Eski Reddit'te, katılmadığınız subredditler artık abonelik olarak listelenmez; birden fazla yerde görünen bir abonelik bir kez sayılır.
- Yalnızca eklentinin kendi tıklamasıyla açılan bir onay penceresi onaylanır.
- "Subreddit" kelimesini içeren subreddit adları artık bir yer tutucuyla değiştirilmez.

## [1.0.0] - 2026-02-04

### Eklendi

- Beyaz liste: tutulacak subredditleri seçin; arama, Tümünü Tut ve Hiçbirini Tutma seçenekleri var.
- Güncel Reddit'te ve `old.reddit.com` üzerinde çalışır.
- Dört hız, duraklat ve devam et.
- İngilizce ve Türkçe arayüz.
- Gizlilik politikası.

### Değiştirildi

- Chrome Web Store uyumluluğu için kullanılmayan izinler kaldırıldı.
