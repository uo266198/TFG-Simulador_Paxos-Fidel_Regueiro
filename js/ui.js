import {timerSim,  inicio, numNodos, setNumNodos, preparaPropuesta} from "./paxos.js"
import {Nodo} from "./nodos.js";

var svgNS = "http://www.w3.org/2000/svg"; 
 
//Distancia entre nodos y radio de los circulos
var nodoDist = 7;
var radio = 2;
var color = "rgb(57, 109, 242)";
var actual;


export var arrayNodos = [];

export function escribeLog(texto){
    $("#logText").append("["+timerSim.getTimeString()+"] " + texto+"<br/>");
}

export function openModalInfo(e){
    $("#modalInfo").modal('show');
    actual = this.dataset.key;
    $("#modalTitle").text("Información del nodo " + this.dataset.key);
    $("#modalEstado").text("ESTADO:       "+ arrayNodos[actual].estado);

    if(arrayNodos[actual].enUso){
        $('#btnSuspender').text("Suspender nodo");
        $('#btnSuspender').removeClass('btn-primary');
        $('#btnSuspender').addClass('btn-danger');
    }

    else{
        $('#btnSuspender').text("Reactivar");
        $('#btnSuspender').removeClass('btn-danger');
        $('#btnSuspender').addClass('btn-primary');
    }  
}

// Crea el polígono regular que forman los distintos nodos según el número de estos y por lo tanto la posición de cada nodo
export function creaPoligono(numNodos){
    var numNodos
    for (let i = 0; i <numNodos; i++){
        let posX = Math.cos(i * 2 * Math.PI / numNodos + Math.PI/2 - Math.PI/numNodos)*nodoDist;
        let posY = Math.sin(i * 2 * Math.PI / numNodos + Math.PI/2 - Math.PI/numNodos)*nodoDist;

        let circulo = document.createElementNS(svgNS,"circle");

        circulo.setAttributeNS(null,"id","nodo"+i);
        circulo.setAttributeNS(null,"cx",posX);
        circulo.setAttributeNS(null,"cy",posY);
        circulo.setAttributeNS(null,"r",radio);
        circulo.setAttributeNS(null,"fill",color);
        circulo.setAttributeNS(null,"stroke","none");
    
        //Añadimos un valor que distingue a cada nodo
        circulo.setAttribute("data-key", i);
    
        circulo.addEventListener("click", openModalInfo);
        document.getElementById("svgFrame").appendChild(circulo);

        // Instanciamos un Nodo y lo guardamos en el array de nodos para mantener una estructura donde guardar el estado para UI.
        let nodo = new Nodo(i, posX, posY);
        arrayNodos.push(nodo);

        dibujaNombres(i, posX, posY);
    }
}

// Dibuja los nombres de cada nodo (MAS ADELANTE EL VALOR DE CADA UNO)
function dibujaNombres(id, posX, posY){
        var textoSVG = document.createElementNS(svgNS,"text"); 
        textoSVG.setAttributeNS(null,"id","textoSVG");
        textoSVG.setAttributeNS(null,"x", posX);
        textoSVG.setAttributeNS(null,"y", posY - 0.9);
        textoSVG.setAttributeNS(null,"font-size",0.5);
        textoSVG.setAttributeNS(null,"text-anchor", "middle");
        textoSVG.setAttributeNS(null,"pointer-events","none");

        var texto = document.createTextNode("NODO "+id);
        
        textoSVG.appendChild(texto);
        document.getElementById("svgFrame").appendChild(textoSVG);   
}


//Abre el modal que muestra la información del nodo
function openModalInicio(){
    $("#modalInicio").modal('show');
}

function reanudaSim(){
    $("#btnPlay").attr('class', "btn btn-primary btn-lg ");
    $("#btnPlay").children('svg').children('path').attr('d', "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z");
    timerSim.reanudaTimer();
}

function pausaSim(){
    $("#btnPlay").attr('class', "btn btn-danger btn-lg ");
    $("#btnPlay").children('svg').children('path').attr('d', "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z");
    timerSim.pausaTimer();
}


//Elimina todos los nodos para volver a crearlos así como el texto que los acompaña
/*function borraNodos(){
    var list = document.getElementById("svgFrame");
    while (list.hasChildNodes()) {
      list.removeChild(list.firstChild);
    }
}*/





////////////////////////////////
////////// MANEJADORES ////////
//////////////////////////////

$("#btnSpeed").click(function(){
    if(timerSim.velocidad== 1000) {
        $("#btnSpeedText").text("x2");
        timerSim.velocidad = 500;
        
    }
    else if (timerSim.velocidad == 500){
        $("#btnSpeedText").text("x3");
        timerSim.velocidad = 333;
    }
    else {
        $("#btnSpeedText").text("x1");
        timerSim.velocidad = 1000;
    }

    pausaSim();
    reanudaSim();
});

//Para o continua la simulación
$("#btnPlay").click(function(){ 
    if(timerSim.pausado){
        reanudaSim();
    }  
    else{
        pausaSim();
    }
});


$("#btnProponer").click(function(){ 
    let nodo = arrayNodos[this.dataset.key];
    var propuesta = $("#textPropuesta").val();
    if(propuesta !=""){
        escribeLog("Nodo "+actual+" se prepara para proponer el valor:  \""+ propuesta+"\"");  
        preparaPropuesta(actual) ;
    }  
});

$("#btnAcepta").click(function(){  
    inicio();
});


$('.dropdown-inverse li > a').click(function(e){
    $('.status').text(this.innerHTML);
    setNumNodos($('.status').text());

});


//CAMBIAR
$('#btnSuspender').click(function(e){

    console.log("suspender");
    if(arrayNodos[actual].enUso){
        //arrayNodos[actual].desactivar();
        $('#btnSuspender').text("Reactivar");
        $('#btnSuspender').removeClass('btn-danger');
        $('#btnSuspender').addClass('btn-primary');
    }

    else{
        //listaNodos[actual].activar();
        $('#btnSuspender').text("Suspender nodo");
        $('#btnSuspender').removeClass('btn-primary');
        $('#btnSuspender').addClass('btn-danger');
    }
   
});

