// holds the Sheet state
// selected measure keys, visualization etc.
var Sheet = function(app, collection, options) {
  var that = this;
  
  this.app = app; // the sammy application context
  this.collection = collection;
  
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


Sheet.prototype.undo = function() {
  this.commands.pop().unexecute();
  this.render();
};

// Takes a command spec, constructs the command and executes it
// TODO: clean up that search and replace madness
Sheet.prototype.applyCommand = function(spec) {
  var cmd;
  if (spec.command === 'add_criterion') {
    cmd = new AddCriterion(this, spec.options);
  } else if(spec.command === 'remove_criterion') {
    cmd = new RemoveCriterion(this, spec.options);
  } else if (spec.command === 'perform_operation') {
    cmd = new PerformOperation(this, spec.options);
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
    this.collection = this.commands[pos].collection;
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
  return cmd;
};


Sheet.prototype.updateCanvasSize = function() {
  $('#chart').width($('#results').width()-$('#sheet-settings').width()-30);
  $('#chart').height($('#results').height()-20);
};

Sheet.prototype.update = function() {
  console.info("updating view settings ...");
  this.measureKeys = $('select#measure_keys').val() || [];
  this.identityKeys = $('select#identity_keys').val() || [];
  this.groupKeys = $('select#group_keys').val() || [];
  this.aggregated = $('input#aggregated').is(':checked');
  this.visualization = $('select#visualization').val();
  
  var that = this;
  // modify the view by performing an collection operation on it
  // TODO: make dynamic
  if (this.operation) {
    var params = {};
    var params_as_array = $('#operation_params *').serializeArray();
    $.each(params_as_array, function(index, param) {
      params[param.name] = param.value;
    });
    if (this.collection.performOperation(this.operation, params)) {
      // after each operation the view needs to be re-rendered
      that.render();
    };
  }

  this.renderChart();
  
  // store view changes on the server
  $.ajax({
    url: '/projects/'+this.projectId+'/sheets/'+this.id+'.json',
    type: 'put',
    data: {
      measure_keys: that.measureKeys,
      identity_keys: that.identityKeys,
      group_keys: that.groupKeys,
      aggregated: that.aggregated,
      visualization: that.visualization
    }
  });
};


Sheet.prototype.transformMultiselect = function(element) {
  element.hide(); // hide but keep the logic

  var selectedList = $('<ul class="selected"></ul>'),
      availableList = $('<ul class="available"></ul>'),
      options = element.find('option');
    
  element.after(selectedList);
  selectedList.after(availableList);

  options.each(function() {
    var li = $('<li><a href="">'+$(this).text()+'</a><span></span></li>');
    var selected = $(this).attr('selected');
  
    li.data('option', this);
    li.children('a').click(function() {
      var option = $($(this).parent().data('option'));
    
      // flip selected option
      option.attr('selected', !option.attr('selected'));
      option.parent().trigger('change');
    
      $(this).parent().appendTo(option.attr('selected') ? selectedList : availableList);
      return false;
    });
  
    li.appendTo(selected ? selectedList : availableList);
  });
};

Sheet.prototype.render = function() {
  var html = Mustache.to_html(this.app.templates['sheet.mustache'], this.view());
  $('#results').html(html);
  this.updateCanvasSize();
  this.renderChart();
  this.app.trigger('register_events');
  
  // transform multiselect boxes
  this.transformMultiselect($('#measure_keys'));
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

//-----------------------------------------------------------------------------
// The exposed View used for mustaches
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
  
  // nested_properties
  properties.eachKey(function(key, p) {
    view.nested_properties.push({
      key: key,
      name: p.name,
      type: p.type,
      measureKeySelected: $.inArray(key, that.measureKeys) > -1,
      identityKeySelected: $.inArray(key, that.identityKeys) > -1
    });
    
    if (p.type === 'collection') {
      $.each(p.collection_properties, function(k, p) {
        view.nested_properties.push({
          key: key+"::"+k,
          name: "--- "+p.name,
          type: p.type,
          measureKeySelected: $.inArray(key+"::"+k, that.measureKeys) > -1,
          identityKeySelected: $.inArray(key+"::"+k, that.identityKeys) > -1
        });
      });
    }
  });
    
  // transformers
  $.each(Collection.transformers, function(key, operation) {
    view.operations.push({
      key: key,
      label: operation.label,
      selected: false
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
  
  view.aggregators =  [
    {key: 'SUM', name: "Sum"},
    {key: 'MIN', name: "Minimum"},
    {key: 'MAX', name: "Maximum"},
    {key: 'AVG', name: "Average"},
    {key: 'COUNT', name: "Count"}
  ];
  
  return view;
};