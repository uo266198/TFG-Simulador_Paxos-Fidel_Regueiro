import{Channel} from '../channels/channels.js'
import{Paxos} from './paxos.js'
import{UI} from  './ui.js'

import {TimerInterno} from './timerInterno.js';


class Nodo {
    constructor(id, red) {
        this.id = id;
        this.red = red;
        this.recv_chn = new Channel();
        this.bucleSimulacion();

        //  Flags internos  //
        this.pausado = false;
        this.aceptado = false;
        this.consenso = false;

        // Estado //
        this.estado = "ACEPTADOR";

        // Guarda la referencia a las animaciones, necesario para pausar;
        this.waitAnim;

        this.contadorMensajes = 1;
        this.ronda = -1;
        this.valorPropuesto;
        //  Timers internos de cada nodo  //
        this.timerCaida = new TimerInterno(this.id, "caida");               // Timer que cada x tiempo hace una tirada de caida del nodo.
        this.timerRecuperacion = new TimerInterno(this.id, "recuperacion"); // "" de recuperación del nodo caido.
        this.timerRecepcion = new TimerInterno(this.id, "recepcion");         // "" de proposición al no haber recibido mensajes en x tiempo.

        Paxos.addTimerInterno(this.timerCaida);
        Paxos.addTimerInterno(this.timerRecuperacion);
        Paxos.addTimerInterno(this.timerRecepcion);
    
        if(Paxos.modoAuto){
            this.tiempoCaidaNodo();
            //this.animaTemporizadorRecepcion();
            this.tiempoRecepcion();
        }
    }

    // msg tiene los siguientes valores
    // msg[0], tipo de mensaje
    // msg[1], numero de ronda 
    // msg[2], valor propuesto (puede ser nulo)
    async enviar(msg, dest, orig) {
        await this.red.repartir(msg,dest,this.id)
    }


