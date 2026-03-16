// src/component/games/BalloonGame.jsx
"use client";

import { useEffect, useRef } from "react";

export default function BalloonGame({ topic }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    // Set topic for BalloonScene to read
    if (typeof window !== 'undefined') {
      window.__GAME_TOPIC__ = topic || 'variables';
    }

    const initPhaser = async () => {
      const PhaserModule = await import("phaser");
      const Phaser = PhaserModule.default || PhaserModule;
      const { createBalloonScene } = await import("../../scenes/BalloonScene");
      
      if (!isMounted) return;
      const BalloonScene = createBalloonScene(Phaser);

      const width = containerRef.current?.offsetWidth || 800;
      const height = Math.round(width * 0.6);

      const config = {
        type: Phaser.AUTO,
        width: width,
        height: height,
        parent: containerRef.current,
        backgroundColor: "#2d1b00",
        scene: [BalloonScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0 }, debug: false },
        },
      };

      gameRef.current = new Phaser.Game(config);
    };

    initPhaser();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [topic]);

  return (
    <div
      ref={containerRef}
      id="phaser-balloon-container"
      style={{ width: "100%", cursor: "none" }}
    />
  );
}
