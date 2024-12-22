import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const imgRef = useRef(null);
  const [status, setStatus] = useState("Connecting...");
  const [loading, setLoading] = useState(true);
  const [objectCount, setObjectCount] = useState(0);

  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      setStatus("Live");
    });

    socket.on("disconnect", () => {
      setStatus("Disconnected");
    });

    // Listener for frame
    socket.on("frame", (data) => {
      const blob = new Blob([data], { type: 'image/jpeg' });
      const oldSrc = imgRef.current.src;

      imgRef.current.src = URL.createObjectURL(blob);
      setLoading(false);

      if (oldSrc.startsWith('blob:')) {
        URL.revokeObjectURL(oldSrc);
      }
    });

    // Listener for object count
    socket.on("count", (count) => {
      setObjectCount(parseInt(count, 10));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Real-Time Student Detection</h1>
        <p className={`status ${status === "Live" ? "live" : "disconnected"}`}>{status}</p>
      </header>
      <div className="dashboard">
        <div className="stats-card">
          <h2>Detected Students</h2>
          <p className="object-count">{objectCount}</p>
        </div>
        <div className="video-stream">
          {loading && <p className="loading">Loading video stream...</p>}
          <img ref={imgRef} alt="Video Stream" className="stream" />
        </div>
      </div>
    </div>
  );
}

export default App;