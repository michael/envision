# Represents a view on a collection
# Depending on current filter criteria a view usually 
# shows a visualization featuring selected dimensions
# and measures
class View < Envision::Model
  field :name
  
  belongs_to :collection, Collection
  
  list :measures
  list :identity_keys
  list :group_keys
  
  def to_json
    result = {
      :id => id,
      :collectionId => collection.id,
      :name => name,
      :measures => measures,
      :identity_keys => identity_keys,
      :group_keys => group_keys
    }
    JSON.pretty_generate(result)
  end
end
