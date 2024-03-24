//Variabelen

// Bord
let tilesize = 32;
let rows = 16;
let columns = 16;

let Bord;
let BordWidth = tilesize * columns; // 32 * 16
let BordHeight = tilesize * rows + columns*2; // 32 * 16
let context;


// aanvaller/ shooter
let aanvallerWidth = tilesize*3;
let aanvallerHeight = tilesize*3;
let aanvallerX = tilesize * columns/2 - tilesize;
let aanvallerY = tilesize * rows - tilesize*2;

let aanvaller = {
    x : aanvallerX,
    y : aanvallerY,
    width : aanvallerWidth,
    height : aanvallerHeight
}

let aanvallerImg;
let aanvallerVelocityX = tilesize; //strandbal beweeg snelheid


// target
let targetArray = [];
let targetWidth = tilesize*2;
let targetHeight = tilesize*2;
let targetX = tilesize;
let targetY = tilesize;
let targetImg;

let targetRows = 2;
let targetColumns = 3;
let targetCount = 0; // hoeveel targets je moet raken
let targetVelocityX = 1; // de target snelheid beweging



// kogels
let kogelArray = [];
let kogelVelocityY = -10; // negatief getal omdat ze omhoog schieten, beweeg snelheid

let score = 0;
let gameOver = false;


window.onload = function() {

    Bord = document.getElementById("Bord");
    Bord.width = BordWidth;
    Bord.height = BordHeight;
    context = Bord.getContext("2d"); // drawing on the board

   // laden van images
   aanvallerImg = new Image();
   aanvallerImg.src = "images/Cactus1.png" //img https://pin.it/7kAiOzcV5
   aanvallerImg.onload = function() {
   context.drawImage(aanvallerImg, aanvaller.x, aanvaller.y, aanvaller.width, aanvaller.height);
   }

   targetImg = new Image();
   targetImg.src = "images/Strand.png"; // img in adobe gemaakt
   createTarget();

   requestAnimationFrame(update);
   document.addEventListener("keydown", moveAanvaller);
   document.addEventListener("keyup", schiet);

 
   // zorgt ervoor dat het spel reset als er op de opnieuw knop wordt gedrukt
   // display none is dat het niet zichtbaar bij herladen
   document.getElementById("Opnieuw").addEventListener("click", function() {
    resetGame();
    document.getElementById("gameOverOverlay").style.display = "none";
    console.log('game over');
    
   });
}




function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    // canvas clear maken zodat de shooter niet over elkaar heen gaat
    context.clearRect(0, 0, Bord.width, Bord.height);

    // Shooter
    context.drawImage(aanvallerImg, aanvaller.x, aanvaller.y, aanvaller.width, aanvaller.height);

    // Target (Loop)
    for (let i = 0; i < targetArray.length; i++) {
        let target = targetArray[i];
        if (target.alive) {
            target.x += targetVelocityX;

            // als de target de onderkant raakt
            if (target.y >= aanvaller.y){
                gameOver = true;
                document.getElementById("gameOverOverlay").style.display = "block";
                
            
            }

            //als de target de border raakt
            if (target.x + target.width >= Bord.width || target.x <= 0) {
                targetVelocityX *= -1

            // de targets gaan 1 rij naar voren steeds
            for (let j = 0; j < targetArray.length; j++) {
                targetArray[j].y += targetHeight;
            }
            }

            context.drawImage(targetImg, target.x, target.y, target.width, target.height);
            if (target.y >= aanvaller.y) {
                gameOver = true;
                const audio = document.querySelector('#gameOverMuziek'); //cursus & https://stackoverflow.com/questions/62538745/audiodata-key-event-keycode-explain-this-code
                audio.play();
            }
          
        }
    }

    // kogels (Loop)
    for (let i = 0; i < kogelArray.length; i++) {
        let kogel = kogelArray[i];
        kogel.y += kogelVelocityY;
        // de kogel kleur en de grootte
        context.fillStyle="white";
        context.fillRect(kogel.x, kogel.y, kogel.width, kogel.height);

        // kogel collision met target strandbal
        for (let j = 0; j < targetArray.length; j++) {
            let target = targetArray[j];
            if (!kogel.used && target.alive && detectCollision(kogel, target)) {
                kogel.used = true;
                target.alive = false;
                targetCount--;
                score += 10;
            }
        }


    }

    // kogels weg buiten canvas zodat het niet vertraagt
    while (kogelArray.length > 0 && (kogelArray[0].used || kogelArray[0].y < 0)) {
        kogelArray.shift();
    }

    // nieuw level wanneer game over
    if (targetCount == 0) {
        // verdubbel het aantal targets in columns and rows x1
        targetColumns = Math.min(targetColumns + 1, columns/2 -2);
        targetRows = Math.min(targetRows + 1, rows-4);
        targetVelocityX += 0.2;
        targetArray = [];
        kogelArray = [];
        createTarget();
    }

    //score
    context.fillStyle="white";
    context.font="20px courier";
    context.fillText(score, 20, 30);

}


// Moving de shooter & e staat voor evement
function moveAanvaller(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "ArrowLeft" && aanvaller.x - aanvallerVelocityX >= 0){
        aanvaller.x -= aanvallerVelocityX; // Naar links 1 keer
    }
    else if (e.code == "ArrowRight" && aanvaller.x + aanvallerVelocityX + aanvaller.width <= Bord.width){
        aanvaller.x += aanvallerVelocityX; // Naar rechts 1 keer
    }

}

// functie target
function createTarget() {
    for (let c = 0; c < targetColumns; c++) {
        for (let r = 0; r < targetRows; r++) {
            let target = {
                img : targetImg,
                x : targetX + c*targetWidth,
                y : targetY + r*targetHeight,
                width : targetWidth,
                height : targetHeight,
                alive : true
            }
            targetArray.push(target);
        }
    }
    targetCount = targetArray.length;
}

// functie kogels door op spatie te klikken 
function schiet(e) {
    if (gameOver) {
        return;
    }

// schieten door spatiebalk
    if (e.code == "Space") {
        // schiet
        let kogel = {
            x : aanvaller.x + aanvallerWidth*15/32,
            y : aanvaller.y,
            width : tilesize/8,
            height : tilesize/2,
            used : false

        }
        kogelArray.push(kogel);
    }
}

// functie voor de kogels om het target te raken
function detectCollision(a, b) {
    return a.x < b.x + b.width && 
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;

}

// functie dat alles reset wanneer de game opnieuw begint
function resetGame () {
    gameOver = false;
    targetArray = [];
    kogelArray = [];
    targetRows = 2;
    targetColumns = 3;
    targetVelocityX = 1;
    targetCount = 0;

    aanvaller.x = aanvallerX;
    aanvaller.y = aanvallerY;
    score = 0;

}

