/*jslint white: true, browser: true, rhino: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true, indent: 2 */
/*global $, pv*/
"use strict";
/**
* @private Returns a prototype object suitable for extending the given class
* <tt>f</tt>. Rather than constructing a new instance of <tt>f</tt> to serve as
* the prototype (which unnecessarily runs the constructor on the created
* prototype object, potentially polluting it), an anonymous function is
* generated internally that shares the same prototype:
*
* <pre>function g() {}
* g.prototype = f.prototype;
* return new g();</pre>
*
* For more details, see Douglas Crockford's essay on prototypal inheritance.
*
* @param {function} f a constructor.
* @returns a suitable prototype object.
* @see Douglas Crockford's essay on <a
* href="http://javascript.crockford.com/prototypal.html">prototypal
* inheritance</a>.
*/

Object.extend = function (f) {
  function G() {}
  G.prototype = f.prototype || f;
  return new G();
};


Object.create = function (o) {
  function F() {}
  F.prototype = o;
  return new F();
};


// Usage:
// 
// ["a","b", "c"].eachItem(function(item, index) {
//   console.log(item);
// });
if (!Array.prototype.eachItem) {
  Array.prototype.eachItem = function (f, o) {
    var n = this.length || 0,
        i;
    for (i = 0; i < n; i += 1) {
      if (i in this) {
        f.call(o, this[i], i, this);
      }
    }
  };
}

Object.keys = function (obj) {
  var array = [],
      prop;
  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      array.push(prop);
    }
  }
  return array;
};//-----------------------------------------------------------------------------
// Modifiers
//-----------------------------------------------------------------------------

var Modifiers = {};

// The default modifier simply does nothing
Modifiers.DEFAULT = function (attribute) {
  return attribute;
};

Modifiers.MONTH = function (attribute) {
  return attribute.getMonth();
};

Modifiers.QUARTER = function (attribute) {
  return Math.floor(attribute.getMonth() / 3) + 1;
};

//-----------------------------------------------------------------------------
// Aggregators
//-----------------------------------------------------------------------------

var Aggregators = {};

Aggregators.SUM = function (key, items) {
  var result = 0;
  items.eachItem(function (item, i) {
    result += item.attributes[key];
  });
  return result;
};

Aggregators.MIN = function (key, items) {
  var result = Infinity;
  items.eachItem(function (item, i) {
    if (item.attributes[key] < result) {
      result = item.attributes[key];
    }
  });
  return result;
};

Aggregators.MAX = function (key, items) {
  var result = -Infinity;
  items.eachItem(function (item, i) {
    if (item.attributes[key] > result) {
      result = item.attributes[key];
    }
  });
  return result;
};

Aggregators.COUNT = function (key, items) {
  var result = 0;
  return items.length;
};//-----------------------------------------------------------------------------
// Item
//-----------------------------------------------------------------------------

var Item = function (chart, attributes) {
  this.attributes = attributes;
};

Item.prototype = {
  groupMembership: function (groupKeys) {
    var membership = [],
        that = this;
    
    groupKeys.eachItem(function (groupKey) {
      membership.push(groupKey.modifier(that.attributes[groupKey.property]));
    });
    return membership;
  }
};

//-----------------------------------------------------------------------------
// Item
//-----------------------------------------------------------------------------

var Item = function (chart, attributes) {
  this.attributes = attributes;
};

Item.prototype = {
  groupMembership: function (groupKeys) {
    var membership = [],
        that = this;
    
    groupKeys.eachItem(function (groupKey) {
      membership.push(groupKey.modifier(that.attributes[groupKey.property]));
    });
    return membership;
  }
};

//-----------------------------------------------------------------------------
// Property
//-----------------------------------------------------------------------------


var Property = function (chart, key, options) {
  // constructing 
  this.chart = chart;
  this.key = key;
  this.name = options.name;
  this.type = options.type;
};

//-----------------------------------------------------------------------------
// Collection
//-----------------------------------------------------------------------------

var Collection = function (options) {
  this.id = options.id;
  this.name = options.name;
  
  this.properties = {};
  this.items = [];
  var that = this;
  
  // init properties  
  $.each(options.properties, function (key, options) {
    that.properties[key] = new Property(that, key, options);
  });
  
  options.items.eachItem(function (item) {
    that.items.push(new Item(that, item));
  });
};

