import { getQuestionsByTopic } from "../gameQuestions.js";

export default function functionForSecondClass(Phaser, BaseLevel) {
  return class SecondScene extends BaseLevel {
    constructor() {
      super('SecondScene');
    }

    preload() {
      this.load.image('wisp', '/assets/kat-Mage/wisp.png');
      this.load.spritesheet('white-cat-attack', '/assets/kat-Mage/Meow-Knight_Attack_1.png', { frameWidth: 16, frameHeight: 24, endFrame: 25 });
    }

    create() {
      this.triggerSpot = false;
      this.hasTriggeredQuestion = false;
      this.questionAnswered = false;

      const scene2 = this.add.image(450, 450, 'scene2');
      scene2.setDisplaySize(900, 900);

      this.anims.create({
        key: 'attack',
        frames: this.anims.generateFrameNumbers('white-cat-attack', { start: 0, end: 9 }),
        frameRate: 12
      });

      this.add.text(450, 100, 'LEVEL 2', { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);

      this.setupPlayer(100, 670);
      this.canMove = true;

      this.listenerController = new AbortController();
      const { signal } = this.listenerController;

      this.handleCorrect = () => {
        if (this.questionAnswered) return;
        this.questionAnswered = true;
        this.scene.resume();

        // Clean up the UI overlay if it exists
        if (this.pauseScreenGroup) {
          this.pauseScreenGroup.destroy(true);
        }

        if (this.wispTween) this.wispTween.stop();
        if (this.wispBob) this.wispBob.stop();

        this.cat.play('attack');
        this.tweens.add({
          targets: this.cat,
          x: this.wisp.x,
          duration: 150,
          yoyo: true,
          onYoyo: () => { if (this.wisp) this.wisp.destroy(); },
          onComplete: () => {
            this.cat.play('idle');
            this.time.delayedCall(500, () => { this.canMove = true; });
          }
        });
      };

      this.handleWrong = () => {
        if (this.questionAnswered) return;
        this.questionAnswered = true;
        this.scene.resume();

        // Clean up the UI overlay if it exists
        if (this.pauseScreenGroup) {
          this.pauseScreenGroup.destroy(true);
        }

        if (this.wispTween) this.wispTween.stop();
        if (this.wispBob) this.wispBob.stop();

        this.tweens.add({
          targets: this.wisp,
          x: this.cat.x,
          duration: 150,
          onComplete: () => {
            if (this.wisp) this.wisp.destroy();

            this.cat.setTexture('white-cat-die');
            this.cat.play('die');

            this.add.rectangle(450, 450, 900, 900, 0x000000, 0.85);
            this.add.text(450, 400, 'NEED SOME WATER?', { 
              fontSize: '56px', 
              fontFamily: 'Arial, sans-serif',
              color: '#ef4444',
              fontStyle: 'bold'
            }).setOrigin(0.5);

            const retryBg = this.add.rectangle(450, 520, 240, 60, 0x334155).setStrokeStyle(2, 0x64748b);
            const retryText = this.add.text(450, 520, 'RETRY', { 
              fontSize: '24px', 
              fontFamily: 'Arial, sans-serif',
              color: '#ffffff',
              fontStyle: 'bold',
              letterSpacing: 2
            }).setOrigin(0.5);

            const retryHitbox = this.add.zone(450, 520, 240, 60).setInteractive({ useHandCursor: true });
            
            retryHitbox.on('pointerover', () => { retryBg.setFillStyle(0x475569); });
            retryHitbox.on('pointerout', () => { retryBg.setFillStyle(0x334155); });
            retryHitbox.on('pointerdown', () => this.scene.restart());
          }
        });
      };

      window.addEventListener('correctAnswer', this.handleCorrect, { signal });
      window.addEventListener('wrongAnswer', this.handleWrong, { signal });

      this.events.on("shutdown", () => { this.listenerController.abort(); });
      this.events.on("destroy", () => { this.listenerController.abort(); });
    }

    update() {
      if (this.canMove) this.playerMovement();

      if (this.cat.x >= 250 && !this.triggerSpot) {
        this.triggerSpot = true;
        this.startAttack();
      }

      if (this.wisp && this.wisp.active && !this.hasTriggeredQuestion) {
        const distanceX = Math.abs(this.wisp.x - this.cat.x);
        
        // When the wisp gets close enough, trigger the cinematic pause
        if (distanceX < 120) {
          this.hasTriggeredQuestion = true;
          this.questionAnswered = false;
          this.canMove = false;
          
          // Stop physics/tweens but don't pause the scene yet
          this.cat.play('idle', true);
          this.keys.left.reset();
          this.keys.right.reset();
          if (this.wispTween) this.wispTween.pause();
          if (this.wispBob) this.wispBob.pause();

          // 1. Draw the Pause Screen UI Group
          this.pauseScreenGroup = this.add.group();

          // Smooth dark overlay
          const overlay = this.add.rectangle(450, 450, 900, 900, 0x000000, 0.85).setDepth(100);
          
          let finalNarrative = 'Wisp Summoning! A spirit appears.';
          let finalInstruction = 'Help the cat not get engulfed by flames in its life.';
          let finalQuestion = 'missing';

          if (window.__CUSTOM_MISSION_ACTIVE__ && window.__CUSTOM_MISSION_CHALLENGES__) {
              const challenge = window.__CUSTOM_MISSION_CHALLENGES__[1];
              if (challenge) {
                  finalNarrative = challenge.narrative || finalNarrative;
                  finalInstruction = challenge.instruction || finalInstruction;
                  finalQuestion = challenge.question || finalQuestion;
              }
          } else {
              const qList = getQuestionsByTopic(window.currentGameTopic);
              finalQuestion = qList[1]; // Second question
          }

          // Narrative Text
          const narrativeText = this.add.text(450, 320, finalNarrative, { 
            fontSize: '28px', 
            fontFamily: 'Arial, sans-serif',
            color: '#e2e8f0', 
            align: 'center',
            fontStyle: 'italic',
            wordWrap: { width: 800 }
          }).setOrigin(0.5).setDepth(100);

          // Instruction Text
          const instructionText = this.add.text(450, 410, finalInstruction, { 
            fontSize: '22px', 
            fontFamily: 'Arial, sans-serif',
            color: '#fbbf24', 
            align: 'center',
            fontStyle: 'bold',
            letterSpacing: 1,
            wordWrap: { width: 800 }
          }).setOrigin(0.5).setDepth(100);

          // Terminal Question Box
          const qBoxBg = this.add.rectangle(450, 550, 750, 100, 0x1e293b) 
            .setStrokeStyle(2, 0x475569) 
            .setDepth(100);

          const questionText = this.add.text(450, 550, '> Question: ' + finalQuestion, { 
            fontSize: '24px', 
            fontFamily: 'monospace', 
            color: '#f8fafc', 
            align: 'center',
            wordWrap: { width: 700 }
          }).setOrigin(0.5).setDepth(100);

          window.currentAmongQuestion = finalQuestion;

          this.pauseScreenGroup.addMultiple([overlay, narrativeText, instructionText, qBoxBg, questionText]);

          // 2. Wait 2.5 seconds, then pause scene and open editor
          this.time.delayedCall(2500, () => {
            this.scene.pause();
            window.dispatchEvent(new Event('openEditor'));
          });
        }
      }

      if (this.cat.x >= 850 && !this.isTransitioning) {
        this.isTransitioning = true;
        this.levelCompleteSequence('ThirdScene');
      }
    }

    startAttack() {
      // Freeze player while wisp is summoned
      this.canMove = false;
      this.cat.play('idle', true);
      this.keys.left.reset();
      this.keys.right.reset();

      // Spawn wisp from the central fire in the background
      this.wisp = this.add.image(450, 630, 'wisp');
      this.wisp.setDisplaySize(170, 310);
      this.wisp.setAlpha(0);

      // Fade in from the fire
      this.tweens.add({
        targets: this.wisp,
        alpha: 1,
        duration: 500,
        onComplete: () => {
          // Move toward the player — shorter distance from center
          this.wispTween = this.tweens.add({ targets: this.wisp, x: -100, duration: 4000 });
          this.wispBob = this.tweens.add({ targets: this.wisp, y: '-=30', duration: 800, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
        }
      });
    }
  };
}