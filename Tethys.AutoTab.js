function AutoTab(id, delay, step, headTag, panelTag){
    var container = Tethys.get(id);
	if(!container) return;
	var headers = Tethys.get(headTag || 'h3', container);
	if (headers.length < 1) return;


	panelTag = panelTag || 'ul';
	step = step || 10;
	switch_delay = delay || 3000;
	
	var active_index = -1;
	var auto_handler = null;
	var headHeight = 0;
	var headBar = Tethys.create('div', { className : 'head_bar' }).appendTo(container);
	var panel = Tethys.create('div', { className : 'panel_container' }).appendTo(container);

	function fadeElement(el){
		el.fade = function(step, sign){
			if(Tethys.animation.hasKey(this.fade_handler)){
				Tethys.animation.remove(this.fade_handler);
				this.fade_handler = null;
			}
			if(typeof this.opacity_value != 'number'){
				this.opacity_value = sign < 0 ? 1 : 0;
			}
			var _ = this, seed = sign / step;
			_.fade_handler = Tethys.animation.regist(function(interval, cost, times){
				_.opacity_value = Math.max(0, Math.min(1, _.opacity_value + seed));
				_.css('opacity', _.opacity_value);
				if(times >= step){
					Tethys.animation.remove(_.fade_handler);
					_.fade_handler = null;
					return true;
				}
			});
		}
		return el;
	}

	function active(hs, index){
		if(hs.length < 1) return;
		index = (index || 0) % hs.length;
		if(active_index === index) return;
		if(hs[active_index]){
			hs[active_index].linker.fade(step, -1);
			hs[active_index].className = '';
		}
		active_index = index;
		if(hs[active_index]){
			hs[active_index].linker.fade(step, 1);
			hs[active_index].className = 'active';
		}
	}

	function auto(){
		active(headers, (active_index + 1) % headers.length);
		auto_handler = setTimeout(auto, switch_delay)
	}

	headers
		.nextNear(panelTag, function(p){ fadeElement(p).css({'opacity' : 0 }); })
		.mouseover(function(e){ active(headers, this.index); })
		.each(function(h){
			var css = Tethys.css(h);
			var marginV = parseInt(css.marginTop) + parseInt(css.marginBottom);
			if(isNaN(marginV)) marginV = 0;
			headHeight = Math.max(h.offsetHeight + marginV, headHeight);
		})
		;
	headBar.css('clear:both;height:' + headHeight + 'px;overflow:hidden;');
	headers.appendTo(headBar)
	Tethys.get(panelTag, container).appendTo(panel);
	container
		.mouseout(function(){
			if(!auto_handler){
				auto_handler = setTimeout(auto, switch_delay);
			}
		})
		.mouseover(function(){
			clearTimeout(auto_handler);
			auto_handler = null;
		})
		;

	auto();
}