import {timerSim,  inicio, setNumNodos, nodos, red1, red2, hayParticion, setParticion, simPaused, setSimPaused, modoAuto, setVelocidad, probFalloNodo, probFalloRed, setProbFalloNodo,
        setProbFalloRed, rondaGlobal, numCaidas, numLideres, mensajesPerdidos, mensajesTotales, numNodos, velocidad } from "./paxos.js"

var svgNS = "http://www.w3.org/2000/svg"; 
 
var nodoDist = 7;
var radio = 2;
var colorNodos = "gray";
var actual;

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

    $("#modalTitle").text("Propón un valor desde el nodo " + this.dataset.key);
    /*$("#modalEstado").text("Estado actual:       "+ nodos[actual].estado);
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
    }*/

    $("#modalInfo").modal('show');
}

// Crea el polígono regular que forman los distintos nodos según el número de estos y por lo tanto la posición de cada nodo.
// También crea el círculo exterior que representa el temporizador interno de recepción de mensajes.
function creaPoligono(){
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

        // Tooltip
        circulo.setAttribute("data-toggle","tooltip");
        circulo.setAttribute("data-placement","top");
        circulo.setAttribute("data-html","true");
        circulo.setAttribute("title","Nodo "+i);

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        });
        //circulo.setAttribute("title","<p> Mensaje: "+tipo+"</p><p> Origen: "+og+"</p><p> Destino: "+dest+"</p><p> Ronda: "+ronda+"</p><p> Valor: "+valor+"</p>");
    
        //Añadimos un valor que distingue a cada nodo
        circulo.setAttribute("data-key", i);
        if(!modoAuto) circulo.addEventListener("click", openModalInfo);
        circulo.addEventListener("mouseover", tooltipNodos);
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
    if(tipo == "PREPARACION" ){
        circuloAnim.setAttribute("fill","dodgerBlue");
    }
    else if(tipo == "PROMESA" ){
        circuloAnim.setAttribute("fill","LemonChiffon");
    }
    else if (tipo == "PROPUESTA"){
        circuloAnim.setAttribute("fill","greenYellow");
    }
    else if(tipo == "PERDIDO"){
        circuloAnim.setAttribute("fill","indianRed");
    }
    else if(tipo == "ACEPTACION"){
        circuloAnim.setAttribute("fill","LawnGreen");
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
        textoSVG.setAttributeNS(null,"id","textoSVG"+id);
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

    $("#btnPartir").children('span').text("Quitar partición")
    let nodosParticion = Math.floor(numNodos/2)+1;
    setParticion(true);

    //borramos todos los nodos registrados en las redes
    red1.borrar_nodos();
    red2.borrar_nodos();

    for(let i=0 ; i<nodos.length; i++){
        let circ = document.getElementById("nodo"+i);

        let textoPart = document.createElementNS(svgNS,"text"); 
        textoPart.setAttribute("id","textoParticion"+i);
        textoPart.setAttribute("x", circ.getAttribute("cx"));
        textoPart.setAttribute("y", parseFloat(circ.getAttribute("cy")) + 0.9);
        textoPart.setAttribute("font-size",1.2);
        textoPart.setAttribute("text-anchor", "middle");
        textoPart.setAttribute("pointer-events","none");

        let part;

        if(i<nodosParticion){
            red1.registrar_nodo(nodos[i]);
            part = 0;
        }

        else {
            red2.registrar_nodo(nodos[i]);
            part = 1;
        }

        //
      
        //
        let texto = document.createTextNode("P"+part);
        textoPart.appendChild(texto);
        document.getElementById("svgFrame").appendChild(textoPart); 
    }

    let tijeraSVG = document.createElementNS(svgNS,"path");
    tijeraSVG.setAttribute("id","svgPart");
    tijeraSVG.setAttribute("d","M3.5 3.5c-.614-.884-.074-1.962.858-2.5L8 7.226 11.642 1c.932.538 1.472 1.616.858 2.5L8.81 8.61l1.556 2.661a2.5 2.5 0 1 1-.794.637L8 9.73l-1.572 2.177a2.5 2.5 0 1 1-.794-.637L7.19 8.61 3.5 3.5zm2.5 10a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0zm7 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z");
    tijeraSVG.setAttribute("transform", "translate(12,7) scale(0.1)");
    document.getElementById("svgFrame").appendChild(tijeraSVG); 

    $("#btnPartir").children('svg').children("path").attr("d","m2.68 7.676 6.49-6.504a4 4 0 0 1 5.66 5.653l-1.477 1.529-5.006 5.006-1.523 1.472a4 4 0 0 1-5.653-5.66l.001-.002 1.505-1.492.001-.002Zm5.71-2.858a.5.5 0 1 0-.708.707.5.5 0 0 0 .707-.707ZM6.974 6.939a.5.5 0 1 0-.707-.707.5.5 0 0 0 .707.707ZM5.56 8.354a.5.5 0 1 0-.707-.708.5.5 0 0 0 .707.708Zm2.828 2.828a.5.5 0 1 0-.707-.707.5.5 0 0 0 .707.707Zm1.414-2.121a.5.5 0 1 0-.707.707.5.5 0 0 0 .707-.707Zm1.414-.707a.5.5 0 1 0-.706-.708.5.5 0 0 0 .707.708Zm-4.242.707a.5.5 0 1 0-.707.707.5.5 0 0 0 .707-.707Zm1.414-.707a.5.5 0 1 0-.707-.708.5.5 0 0 0 .707.708Zm1.414-2.122a.5.5 0 1 0-.707.707.5.5 0 0 0 .707-.707ZM8.646 3.354l4 4 .708-.708-4-4-.708.708Zm-1.292 9.292-4-4-.708.708 4 4 .708-.708Z")

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

    console.log(document.getElementById("svgPart"));
    document.getElementById("svgPart").remove();
    $("#btnPartir").children('span').text("Crear Partición");
    $("#btnPartir").children('svg').children("path").attr("d","M3.5 3.5c-.614-.884-.074-1.962.858-2.5L8 7.226 11.642 1c.932.538 1.472 1.616.858 2.5L8.81 8.61l1.556 2.661a2.5 2.5 0 1 1-.794.637L8 9.73l-1.572 2.177a2.5 2.5 0 1 1-.794-.637L7.19 8.61 3.5 3.5zm2.5 10a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0zm7 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z")


    for(let i=0 ; i<nodos.length; i++){
        red1.registrar_nodo(nodos[i]);
        let txt =  document.getElementById("textoParticion"+i);
        txt.remove();
    }
}


