class UsersController < ApplicationController
  
  def index
    @users = User.all
    respond_to do |format|
      format.html { render :json => @users.to_json }
      format.json { render :json => @users.to_json }
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
