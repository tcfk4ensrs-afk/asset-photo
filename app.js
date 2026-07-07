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

        // 既存ストリームを停止
        if (videoStream) {
            videoStream.getTracks().forEach(
                track => track.stop()
            );
        }

        videoStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        exact: "environment"
                    }
                }
            });

        if (ocrVideo) {
            ocrVideo.srcObject =
                videoStream;
        }

        if (photoVideo) {
            photoVideo.srcObject =
                videoStream;
        }

    } catch (err) {

        console.error(err);

        alert(
            "外カメラ取得失敗\n\n" +
            err.message
        );

    }
}

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

            const debugImage =
                document.getElementById(
                    "debugImage"
                );

            if (debugImage) {

                debugImage.src =
                    imageData;

            }

            const result =
                await Tesseract.recognize(
                    imageData,
                    "eng"
                );

            let text =
                result.data.text || "";

            console.log(
                "OCR生データ:",
                text
            );

            text =
                text.replace(
                    /\D/g,
                    ""
                );

            console.log(
                "数字抽出:",
                text
            );

            if (
                text.length === 0
            ) {

                alert(
                    "番号を認識できませんでした"
                );

                return;

            }

            currentAssetNo =
                text;

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
                "OCR処理失敗\n\n" +
                err.message
            );

        }
        finally {

            loadingOverlay.classList.add(
                "hidden"
            );

        }

    }
);

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
        1
    );

}

    const frame =
        ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

    const data =
        frame.data;

    let minX =
        canvas.width;

    let minY =
        canvas.height;

    let maxX = 0;
    let maxY = 0;

    for (
        let y = 0;
        y < canvas.height;
        y++
    ) {

        for (
            let x = 0;
            x < canvas.width;
            x++
        ) {

            const i =
                (
                    y *
                    canvas.width +
                    x
                ) * 4;

            const r =
                data[i];

            const g =
                data[i + 1];

            const b =
                data[i + 2];

            const brightness =
                (
                    r +
                    g +
                    b
                ) / 3;

            if (
                brightness < 80
            ) {

                if (x < minX)
                    minX = x;

                if (y < minY)
                    minY = y;

                if (x > maxX)
                    maxX = x;

                if (y > maxY)
                    maxY = y;

            }

        }

    }

    const cropX =
        Math.max(
            0,
            minX - 20
        );

    const cropY =
        Math.max(
            0,
            minY - 20
        );

    const cropWidth =
        Math.max(
            300,
            maxX - minX + 40
        );

    const cropHeight =
        Math.max(
            60,
            maxY - minY + 40
        );

    canvas.width =
        cropWidth * 4;

    canvas.height =
        cropHeight * 4;

    ctx.drawImage(
        video,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const debugImage =
        document.getElementById(
            "debugImage"
        );

    if (debugImage) {

        debugImage.src =
            canvas.toDataURL(
                "image/jpeg",
                1
            );

    }

    return canvas.toDataURL(
        "image/jpeg",
        1
    );

}
