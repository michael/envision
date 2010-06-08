class SheetsController < ApplicationController

  def show
    @sheet = Sheet.get(params[:id])
    respond_to do |format|
      format.html { render :json => @sheet.to_json_with_content }
      format.json { render :json => @sheet.to_json_with_content }
    end
  end
  
  def update
    @view = Sheet.get(params[:id])
    @view.measures = params[:measure_keys]
    @view.identity_keys = params[:identity_keys]
    @view.group_keys = params[:group_keys]
    @view.visualization = params[:visualization]
    @view.aggregated = params[:aggregated]
    @view.save
    render :json => "{status: 'ok'}"
  end
  
end
