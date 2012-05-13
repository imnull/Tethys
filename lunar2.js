/*
*** 农历						***
*** by MKing@MKing's Kingdom	***
*** winnie_mk@126.com			***
*** 2009.11.5					***
*** 2012.4.27					***
*** 抛弃了修改Date原型的方式，简化为两个全局函数 ***

*************************************** 

* lunarCalendar 数据来源 http://blog.chinaunix.net/u/25381/showart_199998.html
* 	1 - 4	: 春节的公历日期
* 	5 - 6	: 春节的公历月份
* 		7	: 农历13月
* 		8	: 农历12月
* 		9	: 农历11月
* 		10	: 农历10月
* 		11	: 农历9月
* 		12	: 农历8月
* 		13	: 农历7月
* 		14	: 农历6月
* 		15	: 农历5月
* 		16	: 农历4月
* 		17	: 农历3月
* 		18	: 农历2月
* 		19	: 农历1月
*  20 - 23	: 当年闰月月份，值为0为则表示当年无闰月。

* solarTerms 节气数据来源 http://www.devdiv.com/CSharp_%E5%86%9C%E5%8E%86_%E8%8A%82%E6%B0%94%E6%95%B0%E6%8D%AE_1900_2100-weblog-20-7126.html
* 说明：例如 0x65，取 6 和 5 + 15，分别对应当月两个节气在当月的阳历日期。

*/

