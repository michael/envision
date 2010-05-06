class CollectionsController < ApplicationController
  def index
    @collections = Collection.all
  end
  
  def show
    @collection = Collection.get(params[:id])
        
    @browsing_session = BrowsingSession.new(@collection, filter_criteria)
    @view = View.get(params[:view_id])
    respond_to do |format|
      format.html
      format.json { render :json => @browsing_session.to_json }
    end
  end
  
  def edit
    @collection = Collection.get(params[:id])
  end
  
  def load
    Collection.redis.flushdb
    @collection = Collection.create(:name => "Canon Turnover Report", :uri => "http://localhost:4567/canon_turnover_report")
    @collection.load
  end
  
  def update_filters
    update_filter_criteria(params[:criteria] || {})
    show
  end
end
