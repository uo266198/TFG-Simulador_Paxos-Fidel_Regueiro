import { velocidad } from "./paxos.js"
import { creaCirculoAnim } from "./ui.js";

var svgNS = "http://www.w3.org/2000/svg"; 


async function animaEnvioDatos(og, dest, tipo){

    var datos = creaCirculoAnim(og, dest, tipo);
    var posxOg = datos[0,0];
    var posyOg = datos[0,1];
    var posxDest = datos[1,0];
    var posyDest = datos[1,1];
    var circuloAnim = datos[2];

    var t1 = anime.timeline({
    
    });
    
    t1.add({
        targets:  circuloAnim,
        translateX: posxDest-posxOg,
        translateY: posyDest-posyOg,
        duration: velocidad*5,
        easing: 'linear'
    })

    await t1.finished;
    
}



export{animaEnvioDatos}