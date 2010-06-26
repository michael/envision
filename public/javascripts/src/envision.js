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

  this.bind('add_criterion', function(e, options) {
    app.sheet.applyCommand({command: 'add_criterion', options: options });
    app.sheet.render();
  });
  
  this.bind('remove_criterion', function(e, options) {
    app.sheet.applyCommand({command: 'remove_criterion', options: options });
    app.sheet.render();
  });
  
  $(document).bind('keydown', 'alt+left', function() {
    app.sheet.undo();
    return false;
  });
  
  $(document).bind('keydown', 'alt+right', function() {
    app.sheet.redo();
    return false;
  });
  
  $('#undo').click(function() {
    app.sheet.undo();
    return false;
  });
  
  $('#redo').click(function() {
    app.sheet.redo();
    return false;
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
  });
  

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
  

  // Show Project - List Sheets
  //-----------------------------------------------------------------------------

  this.get('#/projects/:id', function(ctx) {
    $.getJSON('projects/'+ctx.params['id']+'.json', function(project) {
      var html = Mustache.to_html(app.templates['project.mustache'], project);
      $('#results').html(html);
    });
  });
  

  // Show Sheet
  //-----------------------------------------------------------------------------

  this.get('#/projects/:project_id/sheets/:id', function(ctx) {
    $.getJSON('projects/'+ctx.params['project_id']+'/sheets/'+ctx.params['id']+'.json', function(sheet) {
      // We construct a Sheet object from the retrieved JSON
      // The Sheet object is directly used as the view for rendering the sheet settings template
      app.collection = new Collection(sheet.collection);
      app.sheet = new Sheet(app, app.collection, sheet);
      app.sheet.render();
    });
  });

  // Add Criterion
  //-----------------------------------------------------------------------------

  this.get('#/add_criterion/:property/:operator/:value', function(ctx) {
    app.trigger('add_criterion', {
      property: ctx.params['property'],
      operator: ctx.params['operator'],
      value: ctx.params['value']
    });
  });
  
  
  // Remove Criterion
  //-----------------------------------------------------------------------------
  
  this.get('#/remove_criterion/:property/:operator/:value', function(ctx) {
    app.trigger('remove_criterion', {
      property: ctx.params['property'],
      operator: ctx.params['operator'],
      value: ctx.params['value']
    });
  });
  
  // Select Facet
  //-----------------------------------------------------------------------------
  
  this.get('#/select_facet/:property', function(ctx) {
    app.sheet.facets.select(ctx.params['property']);
  });
  
  // Select Visualization
  //-----------------------------------------------------------------------------
  
  this.get('#/select_visualization/:visualization', function(ctx) {
    app.sheet.selectVisualization(ctx.params['visualization']);
  });
  

  // Misc
  //-----------------------------------------------------------------------------

  // Keep everything in shape during resize
  $(window).resize(function () {
    app.sheet.facets.updatePanelHeight();
    app.sheet.updateCanvasSize();
  });
});

$(function() {
  envision.run();
});