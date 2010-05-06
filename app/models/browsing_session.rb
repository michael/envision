# A BrowsingSession operates on a Collection
# It contains a set of possibly filtered items and facets that are derived from it
class BrowsingSession
  attr_accessor :collection, :filter_criteria
  def initialize(collection, filter_criteria = FilterCriteria.new)
    @collection, @filter_criteria = collection, filter_criteria
  end
  
  # construct facets with facet_choices
  def facets
    facets = {}
    items.each do |item|
      item.attributes.each do |a|
        p = a.property
        if (!p.number?)
          facets[p.name] ||= Facet.new(p)
          a.values.each { |v| facets[p.name].register_value(v.value, item) }
        end
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
  
  def to_json
    result = {:properties => {}, :items => [], :facets => {} }
    
    @collection.properties.each do |p|
      result[:properties][p.id] = {:name => p.name, :type => p.type, :unique => true}
    end
    
    items.each do |i|
      item = {}
      i.attributes.each do |a|
        item[a.property.id] = a.raw_values.first
      end
      result[:items] << item
    end
    
    facets.each do |f|
      result[:facets][f.property.id.to_s] = f.facet_choices.map { |fc| {:value => fc.value, :item_count => fc.item_count} }
    end
    
    JSON.pretty_generate(result)
  end
  
end
