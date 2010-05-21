//-----------------------------------------------------------------------------
// FilterCriteria
//-----------------------------------------------------------------------------

var FilterCriteria = function() {
  this.filterCriteria = {};
};

FilterCriteria.prototype = {
  addCriterion: function(key, value) {
    this.filterCriteria[key] = [value];
  },
  clear: function() {
    this.filterCriteria = {};
  },
  removeCriterion: function(key, value) {
    delete this.filterCriteria[key];
  },
  getCriteria: function() {
    return this.filterCriteria;
  }
};

var filters = new FilterCriteria();

//-----------------------------------------------------------------------------
// View
// Reflects settings needed for drawing a chart
// Renders the view to the result pane
//-----------------------------------------------------------------------------

var View = function(collection, options) {
  this.collection = collection;
  
  this.measureKeys = [];
  this.identityKeys = options.identity_keys || [];
  this.groupKeys = options.group_keys || [];
  this.aggregated = false;
  
  // TODO: use table as the standard visualization
  this.visualization = options.visualization || 'scatterplot';
  
  this.id = options.id;
  this.collectionId = options['collection_id'];
  var that = this;
  
  // init measures
  $.each(options.measures, function(index, property) {
    that.measureKeys.push(property);
  });
};

View.prototype = {
  transformMultiselect: function(element) {
    element.hide(); // hide but keep the logic
    
    var selectedList = $('<ul class="selected"></ul>');
    element.after(selectedList);
    var availableList = $('<ul class="available"></ul>');
    selectedList.after(availableList);
    
    // populate lists
    var options = element.find('option');    
    options.each(function() {
      var li = $('<li><a href="#">'+$(this).text()+'</a><span></span></li>');
      var selected = $(this).attr('selected');
      
      li.data('option', this);
      li.children('a').click(function() {
        var option = $($(this).parent().data('option'));
        // flip selected option
        option.attr('selected', !option.attr('selected'));
        option.parent().trigger('change');
        $(this).parent().appendTo(option.attr('selected') ? selectedList : availableList);
      });
      li.appendTo(selected ? selectedList : availableList);
    });
  },
  updateCanvasSize: function() {
    $('#chart').width($('#results').width()-$('#view-settings').width()-30);
    $('#chart').height($('#results').height()-20);
  },
  update: function() {
    this.measureKeys = $('select#measure_keys').val() || [];
    this.identityKeys = $('select#identity_keys').val() || [];
    this.groupKeys = $('select#group_keys').val() || [];
    this.aggregated = $('input#aggregated').is(':checked');
    this.visualization = $('select#visualization').val();
    
    var that = this;
    this.renderChart();

    // store view changes on the server
    $.ajax({
      url: '/collections/'+this.collectionId+'/views/'+this.id+'.json',
      type: 'put',
      data: {
        measure_keys: that.measureKeys,
        identity_keys: that.identityKeys,
        group_keys: that.groupKeys,
        aggregated: that.aggregated,
        visualization: that.visualization
      },
      success: function(json) {
        console.log("view settings updated");
      }
    });
  },
  render: function() {
    var that = this;
    
    var v = {
      properties: function() {
        var result = [];
        
        $.each(that.collection.properties, function(key, p) {
          result.push({
            key: key,
            name: p.name,
            type: p.type,
            measureKeySelected: $.inArray(key, that.measureKeys) > -1,
            identityKeySelected: $.inArray(key, that.identityKeys) > -1,
            groupKeySelected: $.inArray(key, that.groupKeys) > -1
          });
        });
        return result;
      },
      visualization: that.visualization,
      visualizations: function() {
        var result = [];
        $.each(Chart.visualizations, function(key, vis) {
          result.push({
            code: key,
            className: vis.className,
            selected: key === that.visualization,
          });
        });
        return result;
      }
    };

    // render results template
    $('#results').html($.mustache($.template('view'), v));
    
    // update canvas dimensions
    this.updateCanvasSize();
    
    // transform multiselect boxes
    this.transformMultiselect($('#measure_keys'));
    this.transformMultiselect($('#group_keys'));
    this.transformMultiselect($('#identity_keys'));
    
    // highlight the view
    $('#available-views li').removeClass('selected');
    $('#view_'+this.id).addClass('selected');
    
    $('#view-settings select').change(function() {
      that.update();
    });
    $('#view-settings input').change(function() {
      that.update();
    });

    that.renderChart();
  },
  renderChart: function() {
    
    $('#chart').chart('destroy');
    // prepare grouping options
    var groupKeys = $.map(this.groupKeys, function(k) { return { property: k, modifier: Modifiers.DEFAULT}; });
    $('#chart').chart({
        collection: this.collection,
        plotOptions: {
          visualization: this.visualization,
          groupBy: groupKeys,
          aggregated: this.aggregated,
          identifyBy: this.identityKeys,
          measures: this.measureKeys
        }
    });
  }
};

