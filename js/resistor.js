var activeESeries = 0;
var activeBand = -1;    // "-1" means "none"
var activeBandId = '';
var curResVal = 10;     // current resistance value
var curResValPow10 = 0;
var curBandVals = 10;

// colors for normal bands
var bandColors = new Array(
    'none',
    'black',
    'saddlebrown',
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'violet',
    'gray',
    'white'
);
    
var bandColorsTol = new Array(
    'none',
    'grey',
    'violet',
    'blue',
    'green',
    'saddlebrown',
    'red',
    'gold',
    'silver'
    );

var bandColorsTemp = new Array(
    'none',
    'saddlebrown',
    'red',
    'yellow',
    'orange',
    'blue',
    'violet',
    'white'
    );

var unitPrefixes = new Array(
    '',
    'K',
    'M',
    'G'
);

var unitPrefixesValues = new Array(
    1,
    1000,
    1000000,
    1000000000
);

var tolValues = new Array(
    20,
    0.05,
    0.1,
    0.25,
    0.5,
    1,
    2,
    5,
    10
);

var tempValues = new Array(
    null,
    1,
    5,
    10,
    15,
    25,
    50,
    100
);

function setNewResistance(r, eSeriesCompliant, preferredBandValLength) {
    eSeriesCompliant = typeof eSeriesCompliant !== 'undefined' ? eSeriesCompliant : false;
    preferredBandValLength = typeof preferredBandValLength !== 'undefined' ? preferredBandValLength : 3;
    
//    console.log("r: " + r);
    
    var p = 0;
    var x, f;
    var fMax = Math.pow(10, preferredBandValLength);
    var fMin = 10;
    while(true) {
        x = Math.pow(10, p);
        f = r / x;
        
        if ((f < fMax && f / 10 != Math.round(f / 10)) || f <= fMin) {
            break;
        }
        
        p++;
    }
    console.log("p: " + p);
    console.log("f: " + f);
    curResVal = r;
    curBandVals = f;
    curResValPow10 = p;
    var bandsStr = curBandVals.toString();
    
    if (bandsStr.length == 2) {
        bandsStr = '0' + bandsStr;
    }
    
    for (var band = 0; band < 3; band++) {
        var bandVal = parseInt(bandsStr.charAt(band));
        var bandColor = bandColors[bandVal + 1];
        
        if (band == 0 && bandVal == 0) bandColor = 'none';
        console.log("Updating band#" + band + " to " + bandVal + " / " + bandColor);
        setBandColor(band, bandColor);
        updateBandValue(band, bandVal, false);
    }
    
//    console.log("pow10: " + curResValPow10);
    updateBandValue(3, curResValPow10, false, true);
    curResValPow10 = parseFloat(curResValPow10); // fixes a bug
    setBandColor(3, bandColors[curResValPow10 + 1]);
    
    if (eSeriesCompliant) $('#eSeriesInfo').hide('fast');
    
    updateResistanceValue(r);
}

function eSeriesSelectionClicked(event) {
    // get the series number from the id
    var clickedSeries = this.id.substr(this.id.length - 1, this.id.length);
    
    changeESeriesSelection(clickedSeries);
}

function changeESeriesSelection(newSeries) {
    changeESeriesDisplay(newSeries);
    var newBandVals = chooseValueForESeries(newSeries, curBandVals);
    if (newBandVals != curBandVals) {
        setNewResistance(newBandVals * Math.pow(10, curResValPow10), true, newBandVals.toString().length);
    }
}

function changeESeriesDisplay(newSeries) {
    // if nothing changed, do nothing
    if (activeESeries == newSeries) return;
    
    $('#eseries_' + activeESeries).removeClass('active')
    activeESeries = newSeries;
    if (activeESeries != -1) {
        $('#eseries_' + activeESeries).addClass('active');    
    }
}

function updateESeriesSelectionForNewOhmValue(selData) {
    closestSeries = selData[0];
    var directMatch = selData[1];
    var closestValueIdx = selData[2];
    
    var eSeriesInfo = $('#eSeriesInfo');
    if (!directMatch) {
        changeESeriesDisplay(-1);
        
        eSeriesInfo.show('fast');
        $('#eSeriesInfoName').empty().append(eSeriesLabels[closestSeries]);
        $('#eSeriesClosestVal').empty().append(eSeriesValues[closestSeries][closestValueIdx]);
    } else {
        changeESeriesDisplay(closestSeries);
        eSeriesInfo.hide('fast');
    }
}

function eSeriesInfoClicked(event) {
    changeESeriesSelection(closestSeries);
}

