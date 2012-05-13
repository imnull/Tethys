(function (w) {

	/*
	* Fix event operation
	*/
	var addEvent, removeEvent, eventLevel = 0;
	if (typeof w.addEventListener === 'function') {
		addEvent = function (element, eventName, callback, useCapture) {
			element.addEventListener(eventName, callback, useCapture);
		};
		removeEvent = function (element, eventName, callback, useCapture) {
			element.removeEventListener(eventName, callback, useCapture);
		};
		eventLevel = 2;
	} else if (typeof w.attachEvent === 'function') {
		addEvent = function (element, eventName, callback) {
			element.attachEvent('on' + eventName, callback);
		}
		removeEvent = function (element, eventName, callback) {
			element.detachEvent('on' + eventName, callback);
		};
		eventLevel = 1;
	} else {
		addEvent = function (element, eventName, callback) {
			element['on' + eventName] = callback;
		}
		removeEvent = function (element, eventName) {
			element['on' + eventName] = null;
			delete element['on' + eventName];
		}
		eventLevel = 0;
	}

	function ieOpacity(el, val) {
		val = Math.round(val * 100);
		if (val >= 100) {
			el.style.filter = null;
			el.style.visibility = 'visible';
			return;
		} else if (val <= 0) {
			el.style.filter = null;
			el.style.visibility = 'hidden';
			return;
		}
		el.style.visibility = 'visible';
		if (typeof el.filters['alpha'] === 'undefined'
		|| typeof el.filters['alpha'].opacity != 'number') {
			el.style.filter += ' alpha(opacity=' + val + ')';
		} else {
			//el.filters['alpha'].opacity = val;
			el.filters.item('alpha').opacity = val;
			//el.style.filter += ' alpha(opacity=' + val + ')';
			//alert(el.filters['alpha'].opacity)
		}
	}

	var __tethys__ = {
		$: function (element) {
			if (!element) return null;
			if ('length' in element && !('nodeType' in element) && !('nodeName' in element)) {
				var r = [], temp;
				for (var i = 0, len = element.length; i < len; i++) {
					temp = __tethys__.$(element[i]);
					temp.index = i;
					r.push(temp);
				}
				r.each = function (callback) {
					for (var i = 0, len = r.length; i < len; i++) {
						callback(r[i], i, r);
					}
				}
				for (var p in this) {
					if (p == '$') continue;
					r[p] = (function (_p) {
						return function () {
							var args = Array.prototype.slice.call(arguments, 0);
							r.each(function (el) {
								__tethys__[_p].apply(el, args);
							})
							args = null;
							return r;
						} 
					})(p)
				}
				return r;
			} else {
				tet.extend(this, element);
				element.$ = null;
				return element;
			}


		},
		css: function () {
			switch (arguments.length) {
				case 1:
					if (!!arguments[0]) {
						if (typeof arguments[0] === 'object') {
							for (var p in arguments[0]) {
								this.css(p, arguments[0][p].toString());
							}
						}
						else if (typeof arguments[0] === 'string')
							this.style.cssText = arguments[0];
					}
					break;
				case 2:
					var name = tet.css2js(arguments[0]);
					if (typeof this.style[name] === 'string') {
						this.style[name] = arguments[1];
					} else {
						switch (name) {
							case 'opacity':
								var val = parseFloat(arguments[1]);
								if (isNaN(val)) val = 1.0;
								ieOpacity(this, val);
								break;
							default:
								this.style[name] = arguments[1];
								break;
						}
					}
					break;
				case 0:
					function cssExt(o, n, v){
						o.css(n, v);
						o.css('-webkit-' + n, v);
						o.css('-moz-' + n, v);
						o.css('-o-' + n, v);
						o.css('-ms-' + n, v);
					}
					tet.extend({
						rotateX : function(v){
							cssExt(this, 'transform', 'rotateX(' + v + 'deg)');
							return this;
						},
						rotateY : function(v){
							cssExt(this, 'transform', 'rotateY(' + v + 'deg)');
							return this;
						},
						perspective : function(v){
							cssExt(this, 'perspective', v);
							return this;
						},
						perspectiveOrigin : function(v){
							cssExt(this, 'perspective-origin', v + 'px');
							return this;
						},
						transformOrigin : function(v){
							cssExt(this, 'transform-origin', v);
							return this;
						},
						opacity : function(v){
							this.css('opacity', v);
							return this;
						}
					}, this)
					break;
				default:
					break;
			}
			return this;
		},
		nextNear: function (nodeName, callback) {
			var n = this.nextSibling;
			while (n) {
				if (n.nodeType === 1) {
					if (n.nodeName.toLowerCase() != nodeName) {
						n = null;
					} else {
						n.finder = this;
						this.linker = n;
					}
					break;
				} else {
					n = n.nextSibling;
					continue;
				}
			}
			if (n && typeof callback === 'function') {
				return callback(__tethys__.$(n), this);
			} else {
				return n;
			}
		},
		next: function (nodeName, callback) {
			if (typeof callback != 'function') return;
			var n = this.nextSibling, _n;
			while (n) {
				if (n.nodeType === 1 && n.nodeName.toLowerCase() == nodeName) {
					_n = n.nextSibling;
					n = __tethys__.$(n);
					n.finder = this;
					callback(n, this)
					n = _n;
				} else {
					n = n.nextSibling;
				}
			}
			n = _n = null;
		},
		previousNear: function () {
			var n = this.previousSibling;
			while (n) {
				if (n.nodeType === 1) {
					if (n.nodeName.toLowerCase() != nodeName) {
						n = null;
					} else {
						n.finder = this;
						this.linker = n;
					}
					break;
				} else {
					n = n.previousSibling;
					continue;
				}
			}
			if (n && typeof callback === 'function') {
				return callback(__tethys__.$(n), this);
			} else {
				return n;
			}
		},
		previous: function (nodeName, callback) {
			if (typeof callback != 'function') return;
			var n = this.previousSibling, _n;
			while (n) {
				if (n.nodeType === 1 && n.nodeName.toLowerCase() == nodeName) {
					_n = n.previousSibling;
					n = __tethys__.$(n);
					n.finder = this;
					callback(n, this)
					n = _n;
				} else {
					n = n.previousSibling;
				}
			}
			n = _n = null;
		},
		append: function (el) {
			this.appendChild(el);
		},
		appendTo: function (el, before) {
			if (!before) {
				el.appendChild(this);
			} else {
				el.insertBefore(this, before);
			}
			return this;
		},
		unshiftTo: function (el) {
			this.appendTo(el, el.firstChild);
			return this;
		},
		mouseover: function (callback) {
			tet.event.add(this, 'mouseover', callback);
			return this;
		},
		mouseout: function (callback) {
			tet.event.add(this, 'mouseout', callback);
			return this;
		},
		mousemove: function (callback) {
			tet.event.add(this, 'mousemove', callback);
			return this;
		},
        mousedown: function (callback) {
            tet.event.add(this, 'mousedown', callback);
            return this;
        },
        mouseup: function(callback){
			tet.event.add(this, 'mouseup', callback);
			return this;
        },
		mouseclick: function (callback) {
			tet.event.add(this, 'click', callback);
			return this;
		}
	}

	var tet = {
		ua: w.navigator.userAgent,

		/*
		* copy the properties of a to b
		* return new object that has all properties
		*/
		extend: function (a, b) {
			if (!b) b = {};
			if (!a || typeof a != 'object') return b;
			for (var p in a) {
				if (a[p] instanceof Array) {
					b[p] = a[p].slice(0);
				} else if (typeof a[p] === 'object') {
					if (!b[p]) b[p] = {}
					this.extend(a[p], b[p]);
				} else {
					b[this.css2js(p)] = a[p]
				}
			}
			return b;
		},

		/*
		* Convert CSS property name to JS property name
		*/
		css2js: function (cssName) {
			if(cssName.charAt(0) === '-') return cssName;
			return cssName.replace(/\-(\w)/g, function () {
				return arguments[1].toUpperCase();
			})
		},

		/*
		* Convert JS property name to CSS property name
		*/
		js2css: function (jsName) {
			return jsName.replace(/[A-Z]/g, function (m) {
				return '-' + m.toLowerCase();
			})
		},


		create: function (nodeName, properties) {
			var el = document.createElement(nodeName);
			el = this.extend(properties, el);
			return __tethys__.$(el);
		},

		get: function (id, dom) {
			if (!id) return null;
			if (typeof id === 'string') {
				if (id.charAt(0) == '#') {
					return __tethys__.$(document.getElementById(id.substr(1)));
				} else {
					return __tethys__.$((dom || document).getElementsByTagName(id));
				}
			} else {
				return __tethys__.$(id);
			}
		},

		css: function (obj) {
			return typeof obj.currentStyle === 'object' ?
			obj.currentStyle : document.defaultView.getComputedStyle(obj, null);
		},

		event: {
			get: function (e) {
				return (e = e || window.event).touches && e.touches.length ? e.touches[0] : e;
			},
			bind: function (target, callback) {
				if (eventLevel < 2) return function (e) {
					callback.call(target, e || window.event)
				};
				else return callback;
			},
			position: function (evt) {
				evt = this.get(evt);
				var x, y;
				if ('pageX' in evt) {
					x = evt.pageX - evt.target.offsetLeft;
					y = evt.pageY - evt.target.offsetTop;
				} else if ('offsetX' in evt) {
					x = evt.offsetX;
					y = evt.offsetY;
				} else if ('clientX' in evt) {
					x = evt.clientX - evt.target.offsetLeft;
					y = evt.clientY - evt.target.offsetTop;
				} else {
					x = y = 0;
				}
				return { x: x, y: y };
			},
			target: function (e) {
				e = this.get(e);
				return e.target || e.srcElement;
			},
			nobubble: function (e) {
				e = this.get(e);
				if (e.stopPropagation) {
					e.stopPropagation();
				} else {
					e.cancelBubble = true;
				}
			},
			nodefault: function (e) {
				e = this.get(e);
				if (e.preventDefault) {
					e.preventDefault();
				} else {
					e.retureValue = false;
				}
			},
			add: function (element, eventName, callback, useCapture) {
				addEvent(element, eventName, callback, useCapture);
			},
			remove: function (element, eventName, callback) {
				removeEvent(element, eventName, callback);
			}
		}
	};

	/*
	* build browser object
	*/
	(function (tet) {
		if (/(Version\/([\d.]+)\s+.*?)?(MSIE|Firefox|Chrome|Safari|Opera)[\s\/]+(.+Version\/)?([\d\.]+)/.
		test(w.navigator.userAgent)) {
			tet.browser = {
				/*
				* Browser name
				*/
				name: RegExp['$3'],
				/*
				* Browser version
				*/
				version: RegExp['$2'] || RegExp['$5'],
				toString: function () {
					return this.name + '/' + this.version;
				}
			}
			/*
			* Browser big version (int)
			*/
			tet.browser.ver = parseInt(tet.browser.version);
		}
	})(tet);



	/*
	* Fix XMLHttpRequest Object in IE/6
	*/
	if (!w.XMLHttpRequest) {
		if (w.ActiveXObject) {
			var ver = [
			"Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0",
			"Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP.2.6", "Msxml2.XMLHTTP",
			"Microsoft.XMLHTTP.1.0", "Microsoft.XMLHTTP.1", "Microsoft.XMLHTTP"
		], i = 0, c = ver.length, temp;
			for (; i < c; i++) {
				try {
					temp = new w.ActiveXObject(ver[i]);
					break;
				} catch (e) {
					temp = null;
				};
			}
			var MSXML = ver[i];
			i = c = temp = null;

			function ActiveXObjectXHR() {
				var axo = new w.ActiveXObject(MSXML), _ = this;
				function init(xhr) {
					delete xhr.status;
					delete xhr.responseXML;
					delete xhr.responseText;
					delete xhr.readyState;
					xhr.status = 0;
					xhr.responseXML = null;
					xhr.responseText = '';
					xhr.readyState = 0;
				}
				this.onreadystatechange = null;
				this.open = function (method, url, async, user, password) {
					init(this);
					var r = axo.open(method, url, async, user, password);
					axo.onreadystatechange = function () {
						_.readyState = axo.readyState;
						if (axo.readyState === 4) {
							_.status = axo.status
							_.responseText = axo.responseText;
							_.responseXML = axo.responseXML;
						}
						if (typeof _.onreadystatechange === 'function') {
							_.onreadystatechange();
						}
					}
					return r;
				};
				this.send = function (data) { return axo.send(data); };
				this.setRequestHeader = function (header, value) { axo.setRequestHeader(header, value); };
				this.getResponseHeader = function (header) { return axo.getResponseHeader(header); };
				this.getAllResponseHeaders = function () { return axo.getAllResponseHeaders(); };
			}
			w.XMLHttpRequest = ActiveXObjectXHR;
		}
	}

	function rndkey32() {
		var r = '', i = 0, len = 8;
		for (; i < len; i++)
			r += ((0xFFFFFF * (Math.random() + 1)) << 0).toString(36).substr(1);
		i = len = null;
		return r;
	}

	var animationChaos = {
		FPS: 60,
		regist: function (callback) {
			if (!this.dic) { this.dic = {}; }
			var key = rndkey32();
			while (key in this.dic) key = rndkey32();
			callback.initTime = new Date().getTime();
			callback.times = 0;
			this.dic[key] = callback;
			this.action();
			return key;
		},
		hasKey: function (key) {
			return typeof key === 'string' && key in this.dic;
		},
		remove: function (key) {
			return delete this.dic[key];
		},
		action: function () {
			if (this.handler) return;
			function isEmpty(obj) {
				if (!obj || typeof obj != 'object') return true;
				for (var p in obj) break;
				return typeof p === 'undefined';
			}
			function run() {
				var ac = animationChaos;
				if (isEmpty(ac.dic)) {
					if (ac.handler) {
						clearInterval(ac.handler);
						ac.handler = null;
						delete ac.handler;
					}
					ac = null;
					return;
				}
				var now = new Date().getTime();
				for (var p in ac.dic) {
					if (!ac.dic[p].startTime) {
						ac.dic[p].startTime = new Date().getTime();
					}
					if (ac.dic[p](
					now - ac.dic[p].startTime,
					now - ac.dic[p].initTime,
					ac.dic[p].times
					)) {
						delete ac.dic[p];
					}
					else {
						ac.dic[p].times++;
						ac.dic[p].startTime = now;
					}
				}
				now = null;
				ac = null;
			}
			this.handler = setInterval(run, 2000 / this.FPS);
		}
	}

	tet.animation = animationChaos;

	w.Tethys = tet;

})(window);