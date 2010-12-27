(function($)
{
    var documentContainer;

    var settings = 
    {
        maskEnabled: true,
        maskColor: '#333',
        maskOpacity: '0.8',

        onTagSelect: undefined,
        onTagUnselect: undefined,
        onTagAdd: undefined
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

                $.each( maskElements, function()
                {
                    this.click(function()
                    {
                        hideMasks();
                    });
                });
            }
        },
        
        addTag: function( tag )
        {
            hideMasks();
            addTag( this, tag );
        },
        
        getTags: function()
        {
            return tags;
        },
        
        deleteTag: function( tag )
        {
            var index;
            $.each( tags, function( i )
            {
                if ( this == tag )
                {
                    index = i;
                    return true;
                }
            });
               
            if ( index != undefined )
            {
                tag.element.remove();
                hideMasks();
                tags.splice( index, 1 );
            }
        },
        
        hideTagNames: function()
        {
            $.each( tags, function()
            {
                this.element.children(".tagName").hide();
            });
        },
        
        showTagNames: function()
        {
            $.each( tags, function()
            {
                this.element.children(".tagName").show();
            });
        }
    };
    
    function addTag( document, tag )
    {   
        if ( ! tag )
        {
            tag = 
            {
                element: $("<div/>"),
                attributes: 
                {
                    name: "Tag #" + (tags.length + 1)
                },
                width: 100,
                height: 100,
                topOffset: $(window).scrollTop() + document.offset().top,
                bottomOffset: 0,
                leftOffset: $(window).scrollLeft() + document.offset().left,
                rightOffset: 0,
                
                relativeWidth: 0,
                relativeHeight: 0,
                topRelativeOffset: 0,
                bottomRelativeOffset: 0,
                leftRelativeOffset: 0,
                rightRelativeOffset: 0
            };        
        }
        // provided tag, set non-relative widths appropriately
        else
        {
            tag.width = document.width() * tag.relativeWidth;
            tag.height = document.height() * tag.relativeHeight;
            
            tag.topOffset = ( document.height() * tag.relativeTopOffset ) + document.offset().top;
            tag.leftOffset = ( document.width() * tag.relativeLeftOffset ) + document.offset().left;
        }
        
        if ( ! tag.element )
        {
            tag.element = $("<div/>");
        }
         
        tag.element
            .addClass("tag")
            .css({
                width: tag.width + 'px', 
                height: tag.height + 'px',
                top: tag.topOffset + 'px',
                left: tag.leftOffset + 'px'
            })
            .click( function()
            {
                calculateTagDimensions( document, tag );
                drawMasks( document, tag );
                if ( settings.onTagSelect )
                {
                    settings.onTagSelect( tag );
                }
            });        
        
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
                $(this).children(".tagName").css("top", tag.element.height() + "px");
            },
            stop: function()
            {
                calculateTagDimensions( document, tag );
                drawMasks( document, tag );
                $(this).children(".tagName").css("top", tag.element.height() + "px");
            }                    
        });    
    
        var tagName = $("<div/>")
            .addClass("tagName")
            .html( tag.attributes.name )
            .appendTo(tag.element)
            .css({
                position: 'absolute',
                top: tag.element.height() + 'px'
            });    
    
        tags.push( tag );       
        documentContainer.prepend( tag.element );
        
        if ( settings.onTagAdd )
        {
            settings.onTagAdd( tag );
        }
        
        calculateTagDimensions( document, tag );
        return tag;
    }
    
    function hideMasks()
    {
        if ( settings.onTagUnselect )
        {
            settings.onTagUnselect();
        }
                        
        $.each( maskElements, function()
        {
            this.hide();
        });
    }
    
    function drawMasks( document, tag )
    {       
        $.each( maskElements, function()
        {
            this.show();
        });    
    
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
    
        tag.relativeWidth = tag.width / document.width();
        tag.relativeHeight = tag.height / document.height();
        
        tag.topRelativeOffset = tag.topOffset / document.height();
        tag.bottomRelativeOffset = tag.bottomOffset / document.height();
        tag.leftRelativeOffset = tag.leftOffset / document.width();
        tag.rightRelativeOffset = tag.rightOffset / document.width();
    
        $("#tWidth").html( tag.width );
        $("#tHeight").html( tag.height );
           
        $("#tTop").html( tag.topOffset );
        $("#tLeft").html( tag.leftOffset );
        $("#tRight").html( tag.rightOffset );
        $("#tBottom").html( tag.bottomOffset );
        
        $("#trWidth").html( tag.relativeWidth );
        $("#trHeight").html( tag.relativeHeight );
        
        $("#trTop").html( tag.topRelativeOffset );
        $("#trLeft").html( tag.leftRelativeOffset );
        $("#trRight").html( tag.rightRelativeOffset );
        $("#trBottom").html( tag.bottomRelativeOffset );
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