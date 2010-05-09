ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  # fixtures :all

  # Add more helper methods to be used by all tests here...
end

def load_fixture(fixture_name)
  fname = "#{File.dirname(__FILE__)}/fixtures/#{fixture_name}.json"
  unless File.exists?(fname)
    open(fname, "w") do |file|
      puts "WARNING: Fixtures could not be loaded."
    end
  end
  open(fname,"r").read
end

