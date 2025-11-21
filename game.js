// Game Configuration
const CONFIG = {
    GRAVITY: 0.6,
    JUMP_FORCE: -15,
    MOVE_SPEED: 6,
    MAX_FALL_SPEED: 20,
    PLATFORM_WIDTH: 100,
    PLATFORM_HEIGHT: 15,
    PLATFORM_GAP: 80,
    PLAYER_WIDTH: 30,
    PLAYER_HEIGHT: 40,
    CAMERA_OFFSET: 0.4,
    FPS: 60,
};

// Game State
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.player = null;
        this.platforms = [];
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('icyTowerHighScore')) || 0;
        this.gameState = 'start'; // start, playing, gameOver
        this.keys = {};
        this.touchControls = { left: false, right: false, jump: false };
        this.cameraY = 0;
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateHighScoreDisplay();
        this.animate(0);
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }
    
    setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (this.gameState === 'playing') {
                if (e.key === ' ' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.player.jump();
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Mobile touch controls
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isMobile) {
            document.getElementById('mobileControls').classList.add('visible');
        }
        
        // Touch control buttons
        const leftBtn = document.getElementById('leftButton');
        const rightBtn = document.getElementById('rightButton');
        const jumpBtn = document.getElementById('jumpButton');
        
        const addTouchEvents = (element, control) => {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchControls[control] = true;
                if (control === 'jump' && this.gameState === 'playing') {
                    this.player.jump();
                }
            });
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchControls[control] = false;
            });
        };
        
        addTouchEvents(leftBtn, 'left');
        addTouchEvents(rightBtn, 'right');
        addTouchEvents(jumpBtn, 'jump');
        
        // Start button
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // Restart button
        document.getElementById('restartButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    startGame() {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.remove('visible');
        
        this.gameState = 'playing';
        this.score = 0;
        this.cameraY = 0;
        
        // Initialize player
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        
        // Initialize platforms
        this.platforms = [];
        this.generateInitialPlatforms();
    }
    
    generateInitialPlatforms() {
        // Ground platform
        this.platforms.push(new Platform(0, this.canvas.height - 50, this.canvas.width, 50, true));
        
        // Generate platforms going up
        let y = this.canvas.height - 50;
        for (let i = 0; i < 15; i++) {
            y -= CONFIG.PLATFORM_GAP;
            const x = Math.random() * (this.canvas.width - CONFIG.PLATFORM_WIDTH);
            this.platforms.push(new Platform(x, y, CONFIG.PLATFORM_WIDTH, CONFIG.PLATFORM_HEIGHT));
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Handle input
        let moveX = 0;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.touchControls.left) {
            moveX = -CONFIG.MOVE_SPEED;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.touchControls.right) {
            moveX = CONFIG.MOVE_SPEED;
        }
        
        this.player.update(moveX, this.platforms, this.canvas.width);
        
        // Update camera to follow player
        const targetCameraY = this.player.y - this.canvas.height * CONFIG.CAMERA_OFFSET;
        if (targetCameraY < this.cameraY) {
            this.cameraY = targetCameraY;
        }
        
        // Update score based on height
        const currentHeight = Math.max(0, Math.floor(-this.player.y / 10));
        if (currentHeight > this.score) {
            this.score = currentHeight;
            this.updateScoreDisplay();
        }
        
        // Generate new platforms as player climbs
        let highestPlatform = Math.min(...this.platforms.map(p => p.y));
        while (highestPlatform > this.cameraY - this.canvas.height) {
            const y = highestPlatform - CONFIG.PLATFORM_GAP;
            const x = Math.random() * (this.canvas.width - CONFIG.PLATFORM_WIDTH);
            this.platforms.push(new Platform(x, y, CONFIG.PLATFORM_WIDTH, CONFIG.PLATFORM_HEIGHT));
            highestPlatform = y; // Update highestPlatform to prevent infinite loop
        }
        
        // Remove platforms that are below the screen
        this.platforms = this.platforms.filter(p => p.y < this.cameraY + this.canvas.height + 100);
        
        // Check if player fell off screen
        if (this.player.y > this.cameraY + this.canvas.height) {
            this.gameOver();
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(0.5, '#302b63');
        gradient.addColorStop(1, '#24243e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(0, -this.cameraY);
        
        // Draw platforms
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        // Draw player
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Restore context
        this.ctx.restore();
    }
    
    animate(currentTime) {
        requestAnimationFrame((time) => this.animate(time));
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
    }
    
    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateHighScoreDisplay() {
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('icyTowerHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }
        
        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalHighScore').textContent = this.highScore;
        document.getElementById('gameOverScreen').classList.add('visible');
    }
}

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.PLAYER_WIDTH;
        this.height = CONFIG.PLAYER_HEIGHT;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = false;
        this.color = '#667eea';
    }
    
    update(moveX, platforms, canvasWidth) {
        // Apply horizontal movement
        this.velocityX = moveX;
        this.x += this.velocityX;
        
        // Screen wrap
        if (this.x < -this.width / 2) {
            this.x = canvasWidth - this.width / 2;
        } else if (this.x > canvasWidth - this.width / 2) {
            this.x = -this.width / 2;
        }
        
        // Apply gravity
        this.velocityY += CONFIG.GRAVITY;
        if (this.velocityY > CONFIG.MAX_FALL_SPEED) {
            this.velocityY = CONFIG.MAX_FALL_SPEED;
        }
        this.y += this.velocityY;
        
        // Platform collision
        this.isOnGround = false;
        for (const platform of platforms) {
            if (this.checkCollision(platform)) {
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y + 5) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.isOnGround = true;
                }
            }
        }
    }
    
    checkCollision(platform) {
        return this.x < platform.x + platform.width &&
               this.x + this.width > platform.x &&
               this.y < platform.y + platform.height &&
               this.y + this.height > platform.y;
    }
    
    jump() {
        if (this.isOnGround) {
            this.velocityY = CONFIG.JUMP_FORCE;
            this.isOnGround = false;
        }
    }
    
    render(ctx) {
        // Draw player with glow effect
        ctx.save();
        
        // Glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 5, this.y + 10, 8, 8);
        ctx.fillRect(this.x + this.width - 13, this.y + 10, 8, 8);
        
        ctx.restore();
    }
}

// Platform Class
class Platform {
    constructor(x, y, width, height, isGround = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isGround = isGround;
        this.color = isGround ? '#1a1a2e' : '#4ecdc4';
    }
    
    render(ctx) {
        ctx.save();
        
        // Glow effect for platforms
        if (!this.isGround) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
        }
        
        // Platform
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Shine effect
        if (!this.isGround) {
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(this.x, this.y, this.width, this.height / 2);
        }
        
        ctx.restore();
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
