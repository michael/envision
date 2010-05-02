# Encapsulates filter criteria information
#
# This can easily be built from a criteria param
# Such a http param must look like the following:
#
# params[:criteria] => {"1"=>["Euro"], "2"=>["Presidential system"]}

class FilterCriteria
  include Enumerable
  
  def initialize(criteria_list = {})
    @criteria = []
    criteria_list.each do |p, v|
      @criteria << FilterCriterion.new(Property.get(p), v)
    end
  end
  
  def each &blk
    @criteria.each &blk
  end
  
  def method_missing(name, *args)
    @criteria.send(name, *args)
  end
  
end
