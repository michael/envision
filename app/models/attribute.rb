class Attribute < Envision::Model  
  belongs_to :item, Item
  belongs_to :property, Property
  has_many :values, Value
  
  # returns the attributes as strings instead of objects
  def raw_values
    values.map { |v| v.value }
  end
end
