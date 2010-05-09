require 'test_helper'


##########################################
# Models
##########################################

# forward declaration
class Project < Envision::Model ; end

class Project < Envision::Model
  belongs_to :user, User
  
  list :tasks
end

class User < Envision::Model
  field :name
  has_many :projects, Project
end


##########################################
# Models
##########################################

class ModelTest < ActiveSupport::TestCase

  def setup
    User.redis.flushdb
    
    @user = User.create(:name => "John")
    
    @project = Project.new
    @project.user = @user
    @project.save
  end
  
  def teardown
    User.redis.flushdb
  end
    
  test "has name" do
    assert @user.name == "John"
  end
  
  test "has one project" do
    assert @user.projects.length == 1
  end
  
  
  test "change proejct association" do
    @project.user = @user_2 = User.create
    assert @project.user != @user
    @project.save
    assert @user.projects.length == 0
    assert @user_2.projects.length == 1
    @user = User.get(@user.id) # reload user
  end
  
  test "delete reference" do
    assert @user.projects.length == 1
    @project.user = nil
    @project.save
    
    @user = User.get(@user.id) # reload user
    assert @user.projects.length == 0
  end
  
  test "list all users" do
    User.create
    User.create
    assert User.all.length == 3
  end
  
  test "destroy object which has incoming references" do
    assert @user.projects.length == 1
    assert @user.destroy == false
  end
  
  test "destroy object which has no incoming references" do
    assert @project.destroy == true
    # check outgoing references have been removed properly
    assert @user.projects.length == 0
    assert Project.get(@project.id) == nil
    assert Project.all.length == 0
  end
  
  test "list" do
    @project = Project.new
    
    task_list = ["12", "23", "11", "19"]
    @project.tasks = task_list
    @project.save
    
    @project = Project.get(@project.id)
    assert @project.tasks == task_list
  end

end