const canvasPiece = document.getElementById('nextPiece');
const contextPiece = canvasPiece.getContext('2d');


const canvas = document.getElementById('tetris');
const contex = canvas.getContext('2d');
//Scale the context because pieces appear small
contex.scale(20,20);
contextPiece.scale(50,50);

var counter = 0;

//create colors
const colors = [
    null,
    'red',
    'blue',
    'violet',
    'green',
    'purple',
    'orange',
    'pink'
];

//to take control over the time that the piece
//should take to go down one step
let dropCounter = 0;
//If we want the piece drop faster, 
//just decrease the interval
let dropInterval = 1000;

let lastTime = 0;

//this is the space of work
//where the pieces will be stored
const arena = createMatrix(12, 20);

//this will work to store the next piece that
//it is going to be shown
const matrixNext = {
    type: '',
    matrix: null
};

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
}

function arenaSweep(){

    let rowCounter = 1;

    outer: for(let y = arena.length - 1; y >= 0; y--){
         for(let x = 0; x < arena[y].length; x++){
             if(arena[y][x] === 0){
                 continue outer;
             }
         }
         //take the empty row
         const row = arena.splice(y, 1)[0].fill(0);
         //add the empty row to the top
         arena.unshift(row);
         y++;

         player.score += rowCounter * 10;
         rowCounter *= 2;
    }
}

function collide(arena, player){
    //m for matrix
    //o for offset
    const [m , o] = [player.matrix, player.pos];
    for(let y = 0; y < m.length; y++){
        for(let x = 0; x < m[y].length; x++){
            if(m[y][x] !== 0 && 
                (arena[y + o.y] && 
                arena[y + o.y][x + o.x]) !== 0){
                return true;
            }
        }
    }
    return false;
}

//create the matrix to store the pieces
function createMatrix(width, height){
    const matrix = [];
    while(height--){
        matrix.push(new Array(width).fill(0));
    }

    return matrix;
}

function createPiece(type){
    if(type === 'T'){
        //This is the T figure
        return [
            [0,0,0],
            [1,1,1],
            [0,1,0] 
        ];
    }
    else if(type === 'O'){
        //This is the O figure
        return [
            [2,2],
            [2,2]
        ];
    }
    else if(type === 'L'){
        //This is the L figure
        return [
            [0,3,0],
            [0,3,0],
            [0,3,3]
        ];
    }
    else if(type === 'J'){
        //This is the J figure
        return [
            [0,4,0],
            [0,4,0],
            [4,4,0]
        ];
    }
    else if(type === 'I'){
        //This is the I figure
        return [
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0]
        ];
    }
    else if(type === 'S'){
        //This is the S figure
        return [
            [0,6,6],
            [6,6,0],
            [0,0,0]
        ];
    }
    else if(type === 'Z'){
        //This is the S figure
        return [
            [7,7,0],
            [0,7,7],
            [0,0,0]
        ];
    }
}

function prepareMatrix(){
    contex.fillStyle = '#000' ;
    contex.fillRect(0,0, canvas.clientWidth, canvas.height);
    contex.strokeStyle = "#fff";
    contex.lineWidth = 0.05;

    
}

function prepareNextPiece(){
    contextPiece.fillStyle = '#000' ;
    contextPiece.fillRect(0,0, canvasPiece.clientWidth, canvasPiece.height);
    contextPiece.strokeStyle = "#fff";
    contextPiece.lineWidth = 0.03;
}

//properties to draw the piece over the borad
function draw(){
    prepareMatrix();

    //draw the arena to see the previous pieces
    drawMatrix(arena, {x: 0, y: 0});
    //draw the player matrix to see the current piece
    drawMatrix(player.matrix, player.pos);
}

//properties to draw the piece in next piece
function drawNext(){
    prepareNextPiece();

    if(matrixNext.type === 'L' || matrixNext.type === 'I'){
        var copy = rotateLeft(matrixNext.matrix);
        drawNextPiece(copy, {x:2.5, y: 0.5});
    }
    else{
        //show the current piece
        drawNextPiece(matrixNext.matrix, {x: 3, y: 0.9});
    }
}

