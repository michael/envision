//-----------------------------------------------------------------------------
// Facets
// holds the current facet state (selected facet choices) -> FilterCriteria
//-----------------------------------------------------------------------------

var Facets = function(collectionView) {
  this.selectedFacet = null;
  this.collectionView = collectionView;
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