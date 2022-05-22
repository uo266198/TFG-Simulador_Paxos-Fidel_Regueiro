//Esta clase representa un nodo ejecutado en un hilo.
var id;
var enUso = false;
var estado = "INICIADO";
var rondaRecibida = 0;
var iniciado = false
//var canalMensajes;



self.onmessage = event =>{
    if(!iniciado){
        //canalMensajes = new BroadcastChannel(event.data);
        id = event.data;
        iniciado = true
        console.log(event.data);
        
    }
    else{
        console.log("asd");
        reciboMensaje(event); 
    }
}



function reciboMensaje(mensaje){
        console.log(mensaje);
}

     