function drawNextPiece(matrix, offset){
        matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                contextPiece.fillStyle = colors[value];
                contextPiece.fillRect(x + offset.x,
                                y + offset.y,
                                1, 1);
                
                contextPiece.strokeRect(x + offset.x,
                                        y + offset.y,
                                        1, 1);
            }
        });
    });
}

function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                contex.fillStyle = colors[value];
                contex.fillRect(x + offset.x,
                                y + offset.y,
                                1, 1);

               contex.strokeRect(x + offset.x,
                                        y + offset.y,
                                        1, 1);
            }
        });
    });
}

function update(time = 0){
    //get actual time - last time
    const deltaTime = time - lastTime;
    lastTime = time;
    //add the difference between times
    dropCounter += deltaTime;
    //if dropCounter > 1000 ms the piece will go down 1+
    if(dropCounter > dropInterval){
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore(){
    document.getElementById('score').innerText = player.score;
}

//copy the final position of the piece into to the space of work
function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerMove(direction){
    player.pos.x += direction;
    //check if it collide with the lateral walls
    if(collide(arena, player)){
        player.pos.x -= direction;
    }
}

function playerReset(){
    const pieces = 'ILJOTSZ';

    //If it is empty, it means it just starts
    if(matrixNext.matrix === null){
        matrixNext.type = pieces[pieces.length * Math.random() | 0];
        matrixNext.matrix = createPiece(matrixNext.type);
        player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    }
    else{
        player.matrix = matrixNext.matrix;
        matrixNext.type = pieces[pieces.length * Math.random() | 0];
        matrixNext.matrix = createPiece(matrixNext.type);
    }

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    drawNext();

    //Check if the game is over
    if(collide(arena, player)){
        arena.forEach(row => row.fill(0));
        addScore(player.score);
        player.score = 0;
        updateScore();
    }
}

//Make the piece down a step
function playerDrop(){
    player.pos.y++;
    //check if it collide agains any other 
    //already set piece or again the bottom wall
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        player.pos.y = 0;
    }
    dropCounter = 0;
}

//Rotate the piece to the left
function rotateLeft(matrix){
    var copy = createMatrix(matrix.length, matrix[0].length);
    for(let j = 0; j < matrix.length; j++){
        var height = copy.length - 1;
        for(let i = 0; i < matrix[j].length; i++){
            let value = matrix[j][i];
            copy[height][j] = value;
            height--;
        }
    } 
    return copy;
}

//Rotate the piece to the right
function rotateRight(matrix){
    var copy = createMatrix(matrix.length, matrix[0].length);
    var width = copy.length - 1;
    for(let j = 0; j < matrix.length; j++){
        for(let i = 0; i < matrix[j].length; i++){
            let value = matrix[j][i];
            copy[i][width] = value;
        }
        width--;
    } 
    
    return copy;
}

function checkRotation(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(dir){
    //Check if there is no colliate when the rotation is done

    if(dir === -1){
        //rotate left
        player.matrix = rotateLeft(player.matrix);
    }
    else{
        //rotate right  
        player.matrix = rotateRight(player.matrix);
    }
}

function addScore(text){
    var list = document.getElementById('list');

    var item = document.createElement('li');
    item.innerText = text + " pts";

    if(counter < 7){
        list.insertBefore(item, list.childNodes[0]);
        counter++;
    }
    else{
        list.removeChild(list.lastChild);
        list.insertBefore(item, list.childNodes[0]);
        counter--;
        var color = Math.floor(Math.random() (6)) + 1;
    }    
}

function start(){
    playerReset();
    updateScore();
    update();
}

document.addEventListener('keydown', event => {
    if(event.keyCode === 37){
        //The number 37 represents the arrow left
        playerMove(-1);
    }
    else if(event.keyCode === 39){
        //The number 39 represents the right arrow
        playerMove(1);
    }
    else if(event.keyCode === 40){
        //The number 40 represents the down arrow
        playerDrop();
    }
    else if(event.keyCode === 82){
        //The number 82 represents the letter R -> Right
        checkRotation(1);

    }
    else if(event.keyCode === 76){
        //The number 79 represents the letter L -> Left
        checkRotation(-1);
    }
});

prepareMatrix();
prepareNextPiece();