class ApplicationController < ActionController::Base
  # TODO: re-enable forgery protection
  # protect_from_forgery
  
  layout 'application'
  
  def update_filter_criteria(filter_criteria)
    session[:filter_criteria] = filter_criteria
    @filter_criteria = FilterCriteria.new(session[:filter_criteria])
  end
  
  def filter_criteria
    @filter_criteria ||= FilterCriteria.new(session[:filter_criteria] || {})
  end
end
