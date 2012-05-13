function xxzxCalendar(id){
	var container = Tethys.get(id);
	function getFullString(d){
		var s = d.getFullYear() + '年' + (d.getMonth() + 1) + '月'　+ d.getDate() + '日';
		s += '　星期' + '日一二三四五六'.charAt(d.getDay())
		s += '　农历' + lunar(d).replace(/^\*+/g, '');
		return s;
	}
	var literal = Tethys.create('span', {
		innerHTML: getFullString(new Date())
	}).appendTo(container);
	var hoverButton = Tethys.create('a', { href:'#' }).appendTo(container)


	var areaWidth = 20;
	var calendarShow = false;
	var calendar = LunarCalendar();
	hoverButton.mousedown(function(e){
		Tethys.event.nobubble(e);
		if(calendarShow){
			calendar.parentNode && calendar.parentNode.removeChild(calendar)
			calendarShow = false;
		} else {
			if(!container.nextSibling){
				container.parentNode.appendChild(calendar);
			} else {
				container.parentNode.insertBefore(calendar, container.nextSibling);
			}
			calendarShow = true;
		}
	});

	hoverButton.mouseclick(function(e){
		Tethys.event.nodefault(e);
		return false;
	})

	calendar.mousedown(function(e){
		Tethys.event.nobubble(e);
	})
	Tethys.event.add(document, 'mousedown', function(){
		calendar.parentNode && calendar.parentNode.removeChild(calendar)
		calendarShow = false;
		avaliable = false;
	});

}