class Sheet < Envision::Model
  field :name
  
  belongs_to :project, Project
  belongs_to :collection, Collection
  
  list :measures
  list :identity_keys
  list :group_keys
  field :visualization
  field :aggregated
  
  def to_hash
    {
      :id => id,
      :project_id => project.id,
      :collection => collection.to_hash,
      :name => name,
      :measures => measures,
      :visualization => visualization,
      :identity_keys => identity_keys,
      :group_keys => group_keys,
      :aggregated => aggregated,
      :commands => []
    }
  end
  
  def to_hash_with_content
    to_hash.merge({
      :collection => collection.to_hash_with_content
    })
  end
  
  def to_json
    JSON.pretty_generate(to_hash)
  end
  
  def to_json_with_content
    JSON.pretty_generate(to_hash_with_content)
  end
end
