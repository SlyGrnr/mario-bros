// === Mini Mario Bros - Etapa 3: Enemigos y Meta Final ===

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
    },
    scene: { preload, create, update }
};

let player, cursors, platforms, camera;
let bgSky1, bgSky2, bgGround1, bgGround2;
let scrollSpeed = 2;
let platformWidth = 200;

let coins, enemies, goal;
let score = 0;
let scoreText;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

const game = new Phaser.Game(config);

function preload() {
    const g = this.add.graphics();

    // Fondo cielo
    g.fillStyle(0x6ec6ff, 1);
    g.fillRect(0, 0, 800, 450);
    g.generateTexture('sky', 800, 450);
    g.clear();

    // Piso decorativo
    g.fillStyle(0x228b22, 1);
    g.fillRect(0, 0, 800, 50);
    g.generateTexture('ground-deco', 800, 50);
    g.clear();

    // Plataforma marrón
    g.fillStyle(0x8b5a2b, 1);
    g.fillRect(0, 0, platformWidth, 32);
    g.generateTexture('ground', platformWidth, 32);
    g.clear();

    // Jugador rojo
    g.fillStyle(0xff0000, 1);
    g.fillRect(0, 0, 28, 36);
    g.fillStyle(0xffffff, 1);
    g.fillRect(6, 8, 4, 4);
    g.fillRect(18, 8, 4, 4);
    g.generateTexture('player', 28, 36);
    g.clear();

    // Moneda amarilla
    g.fillStyle(0xffff00, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture('coin', 16, 16);
    g.clear();

    // Enemigo verde
    g.fillStyle(0x00ff00, 1);
    g.fillRect(0, 0, 28, 28);
    g.generateTexture('enemy', 28, 28);
    g.clear();

    // Meta (bandera)
    g.fillStyle(0xff00ff, 1);
    g.fillRect(0, 0, 32, 64);
    g.generateTexture('goal', 32, 64);
    g.clear();
}

function create() {
    // Fondos infinitos
    bgSky1 = this.add.image(0, 0, 'sky').setOrigin(0);
    bgSky2 = this.add.image(800, 0, 'sky').setOrigin(0);
    bgGround1 = this.add.image(0, 400, 'ground-deco').setOrigin(0);
    bgGround2 = this.add.image(800, 400, 'ground-deco').setOrigin(0);

    // Crear plataformas
    platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 20; i++) {
        let x = i * platformWidth;
        let y = 430;
        let ground = platforms.create(x, y, 'ground').setOrigin(0);
        ground.refreshBody();
    }

    // Crear jugador
    player = this.physics.add.sprite(100, 350, 'player');
    player.setCollideWorldBounds(false);
    player.setBounce(0.1);
    player.setDepth(10);

    platforms.setDepth(5);
    bgGround1.setDepth(1);
    bgGround2.setDepth(1);
    bgSky1.setDepth(0);
    bgSky2.setDepth(0);

    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    camera = this.cameras.main;
    camera.startFollow(player, true, 0.05, 0.05);
    camera.setBounds(0, 0, 100000, 450);

    // Crear grupo de monedas
    coins = this.physics.add.group();
    spawnCoins(this);
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    // Crear enemigos
    enemies = this.physics.add.group();
    spawnEnemies(this);
    this.physics.add.collider(player, enemies, hitEnemy, null, this);

    // Meta final
    goal = this.physics.add.sprite(20 * platformWidth, 350, 'goal');
    goal.setImmovable(true);
    this.physics.add.overlap(player, goal, reachGoal, null, this);

    // Puntaje
    scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '20px', fill: '#fff' }).setScrollFactor(0);
    this.add.text(650, 16, 'Récord: ' + highScore, { fontSize: '20px', fill: '#fff' }).setScrollFactor(0);
}

function update() {
    if (!player.body) return;

    // Movimiento automático
    player.setVelocityX(160);

    // Saltar
    if (cursors.up.isDown && player.body.blocked.down) {
        player.setVelocityY(-450);
    }

    // Fondo infinito
    scrollBackground(bgSky1, bgSky2, 0.5);
    scrollBackground(bgGround1, bgGround2, 1);

    recyclePlatforms();
    recycleCoins();
    moveEnemies();

    // Reinicio si cae
    if (player.y > 480) restartScene.call(this);
}

// --- Funciones auxiliares ---

function scrollBackground(bg1, bg2, factor) {
    bg1.x = (camera.scrollX * factor) % 1600;
    bg2.x = (camera.scrollX * factor + 800) % 1600;
}

function recyclePlatforms() {
    platforms.children.iterate(p => {
        if (!p.body) return;
        if (p.x + platformWidth < camera.scrollX - 200) {
            p.x += platformWidth * 20;
            p.refreshBody();
        }
    });
}

function recycleCoins() {
    coins.children.iterate(c => {
        if (!c.body) return;
        if (c.x < camera.scrollX - 50) {
            c.x += platformWidth * 20;
            c.y = Phaser.Math.Between(300, 380);
            c.enableBody(false, c.x, c.y, true, true);
        }
    });
}

function spawnCoins(scene) {
    for (let i = 0; i < 20; i++) {
        let x = i * platformWidth + Phaser.Math.Between(50, 150);
        let y = Phaser.Math.Between(300, 380);
        let coin = coins.create(x, y, 'coin');
        coin.setOrigin(0.5);
        coin.setBounce(0);
        coin.setImmovable(true);
    }
}

function collectCoin(player, coin) {
    if (!coin.body) return;
    coin.disableBody(true, true);
    score += 10;
    scoreText.setText('Puntos: ' + score);
}

function spawnEnemies(scene) {
    for (let i = 0; i < 5; i++) {
        let x = Phaser.Math.Between(400, 3800);
        let enemy = enemies.create(x, 402, 'enemy');
        enemy.setCollideWorldBounds(false);
        enemy.setBounce(1);
        enemy.setVelocityX(50);
        enemy.setImmovable(true);
    }
    this.physics.add.collider(enemies, platforms, (e) => { e.setVelocityX(e.body.velocity.x); });
}

function moveEnemies() {
    enemies.children.iterate(e => {
        if (!e.body) return;
        // Rebotar al chocar con borde de la plataforma
        if (e.body.blocked.right || e.body.blocked.left) {
            e.setVelocityX(e.body.velocity.x * -1);
        }
        // Reciclar enemigos
        if (e.x < camera.scrollX - 50) {
            e.x += platformWidth * 20;
            e.y = 402;
        }
    });
}

function hitEnemy(player, enemy) {
    restartScene.call(this);
}

function reachGoal(player, goal) {
    alert('¡Felicidades! Has llegado al final del nivel con ' + score + ' puntos.');
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        highScore = score;
    }
    this.scene.restart();
    score = 0;
}

function restartScene() {
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        highScore = score;
    }
    score = 0;
    this.scene.restart();
}

function collectCoin(player, coin) {
    coin.disableBody(true, true);
    score += 10;
    scoreText.setText('Puntos: ' + score);
}
