let assetNumber = "";

// QR読み取り
function startScanner() {
  const qr = new Html5Qrcode("qr-reader");

  qr.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      assetNumber = decodedText;

      document.getElementById("assetNumber").innerText =
        "資産番号: " + assetNumber;

      qr.stop();
    },
    (error) => {}
  );
}

startScanner();

// 写真撮影
function takePhoto() {

  if (!assetNumber) {
    alert("先にQRコードを読み取ってください");
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';

  input.onchange = (e) => {
    const file = e.target.files[0];

    const now = new Date();
    const timestamp =
      now.getFullYear() +
      ("0"+(now.getMonth()+1)).slice(-2) +
      ("0"+now.getDate()).slice(-2) + "_" +
      ("0"+now.getHours()).slice(-2) +
      ("0"+now.getMinutes()).slice(-2) +
      ("0"+now.getSeconds()).slice(-2);

    const newName = assetNumber + "_" + timestamp + ".jpg";

    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = newName;
    link.click();

    // リセット
    assetNumber = "";
    document.getElementById("assetNumber").innerText = "未スキャン";
    startScanner();
  };

  input.click();
}
