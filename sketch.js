/*
The Game Project
Final
*/

// general variables for the character
var gameChar_x;
var gameChar_y;
var floorPos_y;

// creating variables to control the character
var isLeft;
var isRight;
var isPlummeting;
var isFalling;
var isJumping;

// variable for an array of collectables
var collectables = [];

// variable for an array of canyos
var canyons = [];

// list of x positions for trees and variable to anchor the trees on the y-axis
var trees_x;
var treePos_y;

// variable to hold an array of clouds
var clouds = [];

// variable to hold an array of mountains
var mountains = [];

// variable to allow scenery to move in the background
var cameraPosX;

// variable for game score
var game_score;

//variable for flagpole
var flagpole;

//variable for lives
var lives;

//sounds
var jumpSound;
var levelCompleteSound;
var failedSound;
var gotCoinSound;
var hitSound;

//platforms
var platforms;

//enemies
var enemies;

function preload(){
    soundFormats('mp3', 'wav');
    
    //load sound
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    
    levelCompleteSound = loadSound('assets/levelComplete.wav');
    levelCompleteSound.setVolume(0.1);
    
    failedSound = loadSound('assets/plummetingSound.wav');
    failedSound.setVolume(0.1);
    
    gotCoinSound = loadSound('assets/gotCoin.wav');
    gotCoinSound.setVolume(0.1);
    
    hitSound = loadSound('assets/hit.wav');
    hitSound.setVolume(0.1);
}

// SETUP FUNCTION //
function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
    lives = 3;
    startGame();
}

// DRAWING FUNCTION //
function draw()
{   
    // Setting the cameraPosX to be where the game character is on the x-axis minus a half of the width, so
    // the game character can always stay on the middle of the screen.
    cameraPosX = gameChar_x - (width/2);
    
    // filling the sky
	background(100,155,255);

    // drawing the ground
	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height - floorPos_y);
    
    // BEFORE the first drawing item, I will use the push / translate function to control the movement of the scenery
    push();
    translate(-cameraPosX, 0);
    
    // Drawing the mountains
    drawMountains();
    
    // Drawing the trees
    drawTrees();
    
    // Drawing the clouds
    drawClouds();
    
    //Drawing and checking the canyons
    for (var i = 0; i < canyons.length; i++){
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }
    
    // drawing and checking for multiple collectables
    for (var i = 0; i < collectables.length ; i++){
        if (!collectables[i].isFound){
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]); 
        }
    }
    
    // drawing the platforms.
    for(var i = 0; i < platforms.length; i++){
        platforms[i].draw();
    }
    
    //drawing enemies
    for(var i = 0; i < enemies.length; i++){
        enemies[i].draw();
        var isContact = enemies[i].checkContact(gameChar_x, gameChar_y);
        if(isContact){
            if(lives > 0){
                lives -= 1;
                startGame();
                break;
            }
        }
    }
    
    // drawing the flagpole
    renderFlagpole();
    //checking the flagpole
    if(!flagpole.isReached){
        checkFlagpole();
    }
    
    // checking if the player has died
    checkPlayerDie();
    
	// drawing the game character
	drawGameCharacter();
    
    // Adding POP here
    pop();
    
    // drawing game score to the top=left
    fill(255);
    noStroke();
    textSize(12);
    text("score: " + game_score, 50, 30);
    
    // drawing lives token as three green dots
    fill(0,255,0);
    for(var i = 0; i < lives; i++){
        ellipse(55 + i*16, 40, 12);
    }
    
    // game over
    if(lives < 1){
        fill(255);
        noStroke();
        textSize(20);
        text("GAME OVER", width/2 - 50, height/2 - 100);
        return;
    }
    // level complete
    if(flagpole.isReached){
        fill(255);
        noStroke();
        textSize(20);
        text("LEVEL COMPLETE!!!", width/2 - 50, height/2 - 100);
        return;
    }

	///////////INTERACTION CODE//////////
    if(isLeft){
        gameChar_x -= 5;
    }
    if(isRight){
        gameChar_x += 5;
    }
    // jumping
    if(isJumping){
        gameChar_y = constrain(gameChar_y, floorPos_y, 100) - 100;
        isFalling = true;
    }
    if(gameChar_y < floorPos_y){
        var isContact = false;
        for(var i = 0; i < platforms.length; i++){
            if(platforms[i].checkContact(gameChar_x, gameChar_y)){
                isContact = true;
                isFalling = false;
                break;
            }
        }
        if(!isContact){
            gameChar_y += 5;
            isFalling = true;
        }
    }
    else{
        isFalling = false;
    }
    
    if(isPlummeting){
        gameChar_y += 10;
    }
    
    if (gameChar_y > floorPos_y){
        gameChar_y += 5;
        isFalling = true;
    }
}

