//-----------------------------------------------------------------------------
// Collection API
// represents a collection of items
//-----------------------------------------------------------------------------

var Collection = function(options) {
  this.id = options.id;
  this.name = options.name;
  
  this.properties = {};
  this.items = [];

  var that = this;
  
  // init properties
  $.each(options.properties, function(key, options) {
    that.properties[key] = new Property(that, key, options);
  });
  
  // init items
  $.each(options.items, function(index, attributes) {
    that.items.push(new Item(that, attributes));
  });
};

Collection.prototype = {
  
};

// Fetches a collection from a given URL
// only synchronously for now
Collection.get = function(href) {
  var result;
  
  $.ajax({
    url: href,
    async: false,
    dataType: 'json',
    success: function(json) {
      result = new Collection(json);
    }
  });
  
  return result;
};

//-----------------------------------------------------------------------------
// Item
//-----------------------------------------------------------------------------

var Item = function(chart, attributes) {
  this.attributes = attributes;
};


//-----------------------------------------------------------------------------
// Property
//-----------------------------------------------------------------------------


var Property = function(chart, key, options) {
  // constructing 
  this.chart = chart;
  this.key = key;
  this.name = options.name;
  this.type = options.type; // not used yet.
};