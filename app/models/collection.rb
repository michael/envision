class Collection < Ohm::Model
  attribute :name
  attribute :descr
  attribute :uri
  
  set :facet_categories, FacetCategory
  set :items, Item
  
  index :name
  
  def validate
    assert_present :name
  end
  
  # TODO: loads the collection by fetching it from the given uri
  def load
    
  end
end