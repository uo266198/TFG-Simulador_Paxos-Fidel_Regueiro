//Temporizador general para la simulación.

class Timer{
  constructor(velocidad) {
    this.velocidad = velocidad;
    this.pausado = true;
    this.mins = 0;
    this.secs = -1;
    this.secsStr = 0;
    this.minsStr = 0;
    this.timeString= "";
    this.timer;
  }

  startTime() {
    
    this.secs++; 
    this.secsStr = this.secs; 
    this.minsStr = this.mins;
    
    if(this.secs == 60){
      this.secs = 0;
      this.mins ++;
    }
    
    if(this.secs <= 9){
      this.secsStr = "0" + this.secs;
    }
    if(this.mins <= 9){
      this.minsStr = "0" + this.mins;
    }
    
    document.getElementById('reloj').innerHTML = this.getTimeString();
  }

  pausaTimer(){
    this.pausado = true;
    clearInterval(this.timer);  
}

  reanudaTimer(){
    this.pausado = false; 
    this.timer = setInterval(function() {this.startTime()}.bind(this) ,this.velocidad);  
  }

  getTimeString(){
    return this.minsStr + ":" + this.secsStr;
  }


}



export {Timer}