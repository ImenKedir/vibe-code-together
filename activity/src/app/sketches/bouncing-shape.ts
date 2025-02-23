export const bouncingShapeSketch = `function(p5) {
  // Game state
  let player = {
    x: 100,
    y: 300,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpForce: -15,
    size: 30,
    isJumping: false,
    direction: 1 // 1 for right, -1 for left
  };

  let platforms = [
    { x: 0, y: 500, width: 800, height: 40 }, // Ground
    { x: 300, y: 400, width: 200, height: 20 },
    { x: 100, y: 300, width: 200, height: 20 },
    { x: 400, y: 200, width: 200, height: 20 },
  ];

  let coins = [
    { x: 350, y: 350, size: 15, collected: false },
    { x: 400, y: 350, size: 15, collected: false },
    { x: 450, y: 350, size: 15, collected: false },
    { x: 150, y: 250, size: 15, collected: false },
    { x: 200, y: 250, size: 15, collected: false },
    { x: 450, y: 150, size: 15, collected: false },
    { x: 500, y: 150, size: 15, collected: false },
  ];

  let score = 0;
  let gravity = 0.8;
  let keys = {};

  p5.setup = function() {
    p5.createCanvas(800, 600);
  };

  function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.size > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.size > rect2.y;
  }

  function handlePlatformCollisions() {
    let onPlatform = false;
    
    for (let platform of platforms) {
      if (checkCollision(player, platform)) {
        // Top collision (landing)
        if (player.velocityY > 0 && 
            player.y + player.size - player.velocityY <= platform.y) {
          player.y = platform.y - player.size;
          player.velocityY = 0;
          player.isJumping = false;
          onPlatform = true;
        }
        // Bottom collision (hitting head)
        else if (player.velocityY < 0 && 
                 player.y - player.velocityY >= platform.y + platform.height) {
          player.y = platform.y + platform.height;
          player.velocityY = 0;
        }
        // Side collisions
        else {
          if (player.x + player.size > platform.x && 
              player.x < platform.x + platform.width) {
            if (player.velocityX > 0) {
              player.x = platform.x - player.size;
            } else if (player.velocityX < 0) {
              player.x = platform.x + platform.width;
            }
            player.velocityX = 0;
          }
        }
      }
    }

    if (!onPlatform) {
      player.isJumping = true;
    }
  }

  function collectCoins() {
    for (let coin of coins) {
      if (!coin.collected &&
          p5.dist(player.x + player.size/2, 
                  player.y + player.size/2,
                  coin.x + coin.size/2,
                  coin.y + coin.size/2) < player.size/2 + coin.size/2) {
        coin.collected = true;
        score += 10;
      }
    }
  }

  function drawPlayer() {
    // Body
    p5.fill(255, 0, 0);
    p5.rect(player.x, player.y, player.size, player.size);
    
    // Face direction indicator
    p5.fill(0);
    let eyeX = player.direction > 0 ? 
               player.x + player.size - 10 : 
               player.x + 10;
    p5.circle(eyeX, player.y + 15, 5);
  }

  p5.draw = function() {
    p5.background(135, 206, 235); // Sky blue

    // Handle input
    if (keys[37] || keys[65]) { // Left arrow or A
      player.velocityX = -player.speed;
      player.direction = -1;
    } else if (keys[39] || keys[68]) { // Right arrow or D
      player.velocityX = player.speed;
      player.direction = 1;
    } else {
      player.velocityX *= 0.8; // Friction
    }

    // Apply gravity
    if (player.isJumping) {
      player.velocityY += gravity;
    }

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Keep player in bounds
    player.x = p5.constrain(player.x, 0, p5.width - player.size);
    
    // Handle collisions
    handlePlatformCollisions();
    collectCoins();

    // Draw platforms
    p5.fill(100, 200, 100);
    for (let platform of platforms) {
      p5.rect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw coins
    p5.fill(255, 215, 0);
    for (let coin of coins) {
      if (!coin.collected) {
        p5.circle(coin.x + coin.size/2, coin.y + coin.size/2, coin.size);
      }
    }

    // Draw player
    drawPlayer();

    // Draw score
    p5.fill(0);
    p5.textSize(24);
    p5.textAlign(p5.LEFT);
    p5.text('Score: ' + score, 20, 40);
  };

  // Handle key events
  p5.keyPressed = function() {
    keys[p5.keyCode] = true;
    
    // Jump with space or up arrow or W
    if ((p5.keyCode === 32 || p5.keyCode === 38 || p5.keyCode === 87) && !player.isJumping) {
      player.velocityY = player.jumpForce;
      player.isJumping = true;
    }
  };

  p5.keyReleased = function() {
    keys[p5.keyCode] = false;
  };
}`; 