Collection.prototype = {
  // build groups based on groupKeys
  getGroups: function (groupKeys) {
    var that = this,
        groups = {},
        idx = 0; // the groupIndex
    
    this.items.eachItem(function (item) {
      var membership = item.groupMembership(groupKeys);
      groups[membership] = groups[membership] || { items: [], index: idx += 1 };
      groups[membership].items.push(item);      
    });    
    return groups;
  },
  aggregate: function (items, properties, groupKeys) {
    var aggregatedItem = {},
        that = this;
    
    // include group key attributes
    groupKeys.eachItem(function (gk) {
      aggregatedItem[gk.property] = items[0].attributes[gk.property];
    });
    
    properties.eachItem(function (p) {
      aggregatedItem[p.property] = p.aggregator(p.property, items);
    });
    return aggregatedItem;
  },
  // @param groupKeys
  //      example [{property: '1', modifier: Modifiers.DEFAULT}]
  //      TODO: allow groupkeys to just be an array of property keys
  // 
  // @param properties [Optional]
  //      example [{property: '5', aggregator: Aggregators.SUM}]
  group: function (options) {
    var groups = this.getGroups(options.keys),
        that = this,
        newProps = {},
        newItems = [];

    // property projection
    options.keys.eachItem(function (key) {
      newProps[key.property] = that.properties[key.property];
    });
    
    options.properties.eachItem(function (key) {
      newProps[key.property] = that.properties[key.property];
    });
    
    $.each(groups, function (k, group) {
      newItems.push(that.aggregate(group.items, options.properties, options.keys));
    });

    return new Collection({properties: newProps, items: newItems});
  }
};//-----------------------------------------------------------------------------
// Measure
//-----------------------------------------------------------------------------

// a measure is one dimension of the data item to be plotted.
var Measure = function (chart, property, index) {
  this.property = property;
  this.chart = chart;
  this.index = index;
  this.dataMin = Infinity;
  this.dataMax = -Infinity;
  
  // compute dataMin and dataMax
  this.computeDataExtremes();
};

Measure.prototype = {
  values: function () {
    var that = this;
    return that.chart.collection.items.map(function (i) {
      return i.attributes[that.property.key];
    });
  },
  key: function () {
    return this.property.key;
  },
  min: function () {
    return this.dataMin;
  },
  max: function () {
    return this.dataMax;
  },
  // consider all items and find the min/max values
  computeDataExtremes: function () {
    var that = this;
    
    that.chart.collection.items.eachItem(function (item) {
      that.dataMin = Math.min(that.dataMin, item.attributes[that.property.key]);
      that.dataMax = Math.max(that.dataMax, item.attributes[that.property.key]);
    });
  },
  inspect: function () {
    return "Measure[property=" + this.property.key + " (" + this.property.name + ")]";
  }
};//-----------------------------------------------------------------------------
// Chart
//-----------------------------------------------------------------------------

var Chart = function (element, options) {
  this.element = element;
  this.height = element.height();
  this.width = element.width();
  this.collection = options.collection;
  this.visualization = options.plotOptions.visualization;
  
  this.identityKeys = options.plotOptions.identifyBy;
  this.groupKeys = options.plotOptions.groupBy;
  
  this.measures = [];
  this.margin = {top: 50, right: 50, bottom: 60, left: 80};
  var that = this;
  
  if (options.plotOptions.aggregated && this.groupKeys.length > 0) {
    this.groupProperties = options.plotOptions.measures.map(function (k) {
      return { property: k, aggregator: Aggregators.SUM };
    });
    
    this.collection = this.collection.group({
      keys: this.groupKeys,
      properties: this.groupProperties
    });
    
    // set identityKeys to groupKey unless set
    if (this.identityKeys.length === 0) {
      this.identityKeys = $.map(this.groupKeys, function (ik) {
        return ik.property;
      });      
    }
  }
  
  // use first property key as default identity
  if (this.identityKeys.length === 0) {
    this.identityKeys.push(this.getFirstPropertyKey());
  }
  
  // TODO: skip if there are no groupKeys provided
  this.groups = this.collection.getGroups(this.groupKeys);
  
  // init measures
  options.plotOptions.measures.eachItem(function (propertyKey, index) {
    that.measures.push(new Measure(that, that.collection.properties[propertyKey], index));
  });
};



// The is where concrete visualizations have to register
Chart.visualizations = {};

