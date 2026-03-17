import { auth } from "../../../backend/firebase";
import { updateGameStats } from "../../../backend/gameStatsHelper";
import { getQuestionsByTopic } from "../../gameQuestions";

export function createMenuScene(Phaser) {
  class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: "MenuScene" });
    }

    preload() {
      this.load.image("bg", "/assets/Balloon-shooting/WoodenBg.png");
      this.load.image("bow", "/assets/Balloon-shooting/bow.png");
      this.load.image("balloon_red", "/assets/Balloon-shooting/balloon_red.svg");
      this.load.image("balloon_blue", "/assets/Balloon-shooting/balloon_blue.svg");
      this.load.image("balloon_yellow", "/assets/Balloon-shooting/balloon_yellow.svg");
      this.load.image("balloon_white", "/assets/Balloon-shooting/balloon_white.svg");
    }

    create() {
      const W = this.scale.width;
      const H = this.scale.height;

      // Background
      const bg = this.add.image(W / 2, H / 2, "bg");
      bg.setDisplaySize(W, H);

      // Dark overlay for contrast
      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0.55);
      overlay.fillRect(0, 0, W, H);

      // Floating decorative balloons in background
      const decoColors = ["balloon_red", "balloon_blue", "balloon_yellow", "balloon_white"];
      for (let i = 0; i < 6; i++) {
        const bx = Phaser.Math.Between(60, W - 60);
        const by = Phaser.Math.Between(80, H - 120);
        const balloon = this.add.image(bx, by, decoColors[i % 4]);
        balloon.setScale(0.6 + Math.random() * 0.4);
        balloon.setAlpha(0.2 + Math.random() * 0.15);
        balloon.setOrigin(0.5, 0.2571);

        this.tweens.add({
          targets: balloon,
          y: by - Phaser.Math.Between(20, 50),
          duration: Phaser.Math.Between(2000, 4000),
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Bow decoration (bottom center, subtle)
      const bow = this.add.image(W / 2, H - 50, "bow");
      bow.setScale(0.18);
      bow.setAlpha(0.3);

      // ─── TITLE ───────────────────────────────────────────────
      const titleShadow = this.add
        .text(W / 2 + 3, H * 0.28 + 3, "BALLOON\nSHOOTER", {
          fontSize: "52px",
          fontFamily: "Arial Black, sans-serif",
          color: "#000000",
          align: "center",
          lineSpacing: 8,
        })
        .setOrigin(0.5)
        .setAlpha(0.4);

      const titleText = this.add
        .text(W / 2, H * 0.28, "BALLOON\nSHOOTER", {
          fontSize: "52px",
          fontFamily: "Arial Black, sans-serif",
          color: "#FFD700",
          stroke: "#8B4513",
          strokeThickness: 8,
          align: "center",
          lineSpacing: 8,
        })
        .setOrigin(0.5);

      // Title float animation
      this.tweens.add({
        targets: [titleText, titleShadow],
        y: "-=10",
        duration: 2000,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });

      // ─── START BUTTON ────────────────────────────────────────
      const startBtnBg = this.add.graphics();
      const startBtnX = W / 2;
      const startBtnY = H * 0.55;
      const btnW = 220;
      const btnH = 60;

      // Button background
      startBtnBg.fillStyle(0x2ecc71, 1);
      startBtnBg.fillRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
      startBtnBg.lineStyle(3, 0x000000, 1);
      startBtnBg.strokeRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);

      // Shadow
      const startShadow = this.add.graphics();
      startShadow.fillStyle(0x000000, 0.3);
      startShadow.fillRoundedRect(startBtnX - btnW / 2 + 4, startBtnY - btnH / 2 + 4, btnW, btnH, 16);
      startShadow.setDepth(0);
      startBtnBg.setDepth(1);

      const startText = this.add
        .text(startBtnX, startBtnY, "START", {
          fontSize: "28px",
          fontFamily: "Arial Black, sans-serif",
          color: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(2);

      const startHitbox = this.add
        .zone(startBtnX, startBtnY, btnW, btnH)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      startHitbox.on("pointerover", () => {
        startBtnBg.clear();
        startBtnBg.fillStyle(0x27ae60, 1);
        startBtnBg.fillRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
        startBtnBg.lineStyle(3, 0x000000, 1);
        startBtnBg.strokeRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
        startText.setScale(1.08);
      });

      startHitbox.on("pointerout", () => {
        startBtnBg.clear();
        startBtnBg.fillStyle(0x2ecc71, 1);
        startBtnBg.fillRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
        startBtnBg.lineStyle(3, 0x000000, 1);
        startBtnBg.strokeRoundedRect(startBtnX - btnW / 2, startBtnY - btnH / 2, btnW, btnH, 16);
        startText.setScale(1);
      });

      startHitbox.on("pointerdown", () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.start("BalloonScene");
        });
      });

      // ─── QUIT BUTTON ─────────────────────────────────────────
      const quitBtnBg = this.add.graphics();
      const quitBtnY = H * 0.68;

      quitBtnBg.fillStyle(0xe74c3c, 1);
      quitBtnBg.fillRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
      quitBtnBg.lineStyle(3, 0x000000, 1);
      quitBtnBg.strokeRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);

      const quitShadow = this.add.graphics();
      quitShadow.fillStyle(0x000000, 0.3);
      quitShadow.fillRoundedRect(startBtnX - btnW / 2 + 4, quitBtnY - btnH / 2 + 4, btnW, btnH, 16);
      quitShadow.setDepth(0);
      quitBtnBg.setDepth(1);

      const quitText = this.add
        .text(startBtnX, quitBtnY, "QUIT", {
          fontSize: "28px",
          fontFamily: "Arial Black, sans-serif",
          color: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(2);

      const quitHitbox = this.add
        .zone(startBtnX, quitBtnY, btnW, btnH)
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      quitHitbox.on("pointerover", () => {
        quitBtnBg.clear();
        quitBtnBg.fillStyle(0xc0392b, 1);
        quitBtnBg.fillRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
        quitBtnBg.lineStyle(3, 0x000000, 1);
        quitBtnBg.strokeRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
        quitText.setScale(1.08);
      });

      quitHitbox.on("pointerout", () => {
        quitBtnBg.clear();
        quitBtnBg.fillStyle(0xe74c3c, 1);
        quitBtnBg.fillRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
        quitBtnBg.lineStyle(3, 0x000000, 1);
        quitBtnBg.strokeRoundedRect(startBtnX - btnW / 2, quitBtnY - btnH / 2, btnW, btnH, 16);
        quitText.setScale(1);
      });

      quitHitbox.on("pointerdown", () => {
        if (typeof window !== "undefined") {
          const cId = window.__GAME_COURSE_ID__;
          const lId = window.__GAME_LESSON_ID__;
          window.location.href = cId && lId ? `/courses/${cId}/${lId}/play` : "/dashboard";
        }
      });

      // ─── SUBTITLE ────────────────────────────────────────────
      this.add
        .text(W / 2, H * 0.82, "Aim · Shoot · Learn", {
          fontSize: "16px",
          fontFamily: "Arial, sans-serif",
          color: "#FFD700",
          fontStyle: "italic",
        })
        .setOrigin(0.5)
        .setAlpha(0.6);

      // Fade in
      this.cameras.main.fadeIn(500, 0, 0, 0);
    }
  }
  return MenuScene;
}