function keyPressed()
{
	// if statements to control the animation of the character when
	// keys are pressed.
    //implementing left
    if(isPlummeting == false)
    {
        if(keyCode == 65){
            isLeft = true;
        }
    }
    //implementing right
    if(isPlummeting == false)
    {
        if(keyCode == 68){
            isRight = true;
        }
    }
    // jumping
    if(isPlummeting == false)
    {
        if(keyCode == 87){
            if(isFalling){
                isJumping = false;
            }
            else{
                isJumping = true;
                jumpSound.play();
            }
        }
    }
}

function keyReleased()
{
	// if statements to control the animation of the character when
	// keys are released.
    //implementing left
    if(keyCode == 65){
        isLeft = false;
    }
    //implementing right
    if(keyCode == 68){
        isRight = false;
    }
    //jumping
    if(keyCode == 87){
        isJumping = false;
    }
}

function drawClouds(){
    for (var i = 0; i < clouds.length; i++){
        fill(255,255,255);
        ellipse(clouds[i].x_pos, clouds[i].y_pos, clouds[i].dimension);
        ellipse(clouds[i].x_pos - 40, clouds[i].y_pos, clouds[i].dimension - 20);
        ellipse(clouds[i].x_pos + 40, clouds[i].y_pos, clouds[i].dimension - 20);
        ellipse(clouds[i].x_pos+80, clouds[i].y_pos, clouds[i].dimension);
        ellipse(clouds[i].x_pos + 120, clouds[i].y_pos, clouds[i].dimension - 20);
    }
}

function drawMountains(){
    for (var i = 0; i < mountains.length; i++){
        fill(90,70,110);
        triangle(mountains[i].x_pos, mountains[i].y_pos, mountains[i].x_pos + 300, mountains[i].y_pos - 302, mountains[i].x_pos + 450, mountains[i].y_pos);
        fill(213,212,255);
        beginShape();
        vertex(mountains[i].x_pos + 300, mountains[i].y_pos - 302);
        vertex(mountains[i].x_pos + 358, mountains[i].y_pos - 186);
        vertex(mountains[i].x_pos + 310, mountains[i].y_pos - 182);
        vertex(mountains[i].x_pos + 280, mountains[i].y_pos - 182);
        vertex(mountains[i].x_pos + 240, mountains[i].y_pos - 215);
        vertex(mountains[i].x_pos + 175, mountains[i].y_pos - 177);
        endShape(CLOSE);
    } 
}

function drawTrees(){
    // for loop to iterate into the list of x-values for trees
    for (var i = 0; i < trees_x.length; i++){
        //Drawing the ith tree
        fill(165,42,42);
        rect(trees_x[i], treePos_y, 50, 90);
        fill(0,155,0);
        triangle(trees_x[i] - 50, treePos_y, trees_x[i] +25, treePos_y - 100, trees_x[i] + 100, treePos_y);
        triangle(trees_x[i] - 50, treePos_y - 50, trees_x[i] + 25, treePos_y - 180, trees_x[i] + 100, treePos_y - 50);
    }
}

function drawCollectable(t_collectable){
    if(t_collectable.isFound == false){
        stroke(184,134,11);
        strokeWeight(3);
        fill(255,215,0);
        ellipse(t_collectable.x_pos, t_collectable.y_pos, t_collectable.size);
        ellipse(t_collectable.x_pos + 15, t_collectable.y_pos, t_collectable.size);
        ellipse(t_collectable.x_pos + 10, t_collectable.y_pos - 10, t_collectable.size);
        strokeWeight(1);
        noStroke();
    }
}

function drawCanyon(t_canyon){
    stroke(128,0,0);
    strokeWeight(1);
    fill(139,0,0);
    rect(t_canyon.x_pos,floorPos_y,t_canyon.width,height - floorPos_y);
    strokeWeight(1);
    noStroke();   
}

