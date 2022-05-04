export default class Timer{
  constructor(speed, ppal) {
    this.speed = speed;
    this.paused = true;
    this.ppal = ppal;
    this.mins = 0;
    this.secs = 0;
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
    
    //Si es el timer principal actualizo la UI
    if(this.ppal){
      document.getElementById('reloj').innerHTML = this.getTimeString();
    }
  }

  pauseTimer(){
    this.paused = true;
    clearInterval(this.timer);  
}

  resumeTimer(){
    this.paused = false; 
    this.timer = setInterval(function() {this.startTime()}.bind(this) ,this.speed);  
  }

  getTimeString(){
    return this.minsStr + ":" + this.secsStr;
  }
}