function bandClicked(event) {
    // get the band number from the id
    var clickedBand = this.id.substr(this.id.length - 1, this.id.length);
    
    if (activeBand == -1 || activeBand != clickedBand) { // band not yet clicked or other band clicked
        if (activeBand != clickedBand)
            closeClrSelector();
        
        // set the active band number
        activeBand = clickedBand;
        
        // get the color selector
        var clrSelector;
        if (activeBand < 4) {
            activeBandId = '#clrSelector';
        } else if (activeBand == 4) {
            activeBandId = '#clrSelectorTol';
        } else if (activeBand == 5) {
            activeBandId = '#clrSelectorTemp';
        }
        
        clrSelector = $(activeBandId);
        
        clrSelector.hide();
        
        // configure the color selector for the current band
        var i = 0;
        clrSelector.children().each(function() {
            $(this).show();

            if (activeBand > 0 && activeBand < 4 && i == 0)
                $(this).hide();
            if (activeBand == 0 && i == 1)
                $(this).hide();
//            else if (activeBand == 3 && i > 7)
//                $(this).hide();
            
            i++;
        });
        
        // show the color selector
        $(this).append(clrSelector);
        clrSelector.show('fast');
    } else {
        closeClrSelector();
    }
}

function resValueInputChanged(event) {
    //console.log("res value changed to: " + $(this).val());
    
    parseResValueInput($(this).val());
}

function parseResValueInput(t) {
    console.log("parsing value " + t);
    
    // strip whitespace
    t = t.replace(/\s/g, '');
    
    // replace comma by dot
    t = t.replace(',', '.');
    
    // transform to uppercase
    t = t.toUpperCase();
    
    console.log("value is now " + t);
    // check if we have an incorrect string
    if (!t.match(/^\d+(\.\d+?)?(K|M|G)?$/g)) {
        console.log("incorrect!");
        
        $('#resValue').addClass('error');
        
        return;
    }
    
    $('#resValue').removeClass('error');
    
    // the string is correct, get the right potentiation
    var lastChar = t.substr(t.length - 1, t.length);
    var multiply = 1;
    console.log("lastChar is " + lastChar);
    if (lastChar.match(/(K|M|G)/g)) {
        for (var i = 1; i < unitPrefixes.length; i++) {
            if (lastChar == unitPrefixes[i]) {
                multiply = unitPrefixesValues[i];
                break;
            }
        }
    }
    
    // create the final result 'v'
    var v = parseFloat(t) * multiply;
    
    // values below 100 cannot be fractions
    if (v < 100) {
        v = Math.round(v);
    }
    
    // set the final value
    setNewResistance(v);
}

function closeClrSelector() {
    if (activeBand > -1) {
        $(activeBandId).hide('fast');
        activeBand = -1;
        activeBandId = '';
    }
}

function setBandColor(band, color) {
    $('#resBand' + band).css({background:color});
}

function clrFieldOver(event) {
    $(this).addClass('clrSelectorSelected');
    
    setBandColor(activeBand, $(this).css('backgroundColor'));
    
    updateBandValue(activeBand, $(this).index());
}

function clrFieldOut(event) {
    $(this).removeClass('clrSelectorSelected');
}

function updateBandValue(band, val, calcRes, updESeries) {
    // set default value for "calcRes" parameter
    calcRes = typeof calcRes !== 'undefined' ? calcRes : true;
    updESeries = typeof updESeries !== 'undefined' ? updESeries : false;
    
    // get the correct band value
    if (calcRes) {
        if (band < 4) {
            val--;
        } else {
            var valArray;
            if (band == 4) valArray = tolValues;
            else valArray = tempValues;

            val = valArray[val];
        }
    }
    
    // set the band's value
    var bandValId = '#resBand' + band + 'Val';
    var bandValContainerId;
    if (band == 5) {
        bandValContainerId = '#resBand' + band + 'ValContainer';
    } else {
        bandValContainerId = bandValId;
    }
    
    if (((band == 0 || band > 3) && val > 0) || (band > 0 && band < 4)) {
        $(bandValId).text(val);
        $(bandValContainerId).css({visibility: 'visible'});
        $(bandValContainerId).children('*').css({visibility: 'visible'});
    } else {
        $(bandValId).text(0);
        $(bandValContainerId).css({visibility: 'hidden'});
        $(bandValContainerId).children('*').css({visibility: 'hidden'});
    }
    
    // calculate new ohms
    if (band < 5 && (calcRes || updESeries)) {
        var p = curResValPow10;
        
        if (calcRes) {
            var b = new Array();
            for (var i = 0; i < 4; i++) {
                b[i] = parseFloat($('#resBand' + i + 'Val').text());
            }

            curBandVals = b[0] * 100.0 + b[1] * 10.0 + b[2];
            p = b[3];
        }
        
        console.log("Updating E-Series selection... " + curBandVals);
        updateESeriesSelectionForNewOhmValue(chooseESeriesForValue(curBandVals));
        curResVal = curBandVals * Math.pow(10, p);
        updateResistanceValue(curResVal);
    }
}



/**
 * Choose best matching E-Series for a Ohm value n
 * @param n - Ohm value
 * @return Array with:
 *  - E-Series number
 *  - direct match true/false
 *  - index of the closest value if direct match is false
 */
