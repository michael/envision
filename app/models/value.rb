class Value < Envision::Model
  field :value
  
  belongs_to :attribute, Attribute
  
  def val
    if attribute.property.number?
      Float(value)
    elsif attribute.property.datetime?
      DateTime.parse(value)
    end
  end
end
