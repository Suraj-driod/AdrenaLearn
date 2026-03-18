"use client";

import { useEffect, useRef } from "react";

export default function BalloonShooterEmbedded({ topic, courseId, lessonId }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let game = null;

    if (typeof window !== "undefined") {
      window.__GAME_TOPIC__ = topic || "variables";
      window.__GAME_COURSE_ID__ = courseId || "";
      window.__GAME_LESSON_ID__ = lessonId || "";
    }

    const initPhaser = async () => {
      const PhaserModule = await import("phaser");
      const Phaser = PhaserModule.default || PhaserModule;
      const { createBalloonScene, createMenuScene } = await import("../../scenes/BalloonScene");

      if (!isMounted) return;

      const MenuScene = createMenuScene(Phaser);
      const BalloonScene = createBalloonScene(Phaser);

      if (!containerRef.current) return;

      // prevent hot-reload ghost canvases
      containerRef.current.innerHTML = "";

      const config = {
        type: Phaser.AUTO,
        width: 1000,
        height: 600,
        parent: containerRef.current,
        backgroundColor: "#2d1b00",
        scene: [MenuScene, BalloonScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: "arcade",
          arcade: { gravity: { y: 0 }, debug: false },
        },
      };

      game = new Phaser.Game(config);
      gameRef.current = game;
    };

    initPhaser();

    return () => {
      isMounted = false;
      if (game) {
        game.destroy(true);
        game = null;
      }
      if (gameRef.current) {
        gameRef.current = null;
      }
    };
  }, [topic, courseId, lessonId]);

  return (
    <div
      className="w-full h-full flex items-center justify-center p-2 overflow-hidden"
      style={{ cursor: "none" }}
    >
      <div
        ref={containerRef}
        className="w-full max-w-[1000px] aspect-[5/3] max-h-full flex items-center justify-center overflow-hidden [&>canvas]:rounded-2xl [&>canvas]:border-2 [&>canvas]:border-[#eae5d9] [&>canvas]:max-w-full [&>canvas]:max-h-full"
      />
    </div>
  );
}