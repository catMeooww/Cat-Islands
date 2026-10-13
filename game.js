userMobile = /iPhone|Android|iPad/i.test(navigator.userAgent);
gameLoaded = false;
url = window.location.href;
url = url.split("?");

gameID = url[1];
gameData = [];
gameBridges = [];
gameStructures = [];

menuOpen = false;
gameMode = "move";
buildAnchor = "";
buildSelection = "";

gameWidth = window.innerWidth;
gameHeight = window.innerHeight;

async function loadGameData() {
    loadUserData();
    await firebase.database().ref("catislands/saves/" + gameID + "/name").once('value', data => {
        gameData[0] = data.val();
        document.title = "Cat Islands - " + gameData[0];
    });
    await firebase.database().ref("catislands/saves/" + gameID + "/bridges/").on('value', function (snapshot) {
        gameBridges = [];
        snapshot.forEach(function (childSnapshot) {
            bridID = childSnapshot.key; bridData = childSnapshot.val();
            gameBridges.push({ "id": bridID, ...bridData });
        });
    });
    await firebase.database().ref("catislands/saves/" + gameID + "/structures/").on('value', function (snapshot) {
        gameStructures = [];
        snapshot.forEach(function (childSnapshot) {
            structID = childSnapshot.key; structData = childSnapshot.val();
            gameStructures.push({ "id": structID, ...structData });
        });
    });
    gameLoaded = true;
    centerCamera();
}

function preload() {
    islandBase = loadImage("./assets/Island.png");
    addIcon = loadImage("./assets/addIcon.png");
}

function setup() {
    canvas = createCanvas(gameWidth, gameHeight - 80);
    canvas.parent("canvas-holder");
    //resize
    addIcon.resize(25, 25);
}

function overlap(ax, ay, bx, by, sa, sb = 0) {
    return (ax < bx + sb && ax + sa > bx && ay < by + sb && ay + sa > by);
}

function draw() {
    background("lightblue");
    frameRate(80);
    if (gameLoaded) {
        //controls
        if (keyDown("a") || keyDown("left")) {
            camera.x -= 10;
        } else if (keyDown("d") || keyDown("right")) {
            camera.x += 10;
        }
        if (keyDown("w") || keyDown("up")) {
            camera.y -= 10;
        } else if (keyDown("s") || keyDown("down")) {
            camera.y += 10;
        }
        //draw structures
        gameBridges.forEach(brid => {
            if (brid['style'] == "wood") {
                strokeWeight(50);
                stroke("brown");
            }
            line(brid['startX'], brid['startY'], brid['endX'], brid['endY']);
        })
        gameStructures.forEach(struct => {
            posX = struct['x'];
            posY = struct['y'];
            size = struct['size'] * 50;
            image(islandBase, posX, posY, size, size);
            if (gameMode == "build") {
                image(addIcon, posX + size / 2, posY - 15);
                image(addIcon, posX - 15, posY + size / 2);
                image(addIcon, posX + size / 2, posY + size - 15);
                image(addIcon, posX + size - 15, posY + size / 2);
            }
        })
    }
}

function mouseClicked() {
    if (!menuOpen) {
        clickX = Math.floor(mouseX + camera.x - gameWidth / 2);
        clickY = Math.floor(mouseY + camera.y - gameHeight / 2 + 40);
        if (gameMode == "place") {
            //building
            gameMode = "move";
            gameStructures.forEach(struct => {
                if (struct["id"] == buildAnchor) {
                    if (buildSelection == "small") {
                        //island
                        newIsland = {
                            "size": 5,
                            "type": "small_island",
                            "x": clickX,
                            "y": clickY
                        }
                        //bridge
                        anchorMiddle = struct['size'] * 25;
                        buildMiddle = newIsland["size"] * 25;
                        newBridge = {
                            "startX": struct['x'] + anchorMiddle,
                            "startY": struct['y'] + anchorMiddle,
                            "endX": newIsland['x'] + buildMiddle,
                            "endY": newIsland['y'] + buildMiddle,
                            "style": "wood"
                        }
                    }
                    firebase.database().ref("catislands/saves/" + gameID + "/structures/").push(newIsland);
                    firebase.database().ref("catislands/saves/" + gameID + "/bridges/").push(newBridge);
                }
            })
        } else {
            //editing
            gameStructures.forEach(struct => {
                if (overlap(struct['x'], struct['y'], clickX, clickY, struct['size'] * 50)) {
                    if (gameMode == "edit") {
                        openStructure(struct);
                    } else if (gameMode == "build") {
                        buildMenu(struct['id']);
                    }else{
                        document.getElementById("selectionName").innerHTML = struct['type'];
                    }
                }
            });
        }
    }
}

function mouseDragged() {
    camera.x += (pmouseX - mouseX);
    camera.y += (pmouseY - mouseY);
}

function setMode(n) {
    if (n == 1) {
        gameMode = "build";
    } else if (n == 2) {
        gameMode = "edit";
    } else {
        gameMode = "move";
    }
}

function setBuild(n) {
    closeUi();
    if (n == 1) {
        buildSelection = "small";
        gameMode = "place";
    } else {
        buildSelection = "";
        gameMode = "move";
    }
}

function openStructure(data) {
    menuOpen = true;
    document.getElementById("islandUI").style.visibility = "visible";
    document.getElementById("islandName").innerHTML = data['type'];
}

function buildMenu(anchor) {
    menuOpen = true;
    buildAnchor = anchor;
    document.getElementById("buildUI").style.visibility = "visible";
}

function pauseGame() {
    menuOpen = true;
    document.getElementById("pause").style.visibility = "visible";
}

function closeUi() {
    for (i = 0; i < document.getElementsByClassName('ui').length; i++) {
        document.getElementsByClassName('ui').item(i).style.visibility = "hidden";
    }
    setTimeout(() => {
        menuOpen = false;
    }, 500);
}

function centerCamera() {
    camera.x = 150;
    camera.y = 150;
}

function toUser() {
    window.open("./login.html", "_blank");
}