function tooltipNodos(e){
    actual = this.dataset.key;

    let textRonda = nodos[actual].ronda;
    let textValor = nodos[actual].valorPropuesto;

    if(nodos[actual].ronda < 0) textRonda = "ninguna ronda recibida"
    if(textValor == undefined) textValor = "ninguno"
    let textoMouseOver = "<p>Nodo: "+actual+"</p><p>Estado actual: "+nodos[actual].estado+"</p><p>Mayor ronda recibida: "+textRonda+"</p><p> Valor aceptado: "+textValor+"</p>"
    document.getElementById("nodo"+actual).setAttribute("data-original-title", textoMouseOver);
}

//Modifica el texto del nodo lider para indicar su estatus
function muestraTextoLider(id){

    let nodo = document.getElementById("nodo"+id);
    let posx = nodo.getAttribute("cx");
    let posy = nodo.getAttribute("cy");

    let liderTextoSVG = document.createElementNS(svgNS,"text"); 
    liderTextoSVG.setAttribute("x", posx);
    liderTextoSVG.setAttribute("y", parseFloat(posy) - 0.3);
    liderTextoSVG.setAttribute("id","newTextoSVG"+id);
    liderTextoSVG.setAttribute("font-size",0.4);
    liderTextoSVG.setAttribute("text-anchor", "middle");
    liderTextoSVG.setAttribute("pointer-events","none");

    let texto = document.createTextNode("LIDER");
    let frame = document.getElementById("svgFrame");
    liderTextoSVG.appendChild(texto);
    frame.appendChild(liderTextoSVG); 
}


//Quita el texto  del lider
function quitaTextoLider(id){
    getElementById("id","newTextoSVG"+id).remove;
}

//Pone por defecto los últimos valores seleccionados
function valoresGuardados(){
    $("#dropDownValue").text(localStorage.getItem("numNodos"));

    let velocidad = localStorage.getItem("velocidad");
    if(velocidad == 500){
        $("#btnSpeedText").text("x2");
        setVelocidad(500);
        timerSim.velocidad = 500;
    }
    else if(velocidad == 250){
        $("#btnSpeedText").text("x3");
        setVelocidad(250);
        timerSim.velocidad = 250;
    }

    if(localStorage.getItem("modoAuto") == "false"){
        document.getElementById("flexRadioDefault1").setAttribute("checked","true");
    }
    else{
        document.getElementById("flexRadioDefault2").setAttribute("checked","true");       
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
    $("#nodo"+id).css("fill","red");
    nodos[id].pausado = true;
    $("#modalPausado").text("Pausado/Caído:       "+ nodos[id].pausado);
    escribeLog(4, id)
}

function activarNodo(id){
    //Cambia el color
    if(nodos[id].estado == "ACEPTADOR" && nodos[id].ronda != -1) $("#nodo"+id).css("fill","cyan");
    else if(nodos[id].estado == "LIDER") $("#nodo"+id).css("fill","gold");
    else $("#nodo"+id).css("fill",colorNodos);
    
    nodos[id].pausado = false;
    escribeLog(5, id)
} 


function setPreparado(id){ 
    console.log(id);
    //Cambia el color 
    $("#nodo"+id).css("fill","steelBlue");
    nodos[id].estado = "ACEPTADOR";
}

function setPropuesto(id){ 
    //Cambia el color 
    $("#nodo"+id).css("fill","Yellow");
    nodos[id].estado = "ACEPTADOR";
}

function setConsenso(id){
    //Cambia el color
    $("#nodo"+id).css("fill","darkGreen");
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
    $("#nodo"+id).css("fill", "gold");
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

    //$("#btnPartir").attr('disabled', 'disabled');
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
/////////////////////////////////
////////// MANEJADORES //////////
/////////////////////////////////

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
        muestraTextoLider(actual);
        escribeLog("Nodo "+actual+" se prepara para proponer el valor:  \""+ propuesta+ " "+nuevaRonda+"\"");  
        nodos[actual].liderPropone(propuesta,nuevaRonda);
    }  
});

$("#btnInfo").click(function(){
    pausaSim(true);
    $("#modalManual").modal('show');
});

$("#btnAcepta").click(function(){  
    let auto = $("#flexRadioDefault2").is(':checked');
    setNumNodos($('.status').text());
    timerSim.startTime();
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
    $("#modalManual").modal('hide');
    if(nodos[0] == undefined){
        $("#modalInicio").modal('show');
        
    } 
});

$('.dropdown-inverse li > a').click(function(e){
    $('.status').text(this.innerHTML);
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

export{escribeLog, openModalInfo, openModalInicio, pausaSim, reanudaSim, creaPoligono, setLider, setPreparado, setConsenso, 
    creaCirculoAnim, desactivarNodo, activarNodo, desactivaBotonesAuto, generaParticion, openModalEstadisticas, statsFinales,
    desactivaBotonesFin, muestraTextoLider, valoresGuardados, setPropuesto}