require 'yaml'

module Envision

  def self.config
    @config ||= YAML.load_file(File.expand_path("config/envision.yml", root))
  end

end
