# Katkıda bulunma

<p><a href="CONTRIBUTING.md">English</a> | Türkçe</p>

Katkı sunmak istediğiniz için teşekkürler. Bir değişikliğin nasıl kabul edileceğini aşağıda bulabilirsiniz.

## Başlamadan önce

- Zaten bilinen bir sorun olup olmadığına bakmak için [açık sorunlara](../../issues) göz atın.
- Büyük bir değişiklikse, yaklaşımı birlikte kararlaştırabilmemiz için önce bir sorun açın.

## Değişiklik yapmak

1. Depoyu fork'layın ve `main` dalından bir dal oluşturun.
2. Değişikliğinizi yapın. Odaklı tutun: her çekme isteğinde tek bir düzeltme ya da özellik olsun.
3. Klasörü Chrome'da **Load unpacked** (`chrome://extensions/`) ile yükleyin ve hem güncel Reddit'te hem de `old.reddit.com` üzerinde deneyin. Otomatik bir test paketi yok.
4. [CHANGELOG.md](CHANGELOG.md) dosyasının en üstüne yeni bir **[Unreleased]** başlığı açın ve bir satır ekleyin.
5. Bir çekme isteği açın ve şablonu doldurun.

## Sıcak yeniden yükleme

Her değişiklikten sonra eklentiyi elle yeniden yüklemek zorunda kalmamak için:

1. **Load unpacked** düğmesine bir kez daha basın ve `dev/hot-reload` klasörünü seçin. Bu küçük yardımcı yalnızca bir kez yüklenmesi gerekir. Eklentiden ayrıdır ve sürüm zip'inin parçası değildir.
2. Proje kökünden `node dev/watch.js` komutunu çalıştırın (Node.js 20 veya üzeri) ve açık bırakın.

`src/`, `icons/` ya da `manifest.json` içindeki bir dosyayı kaydettiğinizde eklenti ve açık Reddit sayfaları yeniden yüklenir. Durdurmak için Ctrl+C'ye basın. Yeniden yükleme, devam eden bir işlemi de keser; bu yüzden gerçek bir çalıştırmayı test etmeden önce izleyiciyi durdurun.

## Hata bildirme

[Sorunlar](../../issues/new/choose) bölümündeki hata bildirme formunu kullanın. Hangi sürümü kullandığınızı, ne yaptığınızı, neyi beklediğinizi ve ne olduğunu yazın.
