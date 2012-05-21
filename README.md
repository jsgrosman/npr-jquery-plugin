jQuery NPR API plugin
======================

A jQuery plugin to retrieve NPR stories from the NPR API, and display them as HTML modules on a webpage. 

When using "summary" or "full", the plugin creates an iframe to render the stories, and includes a custom stylesheet.

Maintainer
---------------------------

* Jason Grosman - Creator. ([jsgrosman](http://github.com/jsgrosman))

Methods
---------------------------

* loadStory
    
    Display a single story or the most recent stories from an aggregation.

* loadNewsTopics
    
    Display a list of active NPR News Topics.

* loadTranscript
    
    Display the transcript for a single story.
    
Options
---------------------------

* apiKey
    
    You can request a free api key from api.npr.org.
    
* nprId
    
    The story or aggregation id to load.
    
* content
    
    How the returned results should be displayed.
    
    * title
    
        Just display the title of the story or aggregation.
    
    * summary
    
        Display the title and short summary. A thumbnail image will be included, if available.
    
    * full
    
        Include full text and assets, if available. Otherwise, just show the summary view.

* stylesheet
    
    What css stylesheet to use for "summary" and "full" display results. Default: css/default.css
    
* cloneToFit
    
    If we run out of elements, keep creating elements until we run out of stories.

* onload
    
    Event handler for after the content is rendered.
    
* callback(id)
    
    Event handler for clicking on the title of a story.                             



    
    