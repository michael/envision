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
    {{/items}}'
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
    
    // quick and dirty scatter plot
    // TODO: un-hardcode measures!
    $('#chart').chart('destroy');
    $('#chart').chart({
        collection: collection,
        plotOptions: {
          plotType: 'scatter',
          categorize_by: 'gender',
          identify_by: 'name',
          measures: ['2', '7']
        }
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