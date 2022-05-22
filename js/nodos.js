export  class Nodo{
    constructor(id, x, y) {
        this.id = id;
        this.enUso = true;
        this.x=x;
        this.y=y;
        this.estado = "INICIADO";
        this.canal;
    }

    desactivar(){
        this.ref.css("fill","rgb(128,128,128)")
        this.enUso = false;
        escribeLog("El nodo "+ this.id + " está suspendido.")
        this.prueba();
    }


    activar(){
        this.ref.css("fill","rgb(57, 109, 242)");
        this.enUso = true;
        escribeLog("El nodo "+ this.id + " se ha reactivado.")
    }

    setProponente(){
        this.ref.css("fill","rgb(255, 153, 255)");
        this.estado = "PROPONENTE";
    }

    setPorDefecto(){
        this.ref.css("fill","rgb(255, 153, 255)");
    }


}

     