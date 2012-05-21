/**
 *	Plugin for accessing the NPR API via jquery 
 *	@author jgrosman
 *	
 *	@TODO Add images to full story
 *	@TODO Topic Listing using api.npr.org/list
 *	@TODO Byline styles
 *	@TODO Add HTML5 audio
*/

(function($){
	var NPRAPI = function(element, options) {
		
		var elem = 	$(element);
		var obj = this;

		// Defaults
		var settings = $.extend({
	           content : 'summary',
	           stylesheet : 'css/default.css' 
			}, options || {});
		
		// Public Methods
		
		/**
		 * Load a story into the HTML element
		 * 
		 * @arg options
		 */
		this.loadStory = function(options) {
			
			// allow the function call to update the 
			if ( options ) { 
				$.extend( settings, options );
			}

			
			if (!settings.apiKey) {
				alert('Required option (apiKey) not found');
				return;
			}
			
			if (!settings.nprId) {
				alert('Required option (nprId) not found');
				return;
			}
			
			// construct the url to the npr api
			var apiUrl = "http://api.npr.org/query?id=" + settings.nprId + "&output=json&apiKey=" + settings.apiKey + "&callback=?";
			
			// fetch the api result
			$.getJSON(apiUrl, null, function(data) {
    		 	if (data.list.story && data.list.story.length > 0) {
    		 		$.each(data.list.story, function (storyIndex, storyObj) {
    		 			
    		 			var storyElm = null;
    		 			if (storyIndex < elem.length) {
    		 				storyElm = $(elem[storyIndex]);
    		 			} else if (settings.cloneToFit) {
    		 				// if we run out of elements, keep creating elements until we run out of stories
    		 				
    		 				// clone the first element
    		 				var clonedElem = $(elem[0]).clone();
    		 				
    		 				// put it after the last element
    		 				storyElm = clonedElem.insertAfter($(elem[elem.length - 1]));
    		 			}	
    		 			
    		 			if (storyElm) {
	    		 			if (settings.content == 'summary') {
			 					var storyHtml = renderStorySummary(storyObj);
			 					renderIframe(storyHtml, storyElm);
			 				}
	    		 			else if (settings.content == 'title') {
	    		 				var storyHtml = renderStoryTitle(storyObj, 'span');
	    		 				storyElm.html(storyHtml);
	    		 			}
	    		 			else if (settings.content == 'full') {
	    		 				var storyHtml = renderStoryFull(storyObj);
			 					renderIframe(storyHtml, storyElm);
	    		 			}
    		 			}
    		 			
    		 		});
    		 	}
    		 	
    		 	if (settings.onload) {
    		 		settings.onload();
    		 	}
			});
		};
		
		/**
		 * Load the list of news topics into the HTML element
		 * 
		 * @arg options
		 */
		this.loadNewsTopics = function(options) {
			// allow the function call to update the settings
			if ( options ) { 
				$.extend( settings, options );
			}

			if (!settings.apiKey) {
				alert('Required option (apiKey) not found');
				return;
			}
			
			
			// construct the url to the npr api
			var apiUrl = "http://api.npr.org/list?id=3218&output=json&apiKey=" + settings.apiKey + "&callback=?";
			
			// fetch the api result
			$.getJSON(apiUrl, null, function(data) {
				if (data.subcategory && data.subcategory[0].item.length > 0) {
    		 		$.each(data.subcategory[0].item, function (itemIndex, itemObj) {
				
    		 			var itemElm = null;
    		 			if (itemIndex < elem.length) {
    		 				itemElm = $(elem[itemIndex]);
    		 			} else if (settings.cloneToFit) {
    		 				// if we run out of elements, keep creating elements until we run out of stories
    		 				
    		 				// clone the first element
    		 				var clonedElem = $(elem[0]).clone();
    		 				
    		 				// put it after the last element
    		 				itemElm = clonedElem.insertAfter($(elem[elem.length - 1]));
    		 			}	
    		 			
    		 			if (settings.callback) {
    		 				var aElm = $('<a></a>');
    		 				aElm.attr({href : '#'});
    		 				aElm.click(function(e) { 
    		 					e.preventDefault(e);
    		 					return settings.callback(itemObj.id);
    		 				});
    		 				aElm.html(itemObj.title.$text);
    		 				itemElm.html(aElm);
    		 			}
    		 			else {
    		 				itemElm.html(itemObj.title.$text);
    		 			}
    		 			
    		 		});
				}
				
				if (settings.onload) {
    		 		settings.onload();
    		 	}
			});
		
		};
		
		/**
		 * Load a transcript for a story into the element
		 * 
		 * @param options
		 */
		this.loadTranscript = function(options) {
			// allow the function call to update the settings
			if ( options ) { 
				$.extend( settings, options );
			}

			if (!settings.apiKey) {
				alert('Required option (apiKey) not found');
				return;
			}
			
			if (!settings.nprId) {
				alert('Required option (nprId) not found');
				return;
			}
			
			// construct the url to the npr api
			var apiUrl = "http://api.npr.org/transcript?id=" + settings.nprId + "&format=json&apiKey=" + settings.apiKey + "&callback=?";
			
			// fetch the api result
			$.getJSON(apiUrl, null, function(data) {
				if (data.paragraph) {
					var transcriptElm = renderTranscriptText(data);
					elem.html(transcriptElm);
				}
				else {
					
					elem.html("<p>No transcript available</p>");
				}
				
				if (settings.onload) {
    		 		settings.onload();
    		 	}
			});
			
		};
			
		// Private Methods
	
		/**
		 * Render the iframe. This allows the content to use a custom spreadsheet.
		 * 
		 * @param content
		 * @param elm
		 * 
		 * @todo Resizing of the iframe doesn't always work
		 */
		var renderIframe = function (content, elm) {
			
			var ret = $('<iframe></iframe>');
			ret.css({width : '100%', border : 'none', overflow : 'hidden'});
			elm.html(ret);
			
			setTimeout(function() {
				var elmIframeContents = ret.contents();
				var elmIframeHead = elmIframeContents.find('head');
				var elmIframeBody = elmIframeContents.find('body');
			
				$(elmIframeHead).append('<link rel="stylesheet" href="' + settings.stylesheet + '" type="text/css" />');
				$(elmIframeBody).html(content);
				
				var newHeight = elmIframeBody.get(0).scrollHeight;
				var newWidth = elmIframeBody.get(0).scrollWidth;
				
				
				ret.get(0).height = Math.floor(newHeight * 1.3) + "px";
				ret.get(0).width = (newWidth) + "px";
			}, 1);
			
			return ret;
		};
		
		
		/**
		 * Render the story summary into the element
		 * 
		 * @param storyObj
		 */
		var renderStorySummary = function(storyObj) {
			// create the starting div
			var ret = $('<div></div>');
			
			ret.addClass('nprStoryShort');
			if (storyObj.image || storyObj.promoArt) {
				ret.addClass('nprStoryImg138');
			}	
			
			ret.append(renderStorySlug(storyObj));
			ret.append(renderStoryTitle(storyObj, 'h4'));
			
			if (storyObj.image || storyObj.promoArt) {
				ret.append(renderStoryThumbnail(storyObj));
			}
			
			var contentDiv = $('<div></div>');
			contentDiv.addClass('nprStoryContent');
			contentDiv.append(renderStoryTeaser(storyObj));
			ret.append(contentDiv);
			
			return ret;
		};
		
		/**
		 * Render the full story
		 * 
		 * @param storyObj
		 * 
		 */
		var renderStoryFull = function(storyObj) {
			// create the starting div
			var ret = $('<div></div>');
			ret.addClass('nprStoryFull');
			
			var titleDiv = $('<div></div>');
			
			titleDiv.append(renderStoryTitle(storyObj, 'h1'));
			//titleDiv.append(renderStoryByline(storyObj));
			ret.append(titleDiv);
			
			var contentDiv = $('<div></div>');
			contentDiv.addClass('nprStoryContent');
			
			if (storyObj.fullText) {
				//contentDiv.append(renderStoryFullText(storyObj));
				contentDiv.append(storyObj.fullText.$text);
			}
			else {
				contentDiv.append(renderStoryTeaser(storyObj));
			}
			ret.append(contentDiv);
			
			return ret;
			
		};
		
		/**
		 * Render the story title
		 * 
		 * @param storyObj
		 * @param containerElm h1, h2, h3, h4, h5, h6, span
		 */
		var renderStoryTitle = function(storyObj, containerElm) {

			var storyUrl = getStoryUrl(storyObj);
			var storyTitle = storyObj.title.$text;
			var storyId = storyObj.id;

			// create the h4 tag
			var ret = $('<' + containerElm + '></' + containerElm + '>');
			ret.addClass('nprStoryTitle');
			
			// create the link
			var aElm = $('<a></a>');
			aElm.attr({href : storyUrl, target : '_BLANK'});
			aElm.html(storyTitle);
			
			if (settings.callback) {
				aElm.click(function(e) {
					e.preventDefault();
					return settings.callback(storyId);
				});
			}
			
			ret.append(aElm);
			
			return ret;
		};
		
		/**
		 * Render the story slug
		 * 
		 * @param storyObj
		 */
		var renderStorySlug = function(storyObj) {
			var storySlug = storyObj.slug.$text;
			
			var ret = $('<h3></h3>');
			ret.addClass('nprStorySlug');
			ret.html(storySlug);

			return ret;
		};
		
		/**
		 * Render the story thumbnail
		 * 
		 * @param storyObj
		 */
		var renderStoryThumbnail = function(storyObj) {
			var storyPrimaryImage = getStoryPrimaryImage(storyObj);
			var storyUrl = getStoryUrl(storyObj);
			var storyId = storyObj.id;
			
			
			
			var ret = $('<a></a>');
			ret.attr({href : storyUrl, target : '_BLANK'});
			ret.addClass('nprStoryThumbnailWrap');
			
			if (settings.callback) {
				ret.click(function(e) {
					e.preventDefault();
					return settings.callback(storyId);
				});
			}
			
			if (storyPrimaryImage) {
				var imgElm = $('<img />');
				imgElm.addClass('nprStoryThumbnail');
				imgElm.attr({src : storyPrimaryImage.src, width : 138});
				ret.append(imgElm);
			}
			
			return ret;
		};
		
		/**
		 * Render dateline
		 * 
		 * @param storyObj
		 */
		var renderStoryDateline = function(storyObj) {
			var storyDate = new Date(Date.parse(storyObj.storyDate.$text));
			
			var ret = $('<span></span>');
			ret.addClass('nprStoryDate');
			ret.html(formatDisplayDate(storyDate));
			
			return ret;
		};
		
		/**
		 * Render teaser paragraph
		 * 
		 * @param storyObj
		 */
		var renderStoryTeaser = function(storyObj) {
			var storyTeaser = storyObj.teaser.$text;
			
			var ret = $('<p></p>');
			ret.append(renderStoryDateline(storyObj));
			ret.append(' ' + storyTeaser);
			
			return ret;
		};
		
		/**
		 * Render all paragraphs of full text
		 * @param storyObj
		 * @returns
		 */
		var renderStoryFullText = function(storyObj) {
			var ret = $('<div></div>');
			
			$.each(storyObj.textWithHtml.paragraph, function(index, pgraph) {
				 var pElm = $('<p></p>');
				 if (index == 0) {
					 pElm.append(renderStoryDateline(storyObj));
					 pElm.append(" ");
				 };
				 pElm.append(pgraph.$text);
				 ret.append(pElm);
			  });

			return ret;
		};
		
		/**
		 * Render the byline
		 * 
		 * @param storyObj
		 */
		var renderStoryByline = function (storyObj) {
			var ret = $('<p></p>');
			ret.addClass('nprStoryByline');
			ret.html(getStoryBylines(storyObj));
			
			return ret;
		};
		
		/**
		 * Render the transcript text
		 * 
		 * @param transcriptObj
		 */
		var renderTranscriptText = function (transcriptObj) {

			// create the starting div
			var ret = $('<div></div>');
			ret.addClass('nprStoryFull');
			
			
			
			$.each(transcriptObj.paragraph, function(index, elm) {
				ret.append('<p>' +  elm.$text + '</p>');
				return true;
			  });
			
			return ret;
		};
		
		/**
		 * Get the url for this story
		 * 
		 * @param storyObj
		 */
		var getStoryUrl = function(storyObj) {
			 var link = null;
			  
			  $.each(storyObj.link, function(index, elm) {
				  if (elm.type == 'html') {
					  link = elm.$text;
					  return false;
				  }
				  
			  });

			  return link;
		};
		
		/**
		 * Get the primary image for this story
		 * 
		 * @param storyObj
		 */
		var getStoryPrimaryImage = function(storyObj) {
			var storyImage = null;
			if (storyObj.promoArt) {
				storyImage = storyObj.promoArt;
			}
			else if (storyObj.image) {
				$.each(storyObj.image, function(index, imageElm) {
					if (imageElm.type == 'primary') {
						storyImage = imageElm;
						return false;
					}
					return true;
				});
			}
			
			return storyImage;
		};
		
		/**
		 * Get the story bylines
		 * 
		 * @param storyObj
		 */
		var getStoryBylines = function(storyObj) {
			var bylineText = '';
			if (storyObj.byline) {
				$.each(storyObj.byline, function(index, byline) {
					if (index == 0) {
						bylineText += 'by ';
					}
					else {
						bylineText += ' and ';
					}
					bylineText += byline.name.$text;

				});
			}
			return bylineText;
		};
		
		/**
		 * Format the display date
		 */
		var formatDisplayDate = function(d) {
			 var monthToString = new Array("January", "February", "March", 
					  "April", "May", "June", "July", "August", "September", 
					  "October", "November", "December");
			
			return monthToString[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
		  };
		  
	};
	
	$.fn.npr = function(options) {
			var element = $(this);
			
			// Return early if this element already has a plugin instance
			if (element.data('NPRAPI')) {
				return element.data('NPRAPI');
			}

			// pass options to plugin constructor
			var myplugin = new NPRAPI(this, options);

			// Store plugin object in this element's data
			element.data('NPRAPI', myplugin);
			
			return myplugin;
		};
})(jQuery);


