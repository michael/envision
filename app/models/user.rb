class User < Envision::Model
  field :username
  field :email
  
  field :first_name
  field :last_name
  
  has_many :collections, Collection
  has_many :projects, Project
    
  def to_hash
    {
      :id => id,
      :username => username,
      :first_name => first_name,
      :last_name => last_name
    }
  end
  
  def to_json
    JSON.pretty_generate(to_hash)
  end
end
