document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("cvs");
    const ctx = canvas.getContext("2d");
    const selResolution = document.getElementById("selResolution");
    const radSpeed = document.getElementsByName("radSpeed")
    const btnClear = document.getElementById("btnClear");
    const btnReset = document.getElementById("btnReset");
    const btnPlay = document.getElementById("btnPlay");
    const btnStop = document.getElementById("btnStop");
    btnStop.toggleAttribute("disabled");
    const btnNext = document.getElementById("btnNext");
    const cbNew = document.getElementById("cbNew");
    const cbDying = document.getElementById("cbDying");
    const colorBase = document.getElementById("colorBase");
    const colorNew = document.getElementById("colorNew");
    const colorDying = document.getElementById("colorDying");

    var grid_size = selResolution.options[selResolution.selectedIndex].value;
    var grid = generateGrid(grid_size);
    var save_grid = copyGrid(grid);
    var speed = function() {for (const radButton of radSpeed.values()) { if (radButton.checked) return radButton.value;}}();
    var playing = false;
    var timer;

    // Event du canvas
    canvas.addEventListener("mousemove", (event) => eventCanvas(event, "canvas_mousemove"));

    canvas.addEventListener("click", (event) => eventCanvas(event, "canvas_click"));

    // Event des différents bouton de l'interface
    selResolution.addEventListener("change", () => {
        if(window.confirm("Effacer le canvas actuel et recommencer à nouveau ?")) {
            grid_size = selResolution.options[selResolution.selectedIndex].value;
            grid = generateGrid(grid_size);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    for (const radButton of radSpeed.values()) {
        radButton.addEventListener("click", (event) => {
            speed = event.target.value;
        });
    }

    btnClear.addEventListener("click", () => {
        playing = false;
        if(window.confirm("Effacer le canvas actuel et recommencer à nouveau ?")) {
            grid = generateGrid(grid_size);
            save_grid = copyGrid(grid);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    btnReset.addEventListener("click", () => reset());
    btnPlay.addEventListener("click", () => {
        toggleButton();
        play();
    });
    btnStop.addEventListener("click", () => stop());
    btnNext.addEventListener("click", () => nextTurn(false));

    /**
     * Toggle all buttons
     */
    function toggleButton() {
        btnClear.toggleAttribute("disabled");
        btnReset.toggleAttribute("disabled");
        btnPlay.toggleAttribute("disabled");
        btnStop.toggleAttribute("disabled");
        btnNext.toggleAttribute("disabled");
    }

    /**
     * Generate a grid with the given size
     * 
     * @param {number} size The size of the grid
     * @return {Array} The grid with the given size
     */
    function generateGrid(size) {
        var grid = [];

        for (let i = 0; i < size; i++) {
            grid[i] = [];
            for (let j = 0; j < size; j++) {
                grid[i][j] = 0;
            }
        }

        return grid;
    }

    /**
     * Return a copy of the grid in parameter
     * 
     * @param {Array} grid The grid to copy
     * @return {Array} The copy of the grid
     */
    function copyGrid(grid) {
        const copyGrid = grid.map(function(array) {
            return array.slice();
        });

        return copyGrid;
    }

    /**
     * Compare the old grid with the grid and return true if their equal
     * 
     * @param {Array} old_grid The old grid
     * @return {boolean} Return true if their equal else false
     */
    function equalGrid(old_grid) {
        for (let i = 0; i < grid_size; i++) {
            for (let j = 0; j < grid_size; j++) {
                if (grid[i][j] != old_grid[i][j]) return false;
            }
        }

        return true;
    }

    /**
     * The event listener for the canvas
     * 
     * @param {MouseEvent} event The mouse event
     * @param {string} type The type of the canvas event
     */
    function eventCanvas(event, type) {
        if(playing) return;

        const rect = event.target.getBoundingClientRect(); 
        const x = event.clientX - rect.left; 
        const y = event.clientY - rect.top;
        const sizeToPx = canvas.width / grid_size;
        const pos_x = Math.floor(x / sizeToPx);
        const pos_y = Math.floor(y / sizeToPx);

        if(type === "canvas_click") {
            grid[pos_y][pos_x] = grid[pos_y][pos_x] == 1 ? 0 : 1;
            save_grid = copyGrid(grid);
        }

        updateCanvas(grid);

        if (type === "canvas_mousemove") {
            ctx.fillStyle = "#A0A0A0";
            if (pos_x >= 0 && pos_y >= 0 && pos_x < grid_size && pos_y < grid_size) {
                if (grid[pos_y][pos_x] == 1) {
                    ctx.fillStyle = colorBase.value;
                } else {
                    ctx.fillStyle = "#A0A0A0";
                }
                ctx.fillRect(pos_x*sizeToPx,pos_y*sizeToPx,sizeToPx,sizeToPx);
            }
        } 
    }

    /**
     * Update the canvas with the grid
     * 
     * @param {Array} old_grid The old grid
     */
    function updateCanvas(old_grid) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < grid_size; i++) {
            for (let j = 0; j < grid_size; j++) {
                applyColors(j, i, cbNew.checked, cbDying.checked, old_grid);
            }
        }
    }

    /**
     * Reset the canvas to the initial configuration 
     */
    function reset() {
        grid = copyGrid(save_grid);
        updateCanvas(grid);
    }

    /**
     * Play game of life while it is not finish or stop
     */
    function play() {
        playing = nextTurn(true);

        if (!playing) {
            return stop();
        }

        timer = setTimeout(play, speed);
    }

    /**
     * Stop the animation of game of life
     */
    function stop() {
        playing = false;
        toggleButton();
        clearTimeout(timer);
    }

    /**
     * Make the next turn of game of life
     * 
     * @return {boolean} Return false if the old grid was the same as the new grid else true
     */
    function nextTurn() {
        const old_grid = copyGrid(grid);

        for (let i = 0; i < grid_size; i++) {
            for (let j = 0; j < grid_size; j++) {
                const nbCells = numberOfActiveCells(j, i, old_grid);
                if (grid[i][j] == 1) {
                    if (!(nbCells == 2) && !(nbCells == 3)) {
                        grid[i][j] = 0;
                    }
                } else if (grid[i][j] == 0) {
                    if (nbCells == 3) {
                        grid[i][j] = 1;
                    }
                }
            }        
        }

        updateCanvas(old_grid);

        return !(equalGrid(old_grid));
    }

    /**
     * 
     * Apply the color on the canvas
     * 
     * @param {number} x The pos x in the grid
     * @param {number} y The pos y in the grid
     * @param {boolean} new_cell If the chekbutton new_cell is checked
     * @param {boolean} dying_cell If the chekbutton dying_cell is checked
     * @param {Array} old_grid The old grid
     */
    function applyColors(x, y, new_cell, dying_cell, old_grid) {
        const nbCells = numberOfActiveCells(x, y, grid);
        const sizeToPx = canvas.width / grid_size;
        var color = "#FFFFFF";

        if (grid[y][x] == 1) {
            if (new_cell && old_grid[y][x] == 0) {
                color = colorNew.value;
            } else if (dying_cell && !(nbCells == 2) && !(nbCells == 3)) {
                color = colorDying.value;
            } else {
                color = colorBase.value;
            }
        }

        ctx.fillStyle = color;
        ctx.fillRect(x*sizeToPx,y*sizeToPx,sizeToPx,sizeToPx);
    }

    /**
     * Count the number of active cell arround a cell at pos x y
     * 
     * @param {number} x Pos x
     * @param {number} y Pos y
     * @param {Array} grid The grid where to count cells
     * @return {number} The number of active cells
     */
    function numberOfActiveCells(x, y, grid) {
        var numberCell = 0;

        if (x-1 >= 0) {
            if (grid[y][x-1] == 1) numberCell++;
        }
        if (x-1 >= 0 && y-1 >= 0) {
            if (grid[y-1][x-1] == 1) numberCell++;
        }
        if (x-1 >= 0 && y+1 < grid_size) {
            if (grid[y+1][x-1] == 1) numberCell++;
        }
        if (y-1 >= 0) {
            if (grid[y-1][x] == 1) numberCell++;
        }
        if (y+1 < grid_size) {
            if (grid[y+1][x] == 1) numberCell++;
        }
        if (x+1 < grid_size) {
            if (grid[y][x+1] == 1) numberCell++;
        }
        if (x+1 < grid_size && y-1 >= 0) {
            if (grid[y-1][x+1] == 1) numberCell++;
        }
        if (x+1 < grid_size && y+1 < grid_size) {
            if (grid[y+1][x+1] == 1) numberCell++;
        }

        return numberCell;
    }
});


