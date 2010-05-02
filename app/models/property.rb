class Property < Envision::Model
  field :name, :index => true
  field :type # string, number, datetime, link
  
  belongs_to :collection, Collection
  
  # for now just works with simple attributes (strings, numbers)
  
  
  
  # facet_choices?
  def unique_values
    values = []
    collection.items.each do |item|
      item.attributes.select {|a| a.property.id == self.id}.each do |a|
        a.values.each { |v| values << v.value unless values.include?(v.value) }
      end
    end
    values
  end
end
