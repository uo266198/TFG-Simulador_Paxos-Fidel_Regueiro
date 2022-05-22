import Timer from './timer.js';
import {escribeLog, creaPoligono, arrayNodos} from './ui.js';
import {PreparaMsg, PromesaMsg, AceptaMsg, AceptadoMsg, IniciandoMsg} from './mensaje.js';
import {Nodo} from './nodos.js';

var velocidad = 1000;
export const timerSim = new Timer(velocidad, true);
export var numNodos = 3;
var workers = [];
//var canales = [];
var red;

openModalInicio();

////////////////////////////////
////////// Funciones ///////////
///////////////////////////////

export function inicio(){
    $("#modalInicio").modal('hide');
    escribeLog("Esperando una propuesta.");
    escribeLog("Si no, un nodo se propondrá como lider automáticamente. ");
    creaPoligono(numNodos);
    creaWorkers();
    reanudaSim();
}

export function preparaPropuesta(id){
    let msg = new PreparaMsg(id, 0);
    workers[id].postMessage(msg);
}

function creaWorkers(){
    for(let i = 0; i<numNodos; i++ ){
        let nodoWorker = new Worker("/js/nodosWorker.js");
        nodoWorker.postMessage(i);
        workers.push(nodoWorker);
    }
}

export function setNumNodos(num){
    numNodos = num;
}