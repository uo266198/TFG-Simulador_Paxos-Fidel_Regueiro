import Mensaje from "./mensaje.js";

export default class CanalMensajes{
	constructor(id){
		this.id = id;
		this.canalEnvios = new BroadcastChannel(this.id);
		this.canalEscucha = new BroadcastChannel(this.id);

		this.canalEscucha.onmessage = (event) => {
			this.gestionaMensaje(event);
		}
	}

	enviaMensaje(mensaje){
		this.canalEnvios.postMessage(mensaje);
		
	}

	gestionaMensaje(mensaje){
		console.log(mensaje);
	}


}



