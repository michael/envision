module Views  
  class NewView < MustacheOnRails
    def collection
      context[:_collection]
    end
    
    def action_url
      collection_views_path(collection)
    end
  end
end
