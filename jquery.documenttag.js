(function($)
{
    var documentContainer;

    var settings = 
    {
        maskEnabled: true,
        maskColor: '#333',
        maskOpacity: '0.8'            
    };
    
    var maskElements = 
    {
        topMask: '',
        bottomMask: '',
        rightMask: '',
        leftMask: ''
    };
    
    var tags = [];

    var methods =
    {
        init: function( options )
        {
            if ( options )
            {
                $.extend( settings, options );
            }
            
            documentContainer = $("<div/>")
                .append( this.clone() );
                
            this.before( documentContainer );
            this.remove();
            
            if ( settings.maskEnabled )
            {
                var maskStyles = { position: 'absolute', overflow: 'hidden', 'background-color': settings.maskColor, opacity: settings.maskOpacity };
                maskElements.topMask = $("<div/>").css( maskStyles ).prependTo( documentContainer );
                maskElements.bottomMask = $("<div/>").css( maskStyles ).css("bottom", "0px").prependTo( documentContainer );
                maskElements.rightMask = $("<div/>").css( maskStyles ).prependTo( documentContainer );
                maskElements.leftMask = $("<div/>").css( maskStyles ).prependTo( documentContainer );

                maskElements.topMask.css("width", this.width());
                maskElements.bottomMask.css("width", this.width());                
            }
        },
        
        addTag: function()
        {
            addTag( this );
        }
    };

    function addTag( document )
    {      
        var tag = 
        {
            element: $("<div/>").addClass("tag").css({width: '100px', height: '100px'}),
            width: 100,
            height: 100,
            topOffset: 0,
            bottomOffset: 0,
            leftOffset: 0,
            rightOffset: 0
        };
        
        tag.element.draggable(
        {
            drag: function()
            {
                calculateTagDimensions( document, tag );
                drawMasks( document, tag );
            },
            
            stop: function()
            {
                calculateTagDimensions( document, tag );
                drawMasks( document, tag );
            }
        });
    
        tag.element.resizable(
        {
            containment: documentContainer,
            handles: "n, e, s, w, ne, se, sw, nw",
            autohide: true,
            maxWidth: document.width(),
            maxHeight: document.height(),
            resize: function()
            {
                calculateTagDimensions( document, tag );
                drawMasks( document, tag );
            },
            stop: function()
            {
                calculateTagDimensions( document, tag );
                drawMasks( document, tag );
            }                    
        });    
    
        tags.push( tag );
        documentContainer.prepend( tag.element );
        return tag;
    }
    
    function drawMasks( document, tag )
    {       
        maskElements.topMask.css("height", tag.topOffset + "px" );
        maskElements.bottomMask.css(
        {
            "height": tag.bottomOffset + "px",
            "top":  (document.offset().top + document.height()) - tag.bottomOffset
        });
        
        maskElements.leftMask.css(
        {
            height: tag.height,
            width: tag.leftOffset + "px",
            top: tag.topOffset + document.offset().top
        });
              
        maskElements.rightMask.css(
        {
            height: tag.height,
            width: tag.rightOffset + "px",
            top: tag.topOffset + document.offset().top,
            left: document.offset().left + tag.leftOffset + tag.width
        });
    }    
    
    function calculateTagDimensions( document, tag )
    {
        tag.width = tag.element.outerWidth();
        tag.height = tag.element.outerHeight();
    
        var tagOffset = tag.element.offset(),
            image = document,
            imageOffset = document.offset();
    
        tag.topOffset    = tagOffset.top - imageOffset.top;
        tag.leftOffset   = tagOffset.left - imageOffset.left;
        tag.rightOffset  = image.width() - ( tag.leftOffset + tag.width );
        tag.bottomOffset = image.height() - ( tag.topOffset + tag.height );
    
    
        $("#tWidth").html( tag.width );
        $("#tHeight").html( tag.height );                
           
        $("#tTop").html( tag.topOffset );
        $("#tLeft").html( tag.leftOffset );
        $("#tRight").html( tag.rightOffset );
        $("#tBottom").html( tag.bottomOffset );            
    }    
    
    $.fn.documentTag = function( method )
    {   
        if ( methods[method] )
        {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        }
        else if ( typeof method === 'object' || ! method )
        {
            return methods.init.apply( this, arguments );
        }
        else
        {
            $.error( 'Method ' + method + ' does not exist' );
        }
    };
})(jQuery);