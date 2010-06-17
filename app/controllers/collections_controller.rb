class CollectionsController < ApplicationController
  def index
    respond_to do |format|
      format.html
    end
  end
    
  def edit
    @collection = Collection.get(params[:id])
  end
end