Chart.prototype = {
  plotHeight: function () {
    return this.element.height() - (this.margin.top + this.margin.bottom);
  },
  plotWidth: function () {
    return this.element.width() - (this.margin.left + this.margin.right);
  },
  render: function () {
    var vis = Chart.visualizations[this.visualization].create(this);
    vis.render();
  },
  // returns an items identity as a string based on this.identityKeys
  identify: function (item) {
    var that = this,
        identityKeys = this.identityKeys;

    return $.map(identityKeys, function (s) {
      return item.attributes[s];
    }).join(", ");
  },
  getFirstPropertyKey: function () {
    var keys = [];
    $.each(this.collection.properties, function (key, val) {
      keys.push(key);
    });
    return keys[0];
  }
};// -------------------------------------------
// supports
// -------------------------------------------
// 1 quantitative measure
// -------------------------------------------
// measure#1: quantitative

var Barchart = function (chart) {
  var that = this;
  this.chart = chart;
};

// register
Chart.visualizations.barchart = {
  className: 'Barchart',
  create: function (chart) {
    return new Barchart(chart);
  }
};

Barchart.prototype = {
  render: function () {
    
    var w = this.chart.plotWidth(),         
        h = this.chart.plotHeight(),    
        yAxis = this.chart.measures[0],
        that = this,
        data = this.chart.collection.items,
        y = pv.Scale.linear(yAxis.min(), yAxis.max()).nice().range(0, w),
        vis;

    vis = new pv.Panel()
      .left(this.chart.margin.left)
      .right(this.chart.margin.right)
      .top(this.chart.margin.top)
      .bottom(this.chart.margin.bottom)
      .width(4000)
      .height(h)
      .canvas('chart');
      
    // yAxis
    vis.add(pv.Rule)
        .data(y.ticks())
        .strokeStyle("#eee")
        .lineWidth(1)
        .bottom(function (d) {
          return parseInt(y(d), 10) + 0.5;
        })
      .anchor("left").add(pv.Label)
        .font('12px Century Gothic');
    
    vis.add(pv.Panel)
        .data(data)
        .left(function () {
          return this.index * 15; 
        })
      .add(pv.Panel) // group bar and label for redraw
        .def("active", false)
      .add(pv.Bar)
        .bottom(0)
        .width(10)
        .height(function (d) {
          return y(d.attributes[yAxis.key()]);
        })
        .fillStyle(function () {
          return this.parent.active() ? "orange" : "steelblue";
        }) 
        .event("mouseover", function () {
          return this.parent.active(true);
        })
        .event("mouseout", function () {
          return this.parent.active(false); 
        })
      .anchor("top").add(pv.Label)
        .bottom(20)
        .text(function (d) {
          return that.chart.identify(d);
        })
        .font('12px Century Gothic')
        .visible(function () {
          return this.parent.active();
        });
    vis.render();
  }
};

// -------------------------------------------
// supports
// -------------------------------------------
// 2..3 measures
// -------------------------------------------
// measure#1: quantitative
// measure#2: quantitative
// measure#3: quantitative | ordinal (in future)

// 3 quantitative measures (3rd dimensions is encoded as dot size)

// register

Chart.visualizations['scatterplot'] = {
  className: 'Scatterplot',
  create: function(chart) {
    return new Scatterplot(chart);
  }
};

var Scatterplot = function(chart) {
  var that = this;
  this.chart = chart;
};

Scatterplot.prototype.render = function() {
    
  var w = this.chart.plotWidth()-15,
      h = this.chart.plotHeight()-5,
      that = this;
  
  var xAxis = this.chart.measures[0];
  var yAxis = this.chart.measures[1];
  
  if (!xAxis || !yAxis || xAxis.property.type != "number" || yAxis.property.type != "number")
    return
  
  var data = this.chart.collection.items,
      x = pv.Scale.linear(xAxis.min(), xAxis.max()).range(0, w),
      y = pv.Scale.linear(yAxis.min(), yAxis.max()).range(0, h),
      c = pv.Scale.linear(4, 40).range("#1f77b4", "#ff7f0e");
  
  var vis = new pv.Panel()
      .width(w)
      .height(h)
      .left(this.chart.margin.left)
      .right(this.chart.margin.right)
      .top(this.chart.margin.top)
      .bottom(this.chart.margin.bottom)
      .canvas('chart');
  
  // xAxis
  vis.add(pv.Rule)
      .data(x.ticks())
      .strokeStyle("#eee")
      .left(function(d) { return parseInt(x(d))+0.5})
    .anchor("bottom").add(pv.Label)
      .font('12px Century Gothic');
  
  // yAxis
  vis.add(pv.Rule)
      .data(y.ticks())
      .strokeStyle("#eee")
      .lineWidth(1)
      .bottom(function(d) { return parseInt(y(d))+0.5})
    .anchor("left").add(pv.Label)
      .font('12px Century Gothic');
  
  // dots
  vis.add(pv.Panel)
    .data(data)
    .add(pv.Panel) // group dot and label for redraw
      .def("active", false)
    .add(pv.Dot)
      //.shape('square')
      .left(function(d) { return x(d.attributes[xAxis.key()]); })
      .bottom(function(d) { return y(d.attributes[yAxis.key()]); })
      .fillStyle(function() { return this.parent.active() ? "rgba(30, 120, 180, .9)" : "rgba(30, 120, 180, 0.4)"; })
          .event("mouseover", function() { return this.parent.active(true); })
          .event("mouseout", function() { return this.parent.active(false); })
    .anchor("right").add(pv.Label)
      .text(function(d) { return that.chart.identify(d); })
      .strokeStyle("green")
      .visible(function() { return this.parent.active(); });
  vis.render();

};// register
Chart.visualizations['table'] = {
  className: 'Table',
  create: function(chart) {
    return new Table(chart);
  }
};

