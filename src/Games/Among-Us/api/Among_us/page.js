'use client'

import { useEffect, useRef, useState } from 'react';
import { auth } from '../../../../backend/firebase';
import { updateGameStats } from '../../../../backend/gameStatsHelper';
import { getQuestionsByTopic, getEmergencyMCQ, getTriviaByTopic } from "../../../../Games/gameQuestions.js";

export default function Game2({ topic }) {

    const gameTwo = useRef(null);
    const gameInstanceRef = useRef(null);

    const currentTopic = topic || 'variables';
    window.currentGameTopic = currentTopic;

    // Get array of questions for this topic
    const dynamicQuestions = getQuestionsByTopic(currentTopic);

    // Map the first three questions to candle, towel, and alien objects
    const gameQuestions = {
        candle: dynamicQuestions[0] || "Question missing",
        towel: dynamicQuestions[1] || "Question missing",
        alien: dynamicQuestions[2] || "Question missing",
        pet: dynamicQuestions[4] || "Question missing",
    };

    const emergencyMCQ = getEmergencyMCQ(currentTopic);
    const topicTrivias = getTriviaByTopic(currentTopic);

    useEffect(() => {
        const openEditorHandler = () => {
            if (gameInstanceRef.current?.input?.keyboard) {
                gameInstanceRef.current.input.keyboard.enabled = false;
            }
        };
        window.addEventListener('openEditor', openEditorHandler);
        return () => { window.removeEventListener('openEditor', openEditorHandler); };
    }, []);

    useEffect(() => {
        const editorClosedHandler = () => {
            if (gameInstanceRef.current?.input?.keyboard) {
                gameInstanceRef.current.input.keyboard.enabled = true;
            }
        };
        window.addEventListener('editorClosed', editorClosedHandler);
        return () => window.removeEventListener('editorClosed', editorClosedHandler);
    }, []);

    useEffect(() => {
        let gameTwoBegins = null;

        async function init() {

            const Phaser = await import('phaser');

            // ==========================================
            // START SCREEN SCENE
            // ==========================================
            class StartScene extends Phaser.Scene {
                constructor() {
                    super('StartScene');
                }

                preload() {
                    this.load.image('sceneOne', '/assets/among-us/room.png');
                    this.load.image('red_char', '/assets/among-us/red_char.png');
                }

                create() {
                    this.cameras.main.setBackgroundColor('#111118');

                    const bg = this.add.image(450, 450, 'sceneOne')
                        .setDisplaySize(900, 900)
                        .setAlpha(0.15);

                    const title = this.add.text(450, 140, 'SPACE ACADEMIA', {
                        fontSize: '80px',
                        color: '#ff3333',
                        fontFamily: 'Impact, sans-serif',
                        fontStyle: 'bold',
                        letterSpacing: 4,
                        stroke: '#000000',
                        strokeThickness: 10,
                        shadow: { offsetX: 4, offsetY: 4, color: '#000', blur: 8, fill: true }
                    }).setOrigin(0.5);

                    const subtitle = this.add.text(450, 220, 'CODE EDITION', {
                        fontSize: '32px',
                        color: '#ffcc00',
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold',
                        letterSpacing: 6,
                        stroke: '#000000',
                        strokeThickness: 4
                    }).setOrigin(0.5);

                    const charImg = this.add.image(450, 440, 'red_char')
                        .setDisplaySize(200, 300);

                    this.tweens.add({
                        targets: charImg,
                        y: 420,
                        duration: 1500,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    this.add.text(450, 640, 'WASD to move  •  L to interact', {
                        fontSize: '20px',
                        color: '#aaaaaa',
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 2
                    }).setOrigin(0.5);

                    this.add.text(450, 670, 'Find objects → Solve code challenges → Score points!', {
                        fontSize: '16px',
                        color: '#888888',
                        fontFamily: 'Arial, sans-serif',
                        stroke: '#000000',
                        strokeThickness: 2
                    }).setOrigin(0.5);

                    const btnBg = this.add.rectangle(450, 760, 280, 70, 0xcc0000)
                        .setStrokeStyle(4, 0xff4444)
                        .setInteractive({ useHandCursor: true });

                    const btnText = this.add.text(450, 760, '▶  START GAME', {
                        fontSize: '32px',
                        color: '#ffffff',
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold'
                    }).setOrigin(0.5);

                    btnBg.on('pointerover', () => {
                        btnBg.setFillStyle(0xff2222);
                        btnBg.setScale(1.05);
                        btnText.setScale(1.05);
                    });
                    btnBg.on('pointerout', () => {
                        btnBg.setFillStyle(0xcc0000);
                        btnBg.setScale(1);
                        btnText.setScale(1);
                    });
                    btnBg.on('pointerdown', () => {
                        this.cameras.main.fadeOut(500, 0, 0, 0);
                        this.time.delayedCall(500, () => {
                            this.scene.start('AmongSceneFirst');
                        });
                    });

                    this.tweens.add({
                        targets: btnBg,
                        alpha: 0.8,
                        duration: 800,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    this.tweens.add({
                        targets: title,
                        y: 145,
                        duration: 2000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });

                    this.cameras.main.fadeIn(800, 0, 0, 0);
                }
            }

            // ==========================================
            // HELPER: create a styled HTML poster button element
            // ==========================================
            function createPosterElement(label, icon, color) {
                const el = document.createElement('div');
                el.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 52px;
                    height: 36px;
                    background: linear-gradient(160deg, ${color}dd, ${color}88);
                    border: 2px solid ${color};
                    border-radius: 5px 5px 3px 3px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15);
                    cursor: pointer;
                    font-family: 'Arial', sans-serif;
                    color: #fff;
                    text-align: center;
                    padding: 5px 3px 3px;
                    box-sizing: border-box;
                    position: relative;
                    user-select: none;
                    transition: transform 0.1s, box-shadow 0.1s;
                `;

                // Tack / pin at top
                const pin = document.createElement('div');
                pin.style.cssText = `
                    position: absolute;
                    top: -7px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 12px;
                    height: 12px;
                    background: radial-gradient(circle at 35% 35%, #ff6666, #cc0000);
                    border-radius: 50%;
                    border: 1px solid #881111;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                `;
                el.appendChild(pin);

                // Icon / emoji
                const iconEl = document.createElement('div');
                iconEl.textContent = icon;
                iconEl.style.cssText = `
                    font-size: 20px;
                    line-height: 1;
                    margin-bottom: 3px;
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
                `;
                el.appendChild(iconEl);

                // Label text
                const labelEl = document.createElement('div');
                labelEl.textContent = label;
                labelEl.style.cssText = `
                    font-size: 8px;
                    font-weight: bold;
                    letter-spacing: 0.4px;
                    text-transform: uppercase;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                    line-height: 1.2;
                    word-break: break-word;
                    max-width: 44px;
                `;
                el.appendChild(labelEl);

                el.addEventListener('mouseenter', () => {
                    el.style.transform = 'scale(1.12) translateY(-2px)';
                    el.style.boxShadow = `0 8px 20px rgba(0,0,0,0.8), 0 0 12px ${color}99`;
                });
                el.addEventListener('mouseleave', () => {
                    el.style.transform = 'scale(1) translateY(0)';
                    el.style.boxShadow = `0 4px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15)`;
                });
                el.addEventListener('mousedown', () => {
                    el.style.transform = 'scale(0.97)';
                });
                el.addEventListener('mouseup', () => {
                    el.style.transform = 'scale(1.12) translateY(-2px)';
                });

                return el;
            }

            // ==========================================
            // MAIN GAME SCENE
            // ==========================================
            class AmongSceneFirst extends Phaser.Scene {

                constructor() {
                    super('AmongSceneFirst')
                }

                preload() {
                    this.load.image('sceneOne', '/assets/among-us/room.png')
                    this.load.image('question', '/assets/among-us/question.png')
                    this.load.image('alien', '/assets/among-us/alien.png')
                    this.load.image('towel2', '/assets/among-us/towel2.png')
                    this.load.image('button2', '/assets/among-us/button2.png');
                    this.load.image('candle', '/assets/among-us/candle.png')
                    this.load.image('interact', '/assets/among-us/interact.png')
                    this.load.image('towel', '/assets/among-us/towel.png')
                    this.load.image('triviaScreen', '/assets/among-us/triviaScreen.png')
                    this.load.image('paper', '/assets/among-us/paper.png')
                    this.load.image('button', '/assets/among-us/button.png')
                    this.load.image('idle', '/assets/among-us/idle.png');
                    this.load.image('emergency', '/assets/among-us/emergency.png');
                    this.load.image('ejected', '/assets/among-us/ejected.jpg');

                    this.load.spritesheet('pet', '/assets/among-us/pet.png', { frameWidth: 165, frameHeight: 104 })
                    this.load.spritesheet(
                        'walking',
                        '/assets/among-us/walk.png',
                        { frameWidth: 178, frameHeight: 240 }
                    )
                }

                create() {
                    this.cameras.main.fadeIn(500, 0, 0, 0);

                    this.controlsDisabled = false;
                    this.gameOver = false;
                    this.totalTime = 120;
                    this.score = 0;
                    this.activeFloatingTexts = [];
                    this.emergencyTriggered = false;

                    this.objectCompleted = {
                        candle: false,
                        towel: false,
                        alien: false,
                        pet: false,
                    };

                    this.objectQuestions = gameQuestions;
                    this.currentInteractObject = null;
                    this.questionAnswered = false;

                    // Background — completely unchanged
                    const sceneOne = this.add.image(450, 450, 'sceneOne')
                    sceneOne.setDisplaySize(900, 900)

                    // --- Timer Display ---
                    this.timerText = this.add.text(450, 40, '02:00', {
                        fontSize: '42px',
                        color: '#ff4444',
                        fontFamily: 'Impact, sans-serif',
                        fontStyle: 'bold',
                        stroke: '#000000',
                        strokeThickness: 8,
                        shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 18, fill: true }
                    }).setOrigin(0.5).setDepth(500);

                    this.time.addEvent({
                        delay: 1000,
                        repeat: 119,
                        callback: () => {
                            if (this.gameOver) return;
                            this.totalTime--;
                            let mins = Math.floor(this.totalTime / 60);
                            let secs = this.totalTime % 60;
                            this.timerText.setText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

                            if (this.totalTime === 60 && !this.emergencyTriggered) {
                                this.emergencyTriggered = true;
                                if (this.triggerEmergencyMeeting) this.triggerEmergencyMeeting();
                            }

                            if (this.totalTime <= 0) this.triggerGameOver();
                        }
                    });

                    // --- Score Display ---
                    this.scoreText = this.add.text(850, 40, 'Score: 0', {
                        fontSize: '32px',
                        color: '#fbbf24',
                        fontFamily: 'Impact, sans-serif',
                        fontStyle: 'bold',
                        letterSpacing: 1,
                        stroke: '#000000',
                        strokeThickness: 6,
                        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
                    }).setOrigin(1, 0.5).setDepth(500);

                    // --- Static Props ---
                    this.towel = this.add.image(108, 143, 'towel2').setDisplaySize(100, 100).setFlipX(true).setAngle(-25).setDepth(5);
                    this.candle = this.add.image(250, 600, 'candle').setDisplaySize(60, 80).setDepth(5);
                    this.alien = this.add.image(650, 607, 'alien').setDisplaySize(60, 50).setDepth(5);

                    // --- Animations ---
                    this.anims.create({
                        key: 'walk',
                        frames: this.anims.generateFrameNumbers('walking', { start: 0, end: 12 }),
                        frameRate: 12,
                        repeat: -1
                    })

                    this.anims.create({
                        key: 'pet_walk',
                        frames: this.anims.generateFrameNumbers('pet', { start: 0, end: 79 }),
                        frameRate: 24,
                        repeat: -1
                    })

                    this.pet = this.add.sprite(800, 220, 'pet', 0)
                        .setDisplaySize(90, 56)
                        .setDepth(50);
                    this.pet.play('pet_walk');

                    this.player = this.add.sprite(450, 550, 'walking', 0)
                        .setDisplaySize(80, 108)
                        .setDepth(50);
                    this.keys = this.input.keyboard.addKeys('W,A,S,D,L')

                    // --- NPCs ---
                    this.npcs = [];
                    const npcConfigs = [
                        { x: 250, y: 400, tint: 0x3366ff, name: 'Blue', patrolMinX: 150, patrolMaxX: 400, patrolY: 400 },
                        { x: 650, y: 600, tint: 0x33cc33, name: 'Green', patrolMinX: 500, patrolMaxX: 780, patrolY: 600 },
                        { x: 350, y: 300, tint: 0xff66ff, name: 'Pink', patrolMinX: 200, patrolMaxX: 500, patrolY: 300 },
                    ];

                    npcConfigs.forEach((cfg) => {
                        const npc = this.add.sprite(cfg.x, cfg.y, 'walking', 0)
                            .setDisplaySize(70, 95)
                            .setDepth(45)
                            .setTint(cfg.tint);
                        npc.play('walk');
                        npc.npcConfig = cfg;
                        npc.patrolDir = 1;
                        this.npcs.push(npc);
                    });

                    // --- Interact Prompt ---
                    this.interactPrompt = this.add.image(80, 820, 'interact')
                        .setDisplaySize(60, 60)
                        .setDepth(400)
                        .setVisible(false);

                    // --- Question Overlay ---
                    this.questionUI = this.add.container(450, 450).setDepth(300).setVisible(false);

                    const questionBg = this.add.image(0, 0, 'question').setDisplaySize(900, 900);

                    // Small label above question text
                    const challengeLabel = this.add.text(0, -100, '⬡  CHALLENGE  ⬡', {
                        fontSize: '15px',
                        color: '#ff5555',
                        fontFamily: 'Impact, sans-serif',
                        letterSpacing: 5,
                        stroke: '#000000',
                        strokeThickness: 4,
                        shadow: { offsetX: 0, offsetY: 0, color: '#ff2222', blur: 10, fill: true }
                    }).setOrigin(0.5);

                    this.questionLabel = this.add.text(0, -30, '', {
                        fontSize: '28px',
                        color: '#ffffff',
                        fontFamily: 'Arial, sans-serif',
                        fontStyle: 'bold',
                        align: 'center',
                        wordWrap: { width: 600 },
                        stroke: '#000000',
                        strokeThickness: 5,
                        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 6, fill: true }
                    }).setOrigin(0.5);

                    const rightArrowBtn = this.add.text(0, 100, '▶ OPEN EDITOR', {
                        fontSize: '36px',
                        color: '#00ff88',
                        backgroundColor: '#222222',
                        padding: { x: 20, y: 12 },
                        fontFamily: 'Impact, sans-serif',
                        letterSpacing: 2,
                        stroke: '#003322',
                        strokeThickness: 4,
                        shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 14, fill: true }
                    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                    rightArrowBtn.on('pointerover', () => rightArrowBtn.setColor('#ffffff'));
                    rightArrowBtn.on('pointerout', () => rightArrowBtn.setColor('#00ff88'));

                    rightArrowBtn.on('pointerdown', () => {
                        this.questionUI.setVisible(false);
                        window.currentAmongQuestion = this.objectQuestions[this.currentInteractObject];
                        window.dispatchEvent(new Event('openEditor'));
                    });

                    const closeQuestionBtn = this.add.text(380, -380, 'X', {
                        fontSize: '28px',
                        color: '#ffffff',
                        fontFamily: 'Impact, sans-serif',
                        backgroundColor: '#cc0000',
                        padding: { x: 12, y: 8 },
                        stroke: '#000000',
                        strokeThickness: 3
                    }).setInteractive({ useHandCursor: true }).setOrigin(0.5);

                    closeQuestionBtn.on('pointerdown', () => {
                        this.questionUI.setVisible(false);
                        this.controlsDisabled = false;
                        this.currentInteractObject = null;
                    });

                    this.questionUI.add([questionBg, challengeLabel, this.questionLabel, rightArrowBtn, closeQuestionBtn]);

                    // --- Answer Event Listeners ---
                    this.listenerController = new AbortController();
                    const { signal } = this.listenerController;

                    this.handleCorrect = () => {
                        if (!this.sys || !this.sys.isActive()) return;
                        if (this.questionAnswered) return;
                        this.questionAnswered = true;

                        this.score += 5;
                        this.scoreText.setText('Score: ' + this.score);

                        if (this.currentInteractObject) {
                            this.objectCompleted[this.currentInteractObject] = true;
                        }

                        const successText = this.add.text(450, 450, '+5 CORRECT!', {
                            fontSize: '64px',
                            color: '#00ff88',
                            fontFamily: 'Impact, sans-serif',
                            fontStyle: 'bold',
                            letterSpacing: 2,
                            stroke: '#003322',
                            strokeThickness: 8,
                            shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 24, fill: true }
                        }).setOrigin(0.5).setDepth(600);
                        this.activeFloatingTexts.push(successText);

                        this.tweens.add({
                            targets: successText,
                            y: 350, alpha: 0,
                            duration: 1500,
                            onComplete: () => {
                                successText.destroy();
                                this.activeFloatingTexts = this.activeFloatingTexts.filter(t => t !== successText);
                                this.controlsDisabled = false;
                                this.currentInteractObject = null;
                                this.questionAnswered = false;
                            }
                        });
                    };

                    this.handleWrong = () => {
                        if (!this.sys || !this.sys.isActive()) return;
                        if (this.questionAnswered) return;
                        this.questionAnswered = true;

                        if (this.currentInteractObject) {
                            this.objectCompleted[this.currentInteractObject] = true;
                        }

                        const failText = this.add.text(450, 450, '+0 WRONG!', {
                            fontSize: '64px',
                            color: '#ff4444',
                            fontFamily: 'Impact, sans-serif',
                            fontStyle: 'bold',
                            letterSpacing: 2,
                            stroke: '#330000',
                            strokeThickness: 8,
                            shadow: { offsetX: 0, offsetY: 0, color: '#ff2222', blur: 24, fill: true }
                        }).setOrigin(0.5).setDepth(600);
                        this.activeFloatingTexts.push(failText);

                        this.tweens.add({
                            targets: failText,
                            y: 350, alpha: 0,
                            duration: 1500,
                            onComplete: () => {
                                failText.destroy();
                                this.activeFloatingTexts = this.activeFloatingTexts.filter(t => t !== failText);
                                this.controlsDisabled = false;
                                this.currentInteractObject = null;
                                this.questionAnswered = false;
                            }
                        });
                    };

                    window.addEventListener('correctAnswer', this.handleCorrect, { signal });
                    window.addEventListener('wrongAnswer', this.handleWrong, { signal });

                    const cleanupListeners = () => {
                        this.listenerController.abort();
                        this.activeFloatingTexts.forEach(t => { if (t && t.active) t.destroy(); });
                        this.activeFloatingTexts = [];
                    };

                    this.events.on("shutdown", cleanupListeners);
                    this.events.on("destroy", cleanupListeners);

                    // ==========================================
                    // EMERGENCY & VOTING UI
                    // ==========================================
                    this.emergencyUI = this.add.container(450, 450).setDepth(200).setVisible(false);

                    const imgEmergency = this.add.image(0, 0, 'emergency').setDisplaySize(900, 900).setVisible(false);
                    const imgQuestion = this.add.image(0, 0, 'question').setDisplaySize(900, 900).setVisible(false);
                    const imgEjected = this.add.image(0, 0, 'ejected').setDisplaySize(900, 900).setVisible(false);

                    // Title — upgraded text only (showing MCQ question)
                    const questionText = this.add.text(0, -150, emergencyMCQ.question, {
                        fontSize: '32px',
                        color: '#ff3333',
                        fontFamily: 'Impact, sans-serif',
                        letterSpacing: 2,
                        align: 'center',
                        wordWrap: { width: 700 },
                        stroke: '#000000',
                        strokeThickness: 10,
                        shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 28, fill: true }
                    }).setOrigin(0.5).setVisible(false);

                    // Proceed button — upgraded text only
                    const rightArrow = this.add.text(0, 180, '▶ PROCEED TO VOTE', {
                        fontSize: '34px',
                        color: '#00ff88',
                        fontFamily: 'Impact, sans-serif',
                        letterSpacing: 2,
                        backgroundColor: '#111111',
                        padding: { x: 22, y: 12 },
                        stroke: '#003322',
                        strokeThickness: 4,
                        shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 12, fill: true }
                    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);

                    // Ejected text — upgraded
                    const ejectedText = this.add.text(0, 0, '', {
                        fontSize: '38px',
                        color: '#ffcccc',
                        fontFamily: 'Impact, sans-serif',
                        letterSpacing: 2,
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 8,
                        shadow: { offsetX: 0, offsetY: 0, color: '#ff2222', blur: 18, fill: true }
                    }).setOrigin(0.5).setVisible(false);

                    const optionsContainer = this.add.container(0, 0).setVisible(false);
                    const options = emergencyMCQ.options;
                    const optionCards = [];

                    options.forEach((optText, index) => {
                        const xOffset = (index - 1) * 230;

                        const optBg = this.add.rectangle(xOffset, 0, 200, 250, 0x222222)
                            .setInteractive({ useHandCursor: true })
                            .setStrokeStyle(4, 0x444444);
                        const optSprite = this.add.sprite(xOffset, -30, 'walking', 0)
                            .setDisplaySize(60, 81);
                        if (index === 1) optSprite.setTint(0x3366ff);
                        if (index === 2) optSprite.setTint(0x33cc33);

                        // Candidate option — rendered
                        const optName = this.add.text(xOffset, 70, optText, {
                            fontSize: '24px',
                            color: '#ffffff',
                            fontFamily: 'Impact, sans-serif',
                            letterSpacing: 1,
                            stroke: '#000000',
                            strokeThickness: 5,
                            align: 'center',
                            wordWrap: { width: 180 },
                            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
                        }).setOrigin(0.5);

                        const card = { bg: optBg, sprite: optSprite, label: optName, text: optText };
                        optionCards.push(card);

                        optBg.on('pointerover', () => {
                            if (this.selectedVoteOption !== optText) optBg.setStrokeStyle(6, 0xffff00);
                        });
                        optBg.on('pointerout', () => {
                            if (this.selectedVoteOption !== optText) optBg.setStrokeStyle(4, 0x444444);
                        });
                        optBg.on('pointerdown', () => {
                            optionCards.forEach(c => {
                                c.bg.setStrokeStyle(4, 0x444444);
                                c.bg.setFillStyle(0x222222);
                            });
                            this.selectedVoteOption = optText;
                            optBg.setStrokeStyle(6, 0x00ff00);
                            optBg.setFillStyle(0x004400);
                            this.time.delayedCall(800, () => {
                                if (this.selectedVoteOption === optText) triggerEjectedPhase(optText);
                            });
                        });

                        optionsContainer.add([optBg, optSprite, optName]);
                    });

                    this.emergencyUI.add([imgEmergency, imgQuestion, imgEjected, questionText, rightArrow, optionsContainer, ejectedText]);

                    rightArrow.on('pointerover', () => rightArrow.setColor('#ffffff'));
                    rightArrow.on('pointerout', () => rightArrow.setColor('#00ff88'));

                    rightArrow.on('pointerdown', () => {
                        questionText.setVisible(false);
                        rightArrow.setVisible(false);
                        this.selectedVoteOption = null;
                        optionCards.forEach(c => {
                            c.bg.setStrokeStyle(4, 0x444444);
                            c.bg.setFillStyle(0x222222);
                        });
                        optionsContainer.setVisible(true);
                    });

                    const triggerEjectedPhase = (chosenOption) => {
                        optionsContainer.setVisible(false);
                        imgQuestion.setVisible(false);
                        imgEjected.setVisible(true);
                        ejectedText.setVisible(true).setText("");
                        this.selectedVoteOption = null;

                        const isCorrect = chosenOption === emergencyMCQ.correct;
                        const msg = isCorrect ? `Correct! You saved the right crew.` : `Incorrect. You saved the wrong crew.`;

                        // Add points if correct
                        if (isCorrect) {
                            this.score += 10;
                            this.scoreText.setText('Score: ' + this.score);
                        }

                        let charIndex = 0;
                        this.time.addEvent({
                            delay: 100,
                            repeat: msg.length - 1,
                            callback: () => {
                                ejectedText.setText(ejectedText.text + msg[charIndex]);
                                charIndex++;
                            }
                        });

                        this.time.delayedCall((msg.length * 100) + 2000, () => {
                            this.emergencyUI.setVisible(false);
                            imgEmergency.setVisible(false);
                            imgQuestion.setVisible(false);
                            imgEjected.setVisible(false);
                            questionText.setVisible(false);
                            rightArrow.setVisible(false);
                            optionsContainer.setVisible(false);
                            ejectedText.setVisible(false).setText('');
                            this.controlsDisabled = false;
                        });
                    };

                    this.triggerEmergencyMeeting = () => {
                        if (this.gameOver) return;
                        this.triviaUI.setVisible(false);
                        this.questionUI.setVisible(false);
                        this.controlsDisabled = true;
                        this.player.anims.stop();
                        this.selectedVoteOption = null;

                        imgEmergency.setVisible(false);
                        imgQuestion.setVisible(false);
                        imgEjected.setVisible(false);
                        questionText.setVisible(false);
                        rightArrow.setVisible(false);
                        optionsContainer.setVisible(false);
                        ejectedText.setVisible(false).setText('');
                        optionCards.forEach(c => {
                            c.bg.setStrokeStyle(4, 0x444444);
                            c.bg.setFillStyle(0x222222);
                        });

                        this.emergencyUI.setVisible(true);
                        imgEmergency.setVisible(true);

                        this.time.delayedCall(2000, () => {
                            imgEmergency.setVisible(false);
                            imgQuestion.setVisible(true);
                            questionText.setVisible(true);
                            rightArrow.setVisible(true);
                        });
                    };

                    // ==========================================
                    // TRIVIA UI
                    // ==========================================
                    this.triviaUI = this.add.container(450, 450).setDepth(100).setVisible(false);
                    const triviaBg = this.add.image(0, 0, 'triviaScreen').setDisplaySize(800, 600);
                    const paper = this.add.image(0, 40, 'paper').setDisplaySize(380, 350);
                    this.triviaText = this.add.text(0, 40, '', {
                        fontSize: '22px',
                        color: '#000000',
                        align: 'center',
                        fontStyle: 'bold',
                        fontFamily: 'Arial, sans-serif',
                        wordWrap: { width: 300 },
                        stroke: '#ffffff',
                        strokeThickness: 1
                    }).setOrigin(0.5);

                    const closeBtn = this.add.text(350, -250, 'X', {
                        fontSize: '28px',
                        color: '#ffffff',
                        fontFamily: 'Impact, sans-serif',
                        backgroundColor: '#cc0000',
                        padding: { x: 12, y: 8 },
                        stroke: '#000000',
                        strokeThickness: 3
                    }).setInteractive({ useHandCursor: true }).setOrigin(0.5);

                    closeBtn.on('pointerdown', () => {
                        this.triviaUI.setVisible(false);
                        this.controlsDisabled = false;
                    });

                    this.triviaUI.add([triviaBg, paper, this.triviaText, closeBtn]);

                    // ==========================================
                    // DOM POSTER BUTTONS
                    // ==========================================
                    this.posterObjects = [];

                    const posterDefs = [
                        { key: 'poster_0', x: 300, y: 50, label: '', icon: '📦', color: '#1a6bcc', trivia: topicTrivias[0] },
                        { key: 'poster_1', x: 240, y: 50, label: '', icon: '🔒', color: '#cc6b1a', trivia: topicTrivias[1] },
                        { key: 'poster_2', x: 570, y: 50, label: '', icon: '🏷️', color: '#1acc6b', trivia: topicTrivias[2] },
                        { key: 'poster_3', x: 632, y: 50, label: '', icon: '⚡', color: '#9b1acc', trivia: topicTrivias[3] },
                    ];

                    posterDefs.forEach(def => {
                        const el = createPosterElement(def.label, def.icon, def.color);
                        const domNode = this.add.dom(def.x, def.y, el).setDepth(10);

                        el.addEventListener('click', () => {
                            if (this.controlsDisabled || this.gameOver) return;
                            if (this.objectCompleted[def.key]) return;
                            this.controlsDisabled = true;
                            this.player.anims.stop();
                            this.player.setFrame(0);
                            this.interactPrompt.setVisible(false);
                            this.triviaText.setText(def.trivia);
                            this.triviaUI.setVisible(true);
                        });

                        this.posterObjects.push({
                            key: def.key,
                            obj: domNode,
                            type: 'poster',
                            trivia: def.trivia
                        });
                    });
                }

                // ==========================================
                // PROXIMITY CHECK
                // ==========================================
                getNearbyObject() {
                    const interactables = [
                        { key: 'candle', obj: this.candle, type: 'question' },
                        { key: 'towel', obj: this.towel, type: 'question' },
                        { key: 'alien', obj: this.alien, type: 'question' },
                        { key: 'pet', obj: this.pet, type: 'question' },
                    ];

                    if (this.posterObjects) {
                        this.posterObjects.forEach(p => {
                            interactables.push({ key: p.key, obj: p.obj, type: 'poster', trivia: p.trivia });
                        });
                    }

                    const INTERACT_DISTANCE = 120;

                    for (const item of interactables) {
                        if (this.objectCompleted[item.key]) continue;
                        const dx = this.player.x - item.obj.x;
                        const dy = this.player.y - item.obj.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < INTERACT_DISTANCE) return item;
                    }
                    return null;
                }

                triggerGameOver() {
                    this.gameOver = true;
                    this.controlsDisabled = true;

                    if (auth.currentUser) {
                        const totalQuestionsRespondedTo = Object.values(this.objectCompleted).filter(Boolean).length;
                        updateGameStats(auth.currentUser.uid, 'among-us', this.score, this.score / 5, totalQuestionsRespondedTo);
                    }
                    this.player.anims.stop();
                    this.player.setFrame(0);
                    this.triviaUI.setVisible(false);
                    this.questionUI.setVisible(false);
                    this.interactPrompt.setVisible(false);

                    this.activeFloatingTexts.forEach(t => { if (t && t.active) t.destroy(); });
                    this.activeFloatingTexts = [];

                    this.npcs.forEach(npc => npc.anims.stop());

                    const gameOverText = this.add.text(450, 350, 'GAME OVER', {
                        fontSize: '100px',
                        color: '#ff2222',
                        fontFamily: 'Impact, sans-serif',
                        fontStyle: 'bold',
                        letterSpacing: 6,
                        stroke: '#000000',
                        strokeThickness: 14,
                        shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 40, fill: true }
                    }).setOrigin(0.5).setDepth(1000);

                    const finalScoreText = this.add.text(450, 500, 'Final Score: ' + this.score, {
                        fontSize: '52px',
                        color: '#fbbf24',
                        fontFamily: 'Impact, sans-serif',
                        fontStyle: 'bold',
                        letterSpacing: 2,
                        stroke: '#000000',
                        strokeThickness: 8,
                        shadow: { offsetX: 0, offsetY: 0, color: '#fbbf24', blur: 20, fill: true }
                    }).setOrigin(0.5).setDepth(1000);

                    const totalQuestionsRespondedTo = Object.values(this.objectCompleted).filter(Boolean).length;
                    const accuracy = totalQuestionsRespondedTo === 0 ? 0 : Math.min(100, Math.round((this.score / (totalQuestionsRespondedTo * 100)) * 100));

                    const event = new CustomEvent('gameOver', {
                        detail: { score: this.score, accuracy: accuracy || 10 }
                    });
                    window.dispatchEvent(event);

                    this.time.addEvent({
                        delay: 500,
                        repeat: -1,
                        callback: () => { gameOverText.setVisible(!gameOverText.visible); }
                    });
                }

                update() {
                    // NPC patrol
                    if (!this.gameOver && this.npcs) {
                        this.npcs.forEach(npc => {
                            const cfg = npc.npcConfig;
                            npc.x += 1.5 * npc.patrolDir;
                            if (npc.x >= cfg.patrolMaxX) { npc.patrolDir = -1; npc.setFlipX(true); }
                            else if (npc.x <= cfg.patrolMinX) { npc.patrolDir = 1; npc.setFlipX(false); }
                        });
                    }

                    const postersVisible = !this.controlsDisabled && !this.gameOver;
                    if (this.posterObjects) {
                        this.posterObjects.forEach(p => {
                            p.obj.setVisible(postersVisible);
                        });
                    }

                    if (this.controlsDisabled || this.gameOver) return;

                    const speed = 4;
                    let isMoving = false;

                    if (this.keys.W.isDown) { this.player.y -= speed; isMoving = true; }
                    if (this.keys.S.isDown) { this.player.y += speed; isMoving = true; }
                    if (this.keys.A.isDown) { this.player.x -= speed; this.player.setFlipX(true); isMoving = true; }
                    if (this.keys.D.isDown) { this.player.x += speed; this.player.setFlipX(false); isMoving = true; }

                    this.player.x = Phaser.Math.Clamp(this.player.x, 50, 850);
                    this.player.y = Phaser.Math.Clamp(this.player.y, 120, 860);

                    if (isMoving) {
                        if (!this.player.anims.isPlaying) this.player.play('walk');
                    } else {
                        this.player.anims.stop();
                        this.player.setFrame(0);
                    }

                    const nearbyItem = this.getNearbyObject();

                    if (nearbyItem) {
                        this.interactPrompt.setVisible(true);

                        if (Phaser.Input.Keyboard.JustDown(this.keys.L)) {
                            this.controlsDisabled = true;
                            this.player.anims.stop();
                            this.player.setFrame(0);
                            this.interactPrompt.setVisible(false);

                            if (nearbyItem.type === 'poster') {
                                this.triviaText.setText(nearbyItem.trivia);
                                this.triviaUI.setVisible(true);
                            } else {
                                this.currentInteractObject = nearbyItem.key;
                                this.questionAnswered = false;
                                this.questionLabel.setText(this.objectQuestions[nearbyItem.key]);
                                this.questionUI.setVisible(true);
                            }
                        }
                    } else {
                        this.interactPrompt.setVisible(false);
                    }
                }
            }

            const config = {
                type: Phaser.AUTO,
                width: 900,
                height: 900,
                parent: gameTwo.current,
                scene: [StartScene, AmongSceneFirst],
                backgroundColor: '#111118',
                dom: {
                    createContainer: true
                },
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                }
            }

            if (gameTwo.current) gameTwo.current.innerHTML = '';

            gameTwoBegins = new Phaser.Game(config)
            gameInstanceRef.current = gameTwoBegins;
        }

        init()

        return () => {
            if (gameTwoBegins) gameTwoBegins.destroy(true)
            if (gameTwo.current) gameTwo.current.innerHTML = '';
            gameInstanceRef.current = null;
        }

    }, [])

    return (
        <div ref={gameTwo} className='h-full w-full'></div>
    )
}