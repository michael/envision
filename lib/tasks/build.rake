ENV["RAILS_ENV"] = "development"
require File.expand_path('../../../config/environment', __FILE__)

JS_DIR = "public/javascripts"

FILES = [
  "src/intro.js",
  "src/util.js",
  "src/chart/src/collection/src/modifiers.js",
  "src/chart/src/collection/src/aggregators.js",
  "src/chart/src/collection/src/node.js",
  "src/chart/src/collection/src/item.js",
  "src/chart/src/collection/src/property.js",
  "src/chart/src/collection/src/collection.js",
  "src/chart/src/measure.js",
  "src/chart/src/chart.js",
  "src/chart/src/visualizations/barchart.js",
  "src/chart/src/visualizations/scatterplot.js",
  "src/chart/src/visualizations/table.js",
  "src/templates.js",
  "src/browse.js"
]

desc 'Build Javascript files'
namespace :build do
  task :all do
    f = File.open("#{JS_DIR}/application.js",  "w") do |f|
      content = ""
      FILES.each do |filename|
        content += IO.read("#{JS_DIR}/#{filename}")
        puts "added: #{filename}"
      end
      f.write(content)
    end
    puts "application.js successfully created."
    
    # jslint and compress
    # sh "juicer merge #{JS_DIR}/application.js --force -o #{JS_DIR}/application.min.js"
  end
end
