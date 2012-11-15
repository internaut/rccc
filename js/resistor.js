var activeBand = -1; // "-1" means "none"
var activeBandId = '';

// colors for normal bands
var bandColors = new Array(
    'none',
    'black',
    'brown',
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
    'brown',
    'red',
    'gold',
    'silver'
    );

var bandColorsTemp = new Array(
    'none',
    'brown',
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

function clrFieldOver(event) {
    $(this).addClass('clrSelectorSelected');
    
    $('#resBand' + activeBand).css({backgroundColor: $(this).css('backgroundColor')
        })
    
    updateValues(activeBand, $(this).index());
}

function clrFieldOut(event) {
    $(this).removeClass('clrSelectorSelected');
}

function clrFieldOver(event) {
    $(this).addClass('clrSelectorSelected');
    
    $('#resBand' + activeBand).css({backgroundColor: $(this).css('backgroundColor')
        })
    
    updateValues(activeBand, $(this).index());
}

function updateValues(band, val) {
    // get the correct band value
    if (band < 4) {
        val--;
    } else {
        var valArray;
        if (band == 4) valArray = tolValues;
        else valArray = tempValues;
        
        val = valArray[val];
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
    if (band < 5) {
        var b = new Array();
        for (var i = 0; i < 4; i++) {
            b[i] = parseFloat($('#resBand' + i + 'Val').text());
        }

        var resVal = (b[0] * 100.0 + b[1] * 10.0 + b[2]) * Math.pow(10, b[3]);

        var finalRes = updateUnitPrefix(resVal);

        // calculate new min/max values
        var t = parseFloat($('#resBand4Val').text()) / 100.0 * finalRes;
        
        $('#tolMinVal').empty();
        $('#tolMinVal').append(finalRes - t);
        $('#tolMaxVal').empty();
        $('#tolMaxVal').append(finalRes + t);
    }
}

function updateUnitPrefix(val) {
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
    
    $('.unitPrefix').empty();
    $('.unitPrefix').append(unitPrefixes[p]);
    $('#resValue').val(finalVal);
    
    return finalVal;
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
    
    // define events
    $('.resBand').click(bandClicked)
 });