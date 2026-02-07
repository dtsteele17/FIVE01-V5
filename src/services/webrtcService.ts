import { supabase } from '@/lib/supabase';

// Xirsys ICE server configuration
const XIRSYS_URL = 'https://rtc.xirsys.com/v1/rtc';

interface XirsysResponse {
  iceServers: RTCIceServer[];
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private channel: any = null;
  private matchId: string = '';
  private userId: string = '';
  private opponentId: string = '';
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onConnectionStateChange: ((state: RTCPeerConnectionState) => void) | null = null;

  // Get ICE servers from Xirsys
  private async getIceServers(): Promise<RTCIceServer[]> {
    try {
      // For production, you should proxy this through your backend
      // This is a basic implementation - replace with your Xirsys credentials
      const response = await fetch(`${XIRSYS_URL}/iceservers`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('your-xirsys-identity:your-xirsys-secret')
        }
      });
      
      if (!response.ok) {
        console.warn('Xirsys fetch failed, using default STUN servers');
        return this.getDefaultIceServers();
      }
      
      const data: XirsysResponse = await response.json();
      return data.iceServers;
    } catch (error) {
      console.warn('Failed to get Xirsys ICE servers:', error);
      return this.getDefaultIceServers();
    }
  }

  private getDefaultIceServers(): RTCIceServer[] {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
  }

  // Initialize WebRTC connection
  async initialize(
    matchId: string, 
    userId: string, 
    opponentId: string,
    localVideoElement: HTMLVideoElement,
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void
  ) {
    this.matchId = matchId;
    this.userId = userId;
    this.opponentId = opponentId;
    this.onRemoteStreamCallback = onRemoteStream;
    this.onConnectionStateChange = onConnectionStateChange || null;

    // Get local camera stream
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      localVideoElement.srcObject = this.localStream;
    } catch (error) {
      console.error('Failed to get local stream:', error);
      throw error;
    }

    // Get ICE servers
    const iceServers = await this.getIceServers();

    // Create peer connection
    this.peerConnection = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: 'all',
    });

    // Add local stream tracks
    this.localStream.getTracks().forEach(track => {
      if (this.peerConnection && this.localStream) {
        this.peerConnection.addTrack(track, this.localStream);
      }
    });

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.onConnectionStateChange && this.peerConnection) {
        this.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ice-candidate',
          candidate: event.candidate,
          from: this.userId,
          to: this.opponentId,
        });
      }
    };

    // Subscribe to signaling via Supabase
    this.subscribeToSignaling();

    return this.localStream;
  }

  // Subscribe to WebRTC signaling via Supabase Realtime
  private subscribeToSignaling() {
    this.channel = supabase
      .channel(`webrtc:${this.matchId}`)
      .on(
        'broadcast',
        { event: 'signal' },
        async (payload) => {
          const signal = payload.payload;
          
          // Only process signals intended for us
          if (signal.to !== this.userId) return;

          await this.handleSignal(signal);
        }
      )
      .subscribe();
  }

  // Handle incoming signaling messages
  private async handleSignal(signal: any) {
    if (!this.peerConnection) return;

    try {
      switch (signal.type) {
        case 'offer':
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.offer));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.sendSignal({
            type: 'answer',
            answer,
            from: this.userId,
            to: this.opponentId,
          });
          break;

        case 'answer':
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.answer));
          break;

        case 'ice-candidate':
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
          break;
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  }

  // Send signaling message via Supabase
  private sendSignal(data: any) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: data,
      });
    }
  }

  // Create and send offer (called by the player who creates the lobby)
  async createOffer() {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignal({
        type: 'offer',
        offer,
        from: this.userId,
        to: this.opponentId,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  // Close connection
  close() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // Toggle video
  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Toggle audio
  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Get connection state
  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection?.connectionState || null;
  }
}

// Singleton instance
export const webRTCService = new WebRTCService();
