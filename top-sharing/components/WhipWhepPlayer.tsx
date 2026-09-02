'use client';

import { useEffect, useRef, useState } from 'react';

export default function WhipWhepPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [statsText, setStatsText] = useState('A aguardar estatísticas...');
  const [iceStates, setIceStates] = useState<string[]>([]);

  // Usamos ref para manter a referência ao activePeerConnection sem re-renderizar o componente
  const activePeerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const appendICEState = (peerConnection: RTCPeerConnection) => {
    peerConnection.oniceconnectionstatechange = () => {
      setIceStates((prev) => [...prev, peerConnection.iceConnectionState]);
    };
  };

  const doWHEP = async () => {
    try {
      const peerConnection = new RTCPeerConnection();
      activePeerConnectionRef.current = peerConnection;
      appendICEState(peerConnection);

      peerConnection.addTransceiver('video', { direction: 'recvonly' });
      peerConnection.addTransceiver('audio', { direction: 'recvonly' });

      peerConnection.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          videoRef.current.play().catch(err => console.log("Erro no autoplay:", err));
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const response = await fetch(`http://192.168.0.111:8080/whep/1`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer none`,
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
    }
  };

  const doWHIP = () => {
    const peerConnection = new RTCPeerConnection();
    activePeerConnectionRef.current = peerConnection;
    appendICEState(peerConnection);

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, max: 60 },
        },
        audio: true,
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

        peerConnection.createOffer().then((offer) => {
          peerConnection.setLocalDescription(offer);

          fetch(`/whip/1`, {
            method: 'POST',
            body: offer.sdp,
            headers: {
              Authorization: `Bearer none`,
              'Content-Type': 'application/sdp',
            },
          })
            .then((r) => r.text())
            .then((answer) => {
              peerConnection.setRemoteDescription({
                sdp: answer,
                type: 'answer',
              });
            });
        });
      });
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

      stats.forEach((report: any) => {
        if (report.type === 'inbound-rtp' && report.kind === 'video') {
          const now = Date.now();
          const bytes = report.bytesReceived;
          const bitrate = (8 * (bytes - lastBytesReceived) / ((now - lastTimestamp) / 1000)) / 1000;

          lastBytesReceived = bytes;
          lastTimestamp = now;

          text += `Resolução: ${report.frameWidth}x${report.frameHeight} px<br>`;
          text += `FPS: ${report.framesPerSecond || 0}<br>`;
          text += `Bitrate: ${bitrate.toFixed(2)} kbps<br>`;
          text += `Pacotes perdidos: ${report.packetsLost || 0}<br>`;
          text += `Codec ID: ${report.codecId || 'N/A'}<br>`;
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
      <h1>whip-whep</h1>
      <div>
        <button onClick={doWHIP} style={{ marginRight: '10px', padding: '8px 16px' }}>
          Publish
        </button>
        <button onClick={doWHEP} style={{ padding: '8px 16px' }}>
          Subscribe
        </button>
      </div>

      <h3>Video</h3>
      <video
        ref={videoRef}
        autoPlay
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
