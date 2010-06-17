//-----------------------------------------------------------------------------
// Facets
// holds the current facet state (selected facet choices) -> FilterCriteria
//-----------------------------------------------------------------------------

var Facets = function(app, sheet) {
  var that = this;
  this.app = app; // the sammy application object
  this.selectedFacet = null;
  this.sheet = sheet;
};

Facets.prototype.select = function(element) {
  $('.facet').removeClass('selected');
  element.toggleClass('selected');
  this.updatePanelHeight();
};

Facets.prototype.updatePanelHeight = function() {
  var facetHeaders = $('.facet h3'),
      selectedFacet = $('.facet.selected'),
      facetChoices = selectedFacet.children('ul'),
      maxHeight = $('#facets').height()-facetHeaders.height()*(facetHeaders.length)-facetHeaders.length*6;
  
  if (selectedFacet.height() > maxHeight) {
    facetChoices.height(maxHeight);
  }
};

Facets.prototype.render = function() {
  html = Mustache.to_html(this.app.templates['facets.mustache'], this.view());
  $('#facets').html(html);
  this.select($(".facet:first"));
};

Facets.prototype.view = function() {
  var view = {facets: []};
  this.sheet.collection.all('properties').eachKey(function(key, property) {    
    if (property.type !== 'number') {
      var facet_choices = [];
      property.all("values").each(function(index, value) {
        facet_choices.push({excaped_value: escape(value.val), value: value.val, item_count: value.all('items').length});
      });
      view.facets.push({
        property: key,
        property_name: property.name,
        facet_choices: facet_choices
      });
    }
  });
  return view;
};