var Table = function(chart) {
  var that = this;
  this.chart = chart;
};

Table.prototype = {
  render: function() {
    
    str = '<table><thead><tr>';
    
    $.each(this.chart.collection.properties, function(key, p) {
      str += '<th>'+p.name+'</th>';
    });
    
    str += '</tr></thead><tbody>';
    
    $.each(this.chart.collection.items, function(i, item) {
      str += '<tr>';
      
      $.each(item.attributes, function(key, a) {
        str += '<td>'+a+'</td>';
      });
      
      str += '</tr>';
    });
    
    str += '</tbody></table>';
    
    $('#chart').html(str);
  }
};//-----------------------------------------------------------------------------
// Templates
// TODO: 
// Find a better place for templates — multiline string literals suck!
//-----------------------------------------------------------------------------

var Templates = {
  facets: ' \
    {{#facets}} \
      <div class="facet" id="facet_{{property}}"> \
        <h3><a href="#">{{property_name}}</a></h3> \
        <ul class="facet-choices"> \
          {{#facet_choices}} \
            <li><a class="facet-choice" href="{{property}}">{{value}}</a><span class="item-count">({{item_count}})</span></li> \
            {{/facet_choices}} \
        </ul> \
      </div> \
    {{/facets}}',
  items: ' \
    {{#items}} \
      aa{{.}} \
    {{/items}}',
  view: ' \
    <div id="chart">test</div> \
    <div id="view-settings"> \
      <div id="measures"> \
        <h3>Measures</h3> \
        <select id="measure_keys" multiple="multiple" name="measure_keys[]"> \
          {{#properties}} \
            <option {{#measureKeySelected}}selected="selected"{{/measureKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
          {{/properties}} \
        </select> \
      </div> \
      <div id="grouping"> \
        <h3>Group By</h3> \
        <select id="group_keys" multiple="multiple" name="group_keys[]"> \
          {{#properties}} \
            <option {{#groupKeySelected}}selected="selected"{{/groupKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
          {{/properties}} \
        </select> \
        Aggregate (SUM) <input id="aggregated" name="aggregated" type=checkbox value="1"/> \
      </div> \
      <div id="visualizations"> \
        <h3>Visualisierung</h3> \
        <select id="visualization" name="visualization"> \
          {{#visualizations}} \
            <option {{#selected}}selected="selected"{{/selected}} value="{{code}}">{{className}}</option> \
          {{/visualizations}} \
        </select> \
      </div> \
      <div id="identification"> \
        <h3>Identify By</h3> \
        <select id="identity_keys" multiple="multiple" name="identity_keys[]"> \
          {{#properties}} \
            <option {{#identityKeySelected}}selected="selected"{{/identityKeySelected}} value="{{key}}">{{name}} ({{type}})</option> \
          {{/properties}} \
        </select> \
      </div> \
    </div>'
};//-----------------------------------------------------------------------------
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

    // prepare grouping options
    var groupKeys = $.map(this.groupKeys, function(k) { return { property: k, modifier: Modifiers.DEFAULT}; });

    $('#chart').empty();
    
    var chart = new Chart($('#chart'), {
      collection: this.collection,
      plotOptions: {
        visualization: this.visualization,
        groupBy: groupKeys,
        aggregated: this.aggregated,
        identifyBy: this.identityKeys,
        measures: this.measureKeys
      }
    });
    
    chart.render();
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