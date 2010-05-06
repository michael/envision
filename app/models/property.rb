class Property < Envision::Model
  field :name, :index => true
  field :type # string, number, datetime, link
  
  belongs_to :collection, Collection
  
  
  def number?
    type == "number"
  end
  
  def datetime?
    type == "datetime"
  end
  
end
