FacetCategory ; FacetValue # kick start necessary due to rails lazy loading of models

# A Facet Category corresponds to Property Value in Freebase
class Facet < Ohm::Model
  attribute :name
  
  reference :facet_category, FacetCategory
  
  set :facet_values, FacetValue
  
  def validate
  end
end