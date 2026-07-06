// =====================================
// グローバル
// =====================================

let currentAssetNo = "";
let currentPhotoCount = 0;

let scannedAssets = [];
let currentPhotos = [];

let videoStream = null;


// =====================================
// DOM
// =====================================

const ocrSection = document.getElementById("ocrSection");
const confirmSection = document.getElementById("confirmSection");
const photoSection = document.getElementById("photoSection");

const ocrVideo = document.getElementById("ocrVideo");
const ocrCanvas = document.getElementById("ocrCanvas");

const photoVideo = document.getElementById("photoVideo");
const photoCanvas = document.getElementById("photoCanvas");

const scanButton = document.getElementById("scanButton");
const retryButton = document.getElementById("retryButton");
const confirmButton = document.getElementById("confirmButton");

const recognizedAssetNo =
    document.getElementById("recognizedAssetNo");

const currentAssetNoLabel =
    document.getElementById("currentAssetNo");

const photoCountLabel =
    document.getElementById("photoCount");

const photoPreviewList =
    document.getElementById("photoPreviewList");

const assetTableBody =
    document.getElementById("assetTableBody");

const assetCount =
    document.getElementById("assetCount");

const loadingOverlay =
    document.getElementById("loadingOverlay");

const finishModal =
    document.getElementById("finishModal");

const finishAssetNo =
    document.getElementById("finishAssetNo");

const finishPhotoCount =
    document.getElementById("finishPhotoCount");

const finishAssetBtn =
    document.getElementById("finishAssetBtn");

const cancelFinishBtn =
    document.getElementById("cancelFinishBtn");

const confirmFinishBtn =
    document.getElementById("confirmFinishBtn");

const exportCsvBtn =
    document.getElementById("exportCsvBtn");

const mainPhotoBtn =
    document.getElementById("mainPhotoBtn");

const additionalPhotoBtn =
    document.getElementById("additionalPhotoBtn");


// =====================================
// 初期化
// =====================================

window.addEventListener(
    "load",
    async () => {

        await startCamera();

    }
);


// =====================================
// カメラ起動
// =====================================

async function startCamera() {

    try {

        videoStream =
            await navigator
            .mediaDevices
            .getUserMedia({
                video: {
                    facingMode: "environment"
                }
            });

        ocrVideo.srcObject =
            videoStream;

        photoVideo.srcObject =
            videoStream;

    } catch (err) {

        alert(
            "カメラ起動に失敗しました"
        );

        console.error(err);

    }
}


// =====================================
// OCR撮影
// =====================================

scanButton.addEventListener(
    "click",
    async () => {

        loadingOverlay.classList.remove(
            "hidden"
        );

        try {

            const imageData =
                captureAssetNumberOnly(
                    ocrVideo,
                    ocrCanvas
                );

            const result =
                await Tesseract.recognize(
                    imageData,
                    "eng",
                    {
                        tessedit_char_whitelist:
                            "0123456789"
                    }
                );

            let text =
                result.data.text;

            console.log(
                "OCR結果:",
                text
            );

            text =
                text.replace(/\D/g, "");

            alert(
                "OCR認識結果\n\n" +
                text
            );

            const match =
                text.match(/\d{8}/);

            if (!match) {

                alert(
                    "固定資産番号を認識できませんでした。\n\n認識結果:\n" +
                    text
                );

                return;

            }

            currentAssetNo =
                match[0];

            recognizedAssetNo.innerText =
                currentAssetNo;

            ocrSection.classList.add(
                "hidden"
            );

            confirmSection.classList.remove(
                "hidden"
            );

        }
        catch (err) {

            console.error(err);

            alert(
                "OCR処理失敗"
            );

        }
        finally {

            loadingOverlay.classList.add(
                "hidden"
            );

        }

    }
);

// =====================================
// OCR再読取
// =====================================

retryButton.addEventListener(
    "click",
    () => {

        confirmSection.classList.add(
            "hidden"
        );

        ocrSection.classList.remove(
            "hidden"
        );

    }
);


// =====================================
// 番号OK
// =====================================

confirmButton.addEventListener(
    "click",
    () => {

        confirmSection.classList.add(
            "hidden"
        );

        photoSection.classList.remove(
            "hidden"
        );

        currentAssetNoLabel.innerText =
            currentAssetNo;

        currentPhotoCount = 0;

        photoCountLabel.innerText = 0;

        photoPreviewList.innerHTML = "";

        currentPhotos = [];

    }
);


// =====================================
// 全体写真撮影
// =====================================

mainPhotoBtn.addEventListener(
    "click",
    takePhoto
);

additionalPhotoBtn.addEventListener(
    "click",
    takePhoto
);


