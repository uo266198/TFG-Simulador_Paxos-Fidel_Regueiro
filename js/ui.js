import {timerSim,  inicio, setNumNodos, nodos, red1, red2, hayParticion, setParticion, simPaused, setSimPaused, modoAuto, setVelocidad, probFalloNodo, probFalloRed, setProbFalloNodo,
        setProbFalloRed, timersInternos, rondaGlobal, numCaidas, numLideres, mensajesPerdidos, mensajesTotales } from "./paxos.js"

var svgNS = "http://www.w3.org/2000/svg"; 
 
var nodoDist = 7;
var radio = 2;
var colorNodos = "rgb(57, 109, 242)";
var actual;

var numNodos;

//?
var timerCaidaEnUso = false;


// Tipo de mensajes
function escribeLog(tipoMsg, og, dst, msg){
    if(tipoMsg == 0){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "recibe " +  "<a style=\"color:cyan\"> " +"["+ msg +"] " + "<a style=\"color:white\">" +" desde " + "<a style=\"color:green\"> " + "[" + dst + "]"+"</br>");
    }
    else if(tipoMsg == 1){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "ha llegado al quorum de aceptados. " +"</br>");
    }
    else if(tipoMsg == 2){
      $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "quorum de mensajes, consenso. " + "</br>");
    }
    else if(tipoMsg == 3){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "se pierde el paquete con destino " + "<a style=\"color:green\"> " + "[" + dst + "]"+"</br>");
    }
    else if(tipoMsg == 4){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "está desactivado. " + "</br>");
    }
    else if(tipoMsg == 5){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "se ha vuelto a activar. " + "</br>");
    }
    else if(tipoMsg == 6){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "se ha vuelto a activar. " + "</br>");
    }
    else if(tipoMsg == 7){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "se propone como líder. " + "</br>");
    }
    else if(tipoMsg == 8){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "se propone como líder al expirar el temporizador interno. " + "</br>");
    }
    else if(tipoMsg == 9){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
        "vuelve a proponerse al expirar el temporizador interno. " + "</br>");
    }
    else if(tipoMsg == 10){
        $("#logText").append("<div style=\"color:yellow\">"+"["+timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " +"TODOS LOS NODOS HAN LLEGADO AL CONSENSO" + "<a style=\"color:white\">" + 
        "</br>");
    }
    else if(tipoMsg == -1){
        $("#logText").append(msg+"</br>");
    }
}

function openModalInfo(e){
    
    actual = this.dataset.key;

    $("#modalTitle").text("Información del nodo " + this.dataset.key);
    $("#modalEstado").text("Estado actual:       "+ nodos[actual].estado);
    $("#modalRonda").text("Ronda más alta recibida:       "+ nodos[actual].ronda);

    if (nodos[actual].estado == "LIDER"){
        $("#modalPausado").text("Pausado/Caído:       "+ nodos[actual].pausado);
        $("#modalPausado").text("");
        $("#modalPrometido").text("");
        $("#modalValor").text("Valor propuesto:       "+ nodos[actual].valorPropuesto);  
    }   

    else{     
        $("#modalPausado").text("Pausado/Caído:       "+ nodos[actual].pausado);
        $("#modalPrometido").text("Comprometido con un proponente:       "+ nodos[actual].aceptado);
        $("#modalValor").text("Valor aceptado:       "+ nodos[actual].valorPropuesto);  
    }
    
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

    if(modoAuto){
        $('#btnSuspender').prop("disabled", true)
    }

    $("#modalInfo").modal('show');
}

// Crea el polígono regular que forman los distintos nodos según el número de estos y por lo tanto la posición de cada nodo.
// También crea el círculo exterior que representa el tiempo que cada nodo tarda en procesar los mensajes.
function creaPoligono(nNodos){
    numNodos = nNodos;
    for (let i = 0; i <numNodos; i++){
        let posX = Math.cos(i * 2 * Math.PI / numNodos + Math.PI/2 - Math.PI/numNodos)*nodoDist;
        let posY = Math.sin(i * 2 * Math.PI / numNodos + Math.PI/2 - Math.PI/numNodos)*nodoDist;

        //Circulo de progreso
        let circuloProgreso =  document.createElementNS(svgNS,"circle");
        circuloProgreso.setAttribute("id","progreso"+i);
        circuloProgreso.setAttribute("class","circuloProgreso");
        circuloProgreso.setAttribute("cx",posX);
        circuloProgreso.setAttribute("cy",posY);
        circuloProgreso.setAttribute("r",radio+(radio/15));
        circuloProgreso.setAttribute("stroke-width",(radio)/8);
 
        document.getElementById("svgFrame").appendChild(circuloProgreso);

        let circulo = document.createElementNS(svgNS,"circle");
        circulo.setAttribute("id","nodo"+i);
        circulo.setAttribute("cx",posX);
        circulo.setAttribute("cy",posY);
        circulo.setAttribute("r",radio);
        circulo.setAttribute("fill",colorNodos);
    
        //Añadimos un valor que distingue a cada nodo
        circulo.setAttribute("data-key", i);
        circulo.addEventListener("click", openModalInfo);
        document.getElementById("svgFrame").appendChild(circulo);



        dibujaNombres(i, posX, posY); 
    }   
}

