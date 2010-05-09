# Represents a view on a collection
# Depending on current filter criteria a view usually 
# shows a visualization featuring selected dimensions
# and measures
class View < Envision::Model
  field :name
  
  belongs_to :collection, Collection
  
  list :measures
  
  def to_json
    result = {
      :id => id,
      :collectionId => collection.id,
      :name => name,
      :measures => measures
    }
    JSON.pretty_generate(result)
  end
end
