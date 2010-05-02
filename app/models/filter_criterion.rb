class FilterCriterion
  attr_accessor :property, :values
  def initialize(property, values)
    @property, @values = property, values
  end
end
