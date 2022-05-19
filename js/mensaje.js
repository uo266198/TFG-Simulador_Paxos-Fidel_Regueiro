class Mensaje {
	constructor(sourceId) {
        this.sourceId = sourceId;
	}	
}

export default class Prepara extends Mensaje {
	constructor(sourceId, rondaActual){
		super(sourceId);
		this.rondaActual = rondaActual;
	}
}

class Promesa extends Mensaje {
	constructor(sourceId, rondaActual, rondaAnterior){
		super(sourceId);
		this.rondaActual = rondaActual;
		this.rondaAnterior = rondaAnterior;
	}
}

class Acepta extends Mensaje {
	constructor(sourceId, rondaActual, valor){
		super(sourceId);
		this.rondaActual = rondaActual;
		this.valor = valor;
	}
}

class Aceptado extends Mensaje {
	constructor(sourceId, rondaActual, valor){
		super(sourceId);
		this.rondaActual = rondaActual;
		this.valor = valor;
	}
}

export  {Prepara, Promesa, Acepta, Aceptado};