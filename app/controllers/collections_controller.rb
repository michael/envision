class CollectionsController < ApplicationController
  def index
    @collections = Collection.all
  end
  
  def show
    Collection.redis.flushdb
    @collection = Collection.create(:name => "Canon Turnover Report", :uri => "http://localhost:4567/canon_turnover_report")
    @collection.load
  end
end