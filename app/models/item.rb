class Item < Envision::Model
  field :name, :index => true
  field :img
  field :descr
  field :href
  
  belongs_to :collection, Collection
  has_many :attributes, Attribute
  
  def matches_criteria?(criteria)
    
  end
end
