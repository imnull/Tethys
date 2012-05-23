(function(w){

var T = {
	/* 获得视口尺寸 viewport size */
	view : function(){
		return { w : w.innerWidth, h : w.innerHeight }
	},
	/* 获得视口宽度高度比 */
	viwr : function(reverse){
		return w.innerWidth / w.innerHeight;
	},
	/* 添加事件 */
	evnt : function(obj, name, callback, useCapture){
		obj.addEventListener(name, callback, !!useCapture)
	},
	/* 创建元素 */
	elem : function(nodeName){
		var el = document.createElement(nodeName);
		return el;
	},
	/* 适用于平板的获取事件参数方法 */
	gete : function(e){
		return (e = e || window.event).touches && e.touches.length ? e.touches[0] : e;
	},
	/*  */
	epos: function (evt) {
		evt = this.gete(evt);
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
		return { x: x, y: y, e: evt };
	}
}

w.T = T;

function evtObj(){
	this.callbacks = {};
}
evtObj.prototype = {
	add : function(host, evtName, callback){
		if(!(evtName in this.callbacks)){
			this.callbacks[evtName] = [];
		}
		this.callbacks[evtName].push({
			host : host, callback : callback
		})
	},
	fire : function(evtName){
		if(!(evtName in this.callbacks)) return;
		var cbs = this.callbacks[evtName], i = cbs.length;
		var args = Array.prototype.slice.call(arguments, 1);
		while(--i >= 0){
			cbs[i].callback.apply(cbs[i].host, args);
		}
		cbs = null;
	}
}

function SmartCanvas(){
	var cvs = T.elem('canvas');
	var ctx = cvs.getContext('2d');
	var cvsEventObj = new evtObj();

	var callbacks = {};

	function addEvent(evtName, callback){
		if(!(evtName in callbacks))
			callbacks[evtName] = [];
		callbacks[evtName].push(callback);
	}
	function doEvent(evtName, arg){
		var i = callbacks[evtName].length;
		while(--i >= 0)
			callbacks[evtName][i](arg, i);
	}
	function fireEvent(evtName){
		return function(e){
			if(!(evtName in callbacks)) return;
			doEvent(evtName, T.epos(e));
		}
	}

	T.evnt(cvs, 'mousemove', fireEvent('mousemove'));
	T.evnt(cvs, 'mousedown', fireEvent('mousedown'));
	T.evnt(cvs, 'mouseup', fireEvent('mouseup'));
	T.evnt(cvs, 'click', fireEvent('mouseclick'));

	cvs.context = function(){
		return ctx;
	}

	cvs.fit = function(){
		var r = T.viwr();
	}

	cvs.createDocument = function(){
		return new CanvasDocument(ctx);
	}

	cvs.size = function(w, h){
		this.width = w;
		this.height = h;
	}

	function addCommonMethod(){
		var args = Array.prototype.slice.call(arguments, 0);
		var o = args.shift();
		var i = args.length;
		while(--i >= 0){
			o[args[i]] = (function(n){
				return function(callback){
					o.eo.add(this, n, callback);
					return this;
				}
			})(args[i])
		}
	}
	function addCommonEvent(){
		var args = Array.prototype.slice.call(arguments, 0);
		var o = args.shift();
		for(var i = 0, len = args.length; i < len; i++){
			addEvent(args[i], (function(n){
				return function(arg, i){
					if(o.check(arg)){
						o.eo.fire(n, arg, i, n);
					}
				}
			})(args[i]));
		}
	}
	function createObj(){
		var o = {
			args : Array.prototype.slice.call(arguments, 0),
			fillStyle : '#000',
			strokeStyle : '#000',
			lineWidth : 0,
			eo : new evtObj(),
			moveTo : function(_x, _y){
				this.args[0] = _x;
				this.args[1] = _y;
				return this;
			},
			invoke : function(callback){
				var a = this.args.slice(0);
				a.unshift(ctx);
				return callback.apply(this, a)
			}
		}
		addCommonMethod(o, 'mousemove', 'mouseover', 'mouseout', 'mousedown', 'mouseup', 'mouseclick');
		addCommonEvent(o, 'mouseclick', 'mouseup', 'mousedown');
		addEvent('mousemove', function(arg, i){
			if(o.check(arg)){
				o.eo.fire('mousemove', arg, i, 'mousemove');
				if(!o.mouseIn){
					o.mouseIn = true;
					o.eo.fire('mouseover', arg, i, 'mouseover');
				}
			} else if(o.mouseIn){
				o.mouseIn = false;
				o.eo.fire('mouseout', arg, i, 'mouseout');
			}
		});
		return o;
	}

	cvs.circle = function(_x, _y, _r){
		var o = createObj(_x, _y, _r);
		o.path = function(ctx){
			ctx.arc(this.args[0], this.args[1], this.args[2], 0, Math.PI * 2);
			return this;
		}
		o.check = function(a){
			var _x = a.x - this.args[0], _y = a.y - this.args[1];
			var d = _x * _x + _y * _y - this.args[2] * this.args[2];
			return d < 0;
		}
		return o;
	}

	cvs.box = function(_x, _y, _w, _h){
		var o = createObj(_x, _y, _w, _h);
		o.path = function(ctx){
			ctx.rect(this.args[0], this.args[1], this.args[2], this.args[3]);
			return this;
		}
		o.check = function(arg){
			var a = arg.x - this.args[0], b = arg.y - this.args[1];
			return a > 0 && b > 0 && a < this.args[2]  && b < this.args[3];
		}
		o.moveCenterTo = function(x, y){
			x -= this.args[2] * .5;
			y -= this.args[3] * .5;
			this.moveTo(x, y);
		}
		return o;
	}

	return cvs;
}

function drawElement(el, ctx, callback){
	if(typeof callback === 'function'){
		el.invoke(callback);
		return;
	}
	ctx.save();
	ctx.beginPath();
	el.path(ctx);
	ctx.fillStyle = el.fillStyle;
	ctx.fill();
	if(el.strokeStyle && el.borderWidth){
		ctx.strokeStyle = el.strokeStyle;
		ctx.borderWidth = el.borderWidth;
		ctx.stroke();
	}

	ctx.restore();
}

function CanvasDocument(ctx){
	var children = [];
	var _ = this;
	this.add = function(el){
		el.parent = _;
		children.push(el);
	}
	this.clear = function(color){
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		if(color){
			ctx.save();
			ctx.beginPath();
			ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.closePath();
			ctx.fillStyle = color;
			ctx.fill();
			ctx.restore();
		}
	}
	this.draw = function(){
		for(var i = 0, len = children.length; i < len; i++){
			if(children[i].parent != this) continue;
			drawElement(children[i], ctx)
		}
	}
	this.fresh = function(bk){
		this.clear(bk);
		this.draw()
	}
}

w.SmartCanvas = SmartCanvas;
w.CanvasDocument = CanvasDocument;

})(window)