function checkCollectable(t_collectable){
    if(dist(gameChar_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 20){
        t_collectable.isFound = true;
        gotCoinSound.play();
        game_score += 1;
    }
}

function checkCanyon(t_canyon){
    if (dist(gameChar_x, gameChar_y, (t_canyon.x_pos + t_canyon.width/1.99), floorPos_y) < t_canyon.width/2){
        isPlummeting = true;
        failedSound.play();
    }
}

function drawGameCharacter(){
    if(isLeft && isFalling)
	{
        //head
        fill(255,218,185);
        ellipse(gameChar_x+2, gameChar_y - 58, 26,30);
        //left eye
        fill(255,255,255);
        ellipse(gameChar_x -8,gameChar_y -56, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x-8,gameChar_y-56,2,2);
        //right eye
        fill(255,255,255);
        ellipse(gameChar_x +4,gameChar_y -56, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x+4,gameChar_y-56,2,2);
        //hair
        fill(0);
        arc(gameChar_x+2,gameChar_y - 58,26,30,PI,0);
        //mouth
        fill(0);
        stroke(1);
        line(gameChar_x - 5,gameChar_y - 48, gameChar_x + 5, gameChar_y - 48);
        noStroke();
        //body
        fill(65,105,225);
        rect(gameChar_x - 9, gameChar_y - 44, 22, 28);
        //left leg
        fill(0,0,0);
        rect(gameChar_x - 9, gameChar_y - 16, 6, 10);
        //right leg
        fill(0,0,0);
        rect(gameChar_x + 3, gameChar_y - 16, 10, 10);
        //right shoulder
        fill(65,105,225);
        rect(gameChar_x + 13, gameChar_y - 44, 8,10);
        //left shoulder
        fill(65,105,225);
        rect(gameChar_x - 13, gameChar_y - 44, 4,10);
        //left arm
        fill(255,218,185);
        rect(gameChar_x - 13, gameChar_y - 54, 4, 10);
        //right arm
        fill(255,218,185);
        rect(gameChar_x + 13, gameChar_y - 34, 8, 10);
        //jump effect
        stroke(2);
        line(gameChar_x+4, gameChar_y, gameChar_x, gameChar_y - 6);
        line(gameChar_x+1, gameChar_y, gameChar_x-3, gameChar_y - 6);
        line(gameChar_x-2, gameChar_y, gameChar_x-6, gameChar_y - 6);
        line(gameChar_x-5, gameChar_y, gameChar_x-9, gameChar_y - 6);
        line(gameChar_x+7, gameChar_y, gameChar_x+3, gameChar_y - 6);
        line(gameChar_x+10, gameChar_y, gameChar_x+6, gameChar_y - 6);
        line(gameChar_x+13, gameChar_y, gameChar_x+9, gameChar_y - 6);
        line(gameChar_x+16, gameChar_y, gameChar_x+12, gameChar_y - 6);
        noStroke();
	}
	else if(isRight && isFalling)
	{
        //head
        fill(255,218,185);
        ellipse(gameChar_x-2, gameChar_y - 58, 26,30);
        //left eye
        fill(255,255,255);
        ellipse(gameChar_x -4,gameChar_y -56, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x-4,gameChar_y-56,2,2);
        //right eye
        fill(255,255,255);
        ellipse(gameChar_x +6,gameChar_y -56, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x+6,gameChar_y-56,2,2);
        //hair
        fill(0);
        arc(gameChar_x-2,gameChar_y - 58,26,30,PI,0);
        //mouth
        fill(0);
        stroke(1);
        line(gameChar_x - 5,gameChar_y - 48, gameChar_x + 5, gameChar_y - 48);
        noStroke();
        //body
        fill(65,105,225);
        rect(gameChar_x - 13, gameChar_y - 44, 22, 28);
        //left leg
        fill(0,0,0);
        rect(gameChar_x - 13, gameChar_y - 16, 10, 10);
        //right leg
        fill(0,0,0);
        rect(gameChar_x + 3, gameChar_y - 16, 6, 10);
        //right shoulder
        fill(65,105,225);
        rect(gameChar_x + 9, gameChar_y - 44, 4,10);
        //left shoulder
        fill(65,105,225);
        rect(gameChar_x - 21, gameChar_y - 44, 8,10);
        //left arm
        fill(255,218,185);
        rect(gameChar_x - 21, gameChar_y - 34, 8, 10);
        //right arm
        fill(255,218,185);
        rect(gameChar_x + 9, gameChar_y - 54, 4, 10);
        //jump effect
        stroke(2);
        line(gameChar_x-4, gameChar_y, gameChar_x, gameChar_y - 6);
        line(gameChar_x-7, gameChar_y, gameChar_x-3, gameChar_y - 6);
        line(gameChar_x-10, gameChar_y, gameChar_x-6, gameChar_y - 6);
        line(gameChar_x-13, gameChar_y, gameChar_x-9, gameChar_y - 6);
        line(gameChar_x-16, gameChar_y, gameChar_x-12, gameChar_y - 6);
        line(gameChar_x-1, gameChar_y, gameChar_x+3, gameChar_y - 6);
        line(gameChar_x+2, gameChar_y, gameChar_x+6, gameChar_y - 6);
        line(gameChar_x+5, gameChar_y, gameChar_x+9, gameChar_y - 6);
        noStroke();
	}
	else if(isLeft)
	{
        //head
        fill(255,218,185);
        ellipse(gameChar_x +2, gameChar_y - 50, 26,30);
        //left eye
        fill(255,255,255);
        ellipse(gameChar_x -8,gameChar_y -48, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x-8,gameChar_y-48,2,2);
        //right eye
        fill(255,255,255);
        ellipse(gameChar_x +4,gameChar_y -48, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x+4,gameChar_y-48,2,2);
        //hair
        fill(0);
        arc(gameChar_x+2,gameChar_y - 50,26,30,PI,0);
        //mouth
        fill(0);
        stroke(1);
        line(gameChar_x - 5,gameChar_y - 40, gameChar_x +5 , gameChar_y - 40);
        noStroke();
        //body
        fill(65,105,225);
        rect(gameChar_x - 9, gameChar_y - 36, 22, 28);
        //left leg
        fill(0,0,0);
        rect(gameChar_x - 9, gameChar_y - 8, 6, 10);
        //right leg
        fill(0,0,0);
        rect(gameChar_x + 3, gameChar_y - 8, 10, 10);
        //right shoulder
        fill(65,105,225);
        rect(gameChar_x + 13, gameChar_y - 36, 8,10);
        //left shoulder
        fill(65,105,225);
        rect(gameChar_x - 13, gameChar_y - 36, 4,10);
        //left arm
        fill(255,218,185);
        rect(gameChar_x - 13, gameChar_y - 26, 4, 10);
        //right arm
        fill(255,218,185);
        rect(gameChar_x + 13, gameChar_y - 26, 8, 10);
	}
	else if(isRight)
	{
        //head
        fill(255,218,185);
        ellipse(gameChar_x-2, gameChar_y - 50, 26,30);
        //left eye
        fill(255,255,255);
        ellipse(gameChar_x -4,gameChar_y -48, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x-4,gameChar_y-48,2,2);
        //right eye
        fill(255,255,255);
        ellipse(gameChar_x +6,gameChar_y -48, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x+6,gameChar_y-48,2,2);
        //hair
        fill(0);
        arc(gameChar_x-2,gameChar_y - 50,26,30,PI,0);
        //mouth
        fill(0);
        stroke(1);
        line(gameChar_x - 5,gameChar_y - 40, gameChar_x + 5, gameChar_y - 40);
        noStroke();
        //body
        fill(65,105,225);
        rect(gameChar_x - 13, gameChar_y - 36, 22, 28);
        //left leg
        fill(0,0,0);
        rect(gameChar_x - 13, gameChar_y - 8, 10, 10);
        //right leg
        fill(0,0,0);
        rect(gameChar_x + 3, gameChar_y - 8, 6, 10);
        //right shoulder
        fill(65,105,225);
        rect(gameChar_x + 9, gameChar_y - 36, 4,10);
        //left shoulder
        fill(65,105,225);
        rect(gameChar_x - 21, gameChar_y - 36, 8,10);
        //left arm
        fill(255,218,185);
        rect(gameChar_x - 21, gameChar_y - 26, 8, 10);
        //right arm
        fill(255,218,185);
        rect(gameChar_x + 9, gameChar_y - 26, 4, 10);
	}
	else if(isFalling || isPlummeting)
	{
        //head
        fill(255,218,185);
        ellipse(gameChar_x, gameChar_y - 60, 30,30);
        //left eye
        fill(255,255,255);
        ellipse(gameChar_x -6,gameChar_y -58, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x-6,gameChar_y-58,2,2);
        //right eye
        fill(255,255,255);
        ellipse(gameChar_x +6,gameChar_y -58, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x+6,gameChar_y-58,2,2);
        //hair
        fill(0);
        arc(gameChar_x,gameChar_y - 60,30,30,PI,0);
        //mouth
        fill(0);
        stroke(1);
        line(gameChar_x - 5,gameChar_y - 50, gameChar_x + 5, gameChar_y - 50);
        noStroke();
        //body
        fill(65,105,225);
        rect(gameChar_x - 13, gameChar_y - 46, 26, 28);
        //left leg
        fill(0,0,0);
        rect(gameChar_x - 13, gameChar_y -18, 10, 10);
        //right leg
        fill(0,0,0);
        rect(gameChar_x + 3, gameChar_y - 18, 10, 10);
        //right shoulder
        fill(65,105,225);
        rect(gameChar_x + 13, gameChar_y - 46, 8,10);
        //left shoulder
        fill(65,105,225);
        rect(gameChar_x - 21, gameChar_y - 46, 8,10);
        //left arm
        fill(255,218,185);
        rect(gameChar_x - 21, gameChar_y - 56, 8, 10);
        //right arm
        fill(255,218,185);
        rect(gameChar_x + 13, gameChar_y - 56, 8, 10);
        //jump effect
        stroke(2);
        line(gameChar_x, gameChar_y, gameChar_x, gameChar_y - 6);
        line(gameChar_x-3, gameChar_y, gameChar_x-3, gameChar_y - 6);
        line(gameChar_x-6, gameChar_y, gameChar_x-6, gameChar_y - 6);
        line(gameChar_x-9, gameChar_y, gameChar_x-9, gameChar_y - 6);
        line(gameChar_x-12, gameChar_y, gameChar_x-12, gameChar_y - 6);
        line(gameChar_x+3, gameChar_y, gameChar_x+3, gameChar_y - 6);
        line(gameChar_x+6, gameChar_y, gameChar_x+6, gameChar_y - 6);
        line(gameChar_x+9, gameChar_y, gameChar_x+9, gameChar_y - 6);
        line(gameChar_x+12, gameChar_y, gameChar_x+12, gameChar_y - 6);
        noStroke();
	}
	else
	{
        //head
        fill(255,218,185);
        ellipse(gameChar_x, gameChar_y - 50, 30,30);
        //left eye
        fill(255,255,255);
        ellipse(gameChar_x -6,gameChar_y -48, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x-6,gameChar_y-48,2,2);
        //right eye
        fill(255,255,255);
        ellipse(gameChar_x +6,gameChar_y -48, 5,5);
        fill(0,0,0);
        ellipse(gameChar_x+6,gameChar_y-48,2,2);
        //hair
        fill(0);
        arc(gameChar_x,gameChar_y - 50,30,30,PI,0);
        //mouth
        fill(0);
        stroke(1);
        line(gameChar_x - 5,gameChar_y - 40, gameChar_x + 5, gameChar_y - 40);
        noStroke();
        //body
        fill(65,105,225);
        rect(gameChar_x - 13, gameChar_y - 36, 26, 28);
        //left leg
        fill(0,0,0);
        rect(gameChar_x - 13, gameChar_y - 8, 10, 10);
        //right leg
        fill(0,0,0);
        rect(gameChar_x + 3, gameChar_y - 8, 10, 10);
        //right shoulder
        fill(65,105,225);
        rect(gameChar_x + 13, gameChar_y - 36, 8,10);
        //left shoulder
        fill(65,105,225);
        rect(gameChar_x - 21, gameChar_y - 36, 8,10);
        //left arm
        fill(255,218,185);
        rect(gameChar_x - 21, gameChar_y - 26, 8, 10);
        //right arm
        fill(255,218,185);
        rect(gameChar_x + 13, gameChar_y - 26, 8, 10);
	}
}

function renderFlagpole(){
    push();
    fill(120);
    strokeWeight(6);
    stroke(5)
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 200);
    pop();
    
    if (!flagpole.isReached){
        fill(255, 0, 100);
        noStroke();
        rect(flagpole.x_pos, floorPos_y -50, 50, 50);
    }
    else{
        fill(255, 0, 100);
        noStroke();
        rect(flagpole.x_pos, floorPos_y -200, 50, 50)
    }
    
}

