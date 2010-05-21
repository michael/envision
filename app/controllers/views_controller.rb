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
    @view.measures = params[:measure_keys]
    @view.identity_keys = params[:identity_keys]
    @view.group_keys = params[:group_keys]
    @view.visualization = params[:visualization]
    @view.aggregated = params[:aggregated]
    @view.save
    render :json => "{status: 'ok'}"
  end
end