//Crea el circulo que representa el envío de datos
function creaCirculoAnim(og, dest, tipo, ronda, valor){
    var datos = [];
   
    //Nodos de origen y destino
    let nodoOg = document.getElementById("nodo"+og); 
    let nodoDest = document.getElementById("nodo"+dest); 
    
    //Posición de los nodos
    let posxOg = nodoOg.getAttribute("cx");
    let posyOg = nodoOg.getAttribute("cy");

    let posxDest = nodoDest.getAttribute("cx");
    let posyDest = nodoDest.getAttribute("cy");
    
    //Circulos que usaremos en las animaciones de datos.
    let circuloAnim = document.createElementNS(svgNS,"circle");
    circuloAnim.setAttribute("id","nodoAnim"+og);
    circuloAnim.setAttribute("cx",posxOg);
    circuloAnim.setAttribute("cy",posyOg);
    circuloAnim.setAttribute("r",radio/4);


    //Tooltip
    circuloAnim.setAttribute("data-toggle","tooltip")
    circuloAnim.setAttribute("data-placement","left")
    circuloAnim.setAttribute("data-html","true")
    circuloAnim.setAttribute("title","<p> Mensaje: "+tipo+"</p><p> Origen: "+og+"</p><p> Destino: "+dest+"</p><p> Ronda: "+ronda+"</p><p> Valor: "+valor+"</p>");
    

    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });


    //El color cambia por el tipo de mensaje
    if(tipo == "PREPARA" ){
        circuloAnim.setAttribute("fill","yellow");
    }
    else if (tipo == "ACEPTAR"){
        circuloAnim.setAttribute("fill","blue");
    }
    else if(tipo == "PERDIDO"){
        circuloAnim.setAttribute("fill","red");
    }
    else if(tipo == "ACEPTADO"){
        circuloAnim.setAttribute("fill","GoldenRod");
    }
    else {
        circuloAnim.setAttribute("fill","green");
    }
    

    document.getElementById("svgFrame").appendChild(circuloAnim);
        
    datos[0] = [posxOg, posyOg];
    datos[1] = [posxDest, posyDest];
    datos[2] = circuloAnim;
    
    return datos;
}


// Dibuja los nombres de cada nodo
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

//Dibuja el texto en cada nodo que lo sitúa en una red distinta, la primera mitad, la mayor la 0 y los demás la particion 1.
function generaParticion(){

    let nodosParticion = Math.floor(numNodos/2)+1;
    setParticion(true);

    //borramos todos los nodos registrados en las redes
    red1.borrar_nodos();
    red2.borrar_nodos();

    for(let i=0 ; i<nodos.length; i++){
        let circ = document.getElementById("nodo"+i);

        let textoPart = document.createElementNS(svgNS,"text"); 
        textoPart.setAttributeNS(null,"id","textoParticion"+i);
        textoPart.setAttributeNS(null,"x", circ.getAttribute("cx"));
        textoPart.setAttributeNS(null,"y", parseFloat(circ.getAttribute("cy")) + 0.9);
        textoPart.setAttributeNS(null,"font-size",1.2);
        textoPart.setAttributeNS(null,"text-anchor", "middle");
        textoPart.setAttributeNS(null,"pointer-events","none");

        let part;

        if(i<nodosParticion){
            red1.registrar_nodo(nodos[i]);
            part = 0;
        }

        else {
            red2.registrar_nodo(nodos[i]);
            part = 1;
        }

        let texto = document.createTextNode("P"+part);
        textoPart.appendChild(texto);
        document.getElementById("svgFrame").appendChild(textoPart); 
    }

    /*console.log("red1")
    console.log(red1.nodos_registrados)
    console.log("red2")
    console.log(red2.nodos_registrados)*/
}

