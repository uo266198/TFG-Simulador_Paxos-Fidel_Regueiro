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

let mins = 0;
let secs = 0;

let numNodes = 3;
let radio = 0.8

var svgNS = "http://www.w3.org/2000/svg"; 

const colores = ["blue", "red", "green", "yellow", "pink", "black", "purple", "grey", "turquoise"]

createPolygon();





///////////////////////////////////////////////////////////////
///////////////////////---FUNCIONES---/////////////////////////
///////////////////////////////////////////////////////////////

function createNode(x, y, z, color)
{
    var myCircle = document.createElementNS(svgNS,"circle"); //to create a circle. for rectangle use "rectangle"
    myCircle.setAttributeNS(null,"id","mycircle");
    myCircle.setAttributeNS(null,"cx",x);
    myCircle.setAttributeNS(null,"cy",y);
    myCircle.setAttributeNS(null,"r",z);
    myCircle.setAttributeNS(null,"fill",color);
    myCircle.setAttributeNS(null,"stroke","none");

    document.getElementById("svgFrame").appendChild(myCircle);
} 

//Posicion de los nodos según cuantos haya

// Crea el polígono regular según el número de nodos
function createPolygon(){
    for (var i = 0; i <numNodes; i++){
        var posX = Math.cos(i * 2 * Math.PI / numNodes + Math.PI/2 - Math.PI/numNodes);
        console.log("X: " + posX*5);
        var posY = Math.sin(i * 2 * Math.PI / numNodes + Math.PI/2 - Math.PI/numNodes);
        console.log("Y: " + posY*5);

        createNode(posX*4,posY*4, radio, colores[i]);
    }
}

//Elimina todos los nodos para volver a crearlos
function removeNodes(){
    const list = document.getElementById("svgFrame");
    while (list.hasChildNodes()) {
      list.removeChild(list.firstChild);
    }
}


//Inicia el reloj de la simulación y controla el valor por pantalla.
function startTime() {
    secs++; 
    var secsStr = secs;
    var minsStr = mins;
    
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
    paused = true;
    $("#btnPlay").attr('class', "btn btn-danger btn-lg ");
    $("#btnPlay").children('svg').children('path').attr('d', "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z");
    clearInterval(timer);  
}


function resumeTimer(){
    paused = false; 
    $("#btnPlay").attr('class', "btn btn-primary btn-lg ");
    $("#btnPlay").children('svg').children('path').attr('d', "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z");
    timer = setInterval(startTime, speed);
}
//Fase 1: preparación

//Fase 2: aceptación








///////////////////////////////////////////////////////////////
///////////////////////---CONTROL DE UI---/////////////////////
///////////////////////////////////////////////////////////////

// Control del panel al clickar un nodo
/*var modal = document.getElementById("modalInfo");
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
}*/



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
    if(paused){
        resumeTimer();
    }  
    else{
        pauseTimer();
    }
});


$("#btnAdd").click(function(){ 
    numNodes++
    if(numNodes > 9){
        numNodes = 3;
    }
    removeNodes();
    createPolygon();
});