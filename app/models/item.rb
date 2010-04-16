Attribute # kick start necessary due to rails lazy loading of models

class Item < Ohm::Model
  attribute :name
  attribute :img # a reference to an image
  attribute :descr
  attribute :href
  
  set :attributes, Attribute
    
  index :name
  
  def validate
    assert_present :name
  end
end