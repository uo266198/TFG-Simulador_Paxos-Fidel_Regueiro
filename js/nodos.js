import{Channel} from './channels.js'
import {nodos, quorum, rondaGlobal} from './paxos.js';
import  {setAceptador, setConsenso} from './ui.js';


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randSleep(){
    sleep(Math.random() * 3000);
}

var valores = ["Casa", "Coche", "Perro", "Insecto", "Lámpara"];

class Nodo {
    constructor(id, red) {
        this.id = id;
        this.red = red;
        this.recv_chn = new Channel();
        this.red.registrar_nodo(this);
        this.bucle_simulacion();

        this.pausado = false;

        this.estado = "ACEPTADOR";
        this.ronda = -1;
        this.valorPropuesto;
        this.consenso = false;
        this.aceptado = false;

        this.contAceptadores = 1;
    }


    // msg tiene los siguientes valores
    // msg[0], tipo de mensaje
    // msg[1], numero de ronda 
    // msg[2], valor propuesto (puede ser nulo)
    async enviar(msg, dest, orig) {
        //console.log(msg);
        await this.red.repartir(msg,dest,this.id)
    }

    async recepcion_mensajes() {   

        while (this.running) {
            let msg = [];
            let orig;

            [msg, orig] = await this.recv_chn.shift();
            console.log("["+ this.id + "] " + "recibe " + "["+ msg +"] " +" desde  " + "[" + orig + "]");


            //MAQUINA DE ESTADOS
            if(this.estado == "ACEPTADOR"){
                if(msg[0] == "PREPARA"){
                    setAceptador(this.id);
                    this.estado == "ACEPTADOR";

                    //Ronda mayor que la actual, acepta  y envía el mensaje PROMESA
                    if(msg[1] > this.ronda){
                        this.ronda = msg[1];
                        await this.enviar(["PROMESA",this.ronda,null], [orig], this.id);                  
                    }          
                }

                else if(msg[0] == "ACEPTAR" && !this.aceptado){
                    //Recibe el valor consensuado
                    if(msg[1] == this.ronda){
                        this.valorPropuesto = msg[2];
                        this.contAceptadores++;
                        this.aceptado = true;

                        var dest = [];
                        for(let i = 0; i<nodos.length ; i++){
                            dest.push(nodos[i].id);
                        }
                        await this.enviar(["ACEPTAR",this.ronda,this.valorPropuesto], dest, this.id);
                    }            
                }    
            
                else if(msg[0] == "ACEPTAR" && this.aceptado){
                    this.contAceptadores++;

                    if(this.contAceptadores >= quorum){
                        setConsenso(this.id);
                        console.log("["+ this.id + "] " + "llega al quorum de mensajes ");
                    
                    }
                }              
        }

            //Duda: aprendices: al acabar los nodos se envian el resultaod entre sí? SIII
            //https://medium.com/@angusmacdonald/paxos-by-example-66d934e18522#:~:text=In%20the%20standard%20Paxos%20algorithm,and%20a%20proposal%20number%2C%20n.
            if(this.estado == "PROPONENTE" || this.estado == "LIDER"){
                if(msg[0] == "PROMESA"){
                    this.contAceptadores++;
                    if(this.contAceptadores >= quorum && !this.aceptado){
                        let valorTemp;
                        
                        if(this.valorPropuesto == undefined){
                            this.aceptado = true;
                            //Un valor aleatorio de la lista de cadenas de texto
                            valorTemp = valores[Math.floor(Math.random() * valores.length)];
                            this.valorPropuesto = valorTemp;
                        }
                        this.aceptado = true;
                        var dest = [];
                        for(let i = 0; i<nodos.length ; i++){
                            dest.push(nodos[i].id);
                        }
                        console.log("["+ this.id + "] " + "llega al quorum de aceptacion");
                        await this.enviar(["ACEPTAR",this.ronda,this.valorPropuesto], dest, this.id);
                    } 
                }
            }
           
        }
    }
    
    async bucle_simulacion() {
        this.running = true;
        console.log(` - Nodo${this.id} arrancado`);
        await Promise.all([this.recepcion_mensajes()])
        console.log(` - Nodo${this.id} detenido`);
    }

    detener_simulacion() {
        this.running = false;
        this.recv_chn.push(["FIN_SIMULACION", -1]);
    }
}

export {Nodo}

     