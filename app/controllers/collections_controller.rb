class CollectionsController < ApplicationController
  def index
    @collections = Collection.all
  end
  
  def show
    Collection.redis.flushdb
    @collection = Collection.create(:name => "World's countries", :uri => "http://localhost:4567/countries")
    # @collection = Collection.get(params[:id])
    @collection.load
  end
end