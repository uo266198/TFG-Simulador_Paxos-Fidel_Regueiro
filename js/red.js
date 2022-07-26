import {Channel}  from "./channels.js";
import {animaEnvioDatos} from './animations.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Red {
    constructor() {
        this.input = new Channel();
        this.nodos_registrados = [];

        //await Promise.all(this.bucle_simulacion());
    }

    async bucle_simulacion() {
        this.running = true;
        ///console.log("Proceso de red arrancado");
        while (this.running) {
            let msg, dst, src;
            [msg, dst, src] = await this.input.shift();
            //if (msg == "FIN_SIMULACION") break;
            //console.log("Mensaje a enviar " + msg[0] + " por parte de "+ src + " hasta "+dst);
            this.enviar(msg, dst, src);
        }
        console.log("Proceso de red terminado");
    }

    async enviar(msg, dst, src) {
        for (let i=0; i<dst.length; i++ ){
                if(this.nodos_registrados[dst[i]].id != src){
                    //await sleep(1000);
                    //console.log("SRC:" + this.nodos_registrados[dst[i]].id);
                    await animaEnvioDatos(src,this.nodos_registrados[dst[i]].id);
                    this.nodos_registrados[dst[i]].recv_chn.push([msg, src]);
                }
        }
    }

    detener_simulacion() {
        this.running = false;
        this.input.push(["FIN_SIMULACION", -1, -1]);
    }

    registrar_nodo(nodo) {
        this.nodos_registrados[nodo.id] = nodo;
    }

    async repartir(msg, dst, src) {
        await this.input.push([msg, dst, src]);
    }
}


export {Red}