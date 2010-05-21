# Represents a view on a collection
# Depending on current filter criteria a view usually 
# shows a visualization featuring selected measures and groups
class View < Envision::Model
  field :name
  
  belongs_to :collection, Collection
  
  list :measures
  list :identity_keys
  list :group_keys
  field :visualization
  field :aggregated
  
  def to_hash
    {
      :id => id,
      :collection_id => collection.id,
      :name => name,
      :measures => measures,
      :visualization => visualization,
      :identity_keys => identity_keys,
      :group_keys => group_keys,
      :aggregated => aggregated
    } 
  end
  
  def to_json
    JSON.pretty_generate(to_hash)
  end
end
