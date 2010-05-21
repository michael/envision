require 'json'

# A BrowsingSession operates on a Collection
# It contains a set of possibly filtered items and facets that are derived from it
class BrowsingSession
  attr_accessor :collection, :filter_criteria
  def initialize(collection, filter_criteria = FilterCriteria.new)
    @collection, @filter_criteria = collection, filter_criteria
  end
  
  # construct facets based on filtered subset of items
  def facets
    facets = {}
    props = {}
    
    @collection.properties.each { |p| props[p.id] = p }
    
    items.each do |item|
      item.attributes.each do |property_id, a|
        a.kind_of?(Array) ? values = a : values = [a]
        p = props[property_id]
        if (!p.number?)
          facets[property_id] ||= Facet.new(p)
          values.each { |v| facets[property_id].register_value(v, item) }
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
    result = {
      :properties => {},
      :items => [],
      :facets => {},
      :collection_id => @collection.id,
      :uri => @collection.uri,
      :default_view => @collection.views.first.to_hash
    }
    
    @collection.properties.each do |p|
      result[:properties][p.id] = {:name => p.name, :type => p.type, :unique => true}
    end
    
    items.each do |i|
      item = {}
      i.attributes.each do |key, a|
        item[key] = a
      end
      result[:items] << item
    end
    
    facets.each do |f|
      result[:facets][f.property.id.to_s] = f.facet_choices.map { |fc| {:value => fc.value, :item_count => fc.item_count} }
    end
    
    JSON.pretty_generate(result)
  end
  
end
