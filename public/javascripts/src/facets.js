//-----------------------------------------------------------------------------
// Facets
// Holds the current facet state (selected facet choices) -> FilterCriteria
//-----------------------------------------------------------------------------

var Facets = function(app, sheet) {
  var that = this;
  this.app = app; // the sammy application object
  this.selectedFacet = sheet.collection.all('properties').first().key;
  this.facetChoices = {};
  this.sheet = sheet;
};

Facets.prototype.select = function(property) {
  this.selectedFacet = property;
  $('.facet').removeClass('selected');
  $('#facet_'+property).toggleClass('selected');
  this.updatePanelHeight();
};

Facets.prototype.updatePanelHeight = function() {
  var facetHeaders = $('.facet h3'),
      selectedFacet = $('.facet.selected'),
      facetChoices = selectedFacet.children('ul'),
      maxHeight = $('#facets').height()-facetHeaders.height()*(facetHeaders.length)-facetHeaders.length*7;
  
  if (selectedFacet.height() > maxHeight) {
    facetChoices.height(maxHeight);
  }
};

Facets.prototype.render = function() {
  html = Mustache.to_html(this.app.templates['facets.mustache'], this.view());
  $('#facets').html(html);
  this.select(this.selectedFacet);
};

Facets.prototype.addChoice = function(property, operator, value) {
  // TODO: build flexible lookup for arbitrary operators (GT, LT etc.)
  this.facetChoices[property+'::'+operator+'::'+value] = true;
};

Facets.prototype.removeChoice = function(property, operator, value) {
  delete this.facetChoices[property+'::'+operator+'::'+value];
};

Facets.prototype.view = function() {
  var view = {facets: []},
      that = this;

  this.sheet.collection.all('properties').eachKey(function(key, property) {
    if (property.type !== 'number' && property.type !== 'collection') {
      var facet_choices = [];
      var selected_facet_choices = [];
      property.all("values").each(function(index, value) {
        if (that.facetChoices[key+'::CONTAINS::'+value.val] === true) {
          selected_facet_choices.push({excaped_value: escape(value.val), value: value.val, item_count: value.all('items').length});
        } else {
          facet_choices.push({excaped_value: escape(value.val), value: value.val, item_count: value.all('items').length});
        }
      });
      
      view.facets.push({
        property: key,
        property_name: property.name,
        facet_choices: facet_choices,
        selected_facet_choices: selected_facet_choices
      });
    }
  });
  return view;
};
