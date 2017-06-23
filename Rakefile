task :deploy

task :deploy do |t|
  sh "git push master origin"
  sh "dandelion deploy"
end

task :default => [:deploy]
