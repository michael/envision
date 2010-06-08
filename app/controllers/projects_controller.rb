class ProjectsController < ApplicationController

  def index
    @projects = Project.all
    
    render :text => @projects.to_json
    
    # respond_to do |format|
    #   format.html { render :json => @projects.to_json }
    #   format.json { render :json => @projects.to_json }
    # end
  end
  
  def show
    @project = Project.get(params[:id])
    respond_to do |format|
      format.html { render :json => @project.to_json }
      format.json { render :json => @project.to_json }
    end
  end
end