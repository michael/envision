//-----------------------------------------------------------------------------
// Mustache stuff
//-----------------------------------------------------------------------------

;(function($) {
  $.mustache = function(template, view, partials) {
    return Mustache.to_html(template, view, partials);
  };
  $.template = function(template) {
    return Templates[template];
  };
  $.view = function(view) {
    return Views[view];
  };
})(jQuery);

//-----------------------------------------------------------------------------
// BrowsingSession
// This is where everything begins
//-----------------------------------------------------------------------------

var BrowsingSession = function (options) {
  this.collection = new Collection(options);
  
  this.collectionView = new CollectionView(this.collection, {});
  this.view = new View(this.collectionView, options['default_view']);
  this.facets = new Facets({collectionView: this.collectionView});

  var that = this;
  // update layout on resize
  $(window).resize(function () {
    that.facets.updatePanelHeight();
  });
  this.render();
};

BrowsingSession.prototype = {
  render: function() {
    this.view.render();
    this.facets.render();
    this.registerEvents();
  },
  registerEvents: function() {
    var that = this;
    $('li.view a').click(function() {
      $.ajax({
        url: $(this).attr('href'),
        dataType: 'json',
        success: function(viewOptions) {
          view = new View(that.collection, viewOptions);
          view.render();
        }
      });
      return false;
    });
  }
};

$(function() {
  // fire up the browser by creating a new browsing session
  var collectionId = $('#collection_id').text();
  $.ajax({
    url: '/collections/'+collectionId+'.json',
    dataType: 'json',
    success: function(json) {
      var bs = new BrowsingSession(json)
    }
  });
});