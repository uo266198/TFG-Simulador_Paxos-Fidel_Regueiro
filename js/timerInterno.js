import {Paxos} from './paxos.js';

// Permite crear temporizadores para espera asíncrona.
class TimerInterno {
    constructor(id, tipo){
        this.tipo = tipo;
        this.id = id;
        this.tiempo;
        this.tiempoActual = 0;
        this.velocidadInterna = Paxos.velocidad;
    }

    //Devuelve 0 si ha acabado normalmente y 1 si se ha pausado la simulación, hace la comprobación cada 100 ms
    async start(time) {
        
        if(this.tiempoActual == 0){
            this.tiempoInicial = time;
        }

        this.tiempo = time;
        this.tiempoActual = this.tiempoActual + 100;

        await Paxos.wait(100);

        if(this.tiempoActual >= this.tiempo){
            this.resetTimerInterno();
            return 0;
        }
        else if(Paxos.simPaused){
            while(Paxos.simPaused){
                await Paxos.wait(100);
            }
        }
        return await this.start(this.tiempo);
    }

    resetTimerInterno(){
        this.tiempoActual = 0;
        this.tiempo = this.tiempoInicial;
        
    }
}

export {TimerInterno}