function checkFlagpole(){
    if ((dist(gameChar_x, gameChar_y, flagpole.x_pos, floorPos_y) < 20) && game_score == collectables.length) {
        flagpole.isReached = true;
        levelCompleteSound.play();
    }
}

function checkPlayerDie(){
    if (gameChar_y > floorPos_y + 300){
        lives -= 1;
        if (lives > 0){
            startGame();
        }
    }
}

function startGame(){
    gameChar_x = width/2;
	gameChar_y = floorPos_y;
    
    // initializing variables
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    isJumping = false;
    
    // collectables array of objects
    collectables = [{x_pos: 90, y_pos: floorPos_y, size: 20, isFound: false}, {x_pos: 690, y_pos: floorPos_y, size: 20, isFound: false}, {x_pos: 990, y_pos: floorPos_y, size: 20, isFound: false}, {x_pos: 1290, y_pos: floorPos_y, size: 20, isFound: false}, {x_pos: 1590, y_pos: floorPos_y, size: 20, isFound: false}]
    
    // canyon objects
    canyons = [{x_pos: 200, width: 100}, {x_pos: 800, width: 100}, {x_pos: 1400, width: 80}, {x_pos: 1800, width: 70}];
    
    // x-position for trees
    trees_x = [50,400,480,580,1000, 1200];
    
    // y-position for trees
    treePos_y = floorPos_y - 89;
    
    // clouds
    for (var i = 0; i < 5; i++){
        // adding some randomnized variation to the clouds
        clouds[i] = {x_pos: (100 + (2 * (i*180))), y_pos: 100 + random(-20,20), dimension: 80};
    }
    
    // mountains
    for (var i = 0; i < 3; i++){
        mountains[i] = {x_pos: (100 + (i*500)), y_pos: 432};
    }
    
    // the camera position starts at zero
    cameraPosX = 0; 
    // game score starts at zero
    game_score = 0;
    //initializing the flagpole object
    flagpole = {isReached : false, x_pos : 2030};
    
    //platforms
    platforms = [];
    for(var i =0; i < 3; i++){
        platforms.push(createPlatforms(150 + i*600, floorPos_y - 50));
    }
    
    //enemies
    enemies = [];
    for(var i = 0; i < 3; i++){
        enemies.push(new Enemy((100 + i*600), floorPos_y - 10, 100));
    }
}

