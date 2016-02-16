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
	
	extend(event) {
		return new Emitter();
	}

	/**
	 * Register a handler `fn`.
	 */

	then(fn) {
		this._subscribers.push(fn);
		
		return this;
	}

	/**
	 * Return an emitter for the given `event`.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 * @api public
	 */

	on(...items) {
		if (!items.length) {
			return this;
		}
		
		let event = items.shift();
		
		if (typeof event === 'function') {
			return this.then(event);
		}
		
		if (items[0] instanceof Emitter) {
			let emitter = this._emitters[event];
			this._emitters[event] = items[0];
			this._emitters[event].key = event;
			
			if (emitter) {
				for (let key in emitter._emitters) {
					this.on(event, key, emitter._emitters[key]);
				}
				
				for (let fn of emitter._subscribers) {
					this.on(event, fn);
				}
			}
			
			return this;
		}
		
		if (!this._emitters[event]) {
			this._emitters[event] = this.extend(event);
			this._emitters[event].key = event;
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
		if (!items.length) {
			this._emitters = {};
			
			return this;
		}
		
		let event = items.shift();
		
		if (!this._emitters[event]) {
			this._emitters[event] = this.extend(event);
			this._emitters[event].key = event;
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

	async emit(...items) {
		await Promise.all(this._subscribers.map((subscriber) => {
			return subscriber.apply(this, items);
		}));
		
		let event = items.shift();
		
		if (typeof event === 'string') {
			await this.on(event).emit(...items);
		}
	}
}
