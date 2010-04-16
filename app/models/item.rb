Facet # kick start necessary due to rails lazy loading of models

# An item corresponds to a property value in Freebase
class Item < Ohm::Model
  attribute :name
  attribute :img # a reference to an image
  attribute :descr
  attribute :href
  
  set :facets, Facet
    
  index :name
  
  def validate
    assert_present :name
  end
end