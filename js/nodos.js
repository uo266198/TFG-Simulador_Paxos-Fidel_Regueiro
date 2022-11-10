import{Channel} from './channels.js'
import {nodos, quorum, rondaGlobal, velocidad, simPaused, modoAuto, probFalloNodo, wait, setRonda, timersInternos, 
    addTimerInterno, maxTiempoRespuesta, minTiempoRespuesta, valoresProponer, consensoFinal, addNumCaidas, addNumLideres} from './paxos.js';
import {desactivarNodo, setAceptador, setConsenso, activarNodo, escribeLog,setLider} from './ui.js';
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

        // Guarda la referencia a las animaciónes, necesario para pausar;
        this.waitAnim;

        this.contadorAceptadores = 1
        this.contadorAceptado = 1;
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
            this.timerRecepcion.resetTimerInterno()
            
            //this.mensajeRecbido = true;
            if(!this.pausado ){
                
                //Tiempo que tarda el nodo en procesar el mensaje
                await this.animaEspera();
                escribeLog(0, this.id, orig, msg);

                //MAQUINA DE ESTADOS
                if(this.estado == "ACEPTADOR"){
                    if(msg[0] > this.ronda && this.consenso) !this.consenso;
                
                    if(msg[0] == "PREPARA"){
                        //Ronda mayor que la actual, acepta  y envía el mensaje PROMESA
                        if(msg[1] > this.ronda){
                            setAceptador(this.id);
                            this.ronda = msg[1];

                            await this.enviar(["PROMESA",this.ronda,null], [orig], this.id);      // else       
                               
                        }   
                        else{
                            await this.enviar(["PROMESA",this.ronda ,this.valorPropuesto], [orig], this.id);     
                        }   
                    }

                    else if(msg[0] == "ACEPTAR"){
                        //Recibe el valor consensuado
                        //Si la ronda es igual a la mayor almacenada, y no hemos aceptado un valor con anterioridad
                        if(msg[1] == this.ronda && !this.aceptado){
                            this.valorPropuesto = msg[2];
                            this.contadorAceptado++;

                            this.aceptado = true;

                            var dest = [];
                            for(let i = 0; i<nodos.length ; i++){
                                dest.push(nodos[i].id);
                            }

                            await this.enviar(["ACEPTADO",this.ronda, this.valorPropuesto], dest, this.id)

                        }
                    }  

                    else if(msg[0] == "ACEPTADO"){
                        this.contadorAceptado++;
                        if(this.contadorAceptado>=quorum){
                            this.aceptado = false;
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
                        setAceptador(this.id);
                        this.ronda = msg[1];

                        //Si el mensaje es PREPARA, podemos directamnete actuar como aceptadores y responder con la promesa
                        if(msg[0] == "PREPARA") await this.enviar(["PROMESA",this.ronda ,null], [orig], this.id);                             
                    
                        else if(msg[0] == "ACEPTAR"){
                            this.valorPropuesto = msg[2];
                            this.aceptado = true;
                            var dest = [];
                            for(let i = 0; i<nodos.length ; i++){
                                dest.push(nodos[i].id);
                            }

                            this.contadorAceptado++;

                           
                            await this.enviar(["ACEPTADO", this.ronda, this.valorPropuesto], dest, this.id)
                        }
       
                    }

                    else if(msg[0] == "PROMESA"){    
                        this.contadorAceptadores++;
                        console.log("ACEPTADORES ID"+this.id+" " + this.contadorAceptadores);
                        if(msg[1] > this.ronda){
                            this.ronda = msg[1];
                            if(msg[2] != null) this.valorPropuesto = msg[2];
                            setAceptador(this.id);
                            
                        }
                        else if(this.contadorAceptadores >= quorum && !this.aceptado){
                            let valorTemp;
                            //Lo reseteamos y lo usamos para esperar al quorum de mensajes de los demás nodos.
                            this.contadorAceptadores = 1;
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
                            escribeLog(1, this.id)
                            await this.enviar(["ACEPTAR",this.ronda ,this.valorPropuesto], dest, this.id);
                        }
                    }

                    else if(msg[0] == "PREPARA" ){
                        if(msg[1] > this.ronda){
                            if(msg[2] != null) this.valorPropuesto = msg[2];
                            setAceptador(this.id);
                            this.ronda = msg[1];
                            await this.enviar(["PROMESA",this.ronda, null], [orig], this.id);         
                        }
                    }

                    else if(msg[0] == "ACEPTADO"){
                        this.contadorAceptado++;

                        if(this.contadorAceptado >= quorum){
                            setConsenso(this.id);
                            consensoFinal();
                            escribeLog(2, this.id)    
                        }
                    }
                }
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

    async animaEspera(){
        let circuloAnim = document.getElementById("progreso"+this.id);
        let circunferencia = circuloAnim.getAttribute("r")*2*Math.PI;

        circuloAnim.style.strokeDasharray = `${circunferencia} ${circunferencia}`;
        circuloAnim.style.visibility = "visible";

        let velAnimEspera = velocidad*2

        this.waitAnim = anime({
            targets:  circuloAnim,
            strokeDashoffset: [circunferencia, 0],
            easing: 'linear', 
            duration: velAnimEspera,
            autoplay: false,
        });
            
        
        this.waitAnim.play();

        await this.waitAnim.finished;
        circuloAnim.style.visibility = "hidden";
    }  

    async liderPropone(propuesto, nuevaRonda){

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
        

        let msg =["PREPARA",this.ronda,null]
        
        $('#rondaGlobal').text(rondaGlobal);
        if(propuesto !=undefined ){
            this.valorPropuesto = propuesto;
        }
        setLider(this.id);

        await this.red.enviar(msg, destino, this.id);
        
    }


/////   GESTION DE TIMERS INTERNOS   /////

    // Tirada para recuperar el nodo de vuelta. 
    async tiempoRecuperaNodo (){
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
            //console.log("Timer de caida finaliza "+this.id)
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
    async tiempoRecepcion(reset){

        let vrand = (Math.floor(Math.random() *(maxTiempoRespuesta - minTiempoRespuesta + 1))+ minTiempoRespuesta);
        //console.log(vrand*(velocidad/1000)/1000);
        let resultado = await this.timerRecepcion.start(vrand*(velocidad/1000));
        if(resultado == 0){
            if(modoAuto && this.estado != "LIDER"){
                escribeLog(8, this.id);
                let valorTemp = valoresProponer[Math.floor(Math.random() * valoresProponer.length)];
                this.valorPropuesto = valorTemp;
                await this.liderPropone(valorTemp, -1) 
            }
            else if(this.estado == "LIDER"){
                escribeLog(9, this.id);
                await this.liderPropone(this.valorPropuesto, this.ronda+1);               
            }
        }
    }  
}

export {Nodo}

     