var isMobile = /iPhone|Android|iPad/i.test(navigator.userAgent);

var user = localStorage.getItem("user");
var password = localStorage.getItem("password");
logged = false;

const firebaseConfig = {
  apiKey: "AIzaSyALeqVEk8nRUaaOjfZs8XPnMrLMH3rH-9I",
  authDomain: "cat-meooww-simplegames.firebaseapp.com",
  databaseURL: "https://cat-meooww-simplegames-default-rtdb.firebaseio.com",
  projectId: "cat-meooww-simplegames",
  storageBucket: "cat-meooww-simplegames.appspot.com",
  messagingSenderId: "326771151835",
  appId: "1:326771151835:web:f551cd3e7e98c6b5694dfe"
};
  
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function loadUserData() {
    if (user != undefined && password != undefined) {
        var userref = firebase.database().ref("catislands/users/" + user + "/status");
        var passref = firebase.database().ref("catislands/users/" + user + "/password");
        var isUserCreated;
        var isJoining = false;
        userref.on("value", data => {
            isUserCreated = data.val();
            console.log("logged: " + logged);
            if (!isJoining) {
                isJoining = true;
                if (isUserCreated == "online" || isUserCreated == "mod") {
                    passref.on("value", data => {
                        canPass = data.val();
                        if (canPass == password) {
                            logged = true;
                            userLogged();
                        }else{
                          userFallback();  
                        }
                    })
                }else{
                    userFallback();
                }
            }
        });
    }else{
        userFallback();
    }
    console.log("logged: " + logged);
}

function redirect(to){
  if(to == 1){
    window.location = "game.html";
  }else if(to == 2){
    window.location = "login.html";
  }else if(to == 3){
    window.location = "https://catmeooww.github.io/CatMeooww-GamingArea/";
  }else{
    window.location = "./";
  }
}

function openGame(id){
  window.location = "game.html?" + id;
}

function createGame(){
  saveName = document.getElementById("gamename").value;
  game = firebase.database().ref("catislands/saves/").push({
    data: {
      "name": saveName
    },
    structures: {
      "spawn":{'size':5,'type':'spawn','x':0,'y':0}
    }
  });
  saveID = game.key;
  firebase.database().ref("catislands/users/" + user + "/saves/"+saveID).update({
    name: saveName
  });
  document.getElementById("newgame").style.visibility = "hidden";
}