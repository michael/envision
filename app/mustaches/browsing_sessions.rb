module BrowsingSessions
  class BrowseView < MustacheOnRails
    def browsing_session
      context[:_browsing_session]
    end
    
    def criteria
      params[:criteria].inspect
    end
    
    def item_count
      context[:_browsing_session].items.length
    end
  end
end
