/* eslint-disable */
/* @ts-ignore */

"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { saveAs } from "file-saver";

export default function PhotoBooth() {
    const webcamRef = useRef<Webcam | null>(null);
    const canvasRef = useRef(null);
    const [images, setImages] = useState([]);
    const [result, setResult] = useState(null);
    const [filter, setFilter] = useState("none");
    const [frame, setFrame] = useState("none");
    const [sticker, setSticker] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);

    const startCapture = () => {
        if (isCapturing) return;
        setIsCapturing(true);
        setCountdown(3);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(timer);
                    setTimeout(() => {
                        capture();
                        setIsCapturing(false);
                    }, 500);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const capture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImages((prev) => [...prev, imageSrc].slice(0, 3));
        }
    };

    const combineImages = () => {
        if (images.length < 3) return alert("Ambil 3 foto dulu!");

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.src = images[0];
        img.onload = () => {
            const imgWidth = img.width;
            const imgHeight = img.height;
            const sidePadding = 40;
            const topPadding = 40;
            const padding = 20;
            const bottomSpace = 100;
            const textSize = 15;

            canvas.width = imgWidth + sidePadding * 2;
            canvas.height = imgHeight * 3 + padding * 2 + topPadding + bottomSpace;

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (frame === "gold") {
                ctx.strokeStyle = "gold";
                ctx.lineWidth = 10;
                ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
            } else if (frame === "black") {
                ctx.strokeStyle = "black";
                ctx.lineWidth = 15;
                ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
            }

            images.forEach((src, index) => {
                const imgPart = new Image();
                imgPart.src = src;
                imgPart.onload = () => {
                    const xPos = sidePadding;
                    const yPos = topPadding + index * (imgHeight + padding);
                    ctx.drawImage(imgPart, xPos, yPos, imgWidth, imgHeight);

                    if (filter !== "none") {
                        ctx.globalCompositeOperation = "source-atop";
                        ctx.fillStyle = filter === "grayscale" ? "rgba(0,0,0,0.5)" : "rgba(255,140,0,0.3)";
                        ctx.fillRect(xPos, yPos, imgWidth, imgHeight);
                        ctx.globalCompositeOperation = "source-over";
                    }

                    if (index === 2 && sticker) {
                        const stickerImg = new Image();
                        stickerImg.src = sticker;
                        stickerImg.onload = () => {
                            const stickerSize = 80;
                            ctx.drawImage(stickerImg, xPos + imgWidth - stickerSize - 10, yPos + imgHeight - stickerSize - 10, stickerSize, stickerSize);
                        };
                    }

                    if (index === 2) {
                        ctx.fillStyle = "black";
                        ctx.font = `${textSize}px 'Courier New', monospace`;
                        ctx.textAlign = "center";
                        const today = new Date().toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        });
                        ctx.fillText(today, canvas.width / 2, canvas.height - bottomSpace / 2);
                        setResult(canvas.toDataURL("image/png"));
                    }
                };
            });
        };
    };

    const downloadImage = () => {
        if (!result) return;
        saveAs(result, "photobooth.png");
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <Webcam ref={webcamRef} screenshotFormat="image/png" className="w-full max-w-md rounded-lg shadow-lg" />
            <button onClick={startCapture} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                Jepret 📸
            </button>
            {countdown > 0 && <p className="text-xl font-bold text-red-600">{countdown}</p>}
            <div className="flex gap-2">
                {images.map((src, index) => (
                    <img key={index} src={src} className="w-24 h-24 object-cover rounded-lg border" />
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setFilter("none")}
                    className={`px-4 py-2 rounded-lg ${filter === "none" ? "bg-gray-600 text-white border-4 border-white" : "bg-gray-400 text-white"
                        }`}
                >
                    Normal
                </button>
                <button
                    onClick={() => setFilter("grayscale")}
                    className={`px-4 py-2 rounded-lg ${filter === "grayscale" ? "bg-gray-900 text-white border-4 border-yellow-300" : "bg-gray-700 text-white"
                        }`}
                >
                    B&W
                </button>
                <button
                    onClick={() => setFilter("sepia")}
                    className={`px-4 py-2 rounded-lg ${filter === "sepia" ? "bg-orange-700 text-white border-4 border-yellow-400" : "bg-orange-500 text-white"
                        }`}
                >
                    Sepia
                </button>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setFrame("none")}
                    className={`px-4 py-2 rounded-lg ${frame === "none" ? "bg-gray-600 text-white border-4 border-white" : "bg-gray-400 text-white"
                        }`}
                >
                    Tanpa Frame
                </button>
                <button
                    onClick={() => setFrame("gold")}
                    className={`px-4 py-2 rounded-lg ${frame === "gold" ? "bg-yellow-700 text-white border-4 border-yellow-300" : "bg-yellow-500 text-white"
                        }`}
                >
                    Emas 🏆
                </button>
                <button
                    onClick={() => setFrame("black")}
                    className={`px-4 py-2 rounded-lg ${frame === "black" ? "bg-black text-white border-4 border-gray-300" : "bg-black text-white"
                        }`}
                >
                    Hitam 🖤
                </button>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setSticker(null)}
                    className={`px-4 py-2 rounded-lg ${sticker === null ? "bg-gray-600 text-white border-4 border-white" : "bg-gray-400 text-white"
                        }`}
                >
                    Tanpa Sticker
                </button>
                <button
                    onClick={() => setSticker("/heart.png")}
                    className={`px-4 py-2 rounded-lg ${sticker === "/heart.png" ? "bg-red-700 text-white border-4 border-yellow-300" : "bg-red-500 text-white"
                        }`}
                >
                    ❤️ Love
                </button>
                <button
                    onClick={() => setSticker("/star.png")}
                    className={`px-4 py-2 rounded-lg ${sticker === "/star.png" ? "bg-yellow-700 text-white border-4 border-yellow-400" : "bg-yellow-500 text-white"
                        }`}
                >
                    ⭐ Star
                </button>
            </div>


            <button onClick={combineImages} className="px-4 py-2 bg-green-500 text-white rounded-lg">
                Gabungkan Foto 🖼️
            </button>

            {result && (
                <>
                    <div className="relative w-full max-w-md">
                        <img src={result} className="rounded-lg shadow-lg w-full" />
                        {sticker && (
                            <img
                                src={sticker}
                                alt="Sticker"
                                className="absolute top-2 right-2 w-16 h-16"
                            />
                        )}
                    </div>
                    <button onClick={downloadImage} className="px-4 py-2 bg-red-500 text-white rounded-lg">
                        Download ⬇️
                    </button>
                </>
            )}


            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
