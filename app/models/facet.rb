class Facet
  attr_accessor :property
  
  def initialize(property)
    @property = property
  end
  
  def name
    @property.name
  end
  
  def facet_choices
    @facet_choices ||= []
  end
  
  # picks the right choice by value
  def choice(value)
    facet_choices.select {|c| c.value == value}.first
  end
  
  # takes a value and item where this value occurs
  # it either creates a facet_choice or increases the item_count
  def register_value(value, item)
    c = choice(value)
    c ? c.inc_item_count : facet_choices << FacetChoice.new(value)
  end
end