    //Bucle de recepción de mensajes
    async recepcionMensajes() {   
        while (this.running) {
            let msg = [];
            let orig;
            
            [msg, orig] = await this.recv_chn.shift();
            
            if(!this.pausado ){
                
                if(Paxos.modoAuto){
                    if(this.waitAnim == undefined ||  this.waitAnim.completed ) this.tiempoRecepcion();
                    else this.waitAnim.restart();
                }

                //await this.tiempoRecepcion();
                UI.escribeLog(0, this.id, orig, msg);

                //Estado 1: ACEPTADOR: ha de recibir un mensaje de preparación. Envía promesa. Si ya se ha comprometido, recibe el valor y envía el OK (ACEPTACIÓN) de vuelta al líder.
                if(this.estado == "ACEPTADOR"){
                    if(msg[0] == "PREPARACION"){            // Mensaje de compromiso con un líder
                        if(msg[1] > this.ronda){                // Recibo una ronda mayor que la última que he recibido.
                            UI.setComprometido(this.id);          // Me he comprometido a un líder.
                            this.ronda = msg[1];
                            if(this.aceptado) {
                                await this.enviar(["PROMESA",this.ronda ,this.valorPropuesto], [orig], this.id);    //Ya estaba comprometido
                            }  
                            else await this.enviar(["PROMESA",this.ronda,null], [orig], this.id);      // else      
                        } 
                    }

                    else if(msg[0] == "PROPUESTA"){         // Tras comprometerse con un líder, recibo el valor del consenso
                        this.aceptado = true;
                        if(msg[1] >= this.ronda){           // Aceptado
                            this.ronda = msg[1];
                            this.valorPropuesto = msg[2];
                            this.aceptado = true;
                            UI.setComprometido(this.id);  //Cambiamos el color a amarillo para que sepamos que ya ha obtenido un valor       

                            //Envío del mensaje ACEPTACION que cofirma que hemos recibido el valor a consensuar a todos los demás nodos. (Líder incluido)
                            var dest = [];
                            for(let i = 0; i<Paxos.nodos.length ; i++){
                                dest.push(Paxos.nodos[i].id);
                            }
                            UI.setPropuesto(this.id);
                            await this.enviar(["ACEPTACION",this.ronda, this.valorPropuesto], dest, this.id)
                        }
                        /*else{
                            this.valorPropuesto = msg[2];
                            var dest = [];
                            for(let i = 0; i<Paxos.nodos.length ; i++){
                                dest.push(Paxos.nodos[i].id);
                            }
                            UI.setPropuesto(this.id);
                            await this.enviar(["ACEPTACION",this.ronda, this.valorPropuesto], dest, this.id)
                        }*/

                        this.contadorMensajes ++;
                        if(this.contadorMensajes >= Paxos.quorum){
                            UI.setConsenso(this.id);
                            UI.escribeLog(2, this.id)  
                            Paxos.consensoFinal();
                        }  
                    }

                    else if(msg[0] == "ACEPTACION"){        //Mensaje recibido por parte de los demás nodos de la red que confirman en valor de consenso.
                        if(msg[1] == this.ronda){
                            this.contadorMensajes++;
                            if(this.contadorMensajes >= Paxos.quorum){  //Consenso
                                UI.setConsenso(this.id);
                                UI.escribeLog(2, this.id)  
                                Paxos.consensoFinal();
                            }     
                        }
                    }
                } //FIN aceptador

                //Estado 2: Proponente: envía el mensaje de preparación y recibe las promesas por parte de los aceptadores. Al recibir una mayoría se sitúa como líder.
                else if(this.estado == "PROPONENTE" || this.estado == "LIDER" ){ //(Idéntico)
                    if(msg[0] == "PROMESA"){                // Mensaje enviado por un aceptador que confirma su promesa a aceptar el valor que envíe este nodo si se convierte en líder
                        this.contadorMensajes++;            // De consenso
                        if(msg[2] != null){
                            if(msg[1] > this.ronda){
                                this.valorPropuesto = msg[2];
                            }
                        }
                            
                        else if(this.contadorMensajes >= Paxos.quorum){
                            
                            let valorTemp;
                            //Lo reseteamos y lo usamos para esperar al quorum de mensajes de los demás nodos.
                            this.contadorMensajes = 1;
                            if(this.valorPropuesto == undefined){
                                this.aceptado = true;

                                //Un valor aleatorio de la lista de cadenas de texto
                                valorTemp = Paxos.valoresProponer[Math.floor(Math.random() * Paxos.valoresProponer.length)];
                                this.valorPropuesto = valorTemp;
                            }
                            
                            if(this.estado == "PROPONENTE"){ //Si ya soy lider ya lo he enviado
                                var dest = [];
                                for(let i = 0; i<Paxos.nodos.length ; i++){
                                    dest.push(Paxos.nodos[i].id);
                                }
                                UI.setLider(this.id, this.ronda);
                                await this.enviar(["PROPUESTA", this.ronda, this.valorPropuesto], dest, this.id)
                            }
                        }
                    }

                    else if(msg[0] == "ACEPTACION"){
                        this.contadorMensajes++;
                        if(this.contadorMensajes >= Paxos.quorum){
                            
                            UI.setConsenso(this.id);
                            Paxos.consensoFinal();
                            UI.escribeLog(2, this.id)    
                        }
                    }
                    
                    // Caso poco común, pero al tener los nodos todos los roles, puede darse.
                    else if(msg[0] == "PREPARACION"){
                        if(msg[1] > this.ronda){
                            UI.setComprometido(this.id);          // Me he comprometido a un líder.
                            this.ronda = msg[1];
                            await this.enviar(["PROMESA",this.ronda,null], [orig], this.id);     
                        }        
                    }
                }
            }
        }  
    }
    
    async bucleSimulacion() {
        this.running = true;
        await Promise.all([this.recepcionMensajes()])
    }


    //No se usa
    /*detener_simulacion() {
        this.running = false;
        this.recv_chn.push(["FIN_SIMULACION", -1]);
    }*/

    async animaTemporizadorRecepcion(tiempo){
        let circuloAnim = document.getElementById("progreso"+this.id);
        let circunferencia = circuloAnim.getAttribute("r")*2*Math.PI;

        circuloAnim.style.strokeDasharray = `${circunferencia} ${circunferencia}`;
        circuloAnim.style.visibility = "visible";

        this.waitAnim = anime({
            targets:  circuloAnim,
            strokeDashoffset: [circunferencia, 0],
            easing: 'linear', 
            duration: tiempo,
            autoplay: false,
        });
              
        if(!Paxos.simPaused){
            this.waitAnim.play();
        }

        await this.waitAnim.finished;
        //circuloAnim.style.visibility = "hidden";
    }  

