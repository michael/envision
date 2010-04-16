Property ; Item ; Attribute # kick start necessary due to rails lazy loading of models

class Collection < Ohm::Model
  attribute :name
  attribute :descr
  attribute :uri
  
  set :properties, Property
  set :items, Item
  
  index :name
  
  def validate
    assert_present :name
  end
  
  # TODO: loads the collection by fetching it from the given uri
  def load
    
  end
end