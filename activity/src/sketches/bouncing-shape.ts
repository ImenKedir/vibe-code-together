export const bouncingShapeSketch = `
  return function(p) {
    let ball;
    let paddle;
    let bricks = [];
    let score = 0;

    p.setup = function() {
      p.createCanvas(600, 400);
      
      // Initialize ball
      ball = {
        x: p.width/2,
        y: p.height/2,
        diameter: 20,
        speedX: 5,
        speedY: -5
      };
      
      // Initialize paddle
      paddle = {
        x: p.width/2 - 50,
        y: p.height - 30,
        width: 100,
        height: 15,
        speed: 8  // Add paddle movement speed
      };
      
      // Create bricks
      let BrickRows = 4;
      let BrickCols = 8;
      let brickWidth = p.width/BrickCols;
      let brickHeight = 30;
      
      for (let i = 0; i < BrickRows; i++) {
        for (let j = 0; j < BrickCols; j++) {
          bricks.push({
            x: j * brickWidth,
            y: i * brickHeight,
            width: brickWidth,
            height: brickHeight,
            visible: true
          });
        }
      }
    };

    p.draw = function() {
      p.background(0);
      
      // Draw and update ball
      drawBall();
      updateBall();
      
      // Draw and update paddle
      drawPaddle();
      updatePaddle();
      
      // Draw bricks
      drawBricks();
      
      // Display score
      p.fill(255);
      p.textSize(20);
      p.text(\`Score: \${score}\`, 10, 30);
    };

    function drawBall() {
      p.fill(255);
      p.noStroke();
      p.circle(ball.x, ball.y, ball.diameter);
    }

    function updateBall() {
      ball.x += ball.speedX;
      ball.y += ball.speedY;
      
      // Wall collision
      if (ball.x + ball.diameter/2 > p.width || ball.x - ball.diameter/2 < 0) {
        ball.speedX *= -1;
      }
      if (ball.y - ball.diameter/2 < 0) {
        ball.speedY *= -1;
      }
      
      // Paddle collision
      if (ball.y + ball.diameter/2 > paddle.y && 
          ball.x > paddle.x && 
          ball.x < paddle.x + paddle.width) {
        ball.speedY *= -1;
        let hitPos = (ball.x - paddle.x) / paddle.width;
        ball.speedX = 10 * (hitPos - 0.5);
      }
      
      // Brick collision
      for (let brick of bricks) {
        if (brick.visible && 
            ball.x + ball.diameter/2 > brick.x && 
            ball.x - ball.diameter/2 < brick.x + brick.width &&
            ball.y + ball.diameter/2 > brick.y &&
            ball.y - ball.diameter/2 < brick.y + brick.height) {
          brick.visible = false;
          ball.speedY *= -1;
          score += 10;
        }
      }
      
      // Game over condition
      if (ball.y > p.height) {
        gameOver();
      }
    }

    function drawPaddle() {
      p.fill(255);
      p.noStroke();
      p.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    }

    function updatePaddle() {
      // Move paddle based on arrow key input
      if (p.keyIsDown(p.LEFT_ARROW)) {
        paddle.x -= paddle.speed;
      }
      if (p.keyIsDown(p.RIGHT_ARROW)) {
        paddle.x += paddle.speed;
      }
      
      // Keep paddle within canvas bounds
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.width > p.width) paddle.x = p.width - paddle.width;
    }

    function drawBricks() {
      p.fill(255, 0, 0);
      p.noStroke();
      for (let brick of bricks) {
        if (brick.visible) {
          p.rect(brick.x, brick.y, brick.width - 2, brick.height - 2);
        }
      }
    }

    function gameOver() {
      p.noLoop();
      p.fill(255);
      p.textSize(32);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(\`Game Over!\\nScore: \${score}\\nClick to restart\`, p.width/2, p.height/2);
    }

    p.mousePressed = function() {
      if (!p.isLooping()) {
        resetGame();
        p.loop();
      }
    };

    function resetGame() {
      ball.x = p.width/2;
      ball.y = p.height/2;
      ball.speedX = 5;
      ball.speedY = -5;
      score = 0;
      for (let brick of bricks) {
        brick.visible = true;
      }
    }
  }
`;