(function(w){

var lunarCalendar = [
0x04AE53,0x0A5748,0x5526BD,0x0D2650,0x0D9544,0x46AAB9,0x056A4D,0x09AD42,0x24AEB6,0x04AE4A,/*1901-1910*/
0x6A4DBE,0x0A4D52,0x0D2546,0x5D52BA,0x0B544E,0x0D6A43,0x296D37,0x095B4B,0x749BC1,0x049754,/*1911-1920*/
0x0A4B48,0x5B25BC,0x06A550,0x06D445,0x4ADAB8,0x02B64D,0x095742,0x2497B7,0x04974A,0x664B3E,/*1921-1930*/
0x0D4A51,0x0EA546,0x56D4BA,0x05AD4E,0x02B644,0x393738,0x092E4B,0x7C96BF,0x0C9553,0x0D4A48,/*1931-1940*/
0x6DA53B,0x0B554F,0x056A45,0x4AADB9,0x025D4D,0x092D42,0x2C95B6,0x0A954A,0x7B4ABD,0x06CA51,/*1941-1950*/
0x0B5546,0x555ABB,0x04DA4E,0x0A5B43,0x352BB8,0x052B4C,0x8A953F,0x0E9552,0x06AA48,0x7AD53C,/*1951-1960*/
0x0AB54F,0x04B645,0x4A5739,0x0A574D,0x052642,0x3E9335,0x0D9549,0x75AABE,0x056A51,0x096D46,/*1961-1970*/
0x54AEBB,0x04AD4F,0x0A4D43,0x4D26B7,0x0D254B,0x8D52BF,0x0B5452,0x0B6A47,0x696D3C,0x095B50,/*1971-1980*/
0x049B45,0x4A4BB9,0x0A4B4D,0xAB25C2,0x06A554,0x06D449,0x6ADA3D,0x0AB651,0x093746,0x5497BB,/*1981-1990*/
0x04974F,0x064B44,0x36A537,0x0EA54A,0x86B2BF,0x05AC53,0x0AB647,0x5936BC,0x092E50,0x0C9645,/*1991-2000*/
0x4D4AB8,0x0D4A4C,0x0DA541,0x25AAB6,0x056A49,0x7AADBD,0x025D52,0x092D47,0x5C95BA,0x0A954E,/*2001-2010*/
0x0B4A43,0x4B5537,0x0AD54A,0x955ABF,0x04BA53,0x0A5B48,0x652BBC,0x052B50,0x0A9345,0x474AB9,/*2011-2020*/
0x06AA4C,0x0AD541,0x24DAB6,0x04B64A,0x69573D,0x0A4E51,0x0D2646,0x5E933A,0x0D534D,0x05AA43,/*2021-2030*/
0x36B537,0x096D4B,0xB4AEBF,0x04AD53,0x0A4D48,0x6D25BC,0x0D254F,0x0D5244,0x5DAA38,0x0B5A4C,/*2031-2040*/
0x056D41,0x24ADB6,0x049B4A,0x7A4BBE,0x0A4B51,0x0AA546,0x5B52BA,0x06D24E,0x0ADA42,0x355B37,/*2041-2050*/
0x09374B,0x8497C1,0x049753,0x064B48,0x66A53C,0x0EA54F,0x06B244,0x4AB638,0x0AAE4C,0x092E42,/*2051-2060*/
0x3C9735,0x0C9649,0x7D4ABD,0x0D4A51,0x0DA545,0x55AABA,0x056A4E,0x0A6D43,0x452EB7,0x052D4B,/*2061-2070*/
0x8A95BF,0x0A9553,0x0B4A47,0x6B553B,0x0AD54F,0x055A45,0x4A5D38,0x0A5B4C,0x052B42,0x3A93B6,/*2071-2080*/
0x069349,0x7729BD,0x06AA51,0x0AD546,0x54DABA,0x04B64E,0x0A5743,0x452738,0x0D264A,0x8E933E,/*2081-2090*/
0x0D5252,0x0DAA47,0x66B53B,0x056D4F,0x04AE45,0x4A4EB9,0x0A4D4C,0x0D1541,0x2D92B5          /*2091-2099*/
], ut = {
	day : 1000 * 60 * 60 * 24,
	cnum : '〇一二三四五六七八九十'.split(''),
	sti : [
		0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,
		263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758
	],
	stn : '小寒,大寒,立春,雨水,惊蛰,春分,清明,谷雨,立夏,小满,芒种,夏至,\
	小暑,大暑,立秋,处暑,白露,秋分,寒露,霜降,立冬,小雪,大雪,冬至'.split(',')
}, lunarDays = {
	'0101': '春节',
	'0115': '元宵节',
	'0505': '端午节',
	'0707': '七夕',
	'0715': '中元',
	'0815': '中秋',
	'0909': '重阳节',
	'1208': '腊八',
	'1223': '小年',
	'1229': '除夕'
}
/*
 * 某年的第n个节气为几日(从0小寒起算)
 * http://site.baidu.com/list/wannianli.htm
 */
function sTerm(y, n) {
	if(y == 2009 && n == 2){
		ut.sti[n]=43467;
	}
	var offDate = new Date(
		(31556925974.7 * (y - 1900) + ut.sti[n] * 60000)
		+ Date.UTC(1900, 0, 6, 2, 5)
	);
	return offDate.getUTCDate();
}
function getSolarTerms(d){
	var y = d.getFullYear(), m = d.getMonth();
	switch(d.getDate()){
		case sTerm(y, m * 2):
			return ut.stn[m * 2];
		case sTerm(y, m * 2 + 1):
			return ut.stn[m * 2 + 1];
	}
	return null;
}
function getLunarDay(lm, ld){
	if(lm < 10) lm = '0' + lm;
	if(ld < 10) ld = '0' + ld;
	var key = lm + ld;
	if(key in lunarDays) return lunarDays[key];
	return null;
}
function toLunarDay(n){
	if(n == 10) return '初十'
	if(n % 10 == 0){
		return ut.cnum[parseInt(n / 10)] + '十';
	}
	return '初十廿卅'.charAt(parseInt(n / 10)) + ut.cnum[n % 10];
}
function toLunarMonth(n, isIntercalaryMonth, isBigMonth){
	var m;
	switch(n){
		case 1:
			m = '正';
			break;
		case 12:
			m = '腊';
			break;
		case 10:
			m = '十';
			break;
		default:
			if(n < 10) m = ut.cnum[n];
			else m = '十' + ut.cnum[n % 10]
			break;

	}
	return [isIntercalaryMonth ? '闰' : '', m, '月'
		//, isBigMonth ? '（大）' : '（小）'
	];
}
function toLunarYear(n){
	return [
		'甲乙丙丁戊己庚辛壬癸'.charAt((n + 7 - 1901) % 10),
		'子丑寅卯辰巳午未申酉戌亥'.charAt((n + 1 - 1901) % 12),
		'鼠牛虎兔龙蛇马羊猴鸡狗猪'.charAt((n + 1 - 1901) % 12)
	];
}
function lunarBase(d){
	var date;
	var year = d.getFullYear();
	/* 获取当年春节的阳历日期 */
	var springDay = new Date(year
		, (((data = lunarCalendar[year - 1901]) & 0x0060) >> 5) - 1
		, data & 0x001f);
	/* 获取日期对象时间(阳历日期)和当年春节的天数差 */
	var offset = parseInt((d - springDay) / ut.day);
	var _offset = offset;
	/* 如果offset小于零，则表示该日期在当年春节前，应重新计算前一年春节日期为基准 */
	if(offset < 0){
		year--;
		springDay = new Date(year
			, (((data = lunarCalendar[year - 1901]) & 0x0060) >> 5) - 1
			, data & 0x001f);
		offset = parseInt((d - springDay) / ut.day);
	}
	var i, tmp = 0, lunarMonthAdder = 0, intercalaryMonth = (data & 0xF00000) >> 20/*当年闰月月份*/;
	for(i = 0x80000; i >= 0x80; i >>= 1){
		if(offset - (tmp = (data & i) > 0 ? 30 : 29) < 0) break;
		offset -= tmp;
		lunarMonthAdder++;
	}
	var isIntercalaryMonth = false;
	var isBigMonth = ((0x80000 >> lunarMonthAdder) & data) > 0;/* 当月大小月 */
	if(intercalaryMonth > 0){
		/* 判断该月是否为闰月 */
		isIntercalaryMonth = lunarMonthAdder == intercalaryMonth;
		/* 闰月减一 */
		if(lunarMonthAdder > intercalaryMonth - 1) lunarMonthAdder--;
	}
	var chuxi = new Date(springDay);
	chuxi.setMonth(chuxi.getMonth(), chuxi.getDate() - 1);
	return [year, lunarMonthAdder + 1, isIntercalaryMonth, isBigMonth, offset + 1, _offset == -1]
}

/*
 * 返回完整的农历年月日字符串
 */
function lunar(d, method){
	d = d || new Date();
	var data = lunarBase(d);	
	var s = toLunarYear(data[0]).join('') + '年'
		+ toLunarMonth(data[1], data[2], data[3]).join('')
		+ toLunarDay(data[4])
		;
	var day;
	if(data[5]){
		day = '除夕';
	} else if(data[2]){
		day = null;
	} else {
		day = getLunarDay(data[1], data[4]);
	}
	if(!!day){
		s = '*' + s + ' ' + day;
	}
	var jieqi = getSolarTerms(d);
	if(!!jieqi){
		s = '*' + s + '（' + jieqi + '）'
	}
	if(typeof method === 'function'){
		return method(data, s, d, jieqi, day);
	} else {
		return s;
	}
}
/*
 * 返回一个短字符串 供日历使用
 */
function lunarCal(d){
	d = d || new Date();
	var jieqi = getSolarTerms(d);
	var data = lunarBase(d);
	if(!!jieqi){
		return jieqi;
	} else {
		if(data[4] === 1){
			var s = toLunarMonth(data[1], data[2], data[3]).join('');
			if(data[3]) s += '大';
			return s;
		} else {
			return toLunarDay(data[4]);
		}
	}
}

w.lunar = lunar;
w.lunarCal = lunarCal;

})(window)