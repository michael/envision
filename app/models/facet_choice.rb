class FacetChoice
  attr_accessor :value, :item_count
  def initialize(value)
    @value, @item_count = value, 1
  end
  
  def inc_item_count
    @item_count += 1
  end

end
