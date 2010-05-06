module Collections
  class IndexView < MustacheOnRails
    
    def collections
     context[:_collections]
    end

    def any_collections?
      context[:_collections].length > 0
    end

    def no_collections
      not any_collections?
    end
  end
  
  class ShowView < MustacheOnRails
    
    def browsing_session
      context[:_browsing_session]
    end
    
    def criteria
      params[:criteria].inspect
    end
    
    def item_count
      browsing_session.items.length
    end
    
    def available_views
      browsing_session.views.inject("") do |r, v|
        r << "<a href=\"#{collection_path(browsing_session.collection.id, :view_id => v.id)}\">#{v.name}</a>"
      end
    end
    
    def view
      context[:_view]
    end
    
    def view_requested?
      !no_view?
    end
    
    def no_view?
      view.nil?
    end
  end
  
  class NewView < MustacheOnRails
    def collection
      context[:_collection]
    end
    
    def action_url
      collections_path
    end    
  end
  
  class EditView < MustacheOnRails
    def collection
      context[:_collection]
    end
    
    def action_url
      collection_path(collection)
    end    
  end
end
