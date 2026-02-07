// ============================================
// FIVE01 Darts - Camera Setup Component
// Pre-game camera check and permissions
// ============================================

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Mic, MicOff, CameraOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface CameraSetupProps {
  onReady: () => void;
  onSkip: () => void;
}

export function CameraSetup({ onReady, onSkip }: CameraSetupProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false); // Default off for privacy
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    checkCamera();
    return () => {
      // Cleanup stream on unmount
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const checkCamera = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setHasPermission(false);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera to use video features.');
      } else {
        setError(`Camera error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraEnabled;
        setCameraEnabled(!cameraEnabled);
      }
    }
  };

  const toggleAudio = async () => {
    if (!audioEnabled) {
      // Enable audio
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioEnabled(true);
        audioStream.getTracks().forEach(track => track.stop()); // Just checking permission
      } catch {
        setError('Microphone permission denied');
        return;
      }
    } else {
      setAudioEnabled(false);
    }
  };

  const handleReady = () => {
    // Stop the preview stream
    stream?.getTracks().forEach(track => track.stop());
    onReady();
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
      <Card className="bg-[#111827] border-gray-800 p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Camera Setup</h1>
          <p className="text-gray-400">
            Check your camera before the match starts
          </p>
        </div>

        {/* Camera Preview */}
        <div className="relative mb-6 bg-black rounded-xl overflow-hidden aspect-video">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hasPermission ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!cameraEnabled ? 'hidden' : ''}`}
              />
              {!cameraEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <CameraOff className="w-16 h-16 text-gray-600" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cameraEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {cameraEnabled ? 'Camera On' : 'Camera Off'}
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
              <p className="text-red-400 font-medium mb-2">Camera Access Required</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={toggleCamera}
            disabled={!hasPermission}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              cameraEnabled
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
            {cameraEnabled ? 'Camera On' : 'Camera Off'}
          </button>

          <button
            onClick={toggleAudio}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              audioEnabled
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            {audioEnabled ? 'Mic On' : 'Mic Off'}
          </button>

          <button
            onClick={checkCamera}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Retry
          </button>
        </div>

        {/* Tips */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Tips for best experience
          </h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Position your camera to show your throwing area</li>
            <li>• Ensure good lighting in your room</li>
            <li>• Keep your camera stable and at eye level</li>
            <li>• You can turn off camera anytime during the match</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleReady}
            disabled={!hasPermission}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Ready to Play
          </Button>
          <Button
            onClick={onSkip}
            variant="outline"
            className="border-gray-600"
          >
            Skip Camera
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default CameraSetup;
