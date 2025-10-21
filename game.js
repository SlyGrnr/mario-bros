const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: true } // Enable debug for visibility
    },
    scene: { preload, create, update },
    backgroundColor: '#000000' // Fallback background color
};

const PLAYER_SPEED = 160;
const JUMP_VELOCITY = -450;
const PLATFORM_WIDTH = 200;
const SCROLL_SPEED = 2;
const MAX_PARTICLES = 5;

let player, cursors, platforms, camera;
let bgSky1, bgSky2, bgGround1, bgGround2;
let coins, enemies, goal;
let score = 0;
let scoreText;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let jumpSound, coinSound, hitSound;
let coinParticles;

const game = new Phaser.Game(config);

function preload() {
    console.log('Preloading assets...');
    try {
        const g = this.add.graphics();

        // Sky background
        g.fillStyle(0x6ec6ff, 1);
        g.fillRect(0, 0, 800, 450);
        g.generateTexture('sky', 800, 450);
        
        // Ground decoration
        g.fillStyle(0x228b22, 1);
        g.fillRect(0, 0, 800, 50);
        g.generateTexture('ground-deco', 800, 50);
        
        // Platform
        g.fillStyle(0x8b5a2b, 1);
        g.fillRect(0, 0, PLATFORM_WIDTH, 32);
        g.generateTexture('ground', PLATFORM_WIDTH, 32);
        
        // Player
        g.clear();
        g.fillStyle(0xff0000, 1);
        g.fillRect(0, 0, 28, 36);
        g.fillStyle(0xffffff, 1);
        g.fillRect(6, 8, 4, 4);
        g.fillRect(18, 8, 4, 4);
        g.generateTexture('player', 28, 36);
        
        // Coin
        g.clear();
        g.fillStyle(0xffff00, 1);
        g.fillCircle(8, 8, 8);
        g.generateTexture('coin', 16, 16);
        
        // Enemy
        g.clear();
        g.fillStyle(0x00ff00, 1);
        g.fillRect(0, 0, 28, 28);
        g.generateTexture('enemy', 28, 28);
        
        // Goal
        g.clear();
        g.fillStyle(0xff00ff, 1);
        g.fillRect(0, 0, 32, 64);
        g.generateTexture('goal', 32, 64);
        
        g.destroy(); // Clean up graphics object
        console.log('Textures generated successfully');
    } catch (e) {
        console.error('Error generating textures:', e);
    }

    // Skip audio loading for now to avoid issues
    // this.load.audio('jump', ['jump.wav', 'jump.mp3']);
    // this.load.audio('coin', ['coin.wav', 'coin.mp3']);
    // this.load.audio('hit', ['hit.wav', 'hit.mp3']);
}

function create() {
    console.log('Creating scene...');
    
    // Backgrounds
    bgSky1 = this.add.image(0, 0, 'sky').setOrigin(0).setDepth(0);
    bgSky2 = this.add.image(800, 0, 'sky').setOrigin(0).setDepth(0);
    bgGround1 = this.add.image(0, 400, 'ground-deco').setOrigin(0).setDepth(1);
    bgGround2 = this.add.image(800, 400, 'ground-deco').setOrigin(0).setDepth(1);

    // Platforms
    platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 20; i++) {
        const x = i * PLATFORM_WIDTH;
        const ground = platforms.create(x, 430, 'ground').setOrigin(0);
        ground.refreshBody();
    }

    // Player
    player = this.physics.add.sprite(100, 350, 'player').setDepth(10);
    player.setCollideWorldBounds(false);
    player.setBounce(0.1);
    this.physics.add.collider(player, platforms);

    // Input
    cursors = this.input.keyboard.createCursorKeys();

    // Camera
    camera = this.cameras.main;
    camera.startFollow(player, true, 0.05, 0.05);
    camera.setBounds(0, 0, 100000, 450);

    // Coins
    coins = this.physics.add.group();
    spawnCoins(this);
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // Enemies
    enemies = this.physics.add.group();
    spawnEnemies(this);
    this.physics.add.collider(player, enemies, hitEnemy, null, this);
    this.physics.add.collider(enemies, platforms);

    // Goal
    goal = this.physics.add.sprite(20 * PLATFORM_WIDTH, 350, 'goal').setImmovable(true);
    this.physics.add.overlap(player, goal, reachGoal, null, this);

    // UI
    scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '20px', fill: '#fff' }).setScrollFactor(0);
    this.add.text(650, 16, 'Récord: ' + highScore, { fontSize: '20px', fill: '#fff' }).setScrollFactor(0);

    // Skip audio for now
    // jumpSound = this.sound.add('jump', { volume: 0.5 });
    // coinSound = this.sound.add('coin', { volume: 0.5 });
    // hitSound = this.sound.add('hit', { volume: 0.5 });

    // Particles
    coinParticles = this.add.particles('coin');
    coinParticles.createEmitter({
        speed: { min: -100, max: 100 },
        scale: { start: 1, end: 0 },
        lifespan: 300,
        quantity: MAX_PARTICLES,
        on: false
    });

    console.log('Scene created successfully');
}

