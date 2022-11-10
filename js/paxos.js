import {Timer} from './timer.js';
import {escribeLog, creaPoligono, openModalInicio, reanudaSim, desactivaBotonesAuto, pausaSim, 
        openModalEstadisticas, statsFinales, desactivaBotonesFin} from './ui.js';
import {Nodo} from './nodos.js';
import {Red} from './red.js';

export var numNodos = 3;

export var red1;
export var red2;

export var modoAuto = false;
export var simPaused = false;
export var hayParticion;

var fin = false;

export var probFalloNodo = 0;
export var probFalloRed = 0;

export var maxTiempoRespuesta = 30000;
export var minTiempoRespuesta = 10000;

export var velocidad = 1000;

export const timerSim = new Timer(velocidad);

export var valoresProponer = ["Casa", "Coche", "Perro", "Insecto", "Lámpara"];
export var nodos = [];
export var timersInternos = [];

const tasks = [];

export var quorum;
export var rondaGlobal = -1;

export var mensajesTotales = 0;
export var mensajesPerdidos = 0;
export var numLideres = 0;
export var numCaidas = 0;


//Inicio
openModalInicio();

////////////////////////////////
////////// Funciones ///////////
///////////////////////////////

export function inicio(auto){
    $("#modalInicio").modal('hide');
    modoAuto = auto;
    quorum = Math.floor(numNodos/2)+1;
    creaPoligono(numNodos);
    iniciaRed();
    reanudaSim();
    

    if(auto){
        desactivaBotonesAuto();
        //red1.probParticion();
        escribeLog(-1,null,null,"Uno o varios nodos se propondrán automáticamente.");
    }   
    else escribeLog(-1,null,null,"Esperando una propuesta manual.");

    timerSim.startTime();
}

async function iniciaRed(){
    red1 = new Red();
    red2 = new Red();

    setParticion(false);

    for(let i=0; i<numNodos; i++){
        var n = new Nodo(i, red1);
        nodos.push(n);
        tasks.push(red1);
        red1.registrar_nodo(n);
    }

    const x = await Promise.all(tasks.map((x)=>x.bucle_simulacion()));
}

export function setNumNodos(num){
    numNodos = num;
}

export function setSimPaused(bool){
    simPaused = bool;
}

export function setParticion(b){
    hayParticion = b;
}

export function setVelocidad(vel){
    velocidad = vel;
}

export function setProbFalloRed(prob){
    probFalloRed = prob;
}

export function setProbFalloNodo(prob){
    probFalloNodo = prob;
}

export function setRonda(ronda){
    rondaGlobal = ronda;
}

export function addMensajesTotales(){
    mensajesTotales++;
}

export function addMensajesPerdidos(){
    mensajesPerdidos++;
}

export function addNumLideres(){
    numLideres++;
}

export function addNumCaidas(){
    numCaidas++;
}


//Añade a la lista de temporizadores interno uno nuevo.
export function addTimerInterno(timer){
    timersInternos.push(timer);
}

export async function  wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

export async function consensoFinal(){
    
    if(modoAuto){
        let contadorConsenso = 0
        for(let i=0; i<numNodos; i++){
            if(nodos[i].consenso){
                contadorConsenso++

                console.log("Consensos: "+contadorConsenso)
            }
        }

        if(contadorConsenso == numNodos && !fin){
            fin = true;  
            desactivaBotonesFin();   
            pausaSim();
            escribeLog(10);
            statsFinales();
            openModalEstadisticas();
        }
    }
   
}


