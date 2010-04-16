class CollectionsController < ApplicationController
  def index
    @collections = Collection.find({}) # find all
  end
  
  def show
    @collection = Collection[params[:id]]
  end
end