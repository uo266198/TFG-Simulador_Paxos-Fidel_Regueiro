class Mensaje {
	constructor(sourceId) {
        this.sourceId = sourceId;
		this.tipoMensaje = "MENSAJE";
	}	
}

export class PreparaMsg extends Mensaje {
	constructor(sourceId, rondaActual){
		super(sourceId);
		this.rondaActual = rondaActual;
		this.tipoMensaje = "PREPARA";
	}
}

export class PromesaMsg extends Mensaje {
	constructor(sourceId, rondaActual, rondaAnterior){
		super(sourceId);
		this.rondaActual = rondaActual;
		this.rondaAnterior = rondaAnterior;
		this.tipoMensaje = "PROMESA";
	}
}

export class AceptaMsg extends Mensaje {
	constructor(sourceId, rondaActual, valor){
		super(sourceId);
		this.rondaActual = rondaActual;
		this.valor = valor;
		this.tipoMensaje = "ACEPTA";
	}
}

export class AceptadoMsg extends Mensaje {
	constructor(sourceId, rondaActual, valor){
		super(sourceId);
		this.rondaActual = rondaActual;
		this.valor = valor;
		this.tipoMensaje = "ACEPTADO";
	}
}

export class IniciandoMsg extends Mensaje {
	constructor(sourceId, canal){
		super(sourceId);
		this.canal = canal;
		this.tipoMensaje = "INICIANDO";
	}
}