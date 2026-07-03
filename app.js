let assetNo = "";

const labelCapture = document.getElementById("labelCapture");
const statusText = document.getElementById("status");
const assetNoText = document.getElementById("assetNo");
const confirmBtn = document.getElementById("confirmBtn");
const photoBtn = document.getElementById("photoBtn");

labelCapture.addEventListener("change", async (e)=>{

    const file = e.target.files[0];

    if(!file) return;

    statusText.innerText = "OCR解析中...";

    const result = await Tesseract.recognize(
        file,
        "jpn+eng"
    );

    const text = result.data.text;

    console.log(text);

    const match = text.match(/\d{8}/);

    if(match){

        assetNo = match[0];

        assetNoText.innerText = assetNo;

        statusText.innerText = "番号を確認してください";

        confirmBtn.disabled = false;

    }else{

        statusText.innerText =
        "番号が見つかりません";

    }

});

confirmBtn.addEventListener("click",()=>{

    photoBtn.disabled = false;

    alert(
      "設備全体写真を撮影してください"
    );

});

photoBtn.addEventListener("click",()=>{

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";

    input.onchange = (e)=>{

        const file = e.target.files[0];

        const now = new Date();

        const stamp =
            now.getFullYear() +
            String(now.getMonth()+1).padStart(2,"0") +
            String(now.getDate()).padStart(2,"0") +
            "_" +
            String(now.getHours()).padStart(2,"0") +
            String(now.getMinutes()).padStart(2,"0") +
            String(now.getSeconds()).padStart(2,"0");

        const filename =
            assetNo + "_" + stamp + ".jpg";

        const link =
            document.createElement("a");

        link.href =
            URL.createObjectURL(file);

        link.download =
            filename;

        link.click();

        alert(
          "保存完了\n" + filename
        );

        assetNo="";

        assetNoText.innerText="未認識";

        photoBtn.disabled=true;
        confirmBtn.disabled=true;

    };

    input.click();

});
