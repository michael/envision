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
    def collection
      context[:_collection]
    end
    
    def browsing_session
      context[:_browsing_session]
    end
  end
end
