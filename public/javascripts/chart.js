//-----------------------------------------------------------------------------
// Chart
//-----------------------------------------------------------------------------

var Chart = function Chart(element, options) {
  this.element = element;
  this.height = element.height();
  this.width = element.width();
  this.collection = options.collection;
  this.visualization = options.plotOptions.visualization;
  
  // TODO: use extracted groupKeys for identification if no identityKeys are provided
  this.identityKeys = options.plotOptions.identifyBy || [];
  this.groupKeys = options.plotOptions.groupBy || [];
  this.measures = [];
  this.margin = {top: 50, right: 50, bottom: 60, left: 80};
  var that = this;
  
  if (options.plotOptions.aggregated) {
    this.groupProperties = $.map(options.plotOptions.measures, function(k) {
      return {property: k, aggregator: Aggregators.SUM}; 
    });
    
    this.collection = this.collection.group({
      keys: this.groupKeys,
      properties: this.groupProperties
    });
  }
  // TODO: skip if there are no groupKeys provided
  this.groups = this.collection.getGroups(this.groupKeys);
  
  // init measures
  $.each(options.plotOptions.measures, function(i, propertyKey) {
    that.measures.push(new Measure(that, that.collection.properties[propertyKey], i));
  });
};

// The is where concrete visualizations have to register
Chart.visualizations = {};

Chart.prototype = {
  plotHeight: function() {
    return this.element.height()-(this.margin.top+this.margin.bottom);
  },
  plotWidth: function() {
    return this.element.width()-(this.margin.left+this.margin.right);
  },
  render: function() {
    var vis = Chart.visualizations[this.visualization].create(this);
    vis.render();
  },
  // returns an items identity as a string based on this.identityKeys
  identify: function(item) {
    var that = this;
    return $.map(this.identityKeys, function(s) { return item.attributes[s] }).join(", ");
  }
};

//-----------------------------------------------------------------------------
// Measure
//-----------------------------------------------------------------------------

// a measure is one dimension of the data item to be plotted.
var Measure = function(chart, property, index) {
  this.property = property;
  this.chart = chart;
  this.index = index;
  this.dataMin = Infinity;
  this.dataMax = -Infinity;
  
  // compute dataMin and dataMax
  this.computeDataExtremes();
};

Measure.prototype = {
  values: function() {
    var that = this;
    return $.map(that.chart.collection.items, function(i) {
      attributes[that.property.key]
    });
  },
  // returns the property key
  key: function() {
    return this.property.key;
  },
  min: function() {
    return this.dataMin;
  },
  max: function() {
    return this.dataMax;
  },
  // consider all items and find the min/max values
  computeDataExtremes: function() {
    var that = this;
    $.each(that.chart.collection.items, function(i, item) {
      that.dataMin = Math.min(that.dataMin, item.attributes[that.property.key]);
      that.dataMax = Math.max(that.dataMax, item.attributes[that.property.key]);
    }); 
  },
  inspect: function() {
    return "Measure[property="+this.property.key+" ("+this.property.name+")]"
  }
};

//-----------------------------------------------------------------------------
// The widget
//-----------------------------------------------------------------------------

$.widget("ui.chart", {
  // default options
  options: {
    
  },
  _create: function() {    
    // init chart object
    this.chart = new Chart(this.element, this.options);
    
    // render the chart
    this.chart.render();
  },
  destroy: function() {
    $.Widget.prototype.destroy.apply(this, arguments);
  }
});