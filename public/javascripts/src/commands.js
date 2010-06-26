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
  this.sheet.facets.addChoice(this.options.property, this.options.operator, this.options.value);
};

AddCriterion.prototype.unexecute = function() {
  this.sheet.collection = this.collection; // restore the old state
  this.sheet.facets.removeChoice(this.options.property, this.options.operator, this.options.value);
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
// PerformTransformer
//-----------------------------------------------------------------------------

var PerformTransformer = function (sheet, options) {
  this.sheet = sheet;
  this.options = options;
  console.log('constructed PerformTransformer command');
};

PerformTransformer.prototype.matchesInverse = function(other) {
  // No inversion for applied transformers possible
  return false;
};

PerformTransformer.prototype.execute = function() {
  // memoize
  this.collection = this.sheet.collection;
  this.facetChoices = this.sheet.facets.facetChoices;
  this.measureKeys = this.sheet.measureKeys;
  this.visualization = this.sheet.visualization;
  
  // execute
  this.sheet.collection = this.sheet.collection.transform(this.options.transformer, this.options.params);
  this.sheet.facets.facetChoices = {};
  this.sheet.measureKeys = [];
  this.sheet.visualization = 'table';
};

PerformTransformer.prototype.unexecute = function() {
  this.sheet.collection = this.collection;
  this.sheet.facets.facetChoices = this.facetChoices;
  this.sheet.measureKeys = this.measureKeys;
  this.sheet.visualization = this.visualization;
};