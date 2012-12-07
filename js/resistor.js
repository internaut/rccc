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
    
    console.log("r: " + r);
    
    var p = 0;
    var x, f;
    var powMax = Math.pow(10, preferredBandValLength);
    while(true) {
        x = Math.pow(10, p);
        f = r / x;
        
        if (f < powMax) {
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
    
    console.log("pow10: " + curResValPow10);
    updateBandValue(3, curResValPow10, false);
    setBandColor(3, bandColors[curResValPow10 + 1]);
    
    if (eSeriesCompliant) $('#eSeriesInfo').hide('fast');
    
    updateResistanceValue(r);
}

function eSeriesSelectionClicked(event) {
    // get the series number from the id
    var clickedSeries = this.id.substr(this.id.length - 1, this.id.length);
    
    changeESeriesDisplay(clickedSeries);
    var newBandVals = chooseValueForESeries(clickedSeries, curBandVals);
    if (newBandVals != curBandVals) {
        console.log("curResValPow10: " + curResValPow10);
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
    var closestSeries = selData[0];
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

function closeClrSelector() {
    if (activeBand > -1) {
        $(activeBandId).hide('fast');
        activeBand = -1;
        activeBandId = '';
    }
}

function setBandColor(band, color) {
    $('#resBand' + band).css({background:color})
}

function clrFieldOver(event) {
    $(this).addClass('clrSelectorSelected');
    
    setBandColor(activeBand, $(this).css('backgroundColor'));
    
    updateBandValue(activeBand, $(this).index());
}

function clrFieldOut(event) {
    $(this).removeClass('clrSelectorSelected');
}

function updateBandValue(band, val, calcRes) {
    // set default value for "calcRes" parameter
    calcRes = typeof calcRes !== 'undefined' ? calcRes : true;
    
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
    if (band < 5 && calcRes) {
        var b = new Array();
        for (var i = 0; i < 4; i++) {
            b[i] = parseFloat($('#resBand' + i + 'Val').text());
        }

        curBandVals = b[0] * 100.0 + b[1] * 10.0 + b[2];
        updateESeriesSelectionForNewOhmValue(chooseESeriesForValue(curBandVals));
        curResVal = curBandVals * Math.pow(10, b[3]);
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
    
    // set the unit prefix
    $('.unitPrefix').empty();
    $('.unitPrefix').append(unitPrefixes[p]);
    
    // set the value
    $('#resValue').val(finalVal);
    
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
    $('.resBand').click(bandClicked)
 });