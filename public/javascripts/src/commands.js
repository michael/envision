//-----------------------------------------------------------------------------
// AddCriterion
//-----------------------------------------------------------------------------

// Commands
var AddCriterion = function(sheet, options) {
  this.sheet = sheet;
  this.options = options;
};

// [c1, c2, !c1]  => [c2]
AddCriterion.prototype.matchesInverse = function(other) {
  return (
    other instanceof RemoveCriterion && 
    this.options.property === other.options.property && 
    this.options.operator === 'CONTAINS' && other.options.operator === 'CONTAINS' &&
    this.options.value === other.options.value
  );
};

// [c1, c2, c1~]  => [c1~, c2]
// eg. c1 = population > 2000000, c1~ = population > 10000000
AddCriterion.prototype.matchesOverride = function() {
  // TODO: implement
};

AddCriterion.prototype.execute = function() {
  this.collection = this.sheet.collection;
  
  var criterion = new Criterion(this.options.operator, this.options.property, this.options.value);
  this.sheet.collection = this.collection.filter(criterion);
  
  // to be reflected in the UI
  // this.sheet.selectedFacets[this.options.property] = { this.options.value: true };
};

AddCriterion.prototype.unexecute = function() {
  this.sheet.collection = this.collection; // restore the old state
  // to be reflected in the UI
  // delete this.sheet.selectedFacets[this.options.property][this.options.value];
};

//-----------------------------------------------------------------------------
// RemoveCriterion
//-----------------------------------------------------------------------------

var RemoveCriterion = function(sheet, options) {
  this.sheet = sheet;
  this.options = options;
};

RemoveCriterion.prototype.execute = function() {
  // won't be executed
};

RemoveCriterion.prototype.unexecute = function() {
  // won't be unexecuted
};


//-----------------------------------------------------------------------------
// PerformOperation
//-----------------------------------------------------------------------------

var PerformOperation = function(sheet, options) {
  this.sheet = sheet;
  this.options = options;
};

PerformOperation.prototype.execute = function() {
  console.log('performing operation');
};

PerformOperation.prototype.unexecute = function() {
  console.log('unperforming opration');
};