function chooseESeriesForValue(n) {
    // set defaults
    var minSeries = -1;
    var minSeriesVal = Number.MAX_VALUE;
    var closestValueIdx = -1;
    var directMatch = false;
    
    // find best matching E-Series
    for (var s = 0; s < eSeriesValues.length; s++) {
        var sVals = eSeriesValues[s];
        
        for (var i = 0; i < sVals.length; i++) {
            var d = Math.abs(sVals[i] - n);
            
            if (d == 0) {   // direct match found - stop.
                minSeries = s;
                minSeriesVal = n;
                directMatch = true;
                
                break;
            }
            
            if (d < minSeriesVal) { // lower distance found
                minSeriesVal = d;
                minSeries = s;
                closestValueIdx = i;
            }
        }
        
        if (directMatch) break;
    }
    
    return new Array(minSeries, directMatch, closestValueIdx);
}

function chooseValueForESeries(s, oldVal) {
    // set defaults
    var minValDiff = Number.MAX_VALUE;
    var val = -1;
    
    // find best matching value
    var sVals = eSeriesValues[s];
    for (var i = 0; i < sVals.length; i++) {
        var d = Math.abs(sVals[i] - oldVal);

        if (d < minValDiff) { // lower distance found
            val = sVals[i];
            minValDiff = d;
        }
    }
 
    return val;
}

function updateResistanceValue(val) {
    // see if we can switch to giga or kilo
    var p = 0;
    var x, finalVal;
    while(true) {
        x = Math.pow(1000, p);
        finalVal = val / x;
        
        if (finalVal < 1000.0) {
            break;
        }
        
        p++;
    }
    
    // set the 10er potentiation
    curResValPow10 = $('#resBand3Val').text();
    
    // set the value
    $('#resValue').val(finalVal + unitPrefixes[p]);
    
    // calculate new ohm min/max values
    var t = parseFloat($('#resBand4Val').text()) / 100.0 * finalVal;
    var min = Math.round((finalVal - t) * 100) / 100;
    var max = Math.round((finalVal + t) * 100) / 100;
    
    $('#tolMinVal').empty().append(min);
    $('#tolMaxVal').empty().append(max);
}

$(document).ready(function(){
    // create color fields for normal color selector
    var clrSelector = $('#clrSelector');
    
    for (var i = 0; i < bandColors.length; ++i) {
        var c = bandColors[i];
        clrSelector.append('<div></div>');
        $('#clrSelector > div:last')
            .addClass('clrSelectorField')
            .css({backgroundColor: c})
            .mouseover(clrFieldOver)
            .mouseout(clrFieldOut);
    }
    
    clrSelector.hide();
    
    // create color fields for tolerance color selector
    var clrSelectorTol = $('#clrSelectorTol');
    
    for (i = 0; i < bandColorsTol.length; ++i) {
        c = bandColorsTol[i];
        clrSelectorTol.append('<div></div>');
        $('#clrSelectorTol > div:last')
            .addClass('clrSelectorField')
            .css({backgroundColor: c})
            .mouseover(clrFieldOver)
            .mouseout(clrFieldOut);
    }
    
    clrSelectorTol.hide();
    
    // create color fields for temperature color selector
    var clrSelectorTemp = $('#clrSelectorTemp');
    
    for (i = 0; i < bandColorsTemp.length; ++i) {
        c = bandColorsTemp[i];
        clrSelectorTemp.append('<div></div>');
        $('#clrSelectorTemp > div:last')
            .addClass('clrSelectorField')
            .css({backgroundColor: c})
            .mouseover(clrFieldOver)
            .mouseout(clrFieldOut);
    }
    
    clrSelectorTemp.hide();
    
    $('#clrSelector > div:first').append('<em>none</em>');
    $('#clrSelectorTol > div:first').append('<em>none</em>');
    $('#clrSelectorTemp > div:first').append('<em>none</em>');
    
    // create the E-Series menu
    var eSeriesMenu = $('#eSeriesMenu');
    for (i = 0; i < eSeriesLabels.length; ++i) {
        eSeriesMenu.append('<li>' + eSeriesLabels[i] + '</li>');
        var curElem = $('#eSeriesMenu > li:last');
        curElem.attr({id: 'eseries_' + i});
        curElem.click(eSeriesSelectionClicked);
        if (i == activeESeries) curElem.addClass('active');
    }
    
    // define events
    $('.resBand').click(bandClicked);
    $('#eSeriesClosestValButton').click(eSeriesInfoClicked);
    $('#resValue').change(resValueInputChanged);
    $('#resValue').keyup(function () {});
    
    // handle GET parameter & set default
    var getParam = window.location.search.replace("?resValue=", "");
    if (getParam !== undefined && getParam.length > 0) {
        parseResValueInput(getParam);
    }
 });