//-----------------------------------------------------------------------------
// Mustache stuff
//-----------------------------------------------------------------------------

;(function($) {
  $.mustache = function(template, view, partials) {
    return Mustache.to_html(template, view, partials);
  };
  
  $.template = function(template) {
    return Templates[template];
  };
  $.view = function(view) {
    return Views[view];
  };
})(jQuery);

//-----------------------------------------------------------------------------
// Facets
// holds the current facet state (selected facet choices) -> FilterCriteria
//-----------------------------------------------------------------------------

var Facets = function(options) {
  this.selectedFacet = null;
  this.collection = options.collection;
  this.facets = options.facets;
};

Facets.prototype = {
  select: function(element) {
    $('.facet').removeClass('selected');
    element.toggleClass('selected');
    this.updatePanelHeight();
  },
  updatePanelHeight: function() {
    var facetHeaders = $('.facet h3'),
        selectedFacet = $('.facet.selected'),
        facetChoices = selectedFacet.children('ul'),
        maxHeight = $('#facets').height()-facetHeaders.height()*(facetHeaders.length)-facetHeaders.length*6;
    
    if (selectedFacet.height()>maxHeight) {
      facetChoices.height(maxHeight);
    }
  },
  // renders the current facet state
  render: function() {
    var that = this;
    
    var facetView = {
      facets: function() {
        result = []
        $.each(that.facets, function(key, choices) {
          result.push({property: key, property_name: that.collection.properties[key].name, facet_choices: function() {
            return $.map(choices, function(fc) { return {value: fc.value, item_count: fc.item_count} });
          }});
        });
        return result;
      }
    };
    
    var facets_html = $.mustache($.template('facets'), facetView);
    $('#facets').html(facets_html);
    this.select($(".facet:first"));
    
    this.attachEvents();
  },
  attachEvents: function() {
    var that = this;
    
    // switch active facet
    $('.facet h3 a').click(function() {
      that.select($(this).parent().parent());
    });
    
    // select facet choice
    $('a.facet-choice').click(function() {      
      filters.addCriterion($(this).attr('href'), $(this).text());
      console.log('TODO: implement');
      return false;
    });
  }
};

//-----------------------------------------------------------------------------
// BrowsingSession
// This is where everything begins
//-----------------------------------------------------------------------------

var BrowsingSession = function(options) {
  this.collection = new Collection(options);
  this.view = new View(this.collection, options['default_view']);
  this.facets = new Facets({facets: options.facets, collection: this.collection});

  var that = this;
  
  // update layout on resize
  $(window).resize(function(){
    that.facets.updatePanelHeight();
  });
  
  this.render();
};

BrowsingSession.prototype = {
  render: function() {
    this.view.render();
    this.facets.render();
    this.registerEvents();
  },
  registerEvents: function() {
    var that = this;
    $('li.view a').click(function() {
      $.ajax({
        url: $(this).attr('href'),
        dataType: 'json',
        success: function(viewOptions) {
          view = new View(that.collection, viewOptions);
          view.render();
        }
      });
      return false;
    });
  }
};


$(function() {
  // fire up the browser by creating a new browsing session
  
  var collectionId = $('#collection_id').text();
  $.ajax({
    url: '/collections/'+collectionId+'.json',
    dataType: 'json',
    success: function(json) {
      var bs = new BrowsingSession(json)
    }
  });
});