// =====================================
// グローバル変数
// =====================================

let currentAssetNo = "";
let currentPhotoCount = 0;

let scannedAssets = [];
let currentPhotos = [];

let videoStream = null;


// =====================================
// DOM
// =====================================

const inputSection =
    document.getElementById(
        "inputSection"
    );

const photoSection =
    document.getElementById(
        "photoSection"
    );

const photoVideo =
    document.getElementById(
        "photoVideo"
    );

const photoCanvas =
    document.getElementById(
        "photoCanvas"
    );

const manualAssetNo =
    document.getElementById(
        "manualAssetNo"
    );

const manualConfirmBtn =
    document.getElementById(
        "manualConfirmBtn"
    );

const currentAssetNoLabel =
    document.getElementById(
        "currentAssetNo"
    );

const photoCountLabel =
    document.getElementById(
        "photoCount"
    );

const photoPreviewList =
    document.getElementById(
        "photoPreviewList"
    );

const assetTableBody =
    document.getElementById(
        "assetTableBody"
    );

const assetCount =
    document.getElementById(
        "assetCount"
    );

const finishModal =
    document.getElementById(
        "finishModal"
    );

const finishAssetNo =
    document.getElementById(
        "finishAssetNo"
    );

const finishPhotoCount =
    document.getElementById(
        "finishPhotoCount"
    );

const finishAssetBtn =
    document.getElementById(
        "finishAssetBtn"
    );

const cancelFinishBtn =
    document.getElementById(
        "cancelFinishBtn"
    );

const confirmFinishBtn =
    document.getElementById(
        "confirmFinishBtn"
    );

const exportCsvBtn =
    document.getElementById(
        "exportCsvBtn"
    );

const mainPhotoBtn =
    document.getElementById(
        "mainPhotoBtn"
    );

const additionalPhotoBtn =
    document.getElementById(
        "additionalPhotoBtn"
    );


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

        if (videoStream) {

            videoStream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

        }

        videoStream =
            await navigator
                .mediaDevices
                .getUserMedia({

                    video: {
                        facingMode:
                            "environment"
                    }

                });

        if (photoVideo) {

            photoVideo.srcObject =
                videoStream;

        }

    }
    catch (err) {

        console.error(err);

        alert(
            "カメラ起動失敗\n\n" +
            err.message
        );

    }

}


// =====================================
// 固定資産番号入力
// =====================================

manualConfirmBtn.addEventListener(
    "click",
    () => {

        const value =
            manualAssetNo.value
                .trim();

        if (
            value.length === 0
        ) {

            alert(
                "固定資産番号を入力してください"
            );

            return;

        }

        currentAssetNo =
            value;

        currentAssetNoLabel.innerText =
            currentAssetNo;

        currentPhotoCount = 0;

        currentPhotos = [];

        photoPreviewList.innerHTML = "";

        photoCountLabel.innerText =
            "0";

        manualAssetNo.value = "";

        inputSection.classList.add(
            "hidden"
        );

        photoSection.classList.remove(
            "hidden"
        );

    }
);


// =====================================
// 写真撮影
// =====================================

mainPhotoBtn.addEventListener(
    "click",
    takePhoto
);

additionalPhotoBtn.addEventListener(
    "click",
    takePhoto
);

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

    addThumbnail(
        imageData
    );

    downloadImage(
        imageData,
        currentAssetNo,
        currentPhotoCount
    );

}


// =====================================
// 画像取得
// =====================================

function captureFromVideo(
    video,
    canvas
) {

    const ctx =
        canvas.getContext(
            "2d"
        );

    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;

    ctx.drawImage(
        video,
        0,
        0
    );

    return canvas.toDataURL(
        "image/jpeg",
        1.0
    );

}


// =====================================
// サムネイル追加
// =====================================

function addThumbnail(
    dataUrl
) {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "photo-preview-item";

    const img =
        document.createElement(
            "img"
        );

    img.src =
        dataUrl;

    div.appendChild(
        img
    );

    photoPreviewList.appendChild(
        div
    );

}


// =====================================
// 写真保存
// =====================================

function downloadImage(
    dataUrl,
    assetNo,
    index
) {

    const a =
        document.createElement(
            "a"
        );

    a.href =
        dataUrl;

    a.download =
        `${assetNo}_${String(index)
            .padStart(2, "0")}.jpg`;

    a.click();

}


// =====================================
// 撮影終了確認
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
// モーダル閉じる
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
// 撮影完了
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
        (
            item,
            index
        ) => {

            const tr =
                document.createElement(
                    "tr"
                );

            tr.innerHTML =
                `
                <td>${index + 1}</td>
                <td>${item.assetNo}</td>
                <td>${item.photoCount}</td>
                <td>${item.date}</td>
                `;

            assetTableBody.appendChild(
                tr
            );

        }
    );

    assetCount.innerText =
        scannedAssets.length +
        "件";

}


// =====================================
// 初期化
// =====================================

function resetWorkflow() {

    currentAssetNo = "";

    currentPhotoCount = 0;

    currentPhotos = [];

    photoPreviewList.innerHTML =
        "";

    photoSection.classList.add(
        "hidden"
    );

    inputSection.classList.remove(
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
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                "a"
            );

        a.href =
            url;

        a.download =
            "棚卸結果.csv";

        a.click();

    }
);
