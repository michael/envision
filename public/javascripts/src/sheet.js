//-----------------------------------------------------------------------------
// Sheet
//-----------------------------------------------------------------------------

var Sheet = function(app, collection, options) {
  var that = this;
  
  this.app = app; // the sammy application context
  this.collection = collection;
  this.sheets = options.sheets;
  
  this.commands = [];
  this.measureKeys = [];
  this.facets = [];
  this.identityKeys = options.identity_keys || [];
  this.aggregated = false;
  this.operation = null;
  this.selectedFacets = {};
  
  // TODO: use table as the standard visualization
  this.visualization = options.visualization || 'table';
  this.id = options.id;
  
  this.collectionId = options.collection.id; // TODO: obsolete?
  this.projectId = options.project_id;
  
  // init measures
  $.each(options.measures, function(index, property) {
    that.measureKeys.push(property);
  });
  
  // register commands
  $.each(options.commands, function(index, command) {
    that.applyCommand(command);
  });
  
  // init facets
  this.facets = new Facets(app, this);
};


// Commands related
//-----------------------------------------------------------------------------

Sheet.prototype.undo = function() {
  if (this.currentCommand >= 0) {
    this.commands[this.currentCommand].unexecute();
    this.currentCommand -= 1;
    this.render();    
  }
};

Sheet.prototype.redo = function() {
  if (this.currentCommand < this.commands.length-1) {
    this.currentCommand += 1;
    this.commands[this.currentCommand].execute();
    this.render();    
  }
};

// Takes a command spec, constructs the command and executes it
// TODO: clean up the search and replace madness
Sheet.prototype.applyCommand = function(spec) {
  var cmd;
  if (spec.command === 'add_criterion') {
    cmd = new AddCriterion(this, spec.options);
  } else if(spec.command === 'remove_criterion') {
    cmd = new RemoveCriterion(this, spec.options);
  } else if (spec.command === 'perform_transformer') {
    cmd = new PerformTransformer(this, spec.options);
  }
  
  // remove follow-up commands (redo-able commands)
  if (this.currentCommand < this.commands.length-1) {
    this.commands.splice(this.currentCommand+1);
  }
  
  // insertion position
  var pos = undefined;
  $.each(this.commands, function(index, c) {
    if (c.matchesInverse(cmd)) {
      pos = index;
    }
  });
  
  if (pos >= 0) {
    // restore state
    this.commands[pos].unexecute();
    // remove matched inverse command
    this.commands.splice(pos, 1);
    // execute all follow-up commands [pos..this.commands.length-1]
    for (var i=pos; i < this.commands.length; i++) {
      this.commands[i].execute();
    }
  } else {
    this.commands.push(cmd);
    cmd.execute();
  }
  
  this.currentCommand = this.commands.length-1;
  return cmd;
};

// Commands
//-----------------------------------------------------------------------------

Sheet.prototype.updateCanvasSize = function() {
  // $('#chart').width($('#results').width()-$('#sheet-settings').width()-30);
  // $('#chart').height($('#results').height()-20);
};

Sheet.prototype.selectVisualization = function(visualization) {
  this.visualization = visualization;
  $('#visualizations ul li').removeClass('selected');
  $('#visualization_'+visualization).addClass('selected');
  this.render();
};

Sheet.prototype.selectTransformer = function(transformer) {
  var that = this,
      html = '';
      
  this.transformer = transformer;
  
  var html = '';
  // iterate over params
  $.each(Collection.transformers[transformer].params, function(key, param) {
    var v = that.view(); // TODO: optimize!
            
    html += Mustache.to_html(that.app.templates['params/' + param.type + '.mustache'], {
      key: key,
      name: Collection.transformers[transformer].params[key].name,
      properties: v.properties, 
      aggregators: v.aggregators
    });
  });
  
  html += '<a id="perform_transformer" href="#">perform</a>';
  
  $('#transformer_params').html(html);
  $('a#perform_transformer').click(function() {
    
    var params = {};
    var params_as_array = $('#transformer_params *').serializeArray();
    $.each(params_as_array, function(index, param) {
      params[param.name] = param.value;
    });
    
    that.applyCommand({
      command: 'perform_transformer',
      options: { transformer: that.transformer, params: params }
    });
    
    that.render();
    return false;
  });
};


// Sheet.prototype.update = function() {
//   // store view changes on the server
//   $.ajax({
//     url: '/projects/'+this.projectId+'/sheets/'+this.id+'.json',
//     type: 'put',
//     data: {
//       measure_keys: that.measureKeys,
//       identity_keys: that.identityKeys,
//       group_keys: that.groupKeys,
//       aggregated: that.aggregated,
//       visualization: that.visualization
//     }
//   });
// };

Sheet.prototype.render = function() {
  var html = Mustache.to_html(this.app.templates['sheet.mustache'], this.view()),
      that = this;

  $('#results').html(html);
  
  // update trail
  $('#trail').html('<span class="item_count">'+this.collection.all('items').length+'</span> Items');
  
  // TODO: find a more suitable way.
  var nestedProperties = new SortedHash();
  this.collection.all('properties').eachKey(function(key, p) {
    nestedProperties.set(key, p);
    
    if (p.type === 'collection') {
      $.each(p.collection_properties, function(k, p) {
        nestedProperties.set(key+'::'+k, {name: '---'+p.name});
      });
    }
  });
  
  var measures = new Multiselect($('#measure_keys'), nestedProperties, this.measureKeys, {
    change: function(selection) {
      // update measureKeys and re-render
      that.measureKeys = selection.keys();
      that.renderChart();
    }
  });
  
  // TODO: find a more automated way.
  var transformers = new SortedHash();
  $.each(Collection.transformers, function(key, t) {
    transformers.set(key, {name: t.label });
  });
  
  var transformation = new Selectbox($('#transformer'), transformers, [], {
    change: function(selection) {
      that.selectTransformer(selection.firstKey());
    }
  });
  
  this.updateCanvasSize();
  this.renderChart();
  this.app.trigger('register_events');
  
  // delegate to facets renderer
  this.facets.render();
};

Sheet.prototype.renderChart = function() {
  $('#chart').empty();
  var chart = new Chart($('#chart'), {
    collectionView: this.collection,
    plotOptions: {
      visualization: this.visualization,
      identifyBy: this.identityKeys,
      measures: this.measureKeys
    }
  });
  chart.render();
};


// View (used by Mustache templates)
//-----------------------------------------------------------------------------

Sheet.prototype.view = function() {
  var that = this;
  var properties = that.collection.all("properties");
  
  // TODO: does caching the view make sense here?
  
  // expose view state
  var view = {
    facets: [],
    nested_properties: [],
    properties: [],
    operations: [],
    visualizations: [],
    visualization: this.visualization
  };
  
  // properties
  properties.eachKey(function(key, p) {
    view.properties.push({
      key: key,
      name: p.name,
      type: p.type,
      measureKeySelected: $.inArray(key, that.measureKeys) > -1,
      identityKeySelected: $.inArray(key, that.identityKeys) > -1
    });
  });

  // visualizations
  $.each(Chart.visualizations, function(key, vis) {
    view.visualizations.push({
      code: key,
      class_name: vis.className,
      selected: key === that.visualization
    });
  });
  
  view.sheets = this.sheets;

  view.aggregators =  [
    {key: 'SUM', name: "Sum"},
    {key: 'MIN', name: "Minimum"},
    {key: 'MAX', name: "Maximum"},
    {key: 'AVG', name: "Average"},
    {key: 'COUNT', name: "Count"}
  ];
  
  return view;
};