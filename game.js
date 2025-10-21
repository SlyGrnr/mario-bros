// Configuración básica de Phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let platforms;

function preload() {
  // Fondo y suelo estables (GitHub raw links)
  this.load.image('sky', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/skies/sky4.png');
  this.load.image('ground', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/platforms/platform.png');

  // Sprite tipo Mario (public domain)
  this.load.spritesheet('mario', 'https://raw.githubusercontent.com/jlooper/platformer-game-assets/main/player.png', {
    frameWidth: 32,
    frameHeight: 32
  });
}

function create() {
  // Fondo
  this.add.image(400, 225, 'sky').setScale(1.5);

  // Plataformas
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 440, 'ground').setScale(2).refreshBody();
  platforms.create(600, 300, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 180, 'ground');

  // Jugador
  player = this.physics.add.sprite(100, 350, 'mario');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // Animaciones
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('mario', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'mario', frame: 4 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('mario', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Colisiones
  this.physics.add.collider(player, platforms);

  // Controles
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }
}
