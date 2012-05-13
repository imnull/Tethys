function AutoHScroll(id) {
    var container = Tethys.get(id);
    if (!container) return;
    var child = container.firstChild;
    while (child && child.nodeType != 1) {
        child = child.nextSibling;
    }
    if (!child || child.nodeType != 1) return;
    var value = container.clientWidth;
    var childValue = child.offsetWidth;
    var tb = Tethys.create('table', { cellPadding: 0, cellSpacing: 0, border: 0 })
            , tbody = document.createElement('tbody')
            , tr = document.createElement('tr')
            , td = document.createElement('td')
            ;
    td.style.padding = '0px';
    td.appendChild(child);
    tr.appendChild(td);
    tbody.appendChild(tr);
    tb.appendChild(tbody);

    var c = 0, step = 1;
    while (c <= value) {
        c += childValue;
        tr.appendChild(td.cloneNode(true));
    }
    container.innerHTML = '';
    container.appendChild(tb);

    c = 0;
    var handler, fn = function (interval, cost, times) {
        c += step;
        if (c > childValue) c = 0;
        container.scrollLeft = c;
    }
    handler = Tethys.animation.regist(fn);
    container.mouseover(function (e) {
        if (!!handler) {
            Tethys.animation.remove(handler);
            handler = null;
        }
    });
    container.mouseout(function (e) {
        if (!!handler) {
            Tethys.animation.remove(handler);
            handler = null;
        }
        handler = Tethys.animation.regist(fn);
    });
}