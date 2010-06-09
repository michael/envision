// holds the Sheet state
// selected measure keys, visualization etc.
var Sheet = function(app, collectionView, options) {
  var that = this;
  
  this.app = app; // the sammy application context
  this.collectionView = collectionView;
  this.measureKeys = [];
  this.facets = [];
  this.identityKeys = options.identity_keys || [];
  this.aggregated = false;
  this.operation = null;
  
  // TODO: use table as the standard visualization
  this.visualization = options.visualization || 'table';
  this.id = options.id;
  
  this.collectionId = options.collection.id; // TODO: obsolete?
  this.projectId = options.project_id;
  
  // init measures
  $.each(options.measures, function(index, property) {
    that.measureKeys.push(property);
  });
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
    
    if (this.collectionView.performOperation(this.operation, params)) {
      // after each operation the view needs to be re-rendered
      that.render();
    };
    
  } else {
    // TODO: don't reset everything
    this.collectionView.reset();
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
  // render sheet (chart + sheet-settings)
  var html = Mustache.to_html(this.app.templates['sheet.mustache'], this.view());
  $('#results').html(html);
  this.updateCanvasSize();
  this.renderChart();
  this.app.trigger('register_events');
  
  // transform multiselect boxes
  this.transformMultiselect($('#measure_keys'));

  // render facets
  html = Mustache.to_html(this.app.templates['facets.mustache'], this.view());
  $('#facets').html(html);
  // select first facet
  $("#facets .facet:first").toggleClass('selected');

};

Sheet.prototype.renderChart = function() {
  $('#chart').empty();
  var chart = new Chart($('#chart'), {
    collectionView: this.collectionView,
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
  
  // facets
  $.each(this.collectionView.get('properties'), function(key, property) {
    var facet_choices = property.list("values").map(function(value) {
      return {value: value.val, item_count: '-'};
    });
    view.facets.push({
      property: key,
      property_name: property.name(),
      facet_choices: facet_choices
    });
  });
  
  // properties
  $.each(that.collectionView.get("properties"), function(key, p) {    
    view.properties.push({
      key: key,
      name: p.name(),
      type: p.type(),
      measureKeySelected: $.inArray(key, that.measureKeys) > -1,
      identityKeySelected: $.inArray(key, that.identityKeys) > -1
    });
  });
  
  // nested_properties
  $.each(that.collectionView.get("properties"), function(key, p) {    
    view.nested_properties.push({
      key: key,
      name: p.name(),
      type: p.type(),
      measureKeySelected: $.inArray(key, that.measureKeys) > -1,
      identityKeySelected: $.inArray(key, that.identityKeys) > -1
    });
    
    if (p.type() === 'collection') {
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
  
  // operations
  $.each(Collection.operations, function(key, operation) {
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