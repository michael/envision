//-----------------------------------------------------------------------------
// Facets
// holds the current facet state (selected facet choices) -> FilterCriteria
//-----------------------------------------------------------------------------

var Facets = function(options) {
  this.selectedFacet = null;
  this.collectionView = options.collectionView;
};

Facets.prototype = {
  select: function(element) {
    $('.facet').removeClass('selected');
    element.toggleClass('selected');
    this.updatePanelHeight();
  },
  updatePanelHeight: function() {
    var facetHeaders = $('.facet h3'),
        selectedFacet = $('.facet.selected'),
        facetChoices = selectedFacet.children('ul'),
        maxHeight = $('#facets').height()-facetHeaders.height()*(facetHeaders.length)-facetHeaders.length*6;
    
    if (selectedFacet.height() > maxHeight) {
      facetChoices.height(maxHeight);
    }
  },
  // renders the current facet state
  render: function() {
    var that = this;
    
    var facetView = {
      facets: function() {
        result = [];
      
        var properties = that.collectionView.get("properties");
        $.each(properties, function(key, property) {
          result.push({property: key, property_name: property.name(), facet_choices: function() {
            var result = [];
            var values = property.list("values").nodes;
            $.each(values, function(index, value) {
              // TODO: get item count
              result.push({value: value.val, item_count: '' });
            });
            return result;
          }});
        });
        
        return result;
      }
    };
    
    var facets_html = $.mustache($.template('facets'), facetView);
    $('#facets').html(facets_html);
    this.select($(".facet:first"));
    this.attachEvents();
  },
  attachEvents: function() {
    var that = this;
    
    // switch active facet
    $('.facet h3 a').click(function() {
      that.select($(this).parent().parent());
    });
    
    // select facet choice
    $('a.facet-choice').click(function() {      
      filters.addCriterion($(this).attr('href'), $(this).text());
      console.log('TODO: implement');
      return false;
    });
  }
};