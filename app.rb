require "bundler/setup"
Bundler.setup
require "sinatra/base"

class EvilPayload < Sinatra::Base

  run! if app_file == $0
end
