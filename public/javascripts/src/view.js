//-----------------------------------------------------------------------------
// View
// Reflects settings needed for drawing a chart
// Renders the view to the result pane
// TODO: Clean up the prototypical mess.
//-----------------------------------------------------------------------------

var View = function(collectionView, options) {
  this.collectionView = collectionView;
  
  this.measureKeys = [];
  this.identityKeys = options.identity_keys || [];
  this.groupKeys = options.group_keys || [];
  this.aggregated = false;
  this.operation = null;
  
  // TODO: use table as the standard visualization
  this.visualization = options.visualization || 'scatterplot';
  
  this.id = options.id;
  this.collectionId = options['collection_id'];
  var that = this;
  
  // init measures
  $.each(options.measures, function(index, property) {
    that.measureKeys.push(property);
  });
  
  // view helpers for mustache views
  this.helpers = {
    // properties for views
    properties: function() {
      var result = [];
      $.each(that.collectionView.get("properties"), function(key, p) {
        result.push({
          key: key,
          name: p.name(),
          type: p.type(),
          measureKeySelected: $.inArray(key, that.measureKeys) > -1,
          identityKeySelected: $.inArray(key, that.identityKeys) > -1,
          groupKeySelected: $.inArray(key, that.groupKeys) > -1
        });
      });
      return result;
    },
    nested_properties: function() {
      var result = [];
      $.each(that.collectionView.get("properties"), function(key, p) {
        var parentKey = key;
        
        result.push({
          key: key,
          name: p.name(),
          type: p.type(),
          measureKeySelected: $.inArray(key, that.measureKeys) > -1,
          identityKeySelected: $.inArray(key, that.identityKeys) > -1
        });
        
        // if the property is a collection also include the properties of the sub collection

        if (p.type() === 'collection') {
          $.each(p.collection_properties, function(key, p) {
            result.push({
              key: parentKey+"::"+key,
              name: "--- "+p.name,
              type: p.type,
              measureKeySelected: $.inArray(parentKey+"::"+key, that.measureKeys) > -1,
              identityKeySelected: $.inArray(parentKey+"::"+key, that.identityKeys) > -1
            });
          });
        }
        
      });
      return result;
    },
    aggregators: [
      {key: 'SUM', name: "Sum"},
      {key: 'MIN', name: "Minimum"},
      {key: 'MAX', name: "Maximum"},
      {key: 'AVG', name: "Average"},
      {key: 'COUNT', name: "Count"}
    ]
  };
};


View.prototype = {
  transformSelect: function(element) {
    // TODO: implement
  },
  transformMultiselect: function(element) {
    element.hide(); // hide but keep the logic

    var selectedList = $('<ul class="selected"></ul>'),
        availableList = $('<ul class="available"></ul>'),
        options = element.find('option');
        
    element.after(selectedList);
    selectedList.after(availableList);
    
    options.each(function() {
      // selectedList = $(element).find('.s')
      
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
      url: '/collections/'+this.collectionId+'/views/'+this.id+'.json',
      type: 'put',
      data: {
        measure_keys: that.measureKeys,
        identity_keys: that.identityKeys,
        group_keys: that.groupKeys,
        aggregated: that.aggregated,
        visualization: that.visualization
      }
    });
  },
  registerEvents: function () {
    var that = this;
    $('#view-settings select').not('#operation').change(function() {
      that.update();
    });
    
    $('select#operation').change(function() {
      // initialize params section
      that.operation = $(this).val();
      
      if (that.operation) {
        var html = '';
        // iterate over params
        $.each(Collection.operations[that.operation].params, function(key, param) {
          html += $.mustache(Templates.params[param.type], {
            key: key,
            name: Collection.operations[that.operation].params[key].name,
            properties: that.helpers.properties,
            aggregators: that.helpers.aggregators
          });
        });
        
        $('#operation_params').html(html);
        $('#operation_params input').change(function() {
          that.update();
        });
      }
      that.update();
    });
    
    $('#view-settings input').change(function() {
      that.update();
    });
  },
  render: function () {
    var that = this;
    
    // view
    var v = {
      properties: that.helpers.properties,
      nested_properties: that.helpers.nested_properties,
      visualization: that.visualization,
      visualizations: function() {
        var result = [];
        $.each(Chart.visualizations, function(key, vis) {
          result.push({
            code: key,
            className: vis.className,
            selected: key === that.visualization
          });
        });
        return result;
      },
      operations: function() {
        var result = [];
        $.each(Collection.operations, function(key, operation) {
          result.push({
            key: key,
            label: operation.label,
            selected: false
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
    this.transformSelect($('#operation'));
    
    // highlight the view
    $('#available-views li').removeClass('selected');
    $('#view_'+this.id).addClass('selected');
    
    this.registerEvents();
    that.renderChart();
  },
  renderChart: function() {
    // prepare grouping options
    var groupKeys = $.map(this.groupKeys, function(k) { return { property: k, modifier: Modifiers.DEFAULT}; });

    $('#chart').empty();
    var chart = new Chart($('#chart'), {
      collectionView: this.collectionView,
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