class Attribute < Envision::Model  
  belongs_to :item, Item
  belongs_to :property, Property
  has_many :values, Value
end