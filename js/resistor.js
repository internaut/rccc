var activeBand = 0; // "0" means "none"

var bandColors = new Array(
    'black',
    'brown',
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'violet',
    'gray',
    'white',
    // -- resistor tolerances:
    'gold',
    'silver',
    'none');

function bandClicked(event) {
    var clickedBand = this.id.substr(this.id.length - 1, this.id.length);
    
    if (activeBand == 0 || activeBand != clickedBand) { // band not yet clicked or other band clicked
        // set the active band number
        activeBand = clickedBand;
        
        // get the color selector
        var clrSelector = $('#clrSelector');
        clrSelector.hide();
        
        // configure the color selector for the current band
        var i = 0;
        clrSelector.children().each(function() {
            $(this).show();
            
            if (activeBand == 1 && i == 0)
                $(this).hide();
            else if (activeBand == 3 && i > 6)
                $(this).hide();
            else if (activeBand == 4 && i < 10)
                $(this).hide();
            
            if (activeBand < 4 && i > 9) 
                $(this).hide();
            
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
    $('#clrSelector').hide('fast');
    activeBand = 0;
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

function updateValues(band, val) {
    // set the band's value
    var bandValId = '#resBand' + band + 'Val';
    $(bandValId).text(val);
    
    // calculate new ohms
    var b = new Array();
    for (var i = 1; i < 4; i++) {
        b[i - 1] = parseFloat($('#resBand' + i + 'Val').text());
    }
    
    var resVal = (b[0] * 10.0 + b[1]) * Math.pow(10, b[2]);
    
    $('#resValue').val(resVal);
}

$(document).ready(function(){
    // create color fields for color selector
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
    
    $('#clrSelector > div:last').append('<em>none</em>');
    
    // define events
    $('.resBand').click(bandClicked)
 });