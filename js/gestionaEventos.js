import {getListaNodos} from "./paxos.js"
import {Prepara, Promesa, Acepta, Aceptado} from './mensaje.js';


export default function enviaMensaje(mensaje){
    switch (mensaje.constructor.name){
        case "Prepara":
            prepara(mensaje);
        break;

    }
}
    
function prepara(mensaje){
    const listaNodos = getListaNodos();
    for(let i=0; i<listaNodos.length; i++){
        if(listaNodos[i].id != mensaje.sourceId){
            listaNodos[i].canal.recibeMensaje(mensaje);
        }   
    }
}

export{enviaMensaje}