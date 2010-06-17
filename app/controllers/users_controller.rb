class UsersController < ApplicationController
  def index
    @users = User.all
    respond_to do |format|
      format.html { render :json => JSON.pretty_generate(@users.map { |u| u.to_hash }) }
      format.json { render :json => JSON.pretty_generate(@users.map { |u| u.to_hash }) }
    end
  end
  
  def show
    @user = User.get(params[:id])
    respond_to do |format|
      format.html { render :json => @user.to_json }
      format.json { render :json => @user.to_json }
    end
  end
end
