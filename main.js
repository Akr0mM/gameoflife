const canvas = document.querySelector('canvas');

class GameOfLife {
  constructor(config) {
    this.canvas = config.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.fps = config.fps;
    this.cw = config.cw;
    this.ch = config.ch;
    this.width = config.width;
    this.height = config.height;
    this.bs = this.ch / this.height;
    this.inSimulation = false;
    this.displayGrid = true;
    this.nbOfIterations = 0;

    $('#fps').text(Math.round(1000 / this.fps * 10) / 10);

    this.grid = [];
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        // this.grid[y][x] = Math.round(Math.random());
        this.grid[y][x] = 0;
      }
    }

    this.canvas.width = this.cw;
    this.canvas.height = this.ch;

    this.sandbox();
  }

  sandbox() {
    this.draw();

    $('canvas').on('click', event => {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;

      const row = Math.floor(mouseY / this.bs);
      const col = Math.floor(mouseX / this.bs);

      this.grid[row][col] = this.grid[row][col] === 1 ? 0 : 1;

      this.draw();
    });

    $('.play').on('click', () => {
      if (this.inSimulation) {
        this.stopSimulation(); 
      } else {
        this.simulation();
      }
    })

    $('.display-grid').on('click', event => {
      if (this.displayGrid) {
        event.currentTarget.textContent = 'Grid On'
      } else {
        event.currentTarget.textContent = 'Grid Off'
      }

      this.displayGrid = !this.displayGrid;

      this.draw();
    })

    $('.clear').on('click', () => {
      this.stopSimulation();

      this.nbOfIterations = 0;
      $('#iterations').text(this.nbOfIterations);

      this.grid = [];
      for (let y = 0; y < this.height; y++) {
        this.grid[y] = [];
        for (let x = 0; x < this.width; x++) {
          this.grid[y][x] = 0;
        }
      }

      this.draw();
    })
    
    $('.plus').on('click', () => {
      this.fps -= 10;

      if (this.fps < 1) this.fps = 1

      if (this.inSimulation) this.simulation();
      $('#fps').text(Math.round(1000 / this.fps * 10) / 10);
    })

    $('.less').on('click', () => {
      this.fps += 10;

      if (this.fps > 1500) this.fps = 1500

      if (this.inSimulation) this.simulation();
      $('#fps').text(Math.round(1000 / this.fps * 10) / 10);
    })
  }

  simulation() {
    $('.play').text('Stop');
    this.inSimulation = true;

    window.clearInterval(this.game);

    this.game = window.setInterval(() => {
      this.update()
      this.draw()
    }, this.fps)

    $('#fps').text(Math.round(1000 / this.fps * 10) / 10);
  }

  stopSimulation() {
    $('.play').text('Play');
    
    this.inSimulation = !this.inSimulation;
    window.clearInterval(this.game)
  }

  update() {
    if (this.grid.every(row => row.every(cell => cell === 0))) {
      this.nbOfIterations = 0;
      $('#iterations').text(this.nbOfIterations);

      this.stopSimulation();
      return;
    }

    let newGrid = [];
    for (let y = 0; y < this.height; y++) {
      newGrid[y] = [];
      for (let x = 0; x < this.width; x++) {
        newGrid[y][x] = 0;
      }
    }

    // living cells
    const near = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x]) {
          let nearCells = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const newX = x + j;
              const newY = y + i;

              if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height && (i !== 0 || j !== 0)) {
                if (this.grid[newY][newX]) {
                  nearCells += 1;
                } else {
                  const alreadyExists = near.some(cell => cell.x === newX && cell.y === newY);
                  if (!alreadyExists) {
                    near.push({ x: newX, y: newY });
                  }
                }
              }
            }
          }

          if (nearCells === 2 || nearCells === 3) {
            newGrid[y][x] = 1;
          }
        }
      }
    }
    
    for (let i = 0; i < near.length; i++) {
      let nearCells = 0;
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const newX = near[i].x + k;
          const newY = near[i].y + j;

          if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height && (i !== 0 || j !== 0) && this.grid[newY][newX]) {
            nearCells += 1;
          }
        }
      }

      if (nearCells === 3) {
        newGrid[near[i].y][near[i].x] = 1;
      }
    }

    this.nbOfIterations += 1;
    $('#iterations').text(this.nbOfIterations);
    
    this.grid = newGrid;
  }

  draw() {
    // clear
    this.rect(0, 0, this.cw, this.ch, '#121212')

    // cells
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x]) {
          this.rect(x * this.bs, y * this.bs, this.bs, this.bs, '#ddd')
        }
      }
    }


    if (this.displayGrid) this.drawGrid();
  }

  drawGrid() {
    this.ctx.beginPath();
    for (let x = 0; x <= this.cw; x += this.bs) {
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.ch);
    }
    for (let y = 0; y <= this.ch; y += this.bs) {
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.cw, y);
    }
    this.ctx.strokeStyle = '#212121';
    this.ctx.stroke();
}

  rect(x, y, w, h, c) {
    this.ctx.fillStyle = c;
    this.ctx.fillRect(x, y, w, h);
  }
  
}

const game = new GameOfLife({
  canvas,
  width: 80,
  height: 80,
  fps: 100,
  cw: 800,
  ch: 800,
});