//Devuelve todos los nodos a la misma red y borra las particiones
function eliminaParticion(){
    setParticion(false);
    red1.borrar_nodos();
    red2.borrar_nodos();

    for(let i=0 ; i<nodos.length; i++){
        red1.registrar_nodo(nodos[i]);
        let txt =  document.getElementById("textoParticion"+i);
        txt.remove();
    }
}

//muestra la información del nodo
function openModalInicio(){
    $("#modalInicio").modal('show');
}

function reanudaSim(){
    $("#btnPlay").attr('class', "btn btn-primary btn-sm ");
    $("#btnPlay").children('svg').children('path').attr('d', "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z");

    if(simPaused){
        for(let i=0; i<nodos.length; i++){
            if(typeof nodos[i].waitAnim !== "undefined"){
                nodos[i].waitAnim.play();
            }
            if(typeof nodos[i].red.animacionesRed.length != 0){
                for(let j=0; j<nodos[i].red.animacionesRed.length; j++){
                    nodos[i].red.animacionesRed[j].play();
                }
            }  
        } 
    }

    //for(let i=0; i<timersInternos.length; i++){  
        //if(timersInternos[i].pausado == true) timersInternos[i].resumeTimerInterno();    
    //}

    setSimPaused(false);
    timerSim.reanudaTimer();
}

function pausaSim(){
    $("#btnPlay").attr('class', "btn btn-danger btn-sm ");
    $("#btnPlay").children('svg').children('path').attr('d', "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z");
     
    if(!simPaused){
        for(let i=0; i<nodos.length; i++){
            if(typeof nodos[i].waitAnim !== "undefined"){
                nodos[i].waitAnim.pause();   
            } 
            if(typeof nodos[i].red.animacionesRed.length != 0){
                for(let j=0; j<nodos[i].red.animacionesRed.length; j++){
                    nodos[i].red.animacionesRed[j].pause();
                }
            }         
        }
    }

   /* for(let i=0; i<timersInternos.length; i++){  
        if(!timersInternos[i].pausado) timersInternos[i].pausaTimerInterno();
    }*/

    setSimPaused(true);
    timerSim.pausaTimer();
}

function desactivarNodo(id){
    //Cambia el color
    $("#nodo"+id).css("fill","grey");
    nodos[id].pausado = true;
    $("#modalPausado").text("Pausado/Caído:       "+ nodos[id].pausado);
    escribeLog(4, id)
}

function activarNodo(id){
    //Cambia el color
    if(nodos[id].estado == "ACEPTADOR" && nodos[id].ronda != -1) $("#nodo"+id).css("fill","cyan");
    else if(nodos[id].estado == "LIDER") $("#nodo"+id).css("fill","yellow");
    else $("#nodo"+id).css("fill",colorNodos);
    
    nodos[id].pausado = false;
    escribeLog(5, id)
} 
 
function setAceptador(id){ 
    //Cambia el color 
    $("#nodo"+id).css("fill","cyan");
    nodos[id].estado = "ACEPTADOR";
}

function setConsenso(id){
    //Cambia el color
    $("#nodo"+id).css("fill","green");
    nodos[id].consenso = true;
    nodos[id].aceptado = false;
    nodos[id].contadorAceptadores = 1;
    nodos[id].contadorAceptado = 1;
    
}
function statsFinales(){
    $("#finTiempo").append("Tiempo final de la simulación: <b>"+ timerSim.getTimeString()+"</b>");
    $("#finNumRondas").append("Última ronda: <b>"+ rondaGlobal+"</b>");
    $("#finNumCaidas").append("Número de caídas de nodos: <b>"+ numCaidas+"</b>");
    $("#finNumMsg").append("Número de mensajes enviados: <b>"+ mensajesTotales+"</b>");
    $("#finNumMsgPerdidos").append("Número de mensajes perdidos: <b>"+ mensajesPerdidos+"</b>");
    let porcentaje = mensajesTotales/(mensajesPerdidos*100)*100;
    $("#finPercentMsg").append("Porcentaje de mensajes perdidos: <b>"+porcentaje+"%</b>");
    $("#finNumLideres").append("Número de líderes propuestos: <b>"+ numLideres+"</b>");
}

