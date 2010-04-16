Property ; Value # kick start necessary due to rails lazy loading of models

# A Facet Category corresponds to Property Value in Freebase
class Attribute < Ohm::Model
  attribute :name
  
  reference :property, Property
  set :values, Value
  
  def validate
  end
end