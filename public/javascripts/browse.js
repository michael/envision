//-----------------------------------------------------------------------------
// Templates
// TODO: 
// Find a better place for templates — multiline string literals suck!
//-----------------------------------------------------------------------------

var Templates = {
  facets: ' \
  <a href="#" class="clear-filters">Clear filters</a><br/><br/> \
    {{#facets}} \
      <h3>{{property_name}}</h3> \
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
      <h4>measures</h4> \
      <select id="measure_keys" multiple="multiple" name="measure_keys[]" style="width: 180px; height: 100px"> \
        {{#properties}} \
          <option {{#measureKeySelected}}selected="selected"{{/measureKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
        {{/properties}} \
      </select> \
      <h4>identifiedBy</h4> \
      <select id="identity_keys" multiple="multiple" name="identity_keys[]" style="width: 180px; height: 100px"> \
        {{#properties}} \
          <option {{#identityKeySelected}}selected="selected"{{/identityKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
        {{/properties}} \
      </select> \
      <h4>groupBy</h4> \
      <select id="group_keys" multiple="multiple" name="group_keys[]" style="width: 180px; height: 100px"> \
        {{#properties}} \
          <option {{#groupKeySelected}}selected="selected"{{/groupKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
        {{/properties}} \
      </select> \
      Aggregieren <input id="aggregate" name="aggregate" type=checkbox value="1"/> \
    </div>'
};

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
  this.aggregate = false;
  
  this.id = options.id;
  this.collectionId = options.collectionId;
  var that = this;
  
  // init measures
  $.each(options.measures, function(index, property) {
    that.measureKeys.push(property);
  });
  
  
}

View.prototype = {
  update: function() {
    this.measureKeys = $('select#measure_keys').val() || [];
    this.identityKeys = $('select#identity_keys').val() || [];
    this.groupKeys = $('select#group_keys').val() || [];
    this.aggregate = $('input#aggregate').is(':checked');
    
    var that = this;
    this.renderChart();

    // store view changes on the server
    $.ajax({
      url: '/collections/'+this.collectionId+'/views/'+this.id+'.json',
      type: 'put',
      data: {
        measure_keys: that.measureKeys,
        identity_keys: that.identityKeys,
        group_keys: that.groupKeys
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
      }
    };

    // render results template
    $('#results').html($.mustache($.template('view'), v));
    
    $('#view-settings select').change(function() {
      that.update();
    });
    $('#view-settings input').change(function() {
      that.update();
    });

    that.renderChart();
  },
  renderChart: function() {
    // quick and dirty scatter plot
    // TODO: let the chart decide if it's able to render measures.length measures
    if (this.measureKeys.length >= 2) {
      $('#chart').chart('destroy');
      
      // prepare grouping options
      var groupKeys = $.map(this.groupKeys, function(k) { return {property: k, modifier: Modifiers.DEFAULT}; });
      
      $('#chart').chart({
          collection: this.collection,
          plotOptions: {
            plotType: 'scatter',
            groupBy: groupKeys, // list of groupkeys
            aggregate: this.aggregate,
            identifyBy: this.identityKeys, // salesman, customer name
            measures: this.measureKeys
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
            result.push({property: key, property_name: collection.properties[key].name, facet_choices: function() {
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