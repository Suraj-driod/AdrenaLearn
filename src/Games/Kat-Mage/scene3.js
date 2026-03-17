import { getQuestionsByTopic } from "../gameQuestions.js";

export default function functionForThirdScene(Phaser, BaseLevel) {
  return class ThirdScene extends BaseLevel {
    constructor() {
      super('ThirdScene');
    }

    preload() {
      this.load.image('scene3', '/assets/kat-Mage/scene3.png');
      this.load.spritesheet('lightning-on-white-cat', '/assets/kat-Mage/lightning.png', { frameWidth: 240, frameHeight: 102 });
      this.load.spritesheet('white-cat-jumpattack', '/assets/kat-Mage/Meow-Knight_Attack_4.png', { frameWidth: 16, frameHeight: 24, endFrame: 64 });
    }

    create() {
      this.triggerSpot = false;
      this.hasTriggeredQuestion = false;
      this.questionAnswered = false;

      const scene3 = this.add.image(450, 450, 'scene3');
      scene3.setDisplaySize(900, 900);

      this.anims.create({
        key: 'lightning',
        frames: this.anims.generateFrameNumbers('lightning-on-white-cat', { start: 0, end: 6 }),
        frameRate: 10
      });

      this.anims.create({
        key: 'jumpattack',
        frames: this.anims.generateFrameNumbers('white-cat-jumpattack', { start: 0, end: 7 }),
        frameRate: 12
      });

      this.add.text(450, 100, 'LEVEL 3: THE STORM', {
        fontSize: '48px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      this.setupPlayer(150, 700);
      this.canMove = true;

      this.listenerController = new AbortController();
      const { signal } = this.listenerController;

      this.handleCorrect = () => {
        if (this.questionAnswered) return;
        this.questionAnswered = true;
        this.scene.resume();

        // Clean up the pause screen UI
        if (this.pauseScreenGroup) {
          this.pauseScreenGroup.destroy(true);
        }

        // Lightning already played fully — destroy it and play attack
        if (this.lightningSprite) this.lightningSprite.destroy();
        this.cat.play('jumpattack');

        this.cat.once('animationcomplete-jumpattack', () => {
          this.cat.play('idle');
          this.canMove = true;
        });
      };

      this.handleWrong = () => {
        if (this.questionAnswered) return;
        this.questionAnswered = true;
        this.scene.resume();

        // Clean up the pause screen UI
        if (this.pauseScreenGroup) {
          this.pauseScreenGroup.destroy(true);
        }

        // Lightning already played fully — destroy it and show death
        if (this.lightningSprite) this.lightningSprite.destroy();
        this.cat.play('die');
        
        this.add.rectangle(450, 450, 900, 900, 0x000000, 0.85);
            
        // Game Over text
        this.add.text(450, 400, 'EXPECTED A CAT WITH 9 LIVES?', { 
          fontSize: '48px', 
          fontFamily: 'Arial, sans-serif',
          color: '#ef4444', 
          fontStyle: 'bold'
        }).setOrigin(0.5);

        // Retry Button
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
      };

      window.addEventListener('correctAnswer', this.handleCorrect, { signal });
      window.addEventListener('wrongAnswer', this.handleWrong, { signal });

      this.events.on("shutdown", () => { this.listenerController.abort(); });
    }

    update() {
      if (this.canMove) this.playerMovement();

      if (this.cat.x >= 450 && !this.triggerSpot) {
        this.triggerSpot = true;
        this.startLightningStrike();
      }

      if (this.cat.x >= 850 && !this.isTransitioning) {
        this.isTransitioning = true;
        this.levelCompleteSequence('FourthScene');
      }
    }

    startLightningStrike() {
      this.canMove = false;
      this.cat.play('idle', true);
      this.keys.left.reset();
      this.keys.right.reset();

      // Position lightning above the player so it visually strikes down onto the cat
      this.lightningSprite = this.add.sprite(this.cat.x, this.cat.y - 200, 'lightning-on-white-cat');
      this.lightningSprite.setScale(2);
      this.lightningSprite.play('lightning');

      // Let the FULL lightning animation play before showing the pause screen
      this.lightningSprite.once('animationcomplete-lightning', () => {
        if (this.hasTriggeredQuestion) return;
        this.hasTriggeredQuestion = true;

        // Breathing delay after lightning finishes — let it sink in
        this.time.delayedCall(800, () => {
          // Draw the Pause Screen UI Group
          this.pauseScreenGroup = this.add.group();

          // Smooth dark overlay
          const overlay = this.add.rectangle(450, 450, 900, 900, 0x000000, 0.85).setDepth(100);
          
          // Narrative Text 
          const narrativeText = this.add.text(450, 320, 'Who expected this lightning.\nLife is full of surprises isn\'t it.', { 
            fontSize: '28px', 
            fontFamily: 'Arial, sans-serif',
            color: '#e2e8f0', 
            align: 'center',
            lineSpacing: 10
          }).setOrigin(0.5).setDepth(100);

          // Instruction Text
          const instructionText = this.add.text(450, 430, 'Answer the question to survive the strike.', { 
            fontSize: '22px', 
            fontFamily: 'Arial, sans-serif',
            color: '#fbbf24', 
            align: 'center',
            fontStyle: 'bold',
            letterSpacing: 1
          }).setOrigin(0.5).setDepth(100);

          // Terminal Question Box 
          const qBoxBg = this.add.rectangle(450, 560, 700, 100, 0x1e293b) 
            .setStrokeStyle(2, 0x475569) 
            .setDepth(100);

          const qList = getQuestionsByTopic(window.currentGameTopic);
          const qData = qList[2]; // Third question

          const questionText = this.add.text(450, 560, 'Question: ' + qData, { 
            fontSize: '24px', 
            fontFamily: 'monospace', 
            color: '#f8fafc', 
            align: 'center',
            wordWrap: { width: 660 }
          }).setOrigin(0.5).setDepth(100);

          window.currentAmongQuestion = qData;

          this.pauseScreenGroup.addMultiple([overlay, narrativeText, instructionText, qBoxBg, questionText]);

          // Reading delay, then pause scene and open editor
          this.time.delayedCall(2500, () => {
            this.questionAnswered = false;
            this.scene.pause();
            window.dispatchEvent(new Event('openEditor'));
          });
        });
      });
    }
  }
}