//-----------------------------------------------------------------------------
// Pull in tinylog (nasty Hack)
//-----------------------------------------------------------------------------

var tinylog = {}

$(function() {
  var c = document.getElementById('chart');
  if (c)
    tinylog.log = Processing(c, function(p) {}).println
});

//-----------------------------------------------------------------------------
// Utility Functions
//-----------------------------------------------------------------------------

Util = {
  extractExponent: function(x) {
    return parseInt(x.toExponential().split("e")[1]);
  },
  niceNum: function(x, round) {
    var exp, // exponent of x
        f, // fractional part of x
        nf; // nice, rounded fraction
    
    // instead of floor(log10(x)) which doesn't work properly in javascript
    exp = Util.extractExponent(x);
    f = x / Math.pow(10, exp); // between 1 and 10
    
    if (round) {
      if (f < 1.5) nf = 1;
      else if (f < 3) nf = 2;
      else if (f < 7) nf = 5;
      else nf = 10;
    } else {
      if (f <= 1) nf = 1;
      else if (f <= 2) nf = 2;
      else if (f <= 5) nf = 5;
      else nf = 10;
    }
    return nf*Math.pow(10, exp);
  }
}

//-----------------------------------------------------------------------------
// Chart
//-----------------------------------------------------------------------------

var Chart = function Chart(element, options) {
  this.element = element;
  this.height = element.height();
  this.width = element.width();
  this.collection = options.collection;
  
  // TODO: use extracted groupKeys for identification if no identityKeys are provided
  this.identityKeys = options.plotOptions.identifyBy || [];
  this.groupKeys = options.plotOptions.groupBy || [];
  this.measures = [];
  this.margin = {top: 50, right: 50, bottom: 60, left: 80};
  var that = this;
  
  if (options.plotOptions.aggregate) {
    this.groupProperties = $.map(options.plotOptions.measures, function(k) {  return {property: k, aggregator: Aggregators.SUM}; });
    
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
}


Chart.prototype = {
  plotHeight: function() {
    return this.height-(this.margin.top+this.margin.bottom);
  },
  plotWidth: function() {
    return this.width-(this.margin.left+this.margin.right);
  },
  render: function() {
    var plotter = new Chart.Plotters.Scatter(this);
    plotter.plot();
  },
  // returns an items identity as a string based on this.identityKeys
  identify: function(item) {
    var that = this;
    return $.map(this.identityKeys, function(s) { return item.attributes[s] }).join(", ");
  }
}


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
  
  this.targetRange = undefined;
  // TODO: user set min/max
  
  // set min and max, tickInterval, scale etc.
  this.update();
}

Measure.prototype = {
  // getter/setter
  setTargetRange: function(range) {
    this.targetRange = range;
    this.setScale(); // update scale
  },
  update: function() {
    this.computeDataExtremes();
    // TODO: desiredTicks param shouldn't be static
    this.computeLooseTicks(this.dataMin, this.dataMax, 5);
    this.setScale();
  },
  // translates the given data value to the corresponding
  // value in the targetRange
  translate: function(value) {
    // CAUTION: not sure if -this.graphMin should go here
    return Math.round((value-this.graphMin)*this.scale);
  },
  // consider all items and find the min/max values
  computeDataExtremes: function() {
    var that = this;
    $.each(that.chart.collection.items, function(i, item) {
      that.dataMin = Math.min(that.dataMin, item.attributes[that.property.key]);
      that.dataMax = Math.max(that.dataMax, item.attributes[that.property.key]);
    }); 
  },
  computeLooseTicks: function(min, max, desiredNTicks) {
    var range;
        
    range = Util.niceNum(max-min, false);
    
    this.tickInterval = Util.niceNum(range / (desiredNTicks-1), true);
    this.graphMin = Math.floor(min / this.tickInterval)*this.tickInterval;
    this.graphMax = Math.ceil(max / this.tickInterval)*this.tickInterval;
    
    this.nFract = Math.max(-Util.extractExponent(this.tickInterval),0);
    
    this.nTicks = 0; // how many ticks do actually fit for the nice tickInterval
    for (var x = this.graphMin; x <= this.graphMax+0.5*this.tickInterval; x += this.tickInterval) {
      this.nTicks += 1;
    }
  },
  // Set the scale based on graphMin and graphMax
  setScale: function() {
    this.scale = this.targetRange / (this.graphMax-this.graphMin);
  },
  inspect: function() {
    return "Measure[property="+this.property.key+" ("+this.property.name+"), tickInterval="+this.tickInterval+", nTicks="+this.nTicks+", dataRange="+this.dataMin+".."+this.dataMax+", graphRange="+this.graphMin+".."+this.graphMax+", scale="+this.scale+"]"
  }
}


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