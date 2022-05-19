import Timer from './timer.js';
import enviaMensaje from './gestionaEventos.js'
import Nodo from './nodos.js'
import {Prepara, Promesa, Acepta, Aceptado} from './mensaje.js';

//Clase que regula la simulación

let velocidad = 1000;
let timerSim = new Timer(velocidad, true);
let nodoDist = 7;
let radio = 2;
let numNodos = 3;
const MAX_NODOS = 9;
var svgNS = "http://www.w3.org/2000/svg"; 
let color = "rgb(57, 109, 242)";
let nodoActual;
const listaNodos = [];

let started = false;


//Abrimos el modal de opciones iniciales de la sim
openModalInicio();

///////////////////////////////////////////////////////////////
///////////////////////---FUNCIONES---/////////////////////////
///////////////////////////////////////////////////////////////

function inicio(){
    escribeLog("Esperando una propuesta.");
    escribeLog("Si no, un nodo se propondrá como lider automáticamente. ");
    createPolygon();
    reanudaSim();

    
}

// Crea un nodo en las coordenadas indicadas (x, y) y el radio (r)
function creaNodos(x, y, r, color, id)
{
    var circulo = document.createElementNS(svgNS,"circle");
    circulo.setAttributeNS(null,"id","nodo"+id);
    circulo.setAttributeNS(null,"cx",x);
    circulo.setAttributeNS(null,"cy",y);
    circulo.setAttributeNS(null,"r",r);
    circulo.setAttributeNS(null,"fill",color);
    circulo.setAttributeNS(null,"stroke","none");

    //Añadimos un valor que distingue a cada nodo
    circulo.setAttribute("data-key", id);

    //CAMBIAR
    circulo.addEventListener("click", openModalInfo);

    document.getElementById("svgFrame").appendChild(circulo);
} 


// Crea el polígono regular que forman los distintos nodos según el número de estos y por lo tanto la posición de cada nodo
function createPolygon(){
    for (let i = 0; i <numNodos; i++){
        let posX = Math.cos(i * 2 * Math.PI / numNodos + Math.PI/2 - Math.PI/numNodos)*nodoDist;
        let posY = Math.sin(i * 2 * Math.PI / numNodos + Math.PI/2 - Math.PI/numNodos)*nodoDist;
        listaNodos.push(new Nodo(i, posX, posY))
        creaNodos(posX,posY, radio, color, i);
    }
    infoNodos();
}

// Dibuja los nombres de cada nodo
function infoNodos(){
    for(let i=0; i<listaNodos.length; i++){
        var textoSVG = document.createElementNS(svgNS,"text"); 
        textoSVG.setAttributeNS(null,"id","textoSVG");
        textoSVG.setAttributeNS(null,"x", listaNodos[i].x);
        textoSVG.setAttributeNS(null,"y", listaNodos[i].y - 0.9);
        textoSVG.setAttributeNS(null,"font-size",0.5);
        textoSVG.setAttributeNS(null,"text-anchor", "middle");
        textoSVG.setAttributeNS(null,"pointer-events","none");

        var texto = document.createTextNode("NODO "+i);
        
        textoSVG.appendChild(texto);
        document.getElementById("svgFrame").appendChild(textoSVG);

        //Referencia aquí, y no al crear el nodo
        listaNodos[i].ref = $("#nodo"+i);
    }    
}

//Elimina todos los nodos para volver a crearlos así como el texto que los acompaña
function borraNodos(){
    var list = document.getElementById("svgFrame");
    while (list.hasChildNodes()) {
      list.removeChild(list.firstChild);
    }
}

function escribeLog(texto){
    $("#logText").append("["+timerSim.getTimeString()+"] " + texto+"<br/>");
}

//Abre el modal que muestra la información del nodo
function openModalInfo(e){
    $("#modalInfo").modal('show');
    nodoActual = this.dataset.key;
    $("#modalTitle").text("Información del nodo " + this.dataset.key);
    $("#modalEstado").text("ESTADO:       "+ listaNodos[nodoActual].estado);

    if(listaNodos[nodoActual].enUso){
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

export function getListaNodos(){
    return listaNodos;
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






///////////////////////////////////////////////////////////////
///////////////////////---CONTROL DE UI---/////////////////////
///////////////////////////////////////////////////////////////


//Cambio de velocidad de la simulación
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


//////////////////
// TAL VEZ SOBRA// 
/////////////////

//Añade un nuevo nodo
/*$("#btnAdd").click(function(){ 
    numNodos++
    if(numNodos > MAX_NODOS){
        numNodos = 3;
    }
    borraNodos();
    createPolygon();
});*/


$("#btnProponer").click(function(){ 
    //listaNodos[nodoActual].setEstado("Proponente");
    let nodo = listaNodos[nodoActual];
    var propuesta = $("#textPropuesta").val();
    if(propuesta !=""){
        escribeLog("Nodo "+nodoActual+" se prepara para proponer el valor:  \""+ propuesta+"\"");


        //?
        nodo.setProponente();

        let msg = new Prepara(nodo.id, 0);
        enviaMensaje(msg);
    }  
});


$("#btnAcepta").click(function(){ 
    $("#modalInicio").modal('hide');
    inicio();
});


$('.dropdown-inverse li > a').click(function(e){
    $('.status').text(this.innerHTML);
    numNodos =  $('.status').text();

});


$('#btnSuspender').click(function(e){
    if(listaNodos[nodoActual].enUso){
        listaNodos[nodoActual].desactivar();
        $('#btnSuspender').text("Reactivar");
        $('#btnSuspender').removeClass('btn-danger');
        $('#btnSuspender').addClass('btn-primary');
    }

    else{
        listaNodos[nodoActual].activar();
        $('#btnSuspender').text("Suspender nodo");
        $('#btnSuspender').removeClass('btn-primary');
        $('#btnSuspender').addClass('btn-danger');
    }
   
});



export default{
    escribeLog
}