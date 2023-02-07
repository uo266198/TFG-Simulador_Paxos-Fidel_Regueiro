import{Paxos} from "./paxos.js";
import{UI} from "./ui.js";

/////////////////////////////////
////////// MANEJADORES //////////
/////////////////////////////////

$("#btnSpeed").click(function(){
    if(Paxos.timerSim.velocidad == 1000) {
        $("#btnSpeedText").text("x2");
        Paxos.velocidad = 500;
        //setVelocidad(500);
        Paxos.timerSim.velocidad = 500;
    }
    else if (Paxos.timerSim.velocidad == 500){
        $("#btnSpeedText").text("x3");
        //setVelocidad(250);
        Paxos.velocidad = 250;
        Paxos.timerSim.velocidad = 250;

       
    }
    else {
        $("#btnSpeedText").text("x1");
        s//etVelocidad(1000);
        Paxos.velocidad = 1000;
        Paxos.timerSim.velocidad = 1000;
    }
});

//Para o continua la simulación
$("#btnPlay").click(function(){ 
    if(Paxos.simPaused){
        UI.reanudaSim();
    }  
    else{
        UI.pausaSim();
    }
});

$("#btnReset").click(function(){ 
    location.reload();
});

//Particion
$("#btnPartir").click(function(){ 
    if(Paxos.hayParticion) UI.eliminaParticion();
    else UI.generaParticion();
});

$("#btnProponer").click(function(){ 
    var propuesta = $("#textPropuesta").val();
    var nuevaRonda = $("#textRonda").val();
    if(propuesta !="" && nuevaRonda !=""){
        UI.escribeLog("Nodo "+UI.actual+" se prepara para proponer el valor:  \""+ propuesta+ " "+nuevaRonda+"\"");  
        Paxos.nodos[UI.actual].proponer(propuesta,nuevaRonda);
    }  
});


$("#btnPerderMsg").click(function(){ 
    document.getElementById("nodoAnim"+idMsgActual).setAttribute("fill","red");
    mensajesEnEnvio.get(idMsgActual.toString()).perdido = true;
});

$("#btnInfo").click(function(){
    UI.pausaSim();
    $("#modalManual").modal('show');
});

$("#btnAcepta").click(function(){  
    let auto = $("#flexRadioDefault2").is(':checked');
    Paxos.numNodos = $('.status').text();
    Paxos.timerSim.startTime();
    Paxos.inicio(auto);
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
    Paxos.probFalloNodo = $(this).val();
    if(!this.timerCaidaEnUso){
        if(Paxos.probFalloNodo > 0 && !Paxos.modoAuto){
            for(let i=0; i<Paxos.nodos.length; i++){
                Paxos.nodos[i].tiempoCaidaNodo();
            } 
        }
        this.timerCaidaEnUso = true;
    }

    $('#probCaida').html( "Probabilidad de fallo de un nodo: " + $(this).val() + "%" );
});

$(document).on('input', '#sliderPerdida', function() {
    Paxos.probFalloRed=  $(this).val()
    $('#probPerdida').html( "Probabilidad de pérdida de paquetes: " + $(this).val() + "%" );
});

$('#btnSuspender').click(function(e){
    if(Paxos.nodos[UI.actual].pausado){
        UI.activarNodo(UI.actual);
        //console.log("Nodo "+UI.actual+" activado");
        $('#btnSuspender').text("Suspender nodo");
        $('#btnSuspender').removeClass('btn-primary');
        $('#btnSuspender').addClass('btn-danger');
       
    }

    else{
        UI.desactivarNodo(UI.actual);
        $('#btnSuspender').text("Reactivar");
        $('#btnSuspender').removeClass('btn-danger');
        $('#btnSuspender').addClass('btn-primary');
    }
});
