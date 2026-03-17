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

      const width = containerRef.current.offsetWidth || 800;
      const height = Math.round(width * 0.6);

      const config = {
        type: Phaser.AUTO,
        width,
        height,
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
      ref={containerRef}
      className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#eae5d9] bg-[#1e1b26] flex items-center justify-center"
      style={{ cursor: "none" }}
    />
  );
}

