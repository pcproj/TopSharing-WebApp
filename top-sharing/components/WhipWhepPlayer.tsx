'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

interface WhipWhepPlayerProps {
  username: string;
  streamToken: string;
}

export default function WhipWhepPlayer({ username, streamToken }: WhipWhepPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [statsText, setStatsText] = useState('A aguardar estatísticas...');
  const [iceStates, setIceStates] = useState<string[]>([]);
  // Usamos ref para manter a referência ao activePeerConnection sem re-renderizar o componente
  const activePeerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const startedRef = useRef(false);

  const appendICEState = (peerConnection: RTCPeerConnection) => {
    peerConnection.oniceconnectionstatechange = () => {
      setIceStates((prev) => [...prev, peerConnection.iceConnectionState]);
    };
  };

  const doWHEP = async () => {
    if (startedRef.current) return; // evita múltiplos starts
    startedRef.current = true;

    try {
      const peerConnection = new RTCPeerConnection();
      activePeerConnectionRef.current = peerConnection;
      appendICEState(peerConnection);

      peerConnection.addTransceiver('video', { direction: 'recvonly' });
      peerConnection.addTransceiver('audio', { direction: 'recvonly' });

      peerConnection.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const response = await fetch(`http://192.168.0.111:8080/whep/${username}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${streamToken}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro do servidor WHEP: ${response.status}`);
      }

      const answer = await response.text();
      await peerConnection.setRemoteDescription({
        sdp: answer,
        type: 'answer',
      });
    } catch (error) {
      console.error("Erro detalhado no WHEP:", error);
      alert("Erro ao subscrever (WHEP): " + error);
      startedRef.current = false;
    }
  };

  // Loop de estatísticas com useEffect
  useEffect(() => {
    let lastBytesReceived = 0;
    let lastTimestamp = Date.now();

    const interval = setInterval(async () => {
      const pc = activePeerConnectionRef.current;
      if (!pc) return;

      const stats = await pc.getStats();
      let text = '';

      stats.forEach((report: RTCStats) => {
        if (report.type === 'inbound-rtp') {
          const inboundReport = report as RTCInboundRtpStreamStats;
          if (inboundReport.kind !== 'video') return;
          const now = Date.now();
          const bytes = inboundReport.bytesReceived ?? 0;
          const bitrate = (8 * (bytes - lastBytesReceived) / ((now - lastTimestamp) / 1000)) / 1000;

          lastBytesReceived = bytes;
          lastTimestamp = now;

          text += `Resolução: ${inboundReport.frameWidth}x${inboundReport.frameHeight} px<br>`;
          text += `FPS: ${inboundReport.framesPerSecond || 0}<br>`;
          text += `Bitrate: ${bitrate.toFixed(2)} kbps<br>`;
          text += `Pacotes perdidos: ${inboundReport.packetsLost || 0}<br>`;
          text += `Codec ID: ${inboundReport.codecId || 'N/A'}<br>`;
        }
      });

      if (text !== '') {
        setStatsText(text);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>{username}</h1>

      <h3>Video</h3>
      <video
        ref={videoRef}
        autoPlay
        onClick={() => {
          doWHEP();
        }}
        muted
        controls
        style={{ width: '900px', background: '#000' }}
      />

      <div
        id="statsBox"
        style={{
          fontFamily: 'monospace',
          background: '#111',
          color: '#0f0',
          padding: '10px',
          marginTop: '10px',
          width: '500px',
        }}
        dangerouslySetInnerHTML={{ __html: statsText }}
      />

      <h3>ICE Connection States</h3>
      <div id="iceConnectionStates">
        {iceStates.map((state, index) => (
          <p key={index}>{state}</p>
        ))}
      </div>
    </main>
  );
}
