import {Timer} from './timer.js';
import {escribeLog, creaPoligono, openModalInicio, reanudaSim, setLider} from './ui.js';
import {Nodo} from './nodos.js';
import {Red} from './red.js';


export var numNodos = 3;
export var velocidad = 1000;
export const timerSim = new Timer(velocidad, true);
var red;
const MAX_TIEMPO_PROPUESTA = 15000;
const MIN_TIEMPO_PROPUESTA = 5000;
export var nodos = [];
const tasks = [];
export var quorum;
export var rondaGlobal = 0;

openModalInicio();

////////////////////////////////
////////// Funciones ///////////
///////////////////////////////

export function inicio(auto){
    //console.log(auto);
    $("#modalInicio").modal('hide');
    
    quorum = Math.floor(numNodos/2)+1;
    //console.log(quorum);
    creaPoligono(numNodos);
    iniciaRed();
    reanudaSim();

    escribeLog("Esperando una propuesta.");
    if(auto){
        escribeLog("Si no, un nodo se propondrá como lider automáticamente. ");
        //setTimeout(propuestaRandom,Math.floor(Math.random() * (MAX_TIEMPO_PROPUESTA - MIN_TIEMPO_PROPUESTA) ) + MIN_TIEMPO_PROPUESTA);
        setTimeout(propuestaRandom,1);
    }    
}

async function iniciaRed(){
    red = new Red();
    tasks.push(red);
    for(let i=0; i<numNodos; i++){
        var n = new Nodo(i, red);
        nodos.push(n);
        tasks.push(red);
        red.registrar_nodo(n);
    }
    const x = await Promise.all(tasks.map((x)=>x.bucle_simulacion()));
    //mylog("Terminada simulación");
    //mylog(x);
}

export function setNumNodos(num){
    numNodos = num;
}

function propuestaRandom(){
   let lider = Math.floor(Math.random() * numNodos);
   escribeLog("El nodo "+lider+" se propondrá como líder.");
   liderPropone(lider);

}

export function liderPropone(nodo, propuesto){
    
    let destino = [];
    for(let i=0; i<nodos.length; i++){
        if(i != nodo){
            destino.push(nodos[i].id);
        }
    }
    let msg =["PREPARA",rondaGlobal++,null]
    nodos[nodo].ronda++;
    if(propuesto !=undefined ){
        nodos[nodo].valorPropuesto = propuesto;
    }
    //msg.push();
    nodos[nodo].enviar(msg, destino, nodos[nodo].id);
    setLider(nodo);
}