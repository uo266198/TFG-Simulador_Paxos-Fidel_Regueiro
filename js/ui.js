import{Paxos} from "./paxos.js";

class UI{
    static svgNS = "http://www.w3.org/2000/svg"; 
    static nodoDist = 7;
    static radio = 2;
    static colorNodos = "gray";
    static actual = -1;
    static idMsgActual;
    static contIdentificaNodosAnim = 0;
    static timerCaidaEnUso = false;


    static creaCirculoAnim(og, dest, tipo, ronda, valor){
        var datos = [];
        //Nodos de origen y destino
        let nodoOg = document.getElementById("nodo"+og); 
        let nodoDest = document.getElementById("nodo"+dest); 
        
        //Posición de los nodos
        let posxOg = nodoOg.getAttribute("cx");
        let posyOg = nodoOg.getAttribute("cy");
    
        let posxDest = nodoDest.getAttribute("cx");
        let posyDest = nodoDest.getAttribute("cy");
        
        //Circulos que usaremos en las animaciones de datos.
        let circuloAnim = document.createElementNS(svgNS,"circle");
        circuloAnim.setAttribute("id","nodoAnim"+contIdentificaNodosAnim);
        circuloAnim.setAttribute("cx",posxOg);
        circuloAnim.setAttribute("cy",posyOg);
        circuloAnim.setAttribute("r",radio/4);
    
        circuloAnim.setAttribute("data-key", contIdentificaNodosAnim);
    
        //Tooltip
        circuloAnim.setAttribute("data-toggle","tooltip")
        circuloAnim.setAttribute("data-placement","left")
        circuloAnim.setAttribute("data-html","true")
    
        //No podemos evitar el envioo de mensajes en modo Auto
        if(!modoAuto)  circuloAnim.addEventListener("click", this.openModalMensajes);
       
        circuloAnim.setAttribute("title","<p> Mensaje: "+tipo+"</p><p> Origen: "+og+"</p><p> Destino: "+dest+"</p><p> Ronda: "+ronda+"</p><p> Valor: "+valor+"</p>");
    
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        });
    
        //El color cambia por el tipo de mensaje
        if(tipo == "PREPARACION" ){
            circuloAnim.setAttribute("fill","dodgerBlue");
        }
        else if(tipo == "PROMESA" ){
            circuloAnim.setAttribute("fill","LemonChiffon");
        }
        else if (tipo == "PROPUESTA"){
            circuloAnim.setAttribute("fill","greenYellow");
        }
        else if(tipo == "PERDIDO"){
            circuloAnim.setAttribute("fill","indianRed");
        }
        else if(tipo == "ACEPTACION"){
            circuloAnim.setAttribute("fill","LawnGreen");
        }
    
        document.getElementById("svgFrame").appendChild(circuloAnim);
            
        datos[0] = [posxOg, posyOg];
        datos[1] = [posxDest, posyDest];
        datos[2] = circuloAnim;
        datos[3] = contIdentificaNodosAnim;
        
        var msgs = {origen: og, destino: dest,  mensaje: tipo, ronda: ronda, valor: valor, perdido: false}
    
        Paxos.mensajesEnEnvio.set(contIdentificaNodosAnim.toString(), msgs);

        contIdentificaNodosAnim++;
    
        return datos;
    }

    // Crea el polígono regular que forman los distintos nodos según el número de estos y por lo tanto la posición de cada nodo.
    // También crea el círculo exterior que representa el temporizador interno de recepción de mensajes.
    static creaPoligono(){
        
        for (let i = 0; i <Paxos.numNodos; i++){
            let posX = Math.cos(i * 2 * Math.PI / Paxos.numNodos + Math.PI/2 - Math.PI/Paxos.numNodos) * this.nodoDist;
            let posY = Math.sin(i * 2 * Math.PI / Paxos.numNodos + Math.PI/2 - Math.PI/Paxos.numNodos) * this.nodoDist;

            //Circulo de progreso 
            let circuloProgreso =  document.createElementNS(this.svgNS,"circle");
            circuloProgreso.setAttribute("id","progreso"+i);
            circuloProgreso.setAttribute("class","circuloProgreso");
            circuloProgreso.setAttribute("cx",posX);
            circuloProgreso.setAttribute("cy",posY);
            circuloProgreso.setAttribute("r",this.radio+(this.radio/15));
            circuloProgreso.setAttribute("stroke-width",(this.radio)/8);
    
            document.getElementById("svgFrame").appendChild(circuloProgreso);

            let circulo = document.createElementNS(this.svgNS,"circle");
            circulo.setAttribute("id","nodo"+i);
            circulo.setAttribute("cx",posX);
            circulo.setAttribute("cy",posY);
            circulo.setAttribute("r",this.radio);
            circulo.setAttribute("fill",this.colorNodos);

            // Tooltip
            circulo.setAttribute("data-toggle","tooltip");
            circulo.setAttribute("data-placement","top");
            circulo.setAttribute("data-html","true");
            circulo.setAttribute("title","Nodo "+i);

            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            });
        
            //Añadimos un valor que distingue a cada nodo
            circulo.setAttribute("data-key", i);
            if(!Paxos.modoAuto) circulo.addEventListener("click", this.openModalInfo);
            circulo.addEventListener("mouseover", this.tooltipNodos);
            document.getElementById("svgFrame").appendChild(circulo);

            this.dibujaNombres(i, posX, posY); 
        }   
    }

    // Dibuja los nombres de cada nodo
    static dibujaNombres(id, posX, posY){
        var textoSVG = document.createElementNS(this.svgNS,"text"); 
        textoSVG.setAttributeNS(null,"id","textoSVG"+id);
        textoSVG.setAttributeNS(null,"x", posX);
        textoSVG.setAttributeNS(null,"y", posY - 0.9);
        textoSVG.setAttributeNS(null,"font-size",0.5);
        textoSVG.setAttributeNS(null,"text-anchor", "middle");
        textoSVG.setAttributeNS(null,"pointer-events","none");

        var texto = document.createTextNode("NODO "+id);
        
        textoSVG.appendChild(texto);
        document.getElementById("svgFrame").appendChild(textoSVG);   
    }


    //Pone por defecto los últimos valores seleccionados
    static valoresGuardados(){

        if(localStorage.getItem("numNodos") == null){ $("#dropDownValue").text("3"); }
        else { $("#dropDownValue").text(localStorage.getItem("numNodos")); }
    
        if(localStorage.getItem("velocidad") == null){ Paxos.timerSim.velocidad = 1000; }
        else { Paxos.timerSim.velocidad = localStorage.getItem("velocidad")}

        if(Paxos.timerSim.velocidad == 1000){
            $("#btnSpeedText").text("x1");
            Paxos.velocidad = 1000;
            //setVelocidad(1000);
        }
        else if(Paxos.timerSim.velocidad == 500){
            $("#btnSpeedText").text("x2");
            Paxos.velocidad = 500;
            //setVelocidad(500);
        }
        else if(Paxos.timerSim.velocidad == 250){
            $("#btnSpeedText").text("x3");
            Paxos.velocidad = 250;
            //setVelocidad(250);
        }

        if(localStorage.getItem("modoAuto") == "false"){
            document.getElementById("flexRadioDefault1").setAttribute("checked","true");
        }

        else{
            document.getElementById("flexRadioDefault2").setAttribute("checked","true");       
        }
    }

    //muestra la información del nodo
    static openModalInicio(){
        $("#modalInicio").modal('show');
    }

    static reanudaSim(){
        $("#btnPlay").attr('class', "btn btn-primary btn-sm ");
        $("#btnPlay").children('svg').children('path').attr('d', "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z");
    
        if(Paxos.simPaused){
            for(let i=0; i<nodos.length; i++){
                if(typeof nodos[i].waitAnim !== "undefined"){
                    nodos[i].waitAnim.play();
                }
                if(typeof nodos[i].red.animacionesRed.length != 0){
                    for(let j=0; j<nodos[i].red.animacionesRed.length; j++){
                        nodos[i].red.animacionesRed[j].play();
                    }
                }  
            } 
        }

        Paxos.simPaused = false;
        //setSimPaused(false);
        Paxos.timerSim.reanudaTimer();
    }

    // Tipo de mensajes
    static escribeLog(tipoMsg, og, dst, msg){
        if(tipoMsg == 0){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "recibe " +  "<a style=\"color:cyan\"> " +"["+ msg +"] " + "<a style=\"color:white\">" +" desde " + "<a style=\"color:green\"> " + "[" + dst + "]"+"</br>");
        }

        else if(tipoMsg == 1){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "ha llegado al quorum de aceptados. " +"</br>");
        }

        else if(tipoMsg == 2){
        $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "quorum de mensajes, consenso. " + "</br>");
        }

        else if(tipoMsg == 3){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "se pierde el paquete con destino " + "<a style=\"color:green\"> " + "[" + dst + "]"+"</br>");
        }

        else if(tipoMsg == 4){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "está desactivado. " + "</br>");
        }

        else if(tipoMsg == 5){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "se ha vuelto a activar. " + "</br>");
        }

        else if(tipoMsg == 6){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "se ha vuelto a activar. " + "</br>");
        }

        else if(tipoMsg == 7){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "se propone como líder. " + "</br>");
        }

        else if(tipoMsg == 8){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "se propone como líder al expirar el temporizador interno. " + "</br>");
        }

        else if(tipoMsg == 9){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "vuelve a proponerse al expirar el temporizador interno. " + "</br>");
        }

        else if(tipoMsg == 10){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " +"TODOS LOS NODOS HAN LLEGADO AL CONSENSO" + "<a style=\"color:white\">" + 
            "</br>");
        }

        else if(tipoMsg == 11){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "se pierde el paquete con destino " + "<a style=\"color:green\"> " + "[" + dst + "]"+" debido a la partición de red.</br>");
        }

        else if(tipoMsg == 12){
            $("#logText").append("<div style=\"color:yellow\">"+"["+Paxos.timerSim.getTimeString()+"] " + "<a style=\"color:green\"> " + "["+ og + "] " + "<a style=\"color:white\">" + 
            "es elegido líder." + "<a style=\"color:green\"> " +"</br>");
        }

        else if(tipoMsg == -1){
            $("#logText").append(msg+"</br>");
        }
    }

    static desactivaBotonesAuto(){
        $('#probCaida').html( "Probabilidad de fallo de un nodo: " + Paxos.probFalloNodo + "%" );
        $('#probPerdida').html( "Probabilidad de pérdida de paquetes: " +  Paxos.probFalloRed  + "%" );
        $("#btnProponer").attr('disabled', 'disabled');
    }

    static setProponente(id){
        if(!Paxos.modoAuto) this.escribeLog(7,id);
        Paxos.nodos[id].estado = "PROPONENTE";
        $("#nodo"+id).css("fill","Yellow");
        this.quitaTextoLider(id);
    }
    
    //Quita el texto  del lider
    static quitaTextoLider(id){
        if(document.getElementById("newTextoSVG"+id) != null)  document.getElementById("newTextoSVG"+id).remove();
    }

    //Crea el circulo que representa el envío de datos
    static creaCirculoAnim(og, dest, tipo, ronda, valor){
        var datos = [];
        //Nodos de origen y destino
        let nodoOg = document.getElementById("nodo"+og); 
        let nodoDest = document.getElementById("nodo"+dest); 
        
        //Posición de los nodos
        let posxOg = nodoOg.getAttribute("cx");
        let posyOg = nodoOg.getAttribute("cy");

        let posxDest = nodoDest.getAttribute("cx");
        let posyDest = nodoDest.getAttribute("cy");
        
        //Circulos que usaremos en las animaciones de datos.
        let circuloAnim = document.createElementNS(this.svgNS,"circle");
        circuloAnim.setAttribute("id","nodoAnim"+this.contIdentificaNodosAnim);
        circuloAnim.setAttribute("cx",posxOg);
        circuloAnim.setAttribute("cy",posyOg);
        circuloAnim.setAttribute("r",this.radio/4);

        circuloAnim.setAttribute("data-key", this.contIdentificaNodosAnim);

        //Tooltip
        circuloAnim.setAttribute("data-toggle","tooltip")
        circuloAnim.setAttribute("data-placement","left")
        circuloAnim.setAttribute("data-html","true")

        //No podemos evitar el envioo de mensajes en modo Auto
        if(!Paxos.modoAuto)  circuloAnim.addEventListener("click", this.openModalMensajes);
    
        circuloAnim.setAttribute("title","<p> Mensaje: "+tipo+"</p><p> Origen: "+og+"</p><p> Destino: "+dest+"</p><p> Ronda: "+ronda+"</p><p> Valor: "+valor+"</p>");

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        });

        //El color cambia por el tipo de mensaje
        if(tipo == "PREPARACION" ){
            circuloAnim.setAttribute("fill","dodgerBlue");
        }
        else if(tipo == "PROMESA" ){
            circuloAnim.setAttribute("fill","LemonChiffon");
        }
        else if (tipo == "PROPUESTA"){
            circuloAnim.setAttribute("fill","greenYellow");
        }
        else if(tipo == "PERDIDO"){
            circuloAnim.setAttribute("fill","indianRed");
        }
        else if(tipo == "ACEPTACION"){
            circuloAnim.setAttribute("fill","LawnGreen");
        }

        document.getElementById("svgFrame").appendChild(circuloAnim);
            
        datos[0] = [posxOg, posyOg];
        datos[1] = [posxDest, posyDest];
        datos[2] = circuloAnim;
        datos[3] = this.contIdentificaNodosAnim;
        
        var msgs = {origen: og, destino: dest,  mensaje: tipo, ronda: ronda, valor: valor, perdido: false}

        Paxos.mensajesEnEnvio.set(this.contIdentificaNodosAnim.toString(), msgs);

        this.contIdentificaNodosAnim++;
        return datos;
    }

    static setComprometido(id){ 
        //Cambia el color 
        $("#nodo"+id).css("fill","steelBlue");
        Paxos.nodos[id].estado = "ACEPTADOR";
        this.quitaTextoLider(id);
    }

    static setLider(id, ronda){
        if(!Paxos.modoAuto) this.escribeLog(12,id);
        Paxos.nodos[id].estado = "LIDER";
        this.muestraTextoLider(id, ronda);
    }

    //Modifica el texto del nodo lider para indicar su estatus
    static muestraTextoLider(id, ronda){
        $("#nodo"+id).css("fill", "gold");
        let nodo = document.getElementById("nodo"+id);
        let posx = nodo.getAttribute("cx");
        let posy = nodo.getAttribute("cy");

        let liderTextoSVG = document.createElementNS(this.svgNS,"text"); 
        liderTextoSVG.setAttribute("x", posx);
        liderTextoSVG.setAttribute("y", parseFloat(posy) - 0.3);
        liderTextoSVG.setAttribute("id","newTextoSVG"+id);
        liderTextoSVG.setAttribute("font-size",0.4);
        liderTextoSVG.setAttribute("text-anchor", "middle");
        liderTextoSVG.setAttribute("pointer-events","none");

        let texto = document.createTextNode("LIDER ["+ronda+"]");
        let frame = document.getElementById("svgFrame");
        liderTextoSVG.appendChild(texto);
        frame.appendChild(liderTextoSVG); 
    }

    
    static setPropuesto(id){ 
        //Cambia el color 
        $("#nodo"+id).css("fill","Yellow");
        Paxos.nodos[id].estado = "ACEPTADOR";
        this.quitaTextoLider(id);
    }

    static setConsenso(id){
        //Cambia el color
        $("#nodo"+id).css("fill","darkGreen");
        Paxos.nodos[id].consenso = true;
        Paxos.nodos[id].aceptado = false;
        Paxos.nodos[id].contadorAceptadores = 1;
        Paxos.nodos[id].contadorAceptado = 1;
        this.quitaTextoLider(id); 
    }

    static actualizaRonda(){
        $('#rondaGlobal').text(Paxos.rondaGlobal);
    }

    static desactivarNodo(id){
        //Cambia el color
        $("#nodo"+id).css("fill","red");
        Paxos.nodos[id].pausado = true;
        $("#modalPausado").text("Pausado/Caído:       "+ Paxos.nodos[id].pausado);
        this.escribeLog(4, id)
    }

    static activarNodo(id){
        //Cambia el color
        if(Paxos.nodos[id].consenso) $("#nodo"+id).css("fill","green");
        else if(Paxos.nodos[id].estado == "ACEPTADOR" && Paxos.nodos[id].ronda != -1){
            if(Paxos.nodos[id].valorPropuesto != null) $("#nodo"+id).css("fill","yellow");
            else $("#nodo"+id).css("fill","steelBlue");
        } 
        else if(Paxos.nodos[id].estado == "LIDER") $("#nodo"+id).css("fill","gold");
        else $("#nodo"+id).css("fill",this.colorNodos);
        
        Paxos.nodos[id].pausado = false;
        this.escribeLog(5, id)
    } 

    //Devuelve todos los nodos a la misma red y borra las particiones
    static eliminaParticion(){
        Paxos.hayParticion = false;
        Paxos.red1.borrarNodos();
        Paxos.red2.borrarNodos();

        document.getElementById("svgPart").remove();
        $("#btnPartir").children('span').text("Crear Partición");
        $("#btnPartir").children('svg').children("path").attr("d","M3.5 3.5c-.614-.884-.074-1.962.858-2.5L8 7.226 11.642 1c.932.538 1.472 1.616.858 2.5L8.81 8.61l1.556 2.661a2.5 2.5 0 1 1-.794.637L8 9.73l-1.572 2.177a2.5 2.5 0 1 1-.794-.637L7.19 8.61 3.5 3.5zm2.5 10a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0zm7 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z")

        for(let i=0 ; i<Paxos.nodos.length; i++){
            Paxos.red1.registrarNodo(Paxos.nodos[i]);
            let txt =  document.getElementById("textoParticion"+i);
            txt.remove();
        }
    }

    //Dibuja el texto en cada nodo que lo sitúa en una red distinta, la primera mitad, la mayor la 0 y los demás la particion 1.
    static generaParticion(){
        $("#btnPartir").children('span').text("Quitar partición")
        let nodosParticion = Math.floor(Paxos.numNodos/2)+1;
        Paxos.hayParticion = true;

        //borramos todos los nodos registrados en las redes
        Paxos.red1.borrarNodos();
        Paxos.red2.borrarNodos();

        for(let i=0 ; i<Paxos.nodos.length; i++){
            let circ = document.getElementById("nodo"+i);
            let textoPart = document.createElementNS(this.svgNS,"text"); 
            textoPart.setAttribute("id","textoParticion"+i);
            textoPart.setAttribute("x", circ.getAttribute("cx"));
            textoPart.setAttribute("y", parseFloat(circ.getAttribute("cy")) + 0.9);
            textoPart.setAttribute("font-size",1.2);
            textoPart.setAttribute("text-anchor", "middle");
            textoPart.setAttribute("pointer-events","none");

            let part;

            if(i<nodosParticion){
                Paxos.red1.registrarNodo(Paxos.nodos[i]);
                part = 0;
            }
            else {
                Paxos.red2.registrarNodo(Paxos.nodos[i]);
                part = 1;
            }
            let texto = document.createTextNode("P"+part);
            textoPart.appendChild(texto);
            document.getElementById("svgFrame").appendChild(textoPart); 
        }

        let tijeraSVG = document.createElementNS(this.svgNS,"path");
        tijeraSVG.setAttribute("id","svgPart");
        tijeraSVG.setAttribute("d","M3.5 3.5c-.614-.884-.074-1.962.858-2.5L8 7.226 11.642 1c.932.538 1.472 1.616.858 2.5L8.81 8.61l1.556 2.661a2.5 2.5 0 1 1-.794.637L8 9.73l-1.572 2.177a2.5 2.5 0 1 1-.794-.637L7.19 8.61 3.5 3.5zm2.5 10a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0zm7 0a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z");
        tijeraSVG.setAttribute("transform", "translate(12,7) scale(0.1)");
        document.getElementById("svgFrame").appendChild(tijeraSVG); 

        $("#btnPartir").children('svg').children("path").attr("d","m2.68 7.676 6.49-6.504a4 4 0 0 1 5.66 5.653l-1.477 1.529-5.006 5.006-1.523 1.472a4 4 0 0 1-5.653-5.66l.001-.002 1.505-1.492.001-.002Zm5.71-2.858a.5.5 0 1 0-.708.707.5.5 0 0 0 .707-.707ZM6.974 6.939a.5.5 0 1 0-.707-.707.5.5 0 0 0 .707.707ZM5.56 8.354a.5.5 0 1 0-.707-.708.5.5 0 0 0 .707.708Zm2.828 2.828a.5.5 0 1 0-.707-.707.5.5 0 0 0 .707.707Zm1.414-2.121a.5.5 0 1 0-.707.707.5.5 0 0 0 .707-.707Zm1.414-.707a.5.5 0 1 0-.706-.708.5.5 0 0 0 .707.708Zm-4.242.707a.5.5 0 1 0-.707.707.5.5 0 0 0 .707-.707Zm1.414-.707a.5.5 0 1 0-.707-.708.5.5 0 0 0 .707.708Zm1.414-2.122a.5.5 0 1 0-.707.707.5.5 0 0 0 .707-.707ZM8.646 3.354l4 4 .708-.708-4-4-.708.708Zm-1.292 9.292-4-4-.708.708 4 4 .708-.708Z")

        //Comprobar todos los nodos 
        let iterator = Paxos.mensajesEnEnvio.keys();
        for(let key of iterator){
            if(!Paxos.red1.destinoPosible(Paxos.mensajesEnEnvio.get(key).origen, Paxos.mensajesEnEnvio.get(key).destino) || !Paxos.red1.destinoPosible(mensajesEnEnvio.get(key).origen, Paxos.mensajesEnEnvio.get(key).destino)){
                document.getElementById("nodoAnim"+key).setAttribute("fill","red");
            }
        }          
    }

    // Desactiva el uso de botones al finalizar en el modo automático
    static desactivaBotonesFin(){
        $("#btnPartir").attr('disabled', 'disabled');
        $("#btnProponer").attr('disabled', 'disabled');
        //document.getElementById("sliderPerdida").disabled = true;
        //document.getElementById("sliderCaida").disabled = true;
        $("#btnPlay").attr('disabled', 'disabled');
        $("#btnSpeed").attr('disabled', 'disabled');

        for(let i = 0 ; i < Paxos.numNodos; i++){
            document.getElementById("progreso"+i).remove(); 
            
        }

        let iterator = Paxos.mensajesEnEnvio.keys();
        for(let key of iterator){
            if(  document.getElementById("nodoAnim"+key) != null) document.getElementById("nodoAnim"+key).remove();
        }
            
    }

    // Muestra  el modal con las estadísticas finales
    static statsFinales(){
        $("#finTiempo").append("Tiempo final de la simulación: <b>"+ Paxos.timerSim.getTimeString()+"</b>");
        $("#finNumRondas").append("Última ronda: <b>"+ Paxos.rondaGlobal+"</b>");
        $("#finNumCaidas").append("Número de caídas de nodos: <b>"+ Paxos.numCaidas+"</b>");
        $("#finNumMsg").append("Número de mensajes enviados: <b>"+ Paxos.mensajesTotales+"</b>");
        $("#finNumMsgPerdidos").append("Número de mensajes perdidos: <b>"+ Paxos.mensajesPerdidos+"</b>");
        let porcentaje = Paxos.mensajesTotales/(Paxos.mensajesPerdidos*100)*100;
        if(porcentaje == "Infinity") porcentaje = 0;
        $("#finPercentMsg").append("Porcentaje de mensajes perdidos: <b>"+porcentaje+"%</b>");
        $("#finNumLideres").append("Número de líderes propuestos: <b>"+ Paxos.numLideres+"</b>");
    }

    // Reanuda la simulación.
    static reanudaSim(){
        $("#btnPlay").attr('class', "btn btn-primary btn-sm ");
        $("#btnPlay").children('svg').children('path').attr('d', "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z");
    
        if(Paxos.simPaused){
            for(let i=0; i<Paxos.nodos.length; i++){
                if(typeof Paxos.nodos[i].waitAnim !== "undefined"){
                    Paxos.nodos[i].waitAnim.play();
                }
                if(typeof Paxos.nodos[i].red.animacionesRed.length != 0){
                    for(let j=0; j<Paxos.nodos[i].red.animacionesRed.length; j++){
                        Paxos.nodos[i].red.animacionesRed[j].play();
                    }
                }  
            } 
        }

        Paxos.simPaused = false;
        Paxos.timerSim.reanudaTimer();
    }
    
    // Pausa la simulación.
    static pausaSim(){
        $("#btnPlay").attr('class', "btn btn-danger btn-sm ");
        $("#btnPlay").children('svg').children('path').attr('d', "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z");
         
        if(!Paxos.simPaused){
            for(let i=0; i<Paxos.nodos.length; i++){
                if(typeof Paxos.nodos[i].waitAnim !== "undefined"){
                    Paxos.nodos[i].waitAnim.pause();   
                } 
                if(typeof Paxos.nodos[i].red.animacionesRed.length != 0){
                    for(let j=0; j<Paxos.nodos[i].red.animacionesRed.length; j++){
                        Paxos.nodos[i].red.animacionesRed[j].pause();
                    }
                }  
          
            }
        }
    
        Paxos.simPaused = true;
        Paxos.timerSim.pausaTimer();
    
        for(let i=0; i<Paxos.nodos.length; i++){
            if(typeof Paxos.nodos[i].waitAnim !== "undefined"){
                if(document.getElementById("progreso"+i) != null){ let cirPros =  document.getElementById("progreso"+i).getAttribute("style")  ;}
            } 
        }
    }

    //Abre el modal de estadísticas.
    static openModalEstadisticas(){
        $("#modalEstadisticas").modal('show');
    }

    //Abre el modal de mensajes.
    static openModalMensajes(e){
        UI.pausaSim();
        UI.idMsgActual = this.dataset.key;
        $("#modalMensajes").appendTo("body")
        $("#modalMensajes").modal('show');

        Paxos.mensajesEnEnvio.get(UI.idMsgActual.toString());

        let og      =  Paxos.mensajesEnEnvio.get(UI.idMsgActual.toString()).origen;
        let dst     =  Paxos.mensajesEnEnvio.get(UI.idMsgActual.toString()).destino;
        let msg     =  Paxos.mensajesEnEnvio.get(UI.idMsgActual.toString()).mensaje;
        let valor   =  Paxos.mensajesEnEnvio.get(UI.idMsgActual.toString()).valor;
        
        $("#pOrigen").text("Origen: "+og);
        $("#pDestino").text("Destino: "+dst);
        $("#pMensaje").text("Mensaje: "+msg);
        $("#pValor").text("Valor (puede ser null): "+valor);
    }

    static tooltipNodos(e){
        UI.actual = this.dataset.key;
    
        let textRonda = Paxos.nodos[UI.actual].ronda;
        let textValor = Paxos.nodos[UI.actual].valorPropuesto;
    
        if(Paxos.nodos[UI.actual].ronda < 0) textRonda = "ninguna ronda recibida"
        if(textValor == undefined) textValor = "ninguno"
        let textoMouseOver = "<p>Nodo: "+UI.actual+"</p><p>Estado actual: "+Paxos.nodos[UI.actual].estado+"</p><p>Mayor ronda recibida: "+textRonda+"</p><p> Valor aceptado: "+textValor+"</p>"
        document.getElementById("nodo"+UI.actual).setAttribute("data-original-title", textoMouseOver);
    }

    static openModalInfo(e){
        UI.actual = this.dataset.key;
        $("#modalInfo").modal('show');
    }

}
export  {UI}
