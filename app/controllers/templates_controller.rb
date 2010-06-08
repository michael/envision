TEMPLATE_DIR = "public/templates/"

FILES = [
  "collections.mustache",
  "facets.mustache",
  "project.mustache",
  "projects.mustache",
  "sheet.mustache",
  "sheets.mustache",
  "params/aggregator.mustache",
  "params/number.mustache",
  "params/property.mustache",
  "params/property_list.mustache",
  "params/string.mustache"
]


class TemplatesController < ApplicationController
  def index
    templates = {}
    FILES.each do |file_name|
      templates[file_name] = IO.read("#{TEMPLATE_DIR}/#{file_name}")
    end
    render :json => JSON.pretty_generate(templates)
  end
end
