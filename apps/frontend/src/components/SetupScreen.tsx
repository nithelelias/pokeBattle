import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, User, Swords, Shield, Zap } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import Webcam from 'react-webcam';
import type { LocalPlayerState } from 'shared';

import { MAX_STATS_POINTS } from 'shared';

interface SetupScreenProps {
    playerState: LocalPlayerState;
    onComplete: (state: Partial<LocalPlayerState>) => void;
}

export function SetupScreen({ playerState, onComplete }: SetupScreenProps) {
    const [nickname, setNickname] = useState(playerState.nickname);
    const [photoBase64, setPhotoBase64] = useState<string | null>(playerState.photoBase64);
    const [stats, setStats] = useState(playerState.stats);
    const [useWebcam, setUseWebcam] = useState(false);
    const webcamRef = useRef<Webcam>(null);

    const totalPointsSpent = stats.hp + stats.damage + stats.speed;
    const remainingPoints = MAX_STATS_POINTS - totalPointsSpent;

    const handleStatChange = (stat: keyof typeof stats, increment: boolean) => {
        setStats(prev => {
            const current = prev[stat];
            if (increment && remainingPoints > 0) {
                return { ...prev, [stat]: current + 1 };
            } else if (!increment && current > 0) {
                return { ...prev, [stat]: current - 1 };
            }
            return prev;
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await compressAndSetImage(file);
        }
    };

    const compressAndSetImage = async (file: File) => {
        const options = {
            maxSizeMB: 0.14, // < 150kb
            maxWidthOrHeight: 300,
            useWebWorker: true,
        };
        try {
            const compressedFile = await imageCompression(file, options);
            const circularBase64 = await cropToCircle(compressedFile);
            setPhotoBase64(circularBase64);
            setUseWebcam(false);
        } catch (error) {
            console.error('Error compressing image:', error);
        }
    };

    const cropToCircle = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = Math.min(img.width, img.height);
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return resolve(img.src);

                    // Draw circular path mask
                    ctx.beginPath();
                    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();

                    // Draw image centered
                    ctx.drawImage(
                        img, 
                        (img.width - size) / 2, 
                        (img.height - size) / 2, 
                        size, size, 
                        0, 0, size, size
                    );

                    resolve(canvas.toDataURL('image/png'));
                };
            };
        });
    };

    const captureWebcam = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            // Convert base64 to file to compress it uniformly
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
                    compressAndSetImage(file);
                });
        }
    }, [webcamRef]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim() && photoBase64 && remainingPoints === 0) {
            onComplete({ nickname, photoBase64, stats, isReady: true });
        }
    };

    const isComplete = nickname.trim() && photoBase64 && remainingPoints === 0;

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-xl animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                <h1 className="text-4xl font-black text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-rose-400">
                    monoPokeBattle
                </h1>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Character Photo Section */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary bg-slate-900 shadow-xl flex flex-col items-center justify-center">
                                {useWebcam ? (
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover"
                                    />
                                ) : photoBase64 ? (
                                    <img src={photoBase64} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-500" />
                                )}
                            </div>
                            
                            {/* Floating Action Buttons */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-2">
                                {useWebcam ? (
                                    <button type="button" onClick={captureWebcam} className="p-2 bg-primary rounded-full hover:bg-blue-400 transition-colors shadow-lg">
                                        <Camera className="w-4 h-4 text-white" />
                                    </button>
                                ) : (
                                    <>
                                        <button type="button" onClick={() => setUseWebcam(true)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors shadow-lg">
                                            <Camera className="w-4 h-4 text-white" />
                                        </button>
                                        <label className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors cursor-pointer shadow-lg flex-shrink-0">
                                            <Upload className="w-4 h-4 text-white" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 font-medium text-center">
                            Upload or capture a photo (Auto-compressed to &lt; 150kb)
                        </p>
                    </div>

                    {/* Nickname */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Nickname</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Enter your battle name"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-600 font-medium tracking-wide"
                        />
                    </div>

                    {/* Stats Allocation */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                        <div className="flex justify-between items-center mb-6">
                            <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">Allocate Stats</label>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${remainingPoints === 0 ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {remainingPoints} Points Left
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                { key: 'hp', icon: <Shield className="w-5 h-5 text-emerald-400" />, label: 'HP (Health)' },
                                { key: 'damage', icon: <Swords className="w-5 h-5 text-rose-400" />, label: 'Damage' },
                                { key: 'speed', icon: <Zap className="w-5 h-5 text-amber-400" />, label: 'Speed' }
                            ].map(({ key, icon, label }) => (
                                <div key={key} className="flex items-center justify-between bg-slate-800 p-3 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-slate-900 p-2 rounded-lg">{icon}</div>
                                        <span className="font-medium text-slate-200">{label}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <button 
                                            type="button" 
                                            onClick={() => handleStatChange(key as keyof typeof stats, false)}
                                            disabled={stats[key as keyof typeof stats] === 0}
                                            className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-600 disabled:opacity-50 transition-colors"
                                        >-</button>
                                        <span className="w-6 text-center font-bold text-lg">{stats[key as keyof typeof stats]}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleStatChange(key as keyof typeof stats, true)}
                                            disabled={remainingPoints === 0}
                                            className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-600 disabled:opacity-50 transition-colors"
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!isComplete}
                        className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all transform active:scale-[0.98]
                            ${isComplete 
                                ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-primary text-white shadow-lg shadow-blue-500/30' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
                    >
                        ENTER BATTLE LOBBY
                    </button>
                </form>
            </div>
        </div>
    );
}
