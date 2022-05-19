import CanalMensajes from "./canalMensajes.js";
import Mensaje from   "./mensaje.js";

export default class Nodo{
    constructor(id, x, y) {
        this.id = id;
        this.enUso = true;
        this.x=x;
        this.y=y;
        this.estado = "ACEPTADOR";
        this.rondaRecibida = 0;
        this.ref;
        this.quorum;
        this.canal = new CanalMensajes(this.id);

    }

    desactivar(){
        this.ref.css("fill","rgb(128,128,128)")
        this.enUso = false;
    }


    activar(){
        this.ref.css("fill","rgb(57, 109, 242)");
        this.enUso = true;
    }

    setProponente(){
        this.ref.css("fill","rgb(255, 153, 255)");
        this.estado = "PROPONENTE";
    }

    serPorDefecto(){
        this.ref.css("fill","rgb(255, 153, 255)");
    }

}

     