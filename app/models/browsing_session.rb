# A BrowsingSession operates on a Collection
# It contains a set of possibly filtered items and facets that are derived from it
class BrowsingSession
  attr_reader :collection, :filter_criteria
  def initialize(collection, filter_criteria = FilterCriteria.new)
    @collection, @filter_criteria = collection, filter_criteria
  end
  
  # construct facets with facet_choices
  def facets
    facets = {}
    items.each do |item|
      item.attributes.each do |a|
        facets[a.property.name] ||= Facet.new(a.property)
        a.values.each { |v| facets[a.property.name].register_value(v.value, item) }
      end
    end
    facets.values
  end
  
  def items
    @collection.items.select { |i| i.matches_criteria?(@filter_criteria) }
  end
  
  def method_missing(name, *args)
    @collection.send(name, *args)
  end
end
