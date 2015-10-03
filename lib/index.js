import {EventEmitter} from 'events';
import arrayUniq from 'array-uniq';
import arrayDiffer from 'array-differ';
import objectAssign from 'object-assign';
import Promise from 'pinkie-promise';

export default class Pageres {
	/**
	 * Initialize a new Pageres
	 *
	 * @param {Object} options
	 * @api public
	 */

	constructor(options) {
		this.options = objectAssign({}, options);
		this.options.filename = this.options.filename || '<%= url %>-<%= size %><%= crop %>';
		this.options.format = this.options.format || 'png';

		this.stats = {};
		this.items = [];
		this.sizes = [];
		this.urls = [];
	}

	/**
	 * Get or set page to capture
	 *
	 * @param {String} url
	 * @param {Array} sizes
	 * @param {Object} options
	 * @api public
	 */

	src(url, sizes, options) {
		if (!arguments.length) {
			return this._src;
		}

		this._src = this._src || [];
		this._src.push({url, sizes, options});

		return this;
	}

	/**
	 * Get or set the destination directory
	 *
	 * @param {String} dir
	 * @api public
	 */

	dest(dir) {
		if (!arguments.length) {
			return this._dest;
		}

		this._dest = dir;
		return this;
	}

	/**
	 * Run pageres
	 *
	 * @api public
	 */

	run() {
		return Promise.all(this.src().map(src => {
			return new Promise((resolve, reject) => {
				const options = objectAssign({}, this.options, src.options);
				const sizes = arrayUniq(src.sizes.filter(/./.test, /^\d{3,4}x\d{3,4}$/i));
				const keywords = arrayDiffer(src.sizes, sizes);

				if (!src.url) {
					reject(new Error('URL required'));
				}

				this.urls.push(src.url);

				if (!sizes.length && keywords.indexOf('w3counter') !== -1) {
					this.resolution(src.url, options).then(resolve);
					return;
				}

				if (keywords.length) {
					this.viewport({url: src.url, sizes, keywords}, options).then(resolve);
					return;
				}

				sizes.forEach(size => {
					this.sizes.push(size);

					try {
						this.items.push(this.create(src.url, size, options));
					} catch (err) {
						reject(err);
					}
				});

				resolve();
			});
		})).then(() => {
			this.stats.urls = arrayUniq(this.urls).length;
			this.stats.sizes = arrayUniq(this.sizes).length;
			this.stats.screenshots = this.items.length;

			if (!this.dest()) {
				return this.items;
			}

			return this.save(this.items).then(() => this.items);
		});
	}
}

objectAssign(Pageres.prototype, EventEmitter.prototype);
objectAssign(Pageres.prototype, require('./util'));
