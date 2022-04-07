//Clase que regula la simulación

// De primeras dibujamos 3 nodos con sus respectivos botones, hay que mira cuál es el máximo de nodos posibles sin que sean demasiados.
// Luego se asignan los roles iniciales y se espera a que el usuario indique un proposer.
// Se lanza la fase de preparación

//Tenemos 3 nodos iniciales a la espera de que el usuario elija uno y un valor a proponer.
//Entonces comienza la simulación.

//Fase 0: simulación parada

let speed = 1000;
let timer;

let paused = true;
let started = false;

let mins = 0;
let secs = 0;

//Fase 1: preparación

//Fase 2: aceptación



























// Control del panel al clickar un nodo
var modal = document.getElementById("modalInfo");
var btn = document.getElementById("nodo1");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


//Cambio de velocidad de la simulación
$("#btnSpeed").click(function(){
    if(speed == 1000) {
        $("#btnSpeedText").text("x2");
        speed = 500;
        
    }
    else if (speed == 500){
        $("#btnSpeedText").text("x3");
        speed = 250;
    }
    else {
        $("#btnSpeedText").text("x1");
        speed = 1000;
    } 

    pauseTimer();
    resumeTimer();
});

//Para o continua la simulación
$("#btnPlay").click(function(){   
    if(paused == true)  {
        paused = false;
        if(started == false){
            timer = setInterval(startTime, speed);
            started = true;
        }
        else{
            resumeTimer();
        }
        $("#btnPlay").attr('class', "btn btn-primary btn-lg ");
        $("#btnPlay").children('svg').children('path').attr('d', "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z") 
        
    }
    else if(paused == false){
        pauseTimer();
        paused = true;
        $("#btnPlay").attr('class', "btn btn-danger btn-lg ");
        $("#btnPlay").children('svg').children('path').attr('d', "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z") 
    }
});


function startTime() {
    secs++; 
    var secsStr = secs;
    var minsStr = mins;

    if(decimas == 99){
        decimas = 0;
        secs ++;
    }
    if(secs == 60){
        secs = 0;
        mins ++;
    }

    if(secs <= 9){
        secsStr = "0" + secs;
    }
    if(mins <= 9){
        minsStr = "0" + mins;
    }

    document.getElementById('reloj').innerHTML = minsStr + ":" + secsStr;
}

function pauseTimer(){
    clearInterval(timer);
}


function resumeTimer(){
    timer = setInterval(startTime, speed);

}