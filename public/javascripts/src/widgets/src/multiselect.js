// Takes a selection
var Multiselect = function(element, choices, selection, options) {
  this.element = element;
  
  // construct selection
  this.selection = new Selection(choices, selection);
  
  // callback
  this.change = options.change || function() {};
  
  // this.selection = selection;
  this.mode = 'edit';
  this.render();
};

Multiselect.prototype.toggleMode = function() {
  this.mode =  this.mode === 'view' ? 'edit' : 'view';
  this.render();
};

Multiselect.prototype.registerEvents = function() {
  var that = this;
  
  // switch mode
  this.element.find('a.toggle_mode').click(function() {
    that.toggleMode();
  });
  
  this.element.find('li a').click(function(e) {
    var params = $(this).attr('href').split('/');
    
    that.selection[params[1]](params[2]);
    that.change(that.selection);
    
    that.render();
    return false;
  });
};

Multiselect.prototype.render = function() {
  var html = '<ul class="ui-multiselect">';
  var count = 0;
  this.selection.selectedChoices().eachKey(function(key, choice) {
    count += 1;
    html += '<li class="selected" key="'+key+'"><a href="#/deselect/'+key+'">'+count+'. '+choice.name+'<span>-</span></a></li>';
  });
  
  if (this.mode === 'edit') {
    this.selection.availableChoices().eachKey(function(key, choice) {
      html += '<li key="'+key+'"><a href="#/select/'+key+'">'+choice.name+'<span>+</span></a></li>';
    });
  }
  html += '</ul>';
  $(this.element).html(html);
  this.registerEvents();
};