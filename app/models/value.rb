class Value < Envision::Model
  field :value
  
  belongs_to :attribute, Attribute
end
