export default class Emitter {
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	constructor() {
		this._emitters = {};
		this._subscribers = [];
	}
	
	/**
	 * Register a handler `fn`.
	 */
	
	then(fn) {
		this._subscribers.push(fn.bind(this));
		
		return this;
	}
	
	/**
	 * Return an emitter for the given `event`.
	 *
	 * @param {String} event
	 * @return {Emitter}
	 * @api public
	 */
	
	on(...items) {
		if(!items.length) {
			return this;
		}
		
		var event = items.shift();
		
		if(typeof event === 'function') {
			return this.then(event);
		}
		
		if(!this._emitters[event]) {
			this._emitters[event] = new Emitter();
		}
		
		return this._emitters[event].on(...items);
	}
	
	/**
	 * Remove the emitters for `event` or all events.
	 *
	 * @param {String} event
	 * @return {Emitter}
	 * @api public
	 */
	
	off(...items) {
		if(!items.length) {
			this._emitters = {};
			
			return this;
		}
		
		var event = items.shift();
		
		if(!this._emitters[event]) {
			this._emitters[event] = new Emitter();
		}
		
		return this._emitters[event].off(...items);
	}
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	*emit(...items) {
		for (let value of this._subscribers) {
			value = value.apply(this, items);
			
			if (value) {
				yield value;
			}
		}
		
		var event = items.shift();
		
		if (typeof event === 'string') {
			var emitter = this._emitters[event];
			
			if (emitter) {
				yield emitter.emit(...items);
			}
		}
	}
	
	/**
	 * Check if this emitter has `event` emitters.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	has(event) {
		return !!this._emitters[event];
	}
}
