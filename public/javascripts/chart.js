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
// Plotters
//-----------------------------------------------------------------------------

var ScatterPlotter = {
  // this refers to the chart
  plot: function(p) {
    
    p.background(255);
    p.smooth();
    
    // center the plotarea
    p.translate(this.margin.left, this.margin.top);
    
    // color for the plot area
    p.fill(244);
    p.rect(0,0,this.plotWidth(), this.plotHeight());
    
    var font = p.loadFont("Century Gothic"); 
    p.textFont(font, 12); 
    
    // measure #1 is my xAxis
    var xAxis = this.measures[0];
    xAxis.setTargetRange(this.plotWidth());
    
    // measure #2 is my yAxis
    var yAxis = this.measures[1];
    yAxis.setTargetRange(this.plotHeight());
    
    // everything alright?
    $.each(this.measures, function(i, measure) {
      // tinylog.log(measure.inspect());
    });

    // draw xAxis
    for(var i = 0; i < xAxis.nTicks; i++) {
      p.fill(66);
      var x = xAxis.translate(i*xAxis.tickInterval+xAxis.graphMin);
      x += 0.5; // needs to be shifted for some reason (probably caused by the PJS patch)
      
      // TODO: only show nFrac fractional digits
      p.text(xAxis.graphMin+i*xAxis.tickInterval, x-10, this.plotHeight()+20);
      
      p.stroke(180);
      p.strokeWeight(1);
      p.line(x, 0, x, this.plotHeight());
      p.strokeWeight(0);
    }
    
    // draw yAxis
    for(var i = 0; i<yAxis.nTicks; i++) {
      p.fill(66);
      var y = this.plotHeight()-yAxis.translate(i*yAxis.tickInterval+yAxis.graphMin);
      y += 0.5; // needs to be shifted for some reason (probably caused by the PJS patch)
  
      // TODO: only show nFrac fractional digits
      p.text(yAxis.graphMin+i*yAxis.tickInterval, -40, y);
      
      p.stroke(180);
      p.strokeWeight(1);
      p.line(0, y, this.plotWidth(), y);
      p.strokeWeight(0);
    }
    
    // plot some dots
    // var color = p.color.apply(p,Chart.COLORS[this.index])
    var that = this;
    p.fill(44);
    
    $.each(this.collection.items, function(i, item) {
      var x = xAxis.translate(item.attributes[xAxis.property.key]);
      var y = that.plotHeight()-yAxis.translate(item.attributes[yAxis.property.key]);
      p.ellipse(x, y, 7, 7);
    });
    
    p.exit();
  },
  // this refers to the measure object
  plotItem: function(p) {
    
  },
  // this refers to the measure object
  plotMeasure: function(p) {
    
  }
}

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

  this.measures = [];
  this.margin = {top: 50, right: 50, bottom: 60, left: 80};
  
  var that = this;
  
  // init measures
  $.each(options.plotOptions.measures, function(index, propertyKey) {
    that.measures.push(new Measure(that, that.collection.properties[propertyKey]));
  });
}


Chart.COLORS = [
  [177, 102, 73],
  [171, 199, 49],
  [128, 142, 137],
  [131, 127, 67],
  [171, 199, 49],
  [144, 150, 60],
  [134, 162, 169],
  [162, 195, 85],
  [154, 191, 123],
  [147, 186, 161],
  [141, 181, 200],
  [177, 102, 73],
  [122, 122, 104],
  [157, 175, 55]
];

Chart.prototype = {
  plotHeight: function() {
    return this.height-(this.margin.top+this.margin.bottom);
  },
  plotWidth: function() {
    return this.width-(this.margin.left+this.margin.right);
  },
  addSeries: function(series) {
    this.series.push(series);
  },
  render: function() {
    var elem = this.element;
    var that = this;
    var pjs_code = function(p) {
  		p.setup = function() {
  			p.size(elem.width(), elem.height());
  			p.noStroke();
  			p.frameRate(60);
  		}
    
      p.draw = function() { ScatterPlotter.plot.apply(that, [p]); }
      p.init();
    };
    this.processingControl = Processing(this.element[0], pjs_code);
  }
}


//-----------------------------------------------------------------------------
// Measure
//-----------------------------------------------------------------------------

// a measure is one dimension of the data item to be plotted.
var Measure = function(chart, property) {
  this.property = property;
  this.chart = chart;
  
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
  // translates the given data value to the corresponding pixel value
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