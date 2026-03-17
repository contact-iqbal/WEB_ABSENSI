'use client';

import { useRef, useEffect, useState } from 'react';

export default function CameraComponent() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState(false);
    const [location, setLocation] = useState<{ latitude: number | null, longitude: number | null } | null>(null);
    const [errorLoc, setErrorLoc] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [withinradius, setwithinradius] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    setErrorLoc(err.message);
                }
            );
        } else {
            setErrorLoc("Geolocation is not available in your browser.");
        }
    }, []);

    useEffect(() => {
        const enableVideoStream = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setStream(mediaStream);
            } catch (err) {
                console.error('Error accessing webcam:', err);
                setError(true);
            }
        };

        enableVideoStream();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/png');
                setCapturedImage(dataUrl);
            }
        }
    };
    const haversineDistance = (coords1: { latitude: number; longitude: number; }, coords2: { latitude: number; longitude: number; }) => {
        const R = 6371; // Earth's radius in kilometers
        const toRad = (value: number) => (value * Math.PI) / 180;

        const dLat = toRad(coords2.latitude - coords1.latitude);
        const dLon = toRad(coords2.longitude - coords1.longitude);
        const lat1 = toRad(coords1.latitude);
        const lat2 = toRad(coords2.latitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    };

    const isInsideArea = (userLocation: { latitude: any; longitude: any; }, specificLocation: { latitude: number; longitude: number; }, maxDistanceKm: number) => {
        const distance = haversineDistance(userLocation, specificLocation);
        return distance <= maxDistanceKm;
    };
    useEffect(() => {
        const iswithinradius = isInsideArea({ latitude: location?.latitude, longitude: location?.longitude }, { latitude: -7.431955230651768, longitude: 112.70933383018054 }, 1)
        setwithinradius(iswithinradius)
    }, [location])

    return (
        <div>
            {error && errorLoc ? (
                <p>Akses kamera / lokasi ditolak atau tidak ditemukan.</p>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            display: stream ? 'block' : 'none' // Sembunyikan jika belum ada stream
                        }}
                    />
                    <div style={{ marginTop: '10px' }}>
                        <button onClick={takePhoto} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                            Ambil Foto
                        </button>
                    </div>
                    <span>{location?.latitude}</span>
                    <br />
                    <span>{location?.longitude}</span>
                    <br />
                    <span>{withinradius ? 'kamu di dekat kantor' : 'kamu tidak dekat kantor'}</span>
                </>


            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {!stream && !error && <p>Meminta izin kamera...</p>}

            {capturedImage && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Hasil Foto:</h3>
                    <img src={capturedImage} alt="Captured" style={{ width: '100%', maxWidth: '500px' }} />
                    <br />
                    <a href={capturedImage} download="foto.png">Download Gambar</a>
                </div>
            )}
        </div>
    );
}
