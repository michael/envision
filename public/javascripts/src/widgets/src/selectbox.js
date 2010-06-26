// Takes a selection
var Selectbox = function(element, choices, selection, options) {
  this.element = element;
  
  // construct selection
  this.selection = new Selection(choices, selection, {unique: true});
  
  // callback
  this.change = options.change || function() {};
  
  this.mode = 'view';
  this.render();
};

Selectbox.prototype.toggleMode = function() {
  this.mode =  this.mode === 'view' ? 'edit' : 'view';
  this.render();
};


Selectbox.prototype.registerEvents = function() {
  var that = this;
  
  this.element.find('li.available a').click(function(e) {
    var params = $(this).attr('href').split('/');
    
    that.selection.selectUnique(params[2]);
    that.change(that.selection);
    
    that.toggleMode();
    return false;
  });
  
  this.element.find('a.toggle_mode').click(function(e) {
    that.toggleMode();
    return false;
  });
};

Selectbox.prototype.render = function() {
  var html = '<ul class="ui-selectbox">';

  var selectedName = 'Choose transformer';
  if (this.selection.selectedChoices().first()) {
    selectedName = this.selection.selectedChoices().first().name;
  }
  
  html += '<li class="selected"><a class="toggle_mode" href="#">'+selectedName+'<span>v</span></a></li>';
  if (this.mode === 'edit') {
    this.selection.availableChoices().eachKey(function(key, choice) {
      html += '<li class="available"><a href="#/select/'+key+'">'+choice.name+'<span></span></a></li>';
    });
  }
  
  html += '</ul>';
  $(this.element).html(html);
  this.registerEvents();
};