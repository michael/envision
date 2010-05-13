//-----------------------------------------------------------------------------
// Plotters
// Plotters are pluggable
// They must have a constructor that just takes a chart object
// There must be a plot function implemented
//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------
// Colors
//-----------------------------------------------------------------------------

var COLORS = [
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


// Init Plotters namespace
if (Chart.Plotters === undefined) {
  Chart.Plotters = {};
}

//-----------------------------------------------------------------------------
// Chart.Plotters.Scatter
//-----------------------------------------------------------------------------

Chart.Plotters.Scatter = function(chart) {
  var that = this;
  this.chart = chart;
  this.dots = [];
  
  // measure #1 is my xAxis
  this.xAxis = this.chart.measures[0];
  this.xAxis.setTargetRange(this.chart.plotWidth());
  
  // measure #2 is my yAxis
  this.yAxis = this.chart.measures[1];
  this.yAxis.setTargetRange(this.chart.plotHeight());
  
  this.hoveredDot = null;
  
  // initialize Dots
  $.each(this.chart.collection.items, function(i, item) {
    that.dots.push(new Chart.Plotters.Scatter.Dot(that, item));
  });
}

Chart.Plotters.Scatter.prototype = {
  plot: function() {
    var elem = this.chart.element,
        that = this;

    var code = function(p) {
      p.setup = function() {
        p.size(elem.width(), elem.height());
        p.noStroke();
        p.smooth();
        p.frameRate(60);
      }
      p.draw = function() { that.draw(p); };
      p.init();
      
      p.mouseMoved = function() {
        that.hoveredDot = null;
        $.each(that.dots, function(i, dot) {
          // that.drawItem(p, item);
          dot.mouseOver(p);
        });
        that.draw(p);
      }
    };
    
    this.processingControl = Processing(elem[0], code);
  },
  drawAxis: function(p) {
    // draw xAxis
    for(var i = 0; i < this.xAxis.nTicks; i++) {
      p.fill(66);
      var x = this.xAxis.translate(i*this.xAxis.tickInterval+this.xAxis.graphMin);
      x += 0.5; // needs to be shifted for some reason (probably caused by the PJS patch)
      
      // TODO: only show nFrac fractional digits
      p.text(this.xAxis.graphMin+i*this.xAxis.tickInterval, x-10, this.chart.plotHeight()+20);
      
      p.stroke(180);
      p.strokeWeight(1);
      p.line(x, 0, x, this.chart.plotHeight());
      p.strokeWeight(0);
    }
  },
  draw: function(p) {
    var xAxis = this.xAxis,
        yAxis = this.yAxis;
    
    p.background(255);
    

    p.pushMatrix();
    // center the plotarea
    p.translate(this.chart.margin.left, this.chart.margin.top);
    
    
    // color for the plot area
    p.fill(244);
    p.rect(0,0,this.chart.plotWidth(), this.chart.plotHeight());
    
    var font = p.loadFont("Century Gothic"); 
    p.textFont(font, 12); 
    
    this.drawAxis(p);
    
    // draw yAxis
    for(var i = 0; i<yAxis.nTicks; i++) {
      p.fill(66);
      var y = this.chart.plotHeight()-yAxis.translate(i*yAxis.tickInterval+yAxis.graphMin);
      y += 0.5; // needs to be shifted for some reason (probably caused by the PJS patch)
  
      // TODO: only show nFrac fractional digits
      p.text(yAxis.graphMin+i*yAxis.tickInterval, -40, y);
      
      p.stroke(180);
      p.strokeWeight(1);
      p.line(0, y, this.chart.plotWidth(), y);
      p.strokeWeight(0);
    }
    
    var that = this;
    
    $.each(this.dots, function(i, dot) {
      dot.draw(p);
    });
    
    p.popMatrix();
    
    p.exit();
  }
};

//-----------------------------------------------------------------------------
// Dot
//-----------------------------------------------------------------------------

// A Dot is the graphical representation of one item
Chart.Plotters.Scatter.Dot = function(plotter, item) {
  this.item = item;
  this.plotter = plotter;
  this.chart = plotter.chart;
  
  this.hovering = false;
  
  this.update();
}

Chart.Plotters.Scatter.Dot.prototype = {
  radius: 14,
  update: function() {
    this.x = this.plotter.xAxis.translate(this.item.attributes[this.plotter.xAxis.property.key]);
    this.y = this.chart.plotHeight()-this.plotter.yAxis.translate(this.item.attributes[this.plotter.yAxis.property.key]);
  },
  draw: function(p) {
    
    // use color based on group
  
    
    // TODO: inelegant.
    var groupIndex = this.chart.groups[this.item.groupMembership(this.chart.groupKeys)].index;
    
    var color = p.color.apply(p, COLORS[groupIndex % COLORS.length]);
    
    if (this.plotter.hoveredDot == this) {
      
      color = p.color.apply(p, COLORS[1]);
      p.fill(255);
      p.rect(this.x, this.y, 200, 20);
      p.fill(100);
      
      p.text(this.chart.identify(this.item), this.x-10, this.y+20);
    }
    
    p.stroke(255);
    p.strokeWeight(2);
    p.fill(color);
    p.ellipse(this.x, this.y, this.radius, this.radius);
  },
  mouseOver: function(p) {
    var disX = this.x+this.chart.margin.left - p.mouseX;
        disY = this.y+this.chart.margin.top - p.mouseY;
    
    if (p.sqrt(p.sq(disX) + p.sq(disY)) < this.radius) {
      return this.plotter.hoveredDot = this;
      return true;
    } else {
      return false;
    }
  }

}

