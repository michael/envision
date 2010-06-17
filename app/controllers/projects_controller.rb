class ProjectsController < ApplicationController
  def index
    @projects = Project.all
    
    respond_to do |format|
      format.html { render :json => JSON.pretty_generate(@projects.map { |p| p.to_hash }) }
      format.json { render :json => JSON.pretty_generate(@projects.map { |p| p.to_hash }) }
    end
  end
  
  def show
    @project = Project.get(params[:id])
    respond_to do |format|
      format.html { render :json => @project.to_json }
      format.json { render :json => @project.to_json }
    end
  end
end