    async proponer(propuesto, nuevaRonda){ 
        Paxos.numLideres++;
        if(this.pausado) UI.activarNodo(this.id);
        let destino = [];
        for(let i=0; i<Paxos.nodos.length; i++){
            if(i != this.id){
                destino.push(Paxos.nodos[i].id);
            }
        }
        if(Paxos.modoAuto){
            if(nuevaRonda > Paxos.rondaGlobal){
                 Paxos.rondaGlobal = nuevaRonda
                this.ronda = nuevaRonda;
            }
            else{
                Paxos.rondaGlobal = Paxos.rondaGlobal + 1;
                this.ronda = Paxos.rondaGlobal;
            };
           
        } 
        else{
            if(nuevaRonda > Paxos.rondaGlobal)Paxos.rondaGlobal = nuevaRonda;
            this.ronda = nuevaRonda;
        }
        

        let msg =["PREPARACION",this.ronda,null]
        
        UI.actualizaRonda();
        if(propuesto !=undefined ){
            this.valorPropuesto = propuesto;
        }

        UI.setProponente(this.id, this.ronda);
        this.estado = "PROPONENTE";

        await this.red.enviar(msg, destino, this.id);
        
    }


/////   GESTION DE TIMERS INTERNOS   /////

    // Tirada para recuperar el nodo de vuelta. 
    async tiempoRecuperaNodo (){
        this.waitAnim.pause();
        let vrand =  Paxos.velocidad * (Math.floor(Math.random() * 3)+5);

        let resultado = await this.timerRecuperacion.start(vrand);
        if(resultado == 0){
            let rand = (Math.floor(Math.random() * 101));
            if(rand <= 50 && this.pausado  ){ 
                this.timerRecuperacion.resetTimerInterno();
                this.tiempoRecuperaNodo();
            }
            else{
                this.waitAnim.play();
                UI.activarNodo(this.id);
            }
        }
    }

    // Timeout de caída de un nodo, al acabarse realiza una tirada, si supera el valor establecido, cae, y se llama a la función anterior, 
    // si no, se vuelve a llamar a sí misma
    // El temporizador no se llama al desactivar manualmente los nodos, per sí al caerse con probabilidad > 0.
    async tiempoCaidaNodo(){
        let vrand =  Paxos.velocidad * (Math.floor(Math.random() * 20)+10);
        let resultado = await this.timerCaida.start(vrand);
        if(resultado == 0){
            let rand = (Math.floor(Math.random() * 99)+1);
            if(rand < Paxos.probFalloNodo && !this.pausado && !this.consenso ){
                Paxos.numCaidas++;
                UI.desactivarNodo(this.id);
                
                await this.tiempoRecuperaNodo();
            }
            else{
                this.tiempoCaidaNodo();
            }
        }
    }

    //Controla si no se ha recibio un mensaje en un tiempo maximo, al expirar el temporizador se propone por si solo en el modo automático.
    async tiempoRecepcion(){
        let temp;
        if(Paxos.velocidad == 1000) temp = 1;
        else if (Paxos.velocidad == 500) temp = 4.5;
        else                  temp = 9;

        let vrand = (Math.floor(Math.random() *(Paxos.maxTiempoRespuesta - Paxos.minTiempoRespuesta + 1)) + Paxos.minTiempoRespuesta);
      
        await this.animaTemporizadorRecepcion(vrand/temp);
        if(Paxos.modoAuto && this.estado != "LIDER" && !this.consenso){
            UI.escribeLog(8, this.id);
            //let valorTemp = valoresProponer[Math.floor(Math.random() * valoresProponer.length)];
            //this.valorPropuesto = valorTemp;
            await this.proponer(null, -1) 
        }
        else if((this.estado == "LIDER" || this.estado == "PROPONENTE") && !this.consenso){
            UI.escribeLog(9, this.id);
            await this.proponer(this.valorPropuesto, this.ronda+1);               
        }
    }  
}

export {Nodo}

     
