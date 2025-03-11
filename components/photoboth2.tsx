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

    const filters = ["none", "grayscale", "sepia", "invert", "brightness", "contrast"];
    const frames = [
        { label: "Tanpa Frame", value: "none", color: "gray" },
        { label: "Emas 🏆", value: "gold", color: "yellow" },
        { label: "Hitam 🖤", value: "black", color: "black" },
    ];
    const stickers = [
        { label: "Tanpa Sticker", value: null, color: "gray" },
        { label: "❤️ Love", value: "/heart.png", color: "red" },
        { label: "⭐ Star", value: "/star.png", color: "yellow" },
    ];

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
        <div className="flex flex-col items-center gap-6 p-6 min-h-screen text-white">
            <h1 className="text-3xl font-bold text-indigo-400">Snap & Edit 📸</h1>

            <div className="relative w-full max-w-md">
                <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/png"
                    className="w-full rounded-2xl shadow-lg border-4 border-indigo-500"
                />
            </div>

            <button
                onClick={startCapture}
                className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 transition-all duration-300 text-white rounded-xl shadow-md text-lg font-medium"
            >
                Jepret 📸
            </button>

            {countdown > 0 && <p className="text-2xl font-extrabold text-red-500 animate-pulse">{countdown}</p>}

            <div className="flex gap-3 flex-wrap justify-center">
                {images.map((src, index) => (
                    <img key={index} src={src} className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-sm" />
                ))}
            </div>

            {/* FILTERS - Carousel */}
            <div className="w-full overflow-x-auto flex gap-3 flex-nowrap">
                {filters.map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md ${
                            filter === type ? "bg-pink-500 text-white border-4 border-yellow-300" : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                ))}
            </div>

            {/* FRAME BUTTONS */}
            <div className="flex gap-3">{frames.map(({ label, value, color }) => (
                <button key={value} onClick={() => setFrame(value)} className={`px-4 py-2 rounded-xl bg-${color}-500 hover:bg-${color}-600 text-white`}>
                    {label}
                </button>
            ))}</div>

            <button onClick={combineImages} className="px-6 py-3 bg-green-500 hover:bg-green-600 transition-all duration-300 text-white rounded-xl shadow-md text-lg font-medium">
                Gabungkan Foto 🖼️
            </button>

            {result && <button onClick={downloadImage} className="px-6 py-3 bg-red-500 hover:bg-red-600 transition-all duration-300 text-white rounded-xl shadow-md text-lg font-medium">Download ⬇️</button>}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
