# A Facet Category corresponds to Property Value in Freebase
class Facet < Ohm::Model
  attribute :name
  
  reference :facet_category, FacetCategory
  
  set :facet_values, FacetValue
  
  def validate
  end
end