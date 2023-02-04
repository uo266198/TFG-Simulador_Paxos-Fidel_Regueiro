import {Nodo} from './nodos.js';
import {Timer} from './timer.js';
import {UI} from './ui.js';
import {Red} from './red.js';

class Paxos{
    static numNodos = 3;
    static red1;
    static red2;
        
    static modoAuto;
    static simPaused;
    static hayParticion = false;
    static fin = false;
    static probFalloNodo = 0;
    static probFalloRed = 0;

    static maxTiempoRespuesta = 30000;
    static minTiempoRespuesta = 10000;

    static velocidad = 1000;

    static timerSim = new Timer(this.velocidad);

    static valoresProponer = ["Casa", "Coche", "Perro", "Insecto", "Lámpara"];
    static nodos = [];
    static timersInternos = [];

    static tasks = [];

    static quorum;
    static rondaGlobal = -1;

    static mensajesPerdidos = 0;
    static mensajesTotales = 0;
    static numLideres = 0;
    static numCaidas = 0;

    static mensajesEnEnvio = new Map();

    static inicio(auto){
        $("#modalInicio").modal('hide');
        this.modoAuto = auto;
        this.quorum = Math.floor(this.numNodos/2)+1;
        UI.creaPoligono(this.numNodos);
        this.iniciaRed();
        UI.reanudaSim();
        
        if(auto){
            this.probFalloNodo = 12;
            this.probFalloRed = 10;
            UI.desactivaBotonesAuto();
            UI.escribeLog(-1,null,null,"Uno o varios nodos se propondrán automáticamente.");
        }   
        else UI.escribeLog(-1,null,null,"Esperando una propuesta manual.");

        localStorage.setItem("numNodos", this.numNodos);
        localStorage.setItem("velocidad", this.velocidad);
        localStorage.setItem("modoAuto", this.modoAuto);
    }
  
    static async iniciaRed(){
        this.red1 = new Red();
        this.red2 = new Red();
        

        for(let i=0; i < this.numNodos; i++){
            var n = new Nodo(i, this.red1);
            this.nodos.push(n);
            this.tasks.push(this.red1);
            this.red1.registrarNodo(n);
        }
        const x = await Promise.all(this.tasks.map((x)=>x.bucleSimulacion()));
    }

    //Añade a la lista de temporizadores interno uno nuevo.
    static addTimerInterno(timer){
        this.timersInternos.push(timer);
    }

    static async wait(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    static async consensoFinal(){
        if(this.modoAuto){
            let contadorConsenso = 0
            for(let i=0; i<this.numNodos; i++){
                if(this.nodos[i].consenso){
                    contadorConsenso++
                    console.log("Consensos: "+contadorConsenso)
                }
            }
    
            if(contadorConsenso == this.numNodos && !this.fin){
                this.fin = true;  
                UI.desactivaBotonesFin();   
                UI.pausaSim();
                UI.escribeLog(10);
                UI.statsFinales();
                UI.openModalEstadisticas();
            }
        }
       
    }
}


//Inicio de la simulación
UI.valoresGuardados();
UI.openModalInicio();

export {Paxos}