function createPlatforms(x, y, length){
    var p = {
        x: x,
        y: y,
        length: 100,
        draw: function(){
            fill(color(210,210,210));
            rect(this.x, this.y, this.length, 20);
        },
        checkContact: function(gc_x, gc_y){
            if(gc_x > this.x && gc_x < this.x + this.length){
                var d = this.y - gc_y;
                if(d >= 0 && d < 5){
                    return true;
                }
            }
            return false;
        }
    }
    return p;
}

function Enemy(x, y, range){
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.increment = 1;
    
    this.update = function(){
        this.currentX += this.increment;
        if(this.currentX >= this.range + this.x){
            this.increment = -1;
        }
        else if (this.currentX < this.x){
            this.increment = 1;
        }
    }
    
    this.draw = function(){
        this.update();
        fill(200,0,0);
        ellipse(this.currentX, this.y, 30, 30);
        fill(0);
        rect(this.currentX-5, this.y - 16, 10,5);
        ellipse(this.currentX - 5, this.y -5, 5,5);
        ellipse(this.currentX + 5, this.y - 5, 5,5);
        beginShape();
        vertex(this.currentX-8, this.y);
        vertex(this.currentX, this.y+3);
        vertex(this.currentX+8, this.y);
        endShape();
        fill(226,88,34);
        beginShape();
        vertex(this.currentX-5, this.y -15);
        vertex(this.currentX, this.y - 20);
        vertex(this.currentX + 5, this.y - 15);
        endShape();
        
    }
    
    this.checkContact = function(gc_x, gc_y){
        var d = dist(gc_x, gc_y, this.currentX, this.y);
        if(d < 30){
            hitSound.play();
            return true;
        }
        return false;
    }
}






