class CollectionsController < ApplicationController
  def index
    @collections = Collection.find({}) # find all
  end
  
  def show
    FacetCategory # monkey patch - just load the Facet Category Model
    Item
    Facet
    @collection = Collection[params[:id]]
  end
end