# Represents a view on a collection
# Depending on current filter criteria a view usually 
# shows a visualization featuring selected dimensions
# and measures
class View < Envision::Model
  field :name
  
  belongs_to :collection, Collection
  
  # has_many :categories
  # has_many :measures
  
end
