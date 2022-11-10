import {wait, velocidad, simPaused} from './paxos.js';

class TimerInterno {
    constructor(id, tipo){
        this.tipo = tipo;
        this.id = id;
        this.tiempo;
        this.tiempoActual = 0;
        this.velocidadInterna = velocidad;
    }

    //Devuelve 0 si ha acabado normalmente y 1 si se ha pausado la simulación
    async start(time) {
        
        if(this.tiempoActual == 0){
            this.tiempoInicial = time;
        }

        this.tiempo = time;
        this.tiempoActual = this.tiempoActual + 100;

        await wait(100);

        if(this.tiempoActual >= this.tiempo){
            this.resetTimerInterno();
            return 0;
        }
        else if(simPaused){
            while(simPaused){
                await wait(100);
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