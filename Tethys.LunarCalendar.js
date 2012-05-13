(function(w){

function CalendarPanel(d, offset, cellMethod){
	offset = offset || 0;
	d = d || new Date();

	var fd = new Date(d.getFullYear(), d.getMonth(), 1);
	fd.setMonth(d.getMonth(), (1 - fd.getDay() + offset) % 7);
	var dayCount;
	dayCount = new Date(d.getFullYear(), d.getMonth() + 1, 0) - fd;
	dayCount = dayCount / 86400000 + 1;
	dayCount = Math.ceil(dayCount / 7) * 7;

	var tet = Tethys;
	var tb = tet.create('table', {
		border: 0,
		cellPadding: 0,
		cellSpacing: 0,
		align: 'center'
	}), tbody = tet.create('tbody').appendTo(tb), tr, i = 0;

	tr = tet.create('tr').appendTo(tbody);
	for(; i < 7; i++){
		tet.create('th', {
			innerHTML : '日一二三四五六'.charAt((i + offset + 7) % 7)
		}).appendTo(tr);
	}

	if(typeof cellMethod != 'function'){
		cellMethod = function(td, d, _d){
			td.innerHTML = '<h3>' + d.getDate() + '</h3>';
			td.title = d.getFullYear() + '年' +
				(d.getMonth() + 1) + '月' +
				d.getDate() + '日';
		}
	}
	i = 0;
	var td;
	do{
		if(i % 7 === 0){
			tr = tet.create('tr').appendTo(tbody);
		}
		td = tet.create('td').appendTo(tr);

		cellMethod(td, fd, d);

		fd.setMonth(fd.getMonth(), fd.getDate() + 1);
	} while(++i < dayCount)

	tet = tr = td = tbody = i = dayCount = fd = null;
	return tb;
}

function createSelector(min, max, unit, selValue){
	var sel = Tethys.create('select');
	var y = new Date().getFullYear();
	for(var i = min; i <= max; i++){
		var op = new Option(i + unit, i);
		op.selected = selValue == i
		sel.add(op)
	}
	sel.val = function(){
		return this[this.selectedIndex].value
	}
	return sel;
}

function LunarCalendar(){
	var container = Tethys.create('div', { className: 'LunarCalendar' });

	var date = new Date();
	var todayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

	function cellMethod(td, d, _d){
		var ls = lunar(d);
		var level = false;
		ls = ls.replace(/^\*+/g, function(m){
			level = true;
			return '';
		});
		if(d - todayDate == 0){
			td.className = 'today';
		} else if(_d.getMonth() != d.getMonth()){
			td.className = 'blur';
		} else if(level){
			td.className = 'special';
		}

		td.title = 
			d.getFullYear() + '年' + (d.getMonth() + 1) + '月' +
			d.getDate() + '日' + '\n' + ls;

		function innerString(data, s, d, jieqi, day){
			var str = '';
			str += '<h3>' + d.getDate() + '</h3>';
			str += '<label>' + (day || '') + '</label>';
			str += '<span>' + lunarCal(d) + '</span>';
			return str;
		}
		td.innerHTML = lunar(d, innerString);
	}

	var maxYear = 2099, minYear = 1902;

	var year = createSelector(minYear, maxYear, '年', date.getFullYear());
	var month = createSelector(1, 12, '月', date.getMonth() + 1);
	var panel = CalendarPanel(date, -6, cellMethod);

	function reset(d){
		container.removeChild(panel);

		if(year.val() != d.getFullYear()){
			year.selectedIndex = d.getFullYear() - minYear;
		}
		if(month.val() - 1 != d.getMonth()){
			month.selectedIndex = d.getMonth();
		}

		if(date.getFullYear() >= 2099){
			nextYear.disabled = true;
			if(date.getMonth() >= 11){
				nextMonth.disabled = true;
			} else {
				nextMonth.disabled = false;
			}
		} else {
			nextYear.disabled = false;
			nextMonth.disabled = false;
		}

		if(date.getFullYear() <= minYear){
			prevYear.disabled = true;
			if(date.getMonth() <= 0){
				prevMonth.disabled = true;
			} else {
				prevMonth.disabled = false;
			}
		} else {
			prevYear.disabled = false;
			prevMonth.disabled = false;
		}

		panel = CalendarPanel(d, -6, cellMethod);
		panel.appendTo(container);
	}

	var today = Tethys.create('input', { value: '今天', type: 'button', onmouseup: function(){
		date = new Date();
		reset(date);
	} })

	var nextMonth = Tethys.create('input', { value: '>', type: 'button', onmouseup: function(){
		date.setMonth(date.getMonth() + 1, date.getDate());
		reset(date);
	}})
	var prevMonth = Tethys.create('input', { value: '<', type: 'button', onmouseup: function(){
		date.setMonth(date.getMonth() - 1, date.getDate());
		reset(date);
	}})

	var nextYear = Tethys.create('input', { value: '>', type: 'button', onmouseup: function(){
		date.setMonth(date.getMonth() + 12, date.getDate());
		reset(date);
	}})
	var prevYear = Tethys.create('input', { value: '<', type: 'button', onmouseup: function(){
		date.setMonth(date.getMonth() - 12, date.getDate());
		reset(date);
	}})

	year.onchange = 
	month.onchange = function(){
		date = new Date(year.val(), month.val() - 1, date.getDate())
		reset(date);
	}

	today.appendTo(container);

	prevYear.appendTo(container);
	year.appendTo(container);
	nextYear.appendTo(container);

	prevMonth.appendTo(container);
	month.appendTo(container);
	nextMonth.appendTo(container);
	panel.appendTo(container);

	return container;
}

w.LunarCalendar = LunarCalendar;

})(window);