export function createBalloonScene(Phaser) {
  class BalloonScene extends Phaser.Scene {
    constructor() {
      super({ key: "BalloonScene" });

      // Game state
      this.score = 0;
      this.arrows = 12;
      this.timeLeft = 60;
      this.currentQuestion = null;
      this.balloons = [];
      this.canShoot = true;

      // Bow & Arrow state
      this.isDrawing = false; // is the user currently holding to aim?

      // Topic-based question banks
      // Topic-based question banks
      this.questionBanks = {
        "variables": [
          { question: "Which keyword is used to declare a variable in Python?", options: ["var", "let", "No keyword needed", "dim"], correct: "No keyword needed" },
          { question: "Which is a valid variable name?", options: ["1st_name", "first-name", "_first_name", "first name"], correct: "_first_name" },
          { question: "x = 5; y = '5'; x == y?", options: ["True", "False", "Error", "None"], correct: "False" }
        ],
        "control-flow": [
          { question: "Which keyword is used for 'else if' in Python?", options: ["elseif", "elif", "else if", "if else"], correct: "elif" },
          { question: "if True: print('A') else: print('B')", options: ["A", "B", "Error", "Nothing"], correct: "A" },
          { question: "Which statement skips an iteration in a loop?", options: ["break", "skip", "continue", "pass"], correct: "continue" }
        ],
        "loops": [
          { question: "What does 'break' do in a loop?", options: ["Stops loop", "Skips iteration", "Pauses", "Nothing"], correct: "Stops loop" },
          { question: "Which loop runs while a condition is true?", options: ["for", "do-while", "while", "repeat"], correct: "while" },
          { question: "What function generates a sequence of numbers?", options: ["range()", "seq()", "numbers()", "list()"], correct: "range()" }
        ],
        "functions-and-modules": [
          { question: "Which keyword defines a function?", options: ["func", "def", "function", "lambda"], correct: "def" },
          { question: "How do you include an external module?", options: ["include", "require", "import", "using"], correct: "import" },
          { question: "What statement returns a value from a function?", options: ["send", "return", "output", "yield"], correct: "return" }
        ],
        "list-and-dictionaries": [
          { question: "Which symbol creates a list?", options: ["{}", "[]", "()", "<>"], correct: "[]" },
          { question: "Which symbol creates a dictionary?", options: ["{}", "[]", "()", "<>"], correct: "{}" },
          { question: "Which method adds an item to a list?", options: ["add()", "insert()", "append()", "push()"], correct: "append()" }
        ]
      };

      // Select questions based on topic
      let topic = (typeof window !== "undefined" && window.__GAME_TOPIC__) || "variables";
      topic = topic.toLowerCase().trim().replace(/\s+/g, '-');
      this.questions = this.questionBanks[topic] || this.questionBanks["variables"];

      // Shuffle and create a queue so questions don't repeat
      this.remainingQuestions = [...this.questions].sort(() => Math.random() - 0.5);
      this.questionLevel = 0;
    }

    // ─── PRELOAD ───────────────────────────────────────────────
    preload() {
      this.load.image("bg", "/assets/Balloon-shooting/WoodenBg.png");
      this.load.image("bow", "/assets/Balloon-shooting/bow.png");
      this.load.image("arrow", "/assets/Balloon-shooting/arrow.png");
      this.load.image("quiver", "/assets/Balloon-shooting/quiver.png");
      this.load.image(
        "balloon_red",
        "/assets/Balloon-shooting/balloon_red.svg",
      );
      this.load.image(
        "balloon_white",
        "/assets/Balloon-shooting/balloon_white.svg",
      );
      this.load.image(
        "balloon_blue",
        "/assets/Balloon-shooting/balloon_blue.svg",
      );
      this.load.image(
        "balloon_yellow",
        "/assets/Balloon-shooting/balloon_yellow.svg",
      );

      this.load.on("loaderror", (file) => {
        console.error("Failed to load:", file.src);
      });
    }

    // ─── CREATE ────────────────────────────────────────────────
    create() {
      const W = this.scale.width;
      const H = this.scale.height;

      this.createBackground(W, H);
      this.createHUD(W, H);
      this.createBow(W, H);
      this.createQuiver(W, H);
      this.createCrosshair();
      this.loadNewQuestion();
      this.startTimer();

      // ─── INPUT: Hold → aim, release → shoot ───────────────
      this.input.on("pointermove", (pointer) => {
        this.crosshair.setPosition(pointer.x, pointer.y);

        if (this.isDrawing) {
          this.aimBow(pointer);
        }
      });

      this.input.on("pointerdown", (pointer) => {
        if (!this.canShoot || this.arrows <= 0) return;
        this.startAim(pointer);
      });

      this.input.on("pointerup", (pointer) => {
        if (this.isDrawing) {
          this.releaseArrow(pointer);
        }
      });
    }

    // ─── BACKGROUND ────────────────────────────────────────────
    createBackground(W, H) {
      const bg = this.add.image(W / 2, H / 2, "bg");
      bg.setDisplaySize(W, H);
    }

    // ─── HUD ───────────────────────────────────────────────────
    createHUD(W, H) {
      const style = {
        fontSize: "18px",
        fontFamily: "Arial Black, sans-serif",
        color: "#FFD700",
        stroke: "#000000",
        strokeThickness: 4,
      };

      const hudBg = this.add.graphics();
      hudBg.fillStyle(0x000000, 0.5);
      hudBg.fillRect(0, 0, W, 70);
      hudBg.setDepth(50);

      this.scoreText = this.add.text(16, 10, "SCORE: 0", style).setDepth(51);

      this.levelText = this.add
        .text(16, 36, "LEVEL: 1", {
          ...style,
          fontSize: "14px",
          color: "#ffffff",
        })
        .setDepth(51);

      this.questionText = this.add
        .text(W / 2, 12, "", {
          ...style,
          fontSize: "16px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: W * 0.5 },
        })
        .setOrigin(0.5, 0)
        .setDepth(51);

      this.arrowsText = this.add
        .text(W - 16, 10, "", { ...style, fontSize: "0px" })
        .setOrigin(1, 0)
        .setDepth(51)
        .setVisible(false);

      this.timerText = this.add
        .text(W - 16, 36, "TIME: 01:00", {
          ...style,
          fontSize: "14px",
        })
        .setOrigin(1, 0)
        .setDepth(51);
    }

    // ─── BOW (using real asset, horizontal) ─────────────────────
    createBow(W, H) {
      // Bow pivot position at bottom center
      this.bowX = W / 2;
      this.bowY = H - 70;

      // Container that holds both bow + arrow — rotates as a unit around bowX, bowY
      this.bowContainer = this.add.container(this.bowX, this.bowY);
      this.bowContainer.setDepth(10);

      // Bow image — horizontal as-is, centered in container
      this.bowImage = this.add.image(0, 0, "bow");
      this.bowImage.setScale(0.22);
      this.bowImage.setOrigin(0.5, 0.5);

      // Arrow resting ON the bowstring
      // The bow's string is near its bottom edge. In local space, y=0 is bow center.
      // Place arrow just above center so it visually sits on the string.
      // Origin 0.5,1.0 = anchor at bottom of arrow image, so the feather end is at the Y pos
      // and the tip extends upward.
      this.arrowOnBow = this.add.image(0, -5, "arrow");
      this.arrowOnBow.setScale(0.14);
      this.arrowOnBow.setOrigin(0.5, 1.0); // anchor at feather (bottom), tip extends up

      // Add both to the container — they rotate as a unit
      this.bowContainer.add([this.bowImage, this.arrowOnBow]);
      this.bowContainer.setRotation(0);
    }

    // ─── QUIVER (bottom-right with arrow count) ─────────────────
    createQuiver(W, H) {
      // Quiver image positioned in the bottom-right corner
      this.quiverImage = this.add.image(W - 50, H - 80, "quiver");
      this.quiverImage.setScale(0.18);
      this.quiverImage.setDepth(12);

      // Arrow count text on the quiver
      this.quiverText = this.add
        .text(W - 50, H - 30, `${this.arrows}`, {
          fontSize: "22px",
          fontFamily: "Arial Black, sans-serif",
          color: "#FFD700",
          stroke: "#000000",
          strokeThickness: 5,
        })
        .setOrigin(0.5, 0.5)
        .setDepth(13);
    }

    // ─── AIM MECHANICS ─────────────────────────────────────────
    startAim(pointer) {
      this.isDrawing = true;

      // Show the arrow on the bow
      this.arrowOnBow.setVisible(true);
      this.arrowOnBow.setAlpha(1);

      // Aim toward pointer immediately
      this.aimBow(pointer);
    }

    aimBow(pointer) {
      if (!this.isDrawing) return;

      // Angle from bow center to pointer
      const aimAngle = Phaser.Math.Angle.Between(
        this.bowX,
        this.bowY,
        pointer.x,
        pointer.y,
      );

      // The arrow in the container points "up" (local -Y),
      // which means container rotation 0 = arrow pointing up = angle -PI/2 in world.
      // To aim at aimAngle, we rotate: aimAngle - (-PI/2) = aimAngle + PI/2
      const containerRotation = aimAngle + Math.PI / 2;

      // Clamp so bow doesn't flip upside down (aim in upper arc ~±70°)
      const clamped = Phaser.Math.Clamp(containerRotation, -1.2, 1.2);
      this.bowContainer.setRotation(clamped);

      // Store for release
      this.currentAimAngle = aimAngle;
    }

    releaseArrow(pointer) {
      if (!this.isDrawing) return;
      this.isDrawing = false;

      const aimAngle = this.currentAimAngle;

      // Decrement arrow count
      this.canShoot = false;
      this.arrows--;
      this.arrowsText.setText(`ARROWS: ${this.arrows}`);
      this.quiverText.setText(`${this.arrows}`);

      // Hide the nocked arrow from the container
      this.arrowOnBow.setVisible(false);

      // Reset bow rotation back to neutral (arrow up)
      this.tweens.add({
        targets: this.bowContainer,
        rotation: 0,
        duration: 200,
        ease: "Power2",
      });

      // Create a flying arrow projectile (world space, not in the container)
      const arrowProjectile = this.add.image(this.bowX, this.bowY, "arrow");
      arrowProjectile.setScale(0.14);
      arrowProjectile.setDepth(20);
      arrowProjectile.setRotation(aimAngle - Math.PI / 2); // rotate to face aim direction

      // Target position
      const targetX = pointer.x;
      const targetY = pointer.y;
      const flyDist = Phaser.Math.Distance.Between(
        this.bowX,
        this.bowY,
        targetX,
        targetY,
      );
      const speed = 900; // pixels per second
      const flyDuration = (flyDist / speed) * 1000;

      // Animate the arrow flying
      this.tweens.add({
        targets: arrowProjectile,
        x: targetX,
        y: targetY,
        duration: Math.max(flyDuration, 120),
        ease: "Power1",
        onComplete: () => {
          this.checkArrowHit(targetX, targetY, arrowProjectile);
        },
      });

      // Subtle bow recoil — scale pulse on the container
      this.tweens.add({
        targets: this.bowContainer,
        scaleX: 1.06,
        scaleY: 0.94,
        duration: 80,
        yoyo: true,
        ease: "Power2",
      });
    }

    // ─── ARROW HIT CHECK ──────────────────────────────────────
    checkArrowHit(hitX, hitY, arrowProjectile) {
      let hitBalloon = null;
      for (const balloon of this.balloons) {
        const dist = Phaser.Math.Distance.Between(
          hitX,
          hitY,
          balloon.container.x,
          balloon.container.y,
        );
        if (dist < balloon.radius + 10) {
          hitBalloon = balloon;
          break;
        }
      }

      if (hitBalloon) {
        // Arrow sticks for a moment then fades
        this.tweens.add({
          targets: arrowProjectile,
          alpha: 0,
          duration: 300,
          delay: 100,
          onComplete: () => arrowProjectile.destroy(),
        });
        this.popBalloon(hitBalloon);
      } else {
        // Miss — arrow fades out
        this.tweens.add({
          targets: arrowProjectile,
          alpha: 0,
          y: hitY + 30,
          duration: 400,
          ease: "Power2",
          onComplete: () => {
            arrowProjectile.destroy();
            this.canShoot = true;
            // Show the resting arrow again
            this.arrowOnBow.setVisible(true);
          },
        });
      }

      if (this.arrows <= 0) {
        this.time.delayedCall(500, () => this.endGame());
      }
    }

    // ─── CROSSHAIR ─────────────────────────────────────────────
    createCrosshair() {
      const g = this.add.graphics();

      // Outer circle
      g.lineStyle(2, 0xffffff, 0.8);
      g.strokeCircle(0, 0, 16);

      // Inner dot
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(0, 0, 2);

      // Cross lines
      g.lineStyle(1.5, 0xffffff, 0.8);
      g.lineBetween(-24, 0, -18, 0);
      g.lineBetween(18, 0, 24, 0);
      g.lineBetween(0, -24, 0, -18);
      g.lineBetween(0, 18, 0, 24);

      this.crosshair = g;
      this.crosshair.setDepth(100);
    }

    // ─── QUESTIONS ─────────────────────────────────────────────
    loadNewQuestion() {
      this.balloons.forEach((b) => b.destroy());
      this.balloons = [];

      // If no questions remain, end the game with a victory
      if (this.remainingQuestions.length === 0) {
        this.endGame(true);
        return;
      }

      const q = this.remainingQuestions.pop();
      this.questionLevel++;
      this.currentQuestion = q;
      this.levelText.setText(`LEVEL: ${this.questionLevel}`);
      this.questionText.setText("QUESTION:\n" + q.question);
      this.spawnBalloons(q.options, q.correct);
    }

    // ─── BALLOONS ──────────────────────────────────────────────
    spawnBalloons(options, correct) {
      const W = this.scale.width;
      const H = this.scale.height;

      const colors = [
        "balloon_red",
        "balloon_white",
        "balloon_blue",
        "balloon_yellow",
      ];
      Phaser.Utils.Array.Shuffle(colors);

      const positions = this.getBalloonPositions(options.length, W, H);

      options.forEach((option, i) => {
        const { x, y } = positions[i];
        const colorKey = colors[i % colors.length];
        const isCorrect = option === correct;

        const startY = H + 300;
        const balloon = this.createBalloon(
          x,
          startY,
          colorKey,
          option,
          isCorrect,
        );
        this.balloons.push(balloon);

        this.tweens.add({
          targets: balloon.container,
          y: y,
          duration: 800 + Phaser.Math.Between(0, 300),
          ease: "Back.easeOut",
          delay: i * 150,
          onComplete: () => {
            this.tweens.add({
              targets: balloon.container,
              y: y - Phaser.Math.Between(15, 30),
              duration: Phaser.Math.Between(1500, 2500),
              ease: "Sine.easeInOut",
              yoyo: true,
              repeat: -1,
            });
          },
        });
      });
    }

    getBalloonPositions(count, W, H) {
      const topPad = 100;
      const bottomPad = 200;
      const sidePad = 80;
      const usableW = W - sidePad * 2;
      const usableH = H - topPad - bottomPad;

      const positions = [];
      for (let i = 0; i < count; i++) {
        positions.push({
          x: sidePad + (usableW / (count - 1)) * i,
          y: topPad + usableH * 0.3 + Phaser.Math.Between(-40, 40),
        });
      }
      return positions;
    }

    createBalloon(x, y, colorKey, label, isCorrect) {
      const radius = 120;

      const container = this.add.container(x, y);

      const body = this.add.image(0, 0, colorKey);
      body.setOrigin(0.5, 0.2571);
      body.setScale(1.25);

      const text = this.add
        .text(0, -10, label.toUpperCase(), {
          fontSize: "24px",
          fontFamily: "Arial Black, sans-serif",
          color: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 5,
          align: "center",
          wordWrap: { width: radius * 1.6 },
        })
        .setOrigin(0.5, 0.5);

      container.add([body, text]);
      body.setInteractive();

      return {
        container,
        body,
        text,
        isCorrect,
        label,
        x,
        y,
        radius,
        destroy: () => container.destroy(),
      };
    }

    // ─── POP BALLOON ──────────────────────────────────────────
    popBalloon(balloon) {
      const isCorrect = balloon.isCorrect;
      const W = this.scale.width;

      this.tweens.add({
        targets: balloon.container,
        scaleX: 1.4,
        scaleY: 1.4,
        alpha: 0,
        duration: 200,
        ease: "Power2",
        onComplete: () => {
          balloon.destroy();
          this.balloons = this.balloons.filter((b) => b !== balloon);
        },
      });

      if (isCorrect) {
        this.score += 100;
        this.arrows = Math.min(this.arrows + 1, 20);
        this.scoreText.setText(`SCORE: ${this.score}`);
        this.arrowsText.setText(`ARROWS: ${this.arrows}`);
        this.quiverText.setText(`${this.arrows}`);
        this.showFeedback("CORRECT! +100", "#2ECC71", W / 2, 120);

        this.time.delayedCall(800, () => {
          this.canShoot = true;
          this.arrowOnBow.setVisible(true);
          this.loadNewQuestion();
        });
      } else {
        this.score = Math.max(0, this.score - 50);
        this.scoreText.setText(`SCORE: ${this.score}`);
        this.showFeedback("WRONG! -50", "#E74C3C", W / 2, 120);
        this.cameras.main.flash(300, 180, 0, 0, false);

        this.time.delayedCall(400, () => {
          this.canShoot = true;
          this.arrowOnBow.setVisible(true);
        });
      }
    }

    showFeedback(message, color, x, y) {
      const text = this.add
        .text(x, y, message, {
          fontSize: "28px",
          fontFamily: "Arial Black",
          color: color,
          stroke: "#000000",
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(60);

      this.tweens.add({
        targets: text,
        y: y - 60,
        alpha: 0,
        duration: 900,
        ease: "Power2",
        onComplete: () => text.destroy(),
      });
    }

    // ─── TIMER ─────────────────────────────────────────────────
    startTimer() {
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.timeLeft--;
          const mins = Math.floor(this.timeLeft / 60)
            .toString()
            .padStart(2, "0");
          const secs = (this.timeLeft % 60).toString().padStart(2, "0");
          this.timerText.setText(`TIME: ${mins}:${secs}`);

          if (this.timeLeft <= 0) this.endGame();
        },
        repeat: -1,
      });
    }

    // ─── GAME OVER ─────────────────────────────────────────────
    endGame(allQuestionsComplete = false) {
      if (auth.currentUser) {
        updateGameStats(auth.currentUser.uid, 'balloon', this.score, Math.max(0, this.score / 100), this.questionLevel);
      }

      this.timerEvent?.remove();
      this.canShoot = false;
      this.isDrawing = false;

      const W = this.scale.width;
      const H = this.scale.height;

      const overlay = this.add.graphics();
      overlay.fillStyle(0x000000, 0.75);
      overlay.fillRect(0, 0, W, H);
      overlay.setDepth(90);

      const titleMsg = allQuestionsComplete ? "ALL QUESTIONS COMPLETE!" : "ROUND COMPLETE!";
      const titleColor = allQuestionsComplete ? "#2ECC71" : "#FFD700";

      this.add
        .text(W / 2, H / 2 - 80, titleMsg, {
          fontSize: "32px",
          fontFamily: "Arial Black",
          color: titleColor,
          stroke: "#000",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(91);

      this.add
        .text(W / 2, H / 2 - 30, `Final Score: ${this.score}`, {
          fontSize: "24px",
          fontFamily: "Arial",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(91);

      if (allQuestionsComplete) {
        this.add
          .text(W / 2, H / 2 + 5, `Questions Answered: ${this.questionLevel}`, {
            fontSize: "18px",
            fontFamily: "Arial",
            color: "#FFD700",
          })
          .setOrigin(0.5)
          .setDepth(91);
      }

      const btn = this.add
        .text(W / 2, H / 2 + 70, "[ PLAY AGAIN ]", {
          fontSize: "20px",
          fontFamily: "Arial Black",
          color: "#2ECC71",
          stroke: "#000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setInteractive({ cursor: "pointer" })
        .setDepth(91);

      btn.on("pointerover", () => btn.setColor("#27AE60"));
      btn.on("pointerout", () => btn.setColor("#2ECC71"));
      btn.on("pointerdown", () => {
        this.score = 0;
        this.arrows = 12;
        this.timeLeft = 60;
        this.canShoot = true;
        this.scene.start("MenuScene");
      });

      const quitBtn = this.add
        .text(W / 2, H / 2 + 120, "[ QUIT ]", {
          fontSize: "20px",
          fontFamily: "Arial Black",
          color: "#E74C3C",
          stroke: "#000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setInteractive({ cursor: "pointer" })
        .setDepth(91);

      quitBtn.on("pointerover", () => quitBtn.setColor("#C0392B"));
      quitBtn.on("pointerout", () => quitBtn.setColor("#E74C3C"));
      quitBtn.on("pointerdown", () => {
        if (typeof window !== "undefined") {
          const cId = window.__GAME_COURSE_ID__;
          const lId = window.__GAME_LESSON_ID__;
          window.location.href = cId && lId ? `/courses/${cId}/${lId}/play` : "/dashboard";
        }
      });
    }

    // ─── UPDATE LOOP ───────────────────────────────────────────
    update() {
      this.crosshair.setDepth(100);
    }
  }
  return BalloonScene;
}