function update() {
    if (!player?.body) {
        console.warn('Player body not found');
        return;
    }

    // Player movement
    player.setVelocityX(PLAYER_SPEED);

    // Jump
    if (cursors.up.isDown && player.body.blocked.down) {
        player.setVelocityY(JUMP_VELOCITY);
        // jumpSound?.play();
    }

    // Scroll backgrounds
    scrollBackground(bgSky1, bgSky2, 0.5);
    scrollBackground(bgGround1, bgGround2, 1);

    // Recycle objects
    recyclePlatforms();
    recycleCoins();
    moveEnemies();

    // Game over
    if (player.y > 480) {
        showGameOver.call(this);
    }
}

function scrollBackground(bg1, bg2, factor) {
    bg1.x = (camera.scrollX * factor) % 1600;
    bg2.x = (camera.scrollX * factor + 800) % 1600;
}

function recyclePlatforms() {
    platforms.children.iterate(p => {
        if (!p?.body) return;
        if (p.x + PLATFORM_WIDTH < camera.scrollX - 200) {
            p.x += PLATFORM_WIDTH * 20;
            p.refreshBody();
        }
    });
}

function recycleCoins() {
    coins.children.iterate(c => {
        if (!c?.body) return;
        if (c.x < camera.scrollX - 50) {
            c.x += PLATFORM_WIDTH * 20;
            c.y = Phaser.Math.Between(300, 380);
            c.enableBody(false, c.x, c.y, true, true);
        }
    });
}

function spawnCoins(scene) {
    for (let i = 0; i < 20; i++) {
        const x = i * PLATFORM_WIDTH + Phaser.Math.Between(50, 150);
        const y = Phaser.Math.Between(300, 380);
        const coin = coins.create(x, y, 'coin').setOrigin(0.5).setBounce(0).setImmovable(true);
        scene.tweens.add({
            targets: coin,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
}

function collectCoin(player, coin) {
    if (!coin?.body) return;
    coin.disableBody(true, true);
    score += 10;
    scoreText.setText('Puntos: ' + score);
    // coinSound?.play();
    coinParticles.emitParticleAt(coin.x, coin.y);
}

function spawnEnemies(scene) {
    for (let i = 0; i < 5; i++) {
        const x = Phaser.Math.Between(400, 3800);
        const enemy = enemies.create(x, 402, 'enemy').setBounce(1).setImmovable(true);
        enemy.setVelocityX(Phaser.Math.Between(50, 100) * (Math.random() > 0.5 ? 1 : -1));
    }
}

function moveEnemies() {
    enemies.children.iterate(e => {
        if (!e?.body) return;
        if (e.body.blocked.right || e.body.blocked.left) {
            e.setVelocityX(e.body.velocity.x * -1);
        }
        if (e.x < camera.scrollX - 50) {
            e.x += PLATFORM_WIDTH * 20;
            e.y = 402;
            e.setVelocityX(Phaser.Math.Between(50, 100) * (Math.random() > 0.5 ? 1 : -1));
        }
    });
}

function hitEnemy(player, enemy) {
    // hitSound?.play();
    showGameOver.call(this);
}

function reachGoal(player, goal) {
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        highScore = score;
    }
    this.add.text(300, 200, '¡Ganaste! Puntos: ' + score, { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);
    this.physics.pause();
    this.time.delayedCall(2000, () => {
        score = 0;
        this.scene.restart();
    });
}

function showGameOver() {
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        highScore = score;
    }
    this.add.text(300, 200, 'Game Over! Puntos: ' + score, { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);
    this.physics.pause();
    this.time.delayedCall(2000, () => {
        score = 0;
        this.scene.restart();
    });
}
