export default class Emitter {
	constructor() {
		this._emitters = {};
		this._subscribers = [];
	}

	extend(event) {
		const emitter = new Emitter();
		emitter.key = event;

		return emitter;
	}

	then(fn) {
		this._subscribers.push(fn);

		return this;
	}

	on(...items) {
		if (!items.length) {
			return this;
		}

		const event = items.shift();

		if (typeof event === 'function') {
			return this.then(event);
		}

		if (!this._emitters[event]) {
			this._emitters[event] = this.extend(event);
		}

		return this._emitters[event].on(...items);
	}

	off(...items) {
		if (!items.length) {
			this._emitters = {};

			return this;
		}

		const event = items.shift();

		if (typeof event === 'function') {
			const index = this._subscribers.indexOf(event);
			if (index > -1) {
				this._subscribers.splice(index, 1);
			}

			return this;
		}

		if (!this._emitters[event]) {
			this._emitters[event] = this.extend(event);
		}

		return this._emitters[event].off(...items);
	}

	async emit(...items) {
		await Promise.all(this._subscribers.map(
			subscriber => subscriber.apply(this, items)
		));

		const event = items.shift();
		if (typeof event === 'string') {
			await this.on(event).emit(...items);
		}
	}
}
