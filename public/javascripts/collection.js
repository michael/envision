//-----------------------------------------------------------------------------
// Collection API
// Represents a collection of items
// Collections can be grouped and aggregated to generate diverse views
//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------
// Modifiers
//-----------------------------------------------------------------------------

var Modifiers = {};

// The default modifier simply does nothing
Modifiers.DEFAULT = function(attribute) {
  return attribute;
};

Modifiers.MONTH = function(attribute) {
  return someDate.getMonth();
};

Modifiers.QUARTER = function(attribute) {
  return Math.floor(someDate.getMonth()/3) + 1;
};


//-----------------------------------------------------------------------------
// Aggregators
//-----------------------------------------------------------------------------

var Aggregators = {};

Aggregators.SUM = function(key, items) {
  var result = 0;
  $.each(items, function(i, item) {
    result += item.attributes[key];
  });
  return result;
};

Aggregators.MIN = function(key, items) {
  var result = Infinity;
  $.each(items, function(i, item) {
    if (item.attributes[key] < result) {
      result = item.attributes[key];
    }
  });
  return result;
};

Aggregators.MAX = function(key, items) {
  var result = -Infinity;
  $.each(items, function(i, item) {
    if (item.attributes[key] > result) {
      result = item.attributes[key];
    }
  });
  return result;
};

Aggregators.COUNT = function(key, items) {
  var result = 0;
  return items.length;
};


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
  // build groups based on groupKeys
  getGroups: function(groupKeys) {
    var that = this;
    var groups = {};
    
    var idx = 0; // the groupIndex
    $.each(this.items, function(i, item) {
      var membership = item.groupMembership(groupKeys);
      groups[membership] = groups[membership] || {items: [], index: idx++};
      groups[membership].items.push(item);
    });
    
    return groups;
  },
  aggregate: function(items, properties, groupKeys) {
    var aggregatedItem = {},
        that = this;
    
    // include group key attributes
    $.each(groupKeys, function(i, p) {
      aggregatedItem[p.property] = items[0].attributes[p.property];
    });
    
    $.each(properties, function(i, p) {
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
  group: function(options) {
    var groups = this.getGroups(options.keys),
        that = this,
        newProps = {},
        newItems = [];

    // property projection
    $.each(options.keys, function(i, key) {
      newProps[key.property] = that.properties[key.property];
    });
    $.each(options.properties, function(i, key) {
      newProps[key.property] = that.properties[key.property];
    });
    
    // aggregate
    $.each(groups, function(k, group) {
      newItems.push(that.aggregate(group.items, options.properties, options.keys));
    });

    return new Collection({properties: newProps, items: newItems});
  }
};


//-----------------------------------------------------------------------------
// Item
//-----------------------------------------------------------------------------

var Item = function(chart, attributes) {
  this.attributes = attributes;
};

Item.prototype = {
  groupMembership: function(groupKeys) {
    var membership = [],
        that = this;
    $.each(groupKeys, function(i, groupKey) {
      membership.push(groupKey.modifier(that.attributes[groupKey.property]));
    });
    return membership;
  }
}

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