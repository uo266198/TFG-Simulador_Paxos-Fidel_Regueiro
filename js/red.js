import {Channel}  from "./channels.js";
import {escribeLog } from "./ui.js";
import {creaCirculoAnim, generaParticion} from "./ui.js";
import {velocidad, hayParticion, simPaused, probFalloRed, wait, addMensajesPerdidos, addMensajesTotales, addTimerInterno, modoAuto, mensajesEnEnvio} from "./paxos.js"
import {TimerInterno} from "./timerInterno.js"


class Red {
    constructor() {
        this.input = new Channel();
        this.nodos_registrados = [];
        this.animacionesRed = [];
    }

    async bucle_simulacion() {
        this.running = true;
        while (this.running) {
            let msg, dst, src;
            [msg, dst, src] = await this.input.shift();
            this.enviar(msg, dst, src);
        }
        console.log("Proceso de red terminado");
    }

    async enviar(msg, dst, src) {
        for (let i=0; i<dst.length; i++ ){
            for(let j=0; j<this.nodos_registrados.length; j++){

                //El nodo destino puede no pertenecer a esta red
                if(this.nodos_registrados[j].id == dst[i] && this.nodos_registrados[dst[i]].id != src){
                    //Tirada de fallo de red
                    var rand = (Math.floor(Math.random() * 101));
                    if(rand <= probFalloRed && probFalloRed != 0) {
                        var msg2 = [];
                        msg2[0] = "PERDIDO";
                        this.animaEnvio(src,this.nodos_registrados[dst[i]].id, msg2); 
                    }
                    else {
                        this.animaEnvio(src,this.nodos_registrados[dst[i]].id, msg); 
                    }
                }
            }
        }
    }

    detener_simulacion() {
        this.running = false;
        this.input.push(["FIN_SIMULACION", -1, -1]);
    }

    registrar_nodo(nodo) {
        //this.nodos_registrados[nodo.id] = nodo;
        this.nodos_registrados.push(nodo);
    }

    async repartir(msg, dst, src) {
        await this.input.push([msg, dst, src]);
    }

    borrar_nodos(){
        this.nodos_registrados = [];    
    }

    incluye_nodo(id){
        for(let i=0; i<this.nodos_registrados.length ;i++)
        {
            if(this.nodos_registrados[i].id == id){
                return true;
            }
        }

        return false;
    }

    destino_posible(og, dest){
        if(this.incluye_nodo(dest) && this.incluye_nodo(og)){
            return true;
        }
        return false
    }


    //No se usa, las particiones tiene más sentido que NO sean aleatorias, cambian demasiado el flujo de la simulación
    async probParticion(){
        //Tiempo aleatorio
        let vrand =  velocidad* (Math.floor(Math.random() * 30)+20);
        console.log("Probabilidad de particion timer: "+ vrand);
        let resultado = await this.timerParticion.start(vrand);
        
        if(resultado == 0){
            let rand = (Math.floor(Math.random() * 101)); 
            if(rand <= 50){ 
                generaParticion();
            }
            else{
                await this.probParticion();
            }
        }
    }  
    
    async animaEnvio(og, dest, msg){
        let datos = creaCirculoAnim(og, dest, msg[0], msg[1], msg[2]);
        let posxOg = datos[0][0];
        let posyOg = datos[0][1];
        let posxDest = datos[1][0];
        let posyDest = datos[1][1];
        let circuloAnim = datos[2];

        let velRand = (Math.floor(Math.random() * velocidad) + velocidad*3);
        let anim;
        
        anim = anime({
            targets:  circuloAnim,
            translateX: posxDest-posxOg,
            translateY: posyDest-posyOg,
            duration: velRand,
            easing: 'linear',   
            autoplay: false                  
        });
        this.animacionesRed.push(anim);

        if(!simPaused){
            anim.play();
        }

        await anim.finished;

        //Lo borra de la estructura //////////////////////////////
        //mensajesEnEnvio.splice(datos[3],1);
        circuloAnim.remove();

        //Envío de los datos al otro nodo
        //Aquí ya que es necesario esperar a que finalice la animación de envio
        //También hay que comprobar si el destino pertenece a la misma partición que el origen, ya que esto puede cambiar durante la propia animación.
        var rand = (Math.floor(Math.random() * 101));
       
        if(hayParticion){
            if(this.destino_posible(og, dest) && msg[0] != "PERDIDO" &&  !mensajesEnEnvio.get(datos[3].toString()).perdido){
                this.nodos_registrados[dest].recv_chn.push([msg, og]);  
            }
            else console.log("Msg origen: " +  og + " destino: " + dest + " perdido por la partición");
        }
        
        else if(msg[0] == "PERDIDO" ||  mensajesEnEnvio.get(datos[3].toString()).perdido) {
            addMensajesTotales();
            addMensajesPerdidos();
            escribeLog(3, og, dest);   
        }   
        else{
            addMensajesTotales();
            this.nodos_registrados[dest].recv_chn.push([msg, og]);  
        } 
    }
}


export {Red}