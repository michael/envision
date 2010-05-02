class BrowsingSessionsController < ApplicationController
  
  # /collections/:collection_id/browse
  def browse
    @collection = Collection.get(params[:collection_id])
    # should we store the current BrowsingContext based in the session?
    @browsing_session = BrowsingSession.new(@collection, FilterCriteria.new(params[:criteria] || {}))
  end
end