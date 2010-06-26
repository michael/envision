//-----------------------------------------------------------------------------
// Selection
// Data-structure that holds the state of a selection
// Used for powering data-driven UI Widgets
//-----------------------------------------------------------------------------

var Selection = function (choices, selection) {
  var that = this;
  this.choices = choices;
  this.selection = new SortedHash();
  
  // init selection
  $.each(selection, function(index, key) {
    that.selection.set(key, that.choices.get(key));
  });
};

Selection.prototype.isSelected = function(key) {
  return this.selection.get(key) !== undefined;
};

Selection.prototype.toggle = function(key) {
  if (isSelected(key)) {
    this.select(key);
  } else {
    this.deselect(key);
  }
};

Selection.prototype.keys = function() {
  // TODO: Consider API method on SortedHash
  return this.selection.keyOrder;
};

Selection.prototype.firstKey = function() {
  // TODO: Consider API method on SortedHash
  return this.selection.keyOrder[0];
};

Selection.prototype.selectedChoices = function() {
  return this.selection;
};

Selection.prototype.availableChoices = function() {
  var that = this;
  return this.choices.select(function(key, c) {
    return !that.isSelected(key);
  });
};

Selection.prototype.select = function (key) {
  this.selection.set(key, this.choices.get(key));
};

Selection.prototype.selectUnique = function (key) {
  this.selection = new SortedHash(); // reset
  this.selection.set(key, this.choices.get(key));
};

Selection.prototype.deselect = function (key) {
  this.selection.del(key);
};