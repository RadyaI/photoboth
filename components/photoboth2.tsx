/* eslint-disable */
/* @ts-ignore */
"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { saveAs } from "file-saver";

export default function PhotoBooth() {
    const webcamRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [images, setImages] = useState<(string | null)[]>([]);
    const [filter, setFilter] = useState("none");
    const [frame, setFrame] = useState("none");
    const [sticker, setSticker] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    const startCountdown = () => {
        setCountdown(3);
        let counter = 3;
        const interval = setInterval(() => {
            counter -= 1;
            setCountdown(counter);
            if (counter === 0) {
                clearInterval(interval);
                capture();
            }
        }, 1000);
    };

    const capture = () => {
        if (webcamRef.current && canvasRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.filter = filter;
                ctx.drawImage(img, 0, 0);

                if (frame !== "none") {
                    const frameImg = new Image();
                    frameImg.src = frame;
                    frameImg.onload = () => {
                        ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
                        processImage(canvas);
                    };
                } else {
                    processImage(canvas);
                }
            };
        }
    };

    const processImage = (canvas: HTMLCanvasElement) => {
        const editedImage = canvas.toDataURL("image/png");
        setImages((prev) => [...prev, editedImage].slice(0, 3));
    };

    const downloadImage = (src: string | null) => {
        if (src) {
            saveAs(src, "photo.png");
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <Webcam ref={webcamRef} screenshotFormat="image/png" className="w-full max-w-md rounded-lg shadow-lg" />
            <canvas ref={canvasRef} className="hidden" />

            {countdown > 0 && <div className="text-4xl font-bold text-red-600">{countdown}</div>}

            <div className="flex gap-2">
                <button onClick={startCountdown} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                    Jepret 📸
                </button>
                <select onChange={(e) => setFilter(e.target.value)} className="px-2 py-1 border rounded-lg">
                    <option value="none">Tanpa Filter</option>
                    <option value="grayscale(100%)">Grayscale</option>
                    <option value="sepia(100%)">Sepia</option>
                    <option value="invert(100%)">Invert</option>
                </select>
                <select onChange={(e) => setFrame(e.target.value)} className="px-2 py-1 border rounded-lg">
                    <option value="none">Tanpa Frame</option>
                    <option value="/frames/frame1.png">Frame 1</option>
                    <option value="/frames/frame2.png">Frame 2</option>
                </select>
            </div>

            <div className="flex gap-2">
                {images.map((src, index) => (
                    <div key={index} className="relative">
                        <img src={src || ""} className="w-24 h-24 object-cover rounded-lg border" />
                        <button
                            onClick={() => downloadImage(src)}
                            className="absolute bottom-1 right-1 bg-gray-800 text-white px-1 py-0.5 text-xs rounded">
                            ⬇️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
