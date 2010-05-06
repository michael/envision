class ViewsController < ApplicationController
  def create
    @view = View.new(params[:view])
    @view.collection = Collection.get(params[:collection_id])
    
    if @view.save
      render :text => collection_view_url(params[:collection_id], @view.id)
    end
  end
end
