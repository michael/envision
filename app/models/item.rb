class Item < Envision::Model
  field :name, :index => true
  field :img
  field :descr
  field :href
  
  belongs_to :collection, Collection
  has_many :attributes, Attribute
  
  def attribute(property)
    attributes.select {|a| a.property.id == property.id}.first
  end
  
  def values
    attributes.inject([]) { |values, a| values.concat(a.values) }
  end
  
  def matches_criteria?(filter_criteria)
    filter_criteria.each do |criterion|
      a = attribute(criterion.property)
      return false unless a
      return false if a && !a.raw_values.any? {|i| criterion.values.include?(i)}
    end
    return true
  end
end
