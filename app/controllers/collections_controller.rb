class CollectionsController < ApplicationController
  def index
    # desired API
    # Ken.all(:type => "/en/new_order") -> returns a Ken::Collection containing a number oKen::TypedResources
    @topic = Ken::Topic.get(params[:id])
  end
end
