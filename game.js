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
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let platforms;

function preload() {
  // Cargamos imágenes desde internet (sin necesidad de subirlas)
  this.load.image('sky', 'https://i.imgur.com/hLvbH7k.png');
  this.load.image('ground', 'https://i.imgur.com/ATd5aRF.png');
  this.load.spritesheet('mario', 'https://i.imgur.com/1XqjI2H.png', {
    frameWidth: 32,
    frameHeight: 32
  });
}

function create() {
  // Fondo
  this.add.image(400, 225, 'sky').setScale(2);

  // Plataformas
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 440, 'ground').setScale(2).refreshBody();
  platforms.create(600, 300, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 180, 'ground');

  // Mario
  player = this.physics.add.sprite(100, 350, 'mario');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // Animaciones
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('mario', { start: 0, end: 2 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{ key: 'mario', frame: 1 }],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('mario', { start: 3, end: 5 }),
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
    player.setVelocityY(-380);
  }
}
