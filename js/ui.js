import {timerSim,  inicio, numNodos, setNumNodos, nodos, liderPropone} from "./paxos.js"
import {Nodo} from "./nodos.js";

var svgNS = "http://www.w3.org/2000/svg"; 
 
//Distancia entre nodos y radio de los circulos
var nodoDist = 7;
var radio = 2;
var colorNodos = "rgb(57, 109, 242)";
var colorNodosAnim = "rgb(255, 255, 0)"
var actual;

function escribeLog(texto){
    $("#logText").append("["+timerSim.getTimeString()+"] " + texto+"<br/>");
}

function openModalInfo(e){
    $("#modalInfo").modal('show');
    actual = this.dataset.key;
    $("#modalTitle").text("Información del nodo " + this.dataset.key);
    $("#modalEstado").text("Estado actual:       "+ nodos[actual].estado);

    $("#modalPausado").text("Pausado/Caído:       "+ nodos[actual].pausado);
    $("#modalPrometido").text("Comprometido con un proponente:       "+ nodos[actual].prometido);
    $("#modalValor").text("Valor aceptado:       "+ nodos[actual].valorPropuesto);
    $("#modalRonda").text("Ronda más alta recibida:       "+ nodos[actual].ronda);

    if(nodos[actual].pausado){
        $('#btnSuspender').text("Reactivar");
        $('#btnSuspender').removeClass('btn-danger');
        $('#btnSuspender').addClass('btn-primary');
    }

    else{       
        $('#btnSuspender').text("Suspender nodo");
        $('#btnSuspender').removeClass('btn-primary');
        $('#btnSuspender').addClass('btn-danger');
    }  
}

// Crea el polígono regular que forman los distintos nodos según el número de estos y por lo tanto la posición de cada nodo
function creaPoligono(numNodos){
    var numNodos
    for (let i = 0; i <numNodos; i++){
        let posX = Math.cos(i * 2 * Math.PI / numNodos + Math.PI/2 - Math.PI/numNodos)*nodoDist;
        let posY = Math.sin(i * 2 * Math.PI / numNodos + Math.PI/2 - Math.PI/numNodos)*nodoDist;

        let circulo = document.createElementNS(svgNS,"circle");

        circulo.setAttribute("id","nodo"+i);
        circulo.setAttribute("cx",posX);
        circulo.setAttribute("cy",posY);
        circulo.setAttribute("r",radio);
        circulo.setAttribute("fill",colorNodos);
        circulo.setAttribute("stroke","none");
    
        //Añadimos un valor que distingue a cada nodo
        circulo.setAttribute("data-key", i);
        circulo.addEventListener("click", openModalInfo);
        document.getElementById("svgFrame").appendChild(circulo);

        dibujaNombres(i, posX, posY);


       

    }   
}

//Crea el circulo que representa el envío de datos
function creaCirculoAnim(og, dest, tipo){
    var datos = [];
   

    //Nodos de origen y destino
    let nodoOg = document.getElementById("nodo"+og); 
    let nodoDest = document.getElementById("nodo"+dest); 
    
        //Posición de los nodos
    let posxOg = nodoOg.getAttribute("cx");
    let posyOg= nodoOg.getAttribute("cy");

    let posxDest = nodoDest.getAttribute("cx");
    let posyDest= nodoDest.getAttribute("cy");
    
        //Circulos que usaremos en las animaciones de datos.
    let circuloAnim = document.createElementNS(svgNS,"circle");
    circuloAnim.setAttribute("id","nodoAnim"+og);
    circuloAnim.setAttribute("cx",posxOg);
    circuloAnim.setAttribute("cy",posyOg);
    circuloAnim.setAttribute("r",2/4);
    circuloAnim.setAttribute("fill","yellow");
    circuloAnim.setAttribute("stroke","none");
    circuloAnim.setAttribute("opacity",1);
    circuloAnim.setAttribute("pointer-events","none");

    document.getElementById("svgFrame").appendChild(circuloAnim);
        
    


    datos[0] = [posxOg, posyOg];
    datos[1] = [posxDest, posyDest];
    datos[2] = circuloAnim;
    
    return datos;
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
    $("#btnPlay").attr('class', "btn btn-primary btn-sm ");
    $("#btnPlay").children('svg').children('path').attr('d', "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z");
    timerSim.reanudaTimer();
}

function pausaSim(){
    $("#btnPlay").attr('class', "btn btn-danger btn-sm ");
    $("#btnPlay").children('svg').children('path').attr('d', "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z");
    timerSim.pausaTimer();
}



function desactivarNodo(id){
    //Cambia el color
    $("#nodo"+id).css("fill","grey");
    nodos[actual].pausado = true;
    $("#modalPausado").text("Pausado/Caído:       "+ nodos[actual].pausado);

}

function activarNodo(id){
    //Cambia el color
    $("#nodo"+id).css("fill",colorNodos);
    nodos[actual].pausado = false;
    $("#modalPausado").text("Pausado/Caído:       "+ nodos[actual].pausado);
}

function setAceptador(id){
    //Cambia el color
    $("#nodo"+id).css("fill","cyan");
}

function setConsenso(id){
    //Cambia el color
    $("#nodo"+id).css("fill","green");
    nodos[id].estado = "APRENDIZ-CONSENSO";
}

function setLider(id){
    $("#nodo"+id).css("fill", "yellow");
    nodos[id].estado = "LIDER";
    
}


///////////////////////////////
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
    var propuesta = $("#textPropuesta").val();
    if(propuesta !=""){
        escribeLog("Nodo "+actual+" se prepara para proponer el valor:  \""+ propuesta+"\"");  
        liderPropone(actual, propuesta);
    }  
});

$("#btnAcepta").click(function(){  
    let auto = $("#checkBoxAuto").is(':checked');
    inicio(auto);
});


$('.dropdown-inverse li > a').click(function(e){
    $('.status').text(this.innerHTML);
    setNumNodos($('.status').text());

});


$(document).on('input', '#sliderCaida', function() {
    $('#probCaida').html( "Probabilidad de fallo de un nodo: " + $(this).val() + "%" );
});

$(document).on('input', '#sliderPerdida', function() {
    $('#probPerdida').html( "Probabilidad de pérdida de paquetes: " + $(this).val() + "%" );
});

$('#btnSuspender').click(function(e){
    if(nodos[actual].pausado){
        activarNodo(actual);
        console.log("Nodo "+actual+" activado");
        $('#btnSuspender').text("Suspender nodo");
        $('#btnSuspender').removeClass('btn-primary');
        $('#btnSuspender').addClass('btn-danger');
    }

    else{
        desactivarNodo(actual);
        console.log("Nodo "+actual+" desactivado");
        $('#btnSuspender').text("Reactivar");
        $('#btnSuspender').removeClass('btn-danger');
        $('#btnSuspender').addClass('btn-primary');
    }
   
});


export{escribeLog, openModalInfo, openModalInicio, pausaSim, reanudaSim, creaPoligono, setLider, setAceptador, setConsenso, creaCirculoAnim}