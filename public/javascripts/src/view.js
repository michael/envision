//-----------------------------------------------------------------------------
// View
// Reflects settings needed for drawing a chart
// Renders the view to the result pane
//-----------------------------------------------------------------------------

var View = function(collectionView, options) {
  this.collectionView = collectionView;
  this.measureKeys = [];
  this.identityKeys = options.identity_keys || [];
  this.groupKeys = options.group_keys || [];
  this.aggregated = false;
  this.operation = null;
  
  // TODO: use table as the standard visualization
  this.visualization = options.visualization || 'scatterplot';
  
  this.id = options.id;
  this.collectionId = options['collection_id'];
  var that = this;
  
  // init measures
  $.each(options.measures, function(index, property) {
    that.measureKeys.push(property);
  });
};

View.prototype = {
  transformMultiselect: function(element) {
    element.hide(); // hide but keep the logic

    var selectedList = $('<ul class="selected"></ul>')
        availableList = $('<ul class="available"></ul>'),
        options = element.find('option');
        
    element.after(selectedList);
    selectedList.after(availableList);
    
    options.each(function() {
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
    this.measureKeys = $('select#measure_keys').val() || [];
    this.identityKeys = $('select#identity_keys').val() || [];
    this.groupKeys = $('select#group_keys').val() || [];
    this.aggregated = $('input#aggregated').is(':checked');
    this.visualization = $('select#visualization').val();
    this.operation = $('select#operations').val();

    var that = this;
    
    // modify the view by performing an collection operation on it
    // TODO: make dynamic
    if (this.operation) {
      this.collectionView.performOperation(this.operation, {property: 'artists'});
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
  render: function() {
    var that = this;

    var v = {
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
      visualization: that.visualization,
      visualizations: function() {
        var result = [];
        $.each(Chart.visualizations, function(key, vis) {
          result.push({
            code: key,
            className: vis.className,
            selected: key === that.visualization,
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
    
    // highlight the view
    $('#available-views li').removeClass('selected');
    $('#view_'+this.id).addClass('selected');
    $('#view-settings select').change(function() {
      that.update();
    });
    
    $('#view-settings input').change(function() {
      that.update();
    });
    
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