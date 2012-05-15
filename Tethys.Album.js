function Album(){
	this.add.apply(this, arguments)
}
Album.frameMaker = function(data, w, h, z, INTERVAL){
	data = data || {};
	var opacity = 0, KEYS = [];
	var cell = Tethys.create('div', {
		className : 'album_cell',
		style : {
			position : 'absolute',
			width : w + 'px',
			backgroundColor : '#fff'
		},
		flush : function(){
			for(var i = 0; i < KEYS.length; i++){
				Tethys.animation.remove(KEYS[i]);
				KEYS[i] = null;
				delete KEYS[i];
			}
			KEYS = [];
		},
		fadeIn : function(next){
			var key = Tethys.animation.regist(function(step, interval, fps){
				opacity = Math.min(1, opacity + step / INTERVAL);
				cell.opacity(opacity);
				if(opacity >= 1){
					if(typeof next === 'function') next(cell, opacity);
					return true;
				}
				return false;
			});
			KEYS.push(key);
		},
		fadeOut : function(next){
			var key = Tethys.animation.regist(function(step, interval, fps){
				opacity = Math.max(0, opacity - step / INTERVAL);
				cell.opacity(opacity);
				if(opacity <= 0){
					if(typeof next === 'function') next(cell, opacity);
					return true;
				}
				return false;
			});
			KEYS.push(key);
		}
	}).css().opacity(opacity);

	var img = Tethys.create('img', { src : data.src, alt : data.title || 'NULL', style : {
		width : w + 'px', height : h + 'px'
	}}).appendTo(cell);
	var textBar = Tethys.create('dl').appendTo(cell);
	var title = Tethys.create('dt', { innerHTML : data.title || 'NULL'}).appendTo(textBar);
	var comment = Tethys.create('dd', { innerHTML : data.comment || '' }).appendTo(textBar);
	var textBack = Tethys.create('div', {
		className : 'frame_text_back',
		style : { width : w + 'px' }
	}).css().opacity(.5);
	cell.fit = function(){
		var h = textBar.rect().outerHeight;
		textBack.style.marginTop = 0 - h + 'px';
		textBack.style.height = h + 'px'
		textBar.style.marginTop = 0 - h + 'px';
		cell.insertBefore(textBack, textBar);
	}
	return cell;
}

Album.prototype = {
	add : function(url, src, title, comment){
		if(!url) return this;
		if(!this.data) this.data = [];
		if(typeof url === 'string'){
			this.data.push({
				url : url,
				title : title,
				comment : comment,
				src : src
			})
		} else if(url instanceof Array){
			for(var i = 0; i < url.length; i++){
				this.add.apply(this, url[i]);
			}
		}
		return this;
	},
	fill : function(id, config){
		var container = Tethys.get(id);
		if(!container) return;

		function __createButtonBar(parent){
			return Tethys.create('div', {
				className : 'button_bar',
				style : {
					zIndex : 9999,
					position : 'absolute',
					width : w + 'px'
				}
			}).appendTo(parent);
		}
		function __createButton(i, data, parent, fn){
			Tethys.create('a', {
				innerHTML : i + 1,
				target : '_blank',
				href : data.url,
				index : i,
				onmouseover : function(){ fn(this.index); }
			}).appendTo(parent)
		}
		function __unActive(f, b){
			f.flush();
			f.style.zIndex = 0;
			f.fadeOut();
			b.className = '';
		}
		function __active(f, b){
			f.flush();
			f.style.zIndex = 999;
			f.fadeIn();
			b.className = 'active';
		}

		config = config || {};
		config.waiting = config.waiting || 3000;
		config.interval = config.interval || 500;
		config.active = config.active || __active;
		config.unActive = config.unActive || __unActive;
		config.pauseNode = config.pauseNode ? Tethys.get(config.pauseNode) : container;
		config.createButtonBar = config.createButtonBar || __createButtonBar;
		config.createButton = config.createButton || __createButton;

		var rect = container.rect();
		var w = rect.clientWidth - rect.paddingLeft - rect.paddingRight,
			h = rect.clientHeight - rect.paddingTop - rect.paddingBottom;
		var i = 0, len = this.data.length, frames = [], activeFrameIndex = -1;
		var autoHandler = null, autoIndex = -1;
		var buttonBar = config.createButtonBar(container);
		
		function show(index){
			index = index || 0;
			autoIndex = index;
			if(activeFrameIndex != index){
				if(!!frames[activeFrameIndex]){
					config.unActive(frames[activeFrameIndex], buttonBar.childNodes[activeFrameIndex])
				}
				activeFrameIndex = index;
				config.active(frames[activeFrameIndex], buttonBar.childNodes[activeFrameIndex])
			}
		}
		function autoShow(){
			autoHandler = setTimeout(function(){
				autoIndex = (autoIndex + 1) % len;
				show(autoIndex);
				autoShow();
			}, activeFrameIndex < 0 ? 0 : config.waiting);
		}
		config.pauseNode.mouseover(function(){
			if(!!autoHandler){
				clearTimeout(autoHandler);
				autoHandler = null;
			}
		});
		config.pauseNode.mouseout(function(){ autoShow(); });

		for(; i < len; i++){
			config.createButton(i, this.data[i], buttonBar, show);
			var frame = Album.frameMaker(this.data[i], w, h, (len - i) * 10, config.interval);
			frame.appendTo(container);
			frame.fit();
			frames.push(frame);
		}
		autoShow();
	}
}