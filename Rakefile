task :deploy do
  sh 'git push origin master'
  sh "rsync -auP --no-p --exclude-from='rsync-exclude.txt' . $CLT_REMOTE"
end

task default: [:deploy]
