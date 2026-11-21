import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Share2, 
  UserPlus, 
  Maximize2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { LinmaxLogo } from '../LinmaxLogo';
import { soundEngine } from '../../utils/audio';

export interface ActiveCallState {
  status: 'incoming' | 'outgoing' | 'connected';
  callType: 'voice' | 'video';
  contactName: string;
  contactAvatar: string;
  contactChatCode: string;
  startTime?: number;
}

interface CallModalProps {
  call: ActiveCallState;
  onAccept: () => void;
  onDecline: () => void;
  onEnd: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  call,
  onAccept,
  onDecline,
  onEnd,
}) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(call.callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Sound effects & ringtone
  useEffect(() => {
    if (call.status === 'incoming' || call.status === 'outgoing') {
      soundEngine.startRinging();
    } else {
      soundEngine.stopRinging();
    }

    return () => {
      soundEngine.stopRinging();
    };
  }, [call.status]);

  // Call duration counter
  useEffect(() => {
    if (call.status !== 'connected') return;

    const timer = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [call.status]);

  // Request actual camera feed if video call
  useEffect(() => {
    if (call.callType === 'video' && call.status === 'connected') {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          setHasCameraPermission(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Gracefully fallback to simulated visual stream if camera unavailable
          setHasCameraPermission(false);
        });
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [call.callType, call.status]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
      } catch {
        // user cancelled screen share
      }
    } else {
      setIsScreenSharing(false);
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1. INCOMING CALL SCREEN
  if (call.status === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 bg-[#03090D]/95 backdrop-blur-2xl flex flex-col items-center justify-between py-12 px-6 animate-in fade-in">
        {/* Top Branding */}
        <div className="flex flex-col items-center gap-2">
          <LinmaxLogo size="md" showText={true} showTagline={true} />
          <div className="mt-4 px-3 py-1 rounded-full bg-[#00E5D4]/10 border border-[#00E5D4]/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5D4] animate-ping" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#00E5D4]">
              Incoming {call.callType === 'video' ? 'Video' : 'Voice'} Call
            </span>
          </div>
        </div>

        {/* Center Caller Profile with Cyan Pulse Glow */}
        <div className="flex flex-col items-center text-center my-auto">
          <div className="relative mb-6">
            {/* Animated glowing wave rings */}
            <div className="absolute -inset-4 rounded-full bg-[#00E5D4]/20 animate-calling-wave" />
            <div className="absolute -inset-8 rounded-full bg-[#00CFEF]/10 animate-calling-wave" style={{ animationDelay: '0.6s' }} />

            <div className="relative w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-[#00E5D4] via-[#00CFEF] to-[#00AFC2] shadow-[0_0_35px_rgba(0,229,212,0.5)]">
              <img
                src={call.contactAvatar}
                alt={call.contactName}
                className="w-full h-full object-cover rounded-full bg-[#07151B]"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold font-display text-white mb-1">
            {call.contactName}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm text-[#00E5D4] font-medium">
            <span className="px-2 py-0.5 rounded bg-[#0B1B22] border border-[#00E5D4]/20 font-mono">
              {call.contactChatCode}
            </span>
          </div>
          <p className="text-xs text-[#A8BBC2] mt-2">
            Linmax Secure Encrypted Connection
          </p>
        </div>

        {/* Bottom Actions: Green Answer & Red Decline */}
        <div className="flex items-center gap-12 sm:gap-16">
          {/* Decline Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playCallEnd();
                onDecline();
              }}
              className="w-16 h-16 rounded-full bg-[#F33248] hover:bg-[#ff4258] text-white flex items-center justify-center shadow-[0_0_25px_rgba(243,50,72,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Decline Call"
            >
              <PhoneOff size={28} />
            </button>
            <span className="text-xs text-[#A8BBC2] font-medium">Decline</span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onAccept}
              className="w-16 h-16 rounded-full bg-[#20E66B] hover:bg-[#2bff7b] text-[#03090D] flex items-center justify-center shadow-[0_0_25px_rgba(32,230,107,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Accept Call"
            >
              {call.callType === 'video' ? <Video size={28} /> : <Phone size={28} />}
            </button>
            <span className="text-xs text-[#20E66B] font-medium">Accept</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. OUTGOING CALL SCREEN
  if (call.status === 'outgoing') {
    return (
      <div className="fixed inset-0 z-50 bg-[#03090D]/95 backdrop-blur-2xl flex flex-col items-center justify-between py-12 px-6 animate-in fade-in">
        {/* Top Logo */}
        <div className="flex flex-col items-center gap-2">
          <LinmaxLogo size="md" showText={true} />
          <div className="mt-3 text-xs uppercase tracking-widest text-[#00CFEF] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00CFEF] animate-ping" />
            Calling {call.callType === 'video' ? 'Video' : 'Voice'}...
          </div>
        </div>

        {/* Center Recipient Avatar */}
        <div className="flex flex-col items-center text-center my-auto">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-[#00CFEF]/20 animate-calling-wave" />
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#00E5D4] to-[#00CFEF] shadow-[0_0_30px_rgba(0,207,239,0.4)]">
              <img
                src={call.contactAvatar}
                alt={call.contactName}
                className="w-full h-full object-cover rounded-full bg-[#07151B]"
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold font-display text-white mb-1">
            {call.contactName}
          </h2>
          <span className="text-xs text-[#00E5D4] bg-[#0B1B22] px-2.5 py-1 rounded-full border border-[#00E5D4]/20 font-mono">
            {call.contactChatCode}
          </span>
          <p className="text-xs text-[#A8BBC2] mt-3 animate-pulse">
            Ringing... waiting for response
          </p>
        </div>

        {/* End Call / Cancel */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playCallEnd();
              onEnd();
            }}
            className="w-16 h-16 rounded-full bg-[#F33248] hover:bg-[#ff4258] text-white flex items-center justify-center shadow-[0_0_25px_rgba(243,50,72,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <PhoneOff size={28} />
          </button>
          <span className="text-xs text-[#A8BBC2]">Cancel</span>
        </div>
      </div>
    );
  }

  // 3. CONNECTED VIDEO CALL
  if (call.callType === 'video') {
    return (
      <div className="fixed inset-0 z-50 bg-[#03090D] flex flex-col justify-between overflow-hidden animate-in fade-in">
        {/* Remote Video Stream (Main area) */}
        <div className="relative w-full h-full flex items-center justify-center bg-[#07151B]">
          {/* Remote partner simulated camera scene or avatar stream */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={call.contactAvatar}
              alt={call.contactName}
              className="w-full h-full object-cover filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />

            {/* Simulated subtle voice equalizer on remote video */}
            <div className="absolute bottom-28 left-6 flex items-center gap-3 bg-[#03090D]/70 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#00E5D4]/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20E66B] animate-pulse" />
              <span className="text-xs text-white font-medium">{call.contactName}</span>
              <div className="flex items-center gap-1 h-3">
                <span className="w-1 bg-[#00E5D4] h-3 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 bg-[#00E5D4] h-2 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                <span className="w-1 bg-[#00E5D4] h-4 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>

          {/* Local Camera Picture-in-Picture (Small Self View) */}
          <div className="absolute top-18 right-6 w-32 h-44 sm:w-40 sm:h-56 rounded-2xl overflow-hidden border-2 border-[#00E5D4]/40 shadow-[0_0_25px_rgba(0,229,212,0.3)] bg-[#03090D] z-30">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#0B1B22]">
                <VideoOff size={24} className="text-[#A8BBC2] mb-1" />
                <span className="text-[10px] text-[#A8BBC2]">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
              You
            </div>
          </div>
        </div>

        {/* Video Call Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <LinmaxLogo size="sm" showText={false} />
            <div>
              <h3 className="font-display font-semibold text-white text-sm">
                {call.contactName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-[#00E5D4]">
                <span className="w-2 h-2 rounded-full bg-[#20E66B]" />
                <span className="font-mono">{formatDuration(duration)}</span>
                <span className="text-[#A8BBC2]">· HD 1080p</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleScreenShare}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isScreenSharing
                  ? 'bg-[#00E5D4] text-[#03090D]'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
              title="Share Screen"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Video Call Control Bar */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-center px-4">
          <div className="bg-[#07151B]/90 backdrop-blur-xl border border-[#00E5D4]/25 px-6 py-3.5 rounded-full shadow-[0_0_30px_rgba(0,229,212,0.2)] flex items-center gap-4 sm:gap-6">
            {/* Mic Toggle */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-[#0B1B22] text-[#00E5D4] hover:bg-[#102630]'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-all cursor-pointer ${
                !isVideoEnabled
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-[#0B1B22] text-[#00E5D4] hover:bg-[#102630]'
              }`}
              title={isVideoEnabled ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            {/* End Call */}
            <button
              onClick={() => {
                soundEngine.playCallEnd();
                onEnd();
              }}
              className="p-3.5 rounded-full bg-[#F33248] hover:bg-[#ff4258] text-white shadow-[0_0_20px_rgba(243,50,72,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="End Video Call"
            >
              <PhoneOff size={22} />
            </button>

            {/* Speaker Toggle */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3 rounded-full transition-all cursor-pointer ${
                !isSpeakerOn
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-[#0B1B22] text-[#00E5D4] hover:bg-[#102630]'
              }`}
              title="Toggle Speaker"
            >
              {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. CONNECTED VOICE CALL
  return (
    <div className="fixed inset-0 z-50 bg-[#03090D]/95 backdrop-blur-2xl flex flex-col items-center justify-between py-12 px-6 animate-in fade-in">
      {/* Top Branding & Connection Status */}
      <div className="flex flex-col items-center gap-2">
        <LinmaxLogo size="md" showText={true} />
        <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5D4]/10 border border-[#00E5D4]/25">
          <span className="w-2 h-2 rounded-full bg-[#20E66B] animate-pulse" />
          <span className="text-xs font-mono font-bold text-[#00E5D4]">
            {formatDuration(duration)}
          </span>
          <span className="text-xs text-[#A8BBC2]">· Encrypted Voice</span>
        </div>
      </div>

      {/* Center Avatar & Sound Wave Visualizer */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="relative mb-6">
          {/* Subtle audio reactive aura */}
          <div className="absolute -inset-4 rounded-full bg-[#00E5D4]/15 animate-pulse-subtle" />
          
          <div className="relative w-36 h-36 rounded-full p-1 bg-gradient-to-tr from-[#00E5D4] via-[#00CFEF] to-[#00AFC2] shadow-[0_0_35px_rgba(0,229,212,0.35)]">
            <img
              src={call.contactAvatar}
              alt={call.contactName}
              className="w-full h-full object-cover rounded-full bg-[#07151B]"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold font-display text-white mb-1">
          {call.contactName}
        </h2>
        <span className="text-xs text-[#00E5D4] bg-[#0B1B22] px-3 py-1 rounded-full border border-[#00E5D4]/20 font-mono">
          {call.contactChatCode}
        </span>

        {/* Live Audio Visualizer Bars */}
        <div className="flex items-center gap-1.5 mt-6 h-8">
          {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 35].map((height, idx) => (
            <div
              key={idx}
              className="w-1 bg-gradient-to-t from-[#00AFC2] to-[#00E5D4] rounded-full transition-all duration-150"
              style={{
                height: isMuted ? '4px' : `${Math.max(6, (height * (Math.sin(duration * 2 + idx) + 1.2)) / 2)}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Voice Call Controls Bar */}
      <div className="flex items-center gap-5 sm:gap-8 bg-[#07151B]/80 border border-[#00E5D4]/20 p-4 rounded-full shadow-[0_0_30px_rgba(0,229,212,0.15)]">
        {/* Mute Mic */}
        <button
          onClick={toggleMute}
          className={`p-3.5 rounded-full transition-all cursor-pointer ${
            isMuted
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-[#0B1B22] text-[#00E5D4] hover:bg-[#102630]'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Speaker Mode */}
        <button
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          className={`p-3.5 rounded-full transition-all cursor-pointer ${
            !isSpeakerOn
              ? 'bg-gray-700 text-gray-400'
              : 'bg-[#0B1B22] text-[#00E5D4] hover:bg-[#102630]'
          }`}
          title="Speaker"
        >
          {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>

        {/* End Call Button */}
        <button
          onClick={() => {
            soundEngine.playCallEnd();
            onEnd();
          }}
          className="p-4 rounded-full bg-[#F33248] hover:bg-[#ff4258] text-white shadow-[0_0_25px_rgba(243,50,72,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="End Call"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};
