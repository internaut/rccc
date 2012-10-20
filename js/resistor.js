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
        
        // show the color selector
        var clrSelector = $('#clrSelector');
        clrSelector.hide();
        
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
        
        $(this).append(clrSelector);
        clrSelector.show('fast');
    } else {
        
    }
}

$(document).ready(function(){
    // create color fields for color selector
    var clrSelector = $('#clrSelector');
    
    for (var i = 0; i < bandColors.length; ++i) {
        var c = bandColors[i];
        clrSelector.append('<div></div>');
        $('#clrSelector > div:last').addClass('clrSelectorField').css({backgroundColor: c});
    }
    
    $('#clrSelector > div:last').append('<em>none</em>');
    
    // define events
    $('.resBand').click(bandClicked)
 });