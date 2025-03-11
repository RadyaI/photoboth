/* eslint-disable */
/* @ts-ignore */

"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { saveAs } from "file-saver";

export default function PhotoBooth() {
    const webcamRef = useRef<Webcam | null>(null);
    const canvasRef = useRef(null);
    const [gabungImg, setGabungImg] = useState(false);
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
        setGabungImg(true)
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
            } else if (frame === "black") {
                ctx.strokeStyle = "black";
                ctx.lineWidth = 15;
            } else if (frame === "silver") {
                ctx.strokeStyle = "silver";
                ctx.lineWidth = 10;
            } else if (frame === "blue") {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 15;
            } else if (frame === "red") {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 15;
            } else if (frame === "green") {
                ctx.strokeStyle = "green";
                ctx.lineWidth = 15;
            } else if (frame === "purple") {
                ctx.strokeStyle = "purple";
                ctx.lineWidth = 15;
            } else if (frame === "white") {
                ctx.strokeStyle = "white";
                ctx.lineWidth = 15;
            } else if (frame === "brown") {
                ctx.strokeStyle = "brown";
                ctx.lineWidth = 10;
            } else if (frame === "orange") {
                ctx.strokeStyle = "orange";
                ctx.lineWidth = 10;
            } else if (frame === "rainbow") {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop(0, "red");
                gradient.addColorStop(0.2, "orange");
                gradient.addColorStop(0.4, "yellow");
                gradient.addColorStop(0.6, "green");
                gradient.addColorStop(0.8, "blue");
                gradient.addColorStop(1, "purple");
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 12;
            } else if (frame === "diamond") {
                ctx.strokeStyle = "lightblue";
                ctx.lineWidth = 12;
            } else if (frame === "galaxy") {
                ctx.strokeStyle = "darkblue";
                ctx.lineWidth = 12;
            } else {
                ctx.strokeStyle = "transparent";
                ctx.lineWidth = 0;
            }

            ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

            images.forEach((src, index) => {
                const imgPart = new Image();
                imgPart.src = src;
                imgPart.onload = () => {
                    const xPos = sidePadding;
                    const yPos = topPadding + index * (imgHeight + padding);

                    if (filter !== "none") {
                        ctx.filter = "none";

                        if (filter === "grayscale") {
                            ctx.filter = "grayscale(100%)";
                        } else if (filter === "sepia") {
                            ctx.filter = "sepia(100%)";
                        } else if (filter === "blur") {
                            ctx.filter = "blur(5px)";
                        } else if (filter === "brightness") {
                            ctx.filter = "brightness(1.5)";
                        } else if (filter === "contrast") {
                            ctx.filter = "contrast(1.8)";
                        } else if (filter === "invert") {
                            ctx.filter = "invert(100%)";
                        } else if (filter === "saturate") {
                            ctx.filter = "saturate(2)";
                        } else if (filter === "hue-rotate") {
                            ctx.filter = "hue-rotate(90deg)";
                        } else if (filter === "shadow") {
                            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                            ctx.shadowBlur = 10;
                            ctx.shadowOffsetX = 5;
                            ctx.shadowOffsetY = 5;
                        }
                    }

                    ctx.drawImage(imgPart, xPos, yPos, imgWidth, imgHeight);

                    ctx.filter = "none";

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

                        if (sticker) {
                            const stickerImg = new Image();
                            stickerImg.src = sticker;
                            stickerImg.onload = () => {
                                const stickerSize = 80;
                                ctx.drawImage(stickerImg, canvas.width - stickerSize - 20, 20, stickerSize, stickerSize);
                                ctx.drawImage(stickerImg, 10, canvas.height - stickerSize - 70, stickerSize, stickerSize);
                                setResult(canvas.toDataURL("image/png"));
                            };
                        } else {
                            setResult(canvas.toDataURL("image/png"));
                        }

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

            <div className="flex gap-3 w-[400px] overflow-x-auto p-2 customScrollbar">
                {[
                    { label: "Normal", value: "none" },
                    { label: "Grayscale", value: "grayscale" },
                    { label: "Sepia", value: "sepia" },
                    { label: "Blur", value: "blur" },
                    { label: "Brightness", value: "brightness" },
                    { label: "Contrast", value: "contrast" },
                    { label: "Invert", value: "invert" },
                    { label: "Saturate", value: "saturate" },
                    { label: "Hue Rotate", value: "hue-rotate" },
                    { label: "Shadow", value: "shadow" },
                ].map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setFilter(item.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md ${filter === item.value
                            ? "bg-pink-500 text-white border-4 border-yellow-300"
                            : "bg-gray-700 text-white hover:bg-gray-600"
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>


            <div className="flex w-[400px] gap-3 overflow-x-auto p-2 customScrollbar">
                {[
                    { label: "Tanpa Frame", value: "none", color: "gray" },
                    { label: "Emas 🏆", value: "gold", color: "yellow" },
                    { label: "Hitam 🖤", value: "black", color: "black" },
                    { label: "Perak 🥈", value: "silver", color: "silver" },
                    { label: "Biru 💙", value: "blue", color: "blue" },
                    { label: "Merah ❤️", value: "red", color: "red" },
                    { label: "Hijau 🍀", value: "green", color: "green" },
                    { label: "Ungu 💜", value: "purple", color: "purple" },
                    { label: "Putih ⚪", value: "white", color: "white" },
                    { label: "Coklat 🍫", value: "brown", color: "brown" },
                    { label: "Oranye 🍊", value: "orange", color: "orange" },
                    { label: "Pelangi 🌈", value: "rainbow", color: "gradient" },
                    { label: "Berlian 💎", value: "diamond", color: "lightblue" },
                    { label: "Galaxy ✨", value: "galaxy", color: "darkblue" }
                ].map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setFrame(item.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md ${frame === item.value
                            ? `bg-${item.color}-700 text-white border-4 border-${item.color}-300`
                            : `bg-${item.color}-500 text-white hover:bg-${item.color}-600`
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>


            <div className="flex w-[400px] gap-3 overflow-x-auto p-2 customScrollbar">
                {[
                    { label: "Tanpa Sticker", value: null, color: "gray" },
                    { label: "❤️ Love", value: "/heart.png", color: "red" },
                    { label: "⭐ Star", value: "/star.png", color: "yellow" },
                    { label: "🔥 Fire", value: "/fire.png", color: "orange" },
                    { label: "🎉 Party", value: "/party.png", color: "purple" },
                    { label: "😂 Laugh", value: "/laugh.png", color: "yellow" },
                    { label: "💀 Skull", value: "/skull.png", color: "black" },
                    { label: "👑 King", value: "/crown.png", color: "gold" },
                    { label: "💎 Diamond", value: "/diamond.png", color: "blue" },
                    { label: "🎯 Target", value: "/target.png", color: "red" },
                    { label: "💡 Idea", value: "/idea.png", color: "yellow" },
                    { label: "🍀 Lucky", value: "/clover.png", color: "green" },
                    { label: "☕ Coffee", value: "/coffee.png", color: "brown" },
                    { label: "🚀 Rocket", value: "/rocket.png", color: "gray" },
                    { label: "🎵 Music", value: "/music.png", color: "pink" },
                ].map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setSticker(item.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md ${sticker === item.value
                            ? `bg-${item.color}-700 text-white border-4 border-${item.color}-300`
                            : `bg-${item.color}-500 text-white hover:bg-${item.color}-600`
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            { gabungImg && (<small className="text-left text-[red]">*Klik gabungkan lagi buat update yaa</small>)}
            <button
                onClick={combineImages}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 transition-all duration-300 text-white rounded-xl shadow-md text-lg font-medium"
            >
                Gabungkan Foto 🖼️
            </button>

            {result && (
                <>
                    <div className="relative w-full max-w-md">
                        <img src={result} className="shadow-lg w-full" />
                        {/* {sticker && (
                            <>
                                <img
                                    src={sticker}
                                    alt="Sticker"
                                    className="absolute top-2 right-2 w-16 h-16"
                                />
                                <img
                                    src={sticker}
                                    alt="Sticker"
                                    className="absolute bottom-15 left-2 w-16 h-16"
                                />
                            </>
                        )} */}
                    </div>
                    <button
                        onClick={downloadImage}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 transition-all duration-300 text-white rounded-xl shadow-md text-lg font-medium"
                    >
                        Download ⬇️
                    </button>
                </>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );

}
