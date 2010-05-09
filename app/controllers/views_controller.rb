class ViewsController < ApplicationController
  def create
    @view = View.new(params[:view])
    @view.collection = Collection.get(params[:collection_id])
    
    if @view.save
      render :text => collection_view_url(params[:collection_id], @view.id)
    end
  end
  
  def show
    @view = View.get(params[:id])
    respond_to do |format|
      format.html { render :json => @view.to_json }
    end
  end
  
  def update
    @view = View.get(params[:id])
    @view.measures = params[:measures]
    @view.save
    render :json => "{status: 'ok'}"
  end
end
