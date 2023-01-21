import{Channel} from './channels.js'
import {nodos, quorum, rondaGlobal, velocidad, simPaused, modoAuto, probFalloNodo, wait, setRonda, timersInternos, 
    addTimerInterno, maxTiempoRespuesta, minTiempoRespuesta, valoresProponer, consensoFinal, addNumCaidas, addNumLideres} from './paxos.js';
import {desactivarNodo, setPreparado, setConsenso, activarNodo, escribeLog, setLider, muestraTextoLider, setPropuesto, setProponente} from './ui.js';
import {TimerInterno} from './timerInterno.js';


class Nodo {
    constructor(id, red) {
        this.id = id;
        this.red = red;
        this.recv_chn = new Channel();
        this.bucle_simulacion();

        //  Flags internos  //
        this.pausado = false;
        this.aceptado = false;
        this.mensajeRecbido = false;
        this.consenso = false;
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

        addTimerInterno(this.timerCaida);
        addTimerInterno(this.timerRecuperacion);
        addTimerInterno(this.timerRecepcion);
    
        if(modoAuto){
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
    async recepcion_mensajes() {   
        while (this.running) {
            let msg = [];
            let orig;
            
            [msg, orig] = await this.recv_chn.shift();
            
            if(!this.pausado ){
                
                if(modoAuto){
                    if(this.waitAnim == undefined ||  this.waitAnim.completed ) this.tiempoRecepcion();
                    else this.waitAnim.restart();
                }

                //await this.tiempoRecepcion();
                escribeLog(0, this.id, orig, msg);

                //Estado 1: ACEPTADOR: ha de recibir un mensaje de preparación. Envía promesa. Si ya se ha comprometido, recibe el valor y envía el OK (ACEPTACIÓN) de vuelta al líder.
                if(this.estado == "ACEPTADOR"){
                    if(msg[0] == "PREPARACION"){            // Mensaje de compromiso con un líder
                        if(msg[1] > this.ronda){            // Recibo una ronda mayor que la última que he recibido.
                            setPreparado(this.id);          // Me he comprometido a un líder.
                            this.ronda = msg[1];
                            await this.enviar(["PROMESA",this.ronda,null], [orig], this.id);      // else          
                        }  
                        
                        else{                               // La ronda que recibo es inferior a la última que haya visto.
                            // Indico al nodo que envió la promesa que ya me he comprometido con un valor y una ronda mayor
                            await this.enviar(["PROMESA",this.ronda ,this.valorPropuesto], [orig], this.id);  
                        }   
                    }

                    else if(msg[0] == "PROPUESTA"){         // Tras comprometerse con un líder, recibo el valor del consenso
                        if(msg[1] > this.ronda){           // Ronda mayor, por lo tanto debo considerar este mensaje como nuevo compromiso
                            this.ronda = msg[1];
                            this.valorPropuesto = msg[2];
                            setPropuesto(this.id)           //Cambiamos el color a amarillo para que sepamos que ya ha obtenido un valor
                            
                            //Envío del mensaje ACEPTACION que cofirma que hemos recibido el valor a consensuar a todos los demás nodos. (Líder incluido)
                            var dest = [];
                            for(let i = 0; i<nodos.length ; i++){
                                dest.push(nodos[i].id);
                            }
                            setPropuesto(this.id);
                            await this.enviar(["ACEPTACION",this.ronda, this.valorPropuesto], dest, this.id)
                        }
                        else{
                            this.valorPropuesto = msg[2];
                            var dest = [];
                            for(let i = 0; i<nodos.length ; i++){
                                dest.push(nodos[i].id);
                            }
                            setPropuesto(this.id);
                            await this.enviar(["ACEPTACION",this.ronda, this.valorPropuesto], dest, this.id)
                        }

                        this.contadorMensajes ++;
                        if(this.contadorMensajes>=quorum){
                            setConsenso(this.id);
                            escribeLog(2, this.id)  
                            consensoFinal();
                        }
                        
                    }

                    else if(msg[0] == "ACEPTACION"){        //Mensaje recibido por parte de los demás nodos de la red que confirman en valor de consenso.
                        this.contadorMensajes++;
                        if(this.contadorMensajes>=quorum){  //Consenso
                            //this.aceptado = false;
                            setConsenso(this.id);
                            escribeLog(2, this.id)  
                            consensoFinal();
                        }     
                    }
                } //FIN aceptador

                //Estado 2: Proponente: envía el mensaje de preparación y recibe las promesas por parte de los aceptadores. Al recibir una mayoría se sitúa como líder.
                else if(this.estado == "PROPONENTE"){
                    if(msg[0] == "PROMESA"){                // Mensaje enviado por un aceptador que confirma su promesa a aceptar el valor que envíe este nodo si se convierte en líder
                        this.contadorMensajes++;            // De consenso
                        console.log(this.contadorMensajes);
                        //console.log("ACEPTADORES ID"+this.id+" " + this.contadorMensajes);
                        if(msg[1] > this.ronda){            // En este caso, el nodo ya se había comprometido con un proponente con una ronda mayor, por lo tanto este nodo copia la ronda y el valor
                            this.ronda = msg[1];            // y lo envía a los demás nodos.
                            if(msg[2] != null) this.valorPropuesto = msg[2];
                            this.contadorMensajes = 2;      //Él mismo y el recibido.

                            var dest = [];
                            for(let i = 0; i<nodos.length ; i++){
                                dest.push(nodos[i].id);
                            }
                            setPropuesto(this.id);
                            await this.enviar(["ACEPTACION",this.ronda, this.valorPropuesto], dest, this.id)
                            //setPreparado(this.id);
                            
                        }
                        else if(this.contadorMensajes >= quorum){
                            console.log("QUE")
                            setLider(this.id, this.ronda);
                            this.contadorMensajes = 1;
                            let valorTemp;
                            //Lo reseteamos y lo usamos para esperar al quorum de mensajes de los demás nodos.
                            this.contadorMensajes = 1;
                            if(this.valorPropuesto == undefined){
                                this.aceptado = true;

                                //Un valor aleatorio de la lista de cadenas de texto
                                valorTemp = valoresProponer[Math.floor(Math.random() * valoresProponer.length)];
                                this.valorPropuesto = valorTemp;
                                
                            }

                            var dest = [];
                            for(let i = 0; i<nodos.length ; i++){
                                dest.push(nodos[i].id);
                            }

                            await this.enviar(["PROPUESTA", this.ronda, this.valorPropuesto], dest, this.id)
                        }
                    }

                    else if(msg[0] == "ACEPTACION"){
                        this.contadorMensajes++;

                        if(this.contadorMensajes >= quorum){
                            setConsenso(this.id);
                            consensoFinal();
                            escribeLog(2, this.id)    
                        }
                    }
                    
                    //Ya que en esta versión del protocolo un Proponente es a su vez un aprendiz, se da el caso de que un proponente tenga que pasar a ser aceptador
                    else if(msg[0] == "PREPARACION"){
                        if(msg[1] > this.ronda){
                            setPreparado(this.id);          // Me he comprometido a un líder.
                            this.ronda = msg[1];
                            await this.enviar(["PROMESA",this.ronda,null], [orig], this.id);     
                        }        
                    }
                }

                else if(this.estado == "LIDER"){
                    if(msg[0] == "ACEPTACION"){
                        this.contadorMensajes++;
                        if(this.contadorMensajes >= quorum){
                            setConsenso(this.id);
                            consensoFinal();
                            escribeLog(2, this.id)    
                        }
                    }
                }/*

                /*
                //MAQUINA DE ESTADOS
                if(this.estado == "ACEPTADOR"){
                    if(msg[0] > this.ronda && this.consenso) !this.consenso;
                
                    if(msg[0] == "PREPARACION"){
                        //Ronda mayor que la actual, acepta  y envía el mensaje PROMESA
                        if(msg[1] > this.ronda){
                            setPreparado(this.id);
                            this.ronda = msg[1];

                            await this.enviar(["PROMESA",this.ronda,null], [orig], this.id);      // else       
                               
                        }   
                        else{
                            await this.enviar(["PROMESA",this.ronda ,this.valorPropuesto], [orig], this.id);     
                        }   
                    }

                    else if(msg[0] == "PROPUESTA"){
                        //Recibe el valor consensuado
                        //Si la ronda es igual a la mayor almacenada, y no hemos aceptado un valor con anterioridad
                        if(msg[1] == this.ronda && !this.aceptado){
                            this.valorPropuesto = msg[2];
                            this.contadorMensajes++;

                            this.aceptado = true;

                            var dest = [];
                            for(let i = 0; i<nodos.length ; i++){
                                dest.push(nodos[i].id);
                            }
                            setPropuesto(this.id);
                            await this.enviar(["ACEPTACION",this.ronda, this.valorPropuesto], dest, this.id)
                            
                            if(this.contadorMensajes>=quorum){
                                //this.aceptado = false;
                                setConsenso(this.id);
                                escribeLog(2, this.id)  
                                consensoFinal();
                            }   
                        }
                    }  

                    else if(msg[0] == "ACEPTACION"){
                        this.contadorMensajes++;
                        if(this.contadorMensajes>=quorum){
                            //this.aceptado = false;
                            setConsenso(this.id);
                            escribeLog(2, this.id)  
                            consensoFinal();
                        }          
                    }
                }

                //Recordad que para esta simulación, proponente y lider son "lo mismo"
                if(this.estado == "LIDER"){

                    // Si llega un mensaje con una ronda mayor, sea del tipo que sea, ya no podemos ser líderes
                    // Nos volvemos aceptadores de ese valor.
                   if(msg[1]>this.ronda){
                        setPreparado(this.id);
                        this.ronda = msg[1];

                        //Si el mensaje es PREPARACION, podemos directamnete actuar como aceptadores y responder con la promesa
                        if(msg[0] == "PREPARACION") await this.enviar(["PROMESA",this.ronda ,null], [orig], this.id);                             
                    
                        else if(msg[0] == "ACEPTA"){
                            this.valorPropuesto = msg[2];
                            this.aceptado = true;
                            var dest = [];
                            for(let i = 0; i<nodos.length ; i++){
                                dest.push(nodos[i].id);
                            }

                            this.contadorMensajes++;

                           
                            await this.enviar(["ACEPTACION", this.ronda, this.valorPropuesto], dest, this.id)
                        }
       
                    }

                    else if(msg[0] == "PROMESA"){    
                        this.contadorMensajes++;
                        console.log("ACEPTADORES ID"+this.id+" " + this.contadorMensajes);
                        if(msg[1] > this.ronda){
                            this.ronda = msg[1];
                            if(msg[2] != null) this.valorPropuesto = msg[2];
                            setPreparado(this.id);
                            
                        }
                        else if(this.contadorMensajes >= quorum && !this.aceptado){
                            let valorTemp;
                            //Lo reseteamos y lo usamos para esperar al quorum de mensajes de los demás nodos.
                            this.contadorMensajes = 1;
                            if(this.valorPropuesto == undefined){
                                this.aceptado = true;

                                //Un valor aleatorio de la lista de cadenas de texto
                                valorTemp = valoresProponer[Math.floor(Math.random() * valores.length)];
                                this.valorPropuesto = valorTemp;
                            }
                            this.aceptado = true;

                            var dest = [];
                            for(let i = 0; i<nodos.length ; i++){
                                dest.push(nodos[i].id);
                            }
                            setLider(this.id);
                            this.contadorMensajes = 1;
                            escribeLog(1, this.id)
                            await this.enviar(["PROPUESTA",this.ronda ,this.valorPropuesto], dest, this.id);
                        }
                    }

                    else if(msg[0] == "PREPARACION" ){
                        if(msg[1] > this.ronda){
                            if(msg[2] != null) this.valorPropuesto = msg[2];
                            setPreparado(this.id);
                            this.ronda = msg[1];
                            await this.enviar(["PROMESA",this.ronda, null], [orig], this.id);         
                        }
                    }

                    else if(msg[0] == "ACEPTACION"){
                        this.contadorMensajes++;

                        if(this.contadorMensajes >= quorum){
                            setConsenso(this.id);
                            consensoFinal();
                            escribeLog(2, this.id)    
                        }
                    }
                }
            } */
            }
        }  
    }
    
    async bucle_simulacion() {
        this.running = true;
        await Promise.all([this.recepcion_mensajes()])
    }

    detener_simulacion() {
        this.running = false;
        this.recv_chn.push(["FIN_SIMULACION", -1]);
    }

    async animaTemporizadorRecepcion(tiempo){
        console.log("a");
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
              
        if(!simPaused){
            this.waitAnim.play();
        }

        await this.waitAnim.finished;
        //circuloAnim.style.visibility = "hidden";
    }  

    async proponer(propuesto, nuevaRonda){ 

        addNumLideres();
        if(this.pausado) activarNodo(this.id);
        let destino = [];
        for(let i=0; i<nodos.length; i++){
            if(i != this.id){
                destino.push(nodos[i].id);
            }
        }
        if(modoAuto){
            if(nuevaRonda > rondaGlobal){
                setRonda(nuevaRonda);
                this.ronda = nuevaRonda;
            }
            else{
                setRonda(rondaGlobal + 1);
                this.ronda = rondaGlobal;
            };
           
        } 
        else{
            if(nuevaRonda > rondaGlobal) setRonda(nuevaRonda);
            this.ronda = nuevaRonda;
        }
        

        let msg =["PREPARACION",this.ronda,null]
        
        $('#rondaGlobal').text(rondaGlobal);
        if(propuesto !=undefined ){
            this.valorPropuesto = propuesto;
        }

        setProponente(this.id, this.ronda);
        this.estado = "PROPONENTE";

        await this.red.enviar(msg, destino, this.id);
        
    }


/////   GESTION DE TIMERS INTERNOS   /////

    // Tirada para recuperar el nodo de vuelta. 
    async tiempoRecuperaNodo (){
        this.waitAnim.pause();
        let vrand =  velocidad * (Math.floor(Math.random() * 3)+5);

        let resultado = await this.timerRecuperacion.start(vrand);
        if(resultado == 0){
            console.log("Timer de recu finaliza "+this.id)
            let rand = (Math.floor(Math.random() * 101));
            if(rand <= 50 && this.pausado  ){ 
                this.timerRecuperacion.resetTimerInterno();
                this.tiempoRecuperaNodo();
            }
            else{
                this.waitAnim.play();
                activarNodo(this.id);
            }
        }
    }

    // Timeout de caída de un nodo, al acabarse realiza una tirada, si supera el valor establecido, cae, y se llama a la función anterior, 
    // si no, se vuelve a llamar a sí misma
    // El temporizador no se llama al desactivar manualmente los nodos, per sí al caerse con probabilidad > 0.
    async tiempoCaidaNodo(){
        let vrand =  velocidad * (Math.floor(Math.random() * 20)+10);
        let resultado = await this.timerCaida.start(vrand);
        if(resultado == 0){
            let rand = (Math.floor(Math.random() * 99)+1);
            if(rand < probFalloNodo && !this.pausado && !this.consenso ){
                addNumCaidas();
                desactivarNodo(this.id);
                
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
        if(velocidad == 1000) temp = 1;
        else if (velocidad == 500) temp = 4.5;
        else                  temp = 9;

        let vrand = (Math.floor(Math.random() *(maxTiempoRespuesta - minTiempoRespuesta + 1))+ minTiempoRespuesta);
      
        await this.animaTemporizadorRecepcion(vrand/temp);
        if(modoAuto && this.estado != "LIDER" && !this.consenso){
            escribeLog(8, this.id);
            //let valorTemp = valoresProponer[Math.floor(Math.random() * valoresProponer.length)];
            //this.valorPropuesto = valorTemp;
            await this.proponer(null, -1) 
        }
        else if((this.estado == "LIDER" || this.estado == "PROPONENTE") && !this.consenso){
            escribeLog(9, this.id);
            await this.proponer(this.valorPropuesto, this.ronda+1);               
        }
    }  
}

export {Nodo}

     