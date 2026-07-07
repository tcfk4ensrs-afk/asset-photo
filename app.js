// app.js 修正版（OCRデバッグ版）

let currentAssetNo = "";
let currentPhotoCount = 0;
let scannedAssets = [];
let currentPhotos = [];
let videoStream = null;

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

const recognizedAssetNo = document.getElementById("recognizedAssetNo");
const currentAssetNoLabel = document.getElementById("currentAssetNo");
const photoCountLabel = document.getElementById("photoCount");
const photoPreviewList = document.getElementById("photoPreviewList");
const assetTableBody = document.getElementById("assetTableBody");
const assetCount = document.getElementById("assetCount");
const loadingOverlay = document.getElementById("loadingOverlay");

window.addEventListener("load", async () => {
    await startCamera();
});

async function startCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: true
        });

        if (ocrVideo) ocrVideo.srcObject = videoStream;
        if (photoVideo) photoVideo.srcObject = videoStream;

    } catch (err) {
        console.error(err);
        alert("カメラ起動失敗\n\n" + err.message);
    }
}

scanButton.addEventListener("click", async () => {

    loadingOverlay.classList.remove("hidden");

    try {

        const imageData = captureFromVideo(
            ocrVideo,
            ocrCanvas
        );

        const debugImage = document.getElementById("debugImage");
        if (debugImage) {
            debugImage.src = imageData;
        }

        const result = await Tesseract.recognize(
            imageData,
            "jpn+eng"
        );

        let text = result.data.text;

        console.log("OCR結果", text);

        const digits = text.replace(/\D/g, "");

        alert(
            "OCR結果\n\n" +
            text +
            "\n\n数字抽出\n\n" +
            digits
        );

        const match = digits.match(/\d{8}/);

        if (!match) {
            alert("固定資産番号を認識できませんでした");
            return;
        }

        currentAssetNo = match[0];
        recognizedAssetNo.innerText = currentAssetNo;

        ocrSection.classList.add("hidden");
        confirmSection.classList.remove("hidden");

    } catch (err) {

        console.error(err);
        alert("OCR処理失敗\n\n" + err.message);

    } finally {

        loadingOverlay.classList.add("hidden");

    }
});

function captureFromVideo(video, canvas) {

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 1.0);
}