// =====================================
// 写真撮影
// =====================================

function takePhoto() {

    const imageData =
        captureFromVideo(
            photoVideo,
            photoCanvas
        );

    currentPhotoCount++;

    photoCountLabel.innerText =
        currentPhotoCount;

    currentPhotos.push(
        imageData
    );

    addThumbnail(imageData);

    downloadImage(
        imageData,
        currentAssetNo,
        currentPhotoCount
    );

}


// =====================================
// キャプチャ
// =====================================

function captureFromVideo(
    video,
    canvas
) {

    const ctx =
        canvas.getContext("2d");

    // 固定資産番号の黒帯付近だけ切り出す
    const cropX =
        video.videoWidth * 0.30;

    const cropY =
        video.videoHeight * 0.45;

    const cropWidth =
        video.videoWidth * 0.45;

    const cropHeight =
        video.videoHeight * 0.12;

    canvas.width =
        cropWidth;

    canvas.height =
        cropHeight;

    ctx.drawImage(
        video,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
    );

    // 白黒化
    const imageData =
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

    const data =
        imageData.data;

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        const gray =
            (
                data[i] +
                data[i + 1] +
                data[i + 2]
            ) / 3;

        const value =
            gray > 120 ? 255 : 0;

        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;

    }

    ctx.putImageData(
        imageData,
        0,
        0
    );

    return canvas.toDataURL(
        "image/jpeg",
        1.0
    );
}

// =====================================
// サムネイル
// =====================================

function addThumbnail(dataUrl) {

    const div =
        document.createElement("div");

    div.className =
        "photo-preview-item";

    const img =
        document.createElement("img");

    img.src =
        dataUrl;

    div.appendChild(img);

    photoPreviewList.appendChild(
        div
    );

}


// =====================================
// 保存
// =====================================

function downloadImage(
    dataUrl,
    assetNo,
    index
) {

    const a =
        document.createElement("a");

    a.href =
        dataUrl;

    const name =
        `${assetNo}_${String(index).padStart(2,"0")}.jpg`;

    a.download =
        name;

    a.click();

}


// =====================================
// 撮影終了
// =====================================

finishAssetBtn.addEventListener(
    "click",
    () => {

        finishAssetNo.innerText =
            currentAssetNo;

        finishPhotoCount.innerText =
            currentPhotoCount;

        finishModal.classList.remove(
            "hidden"
        );

    }
);


// =====================================
// 戻る
// =====================================

cancelFinishBtn.addEventListener(
    "click",
    () => {

        finishModal.classList.add(
            "hidden"
        );

    }
);


// =====================================
// 終了確定
// =====================================

confirmFinishBtn.addEventListener(
    "click",
    () => {

        finishModal.classList.add(
            "hidden"
        );

        addAssetRow();

        resetWorkflow();

    }
);


// =====================================
// 一覧追加
// =====================================

function addAssetRow() {

    scannedAssets.push({

        assetNo:
            currentAssetNo,

        photoCount:
            currentPhotoCount,

        date:
            new Date()
                .toLocaleString(
                    "ja-JP"
                )

    });

    refreshTable();

}


// =====================================
// テーブル更新
// =====================================

function refreshTable() {

    assetTableBody.innerHTML =
        "";

    scannedAssets.forEach(
        (item,index)=>{

            const tr =
                document
                .createElement("tr");

            tr.innerHTML =
            `
            <td>${index+1}</td>
            <td>${item.assetNo}</td>
            <td>${item.photoCount}</td>
            <td>${item.date}</td>
            `;

            assetTableBody
                .appendChild(tr);

        }
    );

    assetCount.innerText =
        scannedAssets.length +
        "件";

}


// =====================================
// 初期状態へ戻す
// =====================================

function resetWorkflow() {

    currentAssetNo = "";

    currentPhotoCount = 0;

    currentPhotos = [];

    photoPreviewList.innerHTML = "";

    photoSection.classList.add(
        "hidden"
    );

    confirmSection.classList.add(
        "hidden"
    );

    ocrSection.classList.remove(
        "hidden"
    );

}


// =====================================
// CSV出力
// =====================================

exportCsvBtn.addEventListener(
    "click",
    () => {

        let csv =
            "固定資産番号,撮影枚数,読取日時\n";

        scannedAssets.forEach(
            item => {

                csv +=
                    `${item.assetNo},${item.photoCount},${item.date}\n`;

            }
        );

        const blob =
            new Blob(
                [csv],
                {
                    type:
                    "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const a =
            document
            .createElement("a");

        a.href =
            url;

        a.download =
            "棚卸結果.csv";

        a.click();

    }
);
