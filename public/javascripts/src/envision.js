var envision = $.sammy(function() {
  var app = this;
  this.use(Sammy.Mustache);
  this.use(Sammy.JSON);

  this.before(function() {
    // load the items
    var context = this;
    $.ajax({
      url: 'templates.json', 
      dataType: 'json',
      async: false,
      success: function(templates) {
        app.templates = templates;
      }
    });
  });

  //-----------------------------------------------------------------------------
  // Event handlers
  //-----------------------------------------------------------------------------

  this.bind('update_sheet', function(e, data) {
    app.sheet.update();
  });
  
  this.bind('render_sheet', function(e, data) {
    app.sheet.update();
  });
  
  this.bind('add_criterion', function(e, options) {
    app.sheet.applyCommand({command: 'add_criterion', options: options });
    app.sheet.render();
  });
  
  // TODO: modularize!
  this.bind('switch_operation', function(e, data) {
    var operation = app.sheet.operation = $('select#operation').val(),
        that = this;
    
    // initialize params section
    if (operation) {
      var html = '';
      // iterate over params
      $.each(Collection.operations[operation].params, function(key, param) {
        var v = app.sheet.view(); // TODO: optimize!
                
        html += Mustache.to_html(app.templates['params/' + param.type + '.mustache'], {
          key: key,
          name: Collection.operations[operation].params[key].name,
          properties: v.properties, 
          aggregators: v.aggregators
        });
      });
      
      $('#operation_params').html(html);
      app.trigger('register_events');
    }
  });
  
  //-----------------------------------------------------------------------------
  // Event triggers
  //-----------------------------------------------------------------------------
  
  this.bind('register_events', function(e, data) {
    $('#sheet-settings select').not('#operation').change(function() {
      app.trigger('update_sheet');
    });
    
    $('#sheet-settings input').change(function() {
      app.trigger('update_sheet');
    });
    
    $('select#operation').change(function() {
      app.trigger('switch_operation');
    });
    
    $('#operation_params input').change(function() {
      app.trigger('update_sheet');
    });
    
    $('#undo').click(function() {
      app.sheet.undo();
      return false;
    });
  });
  
  //-----------------------------------------------------------------------------
  // Root - List Projects
  //-----------------------------------------------------------------------------

  this.get('', function(ctx) {
    $.getJSON('projects.json', function(projects) {
      ctx.projects = projects;
      ctx.partial('templates/projects.mustache', function(content) {
        $('#results').html(content);
      });
    });
  });
  
  //-----------------------------------------------------------------------------
  // Show Project - List Sheets
  //-----------------------------------------------------------------------------

  this.get('#/projects/:id', function(ctx) {
    $.getJSON('projects/'+ctx.params['id']+'.json', function(project) {
      var html = Mustache.to_html(app.templates['project.mustache'], project);
      $('#results').html(html);
    });
  });
  
  //-----------------------------------------------------------------------------
  // Show Sheet
  //-----------------------------------------------------------------------------

  this.get('#/projects/:project_id/sheets/:id', function(ctx) {
    $.getJSON('projects/'+ctx.params['project_id']+'/sheets/'+ctx.params['id']+'.json', function(sheet) {
      // We construct a Sheet object from the retrieved JSON
      // The Sheet object is directly used as the view for rendering the sheet settings template
      app.collection = new Collection(sheet.collection);
      app.sheet = new Sheet(app, app.collection, sheet);
      app.sheet.render();
      $.getJSON('projects/'+ctx.params['project_id']+'.json', function (project) {
        // render sheet navigation
        var html = Mustache.to_html(app.templates['sheets.mustache'], project);
        $('#navigation').html(html);
      });
    });
  });

  this.get('#/add_criterion/:property/:operator/:value', function(ctx) {
    app.trigger('add_criterion', {
      property: ctx.params['property'],
      operator: ctx.params['operator'],
      value: ctx.params['value']
    });
  });
  
  this.get('#/select_facet/:property', function(ctx) {
    app.sheet.facets.select($('#facet_'+ctx.params['property']));
  });
  this.get('#/redo', function(ctx) {
    console.log('not yet implemented.');
  });
  
  //-----------------------------------------------------------------------------
  // Misc
  //-----------------------------------------------------------------------------

  // keep everything in shape during resize
  $(window).resize(function () {
    app.sheet.facets.updatePanelHeight();
    app.sheet.updateCanvasSize();
  });
});

$(function() {
  envision.run();
});