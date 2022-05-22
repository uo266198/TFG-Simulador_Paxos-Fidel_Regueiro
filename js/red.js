//ESTA CLASE NO SE USA DE MOMENTO
//A l hacer esta clase como intermediaria entre  entre la red y los nodos, (si se ejecuta como worker) al ejecutarse en otro hilo, pierde el acceso al contexto del hilo principal
// y por lo tanto a cualquier evento que modifique la interfaz

var probFalloRed = 0;
var workersRed = [];
var nodos = [];
var iniciado = false;




self.onmessage = event =>{

 
   
}


function reciboMensajeRed(mensajeRed){
    switch(mensajeRed.data.tipoMensaje){
        case("PREPARA"):
            console.log("LA RED HA RECIBIDO PREPARA DE PARTE DEL NODO " + mensajeRed.data.sourceId);
            enviaBroadcast();
            break;
        
    }
}

function creaWorkers(numNodos){
    for(let i = 0; i<numNodos; i++ ){
        let nodoWorker = new Worker("/js/nodosWorker.js");
        workersRed.push(nodoWorker);
        nodoWorker.postMessage(i);
        nodos[i] = {id: i, estado: "INICIADO", enUso: true};
    }
}

function falloRed(){

}

function enviaBroadcast(){
    workersRed.forEach(worker => {
        worker.postMessage("AAAAA");
    });
}

