//-----------------------------------------------------------------------------
// Templates
// TODO: 
// Find a better place for templates — multiline string literals suck!
//-----------------------------------------------------------------------------

var Templates = {
  facets: ' \
  <a href="#" class="clear-filters">Clear filters</a><br/><br/> \
    {{#facets}} \
      <h3>{{property}}</h3> \
      <ul> \
        {{#facet_choices}} \
          <li><a class="facet-choice" href="{{property}}">{{value}}</a> ({{item_count}})</li> \
        {{/facet_choices}} \
      </ul> \
    {{/facets}}',
  items: ' \
    {{#items}} \
      aa{{.}} \
    {{/items}}',
  view: ' \
    <canvas id="chart"></canvas> \
    <div id="view-settings"> \
      measures: \
      <select id="measures" multiple="multiple" name="measures[]"> \
        {{#properties}} \
          <option {{#selected}}selected="selected"{{/selected}} value="{{key}}">{{name}}</option> \
        {{/properties}} \
      </select> \
    </div>'
}


//-----------------------------------------------------------------------------
// FilterCriteria
//-----------------------------------------------------------------------------

var FilterCriteria = function() {
  this.filterCriteria = {};
}

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
}

var filters = new FilterCriteria();


//-----------------------------------------------------------------------------
// View
// Reflects settings needed for drawing a chart
// Renders the view to the result pane
//-----------------------------------------------------------------------------

var View = function(collection, options) {
  this.collection = collection;
  this.measures = [];
  this.id = options.id;
  this.collectionId = options.collectionId;
  var that = this;
  
  // init measures
  $.each(options.measures, function(index, property) {
    that.measures.push(property);
  });
}

View.prototype = {
  update: function() {
    this.measures = $('select#measures').val() || [];
    var that = this;
    
    this.renderChart();
    
    // store view changes on the server
    $.ajax({
      url: '/collections/'+this.collectionId+'/views/'+this.id+'.json',
      type: 'put',
      data: { measures: that.measures },
      success: function(json) {
        console.log("measures updated");
      }
    });
  },
  render: function() {
    var that = this;
    
    var v = {
      properties: function() {
        var result = [];
        
        $.each(that.collection.properties, function(key, p) {
          if (p.type === "number") {
            
            result.push({key: key, name: p.name, selected: $.inArray(key, that.measures) > -1});
          }
        });
        return result;
      }
    };

    $('#results').html($.mustache($.template('view'), v));
    $('select#measures').change(function() {
      that.update();
    });
    
    that.renderChart();
  },
  renderChart: function() {
    // quick and dirty scatter plot
    // let the chart decide if it's able to render measures.length measures
    if (this.measures.length >= 2) {
      $('#chart').chart('destroy');
      $('#chart').chart({
          collection: this.collection,
          plotOptions: {
            plotType: 'scatter',
            categorizeBy: 'gender',
            identifyBy: 'name',
            measures: this.measures
          }
      });
    }
  }
}

//-----------------------------------------------------------------------------
// Mustache stuff
//-----------------------------------------------------------------------------

;(function($) {
  $.mustache = function(template, view, partials) {
      return Mustache.to_html(template, view, partials);
  };
  $.template = function(template) {
    return Templates[template];
  },
  $.view = function(view) {
    return Views[view];
  }
})(jQuery);


//-----------------------------------------------------------------------------
// Client
// TODO: reorganize the mess
//-----------------------------------------------------------------------------

var Client = {
  updateCollection: function(json) {
    var collection = new Collection(json);
    var facets = json.facets;
    var view = null;
    
    var Views = {
      items: {
        items: function() {
        }
      },
      facets: {
        facets: function() {
          result = []
          $.each(facets, function(key, choices) {
            result.push({property: key, facet_choices: function() {
              return $.map(choices, function(fc) { return {value: fc.value, item_count: fc.item_count} });
            }});
          });
          return result;
        }
      }
    }
    
    var facets_html = $.mustache($.template('facets'), Views['facets']);
    
    // update html
    $('#facets').html(facets_html);
    
    // attach events
    $('a.facet-choice').click(function() {      
      filters.addCriterion($(this).attr('href'), $(this).text());
      $.ajax({
        url: '/collections/1/update_filters.json',
        type: 'put',
        data: {criteria: filters.getCriteria()},
        success: function(json) {
          Client.updateCollection(json);
        }
      });
      
      return false;
    });
    
    // views
    $('a.view').click(function() {
      
      $.ajax({
        url: $(this).attr('href'),
        dataType: 'json',
        success: function(viewOptions) {
          view = new View(collection, viewOptions);
          view.render();
        }
      });
      
      return false;
    });
    
    // attach events
    $('a.clear-filters').click(function() {      
      filters.clear();
      $.ajax({
        url: '/collections/1/update_filters.json',
        type: 'put',
        data: {criteria: filters.getCriteria()},
        success: function(json) {
          Client.updateCollection(json);
        }
      });
      
      return false;
    });
  }
}

$(function() {
  $.ajax({
    url: '/collections/1.json',
    dataType: 'json',
    success: function(json) {
      Client.updateCollection(json);
    }
  });
});