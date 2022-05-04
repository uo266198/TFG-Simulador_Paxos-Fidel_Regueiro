import Timer from './timer.js';

//Clase que regula la simulación

// De primeras dibujamos 3 nodos con sus respectivos botones, hay que mira cuál es el máximo de nodos posibles sin que sean demasiados.
// Luego se asignan los roles iniciales y se espera a que el usuario indique un proposer.
// Se lanza la fase de preparación

//Tenemos 3 nodos iniciales a la espera de que el usuario elija uno y un valor a proponer.
//Entonces comienza la simulación.

//Fase 0: simulación parada

let speed = 1000;

let timerSim = new Timer(speed, true);

let nodeDist = 7;
let radio = 2;
let numNodes = 3;
const maxNodes = 9;

var svgNS = "http://www.w3.org/2000/svg"; 

let color = "rgb(57, 109, 242)";

let arrayEvent = [];


//Lista de nodosconsideramos que el máximo de nodos es 9
// posiciones iniciales a 0, si están siendo usadas o no, es indicado por la función que controla los nodos en UI
var listNodes =[
    {id: 0, x: 0, y: 0, used: false},
    {id: 1, x: 0, y: 0, used: false},
    {id: 2, x: 0, y: 0, used: false},
    {id: 3, x: 0, y: 0, used: false},
    {id: 4, x: 0, y: 0, used: false},
    {id: 5, x: 0, y: 0, used: false},
    {id: 6, x: 0, y: 0, used: false},
    {id: 7, x: 0, y: 0, used: false},
    {id: 8, x: 0, y: 0, used: false}
];

createPolygon();

///////////////////////////////////////////////////////////////
///////////////////////---FUNCIONES---/////////////////////////
///////////////////////////////////////////////////////////////


// Crea un nodo en las coordenadas indicadas (x, y) y el radio (r), junto a su color
function createNode(x, y, r, color, id)
{
    var circulo = document.createElementNS(svgNS,"circle");
    circulo.setAttributeNS(null,"id","nodo");
    circulo.setAttributeNS(null,"cx",x);
    circulo.setAttributeNS(null,"cy",y);
    circulo.setAttributeNS(null,"r",r);
    circulo.setAttributeNS(null,"fill",color);
    circulo.setAttributeNS(null,"stroke","none");

    //Añadimos un valor que distingue a cada nodo
    circulo.setAttribute("data-key", id);

    //CAMBIAR
    circulo.addEventListener("click", openModal);

    document.getElementById("svgFrame").appendChild(circulo);
} 


// Crea el polígono regular que forman los distintos nodos según el número de estos y por lo tanto la posición de cada nodo
function createPolygon(){
    for (var i = 0; i <numNodes; i++){
        var posX = Math.cos(i * 2 * Math.PI / numNodes + Math.PI/2 - Math.PI/numNodes)*nodeDist;
        var posY = Math.sin(i * 2 * Math.PI / numNodes + Math.PI/2 - Math.PI/numNodes)*nodeDist;

        //Posición del nodo
        listNodes[i].x =posX;
        listNodes[i].y =posY;
        listNodes[i].used = true;

        createNode(posX,posY, radio, color, i);
    }
    drawInfo();
}

// Dibuja los nombres de cada nodo
function drawInfo(){
    for(let i=0; i<listNodes.length; i++){
        if(listNodes[i].used == true){
            var textoSVG = document.createElementNS(svgNS,"text"); 
            textoSVG.setAttributeNS(null,"id","textoSVG");
            textoSVG.setAttributeNS(null,"x", listNodes[i].x);
            textoSVG.setAttributeNS(null,"y", listNodes[i].y - 0.9);
            textoSVG.setAttributeNS(null,"font-size",0.5);
            textoSVG.setAttributeNS(null,"text-anchor", "middle");
            textoSVG.setAttributeNS(null,"pointer-events","none");

            var texto = document.createTextNode("NODO "+i);
            textoSVG.appendChild(texto);
            document.getElementById("svgFrame").appendChild(textoSVG);

            console.log(listNodes[i]);
        }      
    }
}

//Elimina todos los nodos para volver a crearlos así como el texto que los acompaña
function removeNodes(){
    var list = document.getElementById("svgFrame");
    while (list.hasChildNodes()) {
      list.removeChild(list.firstChild);
    }

    //Si el nodo está por encima de los actuales, "no existe"  y no se puede mostrar su información
    for(var i=numNodes-1; i<maxNodes; i++){
        listNodes[i].used = false;
    }

}


//Abre el modal que muestra la información del nodo
function openModal(e){
    //console.log(this.dataset.key);
    $("#modalInfo").modal('show');
    $("#modalTitle").text("Información del nodo " + this.dataset.key);



}

function resumeSim(){
    $("#btnPlay").attr('class', "btn btn-primary btn-lg ");
    $("#btnPlay").children('svg').children('path').attr('d', "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z");
    //console.log(timerSim.mins);
    timerSim.resumeTimer();
}

function pauseSim(){
    $("#btnPlay").attr('class', "btn btn-danger btn-lg ");
    $("#btnPlay").children('svg').children('path').attr('d', "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z");
    timerSim.pauseTimer();
}


//Fase 1: preparación

//Fase 2: aceptación





///////////////////////////////////////////////////////////////
///////////////////////---CONTROL DE UI---/////////////////////
///////////////////////////////////////////////////////////////


//Cambio de velocidad de la simulación
$("#btnSpeed").click(function(){
    if(timerSim.speed == 1000) {
        $("#btnSpeedText").text("x2");
        timerSim.speed = 500;
        
    }
    else if (timerSim.speed == 500){
        $("#btnSpeedText").text("x3");
        timerSim.speed = 333;
    }
    else {
        $("#btnSpeedText").text("x1");
        timerSim.speed = 1000;
    }

    pauseSim();
    resumeSim();
});

//Para o continua la simulación
$("#btnPlay").click(function(){ 
    if(timerSim.paused){
        //resumeTimer();
        resumeSim();
    }  
    else{
        //pauseTimer();
        pauseSim();
    }
});

//Añade un nuevo nodo
$("#btnAdd").click(function(){ 
    numNodes++
    if(numNodes > maxNodes){
        numNodes = 3;
    }
    removeNodes();
    createPolygon();
});
