class Item < Envision::Model
  field :name, :index => true
  field :img
  field :descr
  field :href
  
  field :raw_attributes
  
  belongs_to :collection, Collection
  
  def attributes
    @attributes ||= JSON.parse(raw_attributes || "{}")
  end
  
  def attribute(property_id)
    attributes[property_id]
  end
  
  # returns all attributes values
  def values(property_id)
    attributes[property_id].to_a
  end
  
  def matches_criteria?(filter_criteria)
    filter_criteria.each do |criterion|
      a = attribute(criterion.property.id)
      a = [a] unless a.kind_of?(Array)
      return false unless a
      return false if a && !a.any? {|i| criterion.values.include?(i)}
    end
    return true
  end
end