function setLider(id){
    $("#nodo"+id).css("fill", "yellow");
    if(!modoAuto) escribeLog(7,id);
    nodos[id].estado = "LIDER";
}

function desactivaBotonesAuto(){
    setProbFalloNodo(20);
    setProbFalloRed(12);

    $('#probCaida').html( "Probabilidad de fallo de un nodo: " + probFalloNodo + "%" );
    $('#probPerdida').html( "Probabilidad de pérdida de paquetes: " +  probFalloRed  + "%" );

    document.getElementById("sliderPerdida").disabled = true;
    document.getElementById("sliderCaida").disabled = true;

    $("#btnPartir").attr('disabled', 'disabled');
    $("#btnProponer").attr('disabled', 'disabled');
}

function desactivaBotonesFin(){
    $("#btnPartir").attr('disabled', 'disabled');
    $("#btnProponer").attr('disabled', 'disabled');
    document.getElementById("sliderPerdida").disabled = true;
    document.getElementById("sliderCaida").disabled = true;
    $("#btnPlay").attr('disabled', 'disabled');
    $("#btnSpeed").attr('disabled', 'disabled');


}

function openModalEstadisticas(){
    $("#modalEstadisticas").modal('show');
}
///////////////////////////////
////////// MANEJADORES ////////
//////////////////////////////

$("#btnSpeed").click(function(){
    if(timerSim.velocidad == 1000) {
        $("#btnSpeedText").text("x2");
        setVelocidad(500);
        timerSim.velocidad = 500;
    }
    else if (timerSim.velocidad == 500){
        $("#btnSpeedText").text("x3");
        setVelocidad(250);
        timerSim.velocidad = 250;

       
    }
    else {
        $("#btnSpeedText").text("x1");
        setVelocidad(1000);
        timerSim.velocidad = 1000;
    }

    //pausaSim();
    //reanudaSim();
});

//Para o continua la simulación
$("#btnPlay").click(function(){ 
    if(simPaused){
        reanudaSim();
    }  
    else{
        pausaSim();
    }
});

$("#btnReset").click(function(){ 
    location.reload();
});

//Particion
$("#btnPartir").click(function(){ 
    if(hayParticion) eliminaParticion();
    else generaParticion();
});

$("#btnProponer").click(function(){ 
    var propuesta = $("#textPropuesta").val();
    var nuevaRonda = $("#textRonda").val();
    if(propuesta !="" && nuevaRonda !=""){
        escribeLog("Nodo "+actual+" se prepara para proponer el valor:  \""+ propuesta+ " "+nuevaRonda+"\"");  
        nodos[actual].liderPropone(propuesta,nuevaRonda);
    }  
});

$("#btnAcepta").click(function(){  
    let auto = $("#flexRadioDefault2").is(':checked');
    inicio(auto);
});

$("#btnVolverFin").click(function(){  
    $("#modalEstadisticas").modal('hide');
});

$("#btnResetFin").click(function(){  
    location.reload();
});

$("#btnManual").click(function(){  
    $("#modalInicio").modal('hide');
    $("#modalManual").modal('show');
});

$("#btnVolver").click(function(){  
    $("#modalInicio").modal('show');
    $("#modalManual").modal('hide');
});

$('.dropdown-inverse li > a').click(function(e){
    $('.status').text(this.innerHTML);
    setNumNodos($('.status').text());
});

$(document).on('input', '#sliderCaida', function() {
    setProbFalloNodo($(this).val());
    if(!timerCaidaEnUso){
        if(probFalloNodo > 0 && !modoAuto){
            for(let i=0; i<nodos.length; i++){
                nodos[i].tiempoCaidaNodo();
            } 
        }
        timerCaidaEnUso = true;
    }

    $('#probCaida').html( "Probabilidad de fallo de un nodo: " + $(this).val() + "%" );
});

$(document).on('input', '#sliderPerdida', function() {
    setProbFalloRed($(this).val())
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
        $('#btnSuspender').text("Reactivar");
        $('#btnSuspender').removeClass('btn-danger');
        $('#btnSuspender').addClass('btn-primary');
    }
   
});

export{escribeLog, openModalInfo, openModalInicio, pausaSim, reanudaSim, creaPoligono, setLider, setAceptador, setConsenso, 
    creaCirculoAnim, desactivarNodo, activarNodo, desactivaBotonesAuto, generaParticion, openModalEstadisticas, statsFinales,
    desactivaBotonesFin}